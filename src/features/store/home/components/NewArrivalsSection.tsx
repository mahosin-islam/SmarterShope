import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from '@/features/store/products/components/ProductCard';
import { storeService } from '@/features/store/services/store.service';

export const NewArrivalsSkeleton: React.FC = () => (
  <div className="py-8 sm:py-12 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
    <div className="h-4 w-32 bg-neutral-200 rounded mb-2" />
    <div className="h-8 w-64 bg-neutral-200 rounded mb-6" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="aspect-[4/5] bg-neutral-100 rounded-xl" />
      ))}
    </div>
  </div>
);

export const NewArrivalsSection: React.FC = async () => {
  const products = await storeService.getNewArrivals();

  if (!products || products.length === 0) {
    return null;
  }

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
            href="/products?sortBy=createdAt&sortOrder=desc"
            className="flex items-center space-x-1 text-xs font-bold text-[#ff4600] hover:text-[#e03e00] tracking-wider uppercase transition-colors shrink-0 ml-4"
          >
            <span>ALL NEW ({products.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-col on Mobile, 4-col on Desktop Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
