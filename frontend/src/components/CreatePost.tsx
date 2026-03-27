'use client';

import { useState, useRef } from 'react';
import { postsAPI } from '@/lib/api';
import { Image as ImageIcon, Video, Smile, Calendar, MapPin, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CreatePostProps {
  onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setMediaUrl(base64);
        setMediaType('image');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to process image');
    } finally {
      setUploadingImage(false);
    }
  };

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
        media_type: mediaType || 'image',
      });
      toast.success('Post created!');
      setCaption('');
      setMediaUrl('');
      setMediaType(null);
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
    <div className="p-4 md:p-5 mb-2 border-b border-[#2f3336] bg-transparent">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 md:gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent shrink-0 flex items-center justify-center text-white font-bold transition-transform duration-300 hover:scale-105">
            {user?.profile?.avatar_url ? (
              <img src={user.profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.profile?.username?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-2">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What is happening?!"
              className="w-full bg-transparent border-none text-xl text-white placeholder-[#71767b] focus:outline-none resize-none min-h-[50px]"
              rows={2}
              maxLength={charLimit}
            />

            {/* Image Preview */}
            {mediaUrl && (
              <div className="relative mt-3 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95">
                <img src={mediaUrl} alt="" className="w-full max-h-[400px] object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setMediaUrl('');
                    setMediaType(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black rounded-full text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {uploadingImage && (
              <div className="mt-3 flex items-center gap-2 text-primary">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Processing image...</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 md:pl-16 pl-15">
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="p-2.5 text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors disabled:opacity-50"
              title="Add Image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => toast('Video upload coming soon!')}
              className="p-2.5 text-primary hover:bg-primary/20 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(120,86,255,0.2)]"
              title="Add video"
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2.5 text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors"
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2.5 text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors"
              title="Schedule"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2.5 text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors"
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
            className="px-5 py-2 min-w-[80px] bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 disabled:hover:bg-[#1d9bf0] text-white font-bold rounded-full transition-colors text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 mx-auto animate-spin" /> : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
