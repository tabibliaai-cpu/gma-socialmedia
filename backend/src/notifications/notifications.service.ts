import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';

@Injectable()
export class NotificationsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(userId: string, data: {
    type: string;
    title: string;
    content?: string;
    data?: Record<string, any>;
  }) {
    const { data: notification, error } = await this.supabaseService
      .from('notifications')
      .insert({
        user_id: userId,
        type: data.type,
        title: data.title,
        content: data.content,
        data: data.data || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create notification:', error);
      return null;
    }

    return notification;
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { data, error } = await this.supabaseService
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
    return data || [];
  }

  async getUnreadCount(userId: string) {
    try {
      const { count, error } = await this.supabaseService
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        // Try with 'read' column instead
        const { count: count2 } = await this.supabaseService
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('read', false);
        return count2 || 0;
      }
      return count || 0;
    } catch (e) {
      return 0;
    }
  }

  async markAsRead(userId: string, notificationId: string) {
    const { error } = await this.supabaseService
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      // Try with 'read' column
      await this.supabaseService
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);
    }
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    const { error } = await this.supabaseService
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      // Try with 'read' column
      await this.supabaseService
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
    }
    return { success: true };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const { error } = await this.supabaseService
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw new Error('Failed to delete notification');
    return { success: true };
  }

  // Notification helpers
  async notifyMessage(receiverId: string, senderName: string) {
    return this.create(receiverId, {
      type: 'message',
      title: `New message from ${senderName}`,
      content: 'You have a new message',
    });
  }

  async notifyFollow(userId: string, followerName: string) {
    return this.create(userId, {
      type: 'follow',
      title: `${followerName} started following you`,
    });
  }

  async notifyLike(userId: string, likerName: string, postId: string) {
    return this.create(userId, {
      type: 'like',
      title: `${likerName} liked your post`,
      data: { postId },
    });
  }

  async notifyComment(userId: string, commenterName: string, postId: string) {
    return this.create(userId, {
      type: 'comment',
      title: `${commenterName} commented on your post`,
      data: { postId },
    });
  }

  async notifyPayment(userId: string, amount: number, type: string) {
    return this.create(userId, {
      type: 'payment',
      title: `Payment received: ₹${amount}`,
      content: `You received a payment for ${type}`,
    });
  }

  async notifyLead(userId: string, source: string) {
    return this.create(userId, {
      type: 'lead',
      title: 'New lead received',
      content: `A new lead came from ${source}`,
    });
  }

  async notifyAdClick(userId: string, adTitle: string) {
    return this.create(userId, {
      type: 'ad_click',
      title: 'Your ad was clicked',
      content: `Someone clicked on "${adTitle}"`,
    });
  }
}
