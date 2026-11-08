'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export const ContactForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'bespoke',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-8 border border-[#e8e6e3] rounded-2xl bg-neutral-50 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#fff3ec] text-[#ff4600] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h3 className="font-editorial text-2xl font-bold text-neutral-900">
          Inquiry Received
        </h3>
        <p className="text-xs sm:text-sm text-neutral-600 font-light max-w-md mx-auto leading-relaxed">
          Thank you, <strong className="font-semibold text-neutral-800">{formData.name}</strong>. An atelier concierge has received your request and will reach out to <span className="underline">{formData.email}</span> within 4 business hours.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', topic: 'bespoke', message: '' });
          }}
          className="text-xs font-bold uppercase tracking-wider text-[#ff4600] hover:underline pt-2 inline-block"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[#e8e6e3] rounded-2xl p-6 sm:p-8 bg-white space-y-4 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Lord / Lady / Mr. / Ms."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] bg-neutral-50/50"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="client@domain.com"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] bg-neutral-50/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
          Inquiry Department
        </label>
        <select
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] bg-neutral-50/50 text-neutral-800"
        >
          <option value="bespoke">Bespoke Tailoring &amp; Private Fitting</option>
          <option value="order">Order Tracking &amp; Courier Concierge</option>
          <option value="garment">Sizing &amp; Material Consultation</option>
          <option value="press">Press &amp; Atelier Collaborations</option>
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
          Message *
        </label>
        <textarea
          rows={5}
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Please describe your garment requirements, sizing preferences, or inquiry..."
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600] bg-neutral-50/50 resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#ff4600] hover:bg-[#e03e00] text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-lg shadow-md hover:shadow-orange-600/30 transition-all focus:outline-none"
      >
        <span>Transmit Message</span>
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};
