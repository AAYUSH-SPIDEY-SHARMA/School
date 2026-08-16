import 'server-only';

import { redirect } from 'next/navigation';

import { type AuthenticatedUser, getOptionalUser } from '@/lib/auth/guards';

/**
 * Page-level guards.
 *
 * Separate from the action guards because pages and actions need different
 * failure behaviour: an unauthenticated *page* request should send the visitor
 * to the login form, whereas an unauthenticated *action* call should return an
 * error result. Redirecting an action would produce a confusing partial
 * navigation.
 *
 * ⚠️ THESE ARE NOT THE SECURITY BOUNDARY EITHER.
 *
 * Gating a page stops someone browsing to it. It does nothing about the Server
 * Actions that page would have called, which remain directly invocable without
 * ever loading the page. Every action re-checks for itself
 * (19_AUTHORIZATION_AND_ROLES layer 3). This is defence in depth and decent UX
 * — not the lock.
 *
 * ── On not using `forbidden()` ───────────────────────────────────────────────
 *
 * Next.js exports `forbidden()`, but it still requires the experimental
 * `authInterrupts` flag in the 16 line. This project does not build required
 * behaviour on experimental flags — `experimental.ppr` was removed from the
 * framework between the blueprint being written and implementation starting,
 * which is exactly the cost of doing so. Role denial therefore renders an
 * explicit `<AccessDenied />` instead, using only stable APIs.
 */

/** Redirects to the login form when there is no valid session. */
export async function requirePageSession(
  callbackUrl?: string,
): Promise<AuthenticatedUser> {
  const user = await getOptionalUser();

  if (!user) {
    const target = callbackUrl
      ? `/admin/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : '/admin/login';
    redirect(target);
  }

  return user;
}
