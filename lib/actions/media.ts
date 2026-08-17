'use server';

import { updateTag } from 'next/cache';

import { type ActionResult, ok, toActionError } from '@/lib/actions/actionResult';
import { recordAudit } from '@/lib/audit/recordAudit';
import { NotFoundError, ValidationError } from '@/lib/auth/errors';
import { ADMIN_ONLY, CONTENT_ROLES, requireAuth } from '@/lib/auth/guards';
import { CACHE_TAGS } from '@/lib/cache/tags';
import { db } from '@/lib/db/prisma';
import { destroyCloudinaryAsset, verifyNoExif } from '@/lib/media/cloudinary';
import { parseExternalMedia } from '@/lib/media/externalMedia';
import { checkUploadRateLimit } from '@/lib/security/rateLimit';
import {
  cloudinaryAssetSchema,
  deleteMediaSchema,
  externalMediaSchema,
  updateMediaSchema,
} from '@/lib/validations/media';

/**
 * Media actions.
 *
 * ⚠️ This is the part of the system that handles photographs of children.
 * See BLUEPRINT/48_MEDIA_CONSENT_AND_CHILD_SAFETY.md.
 */

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Record an asset the browser has just uploaded to Cloudinary.
 *
 * The upload itself goes browser → Cloudinary directly, using a signature this
 * server produced. That keeps multi-megabyte originals off the application
 * server entirely, which matters when the quality policy means files are large.
 *
 * EXIF removal is then VERIFIED against Cloudinary rather than assumed. The
 * upload flag should have handled it; this checks. "Documented ≠ verified"
 * applies hardest where the failure mode is a child's home address embedded in
 * a public image.
 */
export async function registerCloudinaryAsset(
  input: unknown,
): Promise<ActionResult<{ id: string; metadataStripped: boolean }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);

    const limit = checkUploadRateLimit(user.id);
    if (!limit.allowed) {
      throw new ValidationError(
        { _form: ['Too many uploads in a short time. Please wait a moment.'] },
        'Upload limit reached.',
      );
    }

    const data = cloudinaryAssetSchema.parse(input);

    const metadataStripped = await verifyNoExif(data.publicId);

    const asset = await db.mediaAsset.create({
      data: {
        source: 'CLOUDINARY',
        kind: data.mimeType.startsWith('image/') ? 'IMAGE' : 'DOCUMENT',
        url: data.url,
        publicId: data.publicId,
        fileName: data.fileName,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        width: data.width ?? null,
        height: data.height ?? null,
        altText: emptyToNull(data.altText),
        caption: emptyToNull(data.caption),
        containsMinors: data.containsMinors,
        consentBasis: emptyToNull(data.consentBasis),
        metadataStripped,
        uploadedById: user.id,
      },
      select: { id: true },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'CREATE',
      entityType: 'MediaAsset',
      entityId: asset.id,
      summary: `Uploaded ${data.fileName}${data.containsMinors ? ' (contains children)' : ''}${metadataStripped ? '' : ' — ⚠ EXIF NOT VERIFIED'}`,
    });

    if (!metadataStripped) {
      // Loud, because the alternative is a GPS-tagged photograph of a
      // classroom sitting on a public website.
      console.error('[media] EXIF could not be verified as stripped', {
        publicId: data.publicId,
      });
    }

    updateTag(CACHE_TAGS.gallery);

    return ok({ id: asset.id, metadataStripped });
  } catch (error) {
    return toActionError(error, 'registerCloudinaryAsset');
  }
}

/**
 * Add a Google Drive or YouTube link as media.
 *
 * ⚠️ `metadataStripped` is FALSE for these, always. We did not process the
 * file and cannot claim its EXIF was removed. Recording `true` here would be an
 * unverified compliance claim, which working rule 13 forbids — and the admin UI
 * says as much where the link is added.
 */
export async function addExternalMedia(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = externalMediaSchema.parse(input);

    const parsed = parseExternalMedia(data.externalUrl, data.kind);

    if (!parsed) {
      throw new ValidationError({
        externalUrl: ['That link was not recognised.'],
      });
    }

    const asset = await db.mediaAsset.create({
      data: {
        source: parsed.provider === 'YOUTUBE' ? 'YOUTUBE' : 'GOOGLE_DRIVE',
        kind: parsed.kind,
        url: parsed.url,
        publicId: null,
        externalUrl: data.externalUrl,
        externalId: parsed.id,
        thumbnailUrl: parsed.thumbnailUrl,
        fileName: data.title,
        mimeType: parsed.kind === 'VIDEO' ? 'video/external' : 'image/external',
        fileSize: 0,
        altText: emptyToNull(data.altText),
        caption: emptyToNull(data.caption),
        containsMinors: data.containsMinors,
        consentBasis: emptyToNull(data.consentBasis),
        // Not ours to strip, so not ours to claim.
        metadataStripped: false,
        uploadedById: user.id,
      },
      select: { id: true },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'CREATE',
      entityType: 'MediaAsset',
      entityId: asset.id,
      summary: `Linked ${parsed.provider} media "${data.title}"${data.containsMinors ? ' (contains children)' : ''}`,
    });

    updateTag(CACHE_TAGS.gallery);

    return ok({ id: asset.id });
  } catch (error) {
    return toActionError(error, 'addExternalMedia');
  }
}

