import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../common/supabase/supabase.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class SearchService {
  private googleApiKey: string;
  private searchEngineId: string;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
    private aiService: AiService,
  ) {
    this.googleApiKey = this.configService.get('GOOGLE_API_KEY') || '';
    this.searchEngineId = this.configService.get('GOOGLE_SEARCH_ENGINE_ID') || '';
  }

  async search(query: string, type: 'all' | 'users' | 'posts' | 'articles' = 'all') {
    const results: any = { query, internal: {}, external: null };

    // Internal search
    if (type === 'all' || type === 'users') {
      results.internal.users = await this.searchUsers(query);
    }

    if (type === 'all' || type === 'posts') {
      results.internal.posts = await this.searchPosts(query);
    }

    if (type === 'all' || type === 'articles') {
      results.internal.articles = await this.searchArticles(query);
    }

    // External search (optional)
    if (this.googleApiKey && this.searchEngineId) {
      results.external = await this.searchExternal(query);
    }

    return results;
  }

  private async searchUsers(query: string) {
    const { data, error } = await this.supabaseService
      .from('profiles')
      .select(`
        user_id,
        username,
        bio,
        avatar_url,
        badge_type
      `)
      .or(`username.ilike.%${query}%,bio.ilike.%${query}%`)
      .limit(10);

    if (error) return [];
    return data;
  }

  private async searchPosts(query: string) {
    const { data, error } = await this.supabaseService
      .from('posts')
      .select(`
        *,
        profiles!user_id (username, avatar_url, badge_type)
      `)
      .ilike('caption', `%${query}%`)
      .limit(20);

    if (error) return [];
    return data;
  }

  private async searchArticles(query: string) {
    const { data, error } = await this.supabaseService
      .from('articles')
      .select(`
        *,
        profiles!author_id (username, avatar_url)
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(10);

    if (error) return [];
    return data;
  }

  private async searchExternal(query: string) {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${this.googleApiKey}&cx=${this.searchEngineId}&q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      return data.items?.slice(0, 5).map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      })) || [];
    } catch (error) {
      console.error('External search error:', error);
      return null;
    }
  }

  async searchWithFactCheck(query: string) {
    const results = await this.search(query);
    
    // Fact check posts and articles
    if (results.internal.posts?.length > 0) {
      for (const post of results.internal.posts.slice(0, 3)) {
        if (post.caption) {
          post.factCheck = await this.aiService.factCheckContent(post.caption);
        }
      }
    }

    if (results.internal.articles?.length > 0) {
      for (const article of results.internal.articles.slice(0, 3)) {
        article.factCheck = await this.aiService.factCheckContent(
          `${article.title} ${article.content?.substring(0, 500)}`
        );
      }
    }

    return results;
  }

  async getTrendingTopics() {
    // Get most used hashtags or keywords in recent posts
    const { data: posts, error } = await this.supabaseService
      .from('posts')
      .select('caption, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    if (error || !posts) return [];

    // Extract hashtags
    const hashtagCounts: Record<string, number> = {};
    const hashtagRegex = /#\w+/g;

    posts.forEach(post => {
      const hashtags = post.caption?.match(hashtagRegex) || [];
      hashtags.forEach(tag => {
        hashtagCounts[tag.toLowerCase()] = (hashtagCounts[tag.toLowerCase()] || 0) + 1;
      });
    });

    return Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([hashtag, count]) => ({ hashtag, count }));
  }

  async getSuggestions(query: string) {
    if (query.length < 2) return [];

    const [users, posts] = await Promise.all([
      this.searchUsers(query),
      this.searchPosts(query),
    ]);

    return {
      users: users.slice(0, 5),
      posts: posts.slice(0, 5),
    };
  }
}
