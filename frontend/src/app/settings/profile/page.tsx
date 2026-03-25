'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import { User, Camera, Save, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (user?.profile) {
      setUsername(user.profile.username || '');
      setBio(user.profile.bio || '');
      setAvatarUrl(user.profile.avatar_url || '');
    }
    if (user) {
      setDisplayName(user.profile?.name || user.username || '');
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
        {/* Header */}
        <div className="sticky top-0 bg-black z-10 border-b border-[#2f3336] p-4 flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-[#181836] rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Edit profile</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1.5 bg-white text-black font-bold rounded-full hover:bg-gray-200 disabled:opacity-50 text-sm"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Cover Image */}
        <div className="h-52 bg-gradient-to-r from-[#1d9bf0]/30 to-[#7856ff]/30 relative">
          <div className="absolute inset-0 bg-[#16181c]/50"></div>
          <button className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
            <Camera className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Avatar */}
        <div className="px-4 -mt-16 mb-4 relative z-10">
          <div className="relative inline-block">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] border-4 border-black flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                username.charAt(0).toUpperCase() || <User className="h-12 w-12" />
              )}
            </div>
            <button className="absolute bottom-2 right-2 p-2 bg-black/70 rounded-full hover:bg-black transition-colors">
              <Camera className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        <form className="p-4 space-y-6">
          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-medium text-[#71767b] mb-2">
              Avatar URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-3 bg-black border border-[#2f3336] rounded-xl text-white focus:outline-none focus:border-[#1d9bf0] transition-colors"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-[#71767b] mb-2">
              Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-black border border-[#2f3336] rounded-xl text-white focus:outline-none focus:border-[#1d9bf0] transition-colors"
              maxLength={50}
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-[#71767b] mb-2">
              Username
            </label>
            <div className="flex items-center bg-black border border-[#2f3336] rounded-xl focus-within:border-[#1d9bf0] transition-colors">
              <span className="pl-4 text-[#71767b]">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="flex-1 px-2 py-3 bg-transparent text-white focus:outline-none"
                minLength={3}
                maxLength={30}
                required
              />
            </div>
            <p className="text-xs text-[#71767b] mt-1">
              {username.length}/30 characters • Only lowercase letters, numbers, and underscores
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-[#71767b] mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-4 py-3 bg-black border border-[#2f3336] rounded-xl text-white focus:outline-none focus:border-[#1d9bf0] resize-none placeholder-[#71767b] transition-colors"
              maxLength={500}
            />
            <p className="text-xs text-[#71767b] mt-1 text-right">
              {bio.length}/500
            </p>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-[#71767b] mb-2">
              Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full px-4 py-3 bg-black border border-[#2f3336] rounded-xl text-white focus:outline-none focus:border-[#1d9bf0] transition-colors"
            />
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
