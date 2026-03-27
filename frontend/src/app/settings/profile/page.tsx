'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import { User, Camera, Save, Loader2, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.profile) {
      setUsername(user.profile.username || '');
      setBio(user.profile.bio || '');
      setAvatarUrl(user.profile.avatar_url || '');
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setAvatarUrl(base64);
        toast.success('Avatar uploaded! Save to apply.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

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

      // Redirect back to profile page to show changes
      router.push(`/profile/${username}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-[#2f3336] p-4 flex items-center gap-6">
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
            className="px-4 py-1.5 bg-white text-black font-bold rounded-full hover:bg-gray-200 disabled:opacity-50 text-sm flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>

        {/* Cover Image Placeholder to keep the UI layout without the actual upload capability */}
        <div className="h-52 bg-gradient-to-r from-[#1d9bf0]/30 to-[#7856ff]/30 relative group">
          <div className="absolute inset-0 flex items-center justify-center opacity-50">
          </div>
        </div>

        {/* Avatar */}
        <div className="px-4 -mt-16 mb-4 relative z-10">
          <div className="relative inline-block group">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] border-4 border-black flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                username.charAt(0).toUpperCase() || <User className="h-12 w-12" />
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-2 right-2 p-2 bg-black/70 rounded-full hover:bg-black transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
            >
              {uploadingAvatar ? (
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              ) : (
                <Camera className="h-4 w-4 text-white" />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        <form className="p-4 space-y-6">
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
        </form>
      </div>
    </MainLayout>
  );
}
