import type { NextAuthConfig } from 'next-auth';

/**
 * Adapter-free Auth.js configuration.
 *
 * ⚠️ This file must never import the database, the Prisma client, or anything
 * that transitively does. It is imported by `proxy.ts`, and pulling the ORM
 * into the request-interception boundary breaks it
 * (14_FRONTEND_ARCHITECTURE, 36_PROJECT_STRUCTURE).
 *
 * The full configuration — providers, session store, callbacks — lives in
 * `lib/auth/auth.ts`, which is only imported by Server Components and Server
 * Actions.
 *
 * ⚠️ What the proxy does with this is a ROUTE GATE, NOT A SECURITY BOUNDARY.
 * It can only observe that a cookie is present; it cannot tell whether the
 * session behind it is still valid, or what role it holds. Every Server Action
 * and admin page re-checks against the database
 * (19_AUTHORIZATION_AND_ROLES, locked rules C and D).
 */
export const authConfig = {
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },

  session: {
    /**
     * The cookie holds an opaque pointer; the authoritative session record is a
     * row in the database, validated on every request in `auth.ts`.
     *
     * `maxAge` here is the cookie's own lifetime and matches the session's
     * absolute cap. It is a backstop — the real expiry decision is made
     * server-side against the stored row, because a cookie lifetime is a
     * request the browser can decline to honour.
     */
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  // Providers are supplied in auth.ts. The Credentials provider needs the
  // database to verify a password, so it cannot live in this file.
  providers: [],

  trustHost: true,
} satisfies NextAuthConfig;
