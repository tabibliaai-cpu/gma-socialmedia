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
  content?: string;
  media_url: string;
  media_type: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
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
            likes_count: isLiked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1,
            is_liked: !isLiked,
          };
        }
        return p;
      }));
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleShare = async (postId: string) => {
    try {
      // Copy link to clipboard
      const url = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
      
      // Update share count
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, shares_count: (p.shares_count || 0) + 1 };
        }
        return p;
      }));
    } catch (error) {
      toast.error('Failed to share post');
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
    if (!dateString) return 'now';
    
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d9bf0]"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[#71767b] text-lg">No posts yet</p>
        <p className="text-[#71767b] text-sm mt-2">Create your first post to get started!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#2f3336]">
      {posts.map((post) => {
        const profile = post.profiles;
        const username = profile?.username || 'user';
        const isVerified = profile?.badge_type && profile.badge_type !== 'none';
        const content = post.caption || post.content || '';

        return (
          <article key={post.id} className="p-4 hover:bg-[#181836]/50 transition-colors">
            <div className="flex gap-3">
              {/* Avatar */}
              <Link href={`/profile/${username}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] shrink-0 flex items-center justify-center text-white font-bold">
                  {username[0].toUpperCase()}
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-1 text-sm flex-wrap">
                  <Link href={`/profile/${username}`} className="font-bold text-white hover:underline">
                    {username}
                  </Link>
                  {isVerified && (
                    <Verified className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0]" />
                  )}
                  <span className="text-[#71767b]">@{username}</span>
                  <span className="text-[#71767b]">·</span>
                  <span className="text-[#71767b]">{formatTime(post.created_at)}</span>
                  <button className="ml-auto p-1.5 text-[#71767b] hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] rounded-full transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Caption */}
                <p className="text-white text-base mt-1 whitespace-pre-wrap break-words">
                  {content}
                </p>

                {/* Media */}
                {post.media_url && (
                  <div className="mt-3 rounded-2xl overflow-hidden border border-[#2f3336]">
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
                    className="flex items-center gap-1 text-[#71767b] hover:text-[#1d9bf0] group"
                  >
                    <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm">{post.comments_count || 0}</span>
                  </button>

                  {/* Retweet/Share */}
                  <button className="flex items-center gap-1 text-[#71767b] hover:text-green-500 group">
                    <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                      <Repeat2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm">{post.shares_count || 0}</span>
                  </button>

                  {/* Like */}
                  <button
                    onClick={() => handleLike(post.id, post.is_liked || false)}
                    className={`flex items-center gap-1 group ${
                      post.is_liked ? 'text-pink-500' : 'text-[#71767b] hover:text-pink-500'
                    }`}
                  >
                    <div className={`p-2 rounded-full transition-colors ${post.is_liked ? 'bg-pink-500/10' : 'group-hover:bg-pink-500/10'}`}>
                      <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-pink-500' : ''}`} />
                    </div>
                    <span className="text-sm">{post.likes_count || 0}</span>
                  </button>

                  {/* Share */}
                  <button 
                    onClick={() => handleShare(post.id)}
                    className="flex items-center gap-1 text-[#71767b] hover:text-[#1d9bf0] group"
                  >
                    <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                      <Share className="w-4 h-4" />
                    </div>
                  </button>
                </div>

                {/* Comments Section */}
                {openComments === post.id && (
                  <div className="mt-3 pt-3 border-t border-[#2f3336]">
                    {/* Add Comment */}
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        placeholder="Post your reply"
                        className="flex-1 px-4 py-2 bg-transparent border border-[#2f3336] rounded-full text-white text-sm placeholder-[#71767b] focus:outline-none focus:border-[#1d9bf0] transition-colors"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full text-sm transition-colors"
                      >
                        Reply
                      </button>
                    </div>

                    {/* Comments List */}
                    {comments.length > 0 ? (
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] shrink-0 flex items-center justify-center text-white text-xs font-bold">
                              {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-bold text-white">{comment.profiles?.username || 'user'}</span>
                                <span className="text-white ml-2">{comment.content}</span>
                              </p>
                              <p className="text-xs text-[#71767b] mt-0.5">{formatTime(comment.created_at)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#71767b] text-sm text-center py-4">No comments yet. Be the first to comment!</p>
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
