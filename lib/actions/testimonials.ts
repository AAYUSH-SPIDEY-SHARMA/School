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
  testimonialSchema,
  testimonialUpdateSchema,
} from '@/lib/validations/content';

/**
 * Testimonial Server Actions.
 *
 * ⚠️ Testimonials must be REAL and ATTRIBUTABLE, with the author's permission.
 *
 * There is no technical control that can verify this — the system cannot tell a
 * genuine parent quote from an invented one. What it can do is record who
 * published it, which is why every create and update is audited by name
 * (CR-002).
 */

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createTestimonial(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = testimonialSchema.parse(input);

    const publishing = data.status === 'PUBLISHED';

    const testimonial = await db.testimonial.create({
      data: {
        quote: data.quote,
        authorName: data.authorName,
        authorType: data.authorType,
        authorDetail: emptyToNull(data.authorDetail),
        photoId: emptyToNull(data.photoId),
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
      entityType: 'Testimonial',
      entityId: testimonial.id,
      summary: `Created testimonial attributed to ${data.authorType.toLowerCase()}`,
    });

    updateTag(CACHE_TAGS.testimonials);

    return ok({ id: testimonial.id });
  } catch (error) {
    return toActionError(error, 'createTestimonial');
  }
}

export async function updateTestimonial(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = testimonialUpdateSchema.parse(input);

    const existing = await db.testimonial.findFirst({
      where: { id: data.id, deletedAt: null },
      select: { id: true, publishedAt: true },
    });

    if (!existing) throw new NotFoundError();

    const publishing = data.status === 'PUBLISHED';

    await db.testimonial.update({
      where: { id: data.id },
      data: {
        quote: data.quote,
        authorName: data.authorName,
        authorType: data.authorType,
        authorDetail: emptyToNull(data.authorDetail),
        photoId: emptyToNull(data.photoId),
        featured: data.featured,
        status: data.status,
        publishedAt: publishing ? (existing.publishedAt ?? new Date()) : null,
      },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'Testimonial',
      entityId: data.id,
      summary: 'Updated testimonial',
    });

    updateTag(CACHE_TAGS.testimonials);

    return ok({ id: data.id });
  } catch (error) {
    return toActionError(error, 'updateTestimonial');
  }
}

export async function deleteTestimonial(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = idSchema.parse(input);

    const existing = await db.testimonial.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existing) throw new NotFoundError();

    await db.testimonial.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'DELETE',
      entityType: 'Testimonial',
      entityId: id,
      summary: 'Deleted testimonial',
    });

    updateTag(CACHE_TAGS.testimonials);

    return ok({ id });
  } catch (error) {
    return toActionError(error, 'deleteTestimonial');
  }
}
