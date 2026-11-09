'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Package, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/authContext';

interface OrderItem {
  id: string;
  productTitle: string;
  variantTitle?: string | null;
  quantity: number;
  unitPrice: number | string;
  total: number | string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number | string;
  shippingAmount: number | string;
  totalAmount: number | string;
  createdAt: string;
  items?: OrderItem[];
}

export default function AccountOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
        const res = await fetch(`${API_URL}/orders`, {
          credentials: 'include',
        });

        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            setOrders(Array.isArray(json.data) ? json.data : []);
          }
        } else if (res.status === 401) {
          if (isMounted) setOrders([]);
        } else {
          if (isMounted) setError('Unable to load orders at this moment.');
        }
      } catch {
        if (isMounted) setError('Network error while loading orders.');
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

  return (
    <div className="bg-white rounded-2xl border border-[#e8e6e3] p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#e8e6e3]">
        <div className="w-9 h-9 rounded-full bg-[#fff3ec] text-[#ff4600] flex items-center justify-center">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-editorial text-2xl font-bold text-neutral-900">
            Order History
          </h1>
          <p className="text-xs text-neutral-500 font-light">
            Track and manage your atelier purchases and delivery status.
          </p>
        </div>
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
      {!isLoading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
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

                {/* Footer / Total & Link */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <div className="text-xs text-neutral-500">
                    <span>Total Amount: </span>
                    <span className="font-bold text-sm text-[#ff4600]">
                      ৳{totalNum.toFixed(0)}
                    </span>
                  </div>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-neutral-700 hover:text-[#ff4600] transition-colors"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && orders.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-neutral-400 stroke-[1.5]" />
          </div>
          <h2 className="font-editorial text-xl font-bold text-neutral-900 mb-2">
            No Orders Placed Yet
          </h2>
          <p className="text-xs text-neutral-500 font-light max-w-sm mx-auto mb-6">
            When you place orders through our boutique, their status, invoice, and courier tracking details will appear here.
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
    </div>
  );
}
