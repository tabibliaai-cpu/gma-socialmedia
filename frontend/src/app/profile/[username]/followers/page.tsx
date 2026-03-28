'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usersAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { ArrowLeft, User as UserIcon, Verified } from 'lucide-react';
import Link from 'next/link';

export default function FollowersPage() {
    const params = useParams();
    const router = useRouter();
    const username = params?.username as string;
    const [followers, setFollowers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (username) {
            loadFollowers();
        }
    }, [username]);

    const loadFollowers = async () => {
        setLoading(true);
        try {
            const { data } = await usersAPI.getFollowers(username);
            setFollowers(data || []);
        } catch (error) {
            console.error('Failed to load followers:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black">
            <Navbar />
            <div className="max-w-[600px] mx-auto border-x border-[#2f3336] min-h-screen pt-[53px]">
                <div className="sticky top-[53px] z-10 bg-black/80 backdrop-blur-md px-4 py-2 flex items-center gap-6 border-b border-[#2f3336]">
                    <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <h2 className="text-[17px] font-extrabold text-white leading-tight">Followers</h2>
                        <p className="text-[13px] text-[#71767b]">@{username}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-t-2 border-[#1d9bf0] rounded-full animate-spin" />
                    </div>
                ) : followers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <h2 className="text-[20px] font-extrabold text-white mb-2">No followers yet</h2>
                        <p className="text-[#71767b] text-[15px]">When someone follows this account, they'll show up here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#2f3336]">
                        {followers.map((item) => {
                            const followerProfile = item.profiles;
                            const followerUsername = followerProfile?.username || 'user';
                            return (
                                <Link
                                    key={item.follower_id}
                                    href={`/profile/${followerUsername}`}
                                    className="p-4 hover:bg-white/[0.03] transition-colors flex items-center justify-between group"
                                >
                                    <div className="flex gap-3 items-center">
                                        <div className="w-10 h-10 rounded-full bg-[#333639] overflow-hidden flex items-center justify-center text-white font-bold">
                                            {followerProfile?.avatar_url ? (
                                                <img src={followerProfile.avatar_url} alt={followerUsername} className="w-full h-full object-cover" />
                                            ) : (
                                                followerUsername[0].toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-white group-hover:underline">@{followerUsername}</span>
                                                {followerProfile?.badge_type === 'premium' && (
                                                    <Verified className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0]" />
                                                )}
                                                {followerProfile?.badge_type === 'business' && (
                                                    <Verified className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                )}
                                            </div>
                                            <p className="text-[#71767b] text-sm">@{followerUsername}</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
