import type {
  AdminCategory,
  CategoryFormPayload,
  CategoryReorderItem,
  CategoryFieldError,
} from '../types/category.types';
import { getCsrfToken, invalidateCsrfToken } from '@/lib/csrf';
import { authService, getAccessToken } from '@/features/auth/services/auth.service';

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

export class AdminCategoryApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: CategoryFieldError[];

  constructor(message: string, status: number, code: string, details: CategoryFieldError[] = []) {
    super(message);
    this.name = 'AdminCategoryApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function parseFieldErrors(details: unknown): CategoryFieldError[] {
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
  const buildHeaders = async () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const authToken = getAccessToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method)) {
      const token = await getCsrfToken();
      if (token) {
        headers['X-CSRF-Token'] = token;
      }
    }

    return headers;
  };

  let headers = await buildHeaders();
  let response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    cache: 'no-store',
  });

  // Automatically refresh access token on 401 and retry once
  if (response.status === 401) {
    const refreshed = await authService.refresh();
    if (refreshed) {
      headers = await buildHeaders();
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: 'include',
        cache: 'no-store',
      });
    }
  }

  const body = (await response.json().catch(() => null)) as ApiErrorBody | ApiSuccessBody<T> | null;

  if (!response.ok) {
    if (response.status === 403) {
      invalidateCsrfToken();
    }
    const errorBody = body && 'error' in body ? body.error : undefined;
    throw new AdminCategoryApiError(
      errorBody?.message || `Request failed with status ${response.status}`,
      response.status,
      errorBody?.code || 'REQUEST_FAILED',
      parseFieldErrors(errorBody?.details),
    );
  }

  if (!body || !('data' in body)) {
    throw new AdminCategoryApiError('The server returned an empty response.', response.status, 'EMPTY_RESPONSE');
  }

  return body.data;
}

export const categoryService = {
  async listCategories(params?: {
    search?: string;
    isActive?: 'true' | 'false' | 'all';
    parentId?: string;
  }): Promise<AdminCategory[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.isActive) searchParams.set('isActive', params.isActive);
    if (params?.parentId) searchParams.set('parentId', params.parentId);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<AdminCategory[]>(`/admin/categories${query}`);
  },

  async getCategory(id: string): Promise<AdminCategory> {
    return request<AdminCategory>(`/admin/categories/${id}`);
  },

  async createCategory(payload: CategoryFormPayload): Promise<AdminCategory> {
    return request<AdminCategory>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateCategory(id: string, payload: Partial<CategoryFormPayload>): Promise<AdminCategory> {
    return request<AdminCategory>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async updateCategoryStatus(id: string, isActive: boolean): Promise<AdminCategory> {
    return request<AdminCategory>(`/admin/categories/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  async reorderCategories(items: CategoryReorderItem[]): Promise<AdminCategory[]> {
    return request<AdminCategory[]>('/admin/categories/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    });
  },

  async deleteCategory(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  },
};
