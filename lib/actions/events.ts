'use server';

import { updateTag } from 'next/cache';

import { type ActionResult, ok, toActionError } from '@/lib/actions/actionResult';
import { recordAudit } from '@/lib/audit/recordAudit';
import { NotFoundError } from '@/lib/auth/errors';
import { CONTENT_ROLES, requireAuth } from '@/lib/auth/guards';
import { CACHE_TAGS, itemTag } from '@/lib/cache/tags';
import { db } from '@/lib/db/prisma';
import { slugHistoryCreateArgs } from '@/lib/queries/slugHistory';
import {
  eventSchema,
  eventUpdateSchema,
  idSchema,
} from '@/lib/validations/content';

/** Empty strings from HTML forms become NULL, not "". */
function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createEvent(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = eventSchema.parse(input);

    const publishing = data.status === 'PUBLISHED';

    const event = await db.event.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        venue: emptyToNull(data.venue),
        coverImageId: emptyToNull(data.coverImageId),
        isAcademicCalendar: data.isAcademicCalendar,
        status: data.status,
        publishedAt: publishing ? new Date() : null,
        seoTitle: emptyToNull(data.seoTitle),
        seoDescription: emptyToNull(data.seoDescription),
        createdById: user.id,
      },
      select: { id: true, slug: true },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'CREATE',
      entityType: 'Event',
      entityId: event.id,
      summary: `Created event "${data.title}"`,
    });

    updateTag(CACHE_TAGS.events);
    updateTag(itemTag(CACHE_TAGS.events, event.slug));

    return ok({ id: event.id });
  } catch (error) {
    return toActionError(error, 'createEvent');
  }
}

export async function updateEvent(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = eventUpdateSchema.parse(input);

    const existing = await db.event.findFirst({
      where: { id: data.id, deletedAt: null },
      select: { id: true, slug: true, publishedAt: true },
    });

    if (!existing) throw new NotFoundError();

    const slugChanged = existing.slug !== data.slug;
    const retireOldSlug = slugChanged && existing.publishedAt !== null;
    const publishing = data.status === 'PUBLISHED';

    const [event] = await db.$transaction([
      db.event.update({
        where: { id: data.id },
        data: {
          slug: data.slug,
          title: data.title,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate ?? null,
          venue: emptyToNull(data.venue),
          coverImageId: emptyToNull(data.coverImageId),
          isAcademicCalendar: data.isAcademicCalendar,
          status: data.status,
          publishedAt: publishing ? (existing.publishedAt ?? new Date()) : null,
          seoTitle: emptyToNull(data.seoTitle),
          seoDescription: emptyToNull(data.seoDescription),
        },
        select: { id: true, slug: true },
      }),
      ...(retireOldSlug
        ? [
            db.slugHistory.upsert(
              slugHistoryCreateArgs({
                entityType: 'events',
                entityId: data.id,
                oldSlug: existing.slug,
              }),
            ),
          ]
        : []),
    ]);

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'Event',
      entityId: event.id,
      summary: retireOldSlug
        ? `Updated event "${data.title}"; slug ${existing.slug} → ${data.slug} (301 recorded)`
        : `Updated event "${data.title}"`,
    });

    updateTag(CACHE_TAGS.events);
    updateTag(itemTag(CACHE_TAGS.events, event.slug));
    if (slugChanged) updateTag(itemTag(CACHE_TAGS.events, existing.slug));

    return ok({ id: event.id });
  } catch (error) {
    return toActionError(error, 'updateEvent');
  }
}

export async function publishEvent(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = idSchema.parse(input);

    const existing = await db.event.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, slug: true, title: true, publishedAt: true },
    });

    if (!existing) throw new NotFoundError();

    await db.event.update({
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
      entityType: 'Event',
      entityId: id,
      summary: `Published event "${existing.title}"`,
    });

    updateTag(CACHE_TAGS.events);
    updateTag(itemTag(CACHE_TAGS.events, existing.slug));

    return ok({ id });
  } catch (error) {
    return toActionError(error, 'publishEvent');
  }
}

/**
 * Soft delete.
 *
 * Past events are normally retained rather than deleted — an event archive is a
 * credibility signal and an SEO asset. Deletion exists for genuine mistakes.
 */
export async function deleteEvent(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = idSchema.parse(input);

    const existing = await db.event.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, slug: true, title: true },
    });

    if (!existing) throw new NotFoundError();

    await db.event.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'DELETE',
      entityType: 'Event',
      entityId: id,
      summary: `Deleted event "${existing.title}"`,
    });

    updateTag(CACHE_TAGS.events);
    updateTag(itemTag(CACHE_TAGS.events, existing.slug));

    return ok({ id });
  } catch (error) {
    return toActionError(error, 'deleteEvent');
  }
}
