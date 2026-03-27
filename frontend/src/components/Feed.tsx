'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { postsAPI } from '@/lib/api';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Verified, Trash2, Flag, Copy, Link as LinkIcon, Bookmark, Sparkles, Loader2, ExternalLink } from 'lucide-react';
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
  is_bookmarked?: boolean;
  is_ad?: boolean;
  type?: 'post' | 'ad' | 'article';
  ad_link?: string;
  profiles?: {
    username: string;
    avatar_url: string;
    badge_type: string;
  };
}

interface FeedProps {
  tab?: string;
}

export default function Feed({ tab = 'for-you' }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [animatingPost, setAnimatingPost] = useState<string | null>(null);

  const { user } = useAuth();
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPosts();
  }, [tab]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    setPosts([]);
    try {
      const { data } = await postsAPI.getFeed();
      // Animate posts in one by one
      for (let i = 0; i < (data || []).length; i++) {
        setTimeout(() => {
          setPosts(prev => [...prev, data[i]]);
        }, i * 50);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    setAnimatingPost(postId);
    setTimeout(() => setAnimatingPost(null), 500);

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

    try {
      if (isLiked) {
        await postsAPI.unlike(postId);
      } else {
        await postsAPI.like(postId);
      }
    } catch (error) {
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likes_count: isLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1),
            is_liked: isLiked,
          };
        }
        return p;
      }));
      toast.error('Failed to like post');
    }
  };

  const handleRetweet = async (postId: string) => {
    try {
      await postsAPI.share(postId);
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, shares_count: (p.shares_count || 0) + 1 };
        }
        return p;
      }));
      toast.success('Post shared!');
    } catch (error) {
      toast.error('Failed to share post');
    }
  };

  const handleBookmark = async (postId: string, isBookmarked: boolean) => {
    try {
      if (isBookmarked) {
        await postsAPI.unbookmark(postId);
        toast.success('Removed from bookmarks');
      } else {
        await postsAPI.bookmark(postId);
        toast.success('Added to bookmarks');
      }
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, is_bookmarked: !isBookmarked };
        }
        return p;
      }));
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleShare = async (postId: string) => {
    try {
      const url = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await postsAPI.delete(postId);
      setPosts(posts.filter(p => p.id !== postId));
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
    setOpenMenuId(null);
  };

  const handleSaveEdit = async (postId: string) => {
    if (!editCaption.trim()) return;
    setIsSavingEdit(true);
    try {
      await postsAPI.update(postId, { caption: editCaption.trim() });
      setPosts(posts.map(p => p.id === postId ? { ...p, caption: editCaption.trim() } : p));
      setEditingPostId(null);
      toast.success('Post updated');
    } catch (error) {
      toast.error('Failed to update post');
    } finally {
      setIsSavingEdit(false);
    }
    setOpenMenuId(null);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Text copied!');
    setOpenMenuId(null);
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
    if (!dateString) return 'just now';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMs < 0 || isNaN(diffMs)) return 'just now';
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'just now';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1d9bf0]"></div>
            <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-[#1d9bf0] animate-pulse" />
          </div>
          <p className="text-[#71767b] text-sm">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#1d9bf0]/20 to-[#7856ff]/20 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-[#1d9bf0]" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">Your feed is empty</h2>
        <p className="text-[#71767b] max-w-sm mx-auto">
          {tab === 'following'
            ? "Posts from people you follow will appear here. Start following some creators!"
            : "Create your first post to get started, or explore trending content!"}
        </p>
        <Link
          href={tab === 'following' ? '/explore' : '/create/post'}
          className="mt-6 inline-block px-6 py-2.5 bg-[#1d9bf0] text-white font-bold rounded-full hover:bg-[#1a8cd8] transition-colors"
        >
          {tab === 'following' ? 'Explore users' : 'Create post'}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-0 px-0 pb-6 pt-0 divide-y divide-[#2f3336]">
      {posts.map((post, index) => {
        const profile = post.profiles;
        const username = profile?.username || 'user';
        const badgeType = profile?.badge_type || 'none';
        const isPremium = badgeType === 'premium';
        const isBusiness = badgeType === 'business';
        const isVerified = badgeType !== 'none';

        const content = post.caption || post.content || '';
        const isAnimating = animatingPost === post.id;
        const isAd = post.type === 'ad' || post.is_ad;
        const isArticle = post.type === 'article';

        return (
          <article
            key={post.id}
            className={`p-4 md:p-5 transition-colors duration-200 animate-in fade-in slide-in-from-bottom-2 ${isAd ? 'bg-primary/5 shadow-inner' : 'hover:bg-white/[0.02] bg-transparent group/post'
              }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex gap-3 md:gap-4">
              {/* Avatar */}
              <Link href={`/profile/${username}`} className="shrink-0 relative">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] flex items-center justify-center text-white font-bold transition-transform duration-300 hover:scale-105">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={username} className="w-full h-full object-cover" />
                  ) : (
                    username[0].toUpperCase()
                  )}
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-1 text-sm flex-wrap">
                  <Link href={`/profile/${username}`} className="font-bold text-white hover:underline">
                    {username}
                  </Link>

                  {/* Master Plan: Subscription Badges (Wrapped in Span to fix TypeScript) */}
                  {isPremium && (
                    <span title="Premium Verified" className="inline-flex drop-shadow-[0_0_5px_rgba(120,86,255,0.5)]">
                      <Verified className="w-4 h-4 text-primary fill-primary" />
                    </span>
                  )}
                  {isBusiness && (
                    <span title="Business Verified" className="inline-flex drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">
                      <Verified className="w-4 h-4 text-warning fill-warning" />
                    </span>
                  )}
                  {isVerified && !isPremium && !isBusiness && (
                    <Verified className="w-4 h-4 text-accent fill-accent shadow-[0_0_5px_rgba(29,155,240,0.5)] rounded-full" />
                  )}

                  <span className="text-dark-400">@{username}</span>
                  <span className="text-dark-500">·</span>
                  <span className="text-dark-400">{formatTime(post.created_at)}</span>

                  {/* Master Plan: Ad & Article Labels */}
                  {isAd && (
                    <span className="ml-2 text-xs border border-[#71767b] text-[#71767b] px-1.5 py-0.5 rounded">
                      Sponsored
                    </span>
                  )}
                  {isArticle && (
                    <span className="ml-2 text-xs bg-[#7856ff]/20 text-[#7856ff] px-2 py-0.5 rounded-full">
                      Article
                    </span>
                  )}

                  {/* Three-dot Menu */}
                  <div className="ml-auto relative" ref={menuRef}>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                      className="p-1.5 text-[#71767b] hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] rounded-full transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {openMenuId === post.id && (
                      <div className="absolute right-0 top-8 w-48 bg-black border border-[#2f3336] rounded-xl shadow-lg overflow-hidden z-20">
                        <button
                          onClick={() => handleCopyText(content)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#181836] transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          Copy text
                        </button>
                        <button
                          onClick={() => handleShare(post.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#181836] transition-colors"
                        >
                          <LinkIcon className="w-4 h-4" />
                          Copy link to post
                        </button>
                        <button
                          onClick={() => {
                            toast('Report feature coming soon', { icon: 'ℹ️' });
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#181836] transition-colors"
                        >
                          <Flag className="w-4 h-4" />
                          Report post
                        </button>
                        {user?.id === post.user_id && (
                          <>
                            <button
                              onClick={() => {
                                setEditingPostId(post.id);
                                setEditCaption(post.caption || '');
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#181836] transition-colors border-t border-[#2f3336]"
                            >
                              <Sparkles className="w-4 h-4" />
                              Edit post
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete post
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Caption / Article Preview */}
                {editingPostId === post.id ? (
                  <div className="mt-2 space-y-3">
                    <textarea
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="w-full bg-transparent text-white text-base resize-none focus:outline-none border border-[#1d9bf0] rounded-xl p-3 min-h-[100px]"
                      placeholder="Edit your post..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingPostId(null)}
                        className="px-4 py-1.5 rounded-full font-bold text-white hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(post.id)}
                        disabled={isSavingEdit || !editCaption.trim()}
                        className="px-4 py-1.5 rounded-full font-bold bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] disabled:opacity-50"
                      >
                        {isSavingEdit ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : isArticle ? (
                  <div className="mt-2 p-4 border border-[#2f3336] rounded-xl bg-[#151515]">
                    <h3 className="text-xl font-bold text-white mb-2">{post.caption}</h3>
                    <p className="text-[#71767b] line-clamp-3">{post.content}</p>
                    <Link href={`/article/${post.id}`} className="text-[#1d9bf0] text-sm mt-2 inline-block hover:underline">
                      Read full article
                    </Link>
                  </div>
                ) : (
                  <p className="text-white text-base mt-1 whitespace-pre-wrap break-words">
                    {content}
                  </p>
                )}

                {/* Media */}
                {post.media_url && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 group-hover/post:border-white/20 transition-all duration-300">
                    {post.media_type === 'video' ? (
                      <video src={post.media_url} controls className="w-full max-h-[500px] object-cover" />
                    ) : (
                      <img src={post.media_url} alt="" className="w-full max-h-[500px] object-cover bg-black" />
                    )}
                  </div>
                )}

                {/* Master Plan: Ad Link Button */}
                {isAd && post.ad_link && (
                  <a href={post.ad_link} target="_blank" rel="noopener noreferrer" className="mt-3 w-full block text-center bg-[#1d9bf0]/10 text-[#1d9bf0] hover:bg-[#1d9bf0]/20 py-2 rounded-full font-bold transition-colors flex items-center justify-center gap-2">
                    Learn More <ExternalLink className="w-4 h-4" />
                  </a>
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

                  {/* Retweet */}
                  <button
                    onClick={() => handleRetweet(post.id)}
                    className="flex items-center gap-1 text-[#71767b] hover:text-green-500 group"
                  >
                    <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                      <Repeat2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm">{post.shares_count || 0}</span>
                  </button>

                  {/* Like */}
                  <button
                    onClick={() => handleLike(post.id, post.is_liked || false)}
                    className={`flex items-center gap-1 group ${post.is_liked ? 'text-pink-500' : 'text-[#71767b] hover:text-pink-500'
                      }`}
                  >
                    <div className={`p-2 rounded-full transition-all duration-200 ${post.is_liked ? 'bg-pink-500/10' : 'group-hover:bg-pink-500/10'
                      } ${isAnimating && !post.is_liked ? 'scale-125' : ''}`}>
                      <Heart className={`w-4 h-4 transition-transform duration-200 ${post.is_liked ? 'fill-pink-500' : ''
                        } ${isAnimating ? 'scale-110' : ''}`} />
                    </div>
                    <span className={`text-sm transition-all duration-200 ${isAnimating ? 'scale-110' : ''}`}>
                      {post.likes_count || 0}
                    </span>
                  </button>

                  {/* Bookmark */}
                  <button
                    onClick={() => handleBookmark(post.id, post.is_bookmarked || false)}
                    className={`flex items-center gap-1 group ${post.is_bookmarked ? 'text-[#1d9bf0]' : 'text-[#71767b] hover:text-[#1d9bf0]'
                      }`}
                  >
                    <div className={`p-2 rounded-full transition-colors ${post.is_bookmarked ? 'bg-[#1d9bf0]/10' : 'group-hover:bg-[#1d9bf0]/10'}`}>
                      <Bookmark className={`w-4 h-4 ${post.is_bookmarked ? 'fill-[#1d9bf0]' : ''}`} />
                    </div>
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
                  <div className="mt-4 pt-4 border-t border-white/10">
                    {/* Add Comment */}
                    <div className="flex gap-3 mb-5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_10px_rgba(120,86,255,0.3)]">
                        U
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Post your reply"
                          className="flex-1 px-5 py-2.5 glass-input border border-white/10 rounded-full text-white text-sm placeholder-dark-500 focus:outline-none transition-colors"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newComment.trim()}
                          className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_15px_rgba(120,86,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
                        >
                          Reply
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    {comments.length > 0 ? (
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Link href={`/profile/${comment.profiles?.username || 'user'}`} className="shrink-0">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] flex items-center justify-center text-white text-xs font-bold">
                                {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                              </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                <Link href={`/profile/${comment.profiles?.username || 'user'}`} className="font-bold text-white hover:underline">
                                  {comment.profiles?.username || 'user'}
                                </Link>
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
