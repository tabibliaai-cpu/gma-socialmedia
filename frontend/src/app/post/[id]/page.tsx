'use client';

import { useEffect, useState } from 'react';
import { postsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Heart, MessageCircle, Share2, ArrowLeft, MoreHorizontal, Verified, Flag, Link as LinkIcon, Bookmark, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const postId = params.id as string;
  
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        postsAPI.getById(postId),
        postsAPI.getComments(postId),
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data || []);
    } catch (error) {
      toast.error('Post not found');
      router.push('/feed');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (post.is_liked) {
        await postsAPI.unlike(postId);
        setPost({ ...post, likes_count: post.likes_count - 1, is_liked: false });
      } else {
        await postsAPI.like(postId);
        setPost({ ...post, likes_count: post.likes_count + 1, is_liked: true });
      }
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || commentLoading) return;
    
    setCommentLoading(true);
    try {
      await postsAPI.addComment(postId, newComment);
      setNewComment('');
      const { data } = await postsAPI.getComments(postId);
      setComments(data || []);
      setPost({ ...post, comments_count: post.comments_count + 1 });
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await postsAPI.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      setPost({ ...post, comments_count: post.comments_count - 1 });
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ url, title: post.caption });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await postsAPI.delete(postId);
      toast.success('Post deleted');
      router.push('/feed');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!post) return null;

  const isOwnPost = user?.id === post.user_id;

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        {/* Post */}
        <article className="bg-dark-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <Link href={`/profile/${post.profiles?.username}`} className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold overflow-hidden">
                {post.profiles?.avatar_url ? (
                  <img src={post.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  post.profiles?.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-white">{post.profiles?.username}</span>
                  {post.profiles?.badge_type !== 'none' && (
                    <Verified className={`h-4 w-4 ${post.profiles.badge_type === 'gold' ? 'text-yellow-400' : 'text-primary-400'}`} />
                  )}
                </div>
                <span className="text-xs text-gray-500">{formatDate(post.created_at)}</span>
              </div>
            </Link>

            <div className="relative group">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-dark-300 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {isOwnPost ? (
                  <>
                    <button className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-dark-200 hover:text-white">
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </button>
                    <button
                      onClick={handleDeletePost}
                      className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-dark-200"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-dark-200 hover:text-white">
                      <Bookmark className="h-4 w-4 mr-2" /> Save
                    </button>
                    <button className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-dark-200 hover:text-white">
                      <LinkIcon className="h-4 w-4 mr-2" /> Copy Link
                    </button>
                    <button className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-dark-200">
                      <Flag className="h-4 w-4 mr-2" /> Report
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          {post.caption && (
            <p className="p-4 text-white whitespace-pre-wrap text-lg">{post.caption}</p>
          )}

          {/* Media */}
          {post.media_url && (
            <div className="border-t border-gray-700">
              {post.media_type === 'video' ? (
                <video src={post.media_url} controls className="w-full" />
              ) : (
                <img src={post.media_url} alt="" className="w-full" />
              )}
            </div>
          )}

          {/* Stats */}
          <div className="px-4 py-2 border-t border-gray-700 text-sm text-gray-400">
            {post.likes_count > 0 && <span>{post.likes_count} likes</span>}
            {post.likes_count > 0 && post.comments_count > 0 && <span> • </span>}
            {post.comments_count > 0 && <span>{post.comments_count} comments</span>}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-around p-2 border-t border-gray-700">
            <button
              onClick={handleLike}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 ${post.is_liked ? 'text-red-500' : 'text-gray-400'} hover:bg-dark-300 rounded-lg transition-colors`}
            >
              <Heart className={`h-6 w-6 ${post.is_liked ? 'fill-current' : ''}`} />
              <span>Like</span>
            </button>

            <button className="flex-1 flex items-center justify-center space-x-2 py-3 text-gray-400 hover:bg-dark-300 rounded-lg transition-colors">
              <MessageCircle className="h-6 w-6" />
              <span>Comment</span>
            </button>

            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center space-x-2 py-3 text-gray-400 hover:bg-dark-300 rounded-lg transition-colors"
            >
              <Share2 className="h-6 w-6" />
              <span>Share</span>
            </button>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-6 bg-dark-200 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-4">Comments ({comments.length})</h3>

          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="flex space-x-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm flex-shrink-0">
              {user?.profile?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-dark-300 border border-gray-700 rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || commentLoading}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 text-white rounded-full font-medium"
              >
                Post
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => {
                const isOwnComment = user?.id === comment.user_id;
                return (
                  <div key={comment.id} className="flex space-x-3 group">
                    <Link href={`/profile/${comment.profiles?.username}`}>
                      <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm flex-shrink-0 overflow-hidden">
                        {comment.profiles?.avatar_url ? (
                          <img src={comment.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          comment.profiles?.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                    </Link>
                    <div className="flex-1">
                      <div className="bg-dark-300 rounded-2xl px-4 py-2">
                        <Link href={`/profile/${comment.profiles?.username}`} className="font-semibold text-white text-sm hover:underline">
                          {comment.profiles?.username}
                        </Link>
                        <p className="text-gray-300 text-sm">{comment.content}</p>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 px-2 text-xs text-gray-500">
                        <span>{formatDate(comment.created_at)}</span>
                        {isOwnComment && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
