'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adsAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Plus, Play, Pause, Trash2, Eye, MousePointer, DollarSign, Edit, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

interface Ad {
  id: string;
  type: string;
  title: string;
  description: string;
  media_url: string;
  target_url: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  is_active: boolean;
  created_at: string;
}

interface AdStats {
  totalAds: number;
  activeAds: number;
  totalBudget: number;
  totalSpent: number;
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
}

export default function AdsPage() {
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState<AdStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user?.role !== 'business' && user?.role !== 'creator') {
      window.location.href = '/feed';
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [adsRes, statsRes] = await Promise.all([
        adsAPI.getAll(),
        adsAPI.getStats(),
      ]);
      setAds(adsRes.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAd = async (id: string, currentStatus: boolean) => {
    try {
      await adsAPI.toggle(id, !currentStatus);
      setAds(ads.map(ad => 
        ad.id === id ? { ...ad, is_active: !currentStatus } : ad
      ));
      toast.success(currentStatus ? 'Ad paused' : 'Ad activated');
    } catch (error) {
      toast.error('Failed to update ad');
    }
  };

  const deleteAd = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    try {
      await adsAPI.delete(id);
      setAds(ads.filter(ad => ad.id !== id));
      toast.success('Ad deleted');
    } catch (error) {
      toast.error('Failed to delete ad');
    }
  };

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
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Ads Manager</h1>
            <p className="text-gray-400">Create and manage your advertising campaigns</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Ad</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm">Budget</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(stats?.totalBudget || 0)}</p>
            <p className="text-xs text-gray-500">{formatCurrency(stats?.totalSpent || 0)} spent</p>
          </div>

          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <Eye className="h-5 w-5" />
              <span className="text-sm">Impressions</span>
            </div>
            <p className="text-xl font-bold text-white">{stats?.totalImpressions?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <MousePointer className="h-5 w-5" />
              <span className="text-sm">Clicks</span>
            </div>
            <p className="text-xl font-bold text-white">{stats?.totalClicks?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm">CTR</span>
            </div>
            <p className="text-xl font-bold text-white">{stats?.averageCTR?.toFixed(2) || 0}%</p>
          </div>
        </div>

        {/* Ads List */}
        {ads.length === 0 ? (
          <div className="bg-dark-200 rounded-xl p-12 text-center">
            <BarChart3 className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No ads yet</h3>
            <p className="text-gray-400 mb-4">Create your first ad to start reaching more people</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Your First Ad
            </button>
          </div>
        ) : (
          <div className="bg-dark-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark-300">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Ad</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Budget</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Performance</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-dark-300">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        {ad.media_url && (
                          <img src={ad.media_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="font-medium text-white">{ad.title || 'Untitled Ad'}</p>
                          <p className="text-sm text-gray-400 line-clamp-1">{ad.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded capitalize">
                        {ad.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-white">{formatCurrency(ad.budget)}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(ad.spent)} spent</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <p className="text-gray-300">{ad.impressions?.toLocaleString()} impressions</p>
                        <p className="text-gray-400">{ad.clicks?.toLocaleString()} clicks</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        ad.is_active 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {ad.is_active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleAd(ad.id, ad.is_active)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-dark-200 rounded-lg"
                          title={ad.is_active ? 'Pause' : 'Activate'}
                        >
                          {ad.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-white hover:bg-dark-200 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteAd(ad.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-200 rounded-lg"
                          title="Delete"
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

        {/* Create Ad Modal */}
        {showCreateModal && (
          <CreateAdModal onClose={() => setShowCreateModal(false)} onCreated={loadData} />
        )}
      </div>
    </div>
  );
}

function CreateAdModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [type, setType] = useState('feed');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [budget, setBudget] = useState(500);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adsAPI.create({
        type,
        title,
        description,
        target_url: targetUrl,
        media_url: mediaUrl || undefined,
        budget,
      });
      toast.success('Ad created successfully!');
      onCreated();
      onClose();
    } catch (error) {
      toast.error('Failed to create ad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-200 rounded-2xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold text-white mb-4">Create New Ad</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ad Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="feed">Feed Ad</option>
              <option value="comment">Comment Ad</option>
              <option value="profile">Profile Ad</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ad title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={2}
              placeholder="Ad description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target URL</label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Budget (₹)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              min={100}
              className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Image URL (optional)</label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://example.com/image.jpg"
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
              {loading ? 'Creating...' : 'Create Ad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
