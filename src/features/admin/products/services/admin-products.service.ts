import type {
  ApiFieldError,
  BrandOption,
  CategoryOption,
  CreateProductPayload,
  CreatedProduct,
  StoreSettings,
} from '../types';
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

export class AdminProductApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiFieldError[];

  constructor(message: string, status: number, code: string, details: ApiFieldError[] = []) {
    super(message);
    this.name = 'AdminProductApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function parseFieldErrors(details: unknown): ApiFieldError[] {
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
    cache: 'no-store'
  });

  const body = (await response.json().catch(() => null)) as ApiErrorBody | ApiSuccessBody<T> | null;

  if (!response.ok) {
    const errorBody = body && 'error' in body ? body.error : undefined;
    throw new AdminProductApiError(
      errorBody?.message || `Request failed with status ${response.status}`,
      response.status,
      errorBody?.code || 'REQUEST_FAILED',
      parseFieldErrors(errorBody?.details),
    );
  }

  if (!body || !('data' in body)) {
    throw new AdminProductApiError('The server returned an empty response.', response.status, 'EMPTY_RESPONSE');
  }

  return body.data;
}

export const adminProductService = {
  async listCategories(): Promise<CategoryOption[]> {
    return request<CategoryOption[]>('/admin/categories?isActive=true');
  },

  async listBrands(): Promise<BrandOption[]> {
    return request<BrandOption[]>('/admin/brands?isActive=true');
  },

  async getPublicSettings(): Promise<StoreSettings> {
    return request<StoreSettings>('/settings/public', {});
  },

  async createProduct(payload: CreateProductPayload): Promise<CreatedProduct> {
    return request<CreatedProduct>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
