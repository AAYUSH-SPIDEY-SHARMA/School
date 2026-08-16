import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/lib/auth/auth.config';

/**
 * Request proxy.
 *
 * ⚠️ NAMED `proxy.ts`, NOT `middleware.ts` — required in the Next.js 16 line.
 *
 * It imports `auth.config.ts` (adapter-free) rather than `auth.ts`, because
 * pulling the database adapter into the request-interception boundary breaks
 * it (36_PROJECT_STRUCTURE).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THIS FILE IS NOT A SECURITY BOUNDARY.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * It can see that a session cookie exists. It cannot verify that the session
 * behind it is still valid, and it cannot see the user's role — those checks
 * need the database, which is unavailable here.
 *
 * More importantly, it gates ROUTES, while Server Actions are directly
 * invocable HTTP endpoints that do not require the caller to have visited the
 * corresponding page at all. Nothing here protects an action.
 *
 * Its job is to spare a signed-out visitor a pointless page render, and to
 * serve slug redirects. Real authorisation happens in `lib/auth/guards.ts`,
 * inside every action and admin page (locked security rules C and D).
 */

const { auth: withAuth } = NextAuth(authConfig);

export default withAuth((request) => {
  const { nextUrl } = request;
  const isSignedIn = Boolean(request.auth);

  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = nextUrl.pathname === '/admin/login';

  // Signed-in users have no reason to see the login page.
  if (isLoginRoute && isSignedIn) {
    return NextResponse.redirect(new URL('/admin', nextUrl));
  }

  if (isAdminRoute && !isLoginRoute && !isSignedIn) {
    const loginUrl = new URL('/admin/login', nextUrl);
    // Preserve the destination so the user lands where they intended after
    // signing in, rather than being dumped on the dashboard.
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  /**
   * Skip static assets and image optimisation — running auth on every image
   * request is pure latency.
   *
   * Slug-history 301s are NOT handled here: resolving an old slug requires a
   * database lookup, which this boundary cannot perform. They are served from
   * the dynamic route's `not-found` path instead, where the database is
   * available (see app/(public)/news/[slug]/page.tsx).
   */
  matcher: [
    '/((?!api/health|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2)$).*)',
  ],
};
