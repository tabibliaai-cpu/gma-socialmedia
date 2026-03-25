'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.username) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data } = await usersAPI.getUserProfile(user.username);
      setProfile(data);
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-primary/30 to-accent/30 relative">
        <div className="absolute inset-0 bg-dark-100/50"></div>
      </div>

      {/* Profile Header */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="relative -mt-16 mb-4">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent border-4 border-black flex items-center justify-center text-white text-4xl font-bold">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>

          {/* Edit Profile Button */}
          <Link
            href="/settings/profile"
            className="absolute right-0 top-20 px-4 py-2 border border-dark-300 text-white font-bold rounded-full hover:bg-dark-100 transition-colors"
          >
            Edit profile
          </Link>
        </div>

        {/* Profile Info */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-white">{profile?.username || user?.username}</h1>
          <p className="text-dark-500">@{profile?.username || user?.username}</p>
        </div>

        {profile?.bio && (
          <p className="text-white mb-4">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="flex gap-4 mb-4 text-sm">
          <Link href={`/profile/${user?.username}/following`} className="hover:underline">
            <span className="font-bold text-white">{profile?.following_count || 0}</span>
            <span className="text-dark-500 ml-1">Following</span>
          </Link>
          <Link href={`/profile/${user?.username}/followers`} className="hover:underline">
            <span className="font-bold text-white">{profile?.followers_count || 0}</span>
            <span className="text-dark-500 ml-1">Followers</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-dark-100">
          <nav className="flex">
            {['Posts', 'Replies', 'Media', 'Likes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`flex-1 py-4 text-center font-medium transition-colors relative ${
                  activeTab === tab.toLowerCase()
                    ? 'text-white'
                    : 'text-dark-500 hover:bg-dark-100 hover:text-white'
                }`}
              >
                {tab}
                {activeTab === tab.toLowerCase() && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-primary rounded-full"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Posts */}
        <div className="divide-y divide-dark-100">
          {posts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-dark-500 text-lg">No posts yet</p>
              <Link href="/create/post" className="text-primary hover:underline mt-2 inline-block">
                Create your first post
              </Link>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="p-4 hover:bg-dark-50/50 transition-colors cursor-pointer">
                <p className="text-white whitespace-pre-wrap">{post.caption}</p>
                <p className="text-dark-500 text-sm mt-2">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
