import 'server-only';

import { headers } from 'next/headers';

import type { AuditAction } from '@prisma/client';

import { db } from '@/lib/db/prisma';

/**
 * Audit logging.
 *
 * Locked security rule K: audit privileged mutations.
 *
 * ⚠️ AUDIT ENTRIES MUST NEVER CONTAIN ENQUIRY PII.
 *
 * An entry records *that* enquiry `abc123` moved to `CONTACTED` by user `u_4`.
 * It must never record the parent's name, phone number, email address or
 * message. Otherwise the audit log quietly becomes a second copy of the most
 * sensitive data in the system — one that is retained longer and protected
 * less, and that nobody thinks to include in a deletion request.
 *
 * `summary` is the field where this goes wrong, so it is documented at every
 * call site that touches enquiries.
 */

export interface AuditInput {
  actorId: string | null;
  actorEmail: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  /** ⚠️ Human-readable, and MUST NOT contain personal data. */
  summary?: string;
  ipAddress?: string | null;
}

/**
 * Best-effort client IP.
 *
 * Behind Vercel, `x-forwarded-for` is a comma-separated chain and the first
 * entry is the client. The value is attacker-controllable in general, so it is
 * treated as a diagnostic hint, never as an identity or an authorisation input.
 */
export async function getClientIp(): Promise<string | null> {
  try {
    const headerList = await headers();
    const forwarded = headerList.get('x-forwarded-for');
    if (forwarded) {
      const first = forwarded.split(',')[0]?.trim();
      if (first) return first;
    }
    return headerList.get('x-real-ip');
  } catch {
    // `headers()` is unavailable outside a request scope (seed scripts, tests).
    return null;
  }
}

/**
 * Write an audit entry.
 *
 * Never throws. An audit write failing must not roll back a mutation that has
 * already succeeded — losing the log entry is bad, but telling the user their
 * successful publish failed is worse, and would leave the UI disagreeing with
 * the database. Failures are reported to the server log instead.
 */
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    const ipAddress = input.ipAddress ?? (await getClientIp());

    await db.auditLog.create({
      data: {
        actorId: input.actorId,
        actorEmail: input.actorEmail,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        summary: input.summary ?? null,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('[audit] failed to record audit entry', {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      error,
    });
  }
}

/**
 * Record a denied authorisation attempt.
 *
 * A wrong-role call to a Server Action is a security event, not a UI mishap —
 * Server Actions are directly invocable HTTP endpoints, so this may be someone
 * probing rather than a mis-rendered button. Repeated denials from one account
 * indicate either a permissions bug or an account behaving unexpectedly, and
 * both are worth knowing (19_AUTHORIZATION_AND_ROLES).
 */
export async function recordDeniedAccess(params: {
  actorId: string | null;
  actorEmail: string;
  attempted: string;
}): Promise<void> {
  await recordAudit({
    actorId: params.actorId,
    actorEmail: params.actorEmail,
    action: 'STATUS_CHANGE',
    entityType: 'Authorization',
    entityId: params.attempted,
    summary: `Denied: ${params.attempted}`,
  });
}
