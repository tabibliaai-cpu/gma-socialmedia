'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Search, Bell, Mail, Bookmark, User, Settings, HelpCircle, MoreHorizontal } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    { href: '/feed', icon: Home, label: 'Home' },
    { href: '/explore', icon: Search, label: 'Explore' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    { href: '/chat', icon: Mail, label: 'Messages' },
    { href: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { href: `/profile/${user?.username || 'me'}`, icon: User, label: 'Profile' },
  ];

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed' || pathname === '/';
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <div className="sticky top-20 space-y-4">
      {/* Navigation */}
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-4 px-3 py-3 rounded-full text-xl font-bold transition-all ${
              isActive(item.href)
                ? 'text-white'
                : 'text-dark-600 hover:bg-dark-100 hover:text-white'
            }`}
          >
            <item.icon className={`w-6 h-6 ${isActive(item.href) ? 'stroke-[2.5]' : ''}`} />
            <span className="hidden xl:block">{item.label}</span>
          </Link>
        ))}

        {/* More */}
        <button
          className="flex items-center gap-4 px-3 py-3 rounded-full text-xl font-bold text-dark-600 hover:bg-dark-100 hover:text-white w-full"
        >
          <MoreHorizontal className="w-6 h-6" />
          <span className="hidden xl:block">More</span>
        </button>
      </nav>

      {/* Post Button */}
      <Link
        href="/create/post"
        className="flex items-center justify-center w-full xl:w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-full transition-colors text-base"
      >
        <span className="xl:hidden">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </span>
        <span className="hidden xl:block">Post</span>
      </Link>

      {/* User Card */}
      {user && (
        <div className="flex items-center gap-3 p-3 rounded-full hover:bg-dark-100 cursor-pointer transition-colors mt-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shrink-0">
            {user.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="hidden xl:block flex-1 min-w-0">
            <p className="font-bold text-white text-sm truncate">{user.username}</p>
            <p className="text-dark-500 text-sm truncate">@{user.username}</p>
          </div>
          <MoreHorizontal className="w-5 h-5 text-dark-500 hidden xl:block" />
        </div>
      )}
    </div>
  );
}
