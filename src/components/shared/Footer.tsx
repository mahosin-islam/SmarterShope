import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#e8e6e3] pt-12 pb-24 md:pb-12 text-xs text-neutral-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Header */}
        <div className="mb-10 pb-8 border-b border-[#f0eeed]">
          <div className="flex items-center space-x-2">
            <span className="font-editorial text-2xl font-bold tracking-tight text-[#ff4600]">
              MODORAsdfs
            </span>
            <span className="text-neutral-400 font-light">&bull;</span>
            <span className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">
              ATELIER &amp; STUDIO
            </span>
          </div>
          <p className="mt-2 text-neutral-500 max-w-sm font-light">
            Qualitative tailoring and artisanal wardrobe foundations since 2018.
          </p>
        </div>

        {/* Multi-Column Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          {/* Client Services */}
          <div>
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-neutral-900 mb-3.5">
              CLIENT SERVICES
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/services/bespoke" className="hover:text-[#ff4600] transition-colors">
                  Bespoke Fitting
                </Link>
              </li>
              <li>
                <Link href="/services/delivery" className="hover:text-[#ff4600] transition-colors">
                  Global Delivery
                </Link>
              </li>
              <li>
                <Link href="/orders/tracking" className="hover:text-[#ff4600] transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/services/returns" className="hover:text-[#ff4600] transition-colors">
                  Returns &amp; Exchanges
                </Link>
              </li>
            </ul>
          </div>

          {/* The Atelier */}
          <div>
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-neutral-900 mb-3.5">
              THE ATELIER
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about/philosophy" className="hover:text-[#ff4600] transition-colors">
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link href="/about/sustainability" className="hover:text-[#ff4600] transition-colors">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-[#ff4600] transition-colors">
                  Flagship Stores
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-[#ff4600] transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Seasonal Archives */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-neutral-900 mb-3.5">
              SEASONAL ARCHIVES
            </h3>
            <div className="flex flex-wrap gap-2">
              {['SS24', 'AW', "MEN'S", 'SALON', 'ARCHIVE'].map((badge) => (
                <Link
                  key={badge}
                  href={`/products?archive=${badge.toLowerCase()}`}
                  className="px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase border border-[#e8e6e3] rounded hover:border-[#ff4600] hover:text-[#ff4600] transition-colors"
                >
                  {badge}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-[#f0eeed] text-center sm:text-left text-[11px] text-neutral-400 font-light">
          &copy; 2026 November MODORA Inc. All rights reserved. Registered trademark of MODORA Atelier France / Suisse.
        </div>
      </div>
    </footer>
  );
};
