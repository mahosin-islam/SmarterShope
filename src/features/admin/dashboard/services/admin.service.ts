import { authService, getAccessToken } from '@/features/auth/services/auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface DashboardStats {
  kpi: {
    totalRevenue: number;
    todayRevenue: number;
    todayOrdersCount: number;
    totalOrders: number;
    pendingOrders: number;
    activeCatalog: number;
    newProductsThisWeek: number;
    activeCategories: number;
    totalClients: number;
    aov: number;
    totalInventoryStock: number;
    lowStockItems: number;
    criticalStockUnits: number;
  };
  salesTrajectory: Array<{
    label: string;
    revenue: number;
    orders: number;
  }>;
  lowStockAlerts: Array<{
    id: string;
    title: string;
    sku: string;
    stock: number;
    categoryName: string;
    variantInfo: string;
  }>;
  recentProducts: Array<{
    id: string;
    title: string;
    slug: string;
    sku: string;
    basePrice: number;
    stock: number;
    category: { id: string; name: string; slug: string } | null;
    imageUrl: string | null;
    isActive: boolean;
    createdAt: string;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    itemCount: number;
    clientName: string;
    clientEmail: string;
    location: string;
    createdAt: string;
  }>;
}

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const buildHeaders = () => {
      const token = getAccessToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      return headers;
    };

    let res = await fetch(`${API_URL}/admin/dashboard/stats`, {
      headers: buildHeaders(),
      credentials: 'include',
      cache: 'no-store'
    });

    if (res.status === 401) {
      const refreshed = await authService.refresh();
      if (refreshed) {
        res = await fetch(`${API_URL}/admin/dashboard/stats`, {
          headers: buildHeaders(),
          credentials: 'include',
          cache: 'no-store'
        });
      }
    }

    if (!res.ok) {
      throw new Error(`Failed to load admin stats (${res.status})`);
    }

    const data = await res.json();
    return data.data;
  }
};
