import { clientEnv } from '@/lib/env';

/**
 * Media display URLs.
 *
 * Pure functions with no server dependency, so client components can build the
 * same URLs the server does.
 *
 * ── The quality rule, expressed here ────────────────────────────────────────
 *
 *   `originalUrl()`  → NO transformation segment at all. The bytes returned are
 *                      the bytes the school uploaded. Used for the full-size
 *                      view, the lightbox and any download.
 *
 *   `sizedUrl()`     → `q_100` plus a width. Resized, never recompressed
 *                      lossily. Used for grid thumbnails, where sending a
 *                      6000px master to fill a 400px card would be bytes the
 *                      display cannot show.
 *
 * There is deliberately no `q_auto` and no `f_auto` anywhere in this file.
 */

const CLOUD_NAME = clientEnv.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export interface MediaAssetLike {
  source: 'CLOUDINARY' | 'GOOGLE_DRIVE' | 'YOUTUBE' | 'EXTERNAL';
  kind: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  url: string;
  publicId?: string | null;
  externalId?: string | null;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
}

/**
 * The untouched master.
 *
 * No transformation segment, so Cloudinary returns the stored original.
 */
export function originalUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`;
}

/**
 * A width-constrained variant at full quality.
 *
 * `q_100` = no lossy recompression. `c_limit` never upscales, so a small
 * original is served at its own size rather than being stretched.
 * `fl_progressive` renders top-to-bottom rather than appearing all at once,
 * which matters on a slow connection.
 */
export function sizedUrl(publicId: string, width: number): string {
  const transform = `q_100,c_limit,w_${width},fl_progressive`;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transform}/${publicId}`;
}

/** Widths offered to the browser via `srcset`. */
export const RESPONSIVE_WIDTHS = [360, 480, 640, 828, 1080, 1440, 1920, 2560] as const;

export function buildSrcSet(publicId: string): string {
  return RESPONSIVE_WIDTHS.map(
    (width) => `${sizedUrl(publicId, width)} ${width}w`,
  ).join(', ');
}

/**
 * The URL to display an asset, whatever its source.
 *
 * `full` asks for the untouched original; otherwise a sized variant is used
 * where the provider supports one.
 */
export function displayUrl(
  asset: MediaAssetLike,
  options: { width?: number; full?: boolean } = {},
): string {
  if (asset.source === 'CLOUDINARY' && asset.publicId) {
    if (options.full || !options.width) return originalUrl(asset.publicId);
    return sizedUrl(asset.publicId, options.width);
  }

  // Drive and YouTube are served by their own hosts; we cannot resize them and
  // do not try to.
  return asset.url;
}

/** Poster image for a card or grid tile. */
export function thumbnailUrl(asset: MediaAssetLike, width = 640): string {
  if (asset.source === 'CLOUDINARY' && asset.publicId) {
    return sizedUrl(asset.publicId, width);
  }
  return asset.thumbnailUrl ?? asset.url;
}

/** YouTube poster fallback — `maxresdefault` does not exist for every video. */
export function youtubeFallbackThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * A human-readable file size.
 *
 * Shown BEFORE a download link is tapped. A parent on metered mobile data
 * deciding whether to fetch a prospectus needs that number in advance.
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
