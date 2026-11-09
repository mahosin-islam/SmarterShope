'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowRight,
  Package,
  Clock,
  ExternalLink,
  AlertCircle,
  Truck,
  CheckCircle2,
  X,
  Search,
  Printer,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/authContext';
import { getAccessToken } from '@/features/auth/services/auth.service';

export interface OrderItem {
  id: string;
  productTitle: string;
  variantTitle?: string | null;
  quantity: number;
  unitPrice: number | string;
  total: number | string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number | string;
  shippingAmount: number | string;
  totalAmount: number | string;
  createdAt: string;
  shippingAddress?: any;
  items?: OrderItem[];
}

export default function AccountOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs: 'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Tracking Modal State
  const [trackingOrder, setTrackingOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
        const token = getAccessToken();
        const res = await fetch(`${API_URL}/orders`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        let fetchedList: OrderRecord[] = [];
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) {
            fetchedList = json.data;
          }
        }

        // Also merge with locally recorded orders (fallback)
        try {
          const localRaw = localStorage.getItem('modora_customer_orders');
          if (localRaw) {
            const localOrders: OrderRecord[] = JSON.parse(localRaw);
            for (const lo of localOrders) {
              if (!fetchedList.some((o) => o.orderNumber === lo.orderNumber || o.id === lo.id)) {
                fetchedList.unshift(lo);
              }
            }
          }
        } catch {
          //
        }

        if (isMounted) {
          setOrders(fetchedList);
        }
      } catch {
        // Fallback to local storage
        try {
          const localRaw = localStorage.getItem('modora_customer_orders');
          if (localRaw && isMounted) {
            setOrders(JSON.parse(localRaw));
          } else if (isMounted) {
            setOrders([]);
          }
        } catch {
          if (isMounted) setError('Network error while loading orders.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'PENDING':
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (activeTab === 'ACTIVE' && (order.status === 'DELIVERED' || order.status === 'CANCELLED')) {
      return false;
    }
    if (activeTab === 'DELIVERED' && order.status !== 'DELIVERED') {
      return false;
    }
    if (activeTab === 'CANCELLED' && order.status !== 'CANCELLED') {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesNum = order.orderNumber.toLowerCase().includes(q);
      const matchesItem = order.items?.some((i) => i.productTitle.toLowerCase().includes(q));
      return matchesNum || matchesItem;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-[#e8e6e3] p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#e8e6e3]">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#fff3ec] text-[#ff4600] flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-editorial text-2xl font-bold text-neutral-900">
              Order History &amp; Tracking
            </h1>
            <p className="text-xs text-neutral-500 font-light">
              Track parcel transit, download invoices, and manage deliveries.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order # or product..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600]"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-neutral-100 pb-3 mb-6 overflow-x-auto no-scrollbar">
        {[
          { key: 'ALL', label: 'All Orders' },
          { key: 'ACTIVE', label: 'In Progress / Active' },
          { key: 'DELIVERED', label: 'Delivered' },
          { key: 'CANCELLED', label: 'Cancelled' },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as any)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === key
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-[#e8e6e3] rounded-xl p-5 animate-pulse bg-neutral-50 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-neutral-200 rounded w-1/4" />
                <div className="h-5 bg-neutral-200 rounded-full w-20" />
              </div>
              <div className="h-3 bg-neutral-200 rounded w-1/3" />
              <div className="h-4 bg-neutral-200 rounded w-1/5" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && filteredOrders.length > 0 && (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const totalNum = Number(order.totalAmount) || 0;

            return (
              <div
                key={order.id}
                className="border border-[#e8e6e3] rounded-xl p-5 hover:border-neutral-400 transition-colors bg-white shadow-xs"
              >
                {/* Top Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-sm text-neutral-900 tracking-tight">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <span className="text-xs text-neutral-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formattedDate}</span>
                  </span>
                </div>

                {/* Items summary */}
                {order.items && order.items.length > 0 && (
                  <div className="space-y-1.5 mb-3 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="truncate pr-2 font-medium">
                          {item.productTitle} {item.variantTitle ? `(${item.variantTitle})` : ''} &times; {item.quantity}
                        </span>
                        <span className="shrink-0 font-semibold text-neutral-800">
                          ৳{Number(item.total).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Controls: Track Order & Details */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
                  <div className="text-xs text-neutral-500">
                    <span>Total Amount: </span>
                    <span className="font-bold text-sm text-[#ff4600]">
                      ৳{totalNum.toFixed(0)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {order.status !== 'CANCELLED' && (
                      <button
                        type="button"
                        onClick={() => setTrackingOrder(order)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#ff4600]" />
                        <span>Track Parcel</span>
                      </button>
                    )}

                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#ff4600] hover:bg-[#e03e00] rounded-lg transition-colors shadow-2xs"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredOrders.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-neutral-400 stroke-[1.5]" />
          </div>
          <h2 className="font-editorial text-xl font-bold text-neutral-900 mb-2">
            No Orders Found
          </h2>
          <p className="text-xs text-neutral-500 font-light max-w-sm mx-auto mb-6">
            {searchQuery
              ? 'No matching purchases found. Try searching for a different order ID.'
              : 'When you place an order, its real-time courier tracking and invoices will be available here.'}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 bg-[#ff4600] hover:bg-[#e03e00] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg transition-all"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Interactive Tracking Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#e8e6e3] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e8e6e3] flex items-center justify-between bg-neutral-50">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#ff4600] tracking-wider">
                  Live Dispatch Tracking
                </span>
                <h3 className="font-editorial text-xl font-bold text-neutral-900">
                  {trackingOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Courier info card */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-[#ff4600]">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">MODORA Express Courier</p>
                    <p className="text-neutral-500 text-[11px]">Est. Delivery: 2-3 Business Days</p>
                  </div>
                </div>
                <span className="font-bold text-[10px] uppercase px-2 py-1 rounded bg-green-100 text-green-700">
                  In Transit
                </span>
              </div>

              {/* Progress Milestones */}
              <div className="space-y-4 pl-2">
                {[
                  {
                    title: 'Order Confirmed',
                    desc: 'Your wardrobe order was received and verified.',
                    done: true,
                  },
                  {
                    title: 'Tailored & Packaged',
                    desc: 'Quality inspection and discreet packaging complete.',
                    done: trackingOrder.status !== 'PENDING',
                  },
                  {
                    title: 'Handed to Courier Partner',
                    desc: 'Package dispatched for last-mile destination transit.',
                    done: trackingOrder.status === 'SHIPPED' || trackingOrder.status === 'DELIVERED',
                  },
                  {
                    title: 'Out for Delivery & Delivered',
                    desc: 'Courier handover to your primary address.',
                    done: trackingOrder.status === 'DELIVERED',
                  },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-3 relative">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                        step.done
                          ? 'bg-[#ff4600] text-white'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      {step.done ? '✓' : idx + 1}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${step.done ? 'text-neutral-900' : 'text-neutral-400'}`}>
                        {step.title}
                      </p>
                      <p className="text-[11px] text-neutral-500 font-light">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end space-x-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setTrackingOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black rounded-lg border border-[#e8e6e3]"
                >
                  Close
                </button>
                <Link
                  href={`/account/orders/${trackingOrder.id}`}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#ff4600] hover:bg-[#e03e00] text-white rounded-lg shadow-xs"
                >
                  Full Invoice
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
