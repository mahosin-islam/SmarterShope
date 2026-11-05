import React from 'react';
import { EDITORIAL_QUOTE } from '@/features/store/home/data/mock-landing-data';

export const EditorialQuote: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-[#fffbf9] border-y border-[#f5ece7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Quote Glyph */}
        <div className="text-[#ff4600] text-3xl sm:text-4xl font-serif font-bold mb-4 select-none">
          &ldquo;&rdquo;
        </div>

        {/* Quote Body */}
        <blockquote className="font-editorial italic text-xl sm:text-2xl lg:text-3xl text-neutral-800 leading-snug font-normal max-w-2xl mx-auto mb-6">
          {EDITORIAL_QUOTE.quote}
        </blockquote>

        {/* Citation */}
        <div className="space-y-0.5">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#ff4600]">
            {EDITORIAL_QUOTE.publication}
          </p>
          <p className="text-[11px] text-neutral-500 font-light">
            {EDITORIAL_QUOTE.issue}
          </p>
        </div>
      </div>
    </section>
  );
};
