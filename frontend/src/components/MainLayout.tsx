'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Drawer from './Drawer';
import { Menu, Plus } from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter nav items based on user role
  const getNavItems = () => {
    const baseItems = [
      { href: '/feed', label: 'Home', icon: 'home' },
      { href: '/explore', label: 'Explore', icon: 'search' },
      { href: '/notifications', label: 'Notifications', icon: 'bell' },
      { href: '/chat', label: 'Messages', icon: 'mail' },
      { href: '/bookmarks', label: 'Bookmarks', icon: 'bookmark' },
    ];
    
    // Add CRM only for business accounts
    if (user?.role === 'business') {
      baseItems.push({ href: '/crm', label: 'CRM', icon: 'briefcase' });
    }
    
    baseItems.push({ href: '/creator', label: 'Creator', icon: 'star' });
    baseItems.push({ href: '/settings', label: 'Settings', icon: 'settings' });
    
    return baseItems;
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed' || pathname === '/';
    return pathname.startsWith(href);
  };

  const getIcon = (icon: string, filled: boolean = false) => {
    const className = 'w-6 h-6 md:w-[26px] md:h-[26px]';
    switch (icon) {
      case 'home':
        return filled ? (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          </svg>
        ) : (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        );
      case 'search':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        );
      case 'bell':
        return filled ? (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
        ) : (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        );
      case 'mail':
        return filled ? (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        ) : (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        );
      case 'bookmark':
        return filled ? (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
          </svg>
        ) : (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        );
      case 'briefcase':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        );
      case 'star':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        );
      case 'settings':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        );
      default:
        return null;
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d9bf0]"></div>
      </div>
    );
  }

  // Don't show layout for auth pages
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(pathname);
  if (isAuthPage || !user) {
    return <>{children}</>;
  }

  const content = (
    <div className="min-h-screen bg-black flex">
      {/* Left Sidebar - Desktop */}
      <aside className="hidden md:flex w-[275px] shrink-0 h-screen sticky top-0 flex-col justify-between py-2 px-2 xl:px-4">
        <div>
          {/* Logo */}
          <Link href="/feed" className="inline-flex items-center justify-center w-[52px] h-[52px] rounded-full hover:bg-[#181836] transition-colors mb-1">
            <span className="text-2xl font-bold text-white">GPM</span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-5 px-3 py-3 rounded-full transition-colors ${
                  isActive(item.href) ? 'font-bold' : 'hover:bg-[#181836]'
                }`}
              >
                <span className="text-white">
                  {getIcon(item.icon, isActive(item.href))}
                </span>
                <span className="text-xl text-white hidden xl:block">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Post Button */}
          <button
            onClick={() => router.push('/create/post')}
            className="mt-4 w-[90%] mx-auto flex items-center justify-center py-3 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold rounded-full transition-colors text-base"
          >
            <span className="hidden xl:inline">Post</span>
            <svg className="w-6 h-6 xl:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* User Profile */}
        <div className="mt-auto">
          <button 
            onClick={() => router.push(`/profile/${user?.profile?.username || user?.username || user?.user_id || user?.id}`)}
            className="flex items-center gap-3 p-3 rounded-full hover:bg-[#181836] cursor-pointer transition-colors w-full"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] flex items-center justify-center text-white font-bold shrink-0">
              {user?.profile?.username?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0 hidden xl:block text-left">
              <p className="font-bold text-white text-sm truncate">{user?.profile?.username || user?.username || 'User'}</p>
              <p className="text-[#71767b] text-sm truncate">@{user?.profile?.username || user?.username || 'user'}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 border-x border-[#2f3336] pb-16 md:pb-0">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 bg-black/80 backdrop-blur-md z-30 px-4 py-3 border-b border-[#2f3336]">
          <div className="flex items-center justify-between">
            {/* Menu Button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 -ml-2 hover:bg-[#181836] rounded-full transition-colors"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>

            {/* Logo */}
            <Link href="/feed" className="text-xl font-bold text-white">
              GPM
            </Link>

            {/* Post Button */}
            <button
              onClick={() => router.push('/create/post')}
              className="p-2 -mr-2 hover:bg-[#181836] rounded-full transition-colors"
            >
              <Plus className="w-6 h-6 text-white" />
            </button>
          </div>
        </header>

        {children}
      </main>

      {/* Right Sidebar - Desktop */}
      <aside className="hidden lg:flex w-[300px] xl:w-[350px] shrink-0 h-screen sticky top-0 overflow-y-auto py-2 px-4 xl:px-6">
        {/* Search */}
        <div className="sticky top-0 bg-black pb-3 w-full">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71767b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-12 pr-4 py-3 bg-[#202327] border-none rounded-full text-white placeholder-[#71767b] focus:bg-black focus:ring-1 focus:ring-[#1d9bf0] transition-all"
            />
          </div>
        </div>

        {/* Premium Card */}
        <div className="bg-[#16181c] rounded-2xl p-4 mb-4 w-full">
          <h2 className="text-xl font-bold text-white mb-2">Subscribe to Premium</h2>
          <p className="text-sm text-white mb-4">Subscribe to unlock new features and get a verified badge.</p>
          <button className="px-4 py-2 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold rounded-full transition-colors">
            Subscribe
          </button>
        </div>

        {/* Trending */}
        <div className="bg-[#16181c] rounded-2xl overflow-hidden w-full">
          <h2 className="text-xl font-bold text-white p-4 pb-2">What's happening</h2>
          {[
            { category: 'Technology', tag: '#AIRevolution', posts: '45.2K' },
            { category: 'Business', tag: '#StartupLife', posts: '32.1K' },
            { category: 'Trending', tag: '#Web3', posts: '28.5K' },
          ].map((item, i) => (
            <div key={i} className="px-4 py-3 hover:bg-[#1a1a2a] cursor-pointer transition-colors">
              <p className="text-xs text-[#71767b]">{item.category} · Trending</p>
              <p className="font-bold text-white">{item.tag}</p>
              <p className="text-xs text-[#71767b]">{item.posts} posts</p>
            </div>
          ))}
          <button className="w-full px-4 py-3 text-[#1d9bf0] hover:bg-[#1a1a2a] text-left transition-colors">
            Show more
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-[#2f3336] md:hidden z-40">
        <div className="flex justify-around items-center py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 ${
                isActive(item.href) ? 'text-white' : 'text-[#71767b]'
              }`}
            >
              {getIcon(item.icon, isActive(item.href))}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );

  return (
    <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
      {content}
    </Drawer>
  );
}
