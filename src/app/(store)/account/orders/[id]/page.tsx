'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  Clock,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/authContext';
import { getAccessToken } from '@/features/auth/services/auth.service';

interface OrderItem {
  id: string;
  productId: string;
  variantId?: string | null;
  productTitle: string;
  variantTitle?: string | null;
  sku: string;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  total: number | string;
}

interface PaymentRecord {
  id: string;
  provider: string;
  status: string;
  amount: number | string;
}

interface ShippingAddress {
  address?: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
  altPhone?: string;
  deliveryNote?: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number | string;
  discountAmount: number | string;
  shippingAmount: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress: ShippingAddress;
  shippingMethod?: string | null;
  trackingNumber?: string | null;
  createdAt: string;
  items: OrderItem[];
  payments: PaymentRecord[];
}

function OrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    let isMounted = true;
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
        const token = getAccessToken();
        const res = await fetch(`${API_URL}/orders/${orderId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          const json = await res.json();
          if (isMounted) setOrder(json.data);
        } else if (res.status === 404) {
          if (isMounted) setError('Order not found.');
        } else {
          if (isMounted) setError('Failed to retrieve order details.');
        }
      } catch {
        if (isMounted) setError('Network error while retrieving order.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId, user]);

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

  const getStepActive = (step: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED', currentStatus: string) => {
    const orderRanks: Record<string, number> = {
      PENDING: 1,
      CONFIRMED: 2,
      SHIPPED: 3,
      DELIVERED: 4,
    };
    const currentRank = orderRanks[currentStatus] || 1;
    const stepRank = orderRanks[step] || 1;
    return currentRank >= stepRank;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8e6e3] p-6 sm:p-8 space-y-6 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/4" />
        <div className="h-28 bg-neutral-100 rounded-xl" />
        <div className="h-44 bg-neutral-100 rounded-xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8e6e3] p-8 text-center">
        <AlertCircle className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
        <h2 className="font-editorial text-xl font-bold text-neutral-900 mb-2">
          {error || 'Order Details Unavailable'}
        </h2>
        <p className="text-xs text-neutral-500 mb-6">
          The requested order could not be located in your account records.
        </p>
        <button
          type="button"
          onClick={() => router.push('/account/orders')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-[#ff4600] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </button>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subtotalNum = Number(order.subtotal) || 0;
  const shippingNum = Number(order.shippingAmount) || 0;
  const discountNum = Number(order.discountAmount) || 0;
  const totalNum = Number(order.totalAmount) || 0;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white rounded-2xl border border-[#e8e6e3] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#e8e6e3]">
          <div>
            <Link
              href="/account/orders"
              className="inline-flex items-center space-x-1.5 text-xs text-neutral-500 hover:text-black mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Orders</span>
            </Link>
            <div className="flex items-center space-x-3">
              <h1 className="font-editorial text-2xl font-bold text-neutral-900">
                {order.orderNumber}
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-neutral-400 block">Placed on</span>
            <span className="text-xs font-medium text-neutral-700">{formattedDate}</span>
          </div>
        </div>

        {/* Order Progress Stepper */}
        {order.status !== 'CANCELLED' && (
          <div className="pt-6">
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
              {[
                { label: 'Pending', step: 'PENDING' },
                { label: 'Confirmed', step: 'CONFIRMED' },
                { label: 'Shipped', step: 'SHIPPED' },
                { label: 'Delivered', step: 'DELIVERED' },
              ].map(({ label, step }) => {
                const active = getStepActive(step as any, order.status);
                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] mb-1.5 transition-colors ${
                        active
                          ? 'bg-[#ff4600] text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-400'
                      }`}
                    >
                      {active ? '✓' : '•'}
                    </div>
                    <span
                      className={`font-semibold uppercase tracking-wider ${
                        active ? 'text-neutral-900' : 'text-neutral-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Items & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Items list */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#e8e6e3] p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-neutral-900 mb-4 flex items-center space-x-2">
            <Package className="w-4 h-4 text-[#ff4600]" />
            <span>Order Items ({order.items?.length || 0})</span>
          </h2>

          <div className="divide-y divide-neutral-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3.5 flex justify-between items-center gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-neutral-900 truncate">
                    {item.productTitle}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-neutral-400 mt-0.5">
                    {item.variantTitle && <span>Size: {item.variantTitle}</span>}
                    {item.sku && <span>SKU: {item.sku}</span>}
                    <span>Qty: {item.quantity}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-sm text-neutral-900 block">
                    ৳{Number(item.total).toFixed(0)}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    ৳{Number(item.unitPrice).toFixed(0)} each
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="mt-6 pt-4 border-t border-[#e8e6e3] space-y-2 text-xs text-neutral-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-neutral-900">৳{subtotalNum.toFixed(0)}</span>
            </div>
            {discountNum > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span className="font-medium">-৳{discountNum.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-medium text-neutral-900">৳{shippingNum.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-100">
              <span>Total Paid / Payable</span>
              <span className="text-[#ff4600] font-editorial text-lg">৳{totalNum.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Right: Shipping & Payment details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-[#e8e6e3] p-6">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-neutral-900 mb-3 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#ff4600]" />
              <span>Delivery Details</span>
            </h3>

            <div className="text-xs text-neutral-600 space-y-1.5">
              <p className="font-bold text-neutral-900">{order.customerName}</p>
              {order.customerPhone && <p>{order.customerPhone}</p>}
              <p className="text-neutral-500">{order.customerEmail}</p>

              <div className="pt-2 border-t border-neutral-100 mt-2">
                <p className="text-neutral-800 font-medium">{order.shippingAddress?.address || 'Standard Address'}</p>
                <p className="text-neutral-500 text-[11px]">
                  {[
                    order.shippingAddress?.union,
                    order.shippingAddress?.upazila,
                    order.shippingAddress?.district,
                    order.shippingAddress?.division,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {order.shippingAddress?.altPhone && (
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Alt Phone: {order.shippingAddress.altPhone}
                  </p>
                )}
                {order.shippingAddress?.deliveryNote && (
                  <p className="text-[11px] text-neutral-400 italic mt-1">
                    Note: &ldquo;{order.shippingAddress.deliveryNote}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-[#e8e6e3] p-6">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-neutral-900 mb-3 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-[#ff4600]" />
              <span>Payment Info</span>
            </h3>

            <div className="text-xs text-neutral-600 space-y-2">
              {order.payments && order.payments.length > 0 ? (
                order.payments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-neutral-800">
                      {p.provider}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-200 text-neutral-700">
                      {p.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 flex justify-between items-center">
                  <span className="font-semibold text-neutral-800">Cash on Delivery</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Pay on Receipt
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl border border-[#e8e6e3] p-8 text-center text-xs text-neutral-400">
          Loading order records...
        </div>
      }
    >
      <OrderDetailContent />
    </Suspense>
  );
}
