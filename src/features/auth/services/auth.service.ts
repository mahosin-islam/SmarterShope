// Auth API service — calls backend at NEXT_PUBLIC_API_URL
// All requests use credentials: 'include' so HTTP-only cookies are sent.
// Tokens are NOT stored in localStorage; they live in HttpOnly cookies.

import type { AuthUser, LoginPayload, RegisterPayload } from '@/features/auth/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

interface AuthData {
  user: AuthUser;
}

// Profile response may include extra fields like createdAt, addresses
interface ProfileData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  phone: string | null;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    if (json && typeof json === 'object' && 'error' in json) {
      const errBody = json as ApiErrorResponse;
      const details = errBody.error.details;
      if (details && Array.isArray(details) && details.length > 0) {
        const fieldMessages = details.map((d) => `${d.field}: ${d.message}`).join('; ');
        throw new Error(fieldMessages);
      }
      throw new Error(errBody.error.message || `Request failed (${res.status})`);
    }
    throw new Error(`Request failed with status ${res.status}`);
  }

  if (!json) {
    throw new Error('Empty response from server');
  }

  return (json as ApiSuccessResponse<T>).data;
}

function requestOptions(body?: unknown): RequestInit {
  return {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  };
}

// Refresh token locking to prevent concurrent refresh conflicts
let refreshPromise: Promise<boolean> | null = null;
let refreshResolveList: Array<() => void> = [];

function clearRefreshLock(): void {
  refreshPromise = null;
  const listeners = refreshResolveList;
  refreshResolveList = [];
  listeners.forEach((fn) => fn());
}

async function performRefresh(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise.then(() => true).catch(() => false);
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Refresh failed');
      }

      await res.json();
      clearRefreshLock();
      return true;
    } catch {
      clearRefreshLock();
      return false;
    }
  })();

  return refreshPromise.then(() => true).catch(() => false);
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const res = await fetch(`${API_URL}/auth/login`, requestOptions(payload));
    const data = await handleResponse<AuthData>(res);
    return data.user;
  },

  async register(payload: RegisterPayload): Promise<AuthUser> {
    const res = await fetch(`${API_URL}/auth/register`, requestOptions(payload));
    const data = await handleResponse<AuthData>(res);
    return data.user;
  },

  async logout(): Promise<void> {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
  },

  async refresh(): Promise<boolean> {
    return performRefresh();
  },

  async getMe(): Promise<AuthUser> {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    const profile = await handleResponse<ProfileData>(res);
    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: profile.role,
      phone: profile.phone
    };
  },

  async googleOneTap(credential: string): Promise<AuthUser> {
    const res = await fetch(`${API_URL}/auth/google/one-tap`, requestOptions({ credential }));
    const data = await handleResponse<AuthData>(res);
    return data.user;
  },

  async getGoogleConfig(): Promise<{ clientId: string | null }> {
    const res = await fetch(`${API_URL}/auth/google/config`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    return handleResponse<{ clientId: string | null }>(res);
  },

  /**
   * Makes an authenticated request with automatic refresh on 401.
   * Prevents infinite loops and handles concurrent requests safely.
   */
  async requestWithRefresh(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
    const MAX_REFRESH_ATTEMPTS = 1;
    let attempts = 0;

    async function attempt(): Promise<Response> {
      const res = await fetch(input, {
        ...init,
        credentials: 'include'
      });

      if (res.status === 401 && attempts < MAX_REFRESH_ATTEMPTS) {
        attempts += 1;

        const refreshed = await performRefresh();
        if (refreshed) {
          return attempt();
        }

        throw new Error('Session expired');
      }

      return res;
    }

    return attempt();
  }
};
