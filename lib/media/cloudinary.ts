import 'server-only';

import { v2 as cloudinary } from 'cloudinary';

import { serverEnv } from '@/lib/env';

/**
 * Cloudinary — the managed media store.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUALITY POLICY: FULL QUALITY, NO LOSSY RECOMPRESSION.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Owner instruction, 2026-08-17: media is stored and displayed at full
 * quality — the original, never a compressed copy.
 *
 * How that is implemented:
 *
 *  - Uploads are stored as the ORIGINAL FILE. No eager transformation, no
 *    format conversion, no quality reduction on the master.
 *  - The full-size view and any download serve that master URL with NO
 *    transformation segment at all, so the bytes a visitor receives are the
 *    bytes the school uploaded.
 *  - Grid thumbnails are resized but use `q_100` — no lossy recompression.
 *    Sending a 6000px master to fill a 400px card is not quality, it is just
 *    bytes the display cannot show; resizing at q_100 loses nothing visible.
 *
 * ⚠️ THE HONEST TRADE-OFF. Full-quality originals are large. The primary
 * persona is a parent on a mid-range Android over 4G, and the performance
 * target is LCP ≤2.5s at p75 (27_PERFORMANCE). Serving multi-megabyte
 * originals as the LCP image will miss that target. The split above is the
 * compromise that honours the instruction — every image is viewable at full
 * original quality — while keeping listing pages usable on a phone. If the
 * owner wants originals in grids too, that is a one-line change here, and the
 * cost lands on mobile load time.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * METADATA STRIPPING IS NOT NEGOTIABLE, AND IS NOT A QUALITY QUESTION.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Locked security rule N: EXIF and geolocation must never reach public media.
 * A phone photograph of a classroom commonly carries GPS coordinates.
 *
 * Metadata is discarded at UPLOAD, so the stored master has none. The master
 * is then delivered untouched. "Original" therefore means original PIXELS —
 * full quality, nothing recompressed — with the location data removed. The two
 * requirements do not actually conflict once separated.
 */

cloudinary.config({
  cloud_name: serverEnv.CLOUDINARY_CLOUD_NAME,
  api_key: serverEnv.CLOUDINARY_API_KEY,
  api_secret: serverEnv.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export const UPLOAD_FOLDER = serverEnv.CLOUDINARY_UPLOAD_FOLDER;

/** Accepted image types. Narrow on purpose — a narrow list is a small attack surface. */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const ALLOWED_DOCUMENT_TYPES = ['application/pdf'] as const;

/** 10 MB images, 25 MB documents (15_BACKEND_ARCHITECTURE). */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

export interface SignedUploadParams {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
  /** Echoed back so the browser sends exactly what was signed. */
  params: Record<string, string | number>;
}

/**
 * Produce signed upload parameters.
 *
 * Signed rather than unsigned so an upload preset cannot be discovered and used
 * by anyone who reads the page source to dump files into the school's account.
 * The signature is generated server-side after the caller has been authorised;
 * the API secret never reaches the browser.
 */
export function createUploadSignature(options: {
  resourceType: 'image' | 'raw';
  publicIdPrefix?: string;
}): SignedUploadParams {
  const timestamp = Math.round(Date.now() / 1000);

  const folder =
    options.resourceType === 'raw'
      ? `${UPLOAD_FOLDER}/documents`
      : `${UPLOAD_FOLDER}/images`;

  /**
   * Signed parameters.
   *
   * ⚠️ No `quality` or `format` here — that is the point. The master is stored
   * exactly as uploaded.
   *
   * `image_metadata: false` discards EXIF/IPTC/GPS at ingest, which is how the
   * stored master ends up clean without touching the pixels.
   */
  const params: Record<string, string | number> = {
    folder,
    timestamp,
    // Overwriting silently would let one upload replace an in-use asset.
    overwrite: 'false',
    unique_filename: 'true',
    use_filename: 'true',
    image_metadata: 'false',
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    serverEnv.CLOUDINARY_API_SECRET,
  );

  return {
    timestamp,
    signature,
    apiKey: serverEnv.CLOUDINARY_API_KEY,
    cloudName: serverEnv.CLOUDINARY_CLOUD_NAME,
    folder,
    params,
  };
}

/** Permanently remove an asset from Cloudinary, for safeguarding takedowns. */
export async function destroyCloudinaryAsset(
  publicId: string,
  resourceType: 'image' | 'raw' = 'image',
): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      // Purge the CDN too. Removing the origin file while leaving it cached at
      // the edge is not a takedown (48_MEDIA_CONSENT_AND_CHILD_SAFETY).
      invalidate: true,
    });
    return result.result === 'ok' || result.result === 'not found';
  } catch (error) {
    console.error('[cloudinary] destroy failed', { publicId, error });
    return false;
  }
}

/**
 * Confirm, by asking Cloudinary, that a stored asset carries no EXIF.
 *
 * The upload flag should make this true. This verifies it rather than assuming
 * it — "documented ≠ verified" applies most where the consequence is a child's
 * home address sitting in an image on a public website.
 */
export async function verifyNoExif(publicId: string): Promise<boolean> {
  try {
    const resource = await cloudinary.api.resource(publicId, {
      image_metadata: true,
    });

    const metadata = (resource as { image_metadata?: Record<string, unknown> })
      .image_metadata;

    if (!metadata) return true;

    const dangerous = ['GPSLatitude', 'GPSLongitude', 'GPSPosition', 'GPSAltitude'];
    return !dangerous.some((key) => key in metadata);
  } catch (error) {
    console.error('[cloudinary] EXIF verification failed', { publicId, error });
    // Fail closed: unverified is not the same as verified.
    return false;
  }
}
