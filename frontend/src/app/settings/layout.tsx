'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Lock, User, Bell, Shield, Palette, Globe, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SettingsLayout() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

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
        { icon: Lock, label: 'Privacy & Security', href: '/settings', description: 'Manage privacy settings' },
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
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              {section.title}
            </h2>
            <div className="bg-dark-200 rounded-xl overflow-hidden">
              {section.items.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between p-4 hover:bg-dark-300 transition-colors ${
                    index !== section.items.length - 1 ? 'border-b border-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <item.icon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Account Info */}
        <div className="bg-dark-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Account Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Role</span>
              <span className="text-white capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Member since</span>
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
  );
}
