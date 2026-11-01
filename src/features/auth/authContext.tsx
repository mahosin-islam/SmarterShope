'use client';

// AuthContext — provides user session, login, register, logout across the app.
// Token storage: localStorage (TEMPORARY until Phase 1 HTTP-only cookies are implemented).
// Do NOT store sensitive payment or PII data in localStorage beyond the auth token.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authService } from '@/services/auth.service';
import type { AuthUser, AuthTokens, LoginPayload, RegisterPayload } from '@/features/auth/types';

// ─── Storage helpers (localStorage) ─────────────────────────────────────────
// TEMPORARY: will be replaced with HTTP-only cookie approach in Phase 1.
const STORAGE_KEY_ACCESS = 'modora_access_token';
const STORAGE_KEY_REFRESH = 'modora_refresh_token';

function saveTokens(tokens: AuthTokens): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACCESS, tokens.accessToken);
    localStorage.setItem(STORAGE_KEY_REFRESH, tokens.refreshToken);
    // Also store role in a non-sensitive cookie so Next.js middleware can read it
    // for route-guarding WITHOUT granting any backend authority.
    const cookieMaxAge = 60 * 60 * 24 * 7; // 7 days
    document.cookie = `modora_auth_present=1; path=/; max-age=${cookieMaxAge}; SameSite=Lax`;
  } catch {
    // Ignore write errors (e.g. private browsing storage quota)
  }
}

function clearTokens(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ACCESS);
    localStorage.removeItem(STORAGE_KEY_REFRESH);
    document.cookie = 'modora_auth_present=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'modora_user_role=; path=/; max-age=0; SameSite=Lax';
  } catch {
    // Ignore
  }
}

function saveRoleCookie(role: string): void {
  try {
    const cookieMaxAge = 60 * 60 * 24 * 7;
    document.cookie = `modora_user_role=${role}; path=/; max-age=${cookieMaxAge}; SameSite=Lax`;
  } catch {
    // Ignore
  }
}

function getStoredTokens(): AuthTokens | null {
  try {
    const accessToken = localStorage.getItem(STORAGE_KEY_ACCESS);
    const refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH);
    if (accessToken && refreshToken) return { accessToken, refreshToken };
  } catch {
    // Ignore
  }
  return null;
}

// ─── Context types ────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const stored = getStoredTokens();
      if (!stored) {
        if (!cancelled) setIsLoading(false);
        return;
      }
      try {
        const fetchedUser = await authService.getMe(stored.accessToken);
        if (!cancelled) {
          setUser(fetchedUser);
          setTokens(stored);
          saveRoleCookie(fetchedUser.role);
        }
      } catch {
        // Token expired or invalid — clear storage silently
        clearTokens();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void restoreSession();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { user: loggedUser, tokens: newTokens } = await authService.login(payload);
    saveTokens(newTokens);
    saveRoleCookie(loggedUser.role);
    setUser(loggedUser);
    setTokens(newTokens);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user: newUser, tokens: newTokens } = await authService.register(payload);
    saveTokens(newTokens);
    saveRoleCookie(newUser.role);
    setUser(newUser);
    setTokens(newTokens);
  }, []);

  const logout = useCallback(async () => {
    const stored = getStoredTokens();
    if (stored?.refreshToken) {
      try {
        await authService.logout(stored.refreshToken);
      } catch {
        // Continue with local logout even if server call fails
      }
    }
    clearTokens();
    setUser(null);
    setTokens(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, tokens, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
