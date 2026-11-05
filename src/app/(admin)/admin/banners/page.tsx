import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { AdminPlaceholder } from '@/features/admin/shared/components/AdminPlaceholder';

export default function BannersAdminPage() {
  return (
    <AdminPlaceholder
      title="Promotional Banners"
      subtitle="Customize homepage banners, editorial campaigns, and tickers."
      icon={ImageIcon}
      actionLabel="Upload Banner"
      actionHref="/admin/banners/upload"
    />
  );
}
