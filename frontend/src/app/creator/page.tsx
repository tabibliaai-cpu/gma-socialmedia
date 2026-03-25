'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { postsAPI, paymentsAPI } from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import { DollarSign, Eye, Heart, MessageCircle, TrendingUp, Users, ArrowUp, ArrowDown, Lock } from 'lucide-react';
import Link from 'next/link';

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
  const router = useRouter();
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
    if (user && user.role !== 'creator' && user.role !== 'business') {
      // Show access denied instead of silent redirect
      setLoading(false);
      return;
    }
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [postsRes, earningsRes] = await Promise.all([
        postsAPI.getUserPosts(user?.id || ''),
        paymentsAPI.getEarnings().catch(() => ({ data: null })),
      ]);
      
      setRecentPosts(postsRes.data?.slice(0, 5) || []);
      setEarnings(earningsRes.data);
      
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

  // Show access denied for non-creator users
  if (!loading && user && user.role !== 'creator' && user.role !== 'business') {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-[#16181c] rounded-xl p-8 text-center">
            <Lock className="h-16 w-16 text-[#71767b] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Creator Dashboard</h1>
            <p className="text-[#71767b] mb-6">
              This feature is only available for creator and business accounts.
            </p>
            <p className="text-[#71767b] mb-6">
              Upgrade your account to access analytics, earnings, and creator tools.
            </p>
            <button
              onClick={() => router.push('/settings/profile')}
              className="px-6 py-3 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8]"
            >
              Upgrade Account
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d9bf0]"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black z-10 border-b border-[#2f3336] p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">Creator Dashboard</h1>
              <p className="text-[#71767b] text-sm">Track your content performance and earnings</p>
            </div>
            <div className="flex space-x-2">
              <Link
                href="/create/post"
                className="px-4 py-2 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8] text-sm"
              >
                Create Post
              </Link>
              <Link
                href="/create/article"
                className="px-4 py-2 bg-transparent border border-[#2f3336] text-white rounded-full hover:bg-[#181836] text-sm"
              >
                Write Article
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#16181c] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <DollarSign className="h-8 w-8 text-green-400" />
                <span className="text-xs text-green-400 flex items-center">
                  <ArrowUp className="h-3 w-3" /> 12%
                </span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">₹{stats.thisMonthEarnings.toLocaleString()}</p>
              <p className="text-sm text-[#71767b]">This Month</p>
            </div>

            <div className="bg-[#16181c] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <Eye className="h-8 w-8 text-[#1d9bf0]" />
                <span className="text-xs text-green-400 flex items-center">
                  <ArrowUp className="h-3 w-3" /> 8%
                </span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">{stats.totalViews.toLocaleString()}</p>
              <p className="text-sm text-[#71767b]">Total Views</p>
            </div>

            <div className="bg-[#16181c] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <Heart className="h-8 w-8 text-pink-500" />
                <span className="text-xs text-green-400 flex items-center">
                  <ArrowUp className="h-3 w-3" /> 15%
                </span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">{stats.totalLikes.toLocaleString()}</p>
              <p className="text-sm text-[#71767b]">Total Likes</p>
            </div>

            <div className="bg-[#16181c] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <Users className="h-8 w-8 text-purple-500" />
                <span className="text-xs text-red-400 flex items-center">
                  <ArrowDown className="h-3 w-3" /> 2%
                </span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">{stats.totalFollowers.toLocaleString()}</p>
              <p className="text-sm text-[#71767b]">Followers</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[#2f3336] mb-6 overflow-x-auto">
            <div className="flex space-x-8 min-w-max">
              {['overview', 'content', 'earnings', 'audience'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 font-medium capitalize ${
                    activeTab === tab
                      ? 'text-[#1d9bf0] border-b-2 border-[#1d9bf0]'
                      : 'text-[#71767b] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Recent Posts */}
                  <div className="bg-[#16181c] rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-4">Recent Posts</h3>
                    <div className="space-y-3">
                      {recentPosts.length > 0 ? recentPosts.map((post) => (
                        <div key={post.id} className="flex items-center justify-between py-2 border-b border-[#2f3336] last:border-0">
                          <div className="flex-1">
                            <p className="text-white line-clamp-1">{post.caption || post.content || 'No caption'}</p>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-[#71767b]">
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
                            className="text-[#1d9bf0] text-sm hover:underline"
                          >
                            View
                          </Link>
                        </div>
                      )) : (
                        <p className="text-[#71767b] text-center py-4">No posts yet. Create your first post!</p>
                      )}
                    </div>
                  </div>

                  {/* Performance Chart Placeholder */}
                  <div className="bg-[#16181c] rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-4">Performance (Last 7 Days)</h3>
                    <div className="h-48 flex items-center justify-center text-[#71767b]">
                      <TrendingUp className="h-16 w-16 opacity-50" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'earnings' && (
                <div className="bg-[#16181c] rounded-xl p-6">
                  <h3 className="font-semibold text-white mb-6">Earnings Breakdown</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-[#2f3336]">
                      <span className="text-[#71767b]">Paid Chat</span>
                      <span className="text-white font-medium">₹{(earnings?.chat || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#2f3336]">
                      <span className="text-[#71767b]">Articles</span>
                      <span className="text-white font-medium">₹{(earnings?.articles || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#2f3336]">
                      <span className="text-[#71767b]">Subscriptions</span>
                      <span className="text-white font-medium">₹{(earnings?.subscriptions || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-lg">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-green-400 font-bold">₹{stats.totalEarnings.toLocaleString()}</span>
                    </div>
                  </div>

                  <button className="w-full mt-6 py-3 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8]">
                    Withdraw Earnings
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="bg-[#16181c] rounded-xl p-4">
                <h3 className="font-semibold text-white mb-4">Content Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#71767b]">Posts</span>
                    <span className="text-white">{stats.postsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71767b]">Articles</span>
                    <span className="text-white">{stats.articlesCount}</span>
                  </div>
                </div>
              </div>

              {/* Monetization */}
              <div className="bg-[#16181c] rounded-xl p-4">
                <h3 className="font-semibold text-white mb-4">Monetization</h3>
                <div className="space-y-3">
                  <Link
                    href="/settings#paid-chat"
                    className="block p-3 bg-black rounded-lg hover:bg-[#181836] transition-colors"
                  >
                    <p className="text-white text-sm font-medium">Paid Chat</p>
                    <p className="text-xs text-[#71767b]">Set your chat price</p>
                  </Link>
                  <Link
                    href="/settings#subscriptions"
                    className="block p-3 bg-black rounded-lg hover:bg-[#181836] transition-colors"
                  >
                    <p className="text-white text-sm font-medium">Subscriptions</p>
                    <p className="text-xs text-[#71767b]">Manage subscription tiers</p>
                  </Link>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">💡 Pro Tip</h3>
                <p className="text-sm text-white/90">
                  Post consistently and engage with your audience to grow your following!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
