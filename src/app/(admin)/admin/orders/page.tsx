'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ShoppingBag, Search, ChevronLeft, ChevronRight, RefreshCw,
  Eye, Truck, CheckCircle, XCircle, Package, Clock,
  MapPin, ChevronDown, X, Loader2, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { getAccessToken } from '@/features/auth/services/auth.service';

// ─── Types ──────────────────────────────────────────────────────────────────

type OrderStatus =
  | 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED'
  | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED' | 'CANCELLED' | 'REFUNDED';

type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  customerName: string | null;
  customerEmail: string | null;
  destination: string | null;
  carrier: string | null;
  itemCount: number;
  trackingNumber: string | null;
  shippingMethod: string | null;
  paymentStatus: PaymentStatus | null;
  paymentProvider: string | null;
  createdAt: string;
  user: { id: string; firstName: string | null; lastName: string | null; email: string } | null;
}

interface Meta {
  page: number; limit: number; total: number; totalPages: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function apiFetch(path: string, options?: RequestInit) {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) ?? {}),
  };
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? 'Request failed');
  return json;
}

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; dot: string }> = {
  PENDING:          { label: 'Pending',          color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200',  dot: 'bg-yellow-500' },
  CONFIRMED:        { label: 'Confirmed',         color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     dot: 'bg-blue-500' },
  PROCESSING:       { label: 'Processing',        color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', dot: 'bg-indigo-500' },
  SHIPPED:          { label: 'Shipped',           color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', dot: 'bg-purple-500' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',  color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
  DELIVERED:        { label: 'Delivered',         color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   dot: 'bg-green-500' },
  RETURNED:         { label: 'Returned',          color: 'text-gray-700',   bg: 'bg-gray-50 border-gray-200',     dot: 'bg-gray-500' },
  CANCELLED:        { label: 'Cancelled',         color: 'text-red-700',    bg: 'bg-red-50 border-red-200',       dot: 'bg-red-500' },
  REFUNDED:         { label: 'Refunded',          color: 'text-pink-700',   bg: 'bg-pink-50 border-pink-200',     dot: 'bg-pink-500' },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${m.bg} ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Status Update Modal ─────────────────────────────────────────────────────

const ALLOWED_NEXT: Record<OrderStatus, OrderStatus[]> = {
  PENDING:          ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:        ['PROCESSING', 'CANCELLED'],
  PROCESSING:       ['SHIPPED', 'CANCELLED'],
  SHIPPED:          ['OUT_FOR_DELIVERY', 'DELIVERED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED'],
  DELIVERED:        ['RETURNED', 'REFUNDED'],
  RETURNED:         ['REFUNDED'],
  CANCELLED:        [],
  REFUNDED:         [],
};

interface StatusModalProps {
  order: AdminOrder;
  onClose: () => void;
  onDone: () => void;
}

function StatusModal({ order, onClose, onDone }: StatusModalProps) {
  const nexts = ALLOWED_NEXT[order.status];
  const [selected, setSelected] = useState<OrderStatus | ''>(nexts[0] ?? '');
  const [tracking, setTracking] = useState(order.trackingNumber ?? '');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const needsTracking = selected === 'SHIPPED' || selected === 'OUT_FOR_DELIVERY';
  const isCancel = selected === 'CANCELLED';

  async function submit() {
    setError('');
    if (!selected) return;
    setLoading(true);
    try {
      if (isCancel) {
        if (!reason.trim()) { setError('Please enter a cancellation reason.'); setLoading(false); return; }
        await apiFetch(`/admin/orders/${order.id}/cancel`, {
          method: 'POST', body: JSON.stringify({ reason }),
        });
      } else {
        if (needsTracking && !tracking.trim()) {
          setError('Tracking number is required for shipping.'); setLoading(false); return;
        }
        await apiFetch(`/admin/orders/${order.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: selected, trackingNumber: tracking || undefined, note: note || undefined }),
        });
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Update Order</p>
            <p className="text-sm font-bold text-gray-900">{order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Current:</span>
            <StatusBadge status={order.status} />
          </div>

          {nexts.length === 0 ? (
            <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 text-center">
              This order is in a final state and cannot be updated further.
            </p>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">New Status</label>
                <div className="flex flex-wrap gap-2">
                  {nexts.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelected(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        selected === s
                          ? 'bg-[#ff4600] border-[#ff4600] text-white'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {STATUS_META[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {needsTracking && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Tracking Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    placeholder="e.g. BD123456789"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4600] focus:border-transparent"
                  />
                </div>
              )}

              {isCancel ? (
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Cancellation Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="Why is this order being cancelled?"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4600] focus:border-transparent resize-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Note (optional)</label>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Internal note for this status change"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4600] focus:border-transparent"
                  />
                </div>
              )}

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
                </p>
              )}
            </>
          )}
        </div>

        {nexts.length > 0 && (
          <div className="flex gap-2 p-5 pt-0">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading || !selected}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition flex items-center justify-center gap-2 ${
                isCancel ? 'bg-red-500 hover:bg-red-600' : 'bg-[#ff4600] hover:bg-[#e03e00]'
              } disabled:opacity-60`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isCancel ? 'Confirm Cancel' : 'Update Status'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All Orders', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Refunded', value: 'REFUNDED' },
];

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOrder, setModalOrder] = useState<AdminOrder | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const json = await apiFetch(`/admin/orders?${params}`);
      setOrders(json.data ?? []);
      if (json.meta) setMeta(json.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  function handleDone() {
    setModalOrder(null);
    fetchOrders();
  }

  const customerName = (o: AdminOrder) =>
    o.customerName || (o.user ? [o.user.firstName, o.user.lastName].filter(Boolean).join(' ') : '—');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff4600]">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Orders & Fulfillment</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {meta.total > 0 ? `${meta.total} total orders` : 'Manage and fulfill customer orders'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            ← Dashboard
          </Link>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Orders', value: meta.total, icon: ShoppingBag, color: 'text-gray-700', bg: 'bg-gray-50' },
          { label: 'Pending', value: orders.filter(o => o.status === 'PENDING').length, icon: Clock, color: 'text-yellow-700', bg: 'bg-yellow-50' },
          { label: 'In Transit', value: orders.filter(o => ['SHIPPED','OUT_FOR_DELIVERY'].includes(o.status)).length, icon: Truck, color: 'text-purple-700', bg: 'bg-purple-50' },
          { label: 'Delivered', value: orders.filter(o => o.status === 'DELIVERED').length, icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer name, email, tracking..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4600] focus:border-transparent"
          />
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                statusFilter === f.value
                  ? 'bg-[#ff4600] border-[#ff4600] text-white'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#ff4600] animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <button onClick={fetchOrders} className="text-xs text-[#ff4600] font-semibold hover:underline">Try again</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Package className="w-10 h-10 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">No orders found</p>
            <p className="text-xs text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Items</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">{order.orderNumber}</p>
                        {order.trackingNumber && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Truck className="w-3 h-3" /> {order.trackingNumber}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-gray-800 text-xs">{customerName(order)}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{order.customerEmail ?? order.user?.email}</p>
                        {order.destination && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />{order.destination}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-gray-600 font-medium">{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-gray-900 text-sm">৳{order.totalAmount.toLocaleString()}</p>
                      {order.paymentProvider && (
                        <p className="text-xs text-gray-400 capitalize mt-0.5">{order.paymentProvider}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {/* Update Status */}
                        {ALLOWED_NEXT[order.status].length > 0 && (
                          <button
                            onClick={() => setModalOrder(order)}
                            title="Update Status"
                            className="p-1.5 bg-[#ff4600] hover:bg-[#e03e00] text-white rounded-lg transition"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* View Detail — links to a detail page (future) */}
                        <button
                          onClick={() => setModalOrder(order)}
                          title="Manage Order"
                          className="p-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/40">
            <p className="text-xs text-gray-500">
              Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={meta.page === 1}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-gray-700 px-2">
                {meta.page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={meta.page === meta.totalPages}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Modal */}
      {modalOrder && (
        <StatusModal order={modalOrder} onClose={() => setModalOrder(null)} onDone={handleDone} />
      )}
    </div>
  );
}
