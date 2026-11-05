import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { TICKER_DATA } from '@/features/store/home/data/mock-landing-data';

export const TickerStrip: React.FC = () => {
  return (
    <section className="bg-[#fff3ec] border-y border-[#ffdfcf] py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
        {/* Left: Tag label */}
        <div className="flex items-center space-x-2 text-neutral-800 font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-[#ff4600] shrink-0" />
          <span className="font-semibold text-[11px] sm:text-xs uppercase tracking-wider text-neutral-900">
            {TICKER_DATA.label}
          </span>
        </div>

        {/* Right: Link */}
        <Link
          href={TICKER_DATA.actionLink}
          className="flex items-center space-x-1 text-[#ff4600] hover:text-[#e03e00] font-bold text-[11px] sm:text-xs tracking-wider uppercase transition-colors"
        >
          <span>{TICKER_DATA.actionText}</span>
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </Link>
      </div>
    </section>
  );
};
