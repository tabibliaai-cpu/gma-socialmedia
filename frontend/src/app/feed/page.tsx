'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import CreatePost from '@/components/CreatePost';
import Feed from '@/components/Feed';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function FeedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('for-you');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d9bf0]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-[#2f3336]">
          <h1 className="px-4 py-3 text-xl font-bold text-white">Home</h1>
          <div className="flex">
            <button
              onClick={() => setActiveTab('for-you')}
              className={`flex-1 py-4 text-center font-medium transition-colors relative ${
                activeTab === 'for-you' ? 'text-white' : 'text-[#71767b] hover:bg-[#181836]'
              }`}
            >
              For you
              {activeTab === 'for-you' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-4 text-center font-medium transition-colors relative ${
                activeTab === 'following' ? 'text-white' : 'text-[#71767b] hover:bg-[#181836]'
              }`}
            >
              Following
              {activeTab === 'following' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-full"></div>
              )}
            </button>
          </div>
        </div>

        {/* Create Post */}
        <div className="border-b border-[#2f3336] p-4">
          <CreatePost />
        </div>

        {/* Feed */}
        <Feed />
      </div>
    </MainLayout>
  );
}
