import React from 'react';
import { MapPin, Plus } from 'lucide-react';

export default function AccountAddressesPage() {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e6e3] p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e8e6e3]">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#fff3ec] text-[#ff4600] flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-editorial text-2xl font-bold text-neutral-900">
              Saved Addresses
            </h1>
            <p className="text-xs text-neutral-500 font-light">
              Manage your delivery destinations for accelerated checkout.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#ff4600] rounded-lg hover:bg-[#e03e00] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Address</span>
        </button>
      </div>

      {/* Empty State */}
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-7 h-7 text-neutral-400 stroke-[1.5]" />
        </div>
        <h2 className="font-editorial text-xl font-bold text-neutral-900 mb-2">
          No Saved Addresses
        </h2>
        <p className="text-xs text-neutral-500 font-light max-w-sm mx-auto mb-6">
          You haven&apos;t saved any shipping addresses yet. Add an address to make your next checkout effortless.
        </p>
      </div>
    </div>
  );
}
