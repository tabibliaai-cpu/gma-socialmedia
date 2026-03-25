'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { notificationsAPI } from '@/lib/api';
import { Bell, Heart, MessageCircle, UserPlus, Verified, Repeat2 } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  content: string;
  read: boolean;
  created_at: string;
  actor?: {
    username: string;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await notificationsAPI.getAll();
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getIcon = (type: string) => {
    const className = "w-[32px] h-[32px]";
    switch (type) {
      case 'like':
        return <Heart className={`${className} text-[#f91880] fill-[#f91880]`} />;
      case 'comment':
        return <MessageCircle className={`${className} text-[#1d9bf0]`} />;
      case 'follow':
        return <UserPlus className={`${className} text-[#1d9bf0]`} />;
      case 'retweet':
        return <Repeat2 className={`${className} text-[#00ba7c]`} />;
      case 'verification':
        return <Verified className={`${className} text-[#1d9bf0] fill-[#1d9bf0]`} />;
      default:
        return <Bell className={`${className} text-[#1d9bf0]`} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-[#2f3336]">
          <h1 className="px-4 py-4 text-xl font-bold text-white">Notifications</h1>
          <div className="flex">
            {['All', 'Mentions', 'Verified'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`flex-1 py-4 text-center font-medium transition-colors relative ${
                  activeTab === tab.toLowerCase()
                    ? 'text-white'
                    : 'text-[#71767b] hover:bg-[#181836]'
                }`}
              >
                {tab}
                {activeTab === tab.toLowerCase() && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#1d9bf0]"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-[#71767b] mx-auto mb-4" />
            <p className="text-[#71767b] text-lg">No notifications yet</p>
            <p className="text-[#71767b] text-sm mt-2">When you get notifications, they'll show up here</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2f3336]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`p-4 hover:bg-[#181836] transition-colors cursor-pointer flex gap-4 ${
                  !notification.read ? 'bg-[#1d9bf0]/5' : ''
                }`}
              >
                <div className="shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] flex items-center justify-center text-white text-xs font-bold">
                      {notification.actor?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <p className="text-white">{notification.content}</p>
                  <p className="text-[#71767b] text-sm mt-1">{formatTime(notification.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
