// Auth API service — calls backend at NEXT_PUBLIC_API_URL
// Never hardcode localhost; always use the env variable.

import type { AuthUser, AuthTokens, LoginPayload, RegisterPayload } from '@/features/auth/types';

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
  tokens: AuthTokens;
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
    // Backend returns { success: false, error: { code, message, details? } }
    if (json && typeof json === 'object' && 'error' in json) {
      const errBody = json as ApiErrorResponse;
      const details = errBody.error.details;
      // If validation error, build a readable message from field-level details
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

export const authService = {
  async login(payload: LoginPayload): Promise<AuthData> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<AuthData>(res);
  },

  async register(payload: RegisterPayload): Promise<AuthData> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<AuthData>(res);
  },

  async logout(refreshToken: string): Promise<void> {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse<{ accessToken: string }>(res);
  },

  async getMe(accessToken: string): Promise<AuthUser> {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const profile = await handleResponse<ProfileData>(res);
    // Map ProfileData to AuthUser (strip extra fields like createdAt, addresses)
    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: profile.role,
      phone: profile.phone,
    };
  },
};
