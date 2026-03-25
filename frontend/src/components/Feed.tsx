'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { postsAPI } from '@/lib/api';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Verified } from 'lucide-react';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  user_id: string;
  caption: string;
  media_url: string;
  media_type: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_liked?: boolean;
  is_ad?: boolean;
  profiles?: {
    username: string;
    avatar_url: string;
    badge_type: string;
  };
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data } = await postsAPI.getFeed();
      setPosts(data || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await postsAPI.unlike(postId);
      } else {
        await postsAPI.like(postId);
      }
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1,
            is_liked: !isLiked,
          };
        }
        return p;
      }));
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const { data } = await postsAPI.getComments(postId);
      setComments(data || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim()) return;
    try {
      await postsAPI.addComment(postId, newComment);
      setNewComment('');
      loadComments(postId);
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, comments_count: p.comments_count + 1 };
        }
        return p;
      }));
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-dark-500 text-lg">No posts yet</p>
        <p className="text-dark-400 text-sm mt-2">Follow some people to see their posts here</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-dark-100">
      {posts.map((post) => {
        const profile = post.profiles;
        const username = profile?.username || 'user';
        const isVerified = profile?.badge_type && profile.badge_type !== 'none';

        return (
          <article key={post.id} className="p-4 hover:bg-dark-50/50 transition-colors cursor-pointer">
            <div className="flex gap-3">
              {/* Avatar */}
              <Link href={`/profile/${username}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent shrink-0 flex items-center justify-center text-white font-bold">
                  {username[0].toUpperCase()}
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-1 text-sm">
                  <Link href={`/profile/${username}`} className="font-bold text-white hover:underline">
                    {username}
                  </Link>
                  {isVerified && (
                    <Verified className="w-4 h-4 text-primary fill-primary" />
                  )}
                  <span className="text-dark-500">@{username}</span>
                  <span className="text-dark-500">·</span>
                  <span className="text-dark-500">{formatTime(post.created_at)}</span>
                  <button className="ml-auto p-1.5 text-dark-500 hover:bg-primary/10 hover:text-primary rounded-full transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Caption */}
                <p className="text-white text-base mt-1 whitespace-pre-wrap break-words">
                  {post.caption}
                </p>

                {/* Media */}
                {post.media_url && (
                  <div className="mt-3 rounded-2xl overflow-hidden border border-dark-100">
                    {post.media_type === 'video' ? (
                      <video src={post.media_url} controls className="w-full max-h-96 object-cover" />
                    ) : (
                      <img src={post.media_url} alt="" className="w-full max-h-96 object-cover" />
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-3 max-w-md">
                  {/* Comment */}
                  <button
                    onClick={() => {
                      setOpenComments(openComments === post.id ? null : post.id);
                      if (openComments !== post.id) loadComments(post.id);
                    }}
                    className="flex items-center gap-1 text-dark-500 hover:text-primary group"
                  >
                    <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm">{post.comments_count || 0}</span>
                  </button>

                  {/* Retweet */}
                  <button className="flex items-center gap-1 text-dark-500 hover:text-success group">
                    <div className="p-2 rounded-full group-hover:bg-success/10 transition-colors">
                      <Repeat2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm">0</span>
                  </button>

                  {/* Like */}
                  <button
                    onClick={() => handleLike(post.id, post.is_liked || false)}
                    className={`flex items-center gap-1 group ${
                      post.is_liked ? 'text-danger' : 'text-dark-500 hover:text-danger'
                    }`}
                  >
                    <div className={`p-2 rounded-full transition-colors ${post.is_liked ? 'bg-danger/10' : 'group-hover:bg-danger/10'}`}>
                      <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-danger' : ''}`} />
                    </div>
                    <span className="text-sm">{post.likes_count || 0}</span>
                  </button>

                  {/* Share */}
                  <button className="flex items-center gap-1 text-dark-500 hover:text-primary group">
                    <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                      <Share className="w-4 h-4" />
                    </div>
                  </button>
                </div>

                {/* Comments Section */}
                {openComments === post.id && (
                  <div className="mt-3 pt-3 border-t border-dark-100 animate-fade-in">
                    {/* Add Comment */}
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        placeholder="Post your reply"
                        className="flex-1 px-4 py-2 bg-dark-100 border border-dark-200 rounded-full text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary transition-colors"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full text-sm transition-colors"
                      >
                        Reply
                      </button>
                    </div>

                    {/* Comments List */}
                    {comments.length > 0 ? (
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent shrink-0 flex items-center justify-center text-white text-xs font-bold">
                              {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-bold text-white">{comment.profiles?.username || 'user'}</span>
                                <span className="text-dark-500 ml-1">{comment.content}</span>
                              </p>
                              <p className="text-xs text-dark-500 mt-0.5">{formatTime(comment.created_at)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-dark-500 text-sm text-center py-4">No comments yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
