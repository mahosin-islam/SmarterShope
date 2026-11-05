import React from 'react';
import { Settings } from 'lucide-react';
import { AdminPlaceholder } from '@/features/admin/shared/components/AdminPlaceholder';

export default function SettingsAdminPage() {
  return (
    <AdminPlaceholder
      title="Store & Atelier Settings"
      subtitle="Configure store currency, regional taxes, shipping rates, and API keys."
      icon={Settings}
      actionLabel="Save Changes"
    />
  );
}
