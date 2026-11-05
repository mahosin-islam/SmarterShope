import type { Metadata } from 'next';
import { AddProductForm } from '@/features/admin/products/components/AddProductForm';

export const metadata: Metadata = {
  title: 'Add Product | MODORA Admin',
  description: 'Create and publish a product in the MODORA catalog.',
};

export default function AddProductAdminPage() {
  return <AddProductForm />;
}
