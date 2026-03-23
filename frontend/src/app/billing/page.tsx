'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { CreditCard, Calendar, DollarSign, ChevronDown, Download, Filter } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { paymentsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  created_at: string;
  metadata?: any;
}

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data } = await paymentsAPI.getTransactions();
      setTransactions(data || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  const typeLabels: Record<string, string> = {
    chat: 'Paid Chat',
    subscription: 'Subscription',
    affiliate: 'Affiliate',
    article: 'Article Purchase',
    ad: 'Ad Payment',
  };

  const statusColors: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    failed: 'bg-red-500/20 text-red-400',
    refunded: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6">Billing & Subscriptions</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <CreditCard className="h-5 w-5" />
              <span>Total Spent</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0))}
            </p>
          </div>

          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <DollarSign className="h-5 w-5" />
              <span>This Month</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(
                transactions
                  .filter(t => t.status === 'completed' && new Date(t.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </p>
          </div>

          <div className="bg-dark-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <Calendar className="h-5 w-5" />
              <span>Transactions</span>
            </div>
            <p className="text-2xl font-bold text-white">{transactions.length}</p>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-dark-200 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-white mb-4">Active Subscriptions</h2>
          <div className="text-center py-8 text-gray-500">
            No active subscriptions
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-dark-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="font-semibold text-white">Transaction History</h2>
            <div className="flex items-center space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-dark-300 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                <option value="chat">Chat</option>
                <option value="subscription">Subscription</option>
                <option value="article">Articles</option>
                <option value="ad">Ads</option>
              </select>
              <button className="p-2 bg-dark-300 text-gray-400 hover:text-white rounded-lg">
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No transactions found
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-dark-300">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-dark-300">
                    <td className="px-4 py-4">
                      <span className="text-white">{typeLabels[transaction.type] || transaction.type}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-white font-medium">{formatCurrency(transaction.amount, transaction.currency)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${statusColors[transaction.status]}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-400 text-sm">
                      {formatDate(transaction.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
