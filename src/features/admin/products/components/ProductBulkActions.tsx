'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProductBulkActionsProps {
  selectedCount: number;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  onClear: () => void;
  activating: boolean;
  deactivating: boolean;
  deleting: boolean;
}

export function ProductBulkActions({
  selectedCount,
  onActivate,
  onDeactivate,
  onDelete,
  onClear,
  activating,
  deactivating,
  deleting,
}: ProductBulkActionsProps) {
  return (
    <section className="rounded-xl border border-[#e8e6e3] bg-white shadow-lg px-4 py-3 flex items-center justify-between gap-3 z-20">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-neutral-900">
          {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-[#ff4600] hover:text-[#c2410c] underline"
        >
          Clear selection
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onActivate}
          disabled={activating}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
            activating
              ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
              : 'border border-[#e8e6e3] bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          {activating ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
          ) : null}
          Activate
        </button>
        <button
          type="button"
          onClick={onDeactivate}
          disabled={deactivating}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
            deactivating
              ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
              : 'border border-[#e8e6e3] bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          {deactivating ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
          ) : null}
          Deactivate
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
            deleting
              ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
              : 'border border-red-200 bg-white text-red-600 hover:bg-red-50'
          }`}
        >
          {deleting ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
          ) : null}
          Delete
        </button>
      </div>
    </section>
  );
}
