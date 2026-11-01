'use client';

// Customer Account Dashboard page.

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, MapPin, User, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/features/auth/authContext';

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.firstName ?? 'there';

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white border border-[#e8e6e3] rounded-xl p-6">
        <h2 className="text-xl font-bold text-neutral-800">
          Hello, {displayName}! 👋
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Welcome to your MODORA account. Manage your orders, profile and wishlist below.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            href: '/account/orders',
            label: 'My Orders',
            desc: 'Track and view your order history',
            icon: ShoppingBag,
            color: 'bg-blue-50 text-blue-600',
          },
          {
            href: '/account/wishlist',
            label: 'Wishlist',
            desc: 'Items you have saved for later',
            icon: Heart,
            color: 'bg-pink-50 text-pink-600',
          },
          {
            href: '/account/addresses',
            label: 'Addresses',
            desc: 'Manage your delivery addresses',
            icon: MapPin,
            color: 'bg-green-50 text-green-600',
          },
          {
            href: '/account/profile',
            label: 'Profile',
            desc: 'Update your personal information',
            icon: User,
            color: 'bg-orange-50 text-[#ff4600]',
          },
        ].map(({ href, label, desc, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 bg-white border border-[#e8e6e3] rounded-xl p-5 hover:border-[#ff4600] hover:bg-[#fff3ec] transition-colors group"
          >
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-800">{label}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-[#ff4600] transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* Recent orders placeholder */}
      <div className="bg-white border border-[#e8e6e3] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-neutral-800">Recent Orders</h3>
          <Link href="/account/orders" className="text-sm text-[#ff4600] hover:underline font-medium">
            View all
          </Link>
        </div>
        <div className="h-32 flex items-center justify-center border border-dashed border-[#e8e6e3] rounded-lg">
          <p className="text-sm text-neutral-400">No orders yet. Start shopping!</p>
        </div>
      </div>
    </div>
  );
}
