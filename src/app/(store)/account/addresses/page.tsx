'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2, Home, Building2, X, Phone, User } from 'lucide-react';
import { useBangladeshGeo } from '@/features/store/checkout/useBangladeshGeo';

export interface SavedAddress {
  id: string;
  recipientName: string;
  phone: string;
  type: 'HOME' | 'OFFICE' | 'OTHER';
  divisionId: string;
  districtId: string;
  upazilaId: string;
  divisionName: string;
  districtName: string;
  upazilaName: string;
  detailedAddress: string;
  isDefault: boolean;
  createdAt: string;
}

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'HOME' | 'OFFICE' | 'OTHER'>('HOME');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Bangladesh Geo selection
  const {
    divisions,
    getDistrictsByDivisionId,
    getUpazilasByDistrictId,
    formatGeoLabel,
    isLoading: isGeoLoading,
  } = useBangladeshGeo();

  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedUpazilaId, setSelectedUpazilaId] = useState('');

  const districtOptions = getDistrictsByDivisionId(selectedDivisionId);
  const upazilaOptions = getUpazilasByDistrictId(selectedDistrictId);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('modora_saved_addresses');
      if (raw) {
        const parsed = JSON.parse(raw);
        setAddresses(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      //
    }
  }, []);

  const saveAddressesToStorage = (updated: SavedAddress[]) => {
    setAddresses(updated);
    try {
      localStorage.setItem('modora_saved_addresses', JSON.stringify(updated));
    } catch {
      //
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !phone.trim() || !detailedAddress.trim()) {
      alert('Please fill in recipient name, phone number, and address.');
      return;
    }

    const chosenDiv = divisions.find((d) => String(d.id) === String(selectedDivisionId));
    const chosenDist = districtOptions.find((d) => String(d.id) === String(selectedDistrictId));
    const chosenUpz = upazilaOptions.find((u) => String(u.id) === String(selectedUpazilaId));

    const newAddress: SavedAddress = {
      id: `addr_${Date.now()}`,
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      type,
      divisionId: selectedDivisionId,
      districtId: selectedDistrictId,
      upazilaId: selectedUpazilaId,
      divisionName: chosenDiv ? formatGeoLabel(chosenDiv) : '',
      districtName: chosenDist ? formatGeoLabel(chosenDist) : '',
      upazilaName: chosenUpz ? formatGeoLabel(chosenUpz) : '',
      detailedAddress: detailedAddress.trim(),
      isDefault: addresses.length === 0 ? true : isDefault,
      createdAt: new Date().toISOString(),
    };

    let updated = [...addresses];
    if (newAddress.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.unshift(newAddress);

    saveAddressesToStorage(updated);
    setIsModalOpen(false);

    // Reset Form
    setRecipientName('');
    setPhone('');
    setType('HOME');
    setDetailedAddress('');
    setSelectedDivisionId('');
    setSelectedDistrictId('');
    setSelectedUpazilaId('');
    setIsDefault(false);
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    saveAddressesToStorage(updated);
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveAddressesToStorage(updated);
  };

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8e6e3] p-6 sm:p-8 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-36 bg-neutral-100 rounded-xl" />
          <div className="h-36 bg-neutral-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e8e6e3] p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#e8e6e3]">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#fff3ec] text-[#ff4600] flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-editorial text-2xl font-bold text-neutral-900">
              Saved Addresses
            </h1>
            <p className="text-xs text-neutral-500 font-light">
              Manage your delivery destinations for accelerated and frictionless checkout.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#ff4600] rounded-lg hover:bg-[#e03e00] shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address Cards List */}
      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-xl border transition-all relative flex flex-col justify-between ${
                addr.isDefault
                  ? 'border-[#ff4600] bg-[#fffaf8] shadow-xs'
                  : 'border-[#e8e6e3] bg-white hover:border-neutral-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-neutral-900">
                      {addr.recipientName}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 flex items-center space-x-1">
                      {addr.type === 'OFFICE' ? (
                        <>
                          <Building2 className="w-3 h-3" />
                          <span>Office</span>
                        </>
                      ) : (
                        <>
                          <Home className="w-3 h-3" />
                          <span>Home</span>
                        </>
                      )}
                    </span>
                  </div>

                  {addr.isDefault && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#ff4600] text-white px-2 py-0.5 rounded-full shadow-2xs">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-500 flex items-center space-x-1 mb-2">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{addr.phone}</span>
                </p>

                <p className="text-xs text-neutral-700 leading-relaxed font-light mb-1">
                  {addr.detailedAddress}
                </p>

                {(addr.upazilaName || addr.districtName || addr.divisionName) && (
                  <p className="text-[11px] text-neutral-400">
                    {[addr.upazilaName, addr.districtName, addr.divisionName]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between">
                {!addr.isDefault ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs text-[#ff4600] hover:underline font-semibold"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-xs text-green-600 font-medium flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Default Destination</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 rounded transition-colors"
                  aria-label="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-7 h-7 text-neutral-400 stroke-[1.5]" />
          </div>
          <h2 className="font-editorial text-xl font-bold text-neutral-900 mb-2">
            No Saved Addresses
          </h2>
          <p className="text-xs text-neutral-500 font-light max-w-sm mx-auto mb-6">
            You haven&apos;t saved any shipping destinations yet. Add an address now to make future checkouts rapid and effortless.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-[#ff4600] hover:bg-[#e03e00] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination Address</span>
          </button>
        </div>
      )}

      {/* Add Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#e8e6e3] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#e8e6e3] flex items-center justify-between">
              <h3 className="font-editorial text-xl font-bold text-neutral-900">
                Add Delivery Address
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddAddress} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Full recipient name"
                    className="w-full px-3 py-2 text-xs border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 text-xs border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600]"
                  />
                </div>
              </div>

              {/* Address Type Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Address Type
                </label>
                <div className="flex gap-2">
                  {[
                    { label: 'Home', value: 'HOME', icon: Home },
                    { label: 'Office', value: 'OFFICE', icon: Building2 },
                  ].map(({ label, value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value as any)}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                        type === value
                          ? 'border-[#ff4600] bg-[#fff3ec] text-[#ff4600]'
                          : 'border-[#e8e6e3] text-neutral-600 hover:border-neutral-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Geo Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Division
                  </label>
                  <select
                    value={selectedDivisionId}
                    onChange={(e) => {
                      setSelectedDivisionId(e.target.value);
                      setSelectedDistrictId('');
                      setSelectedUpazilaId('');
                    }}
                    className="w-full px-2.5 py-2 text-xs border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600]"
                  >
                    <option value="">Select Division</option>
                    {divisions.map((div) => (
                      <option key={div.id} value={div.id}>
                        {formatGeoLabel(div)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    District
                  </label>
                  <select
                    disabled={!selectedDivisionId}
                    value={selectedDistrictId}
                    onChange={(e) => {
                      setSelectedDistrictId(e.target.value);
                      setSelectedUpazilaId('');
                    }}
                    className="w-full px-2.5 py-2 text-xs border border-[#e8e6e3] rounded-lg disabled:bg-neutral-100 disabled:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#ff4600]"
                  >
                    <option value="">Select District</option>
                    {districtOptions.map((dist) => (
                      <option key={dist.id} value={dist.id}>
                        {formatGeoLabel(dist)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Upazila
                  </label>
                  <select
                    disabled={!selectedDistrictId}
                    value={selectedUpazilaId}
                    onChange={(e) => setSelectedUpazilaId(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-[#e8e6e3] rounded-lg disabled:bg-neutral-100 disabled:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#ff4600]"
                  >
                    <option value="">Select Upazila</option>
                    {upazilaOptions.map((upz) => (
                      <option key={upz.id} value={upz.id}>
                        {formatGeoLabel(upz)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Detailed Street Address */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Street Address / House / Road *
                </label>
                <textarea
                  rows={2}
                  required
                  value={detailedAddress}
                  onChange={(e) => setDetailedAddress(e.target.value)}
                  placeholder="e.g. House #14, Road #04, Sector #11, Uttara"
                  className="w-full px-3 py-2 text-xs border border-[#e8e6e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff4600]"
                />
              </div>

              {/* Default checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultAddress"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-[#ff4600] rounded focus:ring-[#ff4600]"
                />
                <label htmlFor="defaultAddress" className="text-xs text-neutral-700">
                  Set as my primary delivery address
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black rounded-lg border border-[#e8e6e3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#ff4600] hover:bg-[#e03e00] text-white rounded-lg shadow-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
