// Auth API service — calls backend at NEXT_PUBLIC_API_URL
// Never hardcode localhost; always use the env variable.

import type { AuthUser, AuthTokens, LoginPayload, RegisterPayload } from '@/features/auth/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface AuthResponse {
  success: boolean;
  data: {
    user: AuthUser;
    tokens: AuthTokens;
  };
}

interface MeResponse {
  success: boolean;
  data: AuthUser;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message: string =
      (json as { error?: { message?: string } })?.error?.message ??
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return json as T;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse['data']> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<AuthResponse>(res);
    return data.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse['data']> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<AuthResponse>(res);
    return data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await handleResponse<{ success: boolean; data: AuthTokens }>(res);
    return data.data;
  },

  async getMe(accessToken: string): Promise<AuthUser> {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await handleResponse<MeResponse>(res);
    return data.data;
  },
};
