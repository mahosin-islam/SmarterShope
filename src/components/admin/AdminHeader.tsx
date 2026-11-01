'use client';

// AdminHeader — top bar for the admin panel.

import React from 'react';
import { Bell, User } from 'lucide-react';
import { useAuth } from '@/features/auth/authContext';

interface AdminHeaderProps {
  title?: string;
}

export function AdminHeader({ title = 'Dashboard' }: AdminHeaderProps) {
  const { user } = useAuth();
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Admin';

  return (
    <header className="h-16 bg-white border-b border-[#e8e6e3] flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-lg font-semibold text-neutral-800">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Notifications placeholder */}
        <button
          type="button"
          className="relative p-2 rounded-full text-neutral-500 hover:text-[#ff4600] hover:bg-[#fff3ec] transition-colors focus:outline-none"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff4600] rounded-full" />
        </button>

        {/* User badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#ff4600] flex items-center justify-center text-white text-sm font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-neutral-800 leading-tight">{displayName}</p>
            <p className="text-[11px] text-neutral-400 leading-tight capitalize">{user?.role?.toLowerCase()}</p>
          </div>
          <User className="sm:hidden w-5 h-5 text-neutral-500" />
        </div>
      </div>
    </header>
  );
}
