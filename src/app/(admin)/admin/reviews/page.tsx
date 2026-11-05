import React from 'react';
import { Star } from 'lucide-react';
import { AdminPlaceholder } from '@/features/admin/shared/components/AdminPlaceholder';

export default function ReviewsAdminPage() {
  return (
    <AdminPlaceholder
      title="Product Reviews"
      subtitle="Moderate customer ratings, verified purchase feedback, and testimonials."
      icon={Star}
    />
  );
}
