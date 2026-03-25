import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private supabaseService: SupabaseService) {}

  async createPost(userId: string, createPostDto: CreatePostDto) {
    const insertData: any = {
      content: createPostDto.caption, // Map caption to content
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
    };
    
    if (createPostDto.media_url) insertData.media_url = createPostDto.media_url;
    if (createPostDto.media_type) insertData.media_type = createPostDto.media_type;
    if (createPostDto.caption) insertData.caption = createPostDto.caption;

    const { data, error } = await this.supabaseService
      .from('posts')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Create post error:', error);
      throw new Error(`Failed to create post: ${error.message}`);
    }

    // Get profile separately
    const { data: profile } = await this.supabaseService
      .from('profiles')
      .select('username, avatar_url, badge_type')
      .eq('user_id', userId)
      .single();

    return { ...data, profiles: profile };
  }

  async getFeed(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    // Try to get posts from followed users + own posts
    let followingIds: string[] = [userId]; // Always include own posts
    
    try {
      const { data: following } = await this.supabaseService
        .from('followers')
        .select('following_id')
        .eq('follower_id', userId);
      
      if (following && following.length > 0) {
        followingIds = [...followingIds, ...following.map(f => f.following_id)];
      }
    } catch (e) {
      // Followers table might not exist, just show all posts
      console.log('Followers query failed, showing all posts');
    }

    // Get posts
    const { data: posts, error } = await this.supabaseService
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get feed error:', error);
      // If posts table doesn't exist, return empty array
      if (error.code === '42P01') {
        return [];
      }
      throw new Error(`Failed to get feed: ${error.message}`);
    }

    // Get profiles for each post
    const postsWithProfiles = await Promise.all(
      (posts || []).map(async (post) => {
        const { data: profile } = await this.supabaseService
          .from('profiles')
          .select('username, avatar_url, badge_type')
          .eq('user_id', post.user_id)
          .single();
        
        return {
          ...post,
          profiles: profile || { username: 'user', avatar_url: null, badge_type: 'none' },
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
        };
      })
    );

    return postsWithProfiles;
  }

  async getExploreFeed(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { data: posts, error } = await this.supabaseService
      .from('posts')
      .select(`
        *,
        profiles!user_id (username, avatar_url, badge_type),
        likes(count),
        comments(count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error('Failed to get explore feed');
    }

    return posts;
  }

  async getUserPosts(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { data: posts, error } = await this.supabaseService
      .from('posts')
      .select(`
        *,
        profiles!user_id (username, avatar_url, badge_type),
        likes(count),
        comments(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error('Failed to get user posts');
    }

    return posts;
  }

  async getPostById(postId: string, userId?: string) {
    const { data: post, error } = await this.supabaseService
      .from('posts')
      .select(`
        *,
        profiles!user_id (username, avatar_url, badge_type),
        likes(count),
        comments(count)
      `)
      .eq('id', postId)
      .single();

    if (error) {
      throw new NotFoundException('Post not found');
    }

    // Check if user liked this post
    if (userId) {
      const { data: like } = await this.supabaseService
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();
      
      (post as any).is_liked = !!like;
    }

    return post;
  }

  async updatePost(userId: string, postId: string, updateData: Partial<CreatePostDto>) {
    // Check ownership
    const { data: post } = await this.supabaseService
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (!post || post.user_id !== userId) {
      throw new ForbiddenException('Not authorized to update this post');
    }

    const { data, error } = await this.supabaseService
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update post');
    }

    return data;
  }

  async deletePost(userId: string, postId: string) {
    // Check ownership
    const { data: post } = await this.supabaseService
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (!post || post.user_id !== userId) {
      throw new ForbiddenException('Not authorized to delete this post');
    }

    const { error } = await this.supabaseService
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      throw new Error('Failed to delete post');
    }

    return { message: 'Post deleted successfully' };
  }

  async likePost(userId: string, postId: string) {
    // Check if already liked
    const { data: existing } = await this.supabaseService
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      throw new Error('Already liked this post');
    }

    const { error } = await this.supabaseService
      .from('likes')
      .insert({ post_id: postId, user_id: userId });

    if (error) {
      throw new Error('Failed to like post');
    }

    // Update likes count
    await this.supabaseService.rpc('increment_likes', { post_id: postId });

    return { message: 'Post liked' };
  }

  async unlikePost(userId: string, postId: string) {
    const { error } = await this.supabaseService
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) {
      throw new Error('Failed to unlike post');
    }

    // Update likes count
    await this.supabaseService.rpc('decrement_likes', { post_id: postId });

    return { message: 'Post unliked' };
  }

  async getComments(postId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { data: comments, error } = await this.supabaseService
      .from('comments')
      .select(`
        *,
        profiles!user_id (username, avatar_url, badge_type)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error('Failed to get comments');
    }

    // Insert comment ads
    const ads = await this.getCommentAds(postId);
    return this.insertAdsInComments(comments || [], ads);
  }

  async addComment(userId: string, postId: string, content: string) {
    const { data, error } = await this.supabaseService
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content,
      })
      .select(`
        *,
        profiles!user_id (username, avatar_url, badge_type)
      `)
      .single();

    if (error) {
      throw new Error('Failed to add comment');
    }

    // Update comments count
    await this.supabaseService.rpc('increment_comments', { post_id: postId });

    return data;
  }

  async deleteComment(userId: string, commentId: string) {
    const { data: comment } = await this.supabaseService
      .from('comments')
      .select('user_id, post_id')
      .eq('id', commentId)
      .single();

    if (!comment || comment.user_id !== userId) {
      throw new ForbiddenException('Not authorized to delete this comment');
    }

    const { error } = await this.supabaseService
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      throw new Error('Failed to delete comment');
    }

    // Update comments count
    await this.supabaseService.rpc('decrement_comments', { post_id: comment.post_id });

    return { message: 'Comment deleted' };
  }

  // Helper methods for ads
  private async getFeedAds(userId: string) {
    const { data: ads } = await this.supabaseService
      .from('ads')
      .select('*')
      .eq('type', 'feed')
      .eq('is_active', true)
      .limit(3);

    return ads || [];
  }

  private async getCommentAds(postId: string) {
    const { data: ads } = await this.supabaseService
      .from('ads')
      .select('*')
      .eq('type', 'comment')
      .eq('is_active', true)
      .limit(1);

    return ads || [];
  }

  private insertAdsInFeed(posts: any[], ads: any[]) {
    if (ads.length === 0) return posts;

    const result: any[] = [];
    let adIndex = 0;

    posts.forEach((post, index) => {
      result.push(post);
      // Insert ad every 5 posts
      if ((index + 1) % 5 === 0 && adIndex < ads.length) {
        result.push({ ...ads[adIndex], is_ad: true });
        adIndex = (adIndex + 1) % ads.length;
      }
    });

    return result;
  }

  private insertAdsInComments(comments: any[], ads: any[]) {
    if (ads.length === 0 || comments.length < 3) return comments;

    const result = [...comments];
    // Insert ad after 2 comments
    result.splice(2, 0, { ...ads[0], is_ad: true });
    return result;
  }
}
