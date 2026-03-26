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
      // Reload the page to show new post
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const charCount = caption.length;
  const charLimit = 280;

  return (
    <div className="glass-panel rounded-2xl p-5 mb-2 border border-white/5 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent shrink-0 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(120,86,255,0.3)]">
            {user?.profile?.username?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-1">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's happening?"
              className="w-full bg-transparent border-none text-xl text-white placeholder-dark-500 focus:outline-none resize-none min-h-[60px]"
              rows={2}
              maxLength={charLimit}
            />

            {showMediaInput && (
              <div className="mt-3 flex items-center gap-2 animate-fade-in">
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Paste image or video URL"
                  className="flex-1 px-4 py-2.5 glass-input rounded-xl text-white text-sm placeholder-dark-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMediaUrl('');
                    setShowMediaInput(false);
                  }}
                  className="p-2.5 text-dark-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pl-16">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowMediaInput(true)}
              className="p-2.5 text-primary hover:bg-primary/20 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(120,86,255,0.2)]"
              title="Add image"
            >
              <Image className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowMediaInput(true)}
              className="p-2.5 text-primary hover:bg-primary/20 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(120,86,255,0.2)]"
              title="Add video"
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2.5 text-primary hover:bg-primary/20 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(120,86,255,0.2)]"
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2.5 text-primary hover:bg-primary/20 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(120,86,255,0.2)]"
              title="Schedule"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2.5 text-primary hover:bg-primary/20 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(120,86,255,0.2)]"
              title="Add location"
            >
              <MapPin className="w-5 h-5" />
            </button>

            {/* Character counter */}
            {caption.length > 0 && (
              <span className={`ml-3 text-sm font-medium ${charCount > charLimit - 20 ? 'text-warning' : 'text-dark-400'}`}>
                {charLimit - charCount}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (!caption.trim() && !mediaUrl)}
            className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_20px_rgba(120,86,255,0.4)] disabled:opacity-50 disabled:hover:shadow-none disabled:cursor-not-allowed text-white font-bold rounded-full transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 text-sm"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
