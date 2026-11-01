'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Eye } from 'lucide-react';
import { StoreProduct } from '@/types/store';

interface ProductCardProps {
  product: StoreProduct;
  onQuickView?: (product: StoreProduct) => void;
  onAddToCart?: (product: StoreProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const getBadgeClasses = (variant: 'discount' | 'restocked' | 'new') => {
    switch (variant) {
      case 'discount':
        return 'bg-[#ff4600] text-white';
      case 'restocked':
        return 'bg-[#8b1528] text-white';
      case 'new':
        return 'bg-[#ff4600] text-white';
      default:
        return 'bg-neutral-900 text-white';
    }
  };

  return (
    <div className="group relative flex flex-col bg-white border border-[#e8e6e3] rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Product Image Frame */}
      <div className="relative aspect-[4/5] w-full bg-neutral-100 overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Top Left Badge */}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className={`text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm shadow-xs ${getBadgeClasses(
                product.badge.variant
              )}`}
            >
              {product.badge.text}
            </span>
          </div>
        )}

        {/* Top Right Wishlist Button */}
        <button
          type="button"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-neutral-700 hover:text-[#ff4600] hover:bg-white shadow-xs transition-colors"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted
                ? 'fill-[#ff4600] text-[#ff4600]'
                : 'stroke-[1.8]'
            }`}
          />
        </button>

        {/* Color Options Swatch Tag if any */}
        {product.colorOptionsCount && (
          <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs text-[9px] font-medium text-neutral-700 px-1.5 py-0.5 rounded">
            {product.colorOptionsCount} Colors
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Category Pill */}
        <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-1">
          {product.category.name}
        </span>

        {/* Product Title */}
        <Link
          href={`/products/${product.slug}`}
          className="font-medium text-xs sm:text-sm text-neutral-900 group-hover:text-[#ff4600] transition-colors line-clamp-1 mb-1.5"
          title={product.title}
        >
          {product.title}
        </Link>

        {/* Rating and Reviews */}
        <div className="flex items-center space-x-1 text-[11px] text-neutral-500 mb-2">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-neutral-700">{product.rating.toFixed(1)}</span>
          <span className="text-neutral-400">({product.reviewCount})</span>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline space-x-2 mb-3.5 mt-auto">
          <span className="text-sm sm:text-base font-bold text-[#ff4600]">
            ${product.basePrice.toFixed(2)}
          </span>
          {product.comparePrice && (
            <span className="text-xs text-neutral-400 line-through">
              ${product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Action Buttons: Add to Bag + Quick View */}
        <div className="flex items-center space-x-2 pt-1 border-t border-[#f0eeed]">
          <button
            type="button"
            onClick={() => onAddToCart?.(product)}
            className="flex-1 bg-[#ff4600] hover:bg-[#e03e00] text-white font-bold text-[10px] sm:text-xs tracking-wider uppercase py-2.5 px-3 rounded text-center transition-colors shadow-xs"
          >
            ADD TO BAG
          </button>
          <button
            type="button"
            onClick={() => onQuickView?.(product)}
            className="p-2 border border-[#e8e6e3] rounded text-neutral-600 hover:text-black hover:border-neutral-400 transition-colors"
            aria-label={`Quick view ${product.title}`}
          >
            <Eye className="w-4 h-4 stroke-[1.8]" />
          </button>
        </div>
      </div>
    </div>
  );
};
