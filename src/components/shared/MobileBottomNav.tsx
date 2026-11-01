'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, LayoutGrid, Heart, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'HOME', href: '/', icon: Home, active: pathname === '/' },
    { label: 'SHOP', href: '/products', icon: Store, active: pathname.startsWith('/products') },
    { label: 'CATEGORIES', href: '/categories', icon: LayoutGrid, active: pathname.startsWith('/categories') },
    { label: 'WISHLIST', href: '/account/wishlist', icon: Heart, badge: 3, active: pathname.includes('wishlist') },
    { label: 'ACCOUNT', href: '/account', icon: User, active: pathname.startsWith('/account') },
  ];

  return (
    <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e8e6e3] py-2 px-3 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.active;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`relative flex flex-col items-center justify-center py-1 px-2 text-[9px] font-bold tracking-wider transition-colors ${
              isActive ? 'text-[#ff4600]' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
              {item.badge && (
                <span className="absolute -top-1.5 -right-2 bg-[#ff4600] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
