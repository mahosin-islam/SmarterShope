import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

interface AdminPlaceholderProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  actionLabel?: string;
  actionHref?: string;
}

export function AdminPlaceholder({
  title,
  subtitle,
  icon: Icon,
  actionLabel,
  actionHref,
}: AdminPlaceholderProps) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff4600]">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          {actionLabel && (
            <Link
              href={actionHref || '#'}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ff4600] hover:bg-[#e03e00] text-white rounded-lg text-xs font-bold transition shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              {actionLabel}
            </Link>
          )}
        </div>
      </div>

      {/* Structured Clean Placeholder Card */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-4">
          <Icon className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-gray-900">
          {title} Module Active
        </h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto mt-1.5 leading-relaxed">
          The page structure and route are ready. Provide your specific design reference for this module and it will be implemented matching your reference.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-1.5 bg-orange-50/70 border border-orange-200/60 rounded-full text-[11px] font-semibold text-[#ff4600]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff4600] animate-pulse" />
          Awaiting Design Reference for Detailed UI
        </div>
      </div>
    </div>
  );
}
