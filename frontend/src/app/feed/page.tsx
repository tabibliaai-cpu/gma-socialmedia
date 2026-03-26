'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import CreatePost from '@/components/CreatePost';
import Feed from '@/components/Feed';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Sparkles, Users } from 'lucide-react';

export default function FeedPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('for-you');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1d9bf0]"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-[#1d9bf0]/30"></div>
          </div>
          <p className="text-[#71767b] text-sm animate-pulse">Loading your feed...</p>
        </div>
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
        <div className="sticky top-0 bg-black/60 backdrop-blur-xl z-10 border-b border-white/5">
          <h1 className="px-5 py-3 text-xl font-bold bg-gradient-to-r from-white to-dark-400 bg-clip-text text-transparent">Home</h1>
          <div className="flex relative">
            <button
              onClick={() => setActiveTab('for-you')}
              className={`flex-1 py-4 text-center font-medium transition-all duration-300 relative ${activeTab === 'for-you' ? 'text-white' : 'text-dark-400 hover:bg-white/5'
                }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className={`w-4 h-4 transition-all duration-300 ${activeTab === 'for-you' ? 'text-primary drop-shadow-[0_0_8px_rgba(120,86,255,0.5)]' : ''}`} />
                For you
              </span>
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-4 text-center font-medium transition-all duration-300 relative ${activeTab === 'following' ? 'text-white' : 'text-dark-400 hover:bg-white/5'
                }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Users className={`w-4 h-4 transition-all duration-300 ${activeTab === 'following' ? 'text-primary drop-shadow-[0_0_8px_rgba(120,86,255,0.5)]' : ''}`} />
                Following
              </span>
            </button>

            {/* Animated sliding indicator */}
            <div
              className={`absolute bottom-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(120,86,255,0.5)] ${activeTab === 'for-you' ? 'left-0 w-1/2' : 'left-1/2 w-1/2'
                }`}
            />
          </div>
        </div>

        {/* Create Post with animation */}
        <div className={`p-4 pb-2 transition-all duration-500 relative z-0 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <CreatePost />
        </div>

        {/* Feed with staggered animation */}
        <div className={`transition-all duration-700 delay-150 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <Feed key={activeTab} tab={activeTab} />
        </div>
      </div>
    </MainLayout>
  );
}
