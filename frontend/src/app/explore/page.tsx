'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';
import { searchAPI } from '@/lib/api';

export default function ExplorePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const trending = [
    { category: 'Technology · Trending', tag: '#AIRevolution', posts: '45.2K' },
    { category: 'Business · Trending', tag: '#StartupLife', posts: '32.1K' },
    { category: 'Trending', tag: '#Web3', posts: '28.5K' },
    { category: 'Technology · Trending', tag: '#OpenSource', posts: '21.3K' },
    { category: 'Design · Trending', tag: '#UIDesign', posts: '18.7K' },
  ];

  const suggestions = [
    { id: 1, username: 'techfounder', name: 'Tech Founder', verified: true, bio: 'Building the future' },
    { id: 2, username: 'aibuilder', name: 'AI Builder', verified: true, bio: 'AI enthusiast & developer' },
    { id: 3, username: 'designpro', name: 'Design Pro', verified: false, bio: 'Creating beautiful experiences' },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await searchAPI.search(searchQuery);
      setSearchResults(data?.users || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Search Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 p-4 border-b border-[#2f3336]">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71767b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-12 pr-4 py-3 bg-[#202327] border-none rounded-full text-white placeholder-[#71767b] focus:bg-black focus:ring-1 focus:ring-[#1d9bf0] transition-all"
              />
            </div>
          </form>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#2f3336]">
          <nav className="flex">
            {['For you', 'Trending', 'News', 'Sports', 'Entertainment'].map((tab, i) => (
              <button
                key={tab}
                className={`flex-1 py-4 text-center font-medium transition-colors relative ${
                  i === 0 ? 'text-white' : 'text-[#71767b] hover:bg-[#181836] hover:text-white'
                }`}
              >
                {tab}
                {i === 0 && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-full"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Search Results or Trending */}
        {searchResults.length > 0 ? (
          <div className="divide-y divide-[#2f3336]">
            {searchResults.map((result: any) => (
              <div key={result.id} className="p-4 hover:bg-[#181836] cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] flex items-center justify-center text-white font-bold">
                    {result.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-white">{result.username}</p>
                    <p className="text-[#71767b] text-sm">@{result.username}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-[#2f3336]">
            {trending.map((item, i) => (
              <div key={i} className="p-4 hover:bg-[#181836] cursor-pointer transition-colors">
                <p className="text-xs text-[#71767b]">{item.category}</p>
                <p className="font-bold text-white mt-0.5">{item.tag}</p>
                <p className="text-xs text-[#71767b] mt-0.5">{item.posts} posts</p>
              </div>
            ))}
          </div>
        )}

        {/* Who to Follow */}
        <div className="p-4">
          <h2 className="text-xl font-bold text-white mb-4">Who to follow</h2>
          <div className="divide-y divide-[#2f3336]">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] flex items-center justify-center text-white font-bold">
                    {suggestion.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white flex items-center gap-1">
                      {suggestion.name}
                      {suggestion.verified && (
                        <svg className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0]" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      )}
                    </p>
                    <p className="text-[#71767b] text-sm">@{suggestion.username}</p>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-white hover:bg-gray-200 text-black font-bold rounded-full text-sm transition-colors">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
