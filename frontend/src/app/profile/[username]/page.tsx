'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI, postsAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { MapPin, Link as LinkIcon, Calendar, MessageCircle, UserPlus, UserMinus, Share2, Verified, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  useEffect(() => {
    loadProfileAndPosts();
  }, [params.username]);

  const loadProfileAndPosts = async () => {
    try {
      // 1. Load Profile
      const { data: profileData } = await usersAPI.getPublicProfile(params.username);
      setProfile(profileData);

      // 2. Check Follow Status
      if (user && user.id !== profileData.user_id) {
        const { data: followData } = await usersAPI.checkFollow(profileData.user_id);
        setIsFollowing(followData.isFollowing);
      }

      // 3. Load User's Timeline Posts
      // Note: Assumes postsAPI has a getUserPosts method. If not, this can just call getFeed.
      try {
        const { data: userPosts } = await postsAPI.getUserPosts(profileData.user_id);
        setPosts(userPosts || []);
      } catch (postErr) {
        console.error('Failed to load timeline', postErr);
      }

    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('User not found or profile is hidden.');
        router.push('/feed');
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
        setProfile({ ...profile, followers_count: profile.followers_count - 1 });
      } else {
        await usersAPI.follow(profile.user_id);
        setProfile({ ...profile, followers_count: profile.followers_count + 1 });
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  // MASTER PLAN 1.8: Expiring Profile Sharing
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
    // Navigate to chat system with this user's ID
    router.push(`/chat/new?userId=${profile.user_id}`);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#1d9bf0]"></div></div>;
  if (!profile) return null;

  const isOwnProfile = user?.id === profile.user_id;
  
  // MASTER PLAN 1.5: DM Permission Logic
  const canMessage = 
    profile.dm_permission === 'everyone' || 
    (profile.dm_permission === 'selected' && isFollowing) || 
    isOwnProfile;

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-2xl mx-auto border-x border-[#2f3336] min-h-screen">
        {/* Cover Photo */}
        <div className="h-48 bg-[#181836] w-full relative">
          {profile.cover_url && <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />}
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-start relative">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full border-4 border-black bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] flex items-center justify-center text-4xl text-white font-bold -mt-16 relative overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.username[0].toUpperCase()
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              {isOwnProfile ? (
                <>
                  <button 
                    onClick={handleGenerateShareLink}
                    disabled={generatingLink}
                    className="p-2 border border-[#2f3336] rounded-full hover:bg-[#181836] text-white transition-colors"
                    title="Generate 5-min Share Link"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                  <Link href="/settings/profile" className="px-4 py-1.5 border border-[#2f3336] text-white font-bold rounded-full hover:bg-[#181836] transition-colors">
                    Edit profile
                  </Link>
                </>
              ) : (
                <>
                  {/* MASTER PLAN 1.5: Hidden if restricted */}
                  {canMessage && (
                    <button 
                      onClick={startChat}
                      className="p-2 border border-[#2f3336] rounded-full hover:bg-[#181836] text-white transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={handleFollowToggle}
                    className={`px-6 py-1.5 font-bold rounded-full transition-colors ${
                      isFollowing 
                        ? 'border border-[#2f3336] text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10' 
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-3">
            <h1 className="text-xl font-bold text-white flex items-center gap-1">
              {/* MASTER PLAN 1.4: Name Visibility (Backend already handles replacing this with username if hidden) */}
              {profile.name || profile.username}
              {profile.badge_type === 'premium' && <Verified className="w-5 h-5 text-[#1d9bf0] fill-[#1d9bf0]" />}
              {profile.badge_type === 'business' && <Verified className="w-5 h-5 text-[#ffd700] fill-[#ffd700]" />}
            </h1>
            <p className="text-[#71767b]">@{profile.username}</p>
          </div>

          {profile.bio && (
            <p className="text-white mt-3 whitespace-pre-wrap">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-[#71767b] text-sm">
            {profile.location && (
              <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.location}</div>
            )}
            {profile.website && (
              <div className="flex items-center gap-1"><LinkIcon className="w-4 h-4" /><a href={profile.website} target="_blank" className="text-[#1d9bf0] hover:underline">{profile.website.replace(/^https?:\/\//, '')}</a></div>
            )}
            <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
          </div>

          <div className="flex gap-4 mt-4 text-sm">
            <Link href={`/profile/${profile.username}/following`} className="hover:underline">
              <span className="text-white font-bold">{profile.following_count || 0}</span> <span className="text-[#71767b]">Following</span>
            </Link>
            <Link href={`/profile/${profile.username}/followers`} className="hover:underline">
              <span className="text-white font-bold">{profile.followers_count || 0}</span> <span className="text-[#71767b]">Followers</span>
            </Link>
          </div>
        </div>

        {/* Timeline Tabs */}
        <div className="flex border-b border-[#2f3336]">
          <button className="flex-1 py-4 text-white font-bold relative hover:bg-[#181836] transition-colors">
            Posts
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#1d9bf0] rounded-full"></div>
          </button>
          <button className="flex-1 py-4 text-[#71767b] font-bold hover:bg-[#181836] transition-colors">Replies</button>
          <button className="flex-1 py-4 text-[#71767b] font-bold hover:bg-[#181836] transition-colors">Media</button>
        </div>

        {/* Timeline Content */}
        <div className="divide-y divide-[#2f3336]">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-white text-xl font-bold">No posts yet</h2>
              <p className="text-[#71767b] mt-2">When they post, their timeline will show up here.</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="p-4 text-white border-b border-[#2f3336]">
                <p className="whitespace-pre-wrap">{post.caption}</p>
                {post.media_url && (
                  <img src={post.media_url} alt="Post media" className="mt-3 rounded-2xl border border-[#2f3336] max-h-96 w-full object-cover" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
