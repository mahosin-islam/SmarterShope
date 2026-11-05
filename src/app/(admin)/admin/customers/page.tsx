import React from 'react';
import { Users } from 'lucide-react';
import { AdminPlaceholder } from '@/features/admin/shared/components/AdminPlaceholder';

export default function CustomersAdminPage() {
  return (
    <AdminPlaceholder
      title="Atelier Clients & Customers"
      subtitle="Manage registered patrons, VIP profiles, and purchase history."
      icon={Users}
      actionLabel="Client Directory"
      actionHref="/admin/customers"
    />
  );
}
