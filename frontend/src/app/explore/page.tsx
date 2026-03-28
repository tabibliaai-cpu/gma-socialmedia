'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { searchAPI, usersAPI } from '@/lib/api';
import Link from 'next/link';
import { Search, TrendingUp, User, Hash, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

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

  // NOTE: These are placeholder users - in production these should come from the API
  const suggestedUsers = [
    { username: 'techfounder', name: 'Tech Founder', badge: true, followers: '125K' },
    { username: 'aibuilder', name: 'AI Builder', badge: true, followers: '89K' },
    { username: 'startupguru', name: 'Startup Guru', badge: false, followers: '67K' },
    { username: 'codemaster', name: 'Code Master', badge: false, followers: '45K' },
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

  return (
    <div className="min-h-screen">
      {/* Header with Search */}
      <div className="sticky top-0 z-10 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search"
            className="w-full pl-12 pr-4 py-3 glass-input rounded-full text-white placeholder-dark-500 focus:bg-white/5 focus:ring-1 focus:ring-primary transition-all duration-300"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults(null);
                setShowSearch(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {!showSearch && (
        <div className="flex overflow-x-auto border-b border-white/10 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-4 font-medium whitespace-nowrap relative transition-colors ${
                activeTab === tab.id ? 'text-white' : 'text-dark-400 hover:bg-white/5'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Search Results */}
      {showSearch && (
        <div className="p-4">
          {isSearching ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Users */}
              {searchResults?.internal?.users?.length > 0 && (
                <div>
                  <h3 className="text-white font-bold mb-3">Users</h3>
                  {searchResults.internal.users.map((user: any) => (
                    <Link
                      key={user.username || user.id}
                      href={`/profile/${(user.username || '').toLowerCase()}`}
                      className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                        {user.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-bold">{user.username}</p>
                        <p className="text-dark-400 text-sm">@{user.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* No Results */}
              {(!searchResults || (!searchResults?.internal?.users?.length && !searchResults?.posts?.length)) && (
                <div className="text-center py-8">
                  <p className="text-dark-400">No results for &quot;{searchQuery}&quot;</p>
                  <p className="text-dark-500 text-sm mt-1">Try searching for something else</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      {!showSearch && (
        <div className="divide-y divide-white/5">
          {/* Trending Section */}
          <div className="p-4">
            <h2 className="text-white font-bold text-xl mb-4">Trends for you</h2>
            {trendingTopics[activeTab as keyof typeof trendingTopics]?.map((topic, index) => (
              <button
                key={index}
                onClick={() => handleTagClick(topic.tag)}
                className="w-full px-5 py-4 hover:bg-white/5 transition-all duration-300 text-left border-b border-white/5 group"
              >
                <p className="text-dark-400 text-sm">{topic.category} · Trending</p>
                <p className="text-white font-bold">#{topic.tag}</p>
                <p className="text-dark-400 text-sm">{topic.posts} posts</p>
              </button>
            ))}
          </div>

          {/* Who to Follow Section */}
          <div className="p-4">
            <h2 className="text-white font-bold text-xl mb-4">Who to follow</h2>
            {suggestedUsers.map((user) => (
              <div key={user.username} className="flex items-center justify-between py-3">
                <Link href={`/profile/${user.username}`} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-bold flex items-center gap-1">
                      {user.name}
                      {user.badge && (
                        <span className="text-[#1d9bf0]">✓</span>
                      )}
                    </p>
                    <p className="text-dark-400 text-sm">@{user.username}</p>
                  </div>
                </Link>
                <button
                  onClick={() => toast.success(`Followed @${user.username}`)}
                  className="px-5 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 text-sm transition-transform active:scale-95"
                >
                  Follow
                </button>
              </div>
            ))}
            <button className="mt-2 text-primary hover:underline text-sm">Show more</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        <ExplorePageContent />
      </Suspense>
    </MainLayout>
  );
}
