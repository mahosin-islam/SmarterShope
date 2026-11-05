import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { AdminPlaceholder } from '@/features/admin/shared/components/AdminPlaceholder';

export default function OrdersAdminPage() {
  return (
    <AdminPlaceholder
      title="Orders & Fulfillment"
      subtitle="Process customer orders, fulfillment pipelines, and tracking."
      icon={ShoppingBag}
      actionLabel="Export Manifest"
      actionHref="/admin/orders/export"
    />
  );
}
