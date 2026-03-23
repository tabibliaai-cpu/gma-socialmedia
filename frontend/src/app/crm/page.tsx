'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { crmAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Users, DollarSign, TrendingUp, ShoppingCart, Plus, MoreVertical, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface DashboardData {
  leads: {
    total: number;
    new: number;
    hot: number;
    warm: number;
    cold: number;
    converted: number;
  };
  deals: {
    total: number;
    open: number;
    won: number;
    lost: number;
    totalValue: number;
    wonValue: number;
  };
  orders: {
    total: number;
    revenue: number;
  };
  commissions: {
    total: number;
    pending: number;
    paid: number;
  };
}

interface Lead {
  id: string;
  status: string;
  source: string;
  notes: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

interface Deal {
  id: string;
  title: string;
  value: number;
  status: string;
  expected_close_date: string;
  leads?: {
    profiles?: {
      username: string;
    };
  };
}

export default function CRMPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'business') {
      window.location.href = '/feed';
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, leadsRes, dealsRes] = await Promise.all([
        crmAPI.getDashboard(),
        crmAPI.getLeads(),
        crmAPI.getDeals(),
      ]);
      setDashboard(dashRes.data);
      setLeads(leadsRes.data);
      setDeals(dealsRes.data);
    } catch (error) {
      toast.error('Failed to load CRM data');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      await crmAPI.updateLeadStatus(id, status);
      loadData();
      toast.success('Lead status updated');
    } catch (error) {
      toast.error('Failed to update lead');
    }
  };

  const updateDealStatus = async (id: string, status: string) => {
    try {
      await crmAPI.updateDealStatus(id, status);
      loadData();
      toast.success('Deal status updated');
    } catch (error) {
      toast.error('Failed to update deal');
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">CRM Dashboard</h1>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-dark-200 text-white rounded-lg flex items-center space-x-2 hover:bg-dark-100">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center space-x-2 hover:bg-primary-700">
              <Plus className="h-4 w-4" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Leads</p>
                <p className="text-2xl font-bold text-white">{dashboard?.leads.total || 0}</p>
              </div>
              <Users className="h-8 w-8 text-primary-400" />
            </div>
            <div className="mt-2 text-xs text-green-400">+12% this week</div>
          </div>

          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pipeline Value</p>
                <p className="text-2xl font-bold text-white">₹{dashboard?.deals.totalValue.toLocaleString() || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
            <div className="mt-2 text-xs text-green-400">+8% this month</div>
          </div>

          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Revenue</p>
                <p className="text-2xl font-bold text-white">₹{dashboard?.orders.revenue.toLocaleString() || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="mt-2 text-xs text-green-400">+15% this month</div>
          </div>

          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Commissions</p>
                <p className="text-2xl font-bold text-white">₹{dashboard?.commissions.total.toLocaleString() || 0}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-400" />
            </div>
            <div className="mt-2 text-xs text-yellow-400">₹{dashboard?.commissions.pending} pending</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <div className="flex space-x-8">
            {['overview', 'leads', 'deals', 'orders'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 font-medium capitalize ${
                  activeTab === tab
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'leads' && (
          <div className="bg-dark-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark-300">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Source</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-dark-300">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm">
                          {lead.profiles?.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-white">{lead.profiles?.username || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 capitalize">{lead.source}</td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className={`px-2 py-1 rounded text-sm ${
                          lead.status === 'hot' ? 'bg-red-500/20 text-red-400' :
                          lead.status === 'warm' ? 'bg-yellow-500/20 text-yellow-400' :
                          lead.status === 'cold' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="hot">Hot</option>
                        <option value="warm">Warm</option>
                        <option value="cold">Cold</option>
                        <option value="converted">Converted</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-gray-400 hover:text-white">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Open Deals */}
            <div className="bg-dark-200 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-4">Open ({deals.filter(d => d.status === 'open').length})</h3>
              <div className="space-y-3">
                {deals.filter(d => d.status === 'open').map((deal) => (
                  <div key={deal.id} className="bg-dark-300 rounded-lg p-3">
                    <p className="font-medium text-white">{deal.title}</p>
                    <p className="text-sm text-gray-400">₹{deal.value?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{deal.leads?.profiles?.username}</p>
                    <button
                      onClick={() => updateDealStatus(deal.id, 'won')}
                      className="mt-2 text-xs text-green-400 hover:text-green-300"
                    >
                      Mark as Won
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Won Deals */}
            <div className="bg-dark-200 rounded-xl p-4">
              <h3 className="font-semibold text-green-400 mb-4">Won ({deals.filter(d => d.status === 'won').length})</h3>
              <div className="space-y-3">
                {deals.filter(d => d.status === 'won').map((deal) => (
                  <div key={deal.id} className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                    <p className="font-medium text-white">{deal.title}</p>
                    <p className="text-sm text-green-400">₹{deal.value?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Lost Deals */}
            <div className="bg-dark-200 rounded-xl p-4">
              <h3 className="font-semibold text-red-400 mb-4">Lost ({deals.filter(d => d.status === 'lost').length})</h3>
              <div className="space-y-3">
                {deals.filter(d => d.status === 'lost').map((deal) => (
                  <div key={deal.id} className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                    <p className="font-medium text-white">{deal.title}</p>
                    <p className="text-sm text-red-400">₹{deal.value?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
