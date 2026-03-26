import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    private supabaseService: SupabaseService,
    private notificationsService: NotificationsService,
  ) {}

  async getProfile(userId: string) {
    const { data: user, error } = await this.supabaseService
      .from('users')
      .select('id, email, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new NotFoundException('User not found');
    }

    // Get profile separately
    const { data: profile } = await this.supabaseService
      .from('profiles')
      .select('username, bio, avatar_url, badge_type, followers_count, following_count')
      .eq('user_id', userId)
      .single();

    // Get privacy settings
    const { data: privacy } = await this.supabaseService
      .from('privacy_settings')
      .select('name_visibility, dm_permission, search_visibility')
      .eq('user_id', userId)
      .single();

    // Get paid chat settings
    const { data: paidChat } = await this.supabaseService
      .from('paid_chat_settings')
      .select('price_per_message, is_enabled')
      .eq('user_id', userId)
      .single();

    return {
      ...user,
      profile: profile || null,
      privacy_settings: privacy || null,
      paid_chat_settings: paidChat || null,
    };
  }

  async getPublicProfile(username: string) {
    // Get profile by username
    const { data: profile, error } = await this.supabaseService
      .from('profiles')
      .select('user_id, username, name, bio, avatar_url, cover_url, badge_type, followers_count, following_count, website, location, profession')
      .eq('username', username)
      .single();

    if (error || !profile) {
      throw new NotFoundException('User not found');
    }

    // Get user role separately
    const { data: user } = await this.supabaseService
      .from('users')
      .select('role, created_at')
      .eq('id', profile.user_id)
      .single();

    // Check privacy settings
    const { data: privacy } = await this.supabaseService
      .from('privacy_settings')
      .select('search_visibility')
      .eq('user_id', profile.user_id)
      .single();

    if (privacy?.search_visibility === 'hidden') {
      throw new NotFoundException('User not found');
    }

    return {
      ...profile,
      role: user?.role,
      created_at: user?.created_at,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const updateData: any = {};

    if (updateProfileDto.username) {
      // Check if username is taken
      const { data: existing } = await this.supabaseService
        .from('profiles')
        .select('user_id')
        .eq('username', updateProfileDto.username)
        .neq('user_id', userId)
        .single();

      if (existing) {
        throw new BadRequestException('Username already taken');
      }
      updateData.username = updateProfileDto.username;
    }

    if (updateProfileDto.name !== undefined) {
      updateData.name = updateProfileDto.name;
    }

    if (updateProfileDto.bio !== undefined) {
      updateData.bio = updateProfileDto.bio;
    }

    if (updateProfileDto.avatar_url !== undefined) {
      updateData.avatar_url = updateProfileDto.avatar_url;
    }

    if (updateProfileDto.cover_url !== undefined) {
      updateData.cover_url = updateProfileDto.cover_url;
    }

    if (updateProfileDto.website !== undefined) {
      updateData.website = updateProfileDto.website;
    }

    if (updateProfileDto.location !== undefined) {
      updateData.location = updateProfileDto.location;
    }

    if (updateProfileDto.profession !== undefined) {
      updateData.profession = updateProfileDto.profession;
    }

    const { data, error } = await this.supabaseService
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update profile');
    }

    return data;
  }

  async updatePrivacy(userId: string, updatePrivacyDto: UpdatePrivacyDto) {
    const { data, error } = await this.supabaseService
      .from('privacy_settings')
      .update(updatePrivacyDto)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update privacy settings');
    }

    return data;
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    // Check if already following
    const { data: existing } = await this.supabaseService
      .from('followers')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (existing) {
      throw new BadRequestException('Already following this user');
    }

    // Create follow relationship
    const { error } = await this.supabaseService.from('followers').insert({
      follower_id: followerId,
      following_id: followingId,
    });

    if (error) {
      throw new Error('Failed to follow user');
    }

    // Update counts
    await this.supabaseService.rpc('increment_followers', { user_id: followingId });
    await this.supabaseService.rpc('increment_following', { user_id: followerId });

    // Get follower info for notification
    const { data: followerProfile } = await this.supabaseService
      .from('profiles')
      .select('username')
      .eq('user_id', followerId)
      .single();

    await this.notificationsService.notifyFollow(followingId, followerProfile?.username || 'Someone');

    return { message: 'Followed successfully' };
  }

  async unfollowUser(followerId: string, followingId: string) {
    const { error } = await this.supabaseService
      .from('followers')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      throw new Error('Failed to unfollow user');
    }

    // Update counts
    await this.supabaseService.rpc('decrement_followers', { user_id: followingId });
    await this.supabaseService.rpc('decrement_following', { user_id: followerId });

    return { message: 'Unfollowed successfully' };
  }

  async getFollowers(username: string) {
    const { data: profile } = await this.supabaseService
      .from('profiles')
      .select('user_id')
      .eq('username', username)
      .single();

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    const { data, error } = await this.supabaseService
      .from('followers')
      .select(`
        follower_id,
        created_at,
        profiles!followers_follower_id_fkey (
          username,
          avatar_url,
          badge_type
        )
      `)
      .eq('following_id', profile.user_id);

    if (error) {
      throw new Error('Failed to get followers');
    }

    return data;
  }

  async getFollowing(username: string) {
    const { data: profile } = await this.supabaseService
      .from('profiles')
      .select('user_id')
      .eq('username', username)
      .single();

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    const { data, error } = await this.supabaseService
      .from('followers')
      .select(`
        following_id,
        created_at,
        profiles!followers_following_id_fkey (
          username,
          avatar_url,
          badge_type
        )
      `)
      .eq('follower_id', profile.user_id);

    if (error) {
      throw new Error('Failed to get following');
    }

    return data;
  }

  async checkFollowStatus(followerId: string, followingId: string) {
    const { data } = await this.supabaseService
      .from('followers')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    return { isFollowing: !!data };
  }

  async createShareLink(userId: string) {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const { data, error } = await this.supabaseService
      .from('share_links')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create share link');
    }

    return { token, expires_at: expiresAt };
  }

  async getSharedProfile(token: string) {
    const { data: link, error: linkError } = await this.supabaseService
      .from('share_links')
      .select('*')
      .eq('token', token)
      .single();

    if (linkError || !link) {
      throw new NotFoundException('Invalid share link');
    }

    if (new Date(link.expires_at) < new Date()) {
      throw new BadRequestException('Share link expired');
    }

    if (link.used) {
      throw new BadRequestException('Share link already used');
    }

    // Mark as used
    await this.supabaseService
      .from('share_links')
      .update({ used: true })
      .eq('id', link.id);

    return this.getProfile(link.user_id);
  }
}
