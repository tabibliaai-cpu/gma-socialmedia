import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private supabaseService: SupabaseService) {}

  async createPost(userId: string, createPostDto: CreatePostDto) {
    const insertData: any = {
      user_id: userId,
      content: createPostDto.caption,
      caption: createPostDto.caption,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString(),
    };

    if (createPostDto.media_url) insertData.media_url = createPostDto.media_url;
    if (createPostDto.media_type) insertData.media_type = createPostDto.media_type;

    const { data, error } = await this.supabaseService
      .from('posts')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Create post error:', error);
      throw new Error(`Failed to create post: ${error.message}`);
    }

    const { data: profile } = await this.supabaseService
      .from('profiles')
      .select('username, avatar_url, badge_type')
      .eq('user_id', userId)
      .single();

    return { ...data, profiles: profile };
  }

  async getFeed(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    let followingIds: string[] = [userId];
    try {
      const { data: following } = await this.supabaseService
        .from('followers')
        .select('following_id')
        .eq('follower_id', userId);

      if (following && following.length > 0) {
        followingIds = [...followingIds, ...following.map(f => f.following_id)];
      }
    } catch (e) {
      console.log('Followers query failed, showing all posts');
    }

    const { data: posts, error } = await this.supabaseService
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get feed error:', error);
      if (error.code === '42P01') return [];
      throw new Error(`Failed to get feed: ${error.message}`);
    }

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
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get explore feed error:', error);
      return [];
    }

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

  async getUserPosts(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { data: posts, error } = await this.supabaseService
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return [];
    }

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

  async getPostById(postId: string, userId?: string) {
    const { data: post, error } = await this.supabaseService
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error || !post) {
      throw new NotFoundException('Post not found');
    }

    const { data: profile } = await this.supabaseService
      .from('profiles')
      .select('username, avatar_url, badge_type')
      .eq('user_id', post.user_id)
      .single();

    const result: any = { ...post, profiles: profile || null };

    if (userId) {
      const { data: like } = await this.supabaseService
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();
      result.is_liked = !!like;
    }

    // Get comments count
    const { count } = await this.supabaseService
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);

    result.comments_count = count || 0;

    return result;
  }

  async updatePost(userId: string, postId: string, updateData: Partial<any>) {
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

    if (error) throw new Error('Failed to update post');
    return data;
  }

  async deletePost(userId: string, postId: string) {
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

    if (error) throw new Error('Failed to delete post');
    return { message: 'Post deleted successfully' };
  }

  async likePost(userId: string, postId: string) {
    const { data: existing } = await this.supabaseService
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) throw new Error('Already liked this post');

    const { error } = await this.supabaseService
      .from('likes')
      .insert({ post_id: postId, user_id: userId });

    if (error) throw new Error('Failed to like post');

    // Increment likes count
    await this.supabaseService
      .from('posts')
      .update({ likes_count: 1 })
      .eq('id', postId);

    return { message: 'Post liked' };
  }

  async unlikePost(userId: string, postId: string) {
    const { error } = await this.supabaseService
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw new Error('Failed to unlike post');
    return { message: 'Post unliked' };
  }

  async getComments(postId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { data: comments, error } = await this.supabaseService
      .from('comments')
      .select('*, profiles(username, avatar_url, badge_type)')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get comments error:', error);
      return [];
    }

    return comments || [];
  }

  async addComment(userId: string, postId: string, content: string) {
    const { data, error } = await this.supabaseService
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Add comment error:', error);
      throw new Error('Failed to add comment');
    }

    // Update comments count
    await this.supabaseService
      .from('posts')
      .update({ comments_count: 1 })
      .eq('id', postId);

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

    if (error) throw new Error('Failed to delete comment');
    return { message: 'Comment deleted' };
  }
}
