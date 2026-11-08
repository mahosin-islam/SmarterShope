'use client';

import React, { useState } from 'react';
import { User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/authContext';

export default function AccountProfilePage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e8e6e3] p-6 sm:p-8">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#e8e6e3]">
        <div className="w-9 h-9 rounded-full bg-[#fff3ec] text-[#ff4600] flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-editorial text-2xl font-bold text-neutral-900">
            Client Profile
          </h1>
          <p className="text-xs text-neutral-500 font-light">
            Manage your personal credentials, contact email, and preferences.
          </p>
        </div>
      </div>

      {saved && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Your profile preferences have been updated.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600]"
              placeholder="First name"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600]"
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            disabled
            value={formData.email}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#e8e6e3] rounded-lg bg-neutral-100 text-neutral-500 cursor-not-allowed"
          />
          <span className="text-[10px] text-neutral-400 mt-1 block">Account identity linked to your login provider.</span>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 / +39 / +880 ..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600]"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center space-x-2 bg-[#ff4600] hover:bg-[#e03e00] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg transition-all"
          >
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
