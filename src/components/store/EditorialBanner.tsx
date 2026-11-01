import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Scissors, Leaf, Globe } from 'lucide-react';
import { EDITORIAL_BANNER, VALUE_PROPS } from '@/features/products/data/mock-landing-data';

export const EditorialBanner: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Banner Visual Frame */}
        <div className="relative rounded-2xl overflow-hidden min-h-[380px] sm:min-h-[460px] flex items-end p-6 sm:p-10 shadow-sm">
          {/* Background Image */}
          <Image
            src={EDITORIAL_BANNER.imageUrl}
            alt={EDITORIAL_BANNER.title}
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          {/* Banner Content */}
          <div className="relative z-10 max-w-lg">
            <span className="inline-block bg-[#ff4600] text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm mb-2.5">
              {EDITORIAL_BANNER.badge}
            </span>

            <h2 className="font-editorial text-2xl sm:text-4xl text-white font-normal tracking-tight mb-2">
              {EDITORIAL_BANNER.title}
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 font-light mb-6 max-w-md">
              {EDITORIAL_BANNER.subtitle}
            </p>

            <Link
              href={EDITORIAL_BANNER.ctaLink}
              className="inline-flex items-center justify-center bg-[#ff4600] hover:bg-[#e03e00] text-white font-bold text-xs tracking-wider uppercase px-6 py-3 rounded transition-colors shadow-md"
            >
              {EDITORIAL_BANNER.ctaText}
            </Link>
          </div>
        </div>

        {/* 3-Column Value Props Strip below banner */}
        <div className="mt-4 grid grid-cols-3 divide-x divide-[#e8e6e3] bg-[#fffaf8] border border-[#ffeedd] rounded-xl py-4 sm:py-5 px-2 sm:px-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-1.5 px-2">
            <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff4600]" />
            <span className="text-[10px] sm:text-xs font-semibold text-neutral-800 tracking-wide">
              {VALUE_PROPS[0].title}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-1.5 px-2">
            <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff4600]" />
            <span className="text-[10px] sm:text-xs font-semibold text-neutral-800 tracking-wide">
              {VALUE_PROPS[1].title}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-1.5 px-2">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff4600]" />
            <span className="text-[10px] sm:text-xs font-semibold text-neutral-800 tracking-wide">
              {VALUE_PROPS[2].title}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
