'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { postsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Image, Video, Smile, Calendar, MapPin, X, Globe, Users, Lock } from 'lucide-react';

export default function CreatePostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [loading, setLoading] = useState(false);
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  const handleSubmit = async () => {
    if (!caption.trim() && !mediaUrl) {
      toast.error('Please add some content');
      return;
    }

    setLoading(true);
    try {
      await postsAPI.create({
        caption,
        media_url: mediaUrl || undefined,
        media_type: mediaType,
        visibility,
      });
      toast.success('Post created!');
      router.push('/feed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const charCount = caption.length;
  const charLimit = 280;

  const visibilityOptions = [
    { value: 'public', label: 'Everyone', icon: Globe, desc: 'Anyone can see' },
    { value: 'followers', label: 'Followers', icon: Users, desc: 'Only your followers' },
    { value: 'private', label: 'Private', icon: Lock, desc: 'Only mentioned users' },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-16 max-w-2xl mx-auto">
        <div className="flex items-center justify-between p-4 border-b border-dark-100">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-dark-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (!caption.trim() && !mediaUrl) || charCount > charLimit}
            className="px-5 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full transition-colors"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent shrink-0 flex items-center justify-center text-white font-bold">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* Visibility */}
              <div className="relative mb-3">
                <button
                  onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                  className="flex items-center gap-1 text-primary text-sm font-medium hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Everyone
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showVisibilityMenu && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-dark-50 border border-dark-100 rounded-2xl shadow-lg overflow-hidden z-10">
                    {visibilityOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setVisibility(option.value as any);
                          setShowVisibilityMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 hover:bg-dark-100 transition-colors ${
                          visibility === option.value ? 'bg-dark-100' : ''
                        }`}
                      >
                        <option.icon className="w-5 h-5 text-white" />
                        <div className="text-left">
                          <p className="text-white font-medium">{option.label}</p>
                          <p className="text-dark-500 text-xs">{option.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Text Area */}
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's happening?"
                className="w-full bg-transparent border-none text-xl text-white placeholder-dark-500 focus:outline-none resize-none min-h-[120px]"
                maxLength={charLimit + 50}
              />

              {/* Media Input */}
              {showMediaInput && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="Paste image or video URL"
                    className="flex-1 px-4 py-2.5 bg-dark-100 border border-dark-200 rounded-xl text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary transition-colors"
                  />
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as any)}
                    className="px-3 py-2.5 bg-dark-100 border border-dark-200 rounded-xl text-white text-sm focus:outline-none"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              )}

              {/* Preview */}
              {mediaUrl && (
                <div className="mt-3 relative rounded-2xl overflow-hidden border border-dark-100">
                  {mediaType === 'video' ? (
                    <video src={mediaUrl} controls className="w-full max-h-80 object-cover" />
                  ) : (
                    <img src={mediaUrl} alt="" className="w-full max-h-80 object-cover" />
                  )}
                  <button
                    onClick={() => {
                      setMediaUrl('');
                      setShowMediaInput(false);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-dark-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowMediaInput(true)}
                className="p-2.5 text-primary hover:bg-primary/10 rounded-full transition-colors"
              >
                <Image className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setShowMediaInput(true);
                  setMediaType('video');
                }}
                className="p-2.5 text-primary hover:bg-primary/10 rounded-full transition-colors"
              >
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2.5 text-primary hover:bg-primary/10 rounded-full transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button className="p-2.5 text-primary hover:bg-primary/10 rounded-full transition-colors">
                <Calendar className="w-5 h-5" />
              </button>
              <button className="p-2.5 text-primary hover:bg-primary/10 rounded-full transition-colors">
                <MapPin className="w-5 h-5" />
              </button>
            </div>

            <div className={`text-sm font-medium ${charCount > charLimit ? 'text-danger' : charCount > charLimit - 20 ? 'text-warning' : 'text-dark-500'}`}>
              {charCount > charLimit - 20 && `${charLimit - charCount}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
