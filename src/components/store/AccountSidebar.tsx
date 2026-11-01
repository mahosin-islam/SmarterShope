'use client';

// AccountSidebar — sidebar for the customer account section.

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, ShoppingBag, MapPin, Heart, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/authContext';

const NAV_ITEMS = [
  { href: '/account/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/account/profile', label: 'My Profile', icon: User },
  { href: '/account/orders', label: 'My Orders', icon: ShoppingBag },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'My Account';

  return (
    <aside className="w-full md:w-56 flex-shrink-0">
      {/* User info */}
      <div className="bg-white border border-[#e8e6e3] rounded-xl p-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#ff4600] flex items-center justify-center text-white font-bold text-lg">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-800 truncate">{displayName}</p>
            <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="bg-white border border-[#e8e6e3] rounded-xl overflow-hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium border-b border-[#e8e6e3] last:border-0 transition-colors ${
                isActive
                  ? 'bg-[#fff3ec] text-[#ff4600]'
                  : 'text-neutral-700 hover:bg-[#faf9f6] hover:text-[#ff4600]'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
