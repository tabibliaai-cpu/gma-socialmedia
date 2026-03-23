'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Save, Eye, EyeOff, Lock, Search, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  
  // Profile settings
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  
  // Privacy settings
  const [nameVisibility, setNameVisibility] = useState('everyone');
  const [dmPermission, setDmPermission] = useState('everyone');
  const [searchVisibility, setSearchVisibility] = useState('both');
  
  // Paid chat settings
  const [paidChatEnabled, setPaidChatEnabled] = useState(false);
  const [pricePerMessage, setPricePerMessage] = useState(0);

  useEffect(() => {
    if (user) {
      setUsername(user.profile?.username || '');
      setBio(user.profile?.bio || '');
      setNameVisibility(user.privacy_settings?.name_visibility || 'everyone');
      setDmPermission(user.privacy_settings?.dm_permission || 'everyone');
      setSearchVisibility(user.privacy_settings?.search_visibility || 'both');
      setPaidChatEnabled(user.paid_chat_settings?.is_enabled || false);
      setPricePerMessage(user.paid_chat_settings?.price_per_message || 0);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await usersAPI.updateProfile({ username, bio });
      await refreshProfile();
      toast.success('Profile updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    setLoading(true);
    try {
      await usersAPI.updatePrivacy({
        name_visibility: nameVisibility,
        dm_permission: dmPermission,
        search_visibility: searchVisibility,
      });
      toast.success('Privacy settings updated!');
    } catch (error) {
      toast.error('Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: Save },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-dark-200 rounded-xl p-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:bg-dark-300 hover:text-white'
                }`}
              >
                <section.icon className="h-5 w-5" />
                <span>{section.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="md:col-span-3 bg-dark-200 rounded-xl p-6">
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Profile Settings</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Privacy Settings</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name Visibility
                  </label>
                  <select
                    value={nameVisibility}
                    onChange={(e) => setNameVisibility(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="selected">Selected</option>
                    <option value="none">No one</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    DM Permission
                  </label>
                  <select
                    value={dmPermission}
                    onChange={(e) => setDmPermission(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                  >
                    <option value="everyone">Everyone can message</option>
                    <option value="selected">Only selected</option>
                    <option value="none">No one</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Search Visibility
                  </label>
                  <select
                    value={searchVisibility}
                    onChange={(e) => setSearchVisibility(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                  >
                    <option value="both">Username and Name</option>
                    <option value="username">Username only</option>
                    <option value="name">Name only</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>

                {/* Paid Chat Settings (for creators) */}
                {(user?.role === 'creator' || user?.role === 'business') && (
                  <div className="pt-6 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Paid Chat</h3>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300">Enable Paid Chat</span>
                      <button
                        onClick={() => setPaidChatEnabled(!paidChatEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          paidChatEnabled ? 'bg-primary-600' : 'bg-gray-700'
                        }`}
                      >
                        <div className={`h-5 w-5 bg-white rounded-full transform transition-transform ${
                          paidChatEnabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>

                    {paidChatEnabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Price per message (₹)
                        </label>
                        <input
                          type="number"
                          value={pricePerMessage}
                          onChange={(e) => setPricePerMessage(Number(e.target.value))}
                          min={1}
                          className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                        />
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleSavePrivacy}
                  disabled={loading}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Privacy Settings'}
                </button>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
                
                {[
                  { label: 'Messages', key: 'messages' },
                  { label: 'Follows', key: 'follows' },
                  { label: 'Likes', key: 'likes' },
                  { label: 'Comments', key: 'comments' },
                  { label: 'Payments', key: 'payments' },
                  { label: 'Marketing', key: 'marketing' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-700">
                    <span className="text-gray-300">{item.label}</span>
                    <button className="w-12 h-6 rounded-full bg-primary-600">
                      <div className="h-5 w-5 bg-white rounded-full transform translate-x-6" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
