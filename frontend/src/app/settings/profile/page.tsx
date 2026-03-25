'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import { User, Camera, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (user?.profile) {
      setUsername(user.profile.username || '');
      setBio(user.profile.bio || '');
      setAvatarUrl(user.profile.avatar_url || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersAPI.updateProfile({
        username,
        bio,
        avatar_url: avatarUrl || undefined,
      });
      await refreshProfile();
      toast.success('Profile updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 bg-black z-10 border-b border-[#2f3336] p-4">
          <h1 className="text-xl font-bold text-white">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Avatar */}
          <div className="bg-[#16181c] rounded-xl p-6">
            <div className="flex items-center space-x-6 flex-wrap gap-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    username.charAt(0).toUpperCase() || <User className="h-10 w-10" />
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 p-2 bg-[#1d9bf0] rounded-full text-white hover:bg-[#1a8cd8]"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium mb-2">Profile Photo</p>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Paste image URL..."
                  className="w-full px-4 py-2 bg-black border border-[#2f3336] rounded-lg text-white text-sm focus:outline-none focus:border-[#1d9bf0]"
                />
              </div>
            </div>
          </div>

          {/* Username */}
          <div className="bg-[#16181c] rounded-xl p-6">
            <label className="block text-sm font-medium text-[#71767b] mb-2">
              Username
            </label>
            <div className="flex items-center border-b border-[#2f3336]">
              <span className="text-[#71767b]">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 px-2 py-3 bg-transparent text-white focus:outline-none"
                minLength={3}
                maxLength={50}
                required
              />
            </div>
            <p className="text-xs text-[#71767b] mt-2">
              {username.length}/50 characters
            </p>
          </div>

          {/* Bio */}
          <div className="bg-[#16181c] rounded-xl p-6">
            <label className="block text-sm font-medium text-[#71767b] mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full bg-transparent text-white focus:outline-none resize-none placeholder-[#71767b]"
              maxLength={500}
            />
            <p className="text-xs text-[#71767b] mt-2">
              {bio.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 bg-transparent border border-[#2f3336] text-white rounded-full hover:bg-[#181836] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8] disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
