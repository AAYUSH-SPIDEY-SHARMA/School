import 'server-only';

import { randomBytes } from 'node:crypto';

import type { Role } from '@prisma/client';

import { db } from '@/lib/db/prisma';

/**
 * Database-backed session store.
 *
 * The session cookie carries only an opaque identifier. The authoritative
 * session state is the `sessions` row, which is why revocation is immediate:
 * deleting the row, deactivating the user, or changing their role all take
 * effect on the very next request rather than whenever a token expires
 * (ADR-0004, ADR-0011, 19_AUTHORIZATION_AND_ROLES).
 *
 * Two independent lifetimes, both enforced here:
 *   idle      8 hours  — slides with activity
 *   absolute 24 hours  — never extends, no matter how active the user is
 *
 * The absolute cap is the one that matters after a laptop is stolen: without
 * it, a session kept warm by activity never ends.
 */

const IDLE_TIMEOUT_MS = 8 * 60 * 60 * 1000;
const ABSOLUTE_LIFETIME_MS = 24 * 60 * 60 * 1000;

/**
 * Only slide the idle expiry if it has drifted by more than this. Writing on
 * every request would mean a database write per page view for no benefit.
 */
const SLIDE_THRESHOLD_MS = 5 * 60 * 1000;

export interface ActiveSession {
  sessionId: string;
  userId: string;
  email: string;
  name: string;
  role: Role;
  expires: Date;
}

export async function createSession(userId: string): Promise<string> {
  const now = Date.now();

  const session = await db.session.create({
    data: {
      // 32 bytes from the CSPRNG. Not a UUID: v4 UUIDs carry version and
      // variant bits, so they hold ~122 bits of entropy rather than 256.
      sessionToken: randomBytes(32).toString('base64url'),
      userId,
      expires: new Date(now + IDLE_TIMEOUT_MS),
      absoluteExpiry: new Date(now + ABSOLUTE_LIFETIME_MS),
    },
    select: { id: true },
  });

  return session.id;
}

/**
 * Validate a session and slide its idle expiry.
 *
 * Returns `null` for every failure mode, deliberately without distinguishing
 * them to the caller — expired, revoked, deactivated and never-existed all mean
 * "not signed in".
 *
 * Any invalid session is deleted rather than left to accumulate.
 */
export async function validateAndTouchSession(
  sessionId: string,
): Promise<ActiveSession | null> {
  const session = await db.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      expires: true,
      absoluteExpiry: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          sessionsValidFrom: true,
        },
      },
    },
  });

  if (!session) return null;

  const now = new Date();
  const { user } = session;

  const idleExpired = session.expires <= now;
  const absoluteExpired = session.absoluteExpiry <= now;

  // A deactivated account's live session must stop working at once — this is
  // the entire reason sessions live in the database rather than in a token.
  const accountDisabled = !user.isActive;

  // Bumped on deactivation, role change and password reset. Any session issued
  // at or before that instant is revoked.
  const revoked = user.sessionsValidFrom > session.createdAt;

  if (idleExpired || absoluteExpired || accountDisabled || revoked) {
    await db.session
      .delete({ where: { id: session.id } })
      .catch(() => undefined); // Already gone is a fine outcome.
    return null;
  }

  // Slide the idle window, capped by the absolute lifetime.
  const proposed = new Date(now.getTime() + IDLE_TIMEOUT_MS);
  const nextExpiry =
    proposed > session.absoluteExpiry ? session.absoluteExpiry : proposed;

  if (nextExpiry.getTime() - session.expires.getTime() > SLIDE_THRESHOLD_MS) {
    await db.session
      .update({ where: { id: session.id }, data: { expires: nextExpiry } })
      .catch(() => undefined);
  }

  return {
    sessionId: session.id,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    expires: nextExpiry,
  };
}

/** Sign out — removes the single session behind the current cookie. */
export async function destroySession(sessionId: string): Promise<void> {
  await db.session.delete({ where: { id: sessionId } }).catch(() => undefined);
}

/**
 * Revoke every session belonging to a user.
 *
 * Called on deactivation, role change and password reset. `sessionsValidFrom`
 * is bumped as well as the rows deleted, so a session created in a race with
 * this call is still rejected on its next request.
 */
export async function revokeAllSessionsForUser(userId: string): Promise<void> {
  await db.$transaction([
    db.session.deleteMany({ where: { userId } }),
    db.user.update({
      where: { id: userId },
      data: { sessionsValidFrom: new Date() },
    }),
  ]);
}

/**
 * Housekeeping: drop sessions that are already dead.
 *
 * Expired rows are rejected on read regardless, so this is tidiness rather
 * than a security control. Invoked from the health endpoint rather than a cron
 * job — v1 runs no background workers (15_BACKEND_ARCHITECTURE).
 */
export async function purgeExpiredSessions(): Promise<number> {
  const now = new Date();
  const { count } = await db.session.deleteMany({
    where: {
      OR: [{ expires: { lte: now } }, { absoluteExpiry: { lte: now } }],
    },
  });
  return count;
}
