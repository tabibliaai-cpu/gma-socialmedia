'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postsAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Image, Video, X, Globe, Lock, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreatePostPage() {
  const router = useRouter();
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [visibility, setVisibility] = useState('public');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && !mediaUrl) {
      toast.error('Please add content to your post');
      return;
    }

    setLoading(true);
    try {
      await postsAPI.create({
        caption,
        media_url: mediaUrl || undefined,
        media_type: mediaUrl ? mediaType : undefined,
      });
      toast.success('Post created successfully!');
      router.push('/feed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-dark-200 rounded-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h1 className="text-xl font-bold text-white">Create Post</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            {/* Content */}
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-transparent text-white text-lg placeholder-gray-500 focus:outline-none resize-none"
              rows={6}
            />

            {/* Media Preview */}
            {mediaUrl && (
              <div className="relative mt-4 rounded-xl overflow-hidden">
                {mediaType === 'video' ? (
                  <video src={mediaUrl} controls className="w-full max-h-96" />
                ) : (
                  <img src={mediaUrl} alt="" className="w-full max-h-96 object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => setMediaUrl('')}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Media Input */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setMediaType('image')}
                  className={`p-2 rounded-lg ${mediaType === 'image' ? 'bg-primary-600 text-white' : 'bg-dark-300 text-gray-400'}`}
                >
                  <Image className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className={`p-2 rounded-lg ${mediaType === 'video' ? 'bg-primary-600 text-white' : 'bg-dark-300 text-gray-400'}`}
                >
                  <Video className="h-5 w-5" />
                </button>
              </div>
              
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder={`Paste ${mediaType} URL...`}
                className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Visibility */}
            <div className="mt-4 p-3 bg-dark-300 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Who can see this post?</p>
              <div className="flex space-x-2">
                {[
                  { value: 'public', icon: Globe, label: 'Public' },
                  { value: 'followers', icon: Users, label: 'Followers' },
                  { value: 'private', icon: Lock, label: 'Only me' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setVisibility(option.value)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm ${
                      visibility === option.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-200 text-gray-400 hover:text-white'
                    }`}
                  >
                    <option.icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Character Count */}
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
              <span>{caption.length} / 2000</span>
              {caption.length > 2000 && (
                <span className="text-red-400">Caption too long</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || caption.length > 2000}
              className="w-full mt-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
