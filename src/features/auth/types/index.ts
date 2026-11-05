// Auth types — MODORA E-Commerce
// Session is managed via HTTP-only cookies set by the backend.

export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  phone: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
