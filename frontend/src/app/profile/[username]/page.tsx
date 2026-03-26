'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI, postsAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { MapPin, Link as LinkIcon, Calendar, MessageCircle, Share2, Verified, QrCode } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

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
                  <Link href="/settings/profile" className="px-5 py-2 border border-white/10 text-white font-bold rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95">
                    Edit profile
                  </Link>
                </>
              ) : (
                <>
                  {canMessage && (
                    <button
                      onClick={startChat}
                      className="p-2 border border-white/10 rounded-full hover:bg-white/10 text-white transition-all duration-300 hover:scale-105"
                    >
                      <MessageCircle className="w-5 h-5" />
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
        <div className="flex border-b border-white/5">
          <button className="flex-1 py-4 text-white font-bold relative hover:bg-white/5 transition-colors">
            Posts
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_10px_rgba(120,86,255,0.5)]"></div>
          </button>
          <button className="flex-1 py-4 text-dark-400 font-bold hover:bg-white/5 transition-colors">Replies</button>
          <button className="flex-1 py-4 text-dark-400 font-bold hover:bg-white/5 transition-colors">Media</button>
        </div>

        {/* Timeline Content */}
        <div className="divide-y divide-white/5 pb-10">
          {posts.length === 0 ? (
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
          )}
        </div>
      </div>
    </div>
  );
}
