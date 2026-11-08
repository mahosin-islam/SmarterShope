import type {
  ProductListItem,
  ProductListResponse,
  ProductStats,
  BulkStatusResult,
  ProductStatusFilter,
  ProductSortBy,
  ProductSortOrder,
} from '../types/product-list.types';
import { getCsrfToken } from '@/lib/csrf';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1').replace(/\/$/, '');

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

interface ApiSuccessBody<T> {
  success: true;
  data: T;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiListSuccessBody<T> {
  success: true;
  data: T[];
  meta?: PaginationMeta;
}

export class ProductListApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: { field: string; message: string }[];

  constructor(message: string, status: number, code: string, details: { field: string; message: string }[] = []) {
    super(message);
    this.name = 'ProductListApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function parseFieldErrors(details: unknown): { field: string; message: string }[] {
  if (!Array.isArray(details)) return [];

  return details.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const field = 'field' in item ? item.field : undefined;
    const message = 'message' in item ? item.message : undefined;

    if (typeof field !== 'string' || typeof message !== 'string') return [];
    return [{ field, message }];
  });
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method)) {
    const token = await getCsrfToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => null)) as ApiErrorBody | ApiSuccessBody<T> | null;

  if (!response.ok) {
    const errorBody = body && 'error' in body ? body.error : undefined;
    throw new ProductListApiError(
      errorBody?.message || `Request failed with status ${response.status}`,
      response.status,
      errorBody?.code || 'REQUEST_FAILED',
      parseFieldErrors(errorBody?.details),
    );
  }

  if (!body || !('data' in body)) {
    throw new ProductListApiError('The server returned an empty response.', response.status, 'EMPTY_RESPONSE');
  }

  return body.data;
}

async function requestList<T>(path: string, options: RequestInit = {}): Promise<{ data: T[]; meta?: PaginationMeta }> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => null)) as ApiErrorBody | ApiListSuccessBody<T> | null;

  if (!response.ok) {
    const errorBody = body && 'error' in body ? body.error : undefined;
    throw new ProductListApiError(
      errorBody?.message || `Request failed with status ${response.status}`,
      response.status,
      errorBody?.code || 'REQUEST_FAILED',
      parseFieldErrors(errorBody?.details),
    );
  }

  if (!body || !('data' in body)) {
    throw new ProductListApiError('The server returned an empty response.', response.status, 'EMPTY_RESPONSE');
  }

  return { data: body.data, meta: body.meta };
}

export const productListService = {
  async listProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    status?: ProductStatusFilter;
    sortBy?: ProductSortBy;
    sortOrder?: ProductSortOrder;
  }): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.set('page', String(params.page));
    if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params.brandId) searchParams.set('brandId', params.brandId);
    if (params.status && params.status !== 'all') searchParams.set('status', params.status);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const { data, meta } = await requestList<ProductListItem>(`/admin/products${query}`);
    return { products: data, meta: meta ?? { page: 1, limit: 20, total: 0, totalPages: 1 } };
  },

  async getProductStats(params?: {
    categoryId?: string;
    brandId?: string;
    search?: string;
  }): Promise<ProductStats> {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.brandId) searchParams.set('brandId', params.brandId);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<ProductStats>(`/admin/products/stats${query}`);
  },

  async bulkUpdateStatus(ids: string[], isActive: boolean): Promise<BulkStatusResult> {
    return request<BulkStatusResult>('/admin/products/bulk-status', {
      method: 'PATCH',
      body: JSON.stringify({ ids, isActive }),
    });
  },

  async exportProducts(params: {
    search?: string;
    categoryId?: string;
    brandId?: string;
    status?: ProductStatusFilter;
    sortBy?: ProductSortBy;
    sortOrder?: ProductSortOrder;
  }): Promise<void> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params.brandId) searchParams.set('brandId', params.brandId);
    if (params.status && params.status !== 'all') searchParams.set('status', params.status);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const response = await fetch(`${API_URL}/admin/products/export${query}`, {
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
      throw new ProductListApiError(
        body?.error?.message || `Export failed with status ${response.status}`,
        response.status,
        body?.error?.code || 'REQUEST_FAILED',
      );
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = `products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
