import type {
  AdminBrand,
  BrandFormPayload,
  BrandFieldError,
} from '../types/brand.types';

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

export class AdminBrandApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: BrandFieldError[];

  constructor(message: string, status: number, code: string, details: BrandFieldError[] = []) {
    super(message);
    this.name = 'AdminBrandApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function parseFieldErrors(details: unknown): BrandFieldError[] {
  if (!Array.isArray(details)) return [];

  return details.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const field = 'field' in item ? item.field : undefined;
    const message = 'message' in item ? item.message : undefined;

    if (typeof field !== 'string' || typeof message !== 'string') return [];
    return [{ field, message }];
  });
}

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )modora_csrf_token=([^;]*)/);
  return match ? match[1] : null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Add CSRF token for state-changing methods
  if (options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method)) {
    const token = getCsrfToken();
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
    throw new AdminBrandApiError(
      errorBody?.message || `Request failed with status ${response.status}`,
      response.status,
      errorBody?.code || 'REQUEST_FAILED',
      parseFieldErrors(errorBody?.details),
    );
  }

  if (!body || !('data' in body)) {
    throw new AdminBrandApiError('The server returned an empty response.', response.status, 'EMPTY_RESPONSE');
  }

  return body.data;
}

export const brandService = {
  async listBrands(params?: {
    search?: string;
    isActive?: 'true' | 'false' | 'all';
  }): Promise<AdminBrand[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.isActive) searchParams.set('isActive', params.isActive);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<AdminBrand[]>(`/admin/brands${query}`);
  },

  async getBrand(id: string): Promise<AdminBrand> {
    return request<AdminBrand>(`/admin/brands/${id}`);
  },

  async createBrand(payload: BrandFormPayload): Promise<AdminBrand> {
    return request<AdminBrand>('/admin/brands', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateBrand(id: string, payload: Partial<BrandFormPayload>): Promise<AdminBrand> {
    return request<AdminBrand>(`/admin/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async updateBrandStatus(id: string, isActive: boolean): Promise<AdminBrand> {
    return request<AdminBrand>(`/admin/brands/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  async deleteBrand(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/brands/${id}`, {
      method: 'DELETE',
    });
  },
};
