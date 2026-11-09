'use client';

// Customer Account Dashboard page.

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, MapPin, User, ArrowUpRight, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/authContext';

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number | string;
  createdAt: string;
  items?: Array<{ id: string; productTitle: string; quantity: number }>;
}

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.firstName ?? 'there';
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRecentOrders = async () => {
      try {
        setLoadingOrders(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
        const res = await fetch(`${API_URL}/orders?limit=3`, {
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            setRecentOrders(Array.isArray(json.data) ? json.data.slice(0, 3) : []);
          }
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) setLoadingOrders(false);
      }
    };

    fetchRecentOrders();
    return () => {
      isMounted = false;
    };
  }, [user]);

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

      {/* Recent orders */}
      <div className="bg-white border border-[#e8e6e3] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-neutral-800">Recent Orders</h3>
          <Link href="/account/orders" className="text-sm text-[#ff4600] hover:underline font-medium">
            View all
          </Link>
        </div>

        {loadingOrders ? (
          <div className="h-24 flex items-center justify-center bg-neutral-50 rounded-lg animate-pulse">
            <span className="text-xs text-neutral-400">Loading recent orders...</span>
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              });
              const total = Number(order.totalAmount) || 0;

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-lg border border-neutral-100 hover:border-neutral-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-neutral-900">{order.orderNumber}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-700">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formattedDate}</span>
                      <span>&bull;</span>
                      <span>{order.items?.length || 1} items</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-xs text-[#ff4600]">
                      ৳{total.toFixed(0)}
                    </span>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="p-1 text-neutral-400 hover:text-[#ff4600] transition-colors"
                      title="View Order Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-28 flex items-center justify-center border border-dashed border-[#e8e6e3] rounded-lg">
            <p className="text-sm text-neutral-400">No orders yet. Start shopping!</p>
          </div>
        )}
      </div>
    </div>
  );
}
