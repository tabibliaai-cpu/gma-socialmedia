'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('profile');

  const sections = [
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'account', label: 'Account', icon: 'shield' },
    { id: 'security', label: 'Security and account access', icon: 'lock' },
    { id: 'privacy', label: 'Privacy and safety', icon: 'eye' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'appearance', label: 'Display', icon: 'sun' },
    { id: 'billing', label: 'Subscriptions', icon: 'credit-card' },
  ];

  const renderIcon = (icon: string) => {
    const className = 'w-5 h-5';
    switch (icon) {
      case 'user':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
      case 'shield':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
      case 'lock':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
      case 'eye':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
      case 'bell':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
      case 'sun':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
      case 'credit-card':
        return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-16 max-w-7xl mx-auto px-4">
        <div className="flex gap-4">
          {/* Sidebar */}
          <aside className="w-64 shrink-0 py-4">
            <div className="sticky top-20">
              <h1 className="text-xl font-bold text-white mb-4">Settings</h1>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-dark-100 text-white'
                        : 'text-dark-500 hover:bg-dark-50 hover:text-white'
                    }`}
                  >
                    {renderIcon(section.icon)}
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>

              <hr className="border-dark-100 my-4" />

              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-danger hover:bg-dark-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Log out</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 py-4 border-x border-dark-100">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                {sections.find(s => s.id === activeSection)?.label || 'Settings'}
              </h2>

              {activeSection === 'profile' && <ProfileSettings user={user} />}
              {activeSection === 'account' && <AccountSettings user={user} />}
              {activeSection === 'privacy' && <PrivacySettings />}
              {activeSection === 'notifications' && <NotificationSettings />}
              {activeSection === 'appearance' && <AppearanceSettings />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({ user }: { user: any }) {
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await usersAPI.updateProfile({ bio });
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div>
        <label className="block text-sm font-medium text-dark-600 mb-3">Profile photo</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
            {username[0]?.toUpperCase() || 'U'}
          </div>
          <button className="px-4 py-2 border border-dark-200 text-white font-medium rounded-full hover:bg-dark-100 transition-colors">
            Change photo
          </button>
        </div>
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-dark-600 mb-2">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 bg-dark-100 border border-dark-200 rounded-xl text-white focus:border-primary focus:ring-0"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-dark-600 mb-2">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={160}
          placeholder="Tell us about yourself"
          className="w-full px-4 py-3 bg-dark-100 border border-dark-200 rounded-xl text-white placeholder-dark-500 focus:border-primary focus:ring-0 resize-none"
        />
        <p className="text-dark-500 text-sm mt-1">{bio.length}/160</p>
      </div>

      <button
        onClick={saveProfile}
        disabled={saving}
        className="px-6 py-2.5 bg-white hover:bg-gray-100 disabled:opacity-50 text-black font-bold rounded-full transition-colors"
      >
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </div>
  );
}

function AccountSettings({ user }: { user: any }) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-dark-50 border border-dark-100 rounded-xl">
        <h3 className="font-medium text-white">Email</h3>
        <p className="text-dark-500 text-sm mt-1">{user?.email || 'Not set'}</p>
      </div>
      <div className="p-4 bg-dark-50 border border-dark-100 rounded-xl">
        <h3 className="font-medium text-white">Account created</h3>
        <p className="text-dark-500 text-sm mt-1">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
      </div>
      <div className="p-4 bg-dark-50 border border-dark-100 rounded-xl">
        <h3 className="font-medium text-white">Account type</h3>
        <p className="text-dark-500 text-sm mt-1 capitalize">{user?.role || 'User'}</p>
      </div>
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="space-y-4">
      {[
        { title: 'Private account', desc: 'Only approved followers can see your posts' },
        { title: 'Allow DMs from everyone', desc: 'Anyone can send you direct messages' },
        { title: 'Show online status', desc: 'Others can see when you\'re online' },
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-dark-50 border border-dark-100 rounded-xl">
          <div>
            <h3 className="font-medium text-white">{item.title}</h3>
            <p className="text-dark-500 text-sm">{item.desc}</p>
          </div>
          <button className="w-12 h-6 bg-dark-200 rounded-full relative">
            <div className="w-5 h-5 bg-dark-400 rounded-full absolute left-0.5 top-0.5"></div>
          </button>
        </div>
      ))}
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-4">
      {[
        { title: 'Push notifications', desc: 'Receive push notifications' },
        { title: 'Email notifications', desc: 'Receive email updates' },
        { title: 'Message notifications', desc: 'Notify when you receive a new message' },
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-dark-50 border border-dark-100 rounded-xl">
          <div>
            <h3 className="font-medium text-white">{item.title}</h3>
            <p className="text-dark-500 text-sm">{item.desc}</p>
          </div>
          <button className="w-12 h-6 bg-primary rounded-full relative">
            <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
          </button>
        </div>
      ))}
    </div>
  );
}

function AppearanceSettings() {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-dark-50 border border-dark-100 rounded-xl">
        <h3 className="font-medium text-white mb-3">Theme</h3>
        <div className="flex gap-3">
          <button className="flex-1 p-4 bg-black border-2 border-primary rounded-xl text-center">
            <p className="text-white font-medium">Dark</p>
          </button>
          <button className="flex-1 p-4 bg-dark-100 border border-dark-200 rounded-xl text-center opacity-50">
            <p className="text-dark-500 font-medium">Light</p>
          </button>
          <button className="flex-1 p-4 bg-dark-100 border border-dark-200 rounded-xl text-center opacity-50">
            <p className="text-dark-500 font-medium">System</p>
          </button>
        </div>
      </div>
    </div>
  );
}
