'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home, Search, Bell, Mail, Bookmark, Briefcase, Star, Settings,
  User, LogOut, ChevronRight, X
} from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Drawer({ isOpen, onClose, children }: DrawerProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Motion values for drag gestures
  const x = useMotionValue(0);
  const backgroundOpacity = useTransform(x, [-250, 0, 250], [0.6, 0, 0]);
  const scale = useTransform(x, [-250, 0], [0.95, 1]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle drag end
  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const shouldClose = info.offset.x < -100 || info.velocity.x < -500;
    if (shouldClose) {
      onClose();
    }
  }, [onClose]);

  // Navigation items based on user role
  const getNavItems = () => {
    const items = [
      { icon: Home, label: 'Home', href: '/feed' },
      { icon: Search, label: 'Explore', href: '/explore' },
      { icon: Bell, label: 'Notifications', href: '/notifications' },
      { icon: Mail, label: 'Messages', href: '/chat' },
      { icon: Bookmark, label: 'Bookmarks', href: '/bookmarks' },
    ];

    if (user?.role === 'business') {
      items.push({ icon: Briefcase, label: 'CRM', href: '/crm' });
    }

    items.push({ icon: Star, label: 'Creator', href: '/creator' });
    items.push({ icon: Settings, label: 'Settings', href: '/settings' });

    return items;
  };

  const handleNavClick = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleLogout = () => {
    onClose();
    logout();
    router.push('/login');
  };

  return (
    <div className="relative">
      {/* Main Content with scale effect */}
      <motion.div
        style={{ scale: isOpen ? 0.95 : 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="min-h-screen"
      >
        {children}
      </motion.div>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ x }}
            className="fixed top-0 left-0 h-full w-[280px] max-w-[85vw] bg-black/80 backdrop-blur-2xl border-r border-white/10 z-50 shadow-2xl overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-[0_0_10px_rgba(120,86,255,0.4)]">
                  GPM
                </div>
                <span className="text-white font-bold text-xl">Menu</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-dark-400" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-2">
              {getNavItems().map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors group"
                >
                  <item.icon className="w-6 h-6 text-dark-400 group-hover:text-primary transition-colors" />
                  <span className="text-white text-lg font-medium group-hover:text-primary transition-colors">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* User Profile Section */}
            {user && (
              <div className="border-t border-white/5">
                {/* Profile Link */}
                <button
                  onClick={() => handleNavClick(`/profile/${user?.profile?.username || user?.username || user?.user_id || user?.id}`)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-white/5 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] flex items-center justify-center text-white font-bold shrink-0 shadow-[0_0_10px_rgba(120,86,255,0.3)] group-hover:scale-105 transition-transform">
                    {user?.profile?.avatar_url ? (
                      <img src={user.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      user?.profile?.username?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-white font-bold truncate text-lg group-hover:text-primary transition-colors">
                      {user?.profile?.username || user?.username || 'User'}
                    </p>
                    <p className="text-dark-500 text-sm truncate">
                      @{user?.profile?.username || user?.username || 'user'}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-primary transition-colors" />
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-red-500/10 text-red-400 transition-colors"
                >
                  <LogOut className="w-6 h-6" />
                  <span className="text-lg">Logout</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Area for Opening (invisible) */}
      {!isOpen && (
        <motion.div
          className="fixed top-0 left-0 w-8 h-full z-30"
          drag="x"
          dragConstraints={{ left: 0, right: 250 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            if (info.offset.x > 100 || info.velocity.x > 500) {
              // Trigger open - parent component should handle this
            }
          }}
        />
      )}
    </div>
  );
}
