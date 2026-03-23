'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Users, Shield, AlertTriangle, BarChart3, DollarSign, FileText, Flag, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/feed');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: '12,345', icon: Users, change: '+12%' },
    { label: 'Active Today', value: '1,234', icon: Shield, change: '+5%' },
    { label: 'Reports Pending', value: '23', icon: Flag, change: '-8%' },
    { label: 'Revenue (MTD)', value: '₹4,56,789', icon: DollarSign, change: '+23%' },
  ];

  const menuItems = [
    { href: '/admin/users', icon: Users, label: 'User Management' },
    { href: '/admin/reports', icon: Flag, label: 'Reports' },
    { href: '/admin/content', icon: FileText, label: 'Content Moderation' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/admin/settings', icon: Settings, label: 'Platform Settings' },
  ];

  const recentActivity = [
    { type: 'user', message: 'New user registered: @johndoe', time: '2 min ago' },
    { type: 'report', message: 'Post reported for spam', time: '5 min ago' },
    { type: 'payment', message: 'Payment received: ₹500', time: '10 min ago' },
    { type: 'alert', message: 'High API error rate detected', time: '15 min ago' },
  ];

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Platform management and analytics</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Admin Access
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-dark-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-5 w-5 text-gray-400" />
                <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Menu */}
          <div className="md:col-span-1">
            <div className="bg-dark-200 rounded-xl p-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-dark-300 hover:text-white rounded-lg transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Alerts */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-4">
              <div className="flex items-center space-x-2 text-red-400 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Active Alerts</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-300">• 3 reports pending review</li>
                <li className="text-gray-300">• API latency above threshold</li>
              </ul>
            </div>
          </div>

          {/* Activity */}
          <div className="md:col-span-2">
            <div className="bg-dark-200 rounded-xl p-4">
              <h2 className="font-semibold text-white mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3 bg-dark-300 rounded-lg">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      activity.type === 'report' ? 'bg-red-500/20 text-red-400' :
                      activity.type === 'alert' ? 'bg-yellow-500/20 text-yellow-400' :
                      activity.type === 'payment' ? 'bg-green-500/20 text-green-400' :
                      'bg-primary-500/20 text-primary-400'
                    }`}>
                      {activity.type === 'report' ? <Flag className="h-4 w-4" /> :
                       activity.type === 'alert' ? <AlertTriangle className="h-4 w-4" /> :
                       activity.type === 'payment' ? <DollarSign className="h-4 w-4" /> :
                       <Users className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <button className="bg-dark-200 rounded-xl p-4 text-left hover:bg-dark-100 transition-colors">
                <p className="font-medium text-white mb-1">Broadcast Message</p>
                <p className="text-sm text-gray-400">Send notification to all users</p>
              </button>
              <button className="bg-dark-200 rounded-xl p-4 text-left hover:bg-dark-100 transition-colors">
                <p className="font-medium text-white mb-1">System Health</p>
                <p className="text-sm text-gray-400">Check platform status</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
