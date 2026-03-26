'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI, chatAPI } from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import { ArrowLeft, Check, Loader2, Shield, Eye, MessageSquareOff, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function PrivacySettingsPage() {
    const { user, refreshProfile } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [nameVisibility, setNameVisibility] = useState('everyone');
    const [dmPermission, setDmPermission] = useState('everyone');
    const [searchVisibility, setSearchVisibility] = useState('everyone');

    const [blockLoading, setBlockLoading] = useState(false);
    const [blockTargetId, setBlockTargetId] = useState('');

    useEffect(() => {
        if (user?.privacy_settings) {
            setNameVisibility(user.privacy_settings.name_visibility || 'everyone');
            setDmPermission(user.privacy_settings.dm_permission || 'everyone');
            setSearchVisibility(user.privacy_settings.search_visibility || 'everyone');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await usersAPI.updatePrivacy({
                name_visibility: nameVisibility,
                dm_permission: dmPermission,
                search_visibility: searchVisibility,
            });
            await refreshProfile();
            toast.success('Privacy settings saved!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update privacy');
        } finally {
            setLoading(false);
        }
    };

    const handleNuclearBlock = async () => {
        if (!blockTargetId.trim()) return toast.error('Enter a valid User ID');

        if (!window.confirm('WARNING: This will permanently wipe all chat history with this user for BOTH of you, and block them. This action cannot be undone. Proceed?')) {
            return;
        }

        setBlockLoading(true);
        try {
            await chatAPI.nuclearBlock(blockTargetId.trim());
            toast.success('Nuclear block executed. All history wiped.');
            setBlockTargetId('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to execute nuclear block.');
        } finally {
            setBlockLoading(false);
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
                            <Shield className="w-6 h-6 text-primary" /> Privacy & Security
                        </h1>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 disabled:opacity-50 text-sm flex items-center gap-2 transition-colors"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Save
                    </button>
                </div>

                <div className="p-6 space-y-8">

                    {/* DM Permissions */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5">
                        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <MessageSquareOff className="w-5 h-5 text-accent" /> Messages (DMs)
                        </h2>
                        <p className="text-dark-400 text-sm mb-4">Control who can send you direct messages.</p>

                        <div className="space-y-3">
                            {['everyone', 'selected', 'none'].map((option) => (
                                <label key={option} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                                    <input
                                        type="radio"
                                        name="dm_permission"
                                        value={option}
                                        checked={dmPermission === option}
                                        onChange={(e) => setDmPermission(e.target.value)}
                                        className="w-5 h-5 accent-primary bg-black border-white/20"
                                    />
                                    <div>
                                        <span className="text-white font-medium capitalize">{option === 'selected' ? 'Only People I Follow (Selected)' : option}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Name Visibility */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5">
                        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-primary" /> Display Name Visibility
                        </h2>
                        <p className="text-dark-400 text-sm mb-4">Control who can see your real profile name. If hidden, your @username will be shown instead.</p>

                        <div className="space-y-3">
                            {['everyone', 'selected', 'none'].map((option) => (
                                <label key={option} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                                    <input
                                        type="radio"
                                        name="name_visibility"
                                        value={option}
                                        checked={nameVisibility === option}
                                        onChange={(e) => setNameVisibility(e.target.value)}
                                        className="w-5 h-5 accent-primary bg-black border-white/20"
                                    />
                                    <div>
                                        <span className="text-white font-medium capitalize">{option === 'selected' ? 'Only People I Follow' : option === 'none' ? 'Nobody (Mask Name)' : option}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Nuclear Block */}
                    <div className="glass-panel p-6 rounded-2xl border border-red-500/20 relative overflow-hidden group hover:border-red-500/40 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full mix-blend-screen filter blur-[40px] group-hover:bg-red-500/20 transition-all duration-500"></div>
                        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                            <Trash2 className="w-5 h-5 text-red-500" /> Nuclear Block
                        </h2>
                        <p className="text-dark-400 text-sm mb-5 relative z-10">
                            Permanently block a user and completely wipe all chat history for BOTH parties. Warning: This action is irreversible.
                        </p>

                        <div className="flex gap-3 relative z-10">
                            <input
                                type="text"
                                placeholder="Enter User ID to block..."
                                value={blockTargetId}
                                onChange={(e) => setBlockTargetId(e.target.value)}
                                className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors"
                            />
                            <button
                                onClick={handleNuclearBlock}
                                disabled={blockLoading || !blockTargetId.trim()}
                                className="px-6 py-3 bg-red-500/20 hover:bg-red-500/40 text-red-500 font-bold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                                {blockLoading ? 'Wiping...' : 'Execute Wipe'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}
