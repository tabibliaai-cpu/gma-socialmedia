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
    if (user?.role !== 'business') {
      window.location.href = '/feed';
      return;
    }
    loadAffiliates();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Affiliates</h1>
            <p className="text-gray-400">Manage your brand ambassadors</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Affiliate</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <Users className="h-5 w-5" />
              <span>Total Affiliates</span>
            </div>
            <p className="text-2xl font-bold text-white">{affiliates.length}</p>
          </div>

          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <Award className="h-5 w-5" />
              <span>Free Slots</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {Math.max(0, freeSlotsMax - freeSlotsUsed)} / {freeSlotsMax}
            </p>
          </div>

          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <DollarSign className="h-5 w-5" />
              <span>Extra Slot Cost</span>
            </div>
            <p className="text-2xl font-bold text-white">₹75</p>
          </div>
        </div>

        {/* Slots Warning */}
        {needsPayment && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <p className="text-yellow-400">
              You've used all 10 free affiliate slots. Additional slots cost ₹75 each.
            </p>
            <button className="mt-2 px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium">
              Purchase Slots
            </button>
          </div>
        )}

        {/* Affiliates List */}
        {affiliates.length === 0 ? (
          <div className="bg-dark-200 rounded-xl p-12 text-center">
            <Award className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No affiliates yet</h3>
            <p className="text-gray-400 mb-4">Add users as affiliates to promote your brand</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Add Your First Affiliate
            </button>
          </div>
        ) : (
          <div className="bg-dark-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark-300">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Badge Label</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {affiliates.map((affiliate) => (
                  <tr key={affiliate.id} className="hover:bg-dark-300">
                    <td className="px-4 py-4">
                      <Link
                        href={`/profile/${affiliate.profiles.username}`}
                        className="flex items-center space-x-3"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white overflow-hidden">
                          {affiliate.profiles.avatar_url ? (
                            <img src={affiliate.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            affiliate.profiles.username.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{affiliate.profiles.username}</p>
                          {affiliate.profiles.badge_type !== 'none' && (
                            <span className="text-xs text-primary-400">Verified</span>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
                        {affiliate.badge_label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        affiliate.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {affiliate.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/profile/${affiliate.profiles.username}`}
                          className="p-2 text-gray-400 hover:text-white"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleRemove(affiliate.id)}
                          className="p-2 text-gray-400 hover:text-red-400"
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
  const [userId, setUserId] = useState('');
  const [badgeLabel, setBadgeLabel] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await affiliatesAPI.create(userId, badgeLabel);
      toast.success('Affiliate added!');
      onAdded();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add affiliate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-200 rounded-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-white mb-4">Add Affiliate</h2>

        {needsPayment && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
            <p className="text-yellow-400 text-sm">
              You've used all free slots. This will cost ₹75.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user's ID"
              className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Badge Label</label>
            <input
              type="text"
              value={badgeLabel}
              onChange={(e) => setBadgeLabel(e.target.value)}
              placeholder="e.g., Brand Ambassador"
              className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              maxLength={50}
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-dark-300 text-white rounded-lg hover:bg-dark-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-800"
            >
              {loading ? 'Adding...' : needsPayment ? 'Pay ₹75 & Add' : 'Add Affiliate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
