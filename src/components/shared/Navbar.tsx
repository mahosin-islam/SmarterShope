'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, X, Heart, ShoppingBag, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <Link href="/products?category=tailoring" className="hover:text-[#ff4600] transition-colors">
            Tailoring
          </Link>
          <Link href="/products?category=knitwear" className="hover:text-[#ff4600] transition-colors">
            Knitwear
          </Link>
          <Link href="/products?category=footwear" className="hover:text-[#ff4600] transition-colors">
            Footwear
          </Link>
          <Link href="/products?category=bags" className="hover:text-[#ff4600] transition-colors">
            Bags
          </Link>
          <Link href="/products?category=accessories" className="hover:text-[#ff4600] transition-colors">
            Accessories
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Wishlist */}
          <Link
            href="/account/wishlist"
            className="relative p-1.5 text-neutral-800 hover:text-[#ff4600] transition-colors"
            aria-label="Wishlist (3 items)"
          >
            <Heart className="w-5 h-5 stroke-[1.8]" />
            <span className="absolute -top-1 -right-1 bg-[#ff4600] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </Link>

          {/* Cart Bag */}
          <Link
            href="/cart"
            className="relative p-1.5 text-neutral-800 hover:text-[#ff4600] transition-colors"
            aria-label="Cart (2 items)"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            <span className="absolute -top-1 -right-1 bg-[#ff4600] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              2
            </span>
          </Link>

          {/* Profile */}
          <Link
            href="/account"
            className="p-1.5 rounded-full bg-[#ff4600] text-white hover:bg-[#e03e00] transition-colors"
            aria-label="Account Profile"
          >
            <User className="w-4 h-4 stroke-[2]" />
          </Link>
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

      {/* Mobile Drawer Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e8e6e3] bg-white px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-800">
            <Link
              href="/products?category=tailoring"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#ff4600]"
            >
              Tailoring
            </Link>
            <Link
              href="/products?category=knitwear"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#ff4600]"
            >
              Knitwear
            </Link>
            <Link
              href="/products?category=footwear"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#ff4600]"
            >
              Footwear
            </Link>
            <Link
              href="/products?category=bags"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#ff4600]"
            >
              Bags
            </Link>
            <Link
              href="/products?category=accessories"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#ff4600]"
            >
              Accessories
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
