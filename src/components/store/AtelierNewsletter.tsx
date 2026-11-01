'use client';

import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export const AtelierNewsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section className="bg-neutral-950 text-white py-14 sm:py-20 border-t border-neutral-900">
      <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
        {/* Members Access Tag */}
        <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#ff4600] block mb-2">
          MEMBERS ACCESS
        </span>

        {/* Title */}
        <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-white font-normal tracking-tight mb-3">
          Join the <span className="italic font-light">MODORA Atelier</span>
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed mb-8 max-w-md mx-auto">
          Receive private invitations to limited capsules, editorial releases, seasonal lookbooks and private salon viewings.
        </p>

        {/* Form */}
        {submitted ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg py-4 px-6 inline-flex items-center space-x-2 text-xs text-neutral-200">
            <Check className="w-4 h-4 text-[#ff4600]" />
            <span>Welcome to the Atelier. An invitation will arrive shortly.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="atelier@example.com"
              required
              className="flex-1 bg-white text-neutral-900 px-4 py-3 rounded text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ff4600]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center space-x-2 bg-[#ff4600] hover:bg-[#e03e00] text-white font-bold text-xs tracking-wider uppercase px-6 py-3 rounded transition-colors whitespace-nowrap shadow-md"
            >
              <span>SUBSCRIBE TO ATELIER</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Footnote */}
        <p className="text-[11px] text-neutral-500 font-light">
          We respect your privacy. Unsubscribe at any moment.
        </p>
      </div>
    </section>
  );
};
