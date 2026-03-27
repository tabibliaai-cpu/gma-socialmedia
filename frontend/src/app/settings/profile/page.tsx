'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import { User, Camera, Save, Loader2, ArrowLeft, Check, MapPin, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.profile) {
      setUsername(user.profile.username || '');
      setName(user.profile.name || '');
      setBio(user.profile.bio || '');
      setAvatarUrl(user.profile.avatar_url || '');
      setCoverUrl(user.profile.cover_url || '');
      setWebsite(user.profile.website || '');
      setLocation(user.profile.location || '');
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    if (type === 'avatar') setUploadingAvatar(true);
    else setUploadingCover(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        if (type === 'avatar') {
          setAvatarUrl(base64);
          toast.success('Avatar uploaded! Save to apply.');
        } else {
          setCoverUrl(base64);
          toast.success('Cover photo uploaded! Save to apply.');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      if (type === 'avatar') setUploadingAvatar(false);
      else setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersAPI.updateProfile({
        username,
        name,
        bio,
        location,
        website,
        avatar_url: avatarUrl || undefined,
        cover_url: coverUrl || undefined,
      });
      await refreshProfile();
      toast.success('Profile updated!');
      router.push(`/profile/${username}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto animate-in fade-in duration-200 border-x border-[#2f3336] min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-20 border-b border-[#2f3336] p-4 flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-[#181836] rounded-full transition-colors">
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
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save</>}
          </button>
        </div>

        {/* Cover Image */}
        <div className="h-52 bg-gradient-to-r from-[#1d9bf0]/30 to-[#7856ff]/30 relative group">
          {coverUrl && <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
             <button
                onClick={(e) => { e.preventDefault(); coverInputRef.current?.click(); }}
                disabled={uploadingCover}
                className="p-3 bg-black/60 rounded-full hover:bg-black/80 transition-all text-white backdrop-blur-sm"
              >
                {uploadingCover ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
             </button>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'cover')}
            className="hidden"
          />
        </div>

        {/* Avatar */}
        <div className="px-4 -mt-16 mb-4 relative z-10 flex justify-between items-end">
          <div className="relative inline-block group">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] border-4 border-black flex items-center justify-center text-white text-4xl font-bold overflow-hidden relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                username.charAt(0).toUpperCase() || <User className="h-12 w-12" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.preventDefault(); avatarInputRef.current?.click(); }}
                  disabled={uploadingAvatar}
                  className="p-2 bg-black/60 rounded-full hover:bg-black/80 transition-all text-white backdrop-blur-sm"
                >
                  {uploadingAvatar ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'avatar')}
              className="hidden"
            />
          </div>
        </div>

        <form className="p-4 space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-[#71767b] mb-2">Name</label>
            <div className="flex items-center bg-transparent border border-[#2f3336] rounded-xl focus-within:border-[#1d9bf0] transition-colors overflow-hidden">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
                className="flex-1 px-4 py-3 bg-transparent text-white focus:outline-none"
                maxLength={50}
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-[#71767b] mb-2">Username</label>
            <div className="flex items-center bg-transparent border border-[#2f3336] rounded-xl focus-within:border-[#1d9bf0] transition-colors overflow-hidden">
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
            <label className="block text-sm font-medium text-[#71767b] mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-4 py-3 bg-transparent border border-[#2f3336] rounded-xl text-white focus:outline-none focus:border-[#1d9bf0] resize-none placeholder-[#71767b] transition-colors"
              maxLength={160}
            />
            <p className="text-xs text-[#71767b] mt-1 text-right">{bio.length}/160</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-[#71767b] mb-2">Location</label>
            <div className="flex items-center bg-transparent border border-[#2f3336] rounded-xl focus-within:border-[#1d9bf0] transition-colors overflow-hidden">
              <span className="pl-4 text-[#71767b]"><MapPin className="w-4 h-4" /></span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="flex-1 px-3 py-3 bg-transparent text-white focus:outline-none"
                maxLength={30}
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-[#71767b] mb-2">Website</label>
            <div className="flex items-center bg-transparent border border-[#2f3336] rounded-xl focus-within:border-[#1d9bf0] transition-colors overflow-hidden">
              <span className="pl-4 text-[#71767b]"><LinkIcon className="w-4 h-4" /></span>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://your-website.com"
                className="flex-1 px-3 py-3 bg-transparent text-white focus:outline-none"
                maxLength={100}
              />
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
