'use server';

import { type ActionResult, ok, toActionError } from '@/lib/actions/actionResult';
import { recordAudit } from '@/lib/audit/recordAudit';
import { ValidationError } from '@/lib/auth/errors';
import { ADMIN_ONLY, requireAuth } from '@/lib/auth/guards';
import { hashPassword } from '@/lib/auth/password';
import { revokeAllSessionsForUser } from '@/lib/auth/sessionStore';
import { db } from '@/lib/db/prisma';
import {
  createUserSchema,
  resetPasswordSchema,
  updateUserSchema,
} from '@/lib/validations/auth';

/**
 * User administration — SUPER_ADMIN only.
 *
 * There is NO PUBLIC REGISTRATION. Accounts are created here by an
 * administrator, and no self-service signup or password-reset flow exists in
 * v1: email-based account recovery is a meaningful attack surface to maintain
 * for a handful of staff accounts (19_AUTHORIZATION_AND_ROLES).
 *
 * ⚠️ Accounts are DEACTIVATED, NEVER DELETED. Deleting a user would orphan
 * their audit trail, which defeats the purpose of having one.
 */

/**
 * Refuse to remove the last usable administrator.
 *
 * Without this check, one careless deactivation or role change locks everyone
 * out of the admin permanently — there is no public registration and no
 * self-service recovery to climb back in with. Recovery would mean a manual
 * database edit against production.
 */
async function assertNotLastSuperAdmin(userId: string): Promise<void> {
  const remaining = await db.user.count({
    where: { role: 'SUPER_ADMIN', isActive: true, id: { not: userId } },
  });

  if (remaining === 0) {
    throw new ValidationError(
      { role: ['This is the only active administrator.'] },
      'You cannot remove the last active administrator — the admin area would become unreachable.',
    );
  }
}

export async function createUser(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requireAuth(ADMIN_ONLY);
    const data = createUserSchema.parse(input);

    const existing = await db.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existing) {
      throw new ValidationError({
        email: ['An account with this email already exists.'],
      });
    }

    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: await hashPassword(data.password),
        role: data.role,
        isActive: true,
      },
      select: { id: true, email: true },
    });

    await recordAudit({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'CREATE',
      entityType: 'User',
      entityId: user.id,
      summary: `Created ${data.role} account for ${data.email}`,
    });

    return ok({ id: user.id });
  } catch (error) {
    return toActionError(error, 'createUser');
  }
}

export async function updateUser(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requireAuth(ADMIN_ONLY);
    const data = updateUserSchema.parse(input);

    const existing = await db.user.findUnique({
      where: { id: data.id },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!existing) {
      throw new ValidationError({ id: ['Account not found.'] });
    }

    const losingAdmin =
      existing.role === 'SUPER_ADMIN' &&
      (data.role !== 'SUPER_ADMIN' || !data.isActive);

    if (losingAdmin) {
      await assertNotLastSuperAdmin(existing.id);
    }

    const roleChanged = existing.role !== data.role;
    const deactivated = existing.isActive && !data.isActive;

    await db.user.update({
      where: { id: data.id },
      data: { name: data.name, role: data.role, isActive: data.isActive },
    });

    /**
     * A role change or deactivation must take effect IMMEDIATELY, not whenever
     * a token happens to expire. This is the entire reason sessions live in the
     * database (ADR-0011, locked rule J).
     *
     * Revoking on role change also closes a subtler hole: a demoted user whose
     * session still carried the old role would keep the old permissions until
     * they signed out.
     */
    if (roleChanged || deactivated) {
      await revokeAllSessionsForUser(data.id);
    }

    if (roleChanged) {
      await recordAudit({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'ROLE_CHANGE',
        entityType: 'User',
        entityId: data.id,
        summary: `Role changed ${existing.role} → ${data.role} for ${existing.email}`,
      });
    }

    if (deactivated) {
      await recordAudit({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'STATUS_CHANGE',
        entityType: 'User',
        entityId: data.id,
        summary: `Deactivated ${existing.email}; active sessions revoked`,
      });
    }

    if (!roleChanged && !deactivated) {
      await recordAudit({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'UPDATE',
        entityType: 'User',
        entityId: data.id,
        summary: `Updated account ${existing.email}`,
      });
    }

    return ok({ id: data.id });
  } catch (error) {
    return toActionError(error, 'updateUser');
  }
}

export async function deactivateUser(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requireAuth(ADMIN_ONLY);
    const data = updateUserSchema.pick({ id: true }).parse(input);

    const existing = await db.user.findUnique({
      where: { id: data.id },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!existing) {
      throw new ValidationError({ id: ['Account not found.'] });
    }

    if (existing.role === 'SUPER_ADMIN') {
      await assertNotLastSuperAdmin(existing.id);
    }

    await db.user.update({
      where: { id: data.id },
      data: { isActive: false },
    });

    await revokeAllSessionsForUser(data.id);

    await recordAudit({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'STATUS_CHANGE',
      entityType: 'User',
      entityId: data.id,
      summary: `Deactivated ${existing.email}; active sessions revoked`,
    });

    return ok({ id: data.id });
  } catch (error) {
    return toActionError(error, 'deactivateUser');
  }
}

/**
 * Administrator-initiated password reset.
 *
 * Self-service reset is FUTURE. Every existing session for the account is
 * revoked, because the usual reason for a reset is that the old credential may
 * be compromised — leaving live sessions running would defeat the point.
 */
export async function resetPassword(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requireAuth(ADMIN_ONLY);
    const data = resetPasswordSchema.parse(input);

    const existing = await db.user.findUnique({
      where: { id: data.id },
      select: { id: true, email: true },
    });

    if (!existing) {
      throw new ValidationError({ id: ['Account not found.'] });
    }

    await db.user.update({
      where: { id: data.id },
      data: { passwordHash: await hashPassword(data.password) },
    });

    await revokeAllSessionsForUser(data.id);

    await recordAudit({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'UPDATE',
      entityType: 'User',
      entityId: data.id,
      // ⚠️ Never log the password, not even its length.
      summary: `Password reset for ${existing.email}; active sessions revoked`,
    });

    return ok({ id: data.id });
  } catch (error) {
    return toActionError(error, 'resetPassword');
  }
}
