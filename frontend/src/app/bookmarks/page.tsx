'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { postsAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Bookmark, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface BookmarkItem {
  id: string;
  post_id: string;
  created_at: string;
  posts: {
    id: string;
    caption: string;
    media_url: string;
    created_at: string;
    profiles: {
      username: string;
      avatar_url: string;
    };
  };
}

export default function BookmarksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadBookmarks();
  }, [user, router]);

  const loadBookmarks = async () => {
    try {
      // For now, we'll use an empty array since we haven't created bookmarks API
      // In production, you'd call: await bookmarksAPI.getAll()
      setBookmarks([]);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      // await bookmarksAPI.remove(id);
      setBookmarks(bookmarks.filter(b => b.id !== id));
      toast.success('Removed from bookmarks');
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <h1 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Bookmark className="h-6 w-6 mr-2" />
          Bookmarks
        </h1>

        {bookmarks.length === 0 ? (
          <div className="bg-dark-200 rounded-xl p-12 text-center">
            <Bookmark className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No bookmarks yet</h3>
            <p className="text-gray-400 mb-4">Save posts to read them later</p>
            <Link
              href="/feed"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Browse Feed
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="bg-dark-200 rounded-xl p-4 group">
                <div className="flex items-start space-x-3">
                  <Link
                    href={`/profile/${bookmark.posts.profiles.username}`}
                    className="flex-shrink-0"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white overflow-hidden">
                      {bookmark.posts.profiles.avatar_url ? (
                        <img src={bookmark.posts.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        bookmark.posts.profiles.username.charAt(0).toUpperCase()
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/post/${bookmark.posts.id}`}>
                      <p className="font-semibold text-white hover:underline">
                        {bookmark.posts.profiles.username}
                      </p>
                      <p className="text-gray-300 line-clamp-2 mt-1">
                        {bookmark.posts.caption}
                      </p>
                      {bookmark.posts.media_url && (
                        <img
                          src={bookmark.posts.media_url}
                          alt=""
                          className="mt-2 h-32 rounded-lg object-cover"
                        />
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Saved on {formatDate(bookmark.created_at)}
                      </p>
                    </Link>
                  </div>
                  <button
                    onClick={() => handleRemove(bookmark.id)}
                    className="p-2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
