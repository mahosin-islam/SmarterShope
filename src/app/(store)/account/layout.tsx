// Account layout — wraps /account/* pages.
// Route protection handled by Next.js middleware.

import React from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { AccountSidebar } from '@/components/store/AccountSidebar';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#faf9f6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <AccountSidebar />
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
