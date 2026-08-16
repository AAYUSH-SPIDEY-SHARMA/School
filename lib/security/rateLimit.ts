import 'server-only';

import { db } from '@/lib/db/prisma';

/**
 * Rate limiting.
 *
 * Redis is explicitly rejected for this project (D-E, 12_TECH_STACK): it is one
 * more service the school must fund, understand and operate, for a site with
 * modest traffic. So limits are enforced with what already exists.
 *
 * Two layers, because neither is sufficient alone:
 *
 *  1. An in-process counter — instant, but per-instance, and lost on cold
 *     start. It absorbs a rapid burst hitting one warm instance.
 *  2. A durable count from `audit_logs` — survives cold starts and is shared
 *     across instances, at the cost of a query.
 *
 * ⚠️ Honest limitation: on a serverless platform this is NOT a strong global
 * limiter. An attacker distributing requests across cold instances and IP
 * addresses can exceed the nominal limit. It raises the cost of casual abuse
 * and spam, which is the actual threat here; it is not a defence against a
 * determined distributed attack. If evidence of that appears, the answer is a
 * platform-level control (WAF) and an ADR — not a Redis instance bolted on.
 *
 * Limits are deliberately forgiving. A shared household, school or office IP is
 * common, and blocking a real family from enquiring is a worse outcome than
 * letting a spam message through (15_BACKEND_ARCHITECTURE).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Stop the map growing without bound in a long-lived instance. */
function sweep(now: number): void {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * In-process fixed-window limiter.
 */
export function checkInMemoryLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return {
    allowed: true,
    remaining: limit - existing.count,
    retryAfterSeconds: 0,
  };
}

export const LOGIN_LIMIT = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

/**
 * Failed-login limiter, durable across instances.
 *
 * Counts `LOGIN_FAILED` entries for this IP in the window. Reusing the audit
 * log means no nineteenth entity is added to hold counters, and failed logins
 * are already required to be audited — so the record exists either way
 * (15_BACKEND_ARCHITECTURE).
 */
export async function checkLoginRateLimit(
  ipAddress: string | null,
): Promise<RateLimitResult> {
  // No usable IP means no key to limit on. Failing open here is deliberate:
  // failing closed would lock out every user whose IP header is missing.
  if (!ipAddress) {
    return { allowed: true, remaining: LOGIN_LIMIT, retryAfterSeconds: 0 };
  }

  const inMemory = checkInMemoryLimit(
    `login:${ipAddress}`,
    LOGIN_LIMIT,
    LOGIN_WINDOW_MS,
  );
  if (!inMemory.allowed) return inMemory;

  const since = new Date(Date.now() - LOGIN_WINDOW_MS);

  const failures = await db.auditLog.count({
    where: { action: 'LOGIN_FAILED', ipAddress, createdAt: { gte: since } },
  });

  if (failures >= LOGIN_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(LOGIN_WINDOW_MS / 1000),
    };
  }

  return {
    allowed: true,
    remaining: LOGIN_LIMIT - failures,
    retryAfterSeconds: 0,
  };
}

export const ENQUIRY_LIMIT = 3;
export const ENQUIRY_WINDOW_MS = 60 * 60 * 1000;

/**
 * Enquiry submission limiter — 3 per IP per hour (owner-approved).
 *
 * ⚠️ Uses only the in-process layer. The durable layer is deliberately NOT
 * used here, because the only way to make it durable would be to store the
 * submitter's IP address alongside their enquiry — attaching a network
 * identifier to a record that already contains a parent's and a child's
 * details, for the sake of spam counting. That trade is not worth it
 * (48_MEDIA_CONSENT_AND_CHILD_SAFETY, locked rule G).
 *
 * The honeypot and strict schema validation carry most of the anti-spam weight.
 * CAPTCHA is deliberately not used unless the documented threshold is reached
 * (owner decision).
 */
export function checkEnquiryRateLimit(
  ipAddress: string | null,
): RateLimitResult {
  if (!ipAddress) {
    return { allowed: true, remaining: ENQUIRY_LIMIT, retryAfterSeconds: 0 };
  }

  return checkInMemoryLimit(
    `enquiry:${ipAddress}`,
    ENQUIRY_LIMIT,
    ENQUIRY_WINDOW_MS,
  );
}

/** Media uploads — 20 per user per hour. Abuse containment. */
export function checkUploadRateLimit(userId: string): RateLimitResult {
  return checkInMemoryLimit(`upload:${userId}`, 20, 60 * 60 * 1000);
}

/** Test-only reset, so limiter state does not leak between test cases. */
export function __resetRateLimits(): void {
  buckets.clear();
}
