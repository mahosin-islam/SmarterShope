'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

interface WishlistItem {
  id: string;
  title: string;
  imageUrl?: string;
  basePrice?: number;
  slug?: string;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadWishlist = () => {
      try {
        const raw = localStorage.getItem('modora_wishlist');
        if (raw) {
          const parsed = JSON.parse(raw);
          setWishlistItems(Array.isArray(parsed) ? parsed : []);
        } else {
          setWishlistItems([]);
        }
      } catch {
        setWishlistItems([]);
      }
    };

    loadWishlist();
    window.addEventListener('wishlist_updated', loadWishlist);
    return () => window.removeEventListener('wishlist_updated', loadWishlist);
  }, []);

  const handleRemove = (id: string) => {
    try {
      const updated = wishlistItems.filter((item) => item.id !== id);
      setWishlistItems(updated);
      localStorage.setItem('modora_wishlist', JSON.stringify(updated));
      window.dispatchEvent(new Event('wishlist_updated'));
    } catch {
      //
    }
  };

  const handleMoveToCart = (item: WishlistItem) => {
    try {
      // 1. Add to cart
      const existing = localStorage.getItem('modora_cart');
      const cartItems = existing ? JSON.parse(existing) : [];

      const itemIndex = cartItems.findIndex(
        (i: { productId: string }) => i.productId === item.id
      );

      if (itemIndex > -1) {
        cartItems[itemIndex].quantity += 1;
      } else {
        cartItems.push({
          productId: item.id,
          variantTitle: 'M',
          title: item.title,
          price: Number(item.basePrice) || 0,
          imageUrl: item.imageUrl || '',
          quantity: 1,
        });
      }
      localStorage.setItem('modora_cart', JSON.stringify(cartItems));
      window.dispatchEvent(new Event('cart_updated'));

      // 2. Remove from wishlist
      handleRemove(item.id);
    } catch {
      //
    }
  };

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8e6e3] p-6 sm:p-8 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] bg-neutral-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e8e6e3] p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#e8e6e3]">
        <div className="w-9 h-9 rounded-full bg-[#fff3ec] text-[#ff4600] flex items-center justify-center">
          <Heart className="w-5 h-5 fill-[#ff4600]" />
        </div>
        <div>
          <h1 className="font-editorial text-2xl font-bold text-neutral-900">
            Saved Wardrobe Pieces
          </h1>
          <p className="text-xs text-neutral-500 font-light">
            {wishlistItems.length === 0
              ? 'Your personal curation is empty.'
              : `${wishlistItems.length} favored ${wishlistItems.length === 1 ? 'garment' : 'garments'} saved.`}
          </p>
        </div>
      </div>

      {/* Wishlist Grid */}
      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col border border-[#e8e6e3] rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 bg-white"
            >
              {/* Image Frame */}
              <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400">
                    <Heart className="w-8 h-8 stroke-[1.2]" />
                  </div>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-neutral-600 hover:text-red-500 hover:bg-white shadow-xs transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Details & Actions */}
              <div className="p-3.5 flex flex-col flex-1">
                <Link
                  href={item.slug ? `/products/${item.slug}` : `/products`}
                  className="font-medium text-xs sm:text-sm text-neutral-900 hover:text-[#ff4600] line-clamp-1 mb-1 transition-colors"
                  title={item.title}
                >
                  {item.title}
                </Link>

                {item.basePrice !== undefined && (
                  <span className="text-sm font-bold text-[#ff4600] mb-3">
                    ৳{Number(item.basePrice).toFixed(0)}
                  </span>
                )}

                <div className="mt-auto pt-2 border-t border-neutral-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(item)}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 text-[11px] font-bold uppercase tracking-wider bg-[#ff4600] hover:bg-[#e03e00] text-white rounded-lg shadow-xs transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
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
      )}
    </div>
  );
}
