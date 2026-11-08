import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e6e3] p-6 sm:p-8">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#e8e6e3]">
        <div className="w-9 h-9 rounded-full bg-[#fff3ec] text-[#ff4600] flex items-center justify-center">
          <Heart className="w-5 h-5 fill-[#ff4600]" />
        </div>
        <div>
          <h1 className="font-editorial text-2xl font-bold text-neutral-900">
            Saved Wardrobe Pieces
          </h1>
          <p className="text-xs text-neutral-500 font-light">
            Your personal curation of favored garments and accessories.
          </p>
        </div>
      </div>

      {/* Empty State */}
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-7 h-7 text-neutral-400 stroke-[1.5]" />
        </div>
        <h2 className="font-editorial text-xl font-bold text-neutral-900 mb-2">
          Your Wishlist is Empty
        </h2>
        <p className="text-xs text-neutral-500 font-light max-w-sm mx-auto mb-6">
          Explore our collection and click the heart icon on any garment to save it for your private fittings.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center space-x-2 bg-[#ff4600] hover:bg-[#e03e00] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg transition-all"
        >
          <span>Discover Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
