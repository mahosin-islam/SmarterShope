'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface HeroBannerSlide {
  id: string;
  categoryName: string;
  categorySlug: string;
  href: string;
  imageUrl: string;
  alt: string;
}

const HERO_SLIDES: HeroBannerSlide[] = [
  {
    id: 'footwear',
    categoryName: 'Footwear',
    categorySlug: 'footwear',
    href: '/products?category=footwear',
    imageUrl: 'https://res.cloudinary.com/dzoigbkep/image/upload/v1794195844/roey9xmzc1wbbcq67xa6.jpg',
    alt: 'Footwear Atelier Collection — Shoes, Loafers & Sneakers',
  },
  {
    id: 'pants-trousers',
    categoryName: 'Pants & Trousers',
    categorySlug: 'pants-trousers',
    href: '/products?category=pants-trousers',
    imageUrl: 'https://res.cloudinary.com/dzoigbkep/image/upload/v1794195878/dvoeahhykeqtsxgv261v.jpg',
    alt: 'Pants & Trousers — Tailored Chinos, Slacks & Casual Trousers',
  },
  {
    id: 'shirts',
    categoryName: 'Shirts',
    categorySlug: 'shirts',
    href: '/products?category=shirts',
    imageUrl: 'https://res.cloudinary.com/dzoigbkep/image/upload/v1794195903/ueo0piklnxkccjaran8v.jpg',
    alt: 'Shirts — Premium Tailored Oxford & Casual Shirts',
  },
];

export const HeroSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const totalSlides = HERO_SLIDES.length;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipeLeft = distance > 50;
    const isSwipeRight = distance < -50;

    if (isSwipeLeft) {
      handleNext();
    } else if (isSwipeRight) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-6 sm:py-6"
      aria-label="Promotional Hero Banners"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Hero Carousel Container */}
      <div
        className="group relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[2.3/1] lg:aspect-[2.6/1] max-h-[500px] min-h-[200px] sm:min-h-[260px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#e8e6e3] bg-neutral-950 shadow-sm"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides Track */}
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Entire slide is wrapped in Link to corresponding category */}
              <Link
                href={slide.href}
                className="relative block w-full h-full focus:outline-none"
                aria-label={`Browse ${slide.categoryName}`}
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.alt}
                  fill
                  priority={idx === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1280px"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                />

                {/* Subtle bottom vignette to ensure indicators are always visible */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 via-black/15 to-transparent pointer-events-none" />
              </Link>
            </div>
          );
        })}

        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-2.5 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/85 hover:bg-white text-neutral-900 shadow-md backdrop-blur-md flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 focus:outline-none"
          aria-label="Previous Banner Slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-2.5 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/85 hover:bg-white text-neutral-900 shadow-md backdrop-blur-md flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 focus:outline-none"
          aria-label="Next Banner Slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
        </button>

        {/* Bottom Pagination Dots & Category Indicator */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;

            return (
              <button
                key={slide.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full h-1.5 sm:h-2 ${
                  isActive
                    ? 'w-5 sm:w-6 bg-[#ff4600]'
                    : 'w-1.5 sm:w-2 bg-white/60 hover:bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}: ${slide.categoryName}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
