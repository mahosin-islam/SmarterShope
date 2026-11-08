import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { storeService } from '@/features/store/services/store.service';

export const CuratedArchives: React.FC = async () => {
  const categories = await storeService.getCategories();

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-neutral-900 font-semibold tracking-tight">
              Curated Archives
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light">
              Curated by timeless masculine silhouettes
            </p>
          </div>

          <Link
            href="/categories"
            className="flex items-center space-x-1 text-xs font-bold text-[#ff4600] hover:text-[#e03e00] tracking-wider uppercase transition-colors"
          >
            <span>ALL ({categories.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Categories Strip */}
        <div className="flex items-start space-x-4 sm:space-x-6 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center shrink-0 w-24 sm:w-28 text-center"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-neutral-100 border border-[#e8e6e3] shadow-xs group-hover:border-[#ff4600] transition-all">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="mt-2 text-xs font-medium text-neutral-800 group-hover:text-[#ff4600] transition-colors truncate max-w-full px-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
