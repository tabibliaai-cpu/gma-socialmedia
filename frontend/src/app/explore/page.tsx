'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { searchAPI, usersAPI } from '@/lib/api';
import Link from 'next/link';
import { Search, TrendingUp, User, Hash, ArrowLeft } from 'lucide-react';

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('for-you');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const tabs = [
    { id: 'for-you', label: 'For you' },
    { id: 'trending', label: 'Trending' },
    { id: 'news', label: 'News' },
    { id: 'sports', label: 'Sports' },
    { id: 'entertainment', label: 'Entertainment' },
  ];

  const trendingTopics = {
    'for-you': [
      { category: 'Technology', tag: 'AIRevolution', posts: '45.2K' },
      { category: 'Business', tag: 'StartupLife', posts: '32.1K' },
      { category: 'Trending', tag: 'Web3', posts: '28.5K' },
      { category: 'Development', tag: 'OpenSource', posts: '22.8K' },
      { category: 'Innovation', tag: 'FutureOfWork', posts: '18.3K' },
    ],
    'trending': [
      { category: 'Trending', tag: 'GPM', posts: '52.1K' },
      { category: 'Technology', tag: 'AI', posts: '48.9K' },
      { category: 'Business', tag: 'Entrepreneurship', posts: '35.2K' },
      { category: 'Lifestyle', tag: 'RemoteWork', posts: '29.1K' },
      { category: 'Finance', tag: 'CryptoNews', posts: '24.7K' },
    ],
    'news': [
      { category: 'World', tag: 'BreakingNews', posts: '78.2K' },
      { category: 'Politics', tag: 'Elections2026', posts: '45.3K' },
      { category: 'Economy', tag: 'Markets', posts: '38.9K' },
      { category: 'Science', tag: 'ClimateAction', posts: '31.2K' },
      { category: 'Health', tag: 'HealthTech', posts: '26.8K' },
    ],
    'sports': [
      { category: 'Football', tag: 'WorldCup', posts: '92.1K' },
      { category: 'Basketball', tag: 'NBAFinals', posts: '67.4K' },
      { category: 'Cricket', tag: 'IPL2026', posts: '54.2K' },
      { category: 'Tennis', tag: 'GrandSlam', posts: '41.8K' },
      { category: 'Esports', tag: 'GamingTournament', posts: '38.5K' },
    ],
    'entertainment': [
      { category: 'Movies', tag: 'Oscars2026', posts: '65.3K' },
      { category: 'Music', tag: 'Grammys', posts: '52.7K' },
      { category: 'TV', tag: 'StreamingWars', posts: '44.1K' },
      { category: 'Gaming', tag: 'GameAwards', posts: '39.2K' },
      { category: 'Celebrities', tag: 'CelebrityNews', posts: '33.8K' },
    ],
  };

  const suggestedUsers = [
    { username: 'techfounder', name: 'Tech Founder', badge: true, followers: '125K' },
    { username: 'aibuilder', name: 'AI Builder', badge: true, followers: '89K' },
    { username: 'startupguru', name: 'Startup Guru', badge: false, followers: '67K' },
    { username: 'code master', name: 'Code Master', badge: false, followers: '45K' },
  ];

  useEffect(() => {
    const q = searchParams?.get('q');
    if (q) {
      setSearchQuery(q);
      handleSearch(q);
    }
  }, [searchParams]);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      setSearchResults(null);
      setShowSearch(false);
      return;
    }

    setIsSearching(true);
    setShowSearch(true);
    try {
      const { data } = await searchAPI.search(searchTerm);
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ users: [], posts: [], hashtags: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTagClick = (tag: string) => {
    router.push(`/search?tag=${encodeURIComponent(tag)}`);
  };

  const handleFollow = (username: string) => {
    // Toggle follow state - TODO: API integration
    toast.success(`Followed @${username}`);
  };

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Header with Search */}
        <div className="sticky top-0 bg-black z-10">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71767b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search"
                className="w-full pl-12 pr-4 py-3 bg-[#202327] border-none rounded-full text-white placeholder-[#71767b] focus:bg-black focus:ring-1 focus:ring-[#1d9bf0] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults(null);
                    setShowSearch(false);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1d9bf0]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          {!showSearch && (
            <div className="border-b border-[#2f3336] overflow-x-auto">
              <div className="flex min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-4 font-medium whitespace-nowrap relative ${
                      activeTab === tab.id
                        ? 'text-white'
                        : 'text-[#71767b] hover:bg-[#181836]'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {showSearch && (
          <div className="p-4">
            {isSearching ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#1d9bf0]"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Users */}
                {searchResults?.internal?.users?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Users</h3>
                    {searchResults.internal.users.map((user: any) => (
                      <Link
                        key={user.user_id}
                        href={`/profile/${user.username}`}
                        className="flex items-center gap-3 p-3 hover:bg-[#181836] rounded-xl transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] flex items-center justify-center text-white font-bold">
                          {user.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.username}</p>
                          <p className="text-sm text-[#71767b]">@{user.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {(!searchResults || 
                  (!searchResults?.internal?.users?.length && 
                   !searchResults?.posts?.length)) && (
                  <div className="text-center py-8">
                    <p className="text-[#71767b]">No results for "{searchQuery}"</p>
                    <p className="text-sm text-[#71767b] mt-2">Try searching for something else</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        {!showSearch && (
          <div>
            {/* Trending Section */}
            <div>
              <h2 className="px-4 py-3 font-bold text-white text-xl">Trends for you</h2>
              {trendingTopics[activeTab as keyof typeof trendingTopics]?.map((topic, index) => (
                <button
                  key={`${activeTab}-${index}`}
                  onClick={() => handleTagClick(topic.tag)}
                  className="w-full px-4 py-3 hover:bg-[#181836] transition-colors text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-[#71767b]">{topic.category} · Trending</p>
                      <p className="font-bold text-white mt-0.5">#{topic.tag}</p>
                      <p className="text-xs text-[#71767b] mt-0.5">{topic.posts} posts</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Show more options
                      }}
                      className="p-2 text-[#71767b] hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] rounded-full"
                    >
                      ···
                    </button>
                  </div>
                </button>
              ))}
            </div>

            {/* Who to Follow Section */}
            <div className="mt-4">
              <h2 className="px-4 py-3 font-bold text-white text-xl">Who to follow</h2>
              {suggestedUsers.map((user) => (
                <div
                  key={user.username}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#181836] transition-colors"
                >
                  <Link 
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] flex items-center justify-center text-white font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-white">{user.name}</span>
                        {user.badge && (
                          <svg className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0]" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-[#71767b]">@{user.username}</p>
                    </div>
                  </Link>
                  <button 
                    onClick={() => handleFollow(user.username)}
                    className="px-4 py-1.5 bg-white text-black font-bold rounded-full hover:bg-gray-200 text-sm"
                  >
                    Follow
                  </button>
                </div>
              ))}
              <Link
                href="/explore/people"
                className="block px-4 py-4 text-[#1d9bf0] hover:bg-[#181836] transition-colors"
              >
                Show more
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d9bf0]"></div></div>}>
      <ExplorePageContent />
    </Suspense>
  );
}

import toast from 'react-hot-toast';
