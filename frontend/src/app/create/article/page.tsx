'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { articlesAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Save, Eye, DollarSign, Image, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CreateArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState(99);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please add title and content');
      return;
    }

    if (content.length < 50) {
      toast.error('Content must be at least 50 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await articlesAPI.create({
        title,
        content,
        cover_image_url: coverImageUrl || undefined,
        is_paid: isPaid,
        price: isPaid ? price : 0,
      });
      toast.success('Article published!');
      router.push(`/article/${data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to publish article');
    } finally {
      setLoading(false);
    }
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/feed" className="flex items-center text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Link>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                preview ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:text-white'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 text-white font-semibold rounded-lg"
            >
              {loading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {preview ? (
          /* Preview Mode */
          <article className="bg-dark-200 rounded-xl p-8">
            <h1 className="text-3xl font-bold text-white mb-4">{title || 'Untitled'}</h1>
            {coverImageUrl && (
              <img src={coverImageUrl} alt="" className="w-full h-64 object-cover rounded-xl mb-6" />
            )}
            <div className="text-gray-400 text-sm mb-4">
              {wordCount} words • {readTime} min read
              {isPaid && <span className="ml-2 text-yellow-400">• ₹{price}</span>}
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-wrap">{content}</p>
            </div>
          </article>
        ) : (
          /* Editor Mode */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Image */}
            <div className="bg-dark-200 rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Image className="inline h-4 w-4 mr-1" />
                Cover Image URL (optional)
              </label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {coverImageUrl && (
                <img src={coverImageUrl} alt="" className="mt-3 h-32 rounded-lg object-cover" />
              )}
            </div>

            {/* Title */}
            <div className="bg-dark-200 rounded-xl p-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article title..."
                className="w-full text-3xl font-bold bg-transparent text-white placeholder-gray-500 focus:outline-none"
                maxLength={200}
              />
            </div>

            {/* Content */}
            <div className="bg-dark-200 rounded-xl p-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article content here..."
                className="w-full min-h-[400px] bg-transparent text-white text-lg placeholder-gray-500 focus:outline-none resize-none"
              />
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700 text-sm text-gray-500">
                <span>{wordCount} words • {readTime} min read</span>
                <span>{content.length} characters</span>
              </div>
            </div>

            {/* Paid Article */}
            <div className="bg-dark-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-yellow-400" />
                  <span className="text-white font-medium">Paid Article</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPaid(!isPaid)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    isPaid ? 'bg-primary-600' : 'bg-gray-700'
                  }`}
                >
                  <div className={`h-5 w-5 bg-white rounded-full transform transition-transform ${
                    isPaid ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {isPaid && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min={1}
                    className="w-32 px-4 py-2 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Readers will need to pay ₹{price} to access the full article
                  </p>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
