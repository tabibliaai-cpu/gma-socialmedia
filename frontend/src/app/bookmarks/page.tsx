'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { postsAPI } from '@/lib/api';
import { Heart, MessageCircle, Repeat2, Share, Bookmark, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const { data } = await postsAPI.getBookmarks();
      setBookmarks(data || []);
    } catch (error) {
      // If bookmarks endpoint doesn't exist, show empty state
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (postId: string) => {
    try {
      await postsAPI.unbookmark(postId);
      setBookmarks(bookmarks.filter(b => b.id !== postId));
      toast.success('Removed from bookmarks');
    } catch (error) {
      toast.error('Failed to remove bookmark');
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    try {
      const isUTC = dateString.endsWith('Z') || dateString.includes('+') || dateString.includes('GMT');
      const safeDateString = isUTC ? dateString : `${dateString}Z`;

      const date = new Date(safeDateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMs < 0 || isNaN(diffMs)) return 'just now';
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-[#2f3336] px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Bookmarks</h1>
            {bookmarks.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Remove all bookmarks?')) {
                    setBookmarks([]);
                    toast.success('All bookmarks removed');
                  }
                }}
                className="text-sm text-[#71767b] hover:text-[#1d9bf0]"
              >
                Clear all
              </button>
            )}
          </div>
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
            <Link href="/feed" className="text-[#1d9bf0] hover:underline mt-4 inline-block">
              Go to feed
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#2f3336]">
            {bookmarks.map((post) => (
              <article key={post.id} className="p-4 hover:bg-[#181836] transition-colors">
                <div className="flex gap-3">
                  <Link href={`/profile/${post.profiles?.username || 'user'}`} className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] flex items-center justify-center text-white font-bold">
                      {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-sm flex-wrap">
                      <Link href={`/profile/${post.profiles?.username || 'user'}`} className="font-bold text-white hover:underline">
                        {post.profiles?.username || 'User'}
                      </Link>
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
                      <button className="flex items-center gap-1 text-[#71767b] hover:text-green-500 group">
                        <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                          <Repeat2 className="w-4 h-4" />
                        </div>
                      </button>
                      <button className="flex items-center gap-1 text-[#71767b] hover:text-pink-500 group">
                        <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
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
                        onClick={() => handleRemoveBookmark(post.id)}
                        className="flex items-center gap-1 text-[#1d9bf0] hover:text-red-400 group"
                        title="Remove from bookmarks"
                      >
                        <div className="p-2 rounded-full bg-[#1d9bf0]/10 group-hover:bg-red-500/10 transition-colors">
                          <Bookmark className="w-4 h-4 fill-[#1d9bf0] group-hover:fill-red-400" />
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
