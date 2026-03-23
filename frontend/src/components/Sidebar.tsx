'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Home, Compass, Bell, MessageCircle, Bookmark, User, Settings, HelpCircle } from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  const menuItems = [
    { href: '/feed', icon: Home, label: 'Home' },
    { href: '/explore', icon: Compass, label: 'Explore' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    { href: '/chat', icon: MessageCircle, label: 'Messages' },
    { href: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { href: `/profile/${user?.profile?.username}`, icon: User, label: 'Profile' },
    { href: '/settings', icon: Settings, label: 'Settings' },
    { href: '/help', icon: HelpCircle, label: 'Help' },
  ];

  return (
    <div className="sticky top-20">
      {/* User Card */}
      <div className="bg-dark-200 rounded-xl p-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
            {user?.profile?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-semibold text-white">{user?.profile?.username}</p>
            <p className="text-sm text-gray-400">@{user?.profile?.username}</p>
          </div>
        </div>
        <div className="flex justify-around mt-4 pt-4 border-t border-gray-700">
          <div className="text-center">
            <p className="font-bold text-white">{user?.profile?.followers_count || 0}</p>
            <p className="text-xs text-gray-400">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-white">{user?.profile?.following_count || 0}</p>
            <p className="text-xs text-gray-400">Following</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="bg-dark-200 rounded-xl p-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-dark-300 hover:text-white rounded-lg transition-colors"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
