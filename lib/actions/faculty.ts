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
  facultySchema,
  facultyUpdateSchema,
  idSchema,
} from '@/lib/validations/content';

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createFaculty(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = facultySchema.parse(input);

    const publishing = data.status === 'PUBLISHED';

    const faculty = await db.faculty.create({
      data: {
        slug: data.slug,
        name: data.name,
        designation: data.designation,
        qualification: emptyToNull(data.qualification),
        experienceYears: data.experienceYears ?? null,
        bio: emptyToNull(data.bio),
        photoId: emptyToNull(data.photoId),
        departmentId: emptyToNull(data.departmentId),
        isLeadership: data.isLeadership,
        displayOrder: data.displayOrder,
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
      entityType: 'Faculty',
      entityId: faculty.id,
      summary: `Created faculty profile "${data.name}"`,
    });

    updateTag(CACHE_TAGS.faculty);
    updateTag(itemTag(CACHE_TAGS.faculty, faculty.slug));

    return ok({ id: faculty.id });
  } catch (error) {
    return toActionError(error, 'createFaculty');
  }
}

export async function updateFaculty(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = facultyUpdateSchema.parse(input);

    const existing = await db.faculty.findFirst({
      where: { id: data.id, deletedAt: null },
      select: { id: true, slug: true, publishedAt: true },
    });

    if (!existing) throw new NotFoundError();

    const slugChanged = existing.slug !== data.slug;
    const retireOldSlug = slugChanged && existing.publishedAt !== null;
    const publishing = data.status === 'PUBLISHED';

    const [faculty] = await db.$transaction([
      db.faculty.update({
        where: { id: data.id },
        data: {
          slug: data.slug,
          name: data.name,
          designation: data.designation,
          qualification: emptyToNull(data.qualification),
          experienceYears: data.experienceYears ?? null,
          bio: emptyToNull(data.bio),
          photoId: emptyToNull(data.photoId),
          departmentId: emptyToNull(data.departmentId),
          isLeadership: data.isLeadership,
          displayOrder: data.displayOrder,
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
                entityType: 'faculty',
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
      entityType: 'Faculty',
      entityId: faculty.id,
      summary: retireOldSlug
        ? `Updated faculty "${data.name}"; slug ${existing.slug} → ${data.slug} (301 recorded)`
        : `Updated faculty "${data.name}"`,
    });

    updateTag(CACHE_TAGS.faculty);
    updateTag(itemTag(CACHE_TAGS.faculty, faculty.slug));
    if (slugChanged) updateTag(itemTag(CACHE_TAGS.faculty, existing.slug));

    return ok({ id: faculty.id });
  } catch (error) {
    return toActionError(error, 'updateFaculty');
  }
}

/**
 * Soft delete a faculty profile.
 *
 * A departing teacher's profile is removed from the site, but the row is
 * retained: their name may appear in audit entries and in news articles, and a
 * hard delete would orphan those references.
 */
export async function deleteFaculty(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = idSchema.parse(input);

    const existing = await db.faculty.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, slug: true, name: true },
    });

    if (!existing) throw new NotFoundError();

    await db.faculty.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'DELETE',
      entityType: 'Faculty',
      entityId: id,
      summary: `Removed faculty profile "${existing.name}"`,
    });

    updateTag(CACHE_TAGS.faculty);
    updateTag(itemTag(CACHE_TAGS.faculty, existing.slug));

    return ok({ id });
  } catch (error) {
    return toActionError(error, 'deleteFaculty');
  }
}
