'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, ExternalLink, ChevronDown } from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/authContext';

interface AdminHeaderProps {
  title?: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Dynamic breadcrumb matching the current route
  const currentSection =
    title ||
    pathname
      .split('/')
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase()) ||
    'Dashboard';

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    (user?.email ? user.email.split('@')[0] : 'Elena Vance');

  const displayRole = user?.role === 'ADMIN' ? 'Head of Operations' : user?.role || 'Operations Staff';

  return (
    <header className="h-16 bg-white border-b border-[#e8e6e3] flex items-center justify-between px-6 flex-shrink-0 z-10">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs">
        <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-700 transition font-medium">
          Home
        </Link>
        <span className="text-gray-300 font-normal">&gt;</span>
        <span className="text-[#ff4600] font-semibold capitalize">{currentSection}</span>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex items-center relative w-80 lg:w-96">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search catalog, orders, clients..."
          className="w-full pl-9 pr-12 py-1.5 text-xs bg-gray-50/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4600]/20 focus:border-[#ff4600] placeholder:text-gray-400 transition"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-white border border-gray-200 rounded shadow-2xs">
          ⌘K
        </kbd>
      </div>

      {/* Right Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* View Live Store */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#ff4600] hover:text-[#e03e00] transition px-2 py-1 rounded-md hover:bg-orange-50/50"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Live Store
        </Link>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition focus:outline-none"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff4600] rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-2xs overflow-hidden">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-xs font-bold text-gray-900 leading-none">{displayName}</p>
            <p className="text-[10px] text-gray-400 leading-none mt-1">{displayRole}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
        </div>
      </div>
    </header>
  );
}
