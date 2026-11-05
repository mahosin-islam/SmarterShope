'use client';

import React from 'react';
import { ImagePlus } from 'lucide-react';
import { Badge, SectionCard } from './ui';
import { ImageUploader } from './ImageUploader';

interface MediaSectionProps {
  onUploadStateChange: (state: { active: number; failed: number }) => void;
}

export function MediaSection({ onUploadStateChange }: MediaSectionProps) {
  return (
    <SectionCard
      title="Media Gallery"
      description="Upload high-resolution product photography. The cover image is used in catalog listings."
      icon={ImagePlus}
      badge={<Badge tone="neutral">Unsigned Cloudinary upload</Badge>}
    >
      <ImageUploader onUploadStateChange={onUploadStateChange} />
    </SectionCard>
  );
}
