'use server';

import { updateTag } from 'next/cache';

import { type ActionResult, ok, toActionError } from '@/lib/actions/actionResult';
import { recordAudit } from '@/lib/audit/recordAudit';
import { NotFoundError } from '@/lib/auth/errors';
import { CONTENT_ROLES, requireAuth } from '@/lib/auth/guards';
import { CACHE_TAGS } from '@/lib/cache/tags';
import { db } from '@/lib/db/prisma';
import {
  achievementSchema,
  achievementUpdateSchema,
  idSchema,
} from '@/lib/validations/content';

/**
 * Achievement Server Actions.
 *
 * ⚠️ `achieverName` may identify a child, and naming a student publicly
 * requires consent specific to that recognition
 * (48_MEDIA_CONSENT_AND_CHILD_SAFETY).
 *
 * The audit summary deliberately records the achievement title only, never the
 * achiever's name — otherwise the audit log accumulates a second, less
 * protected list of named children.
 */

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createAchievement(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = achievementSchema.parse(input);

    const publishing = data.status === 'PUBLISHED';

    const achievement = await db.achievement.create({
      data: {
        title: data.title,
        description: emptyToNull(data.description),
        type: data.type,
        achieverName: emptyToNull(data.achieverName),
        level: emptyToNull(data.level),
        achievedOn: data.achievedOn,
        imageId: emptyToNull(data.imageId),
        featured: data.featured,
        status: data.status,
        publishedAt: publishing ? new Date() : null,
        createdById: user.id,
      },
      select: { id: true },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'CREATE',
      entityType: 'Achievement',
      entityId: achievement.id,
      summary: `Created achievement "${data.title}"`,
    });

    updateTag(CACHE_TAGS.achievements);

    return ok({ id: achievement.id });
  } catch (error) {
    return toActionError(error, 'createAchievement');
  }
}

export async function updateAchievement(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = achievementUpdateSchema.parse(input);

    const existing = await db.achievement.findFirst({
      where: { id: data.id, deletedAt: null },
      select: { id: true, publishedAt: true },
    });

    if (!existing) throw new NotFoundError();

    const publishing = data.status === 'PUBLISHED';

    await db.achievement.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: emptyToNull(data.description),
        type: data.type,
        achieverName: emptyToNull(data.achieverName),
        level: emptyToNull(data.level),
        achievedOn: data.achievedOn,
        imageId: emptyToNull(data.imageId),
        featured: data.featured,
        status: data.status,
        publishedAt: publishing ? (existing.publishedAt ?? new Date()) : null,
      },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'Achievement',
      entityId: data.id,
      summary: `Updated achievement "${data.title}"`,
    });

    updateTag(CACHE_TAGS.achievements);

    return ok({ id: data.id });
  } catch (error) {
    return toActionError(error, 'updateAchievement');
  }
}

export async function deleteAchievement(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = idSchema.parse(input);

    const existing = await db.achievement.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, title: true },
    });

    if (!existing) throw new NotFoundError();

    await db.achievement.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'DELETE',
      entityType: 'Achievement',
      entityId: id,
      summary: `Deleted achievement "${existing.title}"`,
    });

    updateTag(CACHE_TAGS.achievements);

    return ok({ id });
  } catch (error) {
    return toActionError(error, 'deleteAchievement');
  }
}
