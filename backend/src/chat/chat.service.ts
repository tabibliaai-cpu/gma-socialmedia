import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ChatService {
  constructor(
    private supabaseService: SupabaseService,
    private notificationsService: NotificationsService,
  ) {}

  async getConversations(userId: string) {
    const { data: messages, error } = await this.supabaseService
      .from('messages')
      .select('id, content, sender_id, receiver_id, created_at, read')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get conversations error:', error);
      return [];
    }

    // Group messages by conversation partner
    const conversationsMap = new Map();
    
    for (const msg of messages || []) {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      
      if (!conversationsMap.has(partnerId)) {
        // Get partner profile
        const { data: profile } = await this.supabaseService
          .from('profiles')
          .select('user_id, username, avatar_url, badge_type')
          .eq('user_id', partnerId)
          .single();

        conversationsMap.set(partnerId, {
          id: partnerId,
          participant: profile || { user_id: partnerId, username: 'user', avatar_url: null, badge_type: 'none' },
          last_message: {
            content: msg.content,
            created_at: msg.created_at,
          },
        });
      }
    }

    return Array.from(conversationsMap.values());
  }

  async getConversation(userId: string, partnerId: string, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;

    const { data: messages, error } = await this.supabaseService
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get conversation error:', error);
      return [];
    }

    // Mark messages as read
    await this.supabaseService
      .from('messages')
      .update({ read: true })
      .eq('sender_id', partnerId)
      .eq('receiver_id', userId)
      .eq('read', false);

    return messages || [];
  }

  async sendMessage(senderId: string, receiverId: string, content: string, mediaUrl?: string) {
    const { data, error } = await this.supabaseService
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        media_url: mediaUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Send message error:', error);
      throw new Error('Failed to send message');
    }

    // Get sender name for notification
    const { data: senderProfile } = await this.supabaseService
      .from('profiles')
      .select('username')
      .eq('user_id', senderId)
      .single();

    // Send notification
    await this.notificationsService.notifyMessage(receiverId, senderProfile?.username || 'Someone');

    return data;
  }

  async startConversation(userId: string, partnerId: string) {
    // Check if there's existing conversation
    const { data: existing } = await this.supabaseService
      .from('messages')
      .select('id')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
      .limit(1);

    // Get partner profile
    const { data: profile } = await this.supabaseService
      .from('profiles')
      .select('user_id, username, avatar_url, badge_type')
      .eq('user_id', partnerId)
      .single();

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    return {
      id: partnerId,
      participant: profile,
      last_message: null,
    };
  }

  async blockUser(userId: string, blockedId: string) {
    const { error } = await this.supabaseService
      .from('blocked_users')
      .insert({
        user_id: userId,
        blocked_user_id: blockedId,
      });

    if (error) {
      // Check if it's a duplicate key error (already blocked)
      if (error.code === '23505') {
        return { message: 'User already blocked' };
      }
      throw new Error('Failed to block user');
    }

    return { message: 'User blocked successfully' };
  }

  async nuclearBlock(userId: string, blockedId: string) {
    // Block the user
    await this.blockUser(userId, blockedId);

    // Delete all messages between users
    await this.supabaseService
      .from('messages')
      .delete()
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${blockedId}),and(sender_id.eq.${blockedId},receiver_id.eq.${userId})`);

    // Unfollow each other
    await this.supabaseService
      .from('followers')
      .delete()
      .or(`and(follower_id.eq.${userId},following_id.eq.${blockedId}),and(follower_id.eq.${blockedId},following_id.eq.${userId})`);

    return { message: 'User blocked and all interactions removed' };
  }

  async unblockUser(userId: string, blockedId: string) {
    const { error } = await this.supabaseService
      .from('blocked_users')
      .delete()
      .eq('user_id', userId)
      .eq('blocked_user_id', blockedId);

    if (error) throw new Error('Failed to unblock user');
    return { message: 'User unblocked' };
  }

  async setPaidChatSettings(userId: string, price: number, enabled: boolean) {
    const { error } = await this.supabaseService
      .from('paid_chat_settings')
      .upsert({
        user_id: userId,
        price_per_message: price,
        is_enabled: enabled,
      });

    if (error) throw new Error('Failed to update settings');
    return { message: 'Settings updated' };
  }

  async unlockChat(userId: string, creatorId: string, amount: number, paymentId: string) {
    // Check if payment is valid
    // TODO: Implement payment verification
    
    // Create unlock record
    const { error } = await this.supabaseService
      .from('chat_unlocks')
      .insert({
        user_id: userId,
        creator_id: creatorId,
        amount,
        payment_id: paymentId,
      });

    if (error) throw new Error('Failed to unlock chat');
    return { message: 'Chat unlocked' };
  }

  async deleteMessage(userId: string, messageId: string) {
    const { data: message } = await this.supabaseService
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .single();

    if (!message || message.sender_id !== userId) {
      throw new Error('Not authorized to delete this message');
    }

    const { error } = await this.supabaseService
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw new Error('Failed to delete message');
    return { message: 'Message deleted' };
  }
}
