'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsAPI } from '@/lib/api';
import { useNotificationsStore } from '@/store';
import Navbar from '@/components/Navbar';
import { Bell, MessageCircle, UserPlus, Heart, DollarSign, Megaphone, Check, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  content?: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, setNotifications, markAsRead, markAllAsRead } = useNotificationsStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await notificationsAPI.getAll();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      markAsRead(id);
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-5 w-5 text-primary-400" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-400" />;
      case 'like':
        return <Heart className="h-5 w-5 text-red-400" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-400" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-yellow-400" />;
      case 'lead':
        return <Megaphone className="h-5 w-5 text-purple-400" />;
      case 'ad_click':
        return <Megaphone className="h-5 w-5 text-orange-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  const getLink = (notification: Notification) => {
    switch (notification.type) {
      case 'message':
        return '/chat';
      case 'follow':
      case 'like':
      case 'comment':
        return notification.data?.postId ? `/post/${notification.data.postId}` : '#';
      default:
        return '#';
    }
  };

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-dark-200 rounded-xl p-8 text-center">
            <Bell className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-dark-200 rounded-xl p-4 flex items-start space-x-4 ${
                  !notification.is_read ? 'border-l-4 border-primary-500' : ''
                }`}
              >
                <div className="flex-shrink-0 p-2 bg-dark-300 rounded-full">
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={getLink(notification)}>
                    <p className={`font-medium ${!notification.is_read ? 'text-white' : 'text-gray-300'}`}>
                      {notification.title}
                    </p>
                    {notification.content && (
                      <p className="text-sm text-gray-400 mt-1">{notification.content}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">{formatDate(notification.created_at)}</p>
                  </Link>
                </div>

                <div className="flex items-center space-x-2">
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded-full transition-colors"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-300 rounded-full transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
