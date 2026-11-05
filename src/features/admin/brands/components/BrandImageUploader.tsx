'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Cloud, Loader2, RefreshCw, Trash2, Upload } from 'lucide-react';
import {
  uploadImageToCloudinary,
  isCloudinaryConfigured,
} from '@/features/admin/products/services/cloudinary.service';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/features/admin/products/utils/product';

interface BrandImageUploaderProps {
  currentUrl: string | null;
  onChange: (url: string | null) => void;
}

export function BrandImageUploader({ currentUrl, onChange }: BrandImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const configured = isCloudinaryConfigured();

  const addFiles = (files: FileList | File[]) => {
    setError(null);
    const file = Array.from(files)[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type) && !(file.type === '' && extension)) {
      setError('Use a WebP, PNG, JPG, or JPEG file.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('File must be 15 MB or smaller.');
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setProgress(0);

    const controller = new AbortController();

    uploadImageToCloudinary(file, (percent) => setProgress(percent), controller.signal)
      .then((result) => {
        setUploading(false);
        setPreview(null);
        onChange(result.secure_url);
      })
      .catch((err: unknown) => {
        setUploading(false);
        setProgress(0);
        setPreview(null);
        setError(err instanceof Error ? err.message : 'Logo upload failed.');
      });
  };

  const removeImage = () => {
    setPreview(null);
    setError(null);
    onChange(null);
  };

  return (
    <section className="rounded-xl border border-[#e8e6e3] bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Brand Logo
          </h3>
          <p className="text-[10px] text-neutral-500 mt-0.5">
            Optional brand logo image.
          </p>
        </div>
      </div>

      <div className="grid items-center gap-3">
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition hover:border-[#ff4600]/50">
          <button
            type="button"
            disabled={!configured || uploading}
            onClick={() => inputRef.current?.click()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#ff4600] shadow-sm ring-1 ring-[#ff4600]/10 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Upload className="h-4 w-4" />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/webp,image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <p className="mt-2 text-xs text-neutral-500">
            {configured ? 'Click to upload' : 'Cloudinary not configured'}
          </p>
        </div>

        <div className="flex-1">
          {uploading && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] text-amber-800">
              <div className="flex items-center gap-2 mb-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Uploading logo...</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200">
                <div className="h-full rounded-full bg-[#ff4600]" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-[9px] text-neutral-500">{progress}%</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] text-red-700">
              {error}
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-2 font-semibold underline hover:text-red-900"
              >
                Dismiss
              </button>
            </div>
          )}

          {preview && (
            <div className="relative inline-block">
              <img src={preview} alt="Preview" className="h-16 w-16 rounded-md object-cover border border-[#e8e6e3]" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-1 -right-1 rounded-full bg-red-600 p-1 text-white hover:bg-red-700 transition"
                aria-label="Remove logo"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}

          {currentUrl && !preview && !uploading && (
            <div className="relative inline-block">
              <Image
                src={currentUrl}
                alt="Current logo"
                fill
                className="h-16 w-16 rounded-md object-cover border border-[#e8e6e3]"
                sizes="64px"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-1 -right-1 rounded-full bg-red-600 p-1 text-white hover:bg-red-700 transition"
                aria-label="Remove logo"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}

          {!currentUrl && !preview && !uploading && !error && (
            <p className="text-[10px] text-neutral-400 text-center">No logo set</p>
          )}
        </div>
      </div>
    </section>
  );
}
