'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Users, Search, ChevronLeft, ChevronRight, RefreshCw,
  Eye, ShoppingBag, Star, Shield, ShieldOff,
  CheckCircle, XCircle, Loader2, AlertCircle, X, Mail, Phone, Calendar,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { getAccessToken } from '@/features/auth/services/auth.service';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AdminCustomer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  authProvider: string;
  lastLoginAt: string | null;
  createdAt: string;
  totalSpent: number;
  lastOrderAt: string | null;
  _count: { orders: number; reviews: number };
}

interface CustomerDetail {
  customer: {
    id: string; firstName: string | null; lastName: string | null;
    email: string; phone: string | null; isActive: boolean;
    isEmailVerified: boolean; authProvider: string;
    lastLoginAt: string | null; createdAt: string;
    addresses: { id: string; label: string; city: string | null; isDefault: boolean }[];
    _count: { orders: number; reviews: number; returnRequests: number };
  };
  stats: {
    totalOrders: number; totalSpent: number; averageOrderValue: number;
    lastOrderAt: string | null;
    ordersByStatus: Record<string, number>;
    reviewCount: number; averageReviewRating: number | null;
  };
  orders: {
    id: string; orderNumber: string; status: string;
    totalAmount: number; currency: string; itemCount: number;
    createdAt: string; paymentStatus: string | null;
  }[];
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

function fullName(c: { firstName: string | null; lastName: string | null; email: string }) {
  return [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email;
}

function initials(c: { firstName: string | null; lastName: string | null; email: string }) {
  const name = fullName(c);
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700', SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-pink-100 text-pink-700', OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
};

// ─── Customer Detail Drawer ───────────────────────────────────────────────────

function CustomerDrawer({
  customerId,
  onClose,
  onStatusChange,
}: {
  customerId: string;
  onClose: () => void;
  onStatusChange: () => void;
}) {
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/admin/customers/${customerId}`)
      .then((json) => setData(json.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [customerId]);

  async function toggleActive() {
    if (!data) return;
    setToggling(true);
    try {
      await apiFetch(`/admin/customers/${customerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !data.customer.isActive }),
      });
      onStatusChange();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff4600] to-orange-400 flex items-center justify-center text-white text-sm font-bold">
              {data ? initials(data.customer) : '?'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{data ? fullName(data.customer) : 'Loading…'}</p>
              <p className="text-xs text-gray-400">{data?.customer.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#ff4600] animate-spin" />
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : data ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Status badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                data.customer.isActive
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {data.customer.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {data.customer.isActive ? 'Active' : 'Suspended'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-600 capitalize">
                {data.customer.authProvider}
              </span>
              {data.customer.isEmailVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
            </div>

            {/* Contact */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Contact Info</p>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" /> {data.customer.email}
              </div>
              {data.customer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" /> {data.customer.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" /> Joined {formatDate(data.customer.createdAt)}
              </div>
              {data.customer.lastLoginAt && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4 text-gray-400 shrink-0" /> Last login: {formatDate(data.customer.lastLoginAt)}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Orders', value: data.stats.totalOrders, icon: ShoppingBag },
                { label: 'Total Spent', value: `৳${data.stats.totalSpent.toLocaleString()}`, icon: Package },
                { label: 'Avg. Order', value: `৳${Math.round(data.stats.averageOrderValue).toLocaleString()}`, icon: Star },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
                  <stat.icon className="w-4 h-4 text-[#ff4600] mx-auto mb-1" />
                  <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            {data.orders.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Orders</p>
                <div className="space-y-2">
                  {data.orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{order.orderNumber}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-900">৳{order.totalAmount.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Addresses */}
            {data.customer.addresses.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Addresses</p>
                <div className="space-y-2">
                  {data.customer.addresses.map(addr => (
                    <div key={addr.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 text-xs">
                      <span className="text-gray-700 capitalize font-medium">{addr.label}</span>
                      <div className="flex items-center gap-2 text-gray-500">
                        {addr.city && <span>{addr.city}</span>}
                        {addr.isDefault && (
                          <span className="bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full font-semibold">Default</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Footer Actions */}
        {data && (
          <div className="shrink-0 p-5 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={toggleActive}
              disabled={toggling}
              className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${
                data.customer.isActive
                  ? 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100'
                  : 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
              } disabled:opacity-60`}
            >
              {toggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : data.customer.isActive ? (
                <><ShieldOff className="w-4 h-4" /> Suspend Account</>
              ) : (
                <><Shield className="w-4 h-4" /> Reactivate Account</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CustomersAdminPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [page, setPage] = useState(1);
  const [drawerCustomerId, setDrawerCustomerId] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', isActive: activeFilter });
      if (debouncedSearch) params.set('search', debouncedSearch);
      const json = await apiFetch(`/admin/customers?${params}`);
      setCustomers(json.data ?? []);
      if (json.meta) setMeta(json.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter, debouncedSearch]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff4600]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Customers</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {meta.total > 0 ? `${meta.total} registered customers` : 'Manage registered customers'}
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
            onClick={fetchCustomers}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Customers', value: meta.total, icon: Users, color: 'text-gray-700', bg: 'bg-gray-50' },
          { label: 'Active', value: customers.filter(c => c.isActive).length, icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Suspended', value: customers.filter(c => !c.isActive).length, icon: XCircle, color: 'text-red-700', bg: 'bg-red-50' },
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4600] focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'true', 'false'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setActiveFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                activeFilter === f
                  ? 'bg-[#ff4600] border-[#ff4600] text-white'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'All' : f === 'true' ? 'Active' : 'Suspended'}
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
            <button onClick={fetchCustomers} className="text-xs text-[#ff4600] font-semibold hover:underline">Try again</button>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Users className="w-10 h-10 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Orders</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Total Spent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff4600] to-orange-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {initials(customer)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">{fullName(customer)}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{customer.email}</p>
                          {customer.phone && <p className="text-xs text-gray-400">{customer.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                        {customer._count.orders}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-xs font-bold text-gray-900">৳{customer.totalSpent.toLocaleString()}</p>
                      {customer.lastOrderAt && (
                        <p className="text-xs text-gray-400">Last: {formatDate(customer.lastOrderAt)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <p className="text-xs text-gray-500">{formatDate(customer.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${
                        customer.isActive
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {customer.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {customer.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setDrawerCustomerId(customer.id)}
                        title="View Details"
                        className="p-1.5 bg-[#ff4600] hover:bg-[#e03e00] text-white rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
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
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.page === 1}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-gray-700 px-2">{meta.page} / {meta.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.page === meta.totalPages}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer */}
      {drawerCustomerId && (
        <CustomerDrawer
          customerId={drawerCustomerId}
          onClose={() => setDrawerCustomerId(null)}
          onStatusChange={fetchCustomers}
        />
      )}
    </div>
  );
}
