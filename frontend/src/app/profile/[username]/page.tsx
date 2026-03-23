'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usersAPI, postsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatNumber, formatDate } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import { Verified, Settings, Calendar, MapPin, Link as LinkIcon, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileData {
  user_id: string;
  username: string;
  bio: string;
  avatar_url: string;
  badge_type: string;
  followers_count: number;
  following_count: number;
  users: {
    role: string;
  };
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const isOwnProfile = currentUser?.profile?.username === username;

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data } = await usersAPI.getUserProfile(username);
      setProfile(data);
      const { data: userPosts } = await postsAPI.getUserPosts(data.user_id);
      setPosts(userPosts);
    } catch (error) {
      toast.error('User not found');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    try {
      if (isFollowing) {
        await usersAPI.unfollow(profile.user_id);
        setIsFollowing(false);
      } else {
        await usersAPI.follow(profile.user_id);
        setIsFollowing(true);
      }
    } catch (error) {
      toast.error('Failed to follow');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-4xl mx-auto">
        {/* Cover & Avatar */}
        <div className="h-48 bg-gradient-to-r from-primary-600 to-primary-800 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="h-32 w-32 rounded-full border-4 border-dark-300 bg-primary-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                profile.username.charAt(0).toUpperCase()
              )}
            </div>
            {profile.badge_type !== 'none' && (
              <div className={`absolute bottom-2 right-2 p-1 rounded-full ${profile.badge_type === 'gold' ? 'bg-yellow-400' : 'bg-primary-400'}`}>
                <Verified className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 px-8 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                <span>{profile.username}</span>
                {profile.badge_type !== 'none' && (
                  <Verified className={`h-5 w-5 ${profile.badge_type === 'gold' ? 'text-yellow-400' : 'text-primary-400'}`} />
                )}
              </h1>
              <p className="text-gray-400 capitalize">{profile.users?.role}</p>
            </div>
            <div className="flex space-x-2">
              {isOwnProfile ? (
                <>
                  <Link
                    href="/settings"
                    className="px-4 py-2 bg-dark-200 hover:bg-dark-100 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Link>
                  <button className="p-2 bg-dark-200 hover:bg-dark-100 text-white rounded-lg transition-colors">
                    <Settings className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                      isFollowing
                        ? 'bg-dark-200 hover:bg-red-600 text-white'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <Link
                    href={`/chat?user=${profile.user_id}`}
                    className="px-4 py-2 bg-dark-200 hover:bg-dark-100 text-white rounded-lg transition-colors"
                  >
                    Message
                  </Link>
                </>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="mt-4 text-gray-300">{profile.bio}</p>
          )}

          {/* Stats */}
          <div className="flex space-x-6 mt-4">
            <div>
              <span className="font-bold text-white">{formatNumber(profile.following_count)}</span>
              <span className="text-gray-400 ml-1">Following</span>
            </div>
            <div>
              <span className="font-bold text-white">{formatNumber(profile.followers_count)}</span>
              <span className="text-gray-400 ml-1">Followers</span>
            </div>
            <div>
              <span className="font-bold text-white">{posts.length}</span>
              <span className="text-gray-400 ml-1">Posts</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <div className="flex">
            {['posts', 'articles', 'media', 'likes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 font-medium capitalize transition-colors ${
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
        <div className="p-4">
          {activeTab === 'posts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.length === 0 ? (
                <p className="text-gray-500 col-span-2 text-center py-8">No posts yet</p>
              ) : (
                posts.map((post) => (
                  <Link key={post.id} href={`/post/${post.id}`} className="bg-dark-200 rounded-xl overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all">
                    {post.media_url && (
                      <img src={post.media_url} alt="" className="w-full h-48 object-cover" />
                    )}
                    <div className="p-4">
                      <p className="text-gray-300 line-clamp-2">{post.caption}</p>
                      <p className="text-xs text-gray-500 mt-2">{formatDate(post.created_at)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
