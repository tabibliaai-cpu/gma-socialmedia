'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { crmAPI } from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import { Users, DollarSign, TrendingUp, ShoppingCart, Plus, MoreVertical, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardData {
  leads: { total: number; new: number; hot: number; warm: number; cold: number; converted: number; };
  deals: { total: number; open: number; won: number; lost: number; totalValue: number; wonValue: number; };
  orders: { total: number; revenue: number; };
  commissions: { total: number; pending: number; paid: number; };
}

interface Lead {
  id: string; status: string; source: string; notes: string; created_at: string;
  profiles?: { username: string; avatar_url: string; };
}

interface Deal {
  id: string; title: string; value: number; status: string; expected_close_date: string;
  leads?: { profiles?: { username: string; }; };
}

export default function CRMPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect non-business users
    if (user && user.role !== 'business') {
      router.push('/feed');
      return;
    }
    if (user?.role === 'business') {
      loadData();
    }
  }, [user, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, leadsRes, dealsRes] = await Promise.all([
        crmAPI.getDashboard(),
        crmAPI.getLeads(),
        crmAPI.getDeals(),
      ]);
      setDashboard(dashRes.data);
      setLeads(leadsRes.data || []);
      setDeals(dealsRes.data || []);
    } catch (error) {
      console.error('Failed to load CRM data');
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
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d9bf0]"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black z-10 border-b border-[#2f3336] p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">CRM Dashboard</h1>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-transparent border border-[#2f3336] text-white rounded-full flex items-center space-x-2 hover:bg-[#181836]">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              <button className="px-4 py-2 bg-[#1d9bf0] text-white rounded-full flex items-center space-x-2 hover:bg-[#1a8cd8]">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Lead</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#16181c] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#71767b] text-sm">Total Leads</p>
                  <p className="text-2xl font-bold text-white">{dashboard?.leads.total || 0}</p>
                </div>
                <Users className="h-8 w-8 text-[#1d9bf0]" />
              </div>
            </div>

            <div className="bg-[#16181c] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#71767b] text-sm">Pipeline</p>
                  <p className="text-2xl font-bold text-white">₹{(dashboard?.deals.totalValue || 0).toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-[#16181c] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#71767b] text-sm">Revenue</p>
                  <p className="text-2xl font-bold text-white">₹{(dashboard?.orders.revenue || 0).toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-[#16181c] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#71767b] text-sm">Commissions</p>
                  <p className="text-2xl font-bold text-white">₹{(dashboard?.commissions.total || 0).toLocaleString()}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[#2f3336] mb-6 overflow-x-auto">
            <div className="flex space-x-8 min-w-max">
              {['overview', 'leads', 'deals', 'orders'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 font-medium capitalize ${
                    activeTab === tab
                      ? 'text-[#1d9bf0] border-b-2 border-[#1d9bf0]'
                      : 'text-[#71767b] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {activeTab === 'leads' && (
            <div className="bg-[#16181c] rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-black">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#71767b]">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#71767b]">Source</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#71767b]">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#71767b]">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#71767b]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2f3336]">
                  {leads.length > 0 ? leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#1a1a2a]">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] flex items-center justify-center text-white text-sm">
                            {lead.profiles?.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="text-white">{lead.profiles?.username || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#71767b] capitalize">{lead.source}</td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className={`px-2 py-1 rounded text-sm bg-transparent ${
                            lead.status === 'hot' ? 'text-red-400' :
                            lead.status === 'warm' ? 'text-yellow-400' :
                            lead.status === 'cold' ? 'text-blue-400' :
                            'text-green-400'
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="hot">Hot</option>
                          <option value="warm">Warm</option>
                          <option value="cold">Cold</option>
                          <option value="converted">Converted</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-[#71767b] text-sm">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-[#71767b] hover:text-white">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[#71767b]">
                        No leads yet. Start adding leads to track your customers!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Open Deals */}
              <div className="bg-[#16181c] rounded-xl p-4">
                <h3 className="font-semibold text-white mb-4">Open ({deals.filter(d => d.status === 'open').length})</h3>
                <div className="space-y-3">
                  {deals.filter(d => d.status === 'open').map((deal) => (
                    <div key={deal.id} className="bg-black rounded-lg p-3">
                      <p className="font-medium text-white">{deal.title}</p>
                      <p className="text-sm text-[#71767b]">₹{deal.value?.toLocaleString()}</p>
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
              <div className="bg-[#16181c] rounded-xl p-4">
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
              <div className="bg-[#16181c] rounded-xl p-4">
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

          {activeTab === 'overview' && (
            <div className="bg-[#16181c] rounded-xl p-6 text-center">
              <p className="text-[#71767b]">Select Leads or Deals tab to view and manage your CRM data.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
