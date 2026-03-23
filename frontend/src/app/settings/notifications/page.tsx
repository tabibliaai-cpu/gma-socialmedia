'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Bell, MessageCircle, UserPlus, Heart, Mail, Megaphone, Smartphone, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const notificationTypes = [
  { id: 'messages', icon: MessageCircle, label: 'Messages', description: 'New direct messages' },
  { id: 'follows', icon: UserPlus, label: 'New Followers', description: 'When someone follows you' },
  { id: 'likes', icon: Heart, label: 'Likes', description: 'When someone likes your posts' },
  { id: 'comments', icon: MessageCircle, label: 'Comments', description: 'Comments on your posts' },
  { id: 'mentions', icon: Mail, label: 'Mentions', description: 'When someone mentions you' },
  { id: 'marketing', icon: Megaphone, label: 'Marketing', description: 'News and updates' },
];

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<Record<string, { push: boolean; email: boolean; inApp: boolean }>>({});

  const toggleSetting = (type: string, channel: 'push' | 'email' | 'inApp') => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: !prev[type]?.[channel],
      },
    }));
  };

  const handleSave = () => {
    toast.success('Notification settings saved!');
  };

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Bell className="h-6 w-6 mr-2" />
          Notification Settings
        </h1>

        {/* Push Notifications */}
        <div className="bg-dark-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Smartphone className="h-5 w-5 text-primary-400" />
            <h2 className="font-semibold text-white">Push Notifications</h2>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            Receive notifications on your device even when the app is closed.
          </p>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Enable Push Notifications
          </button>
        </div>

        {/* Notification Types */}
        <div className="bg-dark-200 rounded-xl overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-semibold text-white">What to notify</h2>
          </div>

          {notificationTypes.map((type, index) => (
            <div
              key={type.id}
              className={`p-4 ${index !== notificationTypes.length - 1 ? 'border-b border-gray-700' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <type.icon className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-white font-medium">{type.label}</p>
                    <p className="text-sm text-gray-500">{type.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[type.id]?.push ?? true}
                      onChange={() => toggleSetting(type.id, 'push')}
                      className="w-4 h-4 rounded border-gray-600 bg-dark-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs text-gray-400">Push</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[type.id]?.email ?? true}
                      onChange={() => toggleSetting(type.id, 'email')}
                      className="w-4 h-4 rounded border-gray-600 bg-dark-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs text-gray-400">Email</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[type.id]?.inApp ?? true}
                      onChange={() => toggleSetting(type.id, 'inApp')}
                      className="w-4 h-4 rounded border-gray-600 bg-dark-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs text-gray-400">In-App</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Email Digest */}
        <div className="bg-dark-200 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-white mb-4">Email Digest</h2>
          <div className="space-y-3">
            {['Real-time', 'Daily', 'Weekly', 'Never'].map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="digest"
                  value={option.toLowerCase()}
                  className="w-4 h-4 border-gray-600 bg-dark-300 text-primary-600 focus:ring-primary-500"
                  defaultChecked={option === 'Daily'}
                />
                <span className="text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 flex items-center justify-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
}
