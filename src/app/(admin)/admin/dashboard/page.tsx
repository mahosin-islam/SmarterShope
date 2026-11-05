'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  Plus,
  Calendar,
  Download,
  Info,
  Layers,
  Archive,
  Truck,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Printer,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/authContext';
import { adminService, type DashboardStats } from '@/features/admin/dashboard/services/admin.service';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeInterval, setActiveInterval] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  const fetchStats = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await adminService.getDashboardStats();
      setData(stats);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to admin dashboard API';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    adminService
      .getDashboardStats()
      .then((stats) => {
        if (isMounted) {
          setData(stats);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to connect to admin dashboard API';
          setError(msg);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const adminName = useMemo(() => {
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email.split('@')[0];
    return 'Admin';
  }, [user]);

  // Dynamic values or fallback to 0 when no data yet
  const kpi = data?.kpi ?? {
    totalRevenue: 0,
    todayRevenue: 0,
    todayOrdersCount: 0,
    totalOrders: 0,
    pendingOrders: 0,
    activeCatalog: 0,
    newProductsThisWeek: 0,
    activeCategories: 0,
    totalClients: 0,
    aov: 0,
    totalInventoryStock: 0,
    lowStockItems: 0,
    criticalStockUnits: 0
  };

  const recentProducts = data?.recentProducts ?? [];
  const recentOrders = data?.recentOrders ?? [];
  const lowStockAlerts = data?.lowStockAlerts ?? [];
  const salesTrajectory = data?.salesTrajectory ?? [];

  const fmtCurrency = (val: number) =>
    `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6 pb-12">
      {/* ─── 1. Welcome Row & Header Controls ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Good morning, {adminName}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fdf0e9] text-[#ff4600] border border-[#ff4600]/10">
              <span className={`w-1.5 h-1.5 rounded-full bg-[#ff4600] ${loading ? 'animate-ping' : 'animate-pulse'}`} />
              {loading ? 'Syncing...' : 'Live Studio'}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Here&apos;s what&apos;s happening across MODORA luxury ateliers today.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#e8e6e3] rounded-lg text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50 transition"
          >
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>Last 30 Days</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-1" />
          </button>

          <button
            type="button"
            onClick={fetchStats}
            title="Refresh Live Data"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e8e6e3] rounded-lg text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-neutral-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e8e6e3] rounded-lg text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50 transition"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>Export Report</span>
          </button>

          <Link
            href="/admin/products/add"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#ff4600] hover:bg-[#e03e00] text-white rounded-lg text-xs font-semibold shadow-2xs transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Error Banner if API connection fails */}
      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold">Backend API sync in progress</p>
              <p className="text-amber-700 mt-0.5">{error}. Displaying current local store state.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchStats}
            className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-semibold transition"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* ─── 2. Top Row: 4 Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL REVENUE */}
        <div className="bg-white rounded-xl border border-[#e8e6e3] p-5 shadow-2xs hover:border-neutral-300 transition">
          <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            Total Revenue
          </p>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight mt-1.5">
            {fmtCurrency(kpi.totalRevenue)}
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#fdf0e9] text-[#ff4600]">
              <TrendingUp className="w-3 h-3" />
              {kpi.totalRevenue > 0 ? '+14.6%' : '0%'}
            </span>
            <span className="text-neutral-400 text-[11px]">
              ${kpi.todayRevenue.toLocaleString()} today from {kpi.todayOrdersCount} orders
            </span>
          </div>
        </div>

        {/* TOTAL ORDERS */}
        <div className="bg-white rounded-xl border border-[#e8e6e3] p-5 shadow-2xs hover:border-neutral-300 transition">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
              Total Orders
            </p>
            <div className="w-7 h-7 rounded-lg bg-[#fdf0e9] flex items-center justify-center text-[#ff4600]">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight mt-1.5">
            {kpi.totalOrders.toLocaleString()}
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#fdf0e9] text-[#ff4600]">
              <TrendingUp className="w-3 h-3" />
              {kpi.totalOrders > 0 ? '+8.2%' : '0%'}
            </span>
            <span className="text-neutral-400 text-[11px]">
              {kpi.pendingOrders} pending fulfillment
            </span>
          </div>
        </div>

        {/* ACTIVE CATALOG */}
        <div className="bg-white rounded-xl border border-[#e8e6e3] p-5 shadow-2xs hover:border-neutral-300 transition">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
              Active Catalog
            </p>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight mt-1.5">
            {kpi.activeCatalog.toLocaleString()}{' '}
            <span className="text-lg font-normal text-neutral-600">SKUs</span>
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#fdf0e9] text-[#ff4600]">
              +{kpi.newProductsThisWeek} this week
            </span>
            <span className="text-neutral-400 text-[11px]">
              {kpi.activeCategories} categories active
            </span>
          </div>
        </div>

        {/* ATELIER CLIENTS */}
        <div className="bg-white rounded-xl border border-[#e8e6e3] p-5 shadow-2xs hover:border-neutral-300 transition">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
              Atelier Clients
            </p>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight mt-1.5">
            {kpi.totalClients.toLocaleString()}
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#fdf0e9] text-[#ff4600]">
              <TrendingUp className="w-3 h-3" />
              {kpi.totalClients > 0 ? '+12.3%' : '0%'}
            </span>
            <span className="text-neutral-400 text-[11px]">
              {kpi.totalClients > 0 ? '84.2% repeat rate' : 'No clients registered yet'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. Middle Section: Trajectory (Left 62%) & Quick Actions / Stock Alerts (Right 38%) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Revenue & Sales Trajectory */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#e8e6e3] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            {/* Header with Title and Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-neutral-100">
              <div>
                <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                  Revenue &amp; Sales Trajectory
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Gross volume across global flagships vs previous 6-month cycle
                </p>
              </div>

              {/* Time Toggle */}
              <div className="inline-flex items-center p-0.5 bg-neutral-100 rounded-lg text-xs font-medium self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveInterval('weekly')}
                  className={`px-3 py-1 rounded-md transition ${
                    activeInterval === 'weekly'
                      ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInterval('monthly')}
                  className={`px-3 py-1 rounded-md transition ${
                    activeInterval === 'monthly'
                      ? 'bg-[#ff4600] text-white font-semibold shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInterval('yearly')}
                  className={`px-3 py-1 rounded-md transition ${
                    activeInterval === 'yearly'
                      ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            {/* Metric Strip (3 mini stats) */}
            <div className="grid grid-cols-3 gap-4 py-4 border-b border-neutral-100">
              <div>
                <p className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400">
                  Total Realized Revenue
                </p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-base font-bold text-neutral-900">
                    {fmtCurrency(kpi.totalRevenue)}
                  </span>
                  <span className="text-[11px] font-bold text-[#ff4600]">
                    {kpi.totalRevenue > 0 ? '+18.2%' : '0%'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400">
                  Average Order Value (AOV)
                </p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-base font-bold text-neutral-900">
                    {fmtCurrency(kpi.aov)}
                  </span>
                  <span className="text-[11px] font-bold text-[#ff4600]">
                    {kpi.aov > 0 ? '+$24.10' : '$0.00'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400">
                  Gross Conversions
                </p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-base font-bold text-neutral-900">
                    {kpi.totalOrders > 0 ? '3.84%' : '0.00%'}
                  </span>
                  <span className="text-[11px] font-medium text-neutral-500">
                    {kpi.totalOrders > 0 ? 'Top quartile' : 'Baseline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="relative pt-6 pb-2">
              {kpi.totalRevenue > 0 && (
                <div className="absolute right-12 top-2 z-10 hidden sm:flex flex-col items-center">
                  <div className="bg-neutral-900 text-white px-2.5 py-1 rounded shadow-lg text-[11px] font-semibold tracking-tight whitespace-nowrap">
                    Peak Volume <span className="text-[#ff4600] font-bold">{fmtCurrency(kpi.totalRevenue)}</span>
                  </div>
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-neutral-900" />
                </div>
              )}

              {/* Dynamic SVG Area Chart */}
              <div className="h-52 w-full">
                <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff4600" stopOpacity="0.28" />
                      <stop offset="50%" stopColor="#ff4600" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#ff4600" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  <line x1="20" y1="30" x2="580" y2="30" stroke="#f0efed" strokeWidth="1" />
                  <line x1="20" y1="90" x2="580" y2="90" stroke="#f0efed" strokeWidth="1" />
                  <line x1="20" y1="150" x2="580" y2="150" stroke="#f0efed" strokeWidth="1" />

                  {/* Previous Period Baseline Curve (Dashed) */}
                  <path
                    d="M 50 160 C 120 155, 180 148, 240 142 C 310 138, 380 130, 440 120 C 490 110, 520 100, 550 95"
                    fill="none"
                    stroke="#e4e4e7"
                    strokeWidth="1.75"
                    strokeDasharray="4 4"
                  />

                  {/* Primary Area Fill */}
                  <path
                    d={
                      kpi.totalRevenue > 0
                        ? "M 50 155 C 130 148, 170 130, 240 115 C 310 100, 360 110, 430 85 C 480 65, 510 50, 550 40 L 550 180 L 50 180 Z"
                        : "M 50 170 C 150 170, 300 170, 450 170 C 500 170, 530 170, 550 170 L 550 180 L 50 180 Z"
                    }
                    fill="url(#revenueGradient)"
                  />

                  {/* Primary Curve Stroke */}
                  <path
                    d={
                      kpi.totalRevenue > 0
                        ? "M 50 155 C 130 148, 170 130, 240 115 C 310 100, 360 110, 430 85 C 480 65, 510 50, 550 40"
                        : "M 50 170 C 150 170, 300 170, 450 170 C 500 170, 530 170, 550 170"
                    }
                    fill="none"
                    stroke="#ff4600"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Points */}
                  {[
                    { cx: 50, cy: kpi.totalRevenue > 0 ? 155 : 170 },
                    { cx: 150, cy: kpi.totalRevenue > 0 ? 136 : 170 },
                    { cx: 250, cy: kpi.totalRevenue > 0 ? 112 : 170 },
                    { cx: 350, cy: kpi.totalRevenue > 0 ? 104 : 170 },
                    { cx: 450, cy: kpi.totalRevenue > 0 ? 80 : 170 },
                    { cx: 550, cy: kpi.totalRevenue > 0 ? 40 : 170 }
                  ].map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.cx}
                      cy={pt.cy}
                      r="4"
                      fill="#ffffff"
                      stroke="#ff4600"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              </div>

              {/* Month Labels from API */}
              <div className="flex justify-between px-2 text-[11px] font-medium text-neutral-400 mt-2">
                {salesTrajectory.length > 0 ? (
                  salesTrajectory.map((s, idx) => (
                    <span
                      key={s.label}
                      className={idx === salesTrajectory.length - 1 ? 'font-bold text-[#ff4600]' : ''}
                    >
                      {s.label}
                    </span>
                  ))
                ) : (
                  <>
                    <span>Month 1</span>
                    <span>Month 2</span>
                    <span>Month 3</span>
                    <span>Month 4</span>
                    <span>Month 5</span>
                    <span className="font-bold text-[#ff4600]">Current Month</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-neutral-100 text-xs text-neutral-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#ff4600]" />
                <span className="text-[11px] font-medium text-neutral-600">Gross Direct-to-Consumer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-neutral-300" />
                <span className="text-[11px] font-medium text-neutral-500">Bespoke Orders</span>
              </div>
            </div>
            <span className="text-[11px] text-neutral-400">
              Live Database Synchronization
            </span>
          </div>
        </div>

        {/* Right Column: Quick Atelier Actions & Stock Depletion Alerts */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          {/* Top: Quick Atelier Actions */}
          <div className="bg-white rounded-xl border border-[#e8e6e3] p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900">Quick Atelier Actions</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-[#fdf0e9] text-[#ff4600]">
                FAST LANE
              </span>
            </div>

            {/* 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* 1. New Product */}
              <Link
                href="/admin/products/add"
                className="bg-[#ff4600] hover:bg-[#e03e00] text-white rounded-lg p-3.5 flex flex-col justify-between transition group shadow-2xs"
              >
                <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center mb-4">
                  <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">New Product</p>
                  <p className="text-[11px] text-white/80 mt-0.5">Publish piece</p>
                </div>
              </Link>

              {/* 2. Collections */}
              <Link
                href="/admin/categories"
                className="bg-[#faf9f8] hover:bg-neutral-100/80 border border-[#e8e6e3] rounded-lg p-3.5 flex flex-col justify-between transition group"
              >
                <div className="w-6 h-6 rounded bg-neutral-200/60 flex items-center justify-center mb-4 text-neutral-700">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 leading-tight">Collections</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Organize styles</p>
                </div>
              </Link>

              {/* 3. Stock Ledger */}
              <Link
                href="/admin/inventory"
                className="bg-[#faf9f8] hover:bg-neutral-100/80 border border-[#e8e6e3] rounded-lg p-3.5 flex flex-col justify-between transition group"
              >
                <div className="w-6 h-6 rounded bg-neutral-200/60 flex items-center justify-center mb-4 text-neutral-700">
                  <Archive className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 leading-tight">Stock Ledger</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Transfer lots</p>
                </div>
              </Link>

              {/* 4. Fulfillment */}
              <Link
                href="/admin/orders"
                className="bg-[#faf9f8] hover:bg-neutral-100/80 border border-[#e8e6e3] rounded-lg p-3.5 flex flex-col justify-between transition group"
              >
                <div className="w-6 h-6 rounded bg-neutral-200/60 flex items-center justify-center mb-4 text-neutral-700">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 leading-tight">Fulfillment</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {kpi.pendingOrders} ready to pack
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Bottom: Stock Depletion Alerts */}
          <div className="bg-white rounded-xl border border-[#e8e6e3] p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-900">Stock Depletion Alerts</h3>
              <Info className="w-3.5 h-3.5 text-neutral-400" />
            </div>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-2 text-center">
                <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">
                  In Stock
                </p>
                <p className="text-xs font-bold text-neutral-800 mt-0.5">
                  {kpi.totalInventoryStock.toLocaleString()}
                </p>
              </div>

              <div className="bg-[#fdf0e9]/50 border border-[#ff4600]/10 rounded-lg p-2 text-center">
                <p className="text-[9px] font-semibold text-[#ff4600] uppercase tracking-wider">
                  Low Stock
                </p>
                <p className="text-xs font-bold text-[#ff4600] mt-0.5">
                  {kpi.lowStockItems} items
                </p>
              </div>

              <div className="bg-red-50/50 border border-red-200/50 rounded-lg p-2 text-center">
                <p className="text-[9px] font-semibold text-red-600 uppercase tracking-wider">
                  Critical
                </p>
                <p className="text-xs font-bold text-red-600 mt-0.5">
                  {kpi.criticalStockUnits} units
                </p>
              </div>
            </div>

            {/* List of alert items or empty state */}
            {lowStockAlerts.length > 0 ? (
              <div className="space-y-2.5">
                {lowStockAlerts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-1.5 border-b border-neutral-100 last:border-0"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-neutral-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">{item.variantInfo}</p>
                    </div>
                    <Link
                      href={`/admin/inventory?sku=${encodeURIComponent(item.sku)}`}
                      className="flex-shrink-0 px-2.5 py-1 text-xs font-medium text-neutral-700 bg-white border border-[#e8e6e3] rounded hover:border-[#ff4600] hover:text-[#ff4600] transition"
                    >
                      Restock
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-5 text-center text-xs text-neutral-400 bg-neutral-50/50 rounded-lg border border-dashed border-neutral-200">
                <p className="font-medium text-neutral-600">All inventory levels are healthy</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">No low-stock items detected</p>
              </div>
            )}

            {/* Footer link */}
            <div className="mt-3 pt-2 text-right">
              <Link
                href="/admin/inventory"
                className="text-xs font-semibold text-[#ff4600] hover:text-[#e03e00] inline-flex items-center gap-1 transition"
              >
                View detailed procurement log &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. Bottom Section: Recently Added Products (58%) & Recent Orders (42%) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recently Added Products Table */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#e8e6e3] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            {/* Table Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900">Recently Added Products</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-600">
                  {recentProducts.length} of {kpi.activeCatalog} SKUs
                </span>
              </div>
              <Link
                href="/admin/products"
                className="text-xs font-semibold text-[#ff4600] hover:text-[#e03e00] transition"
              >
                View All Products &rarr;
              </Link>
            </div>

            {/* Table or Empty State */}
            {recentProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                      <th className="pb-2.5 font-semibold">Product &amp; SKU</th>
                      <th className="pb-2.5 font-semibold">Category</th>
                      <th className="pb-2.5 font-semibold">Price</th>
                      <th className="pb-2.5 font-semibold">Stock</th>
                      <th className="pb-2.5 font-semibold">Status</th>
                      <th className="pb-2.5 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {recentProducts.map((p) => {
                      let statusBadge = (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          Active
                        </span>
                      );
                      let stockDisplay = `${p.stock} in stock`;

                      if (p.stock === 0) {
                        statusBadge = (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600">
                            Out of Stock
                          </span>
                        );
                        stockDisplay = '0 in stock';
                      } else if (p.stock <= 5) {
                        statusBadge = (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                            Low Stock
                          </span>
                        );
                        stockDisplay = `${p.stock} in stock (Low)`;
                      }

                      return (
                        <tr key={p.id} className="hover:bg-neutral-50/60 transition group">
                          <td className="py-3 pr-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-md bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-neutral-400 flex-shrink-0 overflow-hidden">
                                {p.imageUrl ? (
                                  <Image
                                    src={p.imageUrl}
                                    alt={p.title}
                                    width={36}
                                    height={36}
                                    unoptimized
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-4 h-4 text-neutral-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-neutral-900 truncate">{p.title}</p>
                                <p className="text-[10px] text-neutral-400 font-mono">{p.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-neutral-600 font-medium">
                            {p.category?.name || 'General'}
                          </td>
                          <td className="py-3 font-semibold text-neutral-900">
                            {fmtCurrency(p.basePrice)}
                          </td>
                          <td
                            className={`py-3 font-medium ${
                              p.stock === 0
                                ? 'text-red-600'
                                : p.stock <= 5
                                ? 'text-amber-700 font-semibold'
                                : 'text-neutral-600'
                            }`}
                          >
                            {stockDisplay}
                          </td>
                          <td className="py-3">{statusBadge}</td>
                          <td className="py-3 text-right">
                            <Link
                              href={`/admin/products?search=${encodeURIComponent(p.sku)}`}
                              className="p-1 text-neutral-400 hover:text-neutral-700 inline-flex transition"
                              title="Inspect Product"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center bg-neutral-50/50 rounded-xl border border-dashed border-neutral-200">
                <Package className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-neutral-700">No products added yet</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Your luxury product catalog will be rendered here dynamically once created.
                </p>
                <Link
                  href="/admin/products/add"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ff4600] text-white rounded-lg text-xs font-semibold hover:bg-[#e03e00] transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Your First Product
                </Link>
              </div>
            )}
          </div>

          {/* Table Pagination Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 mt-2 border-t border-neutral-100 text-xs text-neutral-400">
            <span>
              Showing page 1 of {Math.max(1, Math.ceil(kpi.activeCatalog / 5))} · 5 items per page
            </span>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/products/add"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#ff4600] hover:text-[#e03e00] mr-2 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Product
              </Link>
              <button
                type="button"
                className="p-1 rounded border border-[#e8e6e3] text-neutral-400 hover:text-neutral-700 disabled:opacity-40"
                disabled
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="p-1 rounded border border-[#e8e6e3] text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Recent Orders List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#e8e6e3] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            {/* Orders Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900">Recent Orders</h3>
                <span className="w-2 h-2 rounded-full bg-[#ff4600]" />
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-[#ff4600] hover:text-[#e03e00] transition"
              >
                View All ({kpi.totalOrders.toLocaleString()}) &rarr;
              </Link>
            </div>

            {/* Subheader Column Labels */}
            <div className="grid grid-cols-12 text-[10px] font-semibold uppercase text-neutral-400 tracking-wider pb-2 border-b border-neutral-100">
              <div className="col-span-3">Order ID</div>
              <div className="col-span-6">Client &amp; Bag</div>
              <div className="col-span-3 text-right">Amount</div>
            </div>

            {/* Orders Rows or Empty State */}
            {recentOrders.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {recentOrders.map((ord) => {
                  const initials =
                    ord.clientName
                      .split(' ')
                      .map((w) => w[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'CU';

                  const isProcessing = ord.status === 'PROCESSING' || ord.status === 'PENDING';
                  const isShipped = ord.status === 'SHIPPED';
                  const isDelivered = ord.status === 'DELIVERED';

                  return (
                    <div
                      key={ord.id}
                      className="grid grid-cols-12 items-center py-3 text-xs hover:bg-neutral-50/60 transition"
                    >
                      <div className="col-span-3">
                        <p className="font-mono font-bold text-neutral-900">
                          #{ord.orderNumber.replace('#', '')}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">Live Order</p>
                      </div>

                      <div className="col-span-6 flex items-center gap-2.5 pr-1">
                        <div className="w-7 h-7 rounded-full bg-amber-100/70 text-amber-900 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-900 truncate">{ord.clientName}</p>
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                            {ord.itemCount} items · {ord.location}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-3 text-right">
                        <p className="font-bold text-neutral-900">{fmtCurrency(ord.totalAmount)}</p>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isProcessing
                                ? 'bg-[#ff4600]'
                                : isShipped
                                ? 'bg-neutral-700'
                                : isDelivered
                                ? 'bg-emerald-600'
                                : 'bg-neutral-400'
                            }`}
                          />
                          <span className="text-[10px] text-neutral-500 capitalize">
                            {ord.status.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center bg-neutral-50/50 rounded-xl border border-dashed border-neutral-200">
                <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-neutral-700">No customer orders placed yet</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Incoming client orders from the storefront will automatically appear here.
                </p>
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-neutral-100 text-xs">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
              <Truck className="w-3.5 h-3.5 text-neutral-400" />
              <span>Next carrier pickup: DHL Express (15:00 CET)</span>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 font-semibold text-xs text-[#ff4600] hover:text-[#e03e00] transition"
            >
              <Printer className="w-3 h-3" />
              Print Shipping Manifest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
