import React from 'react';
import { Warehouse } from 'lucide-react';
import { AdminPlaceholder } from '@/features/admin/shared/components/AdminPlaceholder';

export default function InventoryAdminPage() {
  return (
    <AdminPlaceholder
      title="Stock Ledger & Inventory"
      subtitle="Track stock levels, depletion warnings, and warehouse allocations."
      icon={Warehouse}
      actionLabel="Transfer Lots"
      actionHref="/admin/inventory/transfer"
    />
  );
}
