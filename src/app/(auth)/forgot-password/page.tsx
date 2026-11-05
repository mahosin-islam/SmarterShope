'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    // Visual feedback / mock recovery initiation
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50/50">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block font-editorial text-3xl font-bold text-[#ff4600] tracking-tight mb-1">
            MODORA
          </Link>
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Minimalist European Luxury
          </p>
          <h1 className="mt-4 text-xl font-bold text-gray-900">Reset your password</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter your email and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-semibold text-gray-900">Check your inbox</h2>
            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
              If an account exists for <span className="font-semibold text-gray-900">{email}</span>, you will receive password reset instructions shortly.
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#ff4600] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4600] focus:border-transparent placeholder:text-gray-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#ff4600] hover:bg-[#e03e00] disabled:opacity-60 text-white font-bold text-sm uppercase tracking-widest rounded-xl transition"
            >
              {isLoading ? 'Sending instructions…' : 'SEND RESET LINK'}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
