'use server';

import { updateTag } from 'next/cache';
import { z } from 'zod';

import { type ActionResult, ok, toActionError } from '@/lib/actions/actionResult';
import { recordAudit } from '@/lib/audit/recordAudit';
import { NotFoundError, ValidationError } from '@/lib/auth/errors';
import { CONTENT_ROLES, requireAuth } from '@/lib/auth/guards';
import { CACHE_TAGS, itemTag } from '@/lib/cache/tags';
import { db } from '@/lib/db/prisma';
import { slugHistoryCreateArgs } from '@/lib/queries/slugHistory';
import {
  albumImagesSchema,
  albumSchema,
  albumUpdateSchema,
  idSchema,
} from '@/lib/validations/content';

/**
 * Gallery Server Actions.
 *
 * ⚠️ THE GALLERY IS THE PART OF THIS SITE THAT CONTAINS CHILDREN.
 *
 * Publishing an album is therefore gated on two things no other content type
 * requires (48_MEDIA_CONSENT_AND_CHILD_SAFETY, locked rules M and N):
 *
 *   1. Every image must have ALT TEXT (AR-009)
 *   2. Every image marked `containsMinors` must have a recorded CONSENT BASIS
 *
 * The system cannot verify that consent was genuinely obtained — it has no
 * student records and no exclusion list. It can only ensure the question was
 * asked, the answer recorded, and the responsible person identifiable
 * afterwards. That is a deliberate friction point, not an oversight: it is the
 * only control that actually causes someone to pause over an exclusion-list
 * child.
 */

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Block publication of an album whose images are not ready.
 *
 * Runs before the write, so a half-compliant album is never briefly live.
 */
async function assertAlbumPublishable(albumId: string): Promise<void> {
  const images = await db.galleryImage.findMany({
    where: { albumId },
    select: {
      mediaAsset: {
        select: {
          id: true,
          fileName: true,
          altText: true,
          containsMinors: true,
          consentBasis: true,
        },
      },
    },
  });

  const missingAlt = images
    .filter((image) => !image.mediaAsset.altText?.trim())
    .map((image) => image.mediaAsset.fileName);

  const missingConsent = images
    .filter(
      (image) =>
        image.mediaAsset.containsMinors &&
        !image.mediaAsset.consentBasis?.trim(),
    )
    .map((image) => image.mediaAsset.fileName);

  const fieldErrors: Record<string, string[]> = {};

  if (missingAlt.length > 0) {
    fieldErrors.images = [
      `Alt text is required before publishing. Missing on: ${missingAlt.join(', ')}`,
    ];
  }

  if (missingConsent.length > 0) {
    (fieldErrors.images ??= []).push(
      `These images are marked as containing children but have no recorded consent basis: ${missingConsent.join(', ')}. Record the basis before publishing.`,
    );
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new ValidationError(fieldErrors, 'This album is not ready to publish.');
  }
}

export async function createAlbum(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = albumSchema.parse(input);

    // A new album has no images yet, so it cannot be created already published.
    const status = data.status === 'PUBLISHED' ? 'DRAFT' : data.status;

    const album = await db.galleryAlbum.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: emptyToNull(data.description),
        category: data.category,
        eventDate: data.eventDate ?? null,
        coverImageId: emptyToNull(data.coverImageId),
        status,
        publishedAt: null,
        createdById: user.id,
      },
      select: { id: true, slug: true },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'CREATE',
      entityType: 'GalleryAlbum',
      entityId: album.id,
      summary: `Created album "${data.title}"`,
    });

    updateTag(CACHE_TAGS.gallery);

    return ok({ id: album.id });
  } catch (error) {
    return toActionError(error, 'createAlbum');
  }
}

export async function updateAlbum(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = albumUpdateSchema.parse(input);

    const existing = await db.galleryAlbum.findFirst({
      where: { id: data.id, deletedAt: null },
      select: { id: true, slug: true, publishedAt: true },
    });

    if (!existing) throw new NotFoundError();

    if (data.status === 'PUBLISHED') {
      await assertAlbumPublishable(data.id);
    }

    const slugChanged = existing.slug !== data.slug;
    const retireOldSlug = slugChanged && existing.publishedAt !== null;
    const publishing = data.status === 'PUBLISHED';

    const [album] = await db.$transaction([
      db.galleryAlbum.update({
        where: { id: data.id },
        data: {
          slug: data.slug,
          title: data.title,
          description: emptyToNull(data.description),
          category: data.category,
          eventDate: data.eventDate ?? null,
          coverImageId: emptyToNull(data.coverImageId),
          status: data.status,
          publishedAt: publishing ? (existing.publishedAt ?? new Date()) : null,
        },
        select: { id: true, slug: true },
      }),
      ...(retireOldSlug
        ? [
            db.slugHistory.upsert(
              slugHistoryCreateArgs({
                entityType: 'gallery',
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
      entityType: 'GalleryAlbum',
      entityId: album.id,
      summary: `Updated album "${data.title}"`,
    });

    updateTag(CACHE_TAGS.gallery);
    updateTag(itemTag(CACHE_TAGS.gallery, album.slug));
    if (slugChanged) updateTag(itemTag(CACHE_TAGS.gallery, existing.slug));

    return ok({ id: album.id });
  } catch (error) {
    return toActionError(error, 'updateAlbum');
  }
}

export async function publishAlbum(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = idSchema.parse(input);

    const existing = await db.galleryAlbum.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, slug: true, title: true, publishedAt: true },
    });

    if (!existing) throw new NotFoundError();

    // Checked here too, not only in updateAlbum — this action is separately
    // invocable, and a check that exists on only one path is not a check.
    await assertAlbumPublishable(id);

    await db.galleryAlbum.update({
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
      entityType: 'GalleryAlbum',
      entityId: id,
      summary: `Published album "${existing.title}"`,
    });

    updateTag(CACHE_TAGS.gallery);
    updateTag(itemTag(CACHE_TAGS.gallery, existing.slug));

    return ok({ id });
  } catch (error) {
    return toActionError(error, 'publishAlbum');
  }
}

