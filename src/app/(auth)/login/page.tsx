'use client';

import React from 'react';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/AuthModal';

export default function LoginPage() {
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
          <h1 className="mt-4 text-xl font-bold text-gray-900">Sign in to your account</h1>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
