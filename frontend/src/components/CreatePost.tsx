'use client';

import { useState } from 'react';
import { postsAPI } from '@/lib/api';
import { Image, Video, Smile, Calendar, MapPin, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CreatePostProps {
  onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
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
      onPostCreated?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-50 border border-dark-100 rounded-2xl overflow-hidden">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 p-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent shrink-0 flex items-center justify-center text-white font-bold">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's happening?"
              className="w-full bg-transparent border-none text-xl text-white placeholder-dark-500 focus:outline-none resize-none min-h-[80px]"
              rows={2}
            />

            {showMediaInput && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Paste image or video URL"
                  className="flex-1 px-4 py-2 bg-dark-100 border border-dark-200 rounded-lg text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMediaUrl('');
                    setShowMediaInput(false);
                  }}
                  className="p-2 text-dark-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowMediaInput(true)}
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Add image"
            >
              <Image className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowMediaInput(true)}
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Add video"
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Schedule"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Add location"
            >
              <MapPin className="w-5 h-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || (!caption.trim() && !mediaUrl)}
            className="px-5 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full transition-all text-sm"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
