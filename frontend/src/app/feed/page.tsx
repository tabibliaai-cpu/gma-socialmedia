'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePostsStore } from '@/store';
import { postsAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Feed from '@/components/Feed';
import CreatePost from '@/components/CreatePost';
import Sidebar from '@/components/Sidebar';

export default function FeedPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { posts, setPosts, setLoading } = usePostsStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const { data } = await postsAPI.getFeed();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <CreatePost onPostCreated={loadFeed} />
            <Feed posts={posts} />
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-dark-200 rounded-xl p-4 sticky top-20">
              <h3 className="font-semibold text-white mb-4">Trending</h3>
              <div className="space-y-3">
                {['#tech', '#startup', '#ai', '#business', '#creator'].map((tag) => (
                  <div key={tag} className="text-primary-400 hover:text-primary-300 cursor-pointer">
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
