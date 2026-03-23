'use client';

import { useState } from 'react';
import { postsAPI } from '@/lib/api';
import { Image, Video, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMediaInput, setShowMediaInput] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && !mediaUrl) {
      toast.error('Please add some content');
      return;
    }

    setLoading(true);
    try {
      await postsAPI.create({
        caption,
        media_url: mediaUrl || undefined,
        media_type: mediaUrl?.includes('video') ? 'video' : 'image',
      });
      toast.success('Post created!');
      setCaption('');
      setMediaUrl('');
      setShowMediaInput(false);
      onPostCreated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-200 rounded-xl p-4">
      <form onSubmit={handleSubmit}>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full bg-dark-300 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          rows={3}
        />

        {showMediaInput && (
          <div className="mt-3 relative">
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="Paste image or video URL"
              className="w-full bg-dark-300 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={() => {
                setMediaUrl('');
                setShowMediaInput(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowMediaInput(true)}
              className="p-2 text-gray-400 hover:text-primary-400 hover:bg-dark-300 rounded-lg transition-colors"
            >
              <Image className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowMediaInput(true)}
              className="p-2 text-gray-400 hover:text-primary-400 hover:bg-dark-300 rounded-lg transition-colors"
            >
              <Video className="h-5 w-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
