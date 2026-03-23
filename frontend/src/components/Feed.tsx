'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { postsAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Heart, MessageCircle, Share2, MoreHorizontal, Verified } from 'lucide-react';
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
  is_ad?: boolean;
  profiles: {
    username: string;
    avatar_url: string;
    badge_type: string;
  };
}

interface FeedProps {
  posts: Post[];
}

export default function Feed({ posts: initialPosts }: FeedProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

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
      setComments(data);
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
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}/post/${postId}`;
    if (navigator.share) {
      navigator.share({ url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="bg-dark-200 rounded-xl p-8 text-center">
          <p className="text-gray-400">No posts yet. Follow some people to see their posts!</p>
        </div>
      ) : (
        posts.map((post) => (
          <article key={post.id} className="bg-dark-200 rounded-xl overflow-hidden">
            {/* Ad Badge */}
            {post.is_ad && (
              <div className="bg-yellow-600/20 text-yellow-400 text-xs px-3 py-1">
                Sponsored
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <Link href={`/profile/${post.profiles.username}`} className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold overflow-hidden">
                  {post.profiles.avatar_url ? (
                    <img src={post.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    post.profiles.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-white">{post.profiles.username}</span>
                    {post.profiles.badge_type !== 'none' && (
                      <Verified className={`h-4 w-4 ${post.profiles.badge_type === 'gold' ? 'text-yellow-400' : 'text-primary-400'}`} />
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(post.created_at)}</span>
                </div>
              </Link>
              <button className="text-gray-500 hover:text-white">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            {post.caption && (
              <p className="px-4 pb-3 text-white whitespace-pre-wrap">{post.caption}</p>
            )}

            {/* Media */}
            {post.media_url && (
              <div className="relative">
                {post.media_type === 'video' ? (
                  <video src={post.media_url} controls className="w-full" />
                ) : (
                  <img src={post.media_url} alt="" className="w-full max-h-96 object-cover" />
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-around p-4 border-t border-gray-700">
              <button
                onClick={() => handleLike(post.id, post.is_liked)}
                className={`flex items-center space-x-2 ${post.is_liked ? 'text-red-500' : 'text-gray-400'} hover:text-red-400 transition-colors`}
              >
                <Heart className={`h-5 w-5 ${post.is_liked ? 'fill-current' : ''}`} />
                <span>{post.likes_count}</span>
              </button>

              <button
                onClick={() => {
                  setOpenComments(openComments === post.id ? null : post.id);
                  if (openComments !== post.id) loadComments(post.id);
                }}
                className="flex items-center space-x-2 text-gray-400 hover:text-primary-400 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments_count}</span>
              </button>

              <button
                onClick={() => handleShare(post.id)}
                className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            {/* Comments Section */}
            {openComments === post.id && (
              <div className="border-t border-gray-700 p-4">
                <div className="space-y-3 max-h-60 overflow-y-auto mb-3">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No comments yet</p>
                  ) : (
                    comments.map((comment: any) => (
                      <div key={comment.id} className="flex space-x-2">
                        <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                          {comment.profiles?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 bg-dark-300 rounded-lg p-2">
                          <span className="font-semibold text-sm text-white">{comment.profiles?.username}</span>
                          <p className="text-sm text-gray-300">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-dark-300 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </article>
        ))
      )}
    </div>
  );
}
