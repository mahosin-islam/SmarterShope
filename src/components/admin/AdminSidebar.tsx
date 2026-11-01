'use client';

// AdminSidebar — navigation sidebar for the MODORA admin panel.

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Tag,
  Bookmark,
  Layers,
  ShoppingCart,
  Users,
  Ticket,
  Star,
  Image,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/features/auth/authContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/brands', label: 'Brands', icon: Bookmark },
  { href: '/admin/inventory', label: 'Inventory', icon: Layers },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/banners', label: 'Banners', icon: Image },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col h-screen bg-[#121212] text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/10 flex-shrink-0">
        {!collapsed && (
          <span className="font-editorial text-xl font-bold text-[#ff4600] tracking-tight truncate">
            MODORA
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="ml-auto p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                isActive
                  ? 'bg-[#ff4600] text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="flex-shrink-0 border-t border-white/10 p-3 space-y-1">
        {!collapsed && user && (
          <div className="px-2 pb-2">
            <p className="text-xs text-white/40 uppercase tracking-wider">Signed in as</p>
            <p className="text-xs text-white/80 font-medium truncate">{user.email}</p>
            <span className="inline-block mt-0.5 text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-[#ff4600]/20 text-[#ff4600]">
              {user.role}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          title={collapsed ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
