'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';
import { Shield, Eye, MessageSquare, Search, Lock } from 'lucide-react';

export default function PrivacySettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [privacy, setPrivacy] = useState({
    name_visibility: 'everyone',
    dm_permission: 'everyone',
    search_visibility: 'both'
  });

  useEffect(() => {
    const loadPrivacySettings = async () => {
      try {
        const { data } = await usersAPI.getProfile(); // Assumes getProfile returns user.privacy_settings
        if (data?.privacy_settings) {
          setPrivacy({
            name_visibility: data.privacy_settings.name_visibility || 'everyone',
            dm_permission: data.privacy_settings.dm_permission || 'everyone',
            search_visibility: data.privacy_settings.search_visibility || 'both'
          });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setFetching(false);
      }
    };
    if (user) loadPrivacySettings();
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await usersAPI.updatePrivacy(privacy);
      toast.success('Privacy settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#1d9bf0]"></div></div>;

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-8 border-b border-[#2f3336] pb-4">
          <Shield className="w-8 h-8 text-[#1d9bf0]" />
          <div>
            <h1 className="text-2xl font-bold text-white">Privacy Controls</h1>
            <p className="text-[#71767b]">Manage who can see your information and contact you.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Name Visibility Control */}
          <div className="bg-[#151515] border border-[#2f3336] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-gray-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Real Name Visibility</h3>
                <p className="text-sm text-[#71767b]">Control who can see your real name. If hidden, only your @username is shown.</p>
              </div>
            </div>
            <select
              value={privacy.name_visibility}
              onChange={(e) => setPrivacy({ ...privacy, name_visibility: e.target.value })}
              className="w-full bg-black border border-[#2f3336] text-white rounded-lg px-4 py-3 focus:border-[#1d9bf0] focus:outline-none"
            >
              <option value="everyone">Everyone</option>
              <option value="selected">Selected Users (Followers)</option>
              <option value="none">No One (Hidden)</option>
            </select>
          </div>

          {/* DM Permission Control */}
          <div className="bg-[#151515] border border-[#2f3336] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Direct Messages (DM)</h3>
                <p className="text-sm text-[#71767b]">Choose who is allowed to send you direct messages.</p>
              </div>
            </div>
            <select
              value={privacy.dm_permission}
              onChange={(e) => setPrivacy({ ...privacy, dm_permission: e.target.value })}
              className="w-full bg-black border border-[#2f3336] text-white rounded-lg px-4 py-3 focus:border-[#1d9bf0] focus:outline-none"
            >
              <option value="everyone">Everyone</option>
              <option value="selected">Selected Users</option>
              <option value="none">No One</option>
            </select>
          </div>

          {/* Search Visibility Control */}
          <div className="bg-[#151515] border border-[#2f3336] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-5 h-5 text-gray-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Search Visibility</h3>
                <p className="text-sm text-[#71767b]">Control how people can find your profile in the search system.</p>
              </div>
            </div>
            <select
              value={privacy.search_visibility}
              onChange={(e) => setPrivacy({ ...privacy, search_visibility: e.target.value })}
              className="w-full bg-black border border-[#2f3336] text-white rounded-lg px-4 py-3 focus:border-[#1d9bf0] focus:outline-none"
            >
              <option value="both">Searchable by Username & Profile Name</option>
              <option value="username">Searchable by Username only</option>
              <option value="name">Searchable by Profile Name only</option>
              <option value="hidden">Hidden from Search completely</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Saving...' : <><Lock className="w-5 h-5" /> Save Privacy Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
}
