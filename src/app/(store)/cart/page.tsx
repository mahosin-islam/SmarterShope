'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnnouncementBar } from '@/components/shared/AnnouncementBar';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { MobileBottomNav } from '@/components/shared/MobileBottomNav';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package } from 'lucide-react';

interface CartItem {
  productId: string;
  variantId?: string;
  variantTitle?: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadCart = () => {
      try {
        const raw = localStorage.getItem('modora_cart');
        setCartItems(raw ? JSON.parse(raw) : []);
      } catch {
        setCartItems([]);
      }
    };
    loadCart();
    window.addEventListener('cart_updated', loadCart);
    return () => window.removeEventListener('cart_updated', loadCart);
  }, []);

  const updateQuantity = (productId: string, variantId: string | undefined, delta: number) => {
    const updated = cartItems
      .map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
      .filter((item) => item.quantity > 0);
    setCartItems(updated);
    localStorage.setItem('modora_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart_updated'));
  };

  const removeItem = (productId: string, variantId: string | undefined) => {
    const updated = cartItems.filter(
      (item) => !(item.productId === productId && item.variantId === variantId)
    );
    setCartItems(updated);
    localStorage.setItem('modora_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart_updated'));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 300 ? 0 : 25;
  const total = subtotal + shipping;

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-neutral-100 rounded-xl" />
            ))}
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="border-b border-[#e8e6e3] pb-6 mb-8">
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Your Atelier Bag
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light">
            {cartItems.length === 0 ? 'Your bag is empty.' : `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'} reserved.`}
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-24 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-8 h-8 text-neutral-400 stroke-[1.4]" />
            </div>
            <h2 className="font-editorial text-2xl font-bold text-neutral-900 mb-2">
              Your bag is pristine
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 font-light leading-relaxed mb-8">
              You have not added any garments yet. Discover our archive of bespoke tailoring, knitwear, footwear, and accessories.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 bg-[#ff4600] hover:bg-[#e03e00] text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-lg shadow-md transition-all"
            >
              <span>Explore the Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Cart Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-4 p-4 border border-[#e8e6e3] rounded-xl bg-white hover:border-neutral-300 transition-colors"
                >
                  {/* Product Image */}
                  <Link
                    href={`/products/${item.productId}`}
                    className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden bg-neutral-100 border border-[#e8e6e3] shrink-0"
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </Link>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.productId}`}
                          className="font-semibold text-sm text-neutral-900 hover:text-[#ff4600] transition-colors line-clamp-2 leading-tight"
                        >
                          {item.title}
                        </Link>
                        {item.variantTitle && (
                          <span className="text-[11px] text-neutral-500 font-medium mt-0.5 block">
                            {item.variantTitle}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#e8e6e3] rounded-lg bg-neutral-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.variantId, -1)}
                          className="p-2 text-neutral-600 hover:text-black transition-colors"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-bold text-neutral-900 min-w-[1.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.variantId, 1)}
                          className="p-2 text-neutral-600 hover:text-black transition-colors"
                          aria-label="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <span className="font-bold text-sm text-neutral-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-[11px] text-neutral-400 block">
                          ${item.price.toFixed(2)} each
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Continue Shopping */}
              <div className="pt-2">
                <Link
                  href="/products"
                  className="text-xs font-semibold text-[#ff4600] hover:underline"
                >
                  &larr; Continue Browsing Archive
                </Link>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-5">
              <div className="border border-[#e8e6e3] rounded-2xl p-6 sm:p-7 bg-neutral-50/50 sticky top-24">
                <h2 className="font-editorial text-xl font-bold text-neutral-900 mb-5">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs sm:text-sm border-b border-[#e8e6e3] pb-4 mb-4">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-semibold text-neutral-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Atelier Courier</span>
                    <span className={shipping === 0 ? 'text-green-600 font-semibold' : 'font-semibold text-neutral-900'}>
                      {shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-[11px] text-neutral-400">
                      Free courier on orders over $300.00
                    </p>
                  )}
                  <div className="flex justify-between text-neutral-600">
                    <span>Duties &amp; Taxes</span>
                    <span className="font-semibold text-neutral-900">Included</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-6">
                  <span className="font-bold text-sm uppercase tracking-wider text-neutral-900">Total</span>
                  <span className="font-editorial text-2xl font-bold text-[#ff4600]">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full text-center bg-[#ff4600] hover:bg-[#e03e00] text-white text-xs font-bold uppercase tracking-wider py-4 rounded-xl shadow-md hover:shadow-orange-600/30 transition-all"
                >
                  Proceed to Checkout &rarr;
                </Link>

                {/* Trust Badges */}
                <div className="mt-5 flex items-center justify-center space-x-4 text-[11px] text-neutral-400">
                  <div className="flex items-center space-x-1">
                    <Package className="w-3.5 h-3.5" />
                    <span>Discreet Packaging</span>
                  </div>
                  <span>•</span>
                  <span>Secure Checkout</span>
                  <span>•</span>
                  <span>30-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
