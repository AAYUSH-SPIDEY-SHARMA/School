'use server';

import { updateTag } from 'next/cache';

import { type ActionResult, ok, toActionError } from '@/lib/actions/actionResult';
import { recordAudit } from '@/lib/audit/recordAudit';
import { NotFoundError, ValidationError } from '@/lib/auth/errors';
import { CONTENT_ROLES, requireAuth } from '@/lib/auth/guards';
import { CACHE_TAGS } from '@/lib/cache/tags';
import { db } from '@/lib/db/prisma';
import {
  documentSchema,
  documentUpdateSchema,
  idSchema,
} from '@/lib/validations/content';

/**
 * Document Server Actions.
 *
 * Downloadable forms, calendars, circulars and CBSE mandatory disclosures —
 * first-class content in the Indian school context (F-2).
 *
 * `fileSize` and `fileType` are copied from the MediaAsset rather than accepted
 * from the client. A client-supplied size would let a caller advertise a 4 MB
 * prospectus that is actually 40 MB, which matters to a parent deciding whether
 * to download it on mobile data.
 */

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function requireMediaAsset(mediaAssetId: string) {
  const asset = await db.mediaAsset.findFirst({
    where: { id: mediaAssetId, deletedAt: null },
    select: { id: true, fileSize: true, mimeType: true },
  });

  if (!asset) {
    throw new ValidationError(
      { mediaAssetId: ['Select a file to attach.'] },
      'The selected file could not be found.',
    );
  }

  return asset;
}

export async function createDocument(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = documentSchema.parse(input);

    const asset = await requireMediaAsset(data.mediaAssetId);
    const publishing = data.status === 'PUBLISHED';

    const document = await db.document.create({
      data: {
        title: data.title,
        description: emptyToNull(data.description),
        category: data.category,
        mediaAssetId: asset.id,
        fileSize: asset.fileSize,
        fileType: asset.mimeType,
        academicYear: emptyToNull(data.academicYear),
        displayOrder: data.displayOrder,
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
      entityType: 'Document',
      entityId: document.id,
      summary: `Created document "${data.title}"`,
    });

    updateTag(CACHE_TAGS.documents);

    return ok({ id: document.id });
  } catch (error) {
    return toActionError(error, 'createDocument');
  }
}

export async function updateDocument(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = documentUpdateSchema.parse(input);

    const existing = await db.document.findFirst({
      where: { id: data.id, deletedAt: null },
      select: { id: true, publishedAt: true },
    });

    if (!existing) throw new NotFoundError();

    const asset = await requireMediaAsset(data.mediaAssetId);
    const publishing = data.status === 'PUBLISHED';

    await db.document.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: emptyToNull(data.description),
        category: data.category,
        mediaAssetId: asset.id,
        fileSize: asset.fileSize,
        fileType: asset.mimeType,
        academicYear: emptyToNull(data.academicYear),
        displayOrder: data.displayOrder,
        status: data.status,
        publishedAt: publishing ? (existing.publishedAt ?? new Date()) : null,
      },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'Document',
      entityId: data.id,
      summary: `Updated document "${data.title}"`,
    });

    updateTag(CACHE_TAGS.documents);

    return ok({ id: data.id });
  } catch (error) {
    return toActionError(error, 'updateDocument');
  }
}

export async function deleteDocument(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = idSchema.parse(input);

    const existing = await db.document.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, title: true },
    });

    if (!existing) throw new NotFoundError();

    await db.document.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'DELETE',
      entityType: 'Document',
      entityId: id,
      summary: `Deleted document "${existing.title}"`,
    });

    updateTag(CACHE_TAGS.documents);

    return ok({ id });
  } catch (error) {
    return toActionError(error, 'deleteDocument');
  }
}
