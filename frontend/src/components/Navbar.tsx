'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationsStore } from '@/store';
import { notificationsAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import {
  Home,
  Search,
  MessageCircle,
  Bell,
  User,
  Settings,
  Plus,
  Briefcase,
  BarChart3,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount, setUnreadCount } = useNotificationsStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUnreadCount();
  }, []);

  const loadUnreadCount = async () => {
    try {
      const { data } = await notificationsAPI.getUnreadCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Failed to load notifications count:', error);
    }
  };

  const navItems = [
    { href: '/feed', icon: Home, label: 'Home' },
    { href: '/explore', icon: Search, label: 'Explore' },
    { href: '/chat', icon: MessageCircle, label: 'Messages' },
    { href: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
  ];

  // Add role-specific items
  if (user?.role === 'creator') {
    navItems.push({ href: '/creator', icon: BarChart3, label: 'Dashboard' });
  }
  if (user?.role === 'business') {
    navItems.push({ href: '/crm', icon: Briefcase, label: 'CRM' });
  }

  return (
    <nav className="bg-dark-200 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/feed" className="text-2xl font-bold text-primary-400">
            SocialApp
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-dark-300 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Nav Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded-full transition-colors"
              >
                <item.icon className="h-6 w-6" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* Profile Dropdown */}
            <div className="relative group">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded-full transition-colors">
                {user?.profile?.avatar_url ? (
                  <img
                    src={user.profile.avatar_url}
                    alt={user.profile.username}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <User className="h-6 w-6" />
                )}
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-dark-200 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link
                  href={`/profile/${user?.profile?.username}`}
                  className="block px-4 py-2 text-gray-300 hover:bg-dark-300 hover:text-white"
                >
                  <User className="inline h-4 w-4 mr-2" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-gray-300 hover:bg-dark-300 hover:text-white"
                >
                  <Settings className="inline h-4 w-4 mr-2" />
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-dark-300 hover:text-white"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
