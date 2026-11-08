'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, ShoppingBag, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { BackendProduct } from '@/features/store/services/store.service';

interface ProductDetailInteractiveProps {
  product: BackendProduct;
}

export const ProductDetailInteractive: React.FC<ProductDetailInteractiveProps> = ({ product }) => {
  const images = product.images && product.images.length > 0
    ? product.images.map((img) => img.url)
    : ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop'];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants && product.variants.length > 0 ? product.variants[0].id : null
  );
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const basePrice = Number(product.basePrice) || 0;
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  const discountPercent = comparePrice && comparePrice > basePrice
    ? Math.round(((comparePrice - basePrice) / comparePrice) * 100)
    : null;

  const handleAddToCart = () => {
    // Add to cart local storage state
    try {
      const existing = localStorage.getItem('modora_cart');
      const cartItems = existing ? JSON.parse(existing) : [];
      const itemIndex = cartItems.findIndex(
        (i: { productId: string; variantId?: string }) =>
          i.productId === product.id && i.variantId === selectedVariantId
      );

      const variant = product.variants?.find((v) => v.id === selectedVariantId);
      const selectedPrice = variant ? Number(variant.price) : basePrice;

      if (itemIndex > -1) {
        cartItems[itemIndex].quantity += quantity;
      } else {
        cartItems.push({
          productId: product.id,
          variantId: selectedVariantId,
          variantTitle: variant?.title,
          title: product.title,
          price: selectedPrice,
          imageUrl: images[0],
          quantity,
        });
      }
      localStorage.setItem('modora_cart', JSON.stringify(cartItems));
      window.dispatchEvent(new Event('cart_updated'));
    } catch {
      // Local storage disabled or error
    }

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Left: Product Images Gallery */}
      <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
        {/* Thumbnails (desktop left / mobile bottom) */}
        {images.length > 1 && (
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[580px] shrink-0 no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  activeImageIndex === idx ? 'border-[#ff4600] opacity-100' : 'border-neutral-200 opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.title} view ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Display Image */}
        <div className="relative flex-1 aspect-[4/5] bg-neutral-100 rounded-2xl overflow-hidden border border-[#e8e6e3]">
          <Image
            src={images[activeImageIndex] || images[0]}
            alt={product.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-center"
          />

          {discountPercent && (
            <div className="absolute top-4 left-4 bg-[#ff4600] text-white font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded shadow-md">
              -{discountPercent}% OFF
            </div>
          )}
        </div>
      </div>

      {/* Right: Product Purchase Actions & Details */}
      <div className="lg:col-span-5 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
            <span>{product.brand?.name || 'MODORA Atelier'}</span>
            <span>&bull;</span>
            <span>{product.category?.name || 'Archive'}</span>
          </div>

          {/* Product Title */}
          <h1 className="font-editorial text-3xl sm:text-4xl text-neutral-900 font-bold tracking-tight mb-4 leading-tight">
            {product.title}
          </h1>

          {/* Pricing Row */}
          <div className="flex items-baseline space-x-3 mb-6">
            <span className="font-editorial text-2xl sm:text-3xl font-semibold text-neutral-900">
              ${basePrice.toFixed(2)}
            </span>
            {comparePrice && comparePrice > basePrice && (
              <span className="text-base text-neutral-400 line-through">
                ${comparePrice.toFixed(2)}
              </span>
            )}
            <span className="text-xs text-neutral-500 font-medium ml-2">
              Taxes included &bull; Duties covered
            </span>
          </div>

          {/* Short Description */}
          <p className="text-sm text-neutral-600 leading-relaxed mb-6 font-light">
            {product.shortDescription || product.description?.slice(0, 200) || 'Handcrafted garment tailored with precision.'}
          </p>

          {/* Variants / Sizing Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Select Size / Variant
                </span>
                <span className="text-[11px] text-neutral-400 underline cursor-pointer hover:text-neutral-700">
                  Size Guide
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariantId === v.id;
                  const inStock = (v.stock ?? 1) > 0;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!inStock}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        isSelected
                          ? 'border-[#ff4600] bg-[#fff3ec] text-[#ff4600]'
                          : inStock
                          ? 'border-[#e8e6e3] text-neutral-700 hover:border-neutral-400 bg-white'
                          : 'border-neutral-200 bg-neutral-100 text-neutral-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {v.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3">
              {/* Quantity Adjuster */}
              <div className="flex items-center border border-[#e8e6e3] rounded-lg bg-neutral-50">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2.5 text-neutral-600 hover:text-black font-semibold text-sm focus:outline-none"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-3 py-2 text-xs font-bold text-neutral-900 w-8 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2.5 text-neutral-600 hover:text-black font-semibold text-sm focus:outline-none"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Bag CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center space-x-2 bg-[#ff4600] hover:bg-[#e03e00] text-white py-3.5 px-6 rounded-lg font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-orange-600/30 transition-all focus:outline-none"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag &bull; ${(basePrice * quantity).toFixed(2)}</span>
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-3.5 rounded-lg border transition-colors ${
                  isWishlisted
                    ? 'border-[#ff4600] bg-[#fff3ec] text-[#ff4600]'
                    : 'border-[#e8e6e3] hover:border-neutral-400 text-neutral-700'
                }`}
                aria-label="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#ff4600]' : ''}`} />
              </button>
            </div>

            {/* Direct Checkout Link */}
            <a
              href="/checkout"
              className="block text-center py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 border border-[#e8e6e3] rounded-lg hover:bg-neutral-50 transition-colors uppercase tracking-wider"
            >
              Express Checkout
            </a>
          </div>

          {/* Reassurance Badges */}
          <div className="grid grid-cols-3 gap-2 border-t border-b border-[#e8e6e3] py-4 text-center">
            <div className="flex flex-col items-center">
              <Truck className="w-4 h-4 text-[#ff4600] mb-1" />
              <span className="text-[10px] font-semibold text-neutral-800 uppercase tracking-wider">Fast Courier</span>
              <span className="text-[10px] text-neutral-400">2-4 business days</span>
            </div>
            <div className="flex flex-col items-center border-x border-[#e8e6e3]">
              <RefreshCw className="w-4 h-4 text-[#ff4600] mb-1" />
              <span className="text-[10px] font-semibold text-neutral-800 uppercase tracking-wider">Free Returns</span>
              <span className="text-[10px] text-neutral-400">Within 30 days</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-4 h-4 text-[#ff4600] mb-1" />
              <span className="text-[10px] font-semibold text-neutral-800 uppercase tracking-wider">Authentic</span>
              <span className="text-[10px] text-neutral-400">Certified origin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
