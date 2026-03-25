'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/feed', label: 'Home', icon: 'home' },
    { href: '/explore', label: 'Explore', icon: 'search' },
    { href: '/chat', label: 'Messages', icon: 'chat' },
    { href: '/notifications', label: 'Notifications', icon: 'bell' },
    { href: '/bookmarks', label: 'Bookmarks', icon: 'bookmark' },
    { href: '/profile', label: 'Profile', icon: 'user' },
  ];

  const isActive = (href: string) => pathname === href;

  const getIcon = (icon: string, className?: string) => {
    const cn = className || 'w-6 h-6';
    switch (icon) {
      case 'home':
        return (
          <svg className={cn} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 9c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-7 9c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm14 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
          </svg>
        );
      case 'search':
        return (
          <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        );
      case 'chat':
        return (
          <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        );
      case 'bell':
        return (
          <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        );
      case 'bookmark':
        return (
          <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
        );
      case 'user':
        return (
          <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-dark-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">GPM</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-base font-medium transition-all ${
                  isActive(item.href)
                    ? 'text-white bg-dark-100'
                    : 'text-dark-600 hover:bg-dark-100 hover:text-white'
                }`}
              >
                {getIcon(item.icon)}
                <span className="hidden xl:block">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Post Button */}
            <Link
              href="/create/post"
              className="hidden sm:flex items-center justify-center px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-full transition-all"
            >
              <span>Post</span>
            </Link>

            {/* User Avatar */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 rounded-full bg-dark-100 border-2 border-dark-300 overflow-hidden"
              >
                <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-dark-600 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-dark-100 border-b border-dark-200 animate-fade-in">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${
                  isActive(item.href)
                    ? 'text-white bg-dark-200'
                    : 'text-dark-600 hover:bg-dark-200 hover:text-white'
                }`}
              >
                {getIcon(item.icon)}
                <span>{item.label}</span>
              </Link>
            ))}
            <hr className="border-dark-200 my-2" />
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-danger hover:bg-dark-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
