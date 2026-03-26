'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { chatAPI } from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import { ArrowLeft, Check, Loader2, IndianRupee, MessageCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function MonetizationSettingsPage() {
    const { user, refreshProfile } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [price, setPrice] = useState(10);

    useEffect(() => {
        // Redirect if not creator
        if (user && user.role !== 'creator') {
            toast.error('Only creators can access monetization settings.');
            router.push('/feed');
        }

        if (user?.paid_chat_settings) {
            setIsEnabled(user.paid_chat_settings.is_enabled || false);
            setPrice(user.paid_chat_settings.price_per_message || 10);
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEnabled && price < 10) {
            return toast.error('Minimum price for paid chat is ₹10.');
        }

        setLoading(true);
        try {
            await chatAPI.setPaidSettings(price, isEnabled);
            await refreshProfile();
            toast.success('Paid chat settings saved!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto animate-in fade-in duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-white/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <IndianRupee className="w-6 h-6 text-primary" /> Monetization
                        </h1>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-full hover:opacity-90 disabled:opacity-50 text-sm flex items-center gap-2 transition-opacity"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Save
                    </button>
                </div>

                <div className="p-6 space-y-8">

                    <div className="glass-panel p-6 rounded-2xl border border-primary/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full mix-blend-screen filter blur-[50px] pointer-events-none"></div>

                        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                            Paid Chat Settings
                        </h2>
                        <p className="text-dark-400 text-sm mb-6 relative z-10">
                            Filter your DMs by requiring followers to pay before they can message you.
                        </p>

                        <div className="space-y-6 relative z-10">

                            {/* Toggle Enable */}
                            <div className="flex items-center justify-between p-4 bg-black/50 border border-white/10 rounded-xl">
                                <div>
                                    <h3 className="text-white font-bold">Enable Paid Chat</h3>
                                    <p className="text-dark-400 text-sm">Users must pay to open a chat request with you.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} />
                                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            {/* Price Input */}
                            {isEnabled && (
                                <div className="p-4 bg-black/50 border border-white/10 rounded-xl animate-in fade-in slide-in-from-top-2">
                                    <h3 className="text-white font-bold mb-3">Price per Message</h3>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            min="10"
                                            step="1"
                                            value={price}
                                            onChange={(e) => setPrice(Number(e.target.value))}
                                            className="w-full pl-9 pr-4 py-3 bg-black border border-white/20 rounded-xl text-white font-bold text-lg focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div className="flex items-start gap-2 mt-3 text-warning text-xs font-bold bg-warning/10 p-2.5 rounded-lg border border-warning/20">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <p>Minimum price must be ₹10. Platform fees may apply to the final payout.</p>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="p-6 border border-white/10 rounded-2xl bg-gradient-to-br from-white/5 to-transparent">
                        <h3 className="text-sm font-bold text-dark-400 uppercase tracking-widest mb-4 text-center">Live Preview</h3>
                        <p className="text-dark-400 text-sm text-center mb-6">This is how your message button will appear to others on your profile.</p>

                        <div className="flex justify-center">
                            <button className="px-5 py-2.5 flex items-center justify-center gap-2 border border-white/20 rounded-full text-white font-bold bg-white/5 opacity-90 cursor-default">
                                <MessageCircle className="w-5 h-5" />
                                {isEnabled && price >= 10 ? (
                                    <span>₹{price}</span>
                                ) : (
                                    <span>Message</span>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}
