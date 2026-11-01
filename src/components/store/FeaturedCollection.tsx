import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { FEATURED_PRODUCTS } from '@/features/products/data/mock-landing-data';

export const FeaturedCollection: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#ff4600] block mb-1">
              SELECTED EDITION
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-neutral-900 font-semibold tracking-tight">
              Featured Collection
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light max-w-xl">
              Curated essentials meticulously crafted for everyday distinction.
            </p>
          </div>

          <Link
            href="/products?featured=true"
            className="hidden sm:flex items-center space-x-1 text-xs font-bold text-[#ff4600] hover:text-[#e03e00] tracking-wider uppercase transition-colors shrink-0 ml-4"
          >
            <span>VIEW ALL (48)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-col on Mobile, 4-col on Desktop Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile View All Link below grid */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/products?featured=true"
            className="inline-flex items-center space-x-1 text-xs font-bold text-[#ff4600] tracking-wider uppercase"
          >
            <span>VIEW ALL (48)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
