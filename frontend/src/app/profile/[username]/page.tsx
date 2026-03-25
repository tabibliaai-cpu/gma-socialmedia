'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI, postsAPI, chatAPI } from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import { Calendar, MapPin, Link as LinkIcon, ArrowLeft, MoreHorizontal, MessageCircle, UserPlus, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');

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
      
      if (profileData?.user_id) {
        try {
          const { data: postsData } = await postsAPI.getUserPosts(profileData.user_id);
          setPosts(postsData || []);
        } catch (e) {
          setPosts([]);
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
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Unfollowed' : 'Following');
  };

  const handleMessage = async () => {
    if (!profile?.user_id) return;
    
    try {
      // For now, just redirect to chat - TODO: implement startConversation API
      toast.success('Opening chat...');
      router.push('/chat');
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await usersAPI.updateProfile({
        bio: editBio,
        name: editDisplayName,
      });
      setProfile({ ...profile, bio: editBio, name: editDisplayName });
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
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

  // Check if this is the current user's profile
  const isOwnProfile = currentUser?.profile?.username === username || 
                       currentUser?.username === username ||
                       currentUser?.id === profile?.user_id ||
                       currentUser?.user_id === profile?.user_id;

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
      <div className="max-w-[600px] mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 px-4 py-2 border-b border-[#2f3336] flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-[#181836] rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{profile.username}</h1>
            <p className="text-xs text-[#71767b]">{posts.length} posts</p>
          </div>
        </div>

        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-[#1d9bf0]/30 to-[#7856ff]/30 relative">
          <div className="absolute inset-0 bg-[#16181c]/50"></div>
          {isOwnProfile && isEditing && (
            <button className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
              <Camera className="h-5 w-5 text-white" />
            </button>
          )}
        </div>

        {/* Profile Header */}
        <div className="px-4">
          <div className="relative -mt-16 mb-4">
            {/* Avatar */}
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] border-4 border-black flex items-center justify-center text-white text-3xl md:text-4xl font-bold relative">
              {profile.username?.[0]?.toUpperCase() || 'U'}
              {isOwnProfile && isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-[#1d9bf0] rounded-full hover:bg-[#1a8cd8] transition-colors">
                  <Camera className="h-4 w-4 text-white" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute right-0 top-20 flex gap-2">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 border border-[#2f3336] text-white font-bold rounded-full hover:bg-[#181836] transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit profile'}
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleMessage}
                    className="p-2 border border-[#2f3336] text-white rounded-full hover:bg-[#181836] transition-colors"
                    title="Message"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleFollow}
                    className={`px-6 py-2 font-bold rounded-full transition-colors ${
                      isFollowing 
                        ? 'border border-[#2f3336] text-white hover:border-red-500 hover:text-red-500' 
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="Display name"
                  className="w-full px-3 py-2 bg-black border border-[#2f3336] rounded-lg text-white focus:outline-none focus:border-[#1d9bf0]"
                />
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Bio"
                  rows={3}
                  className="w-full px-3 py-2 bg-black border border-[#2f3336] rounded-lg text-white focus:outline-none focus:border-[#1d9bf0] resize-none"
                />
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-[#1d9bf0] text-white font-bold rounded-full hover:bg-[#1a8cd8]"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white">{profile.name || profile.username}</h2>
                <p className="text-[#71767b]">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-white mt-2 whitespace-pre-wrap">{profile.bio}</p>
                )}
              </>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#71767b] text-sm mb-4">
            {profile.created_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {formatJoinDate(profile.created_at)}
              </span>
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
          <div className="border-b border-[#2f3336]">
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
                <p className="text-[#71767b] text-lg">
                  {isOwnProfile ? "You haven't posted yet" : "No posts yet"}
                </p>
                {isOwnProfile && (
                  <Link href="/create/post" className="text-[#1d9bf0] hover:underline mt-2 inline-block">
                    Create your first post
                  </Link>
                )}
              </div>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="p-4 hover:bg-[#181836]/50 transition-colors cursor-pointer">
                  <p className="text-white whitespace-pre-wrap">{post.caption || post.content}</p>
                  <p className="text-[#71767b] text-sm mt-2">
                    {formatTime(post.created_at)}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
