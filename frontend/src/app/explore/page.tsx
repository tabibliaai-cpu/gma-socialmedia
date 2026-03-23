'use client';

import { useEffect, useState } from 'react';
import { searchAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Search, User, FileText, Hash, ExternalLink, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'users' | 'posts' | 'articles'>('all');
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      const { data } = await searchAPI.getTrending();
      setTrending(data);
    } catch (error) {
      console.error('Failed to load trending:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const { data } = await searchAPI.search(query, searchType);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users, posts, articles..."
              className="w-full pl-12 pr-4 py-4 bg-dark-200 border border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-500 text-lg"
            />
          </div>

          {/* Search Type Tabs */}
          <div className="flex space-x-2 mt-4">
            {['all', 'users', 'posts', 'articles'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSearchType(type as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  searchType === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-200 text-gray-400 hover:text-white'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </form>

        {/* Trending */}
        {!results && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Hash className="h-5 w-5 mr-2" />
              Trending
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trending.map((tag, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(tag.hashtag);
                    handleSearch({ preventDefault: () => {} } as any);
                  }}
                  className="bg-dark-200 rounded-xl p-4 hover:bg-dark-100 transition-colors text-left"
                >
                  <p className="font-semibold text-white">{tag.hashtag}</p>
                  <p className="text-sm text-gray-400">{tag.count} posts</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : results && (
          <div className="space-y-8">
            {/* Users */}
            {results.internal?.users?.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Users
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.internal.users.map((user: any) => (
                    <Link
                      key={user.user_id}
                      href={`/profile/${user.username}`}
                      className="bg-dark-200 rounded-xl p-4 flex items-center space-x-3 hover:bg-dark-100 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          user.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.username}</p>
                        <p className="text-sm text-gray-400 line-clamp-1">{user.bio}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Posts */}
            {results.internal?.posts?.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Posts
                </h3>
                <div className="space-y-4">
                  {results.internal.posts.map((post: any) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="block bg-dark-200 rounded-xl p-4 hover:bg-dark-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm text-gray-400">{post.profiles?.username}</span>
                        <span className="text-xs text-gray-500">{formatDate(post.created_at)}</span>
                      </div>
                      <p className="text-white line-clamp-2">{post.caption}</p>
                      {post.factCheck && (
                        <div className={`flex items-center space-x-2 mt-2 text-xs ${
                          post.factCheck.status === 'verified' ? 'text-green-400' :
                          post.factCheck.status === 'misleading' ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          {post.factCheck.status === 'verified' ? (
                            <Shield className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          <span>{post.factCheck.status}</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Articles */}
            {results.internal?.articles?.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-white mb-4">Articles</h3>
                <div className="space-y-4">
                  {results.internal.articles.map((article: any) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.id}`}
                      className="block bg-dark-200 rounded-xl p-4 hover:bg-dark-100 transition-colors"
                    >
                      <h4 className="font-semibold text-white">{article.title}</h4>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {article.content?.substring(0, 150)}...
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        {article.is_paid && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                            ₹{article.price}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* External Results */}
            {results.external?.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Web Results
                </h3>
                <div className="space-y-3">
                  {results.external.map((item: any, i: number) => (
                    <a
                      key={i}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-dark-200 rounded-xl p-4 hover:bg-dark-100 transition-colors"
                    >
                      <p className="text-sm text-primary-400 mb-1">{item.link}</p>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{item.snippet}</p>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* No Results */}
            {!results.internal?.users?.length && 
             !results.internal?.posts?.length && 
             !results.internal?.articles?.length && (
              <div className="text-center py-12 text-gray-500">
                No results found for "{query}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