export async function addImagesToAlbum(
  input: unknown,
): Promise<ActionResult<{ added: number }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = albumImagesSchema.parse(input);

    const album = await db.galleryAlbum.findFirst({
      where: { id: data.albumId, deletedAt: null },
      select: { id: true, slug: true, title: true },
    });

    if (!album) throw new NotFoundError();

    const highest = await db.galleryImage.findFirst({
      where: { albumId: data.albumId },
      select: { displayOrder: true },
      orderBy: { displayOrder: 'desc' },
    });

    let order = (highest?.displayOrder ?? -1) + 1;

    const result = await db.galleryImage.createMany({
      data: data.mediaAssetIds.map((mediaAssetId) => ({
        albumId: data.albumId,
        mediaAssetId,
        displayOrder: order++,
      })),
      // The (albumId, mediaAssetId) unique constraint makes re-adding the same
      // image a no-op rather than an error the editor has to decipher.
      skipDuplicates: true,
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'GalleryAlbum',
      entityId: album.id,
      summary: `Added ${result.count} image(s) to album "${album.title}"`,
    });

    updateTag(CACHE_TAGS.gallery);
    updateTag(itemTag(CACHE_TAGS.gallery, album.slug));

    return ok({ added: result.count });
  } catch (error) {
    return toActionError(error, 'addImagesToAlbum');
  }
}

export async function removeImageFromAlbum(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = idSchema.parse(input);

    const image = await db.galleryImage.findUnique({
      where: { id },
      select: { id: true, album: { select: { id: true, slug: true, title: true } } },
    });

    if (!image) throw new NotFoundError();

    // Removes the image from the album; the MediaAsset itself is untouched and
    // may still be in use elsewhere.
    await db.galleryImage.delete({ where: { id } });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'GalleryAlbum',
      entityId: image.album.id,
      summary: `Removed an image from album "${image.album.title}"`,
    });

    updateTag(CACHE_TAGS.gallery);
    updateTag(itemTag(CACHE_TAGS.gallery, image.album.slug));

    return ok({ id });
  } catch (error) {
    return toActionError(error, 'removeImageFromAlbum');
  }
}

const reorderSchema = z.object({
  albumId: z.string().min(1),
  imageIds: z.array(z.string().min(1)).max(500),
});

export async function reorderAlbumImages(
  input: unknown,
): Promise<ActionResult<{ count: number }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = reorderSchema.parse(input);

    const album = await db.galleryAlbum.findFirst({
      where: { id: data.albumId, deletedAt: null },
      select: { id: true, slug: true, title: true },
    });

    if (!album) throw new NotFoundError();

    // Scoped to this album, so a crafted payload cannot reorder someone else's
    // images by passing ids that belong to a different album.
    await db.$transaction(
      data.imageIds.map((imageId, index) =>
        db.galleryImage.updateMany({
          where: { id: imageId, albumId: data.albumId },
          data: { displayOrder: index },
        }),
      ),
    );

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'GalleryAlbum',
      entityId: album.id,
      summary: `Reordered images in album "${album.title}"`,
    });

    updateTag(CACHE_TAGS.gallery);
    updateTag(itemTag(CACHE_TAGS.gallery, album.slug));

    return ok({ count: data.imageIds.length });
  } catch (error) {
    return toActionError(error, 'reorderAlbumImages');
  }
}

export async function deleteAlbum(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = idSchema.parse(input);

    const existing = await db.galleryAlbum.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, slug: true, title: true },
    });

    if (!existing) throw new NotFoundError();

    await db.galleryAlbum.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'DELETE',
      entityType: 'GalleryAlbum',
      entityId: id,
      summary: `Deleted album "${existing.title}"`,
    });

    updateTag(CACHE_TAGS.gallery);
    updateTag(itemTag(CACHE_TAGS.gallery, existing.slug));

    return ok({ id });
  } catch (error) {
    return toActionError(error, 'deleteAlbum');
  }
}
