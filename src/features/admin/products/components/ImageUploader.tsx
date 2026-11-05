'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  ImagePlus,
  Loader2,
  RefreshCw,
  Star,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import type { AddProductFormValues } from '../schema';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGES,
  MAX_IMAGE_BYTES,
} from '../utils/product';
import {
  CloudinaryUploadError,
  isCloudinaryConfigured,
  uploadImageToCloudinary,
} from '../services/cloudinary.service';
import { Badge, Field, inputClassName } from './ui';

interface ImageUploaderProps {
  onUploadStateChange?: (state: { active: number; failed: number }) => void;
}

interface PendingUpload {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: 'uploading' | 'error';
  error?: string;
}

function validateFile(file: File): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const validExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(extension);
  const validType = ACCEPTED_IMAGE_TYPES.includes(file.type);

  if (!validType && !(file.type === '' && validExtension)) {
    return `${file.name}: use a WebP, PNG, JPG, or JPEG file.`;
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name}: files must be 15 MB or smaller.`;
  }

  if (file.size === 0) {
    return `${file.name}: the file is empty.`;
  }

  return null;
}

function defaultAltText(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .slice(0, 255);
}

export function ImageUploader({ onUploadStateChange }: ImageUploaderProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<AddProductFormValues>();
  const images = watch('images') ?? [];

  const inputRef = useRef<HTMLInputElement>(null);
  const controllersRef = useRef(new Map<string, AbortController>());
  const pendingRef = useRef<PendingUpload[]>([]);
  const mountedRef = useRef(true);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const configured = isCloudinaryConfigured();

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    mountedRef.current = true;
    const controllers = controllersRef.current;
    return () => {
      mountedRef.current = false;
      for (const controller of controllers.values()) controller.abort();
      for (const item of pendingRef.current) URL.revokeObjectURL(item.previewUrl);
    };
  }, []);

  useEffect(() => {
    if (!onUploadStateChange) return;
    onUploadStateChange({
      active: pending.filter((item) => item.status === 'uploading').length,
      failed: pending.filter((item) => item.status === 'error').length,
    });
  }, [pending, onUploadStateChange]);

  const normalizeImages = (nextImages: AddProductFormValues['images']) => {
    let coverAssigned = false;
    return nextImages.map((image) => {
      const isThumbnail = !coverAssigned && Boolean(image.isThumbnail);
      if (isThumbnail) coverAssigned = true;
      return { ...image, isThumbnail };
    }).map((image, index, list) => {
      if (!list.some((item) => item.isThumbnail) && index === 0) {
        return { ...image, isThumbnail: true };
      }
      return image;
    });
  };

  const updateImages = (nextImages: AddProductFormValues['images']) => {
    setValue('images', normalizeImages(nextImages), { shouldDirty: true, shouldValidate: true });
  };

  const removePending = (id: string, revokePreview = true) => {
    controllersRef.current.get(id)?.abort();
    controllersRef.current.delete(id);
    setPending((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item && revokePreview) URL.revokeObjectURL(item.previewUrl);
      return current.filter((entry) => entry.id !== id);
    });
  };

  const startUpload = (item: PendingUpload) => {
    const controller = new AbortController();
    controllersRef.current.set(item.id, controller);

    setPending((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, status: 'uploading', progress: 0, error: undefined } : entry,
      ),
    );

    uploadImageToCloudinary(
      item.file,
      (progress) => {
        if (!mountedRef.current || controller.signal.aborted) return;
        setPending((current) =>
          current.map((entry) => (entry.id === item.id ? { ...entry, progress } : entry)),
        );
      },
      controller.signal,
    )
      .then((result) => {
        if (!mountedRef.current || controller.signal.aborted) return;

        const currentImages = watch('images') ?? [];
        if (currentImages.length >= MAX_IMAGES) {
          throw new CloudinaryUploadError(`You can upload up to ${MAX_IMAGES} images.`, 'UPLOAD_FAILED');
        }

        const uploaded = {
          url: result.secure_url,
          altText: defaultAltText(item.file.name),
          isThumbnail: currentImages.length === 0,
        };

        setValue('images', normalizeImages([...currentImages, uploaded]), {
          shouldDirty: true,
          shouldValidate: true,
        });
        setPending((current) => {
          URL.revokeObjectURL(item.previewUrl);
          return current.filter((entry) => entry.id !== item.id);
        });
      })
      .catch((error: unknown) => {
        if (!mountedRef.current || controller.signal.aborted) return;
        const message =
          error instanceof Error ? error.message : 'The image could not be uploaded. Please try again.';
        setPending((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, status: 'error', error: message } : entry,
          ),
        );
      })
      .finally(() => {
        controllersRef.current.delete(item.id);
      });
  };

  const addFiles = (files: FileList | File[]) => {
    setNotice(null);

    if (!configured) {
      setNotice('Cloudinary is not configured. Add the required public environment variables and restart the dev server.');
      return;
    }

    let availableSlots = MAX_IMAGES - images.length - pending.length;
    if (availableSlots <= 0) {
      setNotice(`Your gallery already has the maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const fileErrors: string[] = [];
    const validFiles: File[] = [];

    for (const file of Array.from(files)) {
      if (availableSlots <= 0) {
        fileErrors.push(`Only ${MAX_IMAGES} images can be added to one product.`);
        break;
      }

      const error = validateFile(file);
      if (error) {
        fileErrors.push(error);
        continue;
      }

      validFiles.push(file);
      availableSlots -= 1;
    }

    const newItems: PendingUpload[] = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: 'uploading',
    }));

    if (newItems.length > 0) {
      setPending((current) => [...current, ...newItems]);
      newItems.forEach(startUpload);
    }

    if (fileErrors.length > 0) {
      setNotice(fileErrors.join(' '));
    }
  };

  const removeImage = (index: number) => {
    updateImages(images.filter((_, imageIndex) => imageIndex !== index));
  };

  const setCover = (index: number) => {
    updateImages(images.map((image, imageIndex) => ({ ...image, isThumbnail: imageIndex === index })));
  };

  const moveImage = (from: number, to: number) => {
    if (from === to || to < 0 || to >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    updateImages(next);
  };

  const updateAltText = (index: number, altText: string) => {
    updateImages(images.map((image, imageIndex) => (imageIndex === index ? { ...image, altText } : image)));
  };

  const isAtCapacity = images.length + pending.length >= MAX_IMAGES;

  return (
    <div className="grid gap-4">
      {!configured && (
        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-800">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <p>
            Cloudinary upload is not configured. Set <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and{' '}
            <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> in <code>frontend/.env.local</code>.
          </p>
        </div>
      )}

      <button
        type="button"
        disabled={!configured || isAtCapacity}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          if (!isAtCapacity) addFiles(event.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-9 text-center transition ${
          dragActive
            ? 'border-[#ff4600] bg-[#fff3ec]'
            : 'border-[#ddd9d4] bg-[#faf9f6] hover:border-[#ff4600]/50 hover:bg-[#fffaf7]'
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#ff4600] shadow-sm ring-1 ring-[#ff4600]/10">
          {isAtCapacity ? <ImagePlus className="h-5 w-5" /> : <UploadCloud className="h-5 w-5" />}
        </span>
        <span className="mt-3 text-sm font-semibold text-neutral-800">
          {isAtCapacity ? 'Gallery is full' : 'Drop images here or click to browse'}
        </span>
        <span className="mt-1 text-[11px] text-neutral-500">
          WebP, PNG, JPG, or JPEG · up to 15 MB each · {images.length + pending.length}/{MAX_IMAGES} images
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/webp,image/png,image/jpeg"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files);
          event.target.value = '';
        }}
      />

      {notice && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800" role="alert">
          <p>{notice}</p>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notice">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {pending.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {pending.map((item) => (
            <div key={item.id} className="rounded-lg border border-[#e8e6e3] bg-white p-2.5">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100">
                  <Image src={item.previewUrl} alt="Upload preview" fill unoptimized className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-neutral-700">{item.file.name}</p>
                  {item.status === 'uploading' ? (
                    <>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-[#ff4600] transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-neutral-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Uploading {item.progress}%
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 line-clamp-2 text-[10px] text-red-600">{item.error}</p>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-0.5">
                  {item.status === 'error' && (
                    <button
                      type="button"
                      aria-label={`Retry upload of ${item.file.name}`}
                      onClick={() => startUpload(item)}
                      className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={`Remove ${item.file.name}`}
                    onClick={() => removePending(item.id)}
                    className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const from = Number(event.dataTransfer.getData('text/plain'));
                if (Number.isInteger(from)) moveImage(from, index);
                setDragIndex(null);
              }}
              className={`overflow-hidden rounded-xl border bg-white transition ${
                dragIndex === index ? 'border-[#ff4600] opacity-60' : 'border-[#e8e6e3]'
              }`}
            >
              <div className="relative aspect-[4/5] bg-neutral-100">
                <Image
                  src={image.url}
                  alt={image.altText || `Product image ${index + 1}`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute left-2 top-2 flex items-center gap-1">
                  {image.isThumbnail ? (
                    <Badge tone="primary">
                      <Star className="h-3 w-3 fill-current" />
                      Cover
                    </Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCover(index)}
                      className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-neutral-600 shadow-sm transition hover:text-[#ff4600]"
                    >
                      <Star className="h-3 w-3" />
                      Set cover
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  aria-label={`Remove image ${index + 1}`}
                  className="absolute right-2 top-2 rounded-full bg-white/95 p-1.5 text-neutral-500 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-2 p-2.5">
                <Field label="Alt text" htmlFor={`image-alt-${index}`}>
                  <input
                    id={`image-alt-${index}`}
                    type="text"
                    value={image.altText ?? ''}
                    maxLength={255}
                    placeholder="Describe the image"
                    onChange={(event) => updateAltText(index, event.target.value)}
                    className={`${inputClassName} py-2 text-xs`}
                  />
                </Field>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      disabled={index === 0}
                      aria-label="Move image left"
                      className="rounded p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      disabled={index === images.length - 1}
                      aria-label="Move image right"
                      className="rounded p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <div
                      draggable
                      onDragStart={(event) => {
                        setDragIndex(index);
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', String(index));
                      }}
                      onDragEnd={() => setDragIndex(null)}
                      className="cursor-grab rounded p-1 text-neutral-300 active:cursor-grabbing"
                      title="Drag to reorder"
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-neutral-400">Image {index + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {errors.images?.message && (
        <p className="text-[11px] font-medium text-red-600" role="alert">
          {errors.images.message}
        </p>
      )}
    </div>
  );
}
