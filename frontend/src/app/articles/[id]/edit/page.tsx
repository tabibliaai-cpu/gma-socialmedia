'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { articlesAPI } from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import { ArrowLeft, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';

export default function EditArticlePage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [price, setPrice] = useState(0);

    useEffect(() => {
        loadArticle();
    }, [params.id, user]);

    const loadArticle = async () => {
        if (!params.id) return;
        try {
            const { data } = await articlesAPI.getById(params.id as string);

            // Ensure user is author
            if (user && data.author_id !== user.id) {
                toast.error('You do not have permission to edit this article.');
                router.push(`/article/${params.id}`);
                return;
            }

            setTitle(data.title || '');
            setContent(data.content || '');
            setPrice(data.price || 0);

        } catch (error) {
            toast.error('Failed to load article');
            router.push('/feed');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            return toast.error('Title and content are required.');
        }
        if (content.length < 50) {
            return toast.error('Content must be at least 50 characters.');
        }

        setSaving(true);
        try {
            await articlesAPI.update(params.id as string, {
                title: title.trim(),
                content: content.trim(),
                price: Number(price)
            });
            toast.success('Article updated successfully!');
            router.push(`/article/${params.id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update article');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto animate-in fade-in duration-200">

                {/* Header */}
                <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-white/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-[#7856ff]" /> Edit Article
                        </h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving || !title.trim() || content.length < 50}
                        className="px-5 py-2 bg-gradient-to-r from-[#7856ff] to-[#1d9bf0] text-white font-bold rounded-full hover:opacity-90 disabled:opacity-50 text-sm flex items-center gap-2 transition-opacity"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Publish Changes
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-8">

                    <div className="glass-panel p-6 rounded-2xl border border-[#7856ff]/20">

                        <div className="space-y-6">

                            {/* Title */}
                            <div>
                                <label className="block text-white font-bold mb-2">Article Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="The next big thing..."
                                    className="w-full px-4 py-3 text-lg bg-black border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#7856ff] transition-colors"
                                    required
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-white font-bold mb-2">Price (₹)</label>
                                <p className="text-dark-400 text-sm mb-3">Set to 0 to make this article permanently free. Changing the price will not retroactively charge existing buyers.</p>
                                <div className="relative max-w-xs">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        className="w-full pl-9 pr-4 py-3 bg-black border border-white/20 rounded-xl text-white font-bold focus:outline-none focus:border-[#7856ff] transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Content Box */}
                            <div>
                                <label className="block text-white font-bold mb-2 flex items-center justify-between">
                                    <span>Article Content</span>
                                    <span className={`text-sm ${content.length < 50 ? 'text-red-400' : 'text-dark-400'}`}>
                                        {content.length} / 50 min chars
                                    </span>
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Write your article here... Support for Markdown coming soon."
                                    rows={20}
                                    className="w-full px-4 py-4 bg-black border border-white/20 rounded-xl text-white text-base leading-relaxed focus:outline-none focus:border-[#7856ff] resize-none transition-colors"
                                    required
                                />
                            </div>

                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-[#7856ff]/10 border border-[#7856ff]/30 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-[#7856ff] flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-[#7856ff] font-medium leading-relaxed">
                            Note: Updating content or price will immediately reflect for new viewers. Users who already purchased this article will retain access regardless of new price changes.
                        </p>
                    </div>

                </form>

            </div>
        </MainLayout>
    );
}
