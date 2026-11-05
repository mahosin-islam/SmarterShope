import React from 'react';
import { Ticket } from 'lucide-react';
import { AdminPlaceholder } from '@/features/admin/shared/components/AdminPlaceholder';

export default function CouponsAdminPage() {
  return (
    <AdminPlaceholder
      title="Coupons & Deals"
      subtitle="Configure promotional discount codes, vouchers, and private offers."
      icon={Ticket}
      actionLabel="Create Coupon"
      actionHref="/admin/coupons/create"
    />
  );
}
