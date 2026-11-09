'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Check, ShieldCheck, Truck, RefreshCw, Ruler } from 'lucide-react';
import { BackendProduct } from '@/features/store/services/store.service';
import { useAuth } from '@/features/auth/contexts/authContext';
import { useAuthModal } from '@/features/auth/contexts/authModal.context';

interface ProductDetailInteractiveProps {
  product: BackendProduct;
}

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export const ProductDetailInteractive: React.FC<ProductDetailInteractiveProps> = ({ product }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();

  const images = product.images && product.images.length > 0
    ? product.images.map((img) => img.url)
    : ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop'];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Variant/size handling
  const hasDbVariants = Boolean(product.variants && product.variants.length > 0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    hasDbVariants ? product.variants![0].id : null
  );
  const [selectedDefaultSize, setSelectedDefaultSize] = useState<string>(DEFAULT_SIZES[1]); // default 'M'

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Sync wishlist status
  useEffect(() => {
    try {
      const raw = localStorage.getItem('modora_wishlist');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          setIsWishlisted(list.some((p: { id: string }) => p.id === product.id));
        }
      }
    } catch {
      //
    }
  }, [product.id]);

  const basePrice = Number(product.basePrice) || 0;
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  const discountPercent = comparePrice && comparePrice > basePrice
    ? Math.round(((comparePrice - basePrice) / comparePrice) * 100)
    : null;

  const currentVariant = hasDbVariants
    ? product.variants?.find((v) => v.id === selectedVariantId)
    : null;
  const activePrice = currentVariant ? Number(currentVariant.price) : basePrice;
  const activeSizeTitle = currentVariant ? currentVariant.title : selectedDefaultSize;

  const saveToCart = () => {
    try {
      const existing = localStorage.getItem('modora_cart');
      const cartItems = existing ? JSON.parse(existing) : [];

      const itemIndex = cartItems.findIndex(
        (i: { productId: string; variantTitle?: string }) =>
          i.productId === product.id && i.variantTitle === activeSizeTitle
      );

      if (itemIndex > -1) {
        cartItems[itemIndex].quantity += quantity;
      } else {
        cartItems.push({
          productId: product.id,
          variantId: selectedVariantId || undefined,
          variantTitle: activeSizeTitle,
          title: product.title,
          price: activePrice,
          imageUrl: images[0],
          quantity,
        });
      }
      localStorage.setItem('modora_cart', JSON.stringify(cartItems));
      window.dispatchEvent(new Event('cart_updated'));
    } catch {
      // Local storage disabled or error
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    saveToCart();
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleBuyNow = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    saveToCart();
    router.push('/checkout');
  };

  const handleWishlistToggle = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      const raw = localStorage.getItem('modora_wishlist');
      let list: Array<{ id: string; title: string; imageUrl: string; basePrice: number; slug: string }> = raw
        ? JSON.parse(raw)
        : [];
      if (isWishlisted) {
        list = list.filter((p) => p.id !== product.id);
        setIsWishlisted(false);
      } else {
        list.push({
          id: product.id,
          title: product.title,
          imageUrl: images[0],
          basePrice: activePrice,
          slug: product.slug,
        });
        setIsWishlisted(true);
      }
      localStorage.setItem('modora_wishlist', JSON.stringify(list));
      window.dispatchEvent(new Event('wishlist_updated'));
    } catch {
      // Ignore
    }
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
            <span>{product.category?.name || 'Collection'}</span>
          </div>

          {/* Product Title */}
          <h1 className="font-editorial text-2xl sm:text-3xl text-neutral-900 font-bold tracking-tight mb-3 leading-tight">
            {product.title}
          </h1>

          {/* Pricing Row in BDT (৳) */}
          <div className="flex items-baseline space-x-3 mb-5">
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-neutral-900">
              ৳{activePrice.toFixed(0)}
            </span>
            {comparePrice && comparePrice > activePrice && (
              <span className="text-base text-neutral-400 line-through">
                ৳{Number(comparePrice).toFixed(0)}
              </span>
            )}
            <span className="text-xs text-neutral-500 font-medium ml-2">
              In Stock &bull; Cash on Delivery Available
            </span>
          </div>

          {/* Short Description */}
          <p className="text-sm text-neutral-600 leading-relaxed mb-6 font-light">
            {product.shortDescription || product.description?.slice(0, 180) || 'Premium crafted quality with refined tailoring.'}
          </p>

          {/* Size Selector Section */}
          <div className="mb-6 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-neutral-900">Size</span>
                <span className="text-xs text-neutral-400">Int</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeGuide(!showSizeGuide)}
                className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <span>Size Guide</span>
                <Ruler className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Size Buttons */}
            <div className="flex flex-wrap gap-2.5">
              {hasDbVariants ? (
                product.variants!.map((v) => {
                  const isSelected = selectedVariantId === v.id;
                  const inStock = (v.stock ?? 1) > 0;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!inStock}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`min-w-[48px] px-3.5 py-2 text-xs font-semibold rounded-md border transition-all ${
                        isSelected
                          ? 'border-[#ff4600] text-[#ff4600] bg-white ring-1 ring-[#ff4600]'
                          : inStock
                          ? 'border-neutral-300 text-neutral-800 hover:border-neutral-500 bg-white'
                          : 'border-neutral-200 bg-neutral-100 text-neutral-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {v.title}
                    </button>
                  );
                })
              ) : (
                DEFAULT_SIZES.map((size) => {
                  const isSelected = selectedDefaultSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedDefaultSize(size)}
                      className={`min-w-[48px] px-3.5 py-2 text-xs font-semibold rounded-md border transition-all ${
                        isSelected
                          ? 'border-[#ff4600] text-[#ff4600] bg-white ring-1 ring-[#ff4600]'
                          : 'border-neutral-300 text-neutral-800 hover:border-neutral-500 bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })
              )}
            </div>

            {/* Size Guide modal/drawer */}
            {showSizeGuide && (
              <div className="mt-3 p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600">
                <p className="font-semibold text-neutral-800 mb-1">Standard Size Reference (Inches):</p>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] mt-1">
                  <div className="border border-neutral-200 p-1 rounded bg-white"><strong>M</strong>: Chest 38-40</div>
                  <div className="border border-neutral-200 p-1 rounded bg-white"><strong>L</strong>: Chest 40-42</div>
                  <div className="border border-neutral-200 p-1 rounded bg-white"><strong>XL</strong>: Chest 42-44</div>
                  <div className="border border-neutral-200 p-1 rounded bg-white"><strong>XXL</strong>: Chest 44-46</div>
                </div>
              </div>
            )}
          </div>

          {/* Quantity Section */}
          <div className="mb-6 flex items-center space-x-6">
            <span className="text-sm font-semibold text-neutral-900 w-16">Quantity</span>
            <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:text-black font-semibold text-sm transition-colors"
                aria-label="Decrease quantity"
              >
                &mdash;
              </button>
              <span className="w-10 text-center text-sm font-bold text-neutral-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:text-black font-semibold text-sm transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons: Buy Now & Add to Cart */}
          <div className="flex items-center space-x-3 mb-8">
            {/* Buy Now Button (Cyan / Light Blue) */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 py-3.5 px-6 rounded-lg bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-cyan-600/20 transition-all text-center focus:outline-none"
            >
              Buy Now
            </button>

            {/* Add to Cart Button (Orange) */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-3.5 px-6 rounded-lg bg-[#ff4600] hover:bg-[#e03e00] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-orange-600/20 transition-all text-center focus:outline-none flex items-center justify-center space-x-1.5"
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Added to Bag!</span>
                </>
              ) : (
                <span>Add to Cart</span>
              )}
            </button>

            {/* Wishlist Icon */}
            <button
              type="button"
              onClick={handleWishlistToggle}
              className={`p-3.5 rounded-lg border transition-colors shrink-0 ${
                isWishlisted
                  ? 'border-[#ff4600] bg-[#fff3ec] text-[#ff4600]'
                  : 'border-neutral-300 hover:border-neutral-400 text-neutral-700'
              }`}
              aria-label="Save to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#ff4600]' : ''}`} />
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-3 gap-2 border-t border-b border-[#e8e6e3] py-4 text-center">
            <div className="flex flex-col items-center">
              <Truck className="w-4 h-4 text-[#ff4600] mb-1" />
              <span className="text-[10px] font-semibold text-neutral-800 uppercase tracking-wider">Fast Courier</span>
              <span className="text-[10px] text-neutral-400">2-3 days delivery</span>
            </div>
            <div className="flex flex-col items-center border-x border-[#e8e6e3]">
              <RefreshCw className="w-4 h-4 text-[#ff4600] mb-1" />
              <span className="text-[10px] font-semibold text-neutral-800 uppercase tracking-wider">Easy Exchange</span>
              <span className="text-[10px] text-neutral-400">Within 7 days</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-4 h-4 text-[#ff4600] mb-1" />
              <span className="text-[10px] font-semibold text-neutral-800 uppercase tracking-wider">100% Genuine</span>
              <span className="text-[10px] text-neutral-400">Original quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
