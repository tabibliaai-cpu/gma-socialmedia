'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI, postsAPI, articlesAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { MapPin, Link as LinkIcon, Calendar, MessageCircle, Share2, Verified, QrCode, Settings, Lock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams(); // Using safe hook for Next.js routing
  const targetUsername = params?.username as string;

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (targetUsername) {
      loadProfileAndPosts();
    }
  }, [targetUsername, user?.id]); // Re-run if user context loads late

  const loadProfileAndPosts = async () => {
    try {
      // 1. Load Profile
      const { data: profileData } = await usersAPI.getPublicProfile(targetUsername);
      setProfile(profileData);

      // 2. Check Follow Status
      if (user && user.id !== profileData.user_id) {
        try {
          const { data: followData } = await usersAPI.checkFollow(profileData.user_id);
          setIsFollowing(followData.isFollowing);
        } catch (e) {
          console.log("Follow check skipped");
        }
      }

      // 3. Load User's Timeline Posts
      try {
        const { data: userPosts } = await postsAPI.getUserPosts(profileData.user_id);
        setPosts(userPosts || []);
      } catch (postErr) {
        console.error('Failed to load timeline', postErr);
      }

      // 4. Load User's Articles
      try {
        const { data: userArticles } = await articlesAPI.getByAuthor(profileData.user_id);
        setArticles(userArticles || []);
      } catch (artErr) {
        console.error('Failed to load articles', artErr);
      }

    } catch (error: any) {
      console.error("Profile load error:", error);
      setError(true);
      if (error.response?.status === 404) {
        toast.error('User not found or profile is hidden.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) return toast.error('Please login to follow users');
    try {
      if (isFollowing) {
        await usersAPI.unfollow(profile.user_id);
        setProfile({ ...profile, followers_count: Math.max(0, profile.followers_count - 1) });
      } else {
        await usersAPI.follow(profile.user_id);
        setProfile({ ...profile, followers_count: profile.followers_count + 1 });
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  const handleGenerateShareLink = async () => {
    setGeneratingLink(true);
    try {
      const { data } = await usersAPI.createShareLink();
      const url = `${window.location.origin}/shared/${data.token}`;
      await navigator.clipboard.writeText(url);
      toast.success('Temporary link copied! Expires in 5 minutes.', { duration: 5000 });
    } catch (error) {
      toast.error('Failed to generate share link');
    } finally {
      setGeneratingLink(false);
    }
  };

  const startChat = () => {
    if (!user) return toast.error('Please login to chat');
    router.push(`/chat/new?userId=${profile.user_id}`);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#1d9bf0]"></div></div>;

  // Safe Fallback if the profile couldn't load
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Navbar />
        <h1 className="text-2xl text-white font-bold mb-4">Profile Not Found</h1>
        <p className="text-[#71767b] mb-6">This account doesn't exist or is currently hidden.</p>
        <Link href="/feed" className="px-6 py-2 bg-[#1d9bf0] text-white font-bold rounded-full">Go to Feed</Link>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.user_id;
  const canMessage =
    profile.dm_permission === 'everyone' ||
    (profile.dm_permission === 'selected' && isFollowing) ||
    isOwnProfile;

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-2xl mx-auto border-x border-white/5 bg-black/40 backdrop-blur-3xl min-h-screen">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-primary/20 to-accent/20 w-full relative">
          {profile.cover_url && <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />}
        </div>

        {/* Profile Info */}
        <div className="px-5 pb-5">
          <div className="flex justify-between items-start relative">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full border-4 border-black bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl text-white font-bold -mt-16 relative overflow-hidden shadow-[0_0_20px_rgba(120,86,255,0.4)]">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.username?.charAt(0)?.toUpperCase() || 'U' // Extremely safe fallback
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={handleGenerateShareLink}
                    disabled={generatingLink}
                    className="p-2 border border-white/10 rounded-full hover:bg-white/10 text-white transition-all duration-300 hover:scale-105"
                    title="Generate 5-min Share Link"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                  <Link href="/settings/privacy" className="p-2 border border-white/10 rounded-full hover:bg-white/10 text-white transition-all duration-300 hover:scale-105" title="Privacy Settings">
                    <Settings className="w-5 h-5" />
                  </Link>
                  <Link href="/settings/profile" className="px-5 py-2 border border-white/10 text-white font-bold rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95">
                    Edit profile
                  </Link>
                </>
              ) : (
                <>
                  {canMessage && (
                    <button
                      onClick={startChat}
                      className="px-4 py-2 flex items-center gap-2 border border-white/10 rounded-full hover:bg-white/10 text-white transition-all duration-300 hover:scale-105 font-bold"
                    >
                      <MessageCircle className="w-5 h-5" />
                      {profile.paid_chat_settings?.is_enabled && (
                        <span className="text-sm">₹{profile.paid_chat_settings.price_per_message}</span>
                      )}
                    </button>
                  )}
                  <button
                    onClick={handleFollowToggle}
                    className={`px-6 py-2 font-bold rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${isFollowing
                      ? 'border border-white/10 text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10'
                      : 'bg-white text-black hover:bg-gray-200'
                      }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-1.5">
              {profile.name || profile.username || 'User'}
              {profile.badge_type === 'premium' && (
                <span title="Premium Verified" className="inline-flex drop-shadow-[0_0_5px_rgba(120,86,255,0.5)]">
                  <Verified className="w-6 h-6 text-primary fill-primary" />
                </span>
              )}
              {profile.badge_type === 'business' && (
                <span title="Business Verified" className="inline-flex drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">
                  <Verified className="w-6 h-6 text-warning fill-warning" />
                </span>
              )}
              {profile.affiliates && profile.affiliates.length > 0 && (
                <span title="Affiliate" className="inline-flex drop-shadow-[0_0_5px_rgba(255,215,0,0.5)] bg-warning/10 text-warning text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap align-middle ml-2">
                  🏢 {profile.affiliates[0].label || 'Brand Ambassador'}
                </span>
              )}
            </h1>
            <p className="text-dark-400">@{profile.username || 'unknown'}</p>
          </div>

          {profile.bio && (
            <p className="text-white mt-4 text-base whitespace-pre-wrap">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-x-5 gap-y-3 mt-4 text-dark-400 text-sm font-medium">
            {profile.location && (
              <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{profile.location}</div>
            )}
            {profile.website && (
              <div className="flex items-center gap-1.5"><LinkIcon className="w-4 h-4" /><a href={profile.website} target="_blank" className="text-primary hover:underline">{profile.website?.replace(/^https?:\/\//, '')}</a></div>
            )}
            {profile.created_at && (
              <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            )}
          </div>

          <div className="flex gap-5 mt-5 text-sm">
            <Link href={`/profile/${profile.username}/following`} className="hover:underline">
              <span className="text-white font-bold">{profile.following_count || 0}</span> <span className="text-dark-400">Following</span>
            </Link>
            <Link href={`/profile/${profile.username}/followers`} className="hover:underline">
              <span className="text-white font-bold">{profile.followers_count || 0}</span> <span className="text-dark-400">Followers</span>
            </Link>
          </div>
        </div>

        {/* Timeline Tabs */}
        <div className="flex border-b border-white/5 overflow-x-auto overflow-y-hidden no-scrollbar">
          <button onClick={() => setActiveTab('posts')} className={`px-6 flex-1 py-4 font-bold relative transition-colors ${activeTab === 'posts' ? 'text-white' : 'text-dark-400 hover:bg-white/5'}`}>
            Posts
            {activeTab === 'posts' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_10px_rgba(120,86,255,0.5)]"></div>}
          </button>

          <button onClick={() => setActiveTab('articles')} className={`px-6 flex-1 py-4 font-bold relative transition-colors ${activeTab === 'articles' ? 'text-white' : 'text-dark-400 hover:bg-white/5'}`}>
            Articles
            {activeTab === 'articles' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_10px_rgba(120,86,255,0.5)]"></div>}
          </button>

          {isOwnProfile && profile.role === 'creator' && (
            <button onClick={() => setActiveTab('monetization')} className={`px-6 flex-1 py-4 font-bold relative transition-colors ${activeTab === 'monetization' ? 'text-white' : 'text-dark-400 hover:bg-white/5'}`}>
              Monetization
              {activeTab === 'monetization' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_10px_rgba(120,86,255,0.5)]"></div>}
            </button>
          )}

          {isOwnProfile && profile.role === 'business' && (
            <button onClick={() => setActiveTab('business')} className={`px-6 flex-1 py-4 font-bold relative transition-colors ${activeTab === 'business' ? 'text-white' : 'text-dark-400 hover:bg-white/5'}`}>
              Dashboard
              {activeTab === 'business' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_10px_rgba(120,86,255,0.5)]"></div>}
            </button>
          )}
        </div>

        {/* Timeline Content */}
        <div className="divide-y divide-white/5 pb-10">
          {activeTab === 'posts' && (
            posts.length === 0 ? (
              <div className="text-center py-16">
                <h2 className="text-white text-2xl font-bold">No posts yet</h2>
                <p className="text-dark-400 mt-2 text-lg">When they post, their timeline will show up here.</p>
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="p-6 text-white hover:bg-white/5 transition-all duration-300">
                  <p className="whitespace-pre-wrap text-[1.05rem]">{post.caption}</p>
                  {post.media_url && (
                    <img src={post.media_url} alt="Post media" className="mt-4 rounded-2xl border border-white/10 max-h-[500px] w-full object-cover shadow-[0_5px_15px_rgba(0,0,0,0.2)]" />
                  )}
                </div>
              ))
            )
          )}

          {activeTab === 'articles' && (
            articles.length === 0 ? (
              <div className="text-center py-16">
                <h2 className="text-white text-2xl font-bold">No articles yet</h2>
                <p className="text-dark-400 mt-2 text-lg">When they publish articles, they'll appear here.</p>
              </div>
            ) : (
              articles.map(article => (
                <div key={article.id} className="p-6 text-white hover:bg-white/5 transition-all duration-300 flex justify-between items-center cursor-pointer" onClick={() => router.push(`/articles/${article.id}`)}>
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                      {article.title}
                      {article.price > 0 && <span className="inline-flex items-center gap-1 bg-primary/20 text-primary text-xs px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(120,86,255,0.3)]"><Lock className="w-3 h-3" /> ₹{article.price}</span>}
                    </h3>
                    <p className="text-dark-400 mt-1">{new Date(article.created_at).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-dark-400" />
                </div>
              ))
            )
          )}

          {activeTab === 'monetization' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">Creator Monetization</h2>
              <div className="glass-panel p-6 rounded-2xl mb-4 border border-white/10 relative overflow-hidden group hover:border-primary/50 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full mix-blend-screen filter blur-[40px] group-hover:bg-primary/20 transition-all duration-500"></div>
                <h3 className="font-bold text-white text-lg relative z-10">Paid Chat Settings</h3>
                <p className="text-dark-400 text-sm mb-5 relative z-10 w-3/4">Set your price per message to filter your DMs and earn from interactions.</p>
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-white font-medium text-lg bg-black/50 px-4 py-2 rounded-xl border border-white/5">
                    Price: <span className="text-primary font-bold">₹{profile.paid_chat_settings?.price_per_message || 0}</span>
                  </span>
                  <Link href="/settings/monetization" className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_15px_rgba(120,86,255,0.4)] text-white rounded-full font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5">
                    Edit Settings
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">Business Dashboard</h2>
              <div className="glass-panel p-6 rounded-2xl mb-6 border border-white/10 relative overflow-hidden group hover:border-primary/50 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full mix-blend-screen filter blur-[40px] group-hover:bg-primary/20 transition-all duration-500"></div>
                <h3 className="font-bold text-white text-lg relative z-10">Affiliates & Brand Ambassadors</h3>
                <p className="text-dark-400 text-sm mb-5 relative z-10 w-3/4">Manage users who represent your brand and track their performance.</p>
                <Link href="/settings/affiliates" className="inline-block px-5 py-2.5 bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_15px_rgba(120,86,255,0.4)] text-white rounded-full font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 relative z-10">
                  Manage Affiliates
                </Link>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-warning/30 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full mix-blend-screen filter blur-[40px] group-hover:bg-warning/20 transition-all duration-500"></div>
                <h3 className="font-bold text-white text-lg relative z-10">CRM & Leads</h3>
                <p className="text-dark-400 text-sm mb-5 relative z-10 w-3/4">Access your leads dashboard and monitor advertising campaigns.</p>
                <Link href="/crm" className="inline-block px-5 py-2.5 border border-white/20 hover:bg-white/10 text-white rounded-full font-bold text-sm transition-all duration-300 relative z-10">
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
