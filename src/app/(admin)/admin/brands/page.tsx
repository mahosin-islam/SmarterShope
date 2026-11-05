'use client';

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { brandService } from '@/features/admin/brands/services/brands.service';
import type { AdminBrand } from '@/features/admin/brands/types/brand.types';
import { BrandForm } from '@/features/admin/brands/components/BrandForm';
import { BrandList } from '@/features/admin/brands/components/BrandList';

export default function BrandsAdminPage() {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formBrandId, setFormBrandId] = useState<string | undefined>(undefined);

  const refreshBrands = () => {
    brandService
      .listBrands()
      .then((data) => {
        setBrands(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const apiError = err as { message?: string };
        setError(apiError?.message || 'Failed to load brands. Please try again.');
        setLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    brandService
      .listBrands()
      .then((data) => {
        if (isMounted) {
          setBrands(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const apiError = err as { message?: string };
          setError(apiError?.message || 'Failed to load brands. Please try again.');
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = () => {
    setFormMode('create');
    setFormBrandId(undefined);
    setFormOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (brand: AdminBrand) => {
    setFormMode('edit');
    setFormBrandId(brand.id);
    setFormOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (brand: AdminBrand) => {
    if (!window.confirm(`Delete brand "${brand.name}"?`)) return;
    try {
      await brandService.deleteBrand(brand.id);
      setSuccess('Brand deleted successfully.');
      setError(null);
      refreshBrands();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message || 'Failed to delete brand.');
      setSuccess(null);
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setFormBrandId(undefined);
    setSuccess('Brand saved successfully.');
    setError(null);
    refreshBrands();
  };

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e8e6e3] border-t-[#ff4600]" />
        <p className="mt-2 text-xs text-neutral-500">Loading brands...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-editorial text-xl font-semibold text-neutral-900 tracking-tight">
            Brands
          </h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Manage your store brands and their information.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[#ff4600] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#e03e00] shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Brand</span>
        </button>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] text-emerald-700 flex items-center gap-2">
          <span className="text-emerald-700">✓</span>
          <p>{success}</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-700 flex items-center gap-2">
          <span className="text-red-700">⚠</span>
          <p>{error}</p>
        </div>
      )}

      {formOpen && (
        <BrandForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSuccess={handleFormSuccess}
          mode={formMode}
          brandId={formBrandId}
        />
      )}

      <BrandList
        brands={brands}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
