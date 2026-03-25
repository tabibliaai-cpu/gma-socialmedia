'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { postsAPI } from '@/lib/api';
import { Heart, MessageCircle, Repeat2, Share, Bookmark } from 'lucide-react';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const { data } = await postsAPI.getFeed();
      setBookmarks(data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-[#2f3336] px-4 py-3">
          <h1 className="text-xl font-bold text-white">Bookmarks</h1>
        </div>

        {/* Bookmarks List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#1d9bf0]"></div>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Bookmark className="w-12 h-12 text-[#71767b] mx-auto mb-4" />
            <p className="text-[#71767b] text-lg">No bookmarks yet</p>
            <p className="text-[#71767b] text-sm mt-2">Save posts for later by tapping the bookmark icon</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2f3336]">
            {bookmarks.map((post) => (
              <article key={post.id} className="p-4 hover:bg-[#181836] transition-colors cursor-pointer">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] shrink-0 flex items-center justify-center text-white font-bold">
                    {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="font-bold text-white">{post.profiles?.username || 'User'}</span>
                      <span className="text-[#71767b]">@{post.profiles?.username || 'user'}</span>
                      <span className="text-[#71767b]">·</span>
                      <span className="text-[#71767b]">{formatTime(post.created_at)}</span>
                    </div>
                    {(post.caption || post.content) && (
                      <p className="text-white mt-1 whitespace-pre-wrap">{post.caption || post.content}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 max-w-md">
                      <button className="flex items-center gap-1 text-[#71767b] hover:text-[#1d9bf0] group">
                        <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{post.comments_count || 0}</span>
                      </button>
                      <button className="flex items-center gap-1 text-[#71767b] hover:text-[#00ba7c] group">
                        <div className="p-2 rounded-full group-hover:bg-[#00ba7c]/10 transition-colors">
                          <Repeat2 className="w-4 h-4" />
                        </div>
                      </button>
                      <button className="flex items-center gap-1 text-[#71767b] hover:text-[#f4212e] group">
                        <div className="p-2 rounded-full group-hover:bg-[#f4212e]/10 transition-colors">
                          <Heart className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{post.likes_count || 0}</span>
                      </button>
                      <button className="flex items-center gap-1 text-[#71767b] hover:text-[#1d9bf0] group">
                        <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                          <Share className="w-4 h-4" />
                        </div>
                      </button>
                      <button 
                        className="flex items-center gap-1 text-[#1d9bf0] hover:text-[#1a8cd8] group"
                        title="Remove bookmark"
                      >
                        <div className="p-2 rounded-full bg-[#1d9bf0]/10 group-hover:bg-[#1d9bf0]/20 transition-colors">
                          <Bookmark className="w-4 h-4 fill-[#1d9bf0]" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
