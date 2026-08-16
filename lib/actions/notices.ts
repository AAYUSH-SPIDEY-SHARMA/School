'use server';

import { updateTag } from 'next/cache';

import { type ActionResult, ok, toActionError } from '@/lib/actions/actionResult';
import { recordAudit } from '@/lib/audit/recordAudit';
import { NotFoundError } from '@/lib/auth/errors';
import { CONTENT_ROLES, requireAuth } from '@/lib/auth/guards';
import { CACHE_TAGS } from '@/lib/cache/tags';
import { db } from '@/lib/db/prisma';
import {
  idSchema,
  noticeSchema,
  noticeUpdateSchema,
} from '@/lib/validations/content';

/**
 * Notice Server Actions.
 *
 * Notices have NO SLUG and no slug history: they are consumed in a list rather
 * than deep-linked, and generating permanent URLs for ephemeral operational
 * content is how a site accumulates dead pages.
 *
 * Expiry is the feature that matters here. Reference research found a
 * recruitment notice from August 2020 still live in August 2026 (F-3) — expiry
 * plus query-time filtering means that cannot happen even if nobody ever
 * remembers to unpublish anything.
 */

export async function createNotice(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = noticeSchema.parse(input);

    const publishing = data.status === 'PUBLISHED';

    const notice = await db.notice.create({
      data: {
        title: data.title,
        body: data.body,
        category: data.category,
        attachmentId: data.attachmentId?.trim() || null,
        pinned: data.pinned,
        expiresAt: data.expiresAt ?? null,
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
      entityType: 'Notice',
      entityId: notice.id,
      summary: `Created notice "${data.title}"${data.expiresAt ? ` (expires ${data.expiresAt.toISOString().slice(0, 10)})` : ' (no expiry set)'}`,
    });

    updateTag(CACHE_TAGS.notices);

    return ok({ id: notice.id });
  } catch (error) {
    return toActionError(error, 'createNotice');
  }
}

export async function updateNotice(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = noticeUpdateSchema.parse(input);

    const existing = await db.notice.findFirst({
      where: { id: data.id, deletedAt: null },
      select: { id: true, publishedAt: true },
    });

    if (!existing) throw new NotFoundError();

    const publishing = data.status === 'PUBLISHED';

    await db.notice.update({
      where: { id: data.id },
      data: {
        title: data.title,
        body: data.body,
        category: data.category,
        attachmentId: data.attachmentId?.trim() || null,
        pinned: data.pinned,
        expiresAt: data.expiresAt ?? null,
        status: data.status,
        publishedAt: publishing ? (existing.publishedAt ?? new Date()) : null,
      },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'Notice',
      entityId: data.id,
      summary: `Updated notice "${data.title}"`,
    });

    updateTag(CACHE_TAGS.notices);

    return ok({ id: data.id });
  } catch (error) {
    return toActionError(error, 'updateNotice');
  }
}

export async function publishNotice(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = idSchema.parse(input);

    const existing = await db.notice.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, title: true, publishedAt: true },
    });

    if (!existing) throw new NotFoundError();

    await db.notice.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: existing.publishedAt ?? new Date(),
      },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'PUBLISH',
      entityType: 'Notice',
      entityId: id,
      summary: `Published notice "${existing.title}"`,
    });

    updateTag(CACHE_TAGS.notices);

    return ok({ id });
  } catch (error) {
    return toActionError(error, 'publishNotice');
  }
}

/**
 * Expire a notice immediately.
 *
 * Distinct from unpublishing: expiry is the notice's natural end of life and
 * keeps it in the archive with an honest date, whereas unpublishing implies it
 * was published in error. Staff reach for different words for these, so the
 * system offers both.
 */
export async function expireNotice(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = idSchema.parse(input);

    const existing = await db.notice.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, title: true },
    });

    if (!existing) throw new NotFoundError();

    await db.notice.update({
      where: { id },
      data: { expiresAt: new Date() },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'STATUS_CHANGE',
      entityType: 'Notice',
      entityId: id,
      summary: `Expired notice "${existing.title}"`,
    });

    updateTag(CACHE_TAGS.notices);

    return ok({ id });
  } catch (error) {
    return toActionError(error, 'expireNotice');
  }
}

export async function deleteNotice(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = idSchema.parse(input);

    const existing = await db.notice.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, title: true },
    });

    if (!existing) throw new NotFoundError();

    await db.notice.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'DELETE',
      entityType: 'Notice',
      entityId: id,
      summary: `Deleted notice "${existing.title}"`,
    });

    updateTag(CACHE_TAGS.notices);

    return ok({ id });
  } catch (error) {
    return toActionError(error, 'deleteNotice');
  }
}
