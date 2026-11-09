'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  MapPin,
  User,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Truck,
  Search,
  Package,
} from 'lucide-react';
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
  const router = useRouter();
  const { user } = useAuth();
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email?.split('@')[0] || 'there';

  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);

  // Quick Tracking Search
  const [trackSearch, setTrackSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        setLoadingOrders(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
        const res = await fetch(`${API_URL}/orders?limit=3`, {
          credentials: 'include',
        });

        let list: RecentOrder[] = [];
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) {
            list = json.data;
          }
        }

        // Merge local storage orders if present
        try {
          const localRaw = localStorage.getItem('modora_customer_orders');
          if (localRaw) {
            const localList: RecentOrder[] = JSON.parse(localRaw);
            for (const item of localList) {
              if (!list.some((o) => o.orderNumber === item.orderNumber || o.id === item.id)) {
                list.unshift(item);
              }
            }
          }
        } catch {
          //
        }

        if (isMounted) {
          setOrders(list.slice(0, 3));
        }
      } catch {
        // Fallback
        try {
          const localRaw = localStorage.getItem('modora_customer_orders');
          if (localRaw && isMounted) {
            const localList: RecentOrder[] = JSON.parse(localRaw);
            setOrders(localList.slice(0, 3));
          }
        } catch {
          //
        }
      } finally {
        if (isMounted) setLoadingOrders(false);
      }
    };

    fetchDashboardData();

    // Load counts
    try {
      const wishRaw = localStorage.getItem('modora_wishlist');
      if (wishRaw) {
        const wish = JSON.parse(wishRaw);
        setWishlistCount(Array.isArray(wish) ? wish.length : 0);
      }

      const addrRaw = localStorage.getItem('modora_saved_addresses');
      if (addrRaw) {
        const addr = JSON.parse(addrRaw);
        setAddressCount(Array.isArray(addr) ? addr.length : 0);
      }
    } catch {
      //
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackSearch.trim()) {
      router.push(`/account/orders`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-white border border-[#e8e6e3] rounded-2xl p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#ff4600] mb-1 block">
              Atelier Client Portal
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-neutral-900">
              Welcome back, {displayName}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 font-light mt-1 max-w-lg">
              Manage your sartorial orders, view active parcel dispatches, and curate your wardrobe pieces.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Link
              href="/products"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#ff4600] hover:bg-[#e03e00] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition-colors"
            >
              <span>Explore Boutique</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Orders',
            value: orders.length,
            icon: ShoppingBag,
            color: 'bg-blue-50 text-blue-600',
            href: '/account/orders',
          },
          {
            label: 'Saved Wishlist',
            value: wishlistCount,
            icon: Heart,
            color: 'bg-pink-50 text-pink-600',
            href: '/account/wishlist',
          },
          {
            label: 'Saved Addresses',
            value: addressCount,
            icon: MapPin,
            color: 'bg-green-50 text-green-600',
            href: '/account/addresses',
          },
          {
            label: 'Client Profile',
            value: 'Verified',
            icon: User,
            color: 'bg-orange-50 text-[#ff4600]',
            href: '/account/profile',
          },
        ].map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="p-4 bg-white border border-[#e8e6e3] rounded-xl hover:border-neutral-400 transition-colors flex items-center space-x-3.5 group shadow-2xs"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-neutral-400 block truncate">{label}</span>
              <span className="font-bold text-base text-neutral-900 group-hover:text-[#ff4600] transition-colors">
                {value}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Tracking Bar */}
      <div className="bg-white border border-[#e8e6e3] rounded-xl p-5">
        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-neutral-700 shrink-0">
            <Truck className="w-4 h-4 text-[#ff4600]" />
            <span>Track Any Order:</span>
          </div>
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={trackSearch}
              onChange={(e) => setTrackSearch(e.target.value)}
              placeholder="Enter your Order Number e.g. MOD-123456"
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600]"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 text-xs font-bold uppercase tracking-wider bg-neutral-900 hover:bg-black text-white rounded-lg transition-colors"
          >
            Track Parcel
          </button>
        </form>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white border border-[#e8e6e3] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-neutral-900">Recent Orders</h3>
          <Link href="/account/orders" className="text-xs text-[#ff4600] hover:underline font-semibold">
            View all orders &rarr;
          </Link>
        </div>

        {loadingOrders ? (
          <div className="h-28 flex items-center justify-center bg-neutral-50 rounded-lg animate-pulse">
            <span className="text-xs text-neutral-400">Loading recent transactions...</span>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => {
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
          <div className="h-28 flex flex-col items-center justify-center border border-dashed border-[#e8e6e3] rounded-lg text-center p-4">
            <Package className="w-6 h-6 text-neutral-300 mb-1" />
            <p className="text-xs text-neutral-400">No purchases found yet. Discover our latest collection!</p>
          </div>
        )}
      </div>
    </div>
  );
}
