import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_SLIDE } from '@/features/store/home/data/mock-landing-data';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full bg-neutral-900 text-white overflow-hidden min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex items-end">
      {/* Background Image with Dark Vignette Gradient */}
      <div className="absolute inset-0 z-0">
        <Image
          src={HERO_SLIDE.imageUrl}
          alt={HERO_SLIDE.headline}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-20">
        {/* Top Collection Tag */}
        <div className="flex justify-end mb-16 sm:mb-24">
          <span className="text-[11px] sm:text-xs tracking-widest uppercase font-semibold text-neutral-300 bg-black/40 backdrop-blur-md px-3 py-1 rounded">
            {HERO_SLIDE.tag}
          </span>
        </div>

        <div className="max-w-xl">
          {/* Orange Capsule Badge */}
          <div className="inline-block bg-[#ff4600] text-white text-[10px] sm:text-[11px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm mb-3">
            {HERO_SLIDE.badge}
          </div>

          {/* Headline */}
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.08] tracking-tight text-white mb-3">
            {HERO_SLIDE.headline}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed mb-6 max-w-md">
            {HERO_SLIDE.subtitle}
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href={HERO_SLIDE.ctaLink}
              className="inline-flex items-center justify-center bg-[#ff4600] hover:bg-[#e03e00] text-white font-bold text-xs sm:text-sm tracking-wider uppercase px-8 py-3.5 rounded shadow-lg transition-all hover:shadow-orange-600/30"
            >
              {HERO_SLIDE.ctaText}
            </Link>
          </div>
        </div>

        {/* Bottom Carousel Navigation / Pagination */}
        <div className="flex justify-end items-center mt-6 sm:mt-0">
          <div className="flex items-center space-x-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded text-xs text-neutral-200">
            <span className="font-mono text-neutral-300 text-[11px] font-medium tracking-wider">
              {HERO_SLIDE.pageIndicator}
            </span>
            <div className="flex items-center space-x-1 pl-1 border-l border-neutral-700">
              <button
                type="button"
                className="p-1 hover:text-[#ff4600] transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="p-1 hover:text-[#ff4600] transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
