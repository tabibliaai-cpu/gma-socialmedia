import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(authorId: string, dto: CreateArticleDto) {
    const { data, error } = await this.supabaseService
      .from('articles')
      .insert({
        author_id: authorId,
        title: dto.title,
        content: dto.content,
        cover_image_url: dto.coverImageUrl,
        is_paid: dto.isPaid || false,
        price: dto.price || 0,
      })
      .select(`
        *,
        profiles!author_id (username, avatar_url, badge_type)
      `)
      .single();

    if (error) throw new Error('Failed to create article');
    return data;
  }

  async getAll(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { data, error } = await this.supabaseService
      .from('articles')
      .select(`
        *,
        profiles!author_id (username, avatar_url, badge_type)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error('Failed to get articles');
    return data;
  }

  async getById(articleId: string, userId?: string) {
    const { data: article, error } = await this.supabaseService
      .from('articles')
      .select(`
        *,
        profiles!author_id (username, avatar_url, badge_type)
      `)
      .eq('id', articleId)
      .single();

    if (error) throw new NotFoundException('Article not found');

    // Check if user has access to paid content
    if (article.is_paid && userId && article.author_id !== userId) {
      const { data: purchase } = await this.supabaseService
        .from('article_purchases')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .single();

      if (!purchase) {
        // Return preview only
        article.content = article.content?.substring(0, 300) + '...';
        article.is_locked = true;
      }
    }

    // Increment views
    await this.supabaseService.rpc('increment_views', { article_id: articleId });

    return article;
  }

  async getByAuthor(authorId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { data, error } = await this.supabaseService
      .from('articles')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error('Failed to get articles');
    return data;
  }

  async update(authorId: string, articleId: string, dto: Partial<CreateArticleDto>) {
    // Check ownership
    const { data: article } = await this.supabaseService
      .from('articles')
      .select('author_id')
      .eq('id', articleId)
      .single();

    if (!article || article.author_id !== authorId) {
      throw new ForbiddenException('Not authorized to update this article');
    }

    const { data, error } = await this.supabaseService
      .from('articles')
      .update(dto)
      .eq('id', articleId)
      .select()
      .single();

    if (error) throw new Error('Failed to update article');
    return data;
  }

  async delete(authorId: string, articleId: string) {
    const { data: article } = await this.supabaseService
      .from('articles')
      .select('author_id')
      .eq('id', articleId)
      .single();

    if (!article || article.author_id !== authorId) {
      throw new ForbiddenException('Not authorized to delete this article');
    }

    const { error } = await this.supabaseService
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (error) throw new Error('Failed to delete article');
    return { message: 'Article deleted' };
  }

  async purchase(userId: string, articleId: string, paymentId: string) {
    const { data: article } = await this.supabaseService
      .from('articles')
      .select('price')
      .eq('id', articleId)
      .single();

    if (!article) throw new NotFoundException('Article not found');

    // Create purchase record
    const { data, error } = await this.supabaseService
      .from('article_purchases')
      .insert({
        article_id: articleId,
        user_id: userId,
        amount: article.price,
      })
      .select()
      .single();

    if (error) throw new Error('Failed to purchase article');

    // Record transaction
    await this.supabaseService.from('transactions').insert({
      user_id: userId,
      amount: article.price,
      type: 'article',
      status: 'completed',
      razorpay_payment_id: paymentId,
      metadata: { article_id: articleId },
    });

    return data;
  }

  async getPurchasedArticles(userId: string) {
    const { data, error } = await this.supabaseService
      .from('article_purchases')
      .select(`
        *,
        articles (
          *,
          profiles!author_id (username, avatar_url)
        )
      `)
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false });

    if (error) throw new Error('Failed to get purchased articles');
    return data;
  }

  async getAuthorEarnings(authorId: string) {
    const { data: purchases, error } = await this.supabaseService
      .from('article_purchases')
      .select(`
        amount,
        purchased_at,
        articles!inner (author_id)
      `)
      .eq('articles.author_id', authorId);

    if (error) throw new Error('Failed to get earnings');

    const total = purchases?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const thisMonth = purchases
      ?.filter(p => new Date(p.purchased_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, p) => sum + p.amount, 0) || 0;

    return { total, thisMonth, count: purchases?.length || 0 };
  }
}
