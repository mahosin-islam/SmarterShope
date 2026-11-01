'use client';

import React, { useState } from 'react';
import { ChevronDown, Star } from 'lucide-react';
import { MANIFESTO_DATA } from '@/features/products/data/mock-landing-data';

export const BrandManifesto: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header Tag */}
        <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#ff4600] mb-3">
          <Star className="w-3 h-3 fill-[#ff4600]" />
          <span>{MANIFESTO_DATA.badge.replace('★ ', '')}</span>
        </div>

        {/* Title */}
        <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-900 tracking-tight mb-4">
          {MANIFESTO_DATA.title}
        </h2>

        {/* Narrative Paragraph */}
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light mb-8">
          {MANIFESTO_DATA.description}
        </p>

        {/* Accordions */}
        <div className="border-t border-[#e8e6e3] divide-y divide-[#e8e6e3]">
          {MANIFESTO_DATA.accordions.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={item.number} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex items-center justify-between text-left group focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-editorial text-sm sm:text-base font-medium text-neutral-900 group-hover:text-[#ff4600] transition-colors">
                    {item.number}. {item.title}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 group-hover:text-[#ff4600] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="mt-2.5 pr-6 text-xs text-neutral-600 font-light leading-relaxed">
                    {item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
