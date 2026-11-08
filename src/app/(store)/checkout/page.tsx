'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnnouncementBar } from '@/components/shared/AnnouncementBar';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { MobileBottomNav } from '@/components/shared/MobileBottomNav';
import { useBangladeshGeo, GeoItem } from '@/features/store/checkout/useBangladeshGeo';
import {
  User,
  MapPin,
  Truck,
  ShieldCheck,
  CreditCard,
  Banknote,
  CheckCircle2,
  Lock,
  ArrowLeft,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

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
  const [step, setStep] = useState<'form' | 'success'>('form');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');

  // Bangladesh Geographic cascading selection
  const {
    divisions,
    getDistrictsByDivisionId,
    getUpazilasByDistrictId,
    getUnionsByUpazilaId,
    formatGeoLabel,
    isLoading: isGeoLoading,
  } = useBangladeshGeo();

  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedUpazilaId, setSelectedUpazilaId] = useState('');
  const [selectedUnionId, setSelectedUnionId] = useState('');

  const [altPhone, setAltPhone] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');

  // Payment method: 'cod' | 'card' | 'bkash'
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'bkash'>('cod');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');

  // Order Details for Success screen
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('modora_cart');
      setCartItems(raw ? JSON.parse(raw) : []);
    } catch {
      setCartItems([]);
    }
  }, []);

  // Filtered geo options
  const districtOptions = getDistrictsByDivisionId(selectedDivisionId);
  const upazilaOptions = getUpazilasByDistrictId(selectedDistrictId);
  const unionOptions = getUnionsByUpazilaId(selectedUpazilaId);

  // When division changes, reset district, upazila, union
  const handleDivisionChange = (divId: string) => {
    setSelectedDivisionId(divId);
    setSelectedDistrictId('');
    setSelectedUpazilaId('');
    setSelectedUnionId('');
  };

  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    setSelectedUpazilaId('');
    setSelectedUnionId('');
  };

  const handleUpazilaChange = (upId: string) => {
    setSelectedUpazilaId(upId);
    setSelectedUnionId('');
  };

  // Pricing & Delivery calculation
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Find division name to determine shipping: Dhaka = 60, Outside = 120
  const selectedDivision = divisions.find((d) => String(d.id) === String(selectedDivisionId));
  const isDhakaDivision = selectedDivision?.name?.toLowerCase().includes('dhaka');
  const shippingFee = subtotal === 0 ? 0 : isDhakaDivision ? 60 : 120;
  const shippingLabel = isDhakaDivision ? 'Shipping (Dhaka)' : 'Shipping (Outside Dhaka)';

  const discountAmount = appliedCoupon ? Math.round(subtotal * 0.1) : 0; // 10% coupon discount
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;

    if (couponCode.toUpperCase() === 'MODORA10' || couponCode.toUpperCase() === 'SAVE10') {
      setAppliedCoupon(couponCode.toUpperCase());
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try "MODORA10"');
    }
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      alert('Please enter your phone number.');
      return;
    }
    if (!detailedAddress.trim()) {
      alert('Please enter your detailed shipping address (House, Road, Area).');
      return;
    }
    if (!selectedDivisionId) {
      alert('Please select your Division.');
      return;
    }
    if (!selectedDistrictId) {
      alert('Please select your District.');
      return;
    }
    if (!agreeTerms) {
      alert('Please accept the Terms & Conditions to proceed.');
      return;
    }

    // Generate random order number e.g. #ORD-739210
    const orderNo = `MOD-${Math.floor(100000 + Math.random() * 900000)}`;
    setPlacedOrderNumber(orderNo);

    // Clear cart in local storage
    try {
      localStorage.setItem('modora_cart', JSON.stringify([]));
      window.dispatchEvent(new Event('cart_updated'));
    } catch {
      // Local storage
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
            <div className="h-10 bg-neutral-200 rounded w-1/3" />
            <div className="h-64 bg-neutral-100 rounded-xl" />
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  // Success Screen
  if (step === 'success') {
    const chosenDistrict = districtOptions.find((d) => String(d.id) === String(selectedDistrictId));
    const chosenUpazila = upazilaOptions.find((u) => String(u.id) === String(selectedUpazilaId));

    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <AnnouncementBar />
        <Navbar />

        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 sm:py-16">
          <div className="bg-white rounded-2xl border border-[#e8e6e3] p-6 sm:p-10 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
            </div>

            <span className="text-[11px] font-bold tracking-widest uppercase text-[#ff4600] block mb-1">
              Order Placed Successfully
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
              ধন্যবাদ, আপনার অর্ডারটি সম্পন্ন হয়েছে!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-md mx-auto mb-6">
              আমাদের কাস্টমার কেয়ার প্রতিনিধি শীঘ্রই আপনার ফোনে যোগাযোগ করে অর্ডার কনফার্ম করবেন।
            </p>

            {/* Order Details Badge */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 sm:p-6 text-left max-w-xl mx-auto mb-8 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-neutral-200 pb-2.5">
                <span className="text-neutral-500">Order ID</span>
                <span className="font-bold text-neutral-900">{placedOrderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2.5">
                <span className="text-neutral-500">Customer Name</span>
                <span className="font-semibold text-neutral-900">{fullName}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2.5">
                <span className="text-neutral-500">Phone Number</span>
                <span className="font-semibold text-neutral-900">{phone}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2.5">
                <span className="text-neutral-500">Shipping Address</span>
                <span className="font-semibold text-neutral-900 text-right max-w-xs">
                  {detailedAddress}, {chosenUpazila?.name || ''}, {chosenDistrict?.name || ''},{' '}
                  {selectedDivision?.name || ''}
                </span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2.5">
                <span className="text-neutral-500">Payment Method</span>
                <span className="font-semibold text-[#ff4600] uppercase">
                  {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-base text-neutral-900">
                <span>Total Payable</span>
                <span className="text-[#ff4600]">৳{finalTotal}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center space-x-2 bg-[#ff4600] hover:bg-[#e03e00] text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-lg shadow-md transition-all"
              >
                <span>Continue Shopping</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center space-x-2 border border-neutral-300 text-neutral-700 hover:text-neutral-900 text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg transition-all"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>

        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  // Empty Cart State
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <AnnouncementBar />
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-md text-center">
            <h1 className="font-editorial text-3xl font-bold text-neutral-900 mb-2">
              Your Bag is Empty
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-light mb-6">
              Please select your desired garments and click &quot;Buy Now&quot; or &quot;Add to Cart&quot; before checking out.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 bg-[#ff4600] hover:bg-[#e03e00] text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Explore Products</span>
            </Link>
          </div>
        </main>

        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Contact Info & Shipping Address Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Contact Information Card */}
            <div className="bg-white rounded-xl border border-[#e8e6e3] p-6 sm:p-7 shadow-xs">
              <div className="flex items-center space-x-2.5 pb-4 mb-5 border-b border-[#e8e6e3]">
                <User className="w-5 h-5 text-neutral-700" />
                <h2 className="font-editorial text-xl font-bold text-neutral-900">
                  Contact Information
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] placeholder:text-neutral-400 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] placeholder:text-neutral-400 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] placeholder:text-neutral-400 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Shipping Address Card */}
            <div className="bg-white rounded-xl border border-[#e8e6e3] p-6 sm:p-7 shadow-xs">
              <div className="flex items-center space-x-2.5 pb-4 mb-5 border-b border-[#e8e6e3]">
                <MapPin className="w-5 h-5 text-neutral-700" />
                <h2 className="font-editorial text-xl font-bold text-neutral-900">
                  Shipping Address
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                    Detailed Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)}
                    placeholder="House, Road, Area"
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] placeholder:text-neutral-400 bg-white"
                  />
                </div>

                {/* Cascading Geo Selects (Division > District > Upazila > Union) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Division */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Division <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={selectedDivisionId}
                      onChange={(e) => handleDivisionChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] bg-white text-neutral-800"
                    >
                      <option value="">Select Division</option>
                      {divisions.map((div) => (
                        <option key={div.id} value={div.id}>
                          {formatGeoLabel(div)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      City / District <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      disabled={!selectedDivisionId}
                      value={selectedDistrictId}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] bg-white text-neutral-800 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {selectedDivisionId ? 'Select District' : 'Select Division first'}
                      </option>
                      {districtOptions.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {formatGeoLabel(dist)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Upazila */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Upazila
                    </label>
                    <select
                      disabled={!selectedDistrictId}
                      value={selectedUpazilaId}
                      onChange={(e) => handleUpazilaChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] bg-white text-neutral-800 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {selectedDistrictId ? 'Select Upazila' : 'Select District first'}
                      </option>
                      {upazilaOptions.map((up) => (
                        <option key={up.id} value={up.id}>
                          {formatGeoLabel(up)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Union */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Union (Optional)
                    </label>
                    <select
                      disabled={!selectedUpazilaId}
                      value={selectedUnionId}
                      onChange={(e) => setSelectedUnionId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] bg-white text-neutral-800 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {selectedUpazilaId ? 'Select Union' : 'Select Upazila first'}
                      </option>
                      {unionOptions.map((un) => (
                        <option key={un.id} value={un.id}>
                          {formatGeoLabel(un)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Alt Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Alt. Phone
                    </label>
                    <input
                      type="tel"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                      placeholder="01XXXXXXXXX (optional)"
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] placeholder:text-neutral-400 bg-white"
                    />
                  </div>

                  {/* Note for delivery */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Note for Delivery
                    </label>
                    <input
                      type="text"
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="Special instructions (optional)"
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] placeholder:text-neutral-400 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Payment Method */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Order Summary Card */}
            <div className="bg-white rounded-xl border border-[#e8e6e3] p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#e8e6e3]">
                <h3 className="font-editorial text-lg font-bold text-neutral-900">
                  Order Summary
                </h3>
                <Link
                  href="/cart"
                  className="text-xs font-semibold text-[#ff4600] hover:underline"
                >
                  Modify
                </Link>
              </div>

              {/* Items List */}
              <div className="space-y-3.5 max-h-64 overflow-y-auto no-scrollbar pb-3">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${item.variantTitle}`} className="flex items-start gap-3">
                    <div className="relative w-14 h-16 rounded-lg overflow-hidden border border-[#e8e6e3] bg-neutral-100 shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-900 line-clamp-2 leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {item.variantTitle ? `Size: ${item.variantTitle}` : ''} • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-xs text-neutral-900">
                        ৳{(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="border-t border-[#e8e6e3] pt-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">৳{subtotal.toFixed(0)}</span>
                </div>

                <div className="flex justify-between text-neutral-600">
                  <span>{shippingLabel}</span>
                  <span className="font-semibold text-neutral-900">৳{shippingFee}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Coupon ({appliedCoupon})</span>
                    <span>-৳{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-2.5 border-t border-[#e8e6e3] font-bold text-sm text-neutral-900">
                  <span>Total</span>
                  <span className="font-editorial text-xl text-[#ff4600]">৳{finalTotal}</span>
                </div>
              </div>

              {/* Delivery Window Badge */}
              <div className="mt-4 p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-xs text-green-800">
                <Truck className="w-4 h-4 text-green-600 shrink-0" />
                <span className="font-medium">Delivery within 2-3 Days after confirmation</span>
              </div>

              {/* Coupon Code Input */}
              <div className="mt-4 pt-3.5 border-t border-neutral-100">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-red-500 mt-1">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="text-[11px] text-green-600 mt-1">
                    Coupon &ldquo;{appliedCoupon}&rdquo; applied successfully!
                  </p>
                )}
              </div>
            </div>

            {/* 2. Payment Method Card */}
            <div className="bg-white rounded-xl border border-[#e8e6e3] p-5 sm:p-6 shadow-xs">
              <h3 className="font-editorial text-lg font-bold text-neutral-900 mb-3.5">
                Payment Method
              </h3>

              <div className="space-y-3 mb-5">
                {/* Option 1: Cash on Delivery (Selected by default) */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-center justify-between p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#ff4600] bg-[#fffaf6]'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#ff4600] w-4 h-4"
                    />
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-neutral-900">Cash on Delivery</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-neutral-100 text-neutral-600">
                          POPULAR
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500">Pay when you receive your order</span>
                    </div>
                  </div>
                </label>

                {/* Option 2: Card Payment (SSLCommerz) */}
                <label
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-between p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#ff4600] bg-[#fffaf6]'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#ff4600] w-4 h-4"
                    />
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-neutral-900">Card Payment</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-green-100 text-green-700">
                          SECURE
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500">Visa, Mastercard, Amex</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    SSLCOMMERZ
                  </span>
                </label>

                {/* Option 3: bKash */}
                <label
                  onClick={() => setPaymentMethod('bkash')}
                  className={`flex items-center justify-between p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'bkash'
                      ? 'border-[#ff4600] bg-[#fffaf6]'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bkash"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="accent-[#ff4600] w-4 h-4"
                    />
                    <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-xs">
                      ৳
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">bKash</span>
                      <span className="text-[11px] text-neutral-500">Pay with bKash mobile wallet</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                    bKash
                  </span>
                </label>
              </div>

              {/* Informational banner when card or bkash chosen */}
              {paymentMethod !== 'cod' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 mb-4 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Online Gateway sandbox mode. Selecting this will record your payment choice on confirmation.
                  </span>
                </div>
              )}

              {/* Terms and conditions agreement */}
              <div className="mb-5 flex items-start space-x-2.5 text-xs text-neutral-600">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 accent-[#ff4600] w-4 h-4 rounded"
                />
                <label htmlFor="agreeTerms" className="cursor-pointer">
                  I agree to the{' '}
                  <span className="underline text-neutral-800">Terms &amp; Conditions</span>,{' '}
                  <span className="underline text-neutral-800">Refund Policy</span> and{' '}
                  <span className="underline text-neutral-800">Privacy Policy</span>.
                </label>
              </div>

              {/* Confirm Order CTA Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 bg-neutral-900 hover:bg-black text-white text-sm font-bold uppercase tracking-wider py-4 rounded-xl shadow-md transition-all focus:outline-none"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm Order ৳{finalTotal}</span>
              </button>

              {/* Reassurance Footer */}
              <div className="mt-5 pt-4 border-t border-[#e8e6e3] grid grid-cols-3 gap-1 text-center text-[10px] text-neutral-500">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-700 mb-0.5" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex flex-col items-center border-x border-[#e8e6e3]">
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-700 mb-0.5" />
                  <span>Easy Returns</span>
                </div>
                <div className="flex flex-col items-center">
                  <Truck className="w-3.5 h-3.5 text-neutral-700 mb-0.5" />
                  <span>Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
