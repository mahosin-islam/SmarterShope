import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from '@/features/store/products/components/ProductCard';
import { NEW_ARRIVALS } from '@/features/store/home/data/mock-landing-data';

export const NewArrivalsSection: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#ff4600] block mb-1">
              FRESH PERSPECTIVE
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-neutral-900 font-semibold tracking-tight">
              New Arrivals — Drop 01
            </h2>
          </div>

          <Link
            href="/products?collection=drop-01"
            className="flex items-center space-x-1 text-xs font-bold text-[#ff4600] hover:text-[#e03e00] tracking-wider uppercase transition-colors shrink-0 ml-4"
          >
            <span>ALL NEW (24)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-col on Mobile, 4-col on Desktop Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {NEW_ARRIVALS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
