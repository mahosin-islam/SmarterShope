const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1').replace(/\/$/, '');

let memoryCsrfToken: string | null = null;
let csrfFetchPromise: Promise<string | null> | null = null;

/**
 * Reads the CSRF token cookie if readable by document.cookie (same-origin / localhost).
 */
function readCsrfCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )modora_csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Obtains a valid CSRF token.
 * 1. Returns from memory cache if available.
 * 2. Checks document.cookie (if same-origin / localhost).
 * 3. Falls back to fetching from backend GET /api/v1/auth/csrf-token with credentials: 'include'.
 */
export async function getCsrfToken(): Promise<string | null> {
  if (memoryCsrfToken) {
    return memoryCsrfToken;
  }

  const cookieToken = readCsrfCookie();
  if (cookieToken) {
    memoryCsrfToken = cookieToken;
    return cookieToken;
  }

  if (csrfFetchPromise) {
    return csrfFetchPromise;
  }

  csrfFetchPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/csrf-token`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) return null;

      const body = await response.json();
      if (body?.data?.csrfToken && typeof body.data.csrfToken === 'string') {
        memoryCsrfToken = body.data.csrfToken;
        return memoryCsrfToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      csrfFetchPromise = null;
    }
  })();

  return csrfFetchPromise;
}

/**
 * Invalidate cached token on demand (e.g. after logout or 403 CSRF mismatch).
 */
export function invalidateCsrfToken(): void {
  memoryCsrfToken = null;
}
