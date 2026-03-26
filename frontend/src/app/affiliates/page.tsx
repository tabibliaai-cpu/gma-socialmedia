'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { affiliatesAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Users, Award, Plus, Trash2, DollarSign, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Affiliate {
  id: string;
  user_id: string;
  badge_label: string;
  is_active: boolean;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
    badge_type: string;
  };
}

export default function AffiliatesPage() {
  const { user } = useAuth();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Check if they are a business account
    if (user && user.profile?.badge_type !== 'business') {
      window.location.href = '/feed';
      return;
    }
    if (user) loadAffiliates();
  }, [user]);

  const loadAffiliates = async () => {
    try {
      const { data } = await affiliatesAPI.getBusinessAffiliates();
      setAffiliates(data || []);
    } catch (error) {
      console.error('Failed to load affiliates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this affiliate?')) return;
    try {
      await affiliatesAPI.remove(id);
      setAffiliates(affiliates.filter(a => a.id !== id));
      toast.success('Affiliate removed');
    } catch (error) {
      toast.error('Failed to remove affiliate');
    }
  };

  const freeSlotsUsed = affiliates.length;
  const freeSlotsMax = 10;
  const needsPayment = freeSlotsUsed >= freeSlotsMax;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1d9bf0]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 border-b border-[#2f3336] pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Affiliates Dashboard</h1>
            <p className="text-[#71767b]">Manage your verified agents and brand ambassadors</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#ffd700] hover:bg-[#e6c200] text-black font-bold rounded-full flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Affiliate</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#181836] border border-[#2f3336] rounded-xl p-4">
            <div className="flex items-center space-x-2 text-[#71767b] mb-2">
              <Users className="h-5 w-5 text-[#1d9bf0]" />
              <span>Total Affiliates</span>
            </div>
            <p className="text-2xl font-bold text-white">{affiliates.length}</p>
          </div>

          <div className="bg-[#181836] border border-[#2f3336] rounded-xl p-4">
            <div className="flex items-center space-x-2 text-[#71767b] mb-2">
              <Award className="h-5 w-5 text-[#ffd700]" />
              <span>Free Slots</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {Math.max(0, freeSlotsMax - freeSlotsUsed)} / {freeSlotsMax}
            </p>
          </div>

          <div className="bg-[#181836] border border-[#2f3336] rounded-xl p-4">
            <div className="flex items-center space-x-2 text-[#71767b] mb-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span>Extra Slot Cost</span>
            </div>
            <p className="text-2xl font-bold text-white">₹75</p>
          </div>
        </div>

        {/* Slots Warning */}
        {needsPayment && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <p className="text-yellow-400 font-medium">
              You've used all 10 free affiliate slots. Additional slots cost ₹75 each.
            </p>
            <button className="mt-3 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full font-bold transition-colors">
              Purchase Slots
            </button>
          </div>
        )}

        {/* Affiliates List */}
        {affiliates.length === 0 ? (
          <div className="border border-[#2f3336] rounded-xl p-12 text-center mt-8">
            <Award className="h-16 w-16 mx-auto text-[#71767b] mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No affiliates yet</h3>
            <p className="text-[#71767b] mb-6">Assign the "Verified Agent" badge to users to promote your business.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2.5 bg-[#ffd700] text-black font-bold rounded-full hover:bg-[#e6c200] transition-colors"
            >
              Add Your First Affiliate
            </button>
          </div>
        ) : (
          <div className="border border-[#2f3336] rounded-xl overflow-hidden mt-8">
            <table className="w-full">
              <thead className="bg-[#151515] border-b border-[#2f3336]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#71767b]">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#71767b]">Official Badge</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#71767b]">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#71767b]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2f3336] bg-black">
                {affiliates.map((affiliate) => (
                  <tr key={affiliate.id} className="hover:bg-[#181836] transition-colors">
                    <td className="px-4 py-4">
                      <Link
                        href={`/profile/${affiliate.profiles?.username}`}
                        className="flex items-center space-x-3"
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] flex items-center justify-center text-white font-bold overflow-hidden">
                          {affiliate.profiles?.avatar_url ? (
                            <img src={affiliate.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            affiliate.profiles?.username?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white hover:underline">{affiliate.profiles?.username}</p>
                          <span className="text-sm text-[#71767b]">@{affiliate.profiles?.username}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 bg-[#ffd700]/10 border border-[#ffd700]/30 text-[#ffd700] rounded-full text-sm font-medium flex inline-flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        {affiliate.badge_label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        affiliate.is_active ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-[#71767b]'
                      }`}>
                        {affiliate.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/profile/${affiliate.profiles?.username}`}
                          className="p-2 text-[#71767b] hover:text-[#1d9bf0] transition-colors rounded-full hover:bg-[#1d9bf0]/10"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleRemove(affiliate.id)}
                          className="p-2 text-[#71767b] hover:text-red-500 transition-colors rounded-full hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <AddAffiliateModal
            onClose={() => setShowAddModal(false)}
            onAdded={loadAffiliates}
            needsPayment={needsPayment}
          />
        )}
      </div>
    </div>
  );
}

function AddAffiliateModal({ onClose, onAdded, needsPayment }: { onClose: () => void; onAdded: () => void; needsPayment: boolean }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // The API will now send `{ username }` instead of `{ userId, badgeLabel }`
      await affiliatesAPI.create({ username });
      toast.success('Affiliate added successfully!');
      onAdded();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add affiliate. Make sure the username is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#151515] border border-[#2f3336] rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold text-white mb-2">Assign Verified Agent</h2>
        <p className="text-[#71767b] text-sm mb-6">Enter the username of the person you want to represent your business.</p>

        {needsPayment && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
            <p className="text-yellow-400 text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              You've used all 10 free slots. Adding this affiliate will cost ₹75.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-white mb-2">Target Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71767b] font-bold">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace('@', ''))}
                placeholder="username"
                className="w-full pl-9 pr-4 py-3 bg-black border border-[#2f3336] rounded-xl text-white focus:outline-none focus:border-[#1d9bf0] transition-colors"
                required
              />
            </div>
            <p className="text-[#71767b] text-xs mt-2">
              They will receive the badge: <strong className="text-white">"Verified Agent - [Your Business]"</strong>
            </p>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-transparent border border-[#2f3336] text-white font-bold rounded-full hover:bg-[#181836] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !username}
              className="flex-1 py-3 bg-[#ffd700] text-black font-bold rounded-full hover:bg-[#e6c200] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Adding...' : needsPayment ? 'Pay ₹75 & Add' : 'Assign Badge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
