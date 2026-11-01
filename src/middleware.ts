// Next.js Edge Middleware — route protection for admin and account pages.
//
// Strategy:
// - We cannot read localStorage in middleware (edge runtime has no DOM).
// - On login, the auth context sets a non-sensitive cookie `modora_user_role`
//   (value: ADMIN | STAFF | CUSTOMER) and `modora_auth_present` (value: 1).
// - Middleware reads these cookies to decide routing.
// - These cookies carry NO backend authority — the backend always validates
//   the actual Bearer token independently. The cookies are only for UX routing.
// - Phase 1 (HTTP-only cookies + CSRF) will replace this approach entirely.

import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const authPresent = req.cookies.get('modora_auth_present')?.value === '1';
  const userRole = req.cookies.get('modora_user_role')?.value ?? '';

  // ── Protect /admin/* ─────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!authPresent) {
      // Not logged in at all — redirect to home (modal will open from Navbar)
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
      // Logged in but not admin — redirect to customer dashboard
      return NextResponse.redirect(new URL('/account/dashboard', req.url));
    }
  }

  // ── Protect /account/* ───────────────────────────────────────────────────
  if (pathname.startsWith('/account')) {
    if (!authPresent) {
      // Not logged in — redirect to home (user can open auth modal from Navbar)
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on admin and account routes
  matcher: ['/admin/:path*', '/account/:path*'],
};
