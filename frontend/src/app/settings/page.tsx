'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';
import { Lock, User, Bell, Shield, Palette, Globe, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d9bf0]"></div>
        </div>
      </MainLayout>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/login');
    }
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', href: '/settings/profile', description: 'Update your profile information' },
        { icon: Lock, label: 'Privacy & Security', href: '/settings/privacy', description: 'Manage privacy and DM permissions' },
        ...((user?.role === 'creator') ? [{ icon: User, label: 'Monetization', href: '/settings/monetization', description: 'Manage Paid Chat and Earnings' }] : []),
        ...((user?.role === 'business') ? [{ icon: User, label: 'Business Dashboard', href: '/settings/business', description: 'Manage Affiliates and CRM Bots' }] : []),
        { icon: Shield, label: 'Two-Factor Authentication', href: '/settings/2fa', description: 'Add extra security' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', href: '/settings/notifications', description: 'Configure notifications' },
        { icon: Palette, label: 'Appearance', href: '/settings/appearance', description: 'Dark mode, themes' },
        { icon: Globe, label: 'Language', href: '/settings/language', description: 'English, Hindi, etc.' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', href: '/help', description: 'FAQs and guides' },
        { icon: Shield, label: 'Terms & Privacy', href: '/legal', description: 'Legal information' },
      ],
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white p-4 border-b border-[#2f3336] sticky top-0 bg-black z-10">
          Settings
        </h1>

        <div className="p-4">
          {sections.map((section) => (
            <div key={section.title} className="mb-6">
              <h2 className="text-sm font-medium text-[#71767b] uppercase tracking-wider mb-3">
                {section.title}
              </h2>
              <div className="bg-[#16181c] rounded-xl overflow-hidden">
                {section.items.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between p-4 hover:bg-[#1a1a2a] transition-colors ${index !== section.items.length - 1 ? 'border-b border-[#2f3336]' : ''
                      }`}
                  >
                    <div className="flex items-center space-x-4">
                      <item.icon className="h-5 w-5 text-[#71767b]" />
                      <div>
                        <p className="text-white font-medium">{item.label}</p>
                        <p className="text-sm text-[#71767b]">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#71767b]" />
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Account Info */}
          <div className="bg-[#16181c] rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-[#71767b] mb-3">Account Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#71767b]">Email</span>
                <span className="text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71767b]">Role</span>
                <span className="text-white capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71767b]">Member since</span>
                <span className="text-white">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-4 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
