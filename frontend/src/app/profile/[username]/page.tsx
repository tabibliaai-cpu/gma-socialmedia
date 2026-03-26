'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI, postsAPI, chatAPI } from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import { Calendar, MapPin, Link as LinkIcon, ArrowLeft, MoreHorizontal, MessageCircle, Camera, Settings, Briefcase, Sparkles, X, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  caption: string;
  content?: string;
  media_url?: string;
  media_type?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
    badge_type: string;
  };
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  const { user: currentUser, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editProfession, setEditProfession] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Check if this is the current user's profile
  const isOwnProfile = currentUser?.profile?.username === username || 
                       currentUser?.username === username ||
                       currentUser?.id === profile?.user_id ||
                       currentUser?.user_id === profile?.user_id;

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data: profileData } = await usersAPI.getUserProfile(username);
      setProfile(profileData);
      setEditBio(profileData?.bio || '');
      setEditDisplayName(profileData?.name || profileData?.username || '');
      setEditUsername(profileData?.username || '');
      setEditWebsite(profileData?.website || '');
      setEditLocation(profileData?.location || '');
      setEditProfession(profileData?.profession || '');
      
      if (profileData?.user_id) {
        // Load posts
        try {
          const { data: postsData } = await postsAPI.getUserPosts(profileData.user_id);
          setPosts(postsData || []);
        } catch (e) {
          console.error('Failed to load posts:', e);
          setPosts([]);
        }

        // Check follow status if not own profile
        if (!isOwnProfile && currentUser) {
          try {
            const { data: followData } = await usersAPI.checkFollow(profileData.user_id);
            setIsFollowing(followData?.isFollowing || false);
          } catch (e) {
            console.error('Failed to check follow status:', e);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile?.user_id || followLoading) return;
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await usersAPI.unfollow(profile.user_id);
        setIsFollowing(false);
        toast.success('Unfollowed');
      } else {
        await usersAPI.follow(profile.user_id);
        setIsFollowing(true);
        toast.success('Following');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message;
      if (msg?.includes('Already following')) {
        setIsFollowing(true);
      } else {
        toast.error('Failed to update follow status');
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!profile?.user_id) return;
    
    try {
      await chatAPI.startConversation(profile.user_id);
      router.push(`/chat?user=${profile.user_id}`);
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await usersAPI.updateProfile({
        bio: editBio,
        name: editDisplayName,
        username: editUsername,
        website: editWebsite,
        location: editLocation,
        profession: editProfession,
      });
      setProfile({ 
        ...profile, 
        bio: editBio, 
        name: editDisplayName,
        username: editUsername,
        website: editWebsite,
        location: editLocation,
        profession: editProfession,
      });
      setIsEditing(false);
      await refreshProfile();
      toast.success('Profile updated!');
      
      // If username changed, redirect to new URL
      if (editUsername !== username) {
        router.push(`/profile/${editUsername}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatJoinDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d9bf0]"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !profile) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <p className="text-[#71767b] text-xl">User not found</p>
          <p className="text-[#71767b] text-sm mt-2">The user @{username} doesn't exist.</p>
          <Link href="/feed" className="text-[#1d9bf0] hover:underline mt-4 inline-block">
            Go back to feed
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-[600px] mx-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 px-4 py-2 border-b border-[#2f3336] flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-[#181836] rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{profile.name || profile.username}</h1>
            <p className="text-xs text-[#71767b]">{posts.length} posts</p>
          </div>
        </div>

        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-[#1d9bf0]/30 to-[#7856ff]/30 relative group">
          <div className="absolute inset-0 bg-[#16181c]/30"></div>
          {isOwnProfile && (
            <button className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" />
            </button>
          )}
          {profile.cover_url && (
            <img src={profile.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </div>

        {/* Profile Header */}
        <div className="px-4">
          <div className="relative -mt-16 mb-4">
            {/* Avatar */}
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] border-4 border-black flex items-center justify-center text-white text-3xl md:text-4xl font-bold relative overflow-hidden group">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                profile.username?.[0]?.toUpperCase() || 'U'
              )}
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute right-0 top-20 flex gap-2">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => router.push('/settings/profile')}
                    className="p-2 border border-[#2f3336] text-white rounded-full hover:bg-[#181836] transition-colors"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 border border-[#2f3336] text-white font-bold rounded-full hover:bg-[#181836] transition-colors"
                  >
                    {isEditing ? 'Cancel' : 'Edit profile'}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleMessage}
                    className="p-2 border border-[#2f3336] text-white rounded-full hover:bg-[#1d9bf0]/10 hover:border-[#1d9bf0] hover:text-[#1d9bf0] transition-colors"
                    title="Message"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-6 py-2 font-bold rounded-full transition-all min-w-[120px] ${
                      isFollowing 
                        ? 'border border-[#2f3336] text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10' 
                        : 'bg-white text-black hover:bg-gray-200'
                    } ${followLoading ? 'opacity-50' : ''}`}
                  >
                    {followLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : isFollowing ? (
                      'Following'
                    ) : (
                      'Follow'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="Display name"
                  className="w-full px-3 py-2 bg-black border border-[#2f3336] rounded-lg text-white focus:outline-none focus:border-[#1d9bf0] transition-colors"
                />
                <div className="flex items-center bg-black border border-[#2f3336] rounded-lg focus-within:border-[#1d9bf0]">
                  <span className="pl-3 text-[#71767b]">@</span>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="flex-1 px-2 py-2 bg-transparent text-white focus:outline-none"
                    minLength={3}
                    maxLength={30}
                  />
                </div>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Bio"
                  rows={3}
                  className="w-full px-3 py-2 bg-black border border-[#2f3336] rounded-lg text-white focus:outline-none focus:border-[#1d9bf0] resize-none transition-colors"
                  maxLength={500}
                />
                <input
                  type="text"
                  value={editProfession}
                  onChange={(e) => setEditProfession(e.target.value)}
                  placeholder="Profession"
                  className="w-full px-3 py-2 bg-black border border-[#2f3336] rounded-lg text-white focus:outline-none focus:border-[#1d9bf0] transition-colors"
                />
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="Location"
                  className="w-full px-3 py-2 bg-black border border-[#2f3336] rounded-lg text-white focus:outline-none focus:border-[#1d9bf0] transition-colors"
                />
                <input
                  type="url"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="Website"
                  className="w-full px-3 py-2 bg-black border border-[#2f3336] rounded-lg text-white focus:outline-none focus:border-[#1d9bf0] transition-colors"
                />
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="px-4 py-2 bg-[#1d9bf0] text-white font-bold rounded-full hover:bg-[#1a8cd8] disabled:opacity-50 flex items-center gap-2"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{profile.name || profile.username}</h2>
                  {profile.badge_type && profile.badge_type !== 'none' && (
                    <svg className="w-5 h-5 text-[#1d9bf0] fill-[#1d9bf0]" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  )}
                </div>
                <p className="text-[#71767b]">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-white mt-3 whitespace-pre-wrap">{profile.bio}</p>
                )}
                
                {/* Metadata Row */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#71767b] text-sm mt-3">
                  {profile.profession && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {profile.profession}
                    </span>
                  )}
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#1d9bf0] hover:underline">
                      <LinkIcon className="w-4 h-4" />
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  {profile.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {formatJoinDate(profile.created_at)}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-4 mb-4 text-sm">
            <Link href={`/profile/${username}/following`} className="hover:underline">
              <span className="font-bold text-white">{profile.following_count || 0}</span>
              <span className="text-[#71767b] ml-1">Following</span>
            </Link>
            <Link href={`/profile/${username}/followers`} className="hover:underline">
              <span className="font-bold text-white">{profile.followers_count || 0}</span>
              <span className="text-[#71767b] ml-1">Followers</span>
            </Link>
          </div>

          {/* Tabs */}
          <div className="border-b border-[#2f3336] sticky top-[53px] bg-black z-5">
            <nav className="flex">
              {['Posts', 'Replies', 'Media', 'Likes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`flex-1 py-4 text-center font-medium transition-colors relative ${
                    activeTab === tab.toLowerCase()
                      ? 'text-white'
                      : 'text-[#71767b] hover:bg-[#181836] hover:text-white'
                  }`}
                >
                  {tab}
                  {activeTab === tab.toLowerCase() && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-full"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Posts */}
          <div className="divide-y divide-[#2f3336]">
            {posts.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#202327] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#71767b]" />
                </div>
                <p className="text-white text-xl font-bold mb-2">
                  {isOwnProfile ? "You haven't posted yet" : "No posts yet"}
                </p>
                <p className="text-[#71767b]">
                  {isOwnProfile 
                    ? "When you post, they'll show up here." 
                    : `When ${profile.username} posts, they'll show up here.`}
                </p>
                {isOwnProfile && (
                  <Link href="/create/post" className="mt-4 inline-block px-4 py-2 bg-[#1d9bf0] text-white font-bold rounded-full hover:bg-[#1a8cd8] transition-colors">
                    Create your first post
                  </Link>
                )}
              </div>
            ) : (
              posts.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/post/${post.id}`}
                  className="block p-4 hover:bg-[#181836]/50 transition-colors"
                >
                  <p className="text-white whitespace-pre-wrap">{post.caption || post.content}</p>
                  {post.media_url && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-[#2f3336]">
                      {post.media_type === 'video' ? (
                        <video src={post.media_url} controls className="w-full max-h-80 object-cover" />
                      ) : (
                        <img src={post.media_url} alt="" className="w-full max-h-80 object-cover" />
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-[#71767b] text-sm">
                    <span>💬 {post.comments_count || 0}</span>
                    <span>❤️ {post.likes_count || 0}</span>
                    <span>🔄 {post.shares_count || 0}</span>
                    <span className="ml-auto">{formatTime(post.created_at)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
