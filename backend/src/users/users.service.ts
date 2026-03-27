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
  ) { }

  async getProfile(userId: string) {
    const { data: user, error } = await this.supabaseService
      .from('users')
      .select('id, email, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) throw new NotFoundException('User not found');

    const { data: profile } = await this.supabaseService
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: privacy } = await this.supabaseService
      .from('privacy_settings')
      .select('name_visibility, dm_permission')
      .eq('user_id', userId)
      .single();

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
    const { data: profile, error } = await this.supabaseService
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !profile) throw new NotFoundException('User not found');

    const { data: user } = await this.supabaseService
      .from('users')
      .select('role, created_at')
      .eq('id', profile.user_id)
      .single();

    // Fetch Privacy Settings
    const { data: privacy } = await this.supabaseService
      .from('privacy_settings')
      .select('name_visibility, dm_permission')
      .eq('user_id', profile.user_id)
      .single();

    // Fetch Monetization (Paid Chat)
    let paidChatSettings: any = null;
    if (user?.role === 'creator') {
      const { data: pc } = await this.supabaseService
        .from('paid_chat_settings')
        .select('price_per_message, is_enabled')
        .eq('user_id', profile.user_id)
        .single();
      paidChatSettings = pc;
    }

    // Fetch Affiliate Info
    const { data: affiliates } = await this.supabaseService
      .from('affiliates')
      .select('*')
      .eq('affiliate_id', profile.user_id)
      .eq('status', 'active');

    return {
      ...profile,
      name: profile.username, // Fallback since real 'name' column is missing from DB
      role: user?.role,
      created_at: user?.created_at,
      // 3. DM PERMISSION RULE
      dm_permission: privacy?.dm_permission || 'everyone',
      // Profile Extras
      paid_chat_settings: paidChatSettings,
      affiliates: affiliates || [],
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const updateData: any = {};

    if (updateProfileDto.username) {
      const { data: existing } = await this.supabaseService
        .from('profiles')
        .select('user_id')
        .eq('username', updateProfileDto.username)
        .neq('user_id', userId)
        .single();

      if (existing) throw new BadRequestException('Username already taken');
      updateData.username = updateProfileDto.username;
    }

    if (updateProfileDto.name !== undefined) updateData.name = updateProfileDto.name;
    if (updateProfileDto.bio !== undefined) updateData.bio = updateProfileDto.bio;
    if (updateProfileDto.avatar_url !== undefined) updateData.avatar_url = updateProfileDto.avatar_url;
    if (updateProfileDto.cover_url !== undefined) updateData.cover_url = updateProfileDto.cover_url;
    if (updateProfileDto.website !== undefined) updateData.website = updateProfileDto.website;
    if (updateProfileDto.location !== undefined) updateData.location = updateProfileDto.location;
    if (updateProfileDto.profession !== undefined) updateData.profession = updateProfileDto.profession;

    const { data, error } = await this.supabaseService
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error('Failed to update profile');
    return data;
  }

  async updatePrivacy(userId: string, updatePrivacyDto: UpdatePrivacyDto) {
    const { data, error } = await this.supabaseService
      .from('privacy_settings')
      .upsert({ user_id: userId, ...updatePrivacyDto }) // Use upsert in case row doesn't exist yet
      .select()
      .single();

    if (error) throw new Error('Failed to update privacy settings');
    return data;
  }

  async updateBusinessSettings(userId: string, data: { auto_reply_enabled: boolean; auto_reply_message: string }) {
    const { data: updated, error } = await this.supabaseService
      .from('user_settings')
      .upsert({ user_id: userId, ...data })
      .select()
      .single();

    if (error) throw new Error('Failed to update business settings');
    return updated;
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) throw new BadRequestException('Cannot follow yourself');

    const { data: existing } = await this.supabaseService
      .from('followers')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (existing) throw new BadRequestException('Already following this user');

    const { error } = await this.supabaseService.from('followers').insert({
      follower_id: followerId,
      following_id: followingId,
    });

    if (error) throw new Error('Failed to follow user');

    await this.supabaseService.rpc('increment_followers', { user_id: followingId });
    await this.supabaseService.rpc('increment_following', { user_id: followerId });

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

    if (error) throw new Error('Failed to unfollow user');

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

    if (!profile) throw new NotFoundException('User not found');

    const { data, error } = await this.supabaseService
      .from('followers')
      .select(`follower_id, created_at, profiles!followers_follower_id_fkey (username, avatar_url, badge_type)`)
      .eq('following_id', profile.user_id);

    if (error) throw new Error('Failed to get followers');
    return data;
  }

  async getFollowing(username: string) {
    const { data: profile } = await this.supabaseService
      .from('profiles')
      .select('user_id')
      .eq('username', username)
      .single();

    if (!profile) throw new NotFoundException('User not found');

    const { data, error } = await this.supabaseService
      .from('followers')
      .select(`following_id, created_at, profiles!followers_following_id_fkey (username, avatar_url, badge_type)`)
      .eq('follower_id', profile.user_id);

    if (error) throw new Error('Failed to get following');
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
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Master Plan: 5 minutes expiry

    const { data, error } = await this.supabaseService
      .from('share_links')
      .insert({ user_id: userId, token, expires_at: expiresAt.toISOString() })
      .select()
      .single();

    if (error) throw new Error('Failed to create share link');
    return { token, expires_at: expiresAt };
  }

  async getSharedProfile(token: string) {
    const { data: link, error: linkError } = await this.supabaseService
      .from('share_links')
      .select('*')
      .eq('token', token)
      .single();

    if (linkError || !link) throw new NotFoundException('Invalid share link');
    if (new Date(link.expires_at) < new Date()) throw new BadRequestException('Share link expired');
    if (link.used) throw new BadRequestException('Share link already used');

    // Master Plan: Works only once
    await this.supabaseService
      .from('share_links')
      .update({ used: true })
      .eq('id', link.id);

    return this.getProfile(link.user_id);
  }
}
