'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import { User, Camera, Save, Loader2, ArrowLeft, Upload, X, Check, Briefcase, MapPin, Link as LinkIcon } from 'lucide-react';
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
  const [coverUrl, setCoverUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [profession, setProfession] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.profile) {
      setUsername(user.profile.username || '');
      setBio(user.profile.bio || '');
      setAvatarUrl(user.profile.avatar_url || '');
      setDisplayName(user.profile?.name || user.username || '');
    }
    if (user) {
      setCoverUrl(user.profile?.cover_url || '');
      setWebsite(user.profile?.website || '');
      setLocation(user.profile?.location || '');
      setProfession(user.profile?.profession || '');
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    if (type === 'avatar') setUploadingAvatar(true);
    else setUploadingCover(true);

    try {
      // Convert to base64 for demo (in production, use proper file upload to S3/Supabase storage)
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        
        // For now, store as base64 URL
        // In production, you'd upload to cloud storage and get a URL
        if (type === 'avatar') {
          setAvatarUrl(base64);
        } else {
          setCoverUrl(base64);
        }
        
        toast.success(`${type === 'avatar' ? 'Avatar' : 'Cover'} uploaded! Save to apply.`);
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
        bio,
        name: displayName,
        avatar_url: avatarUrl || undefined,
        cover_url: coverUrl || undefined,
        website,
        location,
        profession,
      });
      await refreshProfile();
      toast.success('Profile updated!');
      
      // Redirect if username changed
      if (username !== user?.profile?.username) {
        router.push(`/profile/${username}`);
      }
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

        {/* Cover Image */}
        <div className="h-52 bg-gradient-to-r from-[#1d9bf0]/30 to-[#7856ff]/30 relative group">
          {coverUrl && (
            <img src={coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <button 
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="p-3 bg-black/50 rounded-full hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
            >
              {uploadingCover ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
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
              onChange={(e) => handleImageUpload(e, 'avatar')}
              className="hidden"
            />
          </div>
        </div>

        <form className="p-4 space-y-6">
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

          {/* Profession */}
          <div>
            <label className="block text-sm font-medium text-[#71767b] mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Profession
            </label>
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="e.g. Software Engineer, Designer, Creator"
              className="w-full px-4 py-3 bg-black border border-[#2f3336] rounded-xl text-white focus:outline-none focus:border-[#1d9bf0] transition-colors"
              maxLength={100}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-[#71767b] mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className="w-full px-4 py-3 bg-black border border-[#2f3336] rounded-xl text-white focus:outline-none focus:border-[#1d9bf0] transition-colors"
              maxLength={100}
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-[#71767b] mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
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

          {/* Avatar URL (for direct URL input) */}
          <details className="group">
            <summary className="cursor-pointer text-sm text-[#71767b] hover:text-white transition-colors">
              Advanced: Enter image URLs directly
            </summary>
            <div className="mt-4 space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-[#71767b] mb-2">
                  Cover URL
                </label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full px-4 py-3 bg-black border border-[#2f3336] rounded-xl text-white focus:outline-none focus:border-[#1d9bf0] transition-colors"
                />
              </div>
            </div>
          </details>
        </form>
      </div>
    </MainLayout>
  );
}
