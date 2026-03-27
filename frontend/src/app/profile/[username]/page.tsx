'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI, articlesAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Feed from '@/components/Feed';
import {
  MapPin, Link as LinkIcon, Calendar, MessageCircle,
  Verified, QrCode, Settings, Lock, ChevronRight, ArrowLeft,
  Grid3X3, List
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const targetUsername = (params?.username as string || '').toLowerCase();

  const [profile, setProfile] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  /** Toggle between Instagram-style grid and list view for posts */
  const [postsGridView, setPostsGridView] = useState(true);

  useEffect(() => {
    if (targetUsername) loadProfile();
  }, [targetUsername, user?.id]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: profileData } = await usersAPI.getPublicProfile(targetUsername);
      setProfile(profileData);

      if (user && user.id !== profileData.user_id) {
        try {
          const { data: followData } = await usersAPI.checkFollow(profileData.user_id);
          setIsFollowing(followData.isFollowing);
        } catch { /* silent */ }
      }

      try {
        const { data: arts } = await articlesAPI.getByAuthor(profileData.user_id);
        setArticles(arts || []);
      } catch { /* silent */ }

    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Profile not found';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) return toast.error('Login to follow users');
    try {
      if (isFollowing) {
        await usersAPI.unfollow(profile.user_id);
        setProfile((p: any) => ({ ...p, followers_count: Math.max(0, (p.followers_count || 1) - 1) }));
      } else {
        await usersAPI.follow(profile.user_id);
        setProfile((p: any) => ({ ...p, followers_count: (p.followers_count || 0) + 1 }));
      }
      setIsFollowing(f => !f);
    } catch { toast.error('Failed to update follow status'); }
  };

  const handleShare = async () => {
    setGeneratingLink(true);
    try {
      const { data } = await usersAPI.createShareLink();
      const url = `${window.location.origin}/shared/${data.token}`;
      await navigator.clipboard.writeText(url);
      toast.success('Link copied! Expires in 5 minutes.');
    } catch { toast.error('Failed to generate share link'); }
    finally { setGeneratingLink(false); }
  };

  /* ─── Loading ─── */
  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-t-2 border-[#1d9bf0] rounded-full animate-spin" />
    </div>
  );

  /* ─── Error / Not Found ─── */
  if (error || !profile) return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <h1 className="text-2xl font-extrabold text-white">This account doesn't exist</h1>
        <p className="text-[#71767b] text-[15px]">Try searching for another.</p>
        <button onClick={() => router.back()} className="mt-2 px-5 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
          Go back
        </button>
      </div>
    </div>
  );

  const isOwnProfile = user?.id === profile.user_id;
  const canMessage = profile.dm_permission === 'everyone' ||
    (profile.dm_permission === 'selected' && isFollowing) || isOwnProfile;

  const displayName = profile.display_name || profile.name || profile.username || 'User';

  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'articles', label: 'Articles' },
    ...(isOwnProfile && profile.role === 'creator' ? [{ id: 'monetization', label: 'Monetization' }] : []),
    ...(isOwnProfile && profile.role === 'business' ? [{ id: 'business', label: 'Dashboard' }] : []),
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Main column */}
      <div className="max-w-[600px] mx-auto border-x border-[#2f3336] min-h-screen pt-[53px]">

        {/* Back button row */}
        <div className="sticky top-[53px] z-10 bg-black/80 backdrop-blur-md px-4 py-2 flex items-center gap-6 border-b border-[#2f3336]">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-[17px] font-extrabold text-white leading-tight">{displayName}</h2>
            <p className="text-[13px] text-[#71767b]">{profile.posts_count || 0} posts</p>
          </div>
        </div>

        {/* Cover */}
        <div className="h-[200px] bg-[#333639] relative overflow-hidden">
          {profile.cover_url
            ? <img src={profile.cover_url} alt="cover" className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-[#1e2a3b] to-[#0d1117]" />
          }
        </div>

        {/* Avatar + Actions row */}
        <div className="px-4 flex justify-between items-end -mt-[52px] mb-3">
          <div className="w-[104px] h-[104px] rounded-full border-4 border-black bg-[#333639] overflow-hidden flex items-center justify-center text-4xl font-bold text-white flex-shrink-0">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              : <span>{displayName.charAt(0).toUpperCase()}</span>
            }
          </div>

          <div className="flex items-center gap-2 mt-[60px]">
            {isOwnProfile ? (
              <>
                <button onClick={handleShare} disabled={generatingLink}
                  className="p-2 border border-[#536471] rounded-full hover:bg-white/10 transition-colors text-white" title="Share profile link">
                  <QrCode className="w-5 h-5" />
                </button>
                <Link href="/settings/privacy"
                  className="p-2 border border-[#536471] rounded-full hover:bg-white/10 transition-colors text-white" title="Privacy Settings">
                  <Settings className="w-5 h-5" />
                </Link>
                <Link href="/settings/profile"
                  className="px-4 py-[7px] border border-[#536471] text-white text-[15px] font-bold rounded-full hover:bg-white/10 transition-colors">
                  Edit profile
                </Link>
              </>
            ) : (
              <>
                {canMessage && (
                  <button onClick={() => {
                    if (!user) return toast.error('Login to chat');
                    router.push(`/chat/new?userId=${profile.user_id}`);
                  }}
                    className="p-2 border border-[#536471] rounded-full hover:bg-white/10 transition-colors text-white">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                )}
                <button onClick={handleFollowToggle}
                  className={`px-4 py-[7px] text-[15px] font-bold rounded-full transition-colors ${
                    isFollowing
                      ? 'border border-[#536471] text-white hover:border-red-500 hover:text-red-400 hover:bg-red-500/10'
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}>
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile info */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1 className="text-[20px] font-extrabold text-white">{displayName}</h1>
            {profile.badge_type === 'premium' && (
              <span title="Premium Verified"><Verified className="w-5 h-5 text-[#1d9bf0] fill-[#1d9bf0]" /></span>
            )}
            {profile.badge_type === 'business' && (
              <span title="Business Verified"><Verified className="w-5 h-5 text-yellow-400 fill-yellow-400" /></span>
            )}
            {profile.affiliates?.length > 0 && (
              <span className="text-xs font-bold bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-full">
                🏢 {profile.affiliates[0].label || 'Brand Ambassador'}
              </span>
            )}
          </div>
          <p className="text-[#71767b] text-[15px] mt-0.5">@{profile.username}</p>

          {profile.bio && (
            <p className="text-[#e7e9ea] text-[15px] mt-3 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[#71767b] text-[14px]">
            {profile.location && (
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.location}</span>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-[#1d9bf0] hover:underline">
                <LinkIcon className="w-4 h-4" />{profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {profile.created_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>

          <div className="flex gap-5 mt-3 text-[14px]">
            <Link href={`/profile/${profile.username}/following`} className="hover:underline text-white">
              <span className="font-bold">{profile.following_count || 0}</span>
              <span className="text-[#71767b] ml-1">Following</span>
            </Link>
            <Link href={`/profile/${profile.username}/followers`} className="hover:underline text-white">
              <span className="font-bold">{profile.followers_count || 0}</span>
              <span className="text-[#71767b] ml-1">Followers</span>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2f3336]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-[15px] font-bold relative transition-colors hover:bg-white/[0.03] ${
                activeTab === tab.id ? 'text-white' : 'text-[#71767b]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-16 rounded-full bg-[#1d9bf0]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-black">

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <>
              {/* Grid / List toggle */}
              <div className="flex justify-end items-center gap-1 px-4 py-2 border-b border-[#2f3336]">
                <button
                  onClick={() => setPostsGridView(true)}
                  title="Grid view"
                  className={`p-2 rounded-full transition-colors ${
                    postsGridView
                      ? 'text-[#1d9bf0] bg-[#1d9bf0]/10'
                      : 'text-[#71767b] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPostsGridView(false)}
                  title="List view"
                  className={`p-2 rounded-full transition-colors ${
                    !postsGridView
                      ? 'text-[#1d9bf0] bg-[#1d9bf0]/10'
                      : 'text-[#71767b] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <Feed userId={profile.user_id} gridView={postsGridView} />
            </>
          )}

          {/* Articles Tab */}
          {activeTab === 'articles' && (
            articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <h2 className="text-[24px] font-extrabold text-white mb-2">No articles yet</h2>
                <p className="text-[#71767b] text-[15px]">Articles will show up here when published.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#2f3336]">
                {articles.map(article => (
                  <div
                    key={article.id}
                    className="px-4 py-4 hover:bg-white/[0.03] cursor-pointer transition-colors flex justify-between items-center gap-3"
                    onClick={() => router.push(`/articles/${article.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[17px] font-bold text-[#e7e9ea] flex items-center gap-2 truncate">
                        {article.title}
                        {article.price > 0 && (
                          <span className="flex-shrink-0 inline-flex items-center gap-1 bg-[#1d9bf0]/20 text-[#1d9bf0] text-xs px-2 py-0.5 rounded-full">
                            <Lock className="w-3 h-3" />₹{article.price}
                          </span>
                        )}
                      </h3>
                      <p className="text-[#71767b] text-[13px] mt-0.5">
                        {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#71767b] flex-shrink-0" />
                  </div>
                ))}
              </div>
            )
          )}

          {/* Monetization Tab (Creator only) */}
          {activeTab === 'monetization' && (
            <div className="p-4">
              <h2 className="text-[20px] font-extrabold text-white mb-4">Creator Monetization</h2>
              <div className="border border-[#2f3336] rounded-2xl p-5">
                <h3 className="font-bold text-white text-[17px] mb-1">Paid Chat Settings</h3>
                <p className="text-[#71767b] text-[14px] mb-4">Set a price per message to filter DMs and earn from interactions.</p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">
                    Price: <span className="text-[#1d9bf0] font-bold">₹{profile.paid_chat_settings?.price_per_message || 0}</span>
                  </span>
                  <Link href="/settings/monetization"
                    className="px-4 py-2 bg-white text-black font-bold text-[14px] rounded-full hover:bg-gray-200 transition-colors">
                    Edit Settings
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Business Dashboard Tab */}
          {activeTab === 'business' && (
            <div className="p-4 flex flex-col gap-4">
              <h2 className="text-[20px] font-extrabold text-white">Business Dashboard</h2>
              <div className="border border-[#2f3336] rounded-2xl p-5">
                <h3 className="font-bold text-white text-[17px] mb-1">Affiliates & Brand Ambassadors</h3>
                <p className="text-[#71767b] text-[14px] mb-4">Manage users who represent your brand.</p>
                <Link href="/settings/affiliates"
                  className="inline-block px-4 py-2 bg-white text-black font-bold text-[14px] rounded-full hover:bg-gray-200 transition-colors">
                  Manage Affiliates
                </Link>
              </div>
              <div className="border border-[#2f3336] rounded-2xl p-5">
                <h3 className="font-bold text-white text-[17px] mb-1">CRM & Leads</h3>
                <p className="text-[#71767b] text-[14px] mb-4">Access leads dashboard and advertising campaigns.</p>
                <Link href="/crm"
                  className="inline-block px-4 py-2 border border-[#536471] text-white font-bold text-[14px] rounded-full hover:bg-white/10 transition-colors">
                  Open CRM
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
