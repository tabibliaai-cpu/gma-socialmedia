import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { SendMessageDto } from './dto/send-message.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ChatService {
  constructor(
    private supabaseService: SupabaseService,
    private aiService: AiService,
  ) {}

  async canSendMessage(senderId: string, receiverId: string) {
    // Check if blocked
    const { data: block } = await this.supabaseService
      .from('blocks')
      .select('id')
      .or(`and(blocker_id.eq.${receiverId},blocked_id.eq.${senderId}),and(blocker_id.eq.${senderId},blocked_id.eq.${receiverId})`)
      .single();

    if (block) {
      return { allowed: false, reason: 'User is blocked' };
    }

    // Check privacy settings
    const { data: privacy } = await this.supabaseService
      .from('privacy_settings')
      .select('dm_permission')
      .eq('user_id', receiverId)
      .single();

    if (privacy?.dm_permission === 'none') {
      return { allowed: false, reason: 'User does not accept messages' };
    }

    // Check paid chat
    const { data: paidSettings } = await this.supabaseService
      .from('paid_chat_settings')
      .select('*')
      .eq('user_id', receiverId)
      .single();

    if (paidSettings?.is_enabled && paidSettings.price_per_message > 0) {
      // Check if chat is unlocked
      const { data: unlock } = await this.supabaseService
        .from('chat_unlocks')
        .select('id')
        .eq('payer_id', senderId)
        .eq('creator_id', receiverId)
        .single();

      if (!unlock) {
        return {
          allowed: false,
          reason: 'Payment required to chat with this user',
          requiresPayment: true,
          price: paidSettings.price_per_message,
        };
      }
    }

    return { allowed: true };
  }

  async saveMessage(data: SendMessageDto) {
    const { data: message, error } = await this.supabaseService
      .from('messages')
      .insert({
        sender_id: data.senderId,
        receiver_id: data.receiverId,
        encrypted_message: data.encryptedMessage,
        media_url: data.mediaUrl,
        message_type: data.messageType || 'text',
        is_paid: data.isPaid || false,
      })
      .select(`
        *,
        sender:profiles!sender_id (username, avatar_url),
        receiver:profiles!receiver_id (username, avatar_url)
      `)
      .single();

    if (error) {
      throw new Error('Failed to save message');
    }

    return message;
  }

  async getConversation(userId: string, otherUserId: string, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;

    const { data: messages, error } = await this.supabaseService
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error('Failed to get conversation');
    }

    return messages?.reverse() || [];
  }

  async getConversations(userId: string) {
    // Get all unique conversations with latest message
    const { data: messages, error } = await this.supabaseService
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get conversations:', error);
      return [];
    }

    if (!messages || messages.length === 0) {
      return [];
    }

    // Group by conversation partner
    const conversations = new Map();
    
    for (const msg of messages) {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partnerId,
          partner: { username: 'Unknown', avatar_url: null },
          lastMessage: msg,
          unreadCount: 0,
        });
      }
      
      // Count unread
      if (msg.receiver_id === userId && !msg.is_read) {
        conversations.get(partnerId).unreadCount++;
      }
    }

    return Array.from(conversations.values());
  }

  async markMessagesAsRead(userId: string, senderId: string) {
    const { error } = await this.supabaseService
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', userId)
      .eq('sender_id', senderId)
      .eq('is_read', false);

    if (error) {
      throw new Error('Failed to mark messages as read');
    }

    return { message: 'Messages marked as read' };
  }

  async blockUser(blockerId: string, blockedId: string) {
    const { error } = await this.supabaseService
      .from('blocks')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
        is_nuclear: false,
      });

    if (error) {
      throw new Error('Failed to block user');
    }

    return { message: 'User blocked' };
  }

  async nuclearBlock(blockerId: string, blockedId: string) {
    // Delete all messages between users
    const { error: deleteError } = await this.supabaseService
      .from('messages')
      .delete()
      .or(`and(sender_id.eq.${blockerId},receiver_id.eq.${blockedId}),and(sender_id.eq.${blockedId},receiver_id.eq.${blockerId})`);

    if (deleteError) {
      throw new Error('Failed to delete messages');
    }

    // Create nuclear block
    const { error: blockError } = await this.supabaseService
      .from('blocks')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
        is_nuclear: true,
      });

    if (blockError) {
      throw new Error('Failed to create nuclear block');
    }

    return { message: 'Nuclear block activated - all messages deleted' };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    const { error } = await this.supabaseService
      .from('blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);

    if (error) {
      throw new Error('Failed to unblock user');
    }

    return { message: 'User unblocked' };
  }

  async setPaidChatSettings(userId: string, price: number, enabled: boolean) {
    const { data, error } = await this.supabaseService
      .from('paid_chat_settings')
      .upsert({
        user_id: userId,
        price_per_message: price,
        is_enabled: enabled,
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update paid chat settings');
    }

    return data;
  }

  async unlockChat(payerId: string, creatorId: string, amount: number, paymentId: string) {
    const { data, error } = await this.supabaseService
      .from('chat_unlocks')
      .insert({
        payer_id: payerId,
        creator_id: creatorId,
        amount,
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to unlock chat');
    }

    // Record transaction
    await this.supabaseService.from('transactions').insert({
      user_id: payerId,
      amount,
      type: 'chat',
      status: 'completed',
      razorpay_payment_id: paymentId,
    });

    return data;
  }

  async triggerAutoReply(userId: string, senderId: string, messageId: string) {
    // Check if auto-reply is enabled
    const { data: automation } = await this.supabaseService
      .from('ai_automations')
      .select('*')
      .eq('business_id', userId)
      .eq('type', 'auto_reply')
      .eq('is_active', true)
      .single();

    if (!automation) return;

    // Generate AI reply
    const reply = await this.aiService.generateAutoReply(automation.prompt_template);

    if (reply) {
      // Save auto-reply
      await this.saveMessage({
        senderId: userId,
        receiverId: senderId,
        encryptedMessage: reply,
        messageType: 'text',
      });
    }
  }

  async deleteMessage(userId: string, messageId: string) {
    const { data: message } = await this.supabaseService
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .single();

    if (!message || message.sender_id !== userId) {
      throw new ForbiddenException('Not authorized to delete this message');
    }

    const { error } = await this.supabaseService
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      throw new Error('Failed to delete message');
    }

    return { message: 'Message deleted' };
  }
}
