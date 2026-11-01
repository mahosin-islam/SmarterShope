'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, X, Heart, ShoppingBag, User, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/features/auth/authContext';
import { useAuthModal } from '@/lib/authModal.context';

const NAV_LINKS = [
  { label: 'Tailoring', href: '/products?category=tailoring' },
  { label: 'Knitwear', href: '/products?category=knitwear' },
  { label: 'Footwear', href: '/products?category=footwear' },
  { label: 'Bags', href: '/products?category=bags' },
  { label: 'Accessories', href: '/products?category=accessories' },
];

export const Navbar: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const displayName = user?.firstName ?? user?.email?.split('@')[0] ?? 'Account';

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e8e6e3]">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 -ml-1 text-neutral-800 hover:text-black focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
          </button>

          <Link href="/" className="flex items-center space-x-2">
            <span className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#ff4600] font-bold">
              MODORA
            </span>
          </Link>
        </div>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-xs uppercase tracking-wider font-medium text-neutral-700">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-[#ff4600] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Wishlist — only for authenticated customers */}
          {user && !isAdmin && (
            <Link
              href="/account/wishlist"
              className="relative p-1.5 text-neutral-800 hover:text-[#ff4600] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.8]" />
            </Link>
          )}

          {/* Cart — only for customers */}
          {!isAdmin && (
            <Link
              href="/cart"
              className="relative p-1.5 text-neutral-800 hover:text-[#ff4600] transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            </Link>
          )}

          {/* Auth area */}
          {isLoading ? (
            /* Skeleton while session restores */
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            /* Authenticated: profile dropdown */
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[#e8e6e3] hover:border-[#ff4600] text-neutral-800 hover:text-[#ff4600] transition-colors focus:outline-none"
                aria-label="Account menu"
                aria-expanded={profileDropdownOpen}
              >
                <User className="w-4 h-4 stroke-[2]" />
                <span className="hidden sm:block text-xs font-medium max-w-[80px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
              </button>

              {/* Dropdown */}
              {profileDropdownOpen && (
                <>
                  {/* Backdrop to close */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-[#e8e6e3] rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-[#e8e6e3]">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-semibold text-neutral-800 truncate">{user.email}</p>
                      <span className="inline-block mt-0.5 text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-[#fff3ec] text-[#ff4600]">
                        {user.role}
                      </span>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-[#fff3ec] hover:text-[#ff4600] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    {!isAdmin && (
                      <Link
                        href="/account/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-[#fff3ec] hover:text-[#ff4600] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Account
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Guest: Login / Register buttons */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="text-xs font-semibold uppercase tracking-wider text-neutral-700 hover:text-[#ff4600] px-2.5 py-1.5 rounded-lg hover:bg-[#fff3ec] transition-colors focus:outline-none"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="text-xs font-semibold uppercase tracking-wider text-white bg-[#ff4600] hover:bg-[#e03e00] px-3 py-1.5 rounded-lg transition-colors focus:outline-none"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Integrated Search Input Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search garments, shoes, bags & accessories..."
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] transition-all placeholder:text-neutral-400 text-neutral-800"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-0.5 text-neutral-400 hover:text-neutral-600 focus:outline-none"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e8e6e3] bg-white px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-800">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#ff4600]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile auth actions */}
          {!isLoading && !user && (
            <div className="pt-3 border-t border-[#e8e6e3] flex gap-3">
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); openAuthModal('login'); }}
                className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider border border-[#ff4600] text-[#ff4600] rounded-lg hover:bg-[#fff3ec] transition-colors"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); openAuthModal('register'); }}
                className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider bg-[#ff4600] text-white rounded-lg hover:bg-[#e03e00] transition-colors"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
