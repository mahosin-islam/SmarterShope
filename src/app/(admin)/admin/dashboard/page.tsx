// Admin Dashboard page — summary cards and welcome message.
// Populated with placeholder data; real data will come from analytics APIs in Phase 4.

import React from 'react';
import { Package, ShoppingCart, Users, TrendingUp, ArrowUpRight } from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
  color: string;
}

const STAT_CARDS: StatCard[] = [
  {
    title: 'Total Revenue',
    value: '৳0.00',
    change: '+0% this month',
    positive: true,
    icon: TrendingUp,
    color: 'bg-green-50 text-green-600',
  },
  {
    title: 'Total Orders',
    value: '0',
    change: '+0 this week',
    positive: true,
    icon: ShoppingCart,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Products',
    value: '0',
    change: 'Total active',
    positive: true,
    icon: Package,
    color: 'bg-orange-50 text-[#ff4600]',
  },
  {
    title: 'Customers',
    value: '0',
    change: '+0 new this week',
    positive: true,
    icon: Users,
    color: 'bg-purple-50 text-purple-600',
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-800">Welcome back 👋</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Here&apos;s what&apos;s happening in your MODORA store today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ title, value, change, positive, icon: Icon, color }) => (
          <div
            key={title}
            className="bg-white rounded-xl border border-[#e8e6e3] p-5 flex items-start justify-between shadow-sm"
          >
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">{title}</p>
              <p className="text-2xl font-bold text-neutral-800 mt-1">{value}</p>
              <p className={`text-xs mt-1.5 font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
                {change}
              </p>
            </div>
            <div className={`p-2.5 rounded-lg ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-[#e8e6e3] p-6 shadow-sm">
        <h3 className="text-base font-semibold text-neutral-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: 'Add Product', href: '/admin/products/add' },
            { label: 'View Orders', href: '/admin/orders' },
            { label: 'Manage Categories', href: '/admin/categories' },
            { label: 'Store Settings', href: '/admin/settings' },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="flex items-center justify-between px-4 py-3 bg-[#faf9f6] border border-[#e8e6e3] rounded-lg text-sm font-medium text-neutral-700 hover:border-[#ff4600] hover:text-[#ff4600] hover:bg-[#fff3ec] transition-colors group"
            >
              {label}
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </div>

      {/* Placeholder chart area */}
      <div className="bg-white rounded-xl border border-[#e8e6e3] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-neutral-800">Sales Overview</h3>
          <span className="text-xs text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-full">Last 30 days</span>
        </div>
        <div className="h-48 flex items-center justify-center border border-dashed border-[#e8e6e3] rounded-lg">
          <p className="text-sm text-neutral-400">
            📊 Analytics chart — available in Phase 4
          </p>
        </div>
      </div>
    </div>
  );
}
