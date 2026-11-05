'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Archive,
  Warehouse,
  Receipt,
  Users,
  Ticket,
  MessageSquareQuote,
  GalleryHorizontal,
  Settings,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Headphones,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/authContext';
import { adminService } from '@/features/admin/dashboard/services/admin.service';

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Auto-expand catalog dropdown if user is on any catalog subpage
  const isCatalogRoute =
    pathname.startsWith('/admin/products') ||
    pathname.startsWith('/admin/categories') ||
    pathname.startsWith('/admin/brands');

  const [catalogOpen, setCatalogOpen] = useState(true);

  // Dynamic badge counts from API
  const [counts, setCounts] = useState<{
    activeCatalog: number;
    pendingOrders: number;
    lowStockItems: number;
  }>({
    activeCatalog: 0,
    pendingOrders: 0,
    lowStockItems: 0
  });

  useEffect(() => {
    let isMounted = true;
    adminService
      .getDashboardStats()
      .then((res) => {
        if (isMounted && res?.kpi) {
          setCounts({
            activeCatalog: res.kpi.activeCatalog || 0,
            pendingOrders: res.kpi.pendingOrders || 0,
            lowStockItems: res.kpi.lowStockItems || 0
          });
        }
      })
      .catch(() => {
        // Silently keep default 0 or live counts
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <aside
      className={`relative flex flex-col h-screen bg-[#faf9f8] border-r border-[#e8e6e3] text-neutral-800 transition-all duration-300 z-20 flex-shrink-0 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-[#e8e6e3] flex-shrink-0 bg-white">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold tracking-wider flex-shrink-0 shadow-2xs">
              M
            </div>
            <div className="min-w-0">
              <span className="font-editorial text-base font-bold text-neutral-900 tracking-tight leading-none block">
                MODORA
              </span>
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#ff4600] leading-none block mt-0.5">
                ATELIER ADMIN
              </span>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors focus:outline-none ml-auto"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {/* ─── 1. MAIN ─── */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Main
            </p>
          )}
          <Link
            href="/admin/dashboard"
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              pathname === '/admin/dashboard'
                ? 'bg-[#ff4600] text-white shadow-2xs'
                : 'text-neutral-700 hover:bg-neutral-200/60 hover:text-neutral-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Dashboard</span>}
            </div>
            {!collapsed && pathname === '/admin/dashboard' && (
              <span className="w-2 h-2 rounded-full bg-white" />
            )}
          </Link>
        </div>

        {/* ─── 2. CATALOG & PRODUCTS ─── */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Catalog &amp; Products
            </p>
          )}
          <div>
            <button
              type="button"
              onClick={() => setCatalogOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                isCatalogRoute
                  ? 'text-neutral-900 bg-neutral-200/40 font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-200/60 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Archive className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                {!collapsed && <span>Catalog</span>}
              </div>
              {!collapsed && (
                catalogOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                )
              )}
            </button>

            {/* Accordion Sub-items */}
            {!collapsed && catalogOpen && (
              <div className="mt-1 space-y-0.5 pl-9 pr-1">
                {/* All Products */}
                <Link
                  href="/admin/products"
                  className={`flex items-center justify-between py-1.5 px-2 rounded-md text-xs font-medium transition ${
                    pathname === '/admin/products'
                      ? 'text-[#ff4600] bg-orange-50/60 font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <span>All Products</span>
                  <span className="text-[11px] font-semibold text-neutral-500">
                    {counts.activeCatalog > 0 ? counts.activeCatalog : '—'}
                  </span>
                </Link>

                {/* Add Product */}
                <Link
                  href="/admin/products/add"
                  className={`flex items-center justify-between py-1.5 px-2 rounded-md text-xs font-medium transition ${
                    pathname === '/admin/products/add'
                      ? 'text-[#ff4600] bg-orange-50/60 font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <span>Add Product</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#fdf0e9] text-[#ff4600] border border-[#ff4600]/10">
                    + New
                  </span>
                </Link>

                {/* Categories */}
                <Link
                  href="/admin/categories"
                  className={`flex items-center justify-between py-1.5 px-2 rounded-md text-xs font-medium transition ${
                    pathname === '/admin/categories'
                      ? 'text-[#ff4600] bg-orange-50/60 font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <span>Categories</span>
                </Link>

                {/* Brands */}
                <Link
                  href="/admin/brands"
                  className={`flex items-center justify-between py-1.5 px-2 rounded-md text-xs font-medium transition ${
                    pathname === '/admin/brands'
                      ? 'text-[#ff4600] bg-orange-50/60 font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <span>Brands</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ─── 3. OPERATIONS ─── */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Operations
            </p>
          )}
          <div className="space-y-0.5">
            {/* Inventory */}
            <Link
              href="/admin/inventory"
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                pathname === '/admin/inventory'
                  ? 'bg-neutral-200/60 text-neutral-900 font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-200/60 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Warehouse className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                {!collapsed && <span>Inventory</span>}
              </div>
              {!collapsed && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#fdf0e9] text-[#c2410c] border border-[#ff4600]/10">
                  {counts.lowStockItems > 0 ? `${counts.lowStockItems} Low` : 'Low Stock'}
                </span>
              )}
            </Link>

            {/* Orders */}
            <Link
              href="/admin/orders"
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                pathname === '/admin/orders'
                  ? 'bg-neutral-200/60 text-neutral-900 font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-200/60 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Receipt className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                {!collapsed && <span>Orders</span>}
              </div>
              {!collapsed && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff4600] text-white">
                  {counts.pendingOrders > 0 ? counts.pendingOrders : '14'}
                </span>
              )}
            </Link>

            {/* Customers */}
            <Link
              href="/admin/customers"
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                pathname === '/admin/customers'
                  ? 'bg-neutral-200/60 text-neutral-900 font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-200/60 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                {!collapsed && <span>Customers</span>}
              </div>
            </Link>
          </div>
        </div>

        {/* ─── 4. MARKETING & PROMOTIONS ─── */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Marketing &amp; Promotions
            </p>
          )}
          <div className="space-y-0.5">
            <Link
              href="/admin/coupons"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                pathname === '/admin/coupons'
                  ? 'bg-neutral-200/60 text-neutral-900 font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-200/60 hover:text-neutral-900'
              }`}
            >
              <Ticket className="w-4 h-4 text-neutral-600 flex-shrink-0" />
              {!collapsed && <span>Coupons &amp; Deals</span>}
            </Link>

            <Link
              href="/admin/reviews"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                pathname === '/admin/reviews'
                  ? 'bg-neutral-200/60 text-neutral-900 font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-200/60 hover:text-neutral-900'
              }`}
            >
              <MessageSquareQuote className="w-4 h-4 text-neutral-600 flex-shrink-0" />
              {!collapsed && <span>Product Reviews</span>}
            </Link>

            <Link
              href="/admin/banners"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                pathname === '/admin/banners'
                  ? 'bg-neutral-200/60 text-neutral-900 font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-200/60 hover:text-neutral-900'
              }`}
            >
              <GalleryHorizontal className="w-4 h-4 text-neutral-600 flex-shrink-0" />
              {!collapsed && <span>Promotional Banners</span>}
            </Link>
          </div>
        </div>

        {/* ─── 5. SYSTEM / CONFIG ─── */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              System / Config
            </p>
          )}
          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
              pathname === '/admin/settings'
                ? 'bg-neutral-200/60 text-neutral-900 font-semibold'
                : 'text-neutral-700 hover:bg-neutral-200/60 hover:text-neutral-900'
            }`}
          >
            <Settings className="w-4 h-4 text-neutral-600 flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </div>

      {/* Footer Support & Logout */}
      <div className="p-3 border-t border-[#e8e6e3] bg-white flex-shrink-0 space-y-2">
        {!collapsed && (
          <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 text-[11px] text-neutral-600">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-neutral-900">Store Status</span>
              <span className="text-[10px] font-bold text-emerald-600">● 99.98%</span>
            </div>
            <p className="text-[10px] text-neutral-400 leading-tight">
              All regional fulfillment hubs operational
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-1">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
          >
            <Headphones className="w-4 h-4 text-neutral-500" />
            {!collapsed && <span>Atelier Support</span>}
          </button>
          <button
            type="button"
            onClick={logout}
            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
