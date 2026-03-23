'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { articlesAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Calendar, Clock, User, Lock, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ArticlePage() {
  const params = useParams();
  const articleId = params.id as string;
  const { user, isAuthenticated } = useAuth();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    try {
      const { data } = await articlesAPI.getById(articleId);
      setArticle(data);
    } catch (error) {
      toast.error('Article not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    // In production, integrate Razorpay here
    toast.success('Payment integration coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Article not found</p>
      </div>
    );
  }

  const isLocked = article.is_locked && article.author_id !== user?.id;

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <article className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          href="/feed"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Feed
        </Link>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {article.title}
          </h1>

          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <Link
              href={`/profile/${article.profiles?.username}`}
              className="flex items-center space-x-2 hover:text-white"
            >
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm">
                {article.profiles?.avatar_url ? (
                  <img src={article.profiles.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  article.profiles?.username?.charAt(0).toUpperCase()
                )}
              </div>
              <span>{article.profiles?.username}</span>
            </Link>
            <span>•</span>
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(article.created_at)}
            </span>
            <span>•</span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {Math.ceil(article.content?.length / 1000 || 1)} min read
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 mt-4">
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white">
              <Share2 className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white">
              <Bookmark className="h-4 w-4" />
              <span className="text-sm">Save</span>
            </button>
          </div>
        </header>

        {/* Cover Image */}
        {article.cover_image_url && (
          <img
            src={article.cover_image_url}
            alt=""
            className="w-full h-64 md:h-96 object-cover rounded-xl mb-8"
          />
        )}

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          {isLocked ? (
            <div className="relative">
              <div className="blur-sm select-none">
                <p className="text-gray-300 whitespace-pre-wrap">{article.content}</p>
              </div>
              
              {/* Lock Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-dark-200 rounded-2xl p-8 text-center max-w-md border border-gray-700">
                  <Lock className="h-12 w-12 mx-auto text-primary-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Premium Content</h3>
                  <p className="text-gray-400 mb-4">
                    This article is available for purchase at ₹{article.price}
                  </p>
                  <button
                    onClick={handlePurchase}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg w-full"
                  >
                    Purchase for ₹{article.price}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {article.content}
            </div>
          )}
        </div>

        {/* Author Card */}
        <div className="mt-12 p-6 bg-dark-200 rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl">
              {article.profiles?.avatar_url ? (
                <img src={article.profiles.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                article.profiles?.username?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">{article.profiles?.username}</p>
              <p className="text-sm text-gray-400">Author</p>
            </div>
            {article.author_id !== user?.id && (
              <Link
                href={`/chat?user=${article.author_id}`}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Message
              </Link>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
