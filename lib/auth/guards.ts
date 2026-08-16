import 'server-only';

import type { Role } from '@prisma/client';

import { auth } from '@/lib/auth/auth';
import { ForbiddenError, UnauthenticatedError } from '@/lib/auth/errors';
import { recordDeniedAccess } from '@/lib/audit/recordAudit';

/**
 * Authorisation guards — LAYER 3, THE SECURITY BOUNDARY.
 *
 * Four layers exist, and only this one is security
 * (19_AUTHORIZATION_AND_ROLES):
 *
 *   Layer 1  UI              hides what the user cannot do   UX only
 *   Layer 2  proxy.ts        session cookie present          convenience only
 *   Layer 3  these guards    role check on every mutation    ← THE boundary
 *   Layer 4  query layer     scope data to the role          defence in depth
 *
 * ⚠️ THE REASON THIS MATTERS:
 *
 * The framework compiles every Server Action into a callable HTTP endpoint.
 * Anyone can invoke it directly, with arbitrary input, WITHOUT EVER VISITING
 * THE CORRESPONDING PAGE. An attacker holding a valid ADMISSIONS_MANAGER
 * session can call `deleteNews` directly if only the route were protected.
 *
 * Therefore every Server Action calls `requireSession()` and `requireRole()`
 * itself, before touching any data. Hiding the button is courtesy; this is
 * protection. (Locked security rules C and D.)
 */

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  sessionId: string;
}

/**
 * Assert a valid session, returning the authenticated user.
 *
 * Every call reaches the database through the session store, so a deactivated
 * or revoked account fails here rather than continuing on a stale token.
 */
export async function requireSession(): Promise<AuthenticatedUser> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthenticatedError();
  }

  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name ?? '',
    role: session.user.role,
    sessionId: session.user.sessionId,
  };
}

/**
 * Assert the user holds one of the allowed roles.
 *
 * A denial is recorded as a security event: a wrong-role call may be a
 * mis-rendered button, or it may be someone probing a directly invocable
 * endpoint, and the two are indistinguishable at the call site.
 */
export async function requireRole(
  user: AuthenticatedUser,
  allowed: readonly Role[],
): Promise<void> {
  if (!allowed.includes(user.role)) {
    await recordDeniedAccess({
      actorId: user.id,
      actorEmail: user.email,
      attempted: `role ${user.role} attempted an action requiring ${allowed.join(' or ')}`,
    });
    throw new ForbiddenError();
  }
}

/**
 * The common case: authenticate and authorise in one call.
 *
 * Provided because two separate calls invite the failure where someone adds
 * `requireSession` and forgets `requireRole`, which reads as authorised code
 * while being wide open to any signed-in staff member.
 */
export async function requireAuth(
  allowed: readonly Role[],
): Promise<AuthenticatedUser> {
  const user = await requireSession();
  await requireRole(user, allowed);
  return user;
}

/* ── Named role sets ────────────────────────────────────────────────────────
 *
 * Named rather than inlined so the permission matrix in
 * 19_AUTHORIZATION_AND_ROLES has exactly one representation in code. Inlined
 * arrays drift: one action gets a role added and thirty others do not.
 */

/**
 * Create, edit, publish and delete content.
 *
 * Typed as `readonly Role[]` rather than a narrow tuple so these sets can also
 * be used with `.includes(user.role)` for render decisions. A literal tuple
 * would reject any `Role` not already in it, which is the opposite of what a
 * membership test needs.
 */
export const CONTENT_ROLES: readonly Role[] = ['SUPER_ADMIN', 'EDITOR'];

/**
 * Enquiry access — parent and child personal data.
 *
 * ⚠️ EDITOR IS ABSENT AND MUST STAY ABSENT. A teacher publishing a sports
 * report has no reason to see a parent's phone number. This is the one role
 * boundary in the system that earns its complexity, and it is a hard invariant.
 */
export const ENQUIRY_ROLES: readonly Role[] = [
  'SUPER_ADMIN',
  'ADMISSIONS_MANAGER',
];

/**
 * Settings, users, facilities, audit log.
 *
 * ⚠️ Facilities are administered through Settings and are SUPER_ADMIN only
 * (D-B23). Granting EDITOR facility rights would create a permission with no
 * route to exercise it — and "fixing" that by widening Settings access to
 * EDITOR would hand content editors global site configuration. Do neither.
 */
export const ADMIN_ONLY: readonly Role[] = ['SUPER_ADMIN'];

/** Every signed-in staff member. Use only for genuinely shared surfaces. */
export const ANY_STAFF: readonly Role[] = [
  'SUPER_ADMIN',
  'EDITOR',
  'ADMISSIONS_MANAGER',
];

/**
 * Non-throwing check, for deciding what to render.
 *
 * ⚠️ FOR UI ONLY. Never gate a mutation on this — it is layer 1.
 */
export function can(
  user: Pick<AuthenticatedUser, 'role'> | null | undefined,
  allowed: readonly Role[],
): boolean {
  return user ? allowed.includes(user.role) : false;
}

/** The current user, or null. For pages that render differently when signed in. */
export async function getOptionalUser(): Promise<AuthenticatedUser | null> {
  try {
    return await requireSession();
  } catch {
    return null;
  }
}
