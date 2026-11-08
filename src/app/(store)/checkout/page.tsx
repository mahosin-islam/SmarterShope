'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnnouncementBar } from '@/components/shared/AnnouncementBar';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { MobileBottomNav } from '@/components/shared/MobileBottomNav';
import { CreditCard, Truck, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface CartItem {
  productId: string;
  variantId?: string;
  variantTitle?: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');

  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Italy',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('modora_cart');
      setCartItems(raw ? JSON.parse(raw) : []);
    } catch {
      setCartItems([]);
    }
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 300 ? 0 : 25;
  const total = subtotal + shipping;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear cart
    try {
      localStorage.setItem('modora_cart', JSON.stringify([]));
      window.dispatchEvent(new Event('cart_updated'));
    } catch {
      /* noop */
    }
    setStep('success');
  };

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

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600 stroke-[2]" />
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
              Order Confirmed
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed mb-2">
              Thank you for your order,{' '}
              <span className="font-semibold text-neutral-800">
                {shippingData.firstName || 'Valued Client'}
              </span>.
            </p>
            <p className="text-xs text-neutral-500 font-light mb-8">
              A confirmation will be sent to <span className="underline">{shippingData.email || 'your email'}</span>.
              Your atelier parcel will be dispatched within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center space-x-2 bg-[#ff4600] hover:bg-[#e03e00] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg transition-all"
              >
                Continue Shopping
              </Link>
              <Link
                href="/account/orders"
                className="inline-flex items-center justify-center space-x-2 border border-[#e8e6e3] text-neutral-700 hover:text-[#ff4600] hover:border-[#ff4600] text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg transition-all"
              >
                View Orders
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-md text-center">
            <h1 className="font-editorial text-3xl font-bold text-neutral-900 mb-3">
              No Items to Checkout
            </h1>
            <p className="text-xs text-neutral-500 font-light mb-6">
              Your bag is empty. Please add garments to your bag before proceeding to checkout.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 bg-[#ff4600] hover:bg-[#e03e00] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Catalog</span>
            </Link>
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
          <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-neutral-400 mb-2">
            <Link href="/cart" className="inline-flex items-center space-x-1 hover:text-neutral-900 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Bag</span>
            </Link>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Secure Checkout
          </h1>

          {/* Progress Steps */}
          <div className="flex items-center space-x-2 mt-4">
            {[
              { key: 'shipping', label: 'Shipping', icon: Truck },
              { key: 'payment', label: 'Payment', icon: CreditCard },
            ].map((s, idx) => {
              const isActive = s.key === step;
              const isDone = (step === 'payment' && s.key === 'shipping');
              return (
                <React.Fragment key={s.key}>
                  <div
                    className={`flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider ${
                      isActive ? 'text-[#ff4600]' : isDone ? 'text-green-600' : 'text-neutral-400'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-[#ff4600] text-white' : isDone ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-400'
                    }`}>
                      <s.icon className="w-3 h-3" />
                    </div>
                    <span className="hidden sm:block">{s.label}</span>
                  </div>
                  {idx < 1 && <div className="flex-1 h-px max-w-8 bg-neutral-200" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Form Area */}
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
            {/* Shipping Section */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-[#ff4600] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  1
                </div>
                <h2 className="font-editorial text-xl font-bold text-neutral-900">
                  Delivery Address
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingData.firstName}
                    onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600]"
                    placeholder="Firstname"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingData.lastName}
                    onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600]"
                    placeholder="Lastname"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={shippingData.email}
                    onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600]"
                    placeholder="email@domain.com"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={shippingData.phone}
                    onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600]"
                    placeholder="+39 ..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingData.address}
                    onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600]"
                    placeholder="Via della Vigna Nuova, 18"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingData.city}
                    onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600]"
                    placeholder="Florence"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingData.postalCode}
                    onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600]"
                    placeholder="50123"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Country
                  </label>
                  <select
                    value={shippingData.country}
                    onChange={(e) => setShippingData({ ...shippingData, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] bg-white text-neutral-800"
                  >
                    <option>Bangladesh</option>
                    <option>Italy</option>
                    <option>Switzerland</option>
                    <option>United Kingdom</option>
                    <option>Germany</option>
                    <option>France</option>
                    <option>United States</option>
                    <option>United Arab Emirates</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Payment Section */}
            <section className="pt-6 border-t border-[#e8e6e3]">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-[#ff4600] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  2
                </div>
                <h2 className="font-editorial text-xl font-bold text-neutral-900">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                <label className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'card' ? 'border-[#ff4600] bg-[#fff3ec]' : 'border-[#e8e6e3] hover:border-neutral-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="accent-[#ff4600]"
                  />
                  <CreditCard className="w-5 h-5 text-neutral-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">Credit / Debit Card</span>
                    <span className="text-[11px] text-neutral-500">Visa, Mastercard, Amex — secured via Stripe</span>
                  </div>
                </label>

                <label className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'paypal' ? 'border-[#ff4600] bg-[#fff3ec]' : 'border-[#e8e6e3] hover:border-neutral-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                    className="accent-[#ff4600]"
                  />
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-black text-xs">PP</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">PayPal</span>
                    <span className="text-[11px] text-neutral-500">Pay using your PayPal balance or card</span>
                  </div>
                </label>
              </div>

              {paymentMethod === 'card' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Card Number
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder="•••• •••• •••• •••• (Demo Mode)"
                      className="w-full px-3.5 py-2.5 text-sm border border-[#e8e6e3] rounded-lg bg-neutral-100 text-neutral-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">Expiry Date</label>
                      <input type="text" disabled placeholder="MM / YY" className="w-full px-3.5 py-2.5 text-sm border border-[#e8e6e3] rounded-lg bg-neutral-100 text-neutral-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">CVV</label>
                      <input type="text" disabled placeholder="•••" className="w-full px-3.5 py-2.5 text-sm border border-[#e8e6e3] rounded-lg bg-neutral-100 text-neutral-500 cursor-not-allowed" />
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-light">
                    ⚠ Payment integration coming soon. Click &quot;Place Order&quot; to simulate a successful order.
                  </p>
                </div>
              )}
            </section>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 bg-[#ff4600] hover:bg-[#e03e00] text-white text-xs font-bold uppercase tracking-wider py-4 rounded-xl shadow-md hover:shadow-orange-600/30 transition-all focus:outline-none"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                <span>Place Order — ${total.toFixed(2)}</span>
              </button>
              <p className="text-center text-[11px] text-neutral-400 mt-3 font-light">
                By placing this order you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </form>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="border border-[#e8e6e3] rounded-2xl p-6 bg-neutral-50/50 sticky top-24">
              <h2 className="font-editorial text-lg font-bold text-neutral-900 mb-4">
                Your Bag ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
              </h2>

              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto no-scrollbar">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex items-start space-x-3">
                    <div className="relative w-14 h-16 rounded-lg overflow-hidden border border-[#e8e6e3] bg-neutral-100 shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neutral-800 text-white text-[9px] font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-900 line-clamp-2 leading-tight">
                        {item.title}
                      </p>
                      {item.variantTitle && (
                        <p className="text-[11px] text-neutral-500 mt-0.5">{item.variantTitle}</p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-neutral-900 shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#e8e6e3] pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Courier</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                    {shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-[#e8e6e3] text-neutral-900">
                  <span>Total</span>
                  <span className="text-[#ff4600]">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
