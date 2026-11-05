'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, FileEdit, Loader2, Save, XCircle } from 'lucide-react';

interface FormFooterProps {
  isSubmitting: boolean;
  isValidating: boolean;
  isDirty: boolean;
  uploadingImages: boolean;
  failedUploads: number;
  onPublish: () => void;
  onSaveDraft: () => void;
  onPreview: () => void;
}

export function FormFooter({
  isSubmitting,
  isValidating,
  isDirty,
  uploadingImages,
  failedUploads,
  onPublish,
  onSaveDraft,
  onPreview,
}: FormFooterProps) {
  const busy = isSubmitting || isValidating || uploadingImages;

  return (
    <div className="sticky bottom-0 z-20 -mx-6 mt-8 border-t border-[#e8e6e3] bg-white/95 px-6 py-3 shadow-[0_-10px_40px_rgba(18,18,18,0.02)] backdrop-blur md:-mx-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to products
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {failedUploads > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
              <XCircle className="h-3.5 w-3.5" />
              {failedUploads} upload{failedUploads > 1 ? 's' : ''} failed
            </span>
          )}
          {uploadingImages && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Uploading images
            </span>
          )}
          {!isDirty && !isSubmitting && !uploadingImages && failedUploads === 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold text-neutral-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              No unsaved changes
            </span>
          )}
          {isDirty && !busy && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff4600]/15 bg-[#fff3ec] px-2.5 py-1 text-[11px] font-semibold text-[#c2410c]">
              <AlertCircle className="h-3.5 w-3.5" />
              Unsaved changes
            </span>
          )}

          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-2 rounded-lg border border-[#e8e6e3] bg-white px-3.5 py-2.5 text-xs font-semibold text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>

          <button
            type="button"
            onClick={onSaveDraft}
            disabled={busy || failedUploads > 0}
            className="inline-flex items-center gap-2 rounded-lg border border-[#e8e6e3] bg-white px-3.5 py-2.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FileEdit className="h-3.5 w-3.5" />
            Save draft
          </button>

          <button
            type="button"
            onClick={onPublish}
            disabled={busy || failedUploads > 0}
            className="inline-flex items-center gap-2 rounded-lg bg-[#ff4600] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#e03e00] focus:outline-none focus:ring-2 focus:ring-[#ff4600]/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {busy ? 'Saving...' : 'Publish product'}
          </button>
        </div>
      </div>
    </div>
  );
}
