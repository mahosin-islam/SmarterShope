'use client';

import React, { useState, useEffect } from 'react';
import { User, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/authContext';

export default function AccountProfilePage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
  });

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
        const res = await fetch(`${API_URL}/users/me`, {
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data) {
            setFormData({
              firstName: json.data.firstName || user?.firstName || '',
              lastName: json.data.lastName || user?.lastName || '',
              email: json.data.email || user?.email || '',
              phone: json.data.phone || '',
            });
          }
        }
      } catch {
        // Fallback to auth context
        if (isMounted && user) {
          setFormData((prev) => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
          }));
        }
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSaved(false);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: formData.firstName.trim() || undefined,
          lastName: formData.lastName.trim() || undefined,
          phone: formData.phone.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      } else {
        const errJson = await res.json().catch(() => null);
        setError(errJson?.error?.message || 'Failed to update profile details.');
      }
    } catch {
      setError('Network communication failed. Please verify your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e8e6e3] p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#e8e6e3]">
        <div className="w-9 h-9 rounded-full bg-[#fff3ec] text-[#ff4600] flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-editorial text-2xl font-bold text-neutral-900">
            Client Profile
          </h1>
          <p className="text-xs text-neutral-500 font-light">
            Manage your personal credentials, contact details, and account preferences.
          </p>
        </div>
      </div>

      {saved && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Your profile information has been saved successfully.</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoadingProfile ? (
        <div className="space-y-4 max-w-xl animate-pulse">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-neutral-100 rounded-lg" />
            <div className="h-10 bg-neutral-100 rounded-lg" />
          </div>
          <div className="h-10 bg-neutral-100 rounded-lg" />
          <div className="h-10 bg-neutral-100 rounded-lg" />
        </div>
      ) : (
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
                required
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
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5 flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-neutral-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              disabled
              value={formData.email}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#e8e6e3] rounded-lg bg-neutral-100 text-neutral-500 cursor-not-allowed"
            />
            <span className="text-[10px] text-neutral-400 mt-1 block">
              Identity tied to your secure authentication credentials.
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5 flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="01XXXXXXXXX"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600] focus:border-[#ff4600]"
            />
          </div>

          {/* Account Security Notice */}
          <div className="pt-2">
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center space-x-3 text-xs text-neutral-600">
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
              <span>
                Your session is encrypted with HTTP-only cookies and protected against unauthorized CSRF requests.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 bg-[#ff4600] hover:bg-[#e03e00] disabled:bg-neutral-400 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg transition-all focus:outline-none shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
