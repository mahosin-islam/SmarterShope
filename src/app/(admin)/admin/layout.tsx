// Admin layout — wraps all /admin/* pages with sidebar + header.
// Route protection: Next.js middleware handles the redirect for unauthenticated/unauthorized users.
// This layout provides the visual shell only.

import React from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#faf9f6] overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