export async function updateMediaMetadata(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = updateMediaSchema.parse(input);

    const existing = await db.mediaAsset.findFirst({
      where: { id: data.id, deletedAt: null },
      select: { id: true, fileName: true, containsMinors: true },
    });

    if (!existing) throw new NotFoundError();

    // Marking an asset as containing children without recording why is exactly
    // the gap the consent field exists to close.
    if (data.containsMinors && !data.consentBasis?.trim()) {
      throw new ValidationError({
        consentBasis: [
          'Record the consent basis for images containing children — for example "Admission media consent 2026-27; exclusion list checked".',
        ],
      });
    }

    await db.mediaAsset.update({
      where: { id: data.id },
      data: {
        altText: emptyToNull(data.altText),
        caption: emptyToNull(data.caption),
        containsMinors: data.containsMinors,
        consentBasis: emptyToNull(data.consentBasis),
      },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'MediaAsset',
      entityId: data.id,
      summary: `Updated media details for ${existing.fileName}`,
    });

    updateTag(CACHE_TAGS.gallery);

    return ok({ id: data.id });
  } catch (error) {
    return toActionError(error, 'updateMediaMetadata');
  }
}

/**
 * Remove media.
 *
 * Two distinct operations, deliberately:
 *
 *  - **Soft delete** (default, EDITOR+): hides the asset. Recoverable, because
 *    an accidental removal should not need a database restore.
 *
 *  - **Takedown** (SUPER_ADMIN only): deletes from Cloudinary AND purges the
 *    CDN. This is the safeguarding path, and it must not wait on a 30-day
 *    soft-delete window. Removing the origin file while leaving it cached at
 *    the edge is not a takedown.
 *
 * ⚠️ A takedown removes the image. It does NOT undo distribution — anything
 * already copied or indexed elsewhere is beyond reach. That is why the consent
 * controls sit before publication, not after.
 */
export async function deleteMedia(
  input: unknown,
): Promise<ActionResult<{ id: string; purged: boolean }>> {
  try {
    const data = deleteMediaSchema.parse(input);

    const user = data.takedown
      ? await requireAuth(ADMIN_ONLY)
      : await requireAuth(CONTENT_ROLES);

    const existing = await db.mediaAsset.findFirst({
      where: { id: data.id, deletedAt: null },
      select: {
        id: true,
        fileName: true,
        publicId: true,
        source: true,
        mimeType: true,
        uploadedById: true,
      },
    });

    if (!existing) throw new NotFoundError();

    /**
     * EDITOR may delete only their own uploads, so one editor cannot remove
     * another's in-use image (19_AUTHORIZATION_AND_ROLES).
     */
    if (
      user.role === 'EDITOR' &&
      existing.uploadedById !== user.id
    ) {
      throw new ValidationError(
        { _form: ['You can only remove media you uploaded.'] },
        'You can only remove media you uploaded.',
      );
    }

    let purged = false;

    if (data.takedown && existing.source === 'CLOUDINARY' && existing.publicId) {
      purged = await destroyCloudinaryAsset(
        existing.publicId,
        existing.mimeType.startsWith('image/') ? 'image' : 'raw',
      );
    }

    if (data.takedown) {
      await db.mediaAsset.delete({ where: { id: data.id } });
    } else {
      await db.mediaAsset.update({
        where: { id: data.id },
        data: { deletedAt: new Date() },
      });
    }

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'DELETE',
      entityType: 'MediaAsset',
      entityId: data.id,
      summary: data.takedown
        ? `TAKEDOWN of ${existing.fileName}${purged ? ' (purged from provider and CDN)' : ' (provider purge FAILED — check manually)'}`
        : `Removed ${existing.fileName}`,
    });

    if (data.takedown && !purged && existing.source === 'CLOUDINARY') {
      console.error('[media] takedown could not purge the provider copy', {
        publicId: existing.publicId,
      });
    }

    updateTag(CACHE_TAGS.gallery);

    return ok({ id: data.id, purged });
  } catch (error) {
    return toActionError(error, 'deleteMedia');
  }
}
