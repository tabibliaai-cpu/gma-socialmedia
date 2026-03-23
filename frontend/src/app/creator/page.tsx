'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { postsAPI, articlesAPI, paymentsAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { DollarSign, Eye, Heart, MessageCircle, TrendingUp, FileText, Users, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { formatNumber, formatCurrency } from '@/lib/utils';

interface Stats {
  totalEarnings: number;
  thisMonthEarnings: number;
  totalViews: number;
  totalLikes: number;
  totalFollowers: number;
  postsCount: number;
  articlesCount: number;
}

export default function CreatorPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    totalViews: 0,
    totalLikes: 0,
    totalFollowers: 0,
    postsCount: 0,
    articlesCount: 0,
  });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.role !== 'creator' && user?.role !== 'business') {
      window.location.href = '/feed';
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [postsRes, earningsRes] = await Promise.all([
        postsAPI.getUserPosts(user?.id || ''),
        paymentsAPI.getEarnings(),
      ]);
      
      setRecentPosts(postsRes.data?.slice(0, 5) || []);
      setEarnings(earningsRes.data);
      
      // Calculate stats
      const posts = postsRes.data || [];
      setStats({
        totalEarnings: earningsRes.data?.total || 0,
        thisMonthEarnings: earningsRes.data?.thisMonth || 0,
        totalViews: posts.reduce((sum: number, p: any) => sum + (p.views_count || 0), 0),
        totalLikes: posts.reduce((sum: number, p: any) => sum + (p.likes_count || 0), 0),
        totalFollowers: user?.profile?.followers_count || 0,
        postsCount: posts.length,
        articlesCount: 0,
      });
    } catch (error) {
      console.error('Failed to load creator data:', error);
    } finally {
      setLoading(false);
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
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Creator Dashboard</h1>
            <p className="text-gray-400">Track your content performance and earnings</p>
          </div>
          <div className="flex space-x-2">
            <Link
              href="/create/post"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Post
            </Link>
            <Link
              href="/create/article"
              className="px-4 py-2 bg-dark-200 text-white rounded-lg hover:bg-dark-100"
            >
              Write Article
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <DollarSign className="h-8 w-8 text-green-400" />
              <span className="text-xs text-green-400 flex items-center">
                <ArrowUp className="h-3 w-3" /> 12%
              </span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{formatCurrency(stats.thisMonthEarnings)}</p>
            <p className="text-sm text-gray-400">This Month</p>
          </div>

          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <Eye className="h-8 w-8 text-primary-400" />
              <span className="text-xs text-green-400 flex items-center">
                <ArrowUp className="h-3 w-3" /> 8%
              </span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{formatNumber(stats.totalViews)}</p>
            <p className="text-sm text-gray-400">Total Views</p>
          </div>

          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <Heart className="h-8 w-8 text-red-400" />
              <span className="text-xs text-green-400 flex items-center">
                <ArrowUp className="h-3 w-3" /> 15%
              </span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{formatNumber(stats.totalLikes)}</p>
            <p className="text-sm text-gray-400">Total Likes</p>
          </div>

          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-purple-400" />
              <span className="text-xs text-red-400 flex items-center">
                <ArrowDown className="h-3 w-3" /> 2%
              </span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{formatNumber(stats.totalFollowers)}</p>
            <p className="text-sm text-gray-400">Followers</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <div className="flex space-x-8">
            {['overview', 'content', 'earnings', 'audience'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 font-medium capitalize ${
                  activeTab === tab
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Posts */}
                <div className="bg-dark-200 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-4">Recent Posts</h3>
                  <div className="space-y-3">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                        <div className="flex-1">
                          <p className="text-white line-clamp-1">{post.caption || 'No caption'}</p>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                            <span className="flex items-center">
                              <Heart className="h-3 w-3 mr-1" /> {post.likes_count || 0}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="h-3 w-3 mr-1" /> {post.comments_count || 0}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/post/${post.id}`}
                          className="text-primary-400 text-sm hover:text-primary-300"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Chart Placeholder */}
                <div className="bg-dark-200 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-4">Performance (Last 7 Days)</h3>
                  <div className="h-48 flex items-center justify-center text-gray-500">
                    <TrendingUp className="h-16 w-16 opacity-50" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'earnings' && (
              <div className="bg-dark-200 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-6">Earnings Breakdown</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-700">
                    <span className="text-gray-300">Paid Chat</span>
                    <span className="text-white font-medium">₹{(earnings?.chat || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-700">
                    <span className="text-gray-300">Articles</span>
                    <span className="text-white font-medium">₹{(earnings?.articles || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-700">
                    <span className="text-gray-300">Subscriptions</span>
                    <span className="text-white font-medium">₹{(earnings?.subscriptions || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 text-lg">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-green-400 font-bold">₹{stats.totalEarnings.toLocaleString()}</span>
                  </div>
                </div>

                <button className="w-full mt-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Withdraw Earnings
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="bg-dark-200 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-4">Content Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Posts</span>
                  <span className="text-white">{stats.postsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Articles</span>
                  <span className="text-white">{stats.articlesCount}</span>
                </div>
              </div>
            </div>

            {/* Monetization */}
            <div className="bg-dark-200 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-4">Monetization</h3>
              <div className="space-y-3">
                <Link
                  href="/settings#paid-chat"
                  className="block p-3 bg-dark-300 rounded-lg hover:bg-dark-100 transition-colors"
                >
                  <p className="text-white text-sm font-medium">Paid Chat</p>
                  <p className="text-xs text-gray-400">Set your chat price</p>
                </Link>
                <Link
                  href="/settings#subscriptions"
                  className="block p-3 bg-dark-300 rounded-lg hover:bg-dark-100 transition-colors"
                >
                  <p className="text-white text-sm font-medium">Subscriptions</p>
                  <p className="text-xs text-gray-400">Manage subscription tiers</p>
                </Link>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-primary-100">
                Post consistently and engage with your audience to grow your following!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
