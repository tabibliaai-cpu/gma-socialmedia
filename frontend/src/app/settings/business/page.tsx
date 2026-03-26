'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { affiliatesAPI, businessAPI } from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import { ArrowLeft, Check, Loader2, Briefcase, Bot, Users, UserPlus, Trash2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function BusinessSettingsPage() {
    const { user, refreshProfile } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [loadingAffiliates, setLoadingAffiliates] = useState(true);

    // CRM Settings
    const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
    const [autoReplyMessage, setAutoReplyMessage] = useState('');

    // Add Affiliate form
    const [newAffiliateUsername, setNewAffiliateUsername] = useState('');
    const [addingAffiliate, setAddingAffiliate] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'business') {
            toast.error('Only business accounts can access these settings.');
            router.push('/feed');
        }

        if (user?.business_settings) {
            setAutoReplyEnabled(user.business_settings.auto_reply_enabled || false);
            setAutoReplyMessage(user.business_settings.auto_reply_message || '');
        }

        loadAffiliates();
    }, [user, router]);

    const loadAffiliates = async () => {
        try {
            const { data } = await affiliatesAPI.getBusinessAffiliates();
            setAffiliates(data || []);
        } catch (err) {
            console.error('Failed to load affiliates', err);
        } finally {
            setLoadingAffiliates(false);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await businessAPI.updateSettings({
                auto_reply_enabled: autoReplyEnabled,
                auto_reply_message: autoReplyMessage
            });
            await refreshProfile();
            toast.success('Business settings saved!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAffiliate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAffiliateUsername.trim()) return;

        if (affiliates.length >= 10) {
            // Free limit is 10
            window.alert("You've reached the free limit of 10 affiliates. Adding more costs ₹75 per tier.");
            return;
        }

        setAddingAffiliate(true);
        try {
            await affiliatesAPI.create({ username: newAffiliateUsername.trim() });
            toast.success(`Sent affiliate request to @${newAffiliateUsername}`);
            setNewAffiliateUsername('');
            loadAffiliates();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add affiliate');
        } finally {
            setAddingAffiliate(false);
        }
    };

    const handleRemoveAffiliate = async (id: string, username: string) => {
        if (!window.confirm(`Are you sure you want to remove @${username} as an affiliate?`)) return;

        try {
            await affiliatesAPI.remove(id);
            toast.success(`Removed @${username}`);
            loadAffiliates();
        } catch (err) {
            toast.error('Failed to remove affiliate');
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
                        <h1 className="text-xl font-bold text-warning flex items-center gap-2">
                            <Briefcase className="w-6 h-6" /> Business Dashboard
                        </h1>
                    </div>
                    <button
                        onClick={handleSaveSettings}
                        disabled={loading}
                        className="px-5 py-2 bg-gradient-to-r from-warning to-yellow-500 text-black font-bold rounded-full hover:opacity-90 disabled:opacity-50 text-sm flex items-center gap-2 transition-opacity"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Save Settings
                    </button>
                </div>

                <div className="p-6 space-y-8">

                    {/* AI CRM Settings */}
                    <div className="glass-panel p-6 rounded-2xl border border-warning/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-warning/10 rounded-full mix-blend-screen filter blur-[50px] pointer-events-none"></div>

                        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                            <Bot className="w-5 h-5 text-warning" /> AI Auto-Responder
                        </h2>
                        <p className="text-dark-400 text-sm mb-6 relative z-10">
                            Configure your AI agent to greet new leads and reply to messages automatically while you're offline.
                        </p>

                        <div className="space-y-6 relative z-10">

                            <div className="flex items-center justify-between p-4 bg-black/50 border border-white/10 rounded-xl">
                                <div>
                                    <h3 className="text-white font-bold">Enable AI Auto-Reply</h3>
                                    <p className="text-dark-400 text-sm">Automatically answers first-time messages.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={autoReplyEnabled} onChange={(e) => setAutoReplyEnabled(e.target.checked)} />
                                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warning"></div>
                                </label>
                            </div>

                            {autoReplyEnabled && (
                                <div className="p-4 bg-black/50 border border-white/10 rounded-xl animate-in fade-in slide-in-from-top-2">
                                    <h3 className="text-white font-bold mb-3">Default Greeting Message</h3>
                                    <textarea
                                        value={autoReplyMessage}
                                        onChange={(e) => setAutoReplyMessage(e.target.value)}
                                        placeholder="Hi! Thanks for contacting us. We'll get back to you shortly. How can we help?"
                                        rows={3}
                                        className="w-full px-4 py-3 bg-black border border-white/20 rounded-xl text-white focus:outline-none focus:border-warning resize-none transition-colors"
                                    />
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Affiliates Management */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" /> Affiliate Management
                                </h2>
                                <p className="text-dark-400 text-sm">Assign Brand Ambassadors to represent your business.</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${affiliates.length >= 10 ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                                {affiliates.length} / 10 Free Slots Used
                            </div>
                        </div>

                        {/* Add Affiliate Form */}
                        <form onSubmit={handleAddAffiliate} className="flex gap-2 mb-6 relative z-10">
                            <div className="flex-1 flex items-center bg-black/50 border border-white/10 rounded-xl focus-within:border-primary transition-colors">
                                <span className="pl-4 text-dark-400">@</span>
                                <input
                                    type="text"
                                    placeholder="username"
                                    value={newAffiliateUsername}
                                    onChange={(e) => setNewAffiliateUsername(e.target.value)}
                                    className="flex-1 px-2 py-3 bg-transparent text-white focus:outline-none"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={addingAffiliate || !newAffiliateUsername.trim()}
                                className="px-6 py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {addingAffiliate ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                Add Target
                            </button>
                        </form>

                        <div className="space-y-3 relative z-10">
                            {loadingAffiliates ? (
                                <div className="text-center py-6"><Loader2 className="w-6 h-6 animate-spin text-dark-400 mx-auto" /></div>
                            ) : affiliates.length === 0 ? (
                                <div className="text-center py-8 bg-black/30 rounded-xl border border-white/5">
                                    <ShieldAlert className="w-8 h-8 text-dark-400 mx-auto mb-2" />
                                    <p className="text-dark-400">No active affiliates. Search a username above to invite one.</p>
                                </div>
                            ) : (
                                affiliates.map((aff) => (
                                    <div key={aff.id} className="flex items-center justify-between p-4 bg-black/50 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                                                {aff.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold">@{aff.profiles?.username}</p>
                                                <p className="text-warning text-xs font-medium bg-warning/10 px-2 py-0.5 rounded-md inline-block mt-1">
                                                    {aff.label || 'Brand Ambassador'} &bull; {aff.status}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveAffiliate(aff.id, aff.profiles?.username)}
                                            className="p-2 text-dark-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Remove Affiliate"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}
