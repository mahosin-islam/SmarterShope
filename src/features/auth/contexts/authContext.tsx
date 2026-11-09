'use client';

// AuthContext — provides user session, login, register, logout across the app.
// Session is managed via HTTP-only cookies set by the backend.
// Tokens are NOT stored in localStorage or accessible to JavaScript.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authService } from '@/features/auth/services/auth.service';
import type { AuthUser, LoginPayload, RegisterPayload } from '@/features/auth/types';

// ─── Storage helpers (UX-only cookies for Next.js middleware) ─────────────────
// These cookies carry NO backend authority — the backend validates the
// actual HTTP-only session cookie independently. They are only for edge
// middleware route protection of /admin and /account pages.

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function setAuthCookies(role: string): void {
  try {
    document.cookie = `modora_auth_present=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    document.cookie = `modora_user_role=${role}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch {
    // Ignore write errors
  }
}

function clearAuthCookies(): void {
  try {
    document.cookie = 'modora_auth_present=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'modora_user_role=; path=/; max-age=0; SameSite=Lax';
  } catch {
    // Ignore
  }
}
// ─── Context types ────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount via HTTP-only cookie + /auth/me
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const fetchedUser = await authService.getMe();
        if (!cancelled) {
          setUser(fetchedUser);
        }
      } catch {
        // Session expired or invalid — refresh may recover it
        try {
          const refreshed = await authService.refresh();
          if (!cancelled && refreshed) {
            const retriedUser = await authService.getMe();
            if (!cancelled) {
              setUser(retriedUser);
            }
          } else if (!cancelled) {
            setUser(null);
          }
        } catch {
          if (!cancelled) {
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();
    return () => { cancelled = true; };
  }, []);

  // Sync UX-only cookies for Next.js middleware route protection
  useEffect(() => {
    if (user) {
      setAuthCookies(user.role);
    } else {
      clearAuthCookies();
    }
  }, [user]);

  const login = useCallback(async (payload: LoginPayload): Promise<AuthUser> => {
    const loggedUser = await authService.login(payload);
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<AuthUser> => {
    const newUser = await authService.register(payload);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && (window as unknown as { google?: { accounts?: { id?: { disableAutoSelect?: () => void } } } })?.google?.accounts?.id?.disableAutoSelect) {
        (window as unknown as { google: { accounts: { id: { disableAutoSelect: () => void } } } }).google.accounts.id.disableAutoSelect();
      }
      await authService.logout();
    } catch {
      // Continue with local logout even if server call fails
    }
    clearAuthCookies();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      setUser,
      login,
      register,
      logout,
    }),
    [user, isLoading, setUser, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
