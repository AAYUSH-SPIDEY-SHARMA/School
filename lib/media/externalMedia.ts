/**
 * Google Drive and YouTube link handling.
 *
 * The school will not upload everything. A sports-day video can run to several
 * gigabytes, which is not something to push through an image CDN or pay to
 * store twice — and the school may already have the material in Drive or on
 * YouTube. So a pasted link is a first-class way to add media.
 *
 * ⚠️ WHAT THIS COSTS, STATED PLAINLY:
 *
 *  - We do NOT control these files. If someone changes the Drive sharing
 *    setting or deletes the video, it disappears from the site with no warning.
 *  - We CANNOT strip EXIF/GPS from a Drive image. `metadataStripped` therefore
 *    stays false for external assets, because claiming otherwise would be an
 *    unverified compliance statement (locked rule N, working rule 13).
 *  - A YouTube embed contacts a third party. It is loaded behind a click-to-play
 *    facade and via `youtube-nocookie.com`, so nothing is requested from Google
 *    until the visitor chooses to play (29_ANALYTICS, 27_PERFORMANCE).
 *
 * None of that makes external links wrong — it makes them a trade the school
 * should make knowingly, which is why the admin says so at the point of use.
 */

export type ExternalProvider = 'YOUTUBE' | 'GOOGLE_DRIVE';

export interface ParsedExternalMedia {
  provider: ExternalProvider;
  /** Provider-side identifier. */
  id: string;
  /** Canonical URL for display or embedding. */
  url: string;
  /** Poster image, where the provider offers one. */
  thumbnailUrl: string;
  /** Embed URL for an iframe, for video. */
  embedUrl: string;
  kind: 'IMAGE' | 'VIDEO';
}

/**
 * YouTube video id.
 *
 * Ids are exactly 11 characters from a restricted alphabet, which is specific
 * enough to validate rather than accepting whatever followed the slash.
 */
const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;

export function parseYouTube(input: string): ParsedExternalMedia | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, '');
  let id: string | null = null;

  if (host === 'youtu.be') {
    id = url.pathname.slice(1).split('/')[0] ?? null;
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') {
      id = url.searchParams.get('v');
    } else {
      // /embed/ID, /shorts/ID, /live/ID, /v/ID
      const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
      id = match?.[1] ?? null;
    }
  }

  if (!id || !YOUTUBE_ID.test(id)) return null;

  return {
    provider: 'YOUTUBE',
    id,
    url: `https://www.youtube.com/watch?v=${id}`,
    // maxresdefault is the highest YouTube offers. It does not exist for every
    // video, so the player facade falls back to hqdefault on error.
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    // -nocookie so nothing is stored on the visitor's device unless they play.
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
    kind: 'VIDEO',
  };
}

/** Drive ids are long opaque strings; this is a shape check, not a guarantee. */
const DRIVE_ID = /^[a-zA-Z0-9_-]{10,}$/;

export function parseGoogleDrive(
  input: string,
  kind: 'IMAGE' | 'VIDEO' = 'IMAGE',
): ParsedExternalMedia | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '');
  if (host !== 'drive.google.com' && host !== 'docs.google.com') return null;

  let id: string | null = null;

  // https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.pathname.match(/\/file\/d\/([^/?#]+)/);
  if (fileMatch) {
    id = fileMatch[1] ?? null;
  } else if (url.searchParams.has('id')) {
    // https://drive.google.com/open?id=FILE_ID  ·  /uc?id=FILE_ID
    id = url.searchParams.get('id');
  } else {
    // https://docs.google.com/document/d/ID/edit
    const docMatch = url.pathname.match(/\/d\/([^/?#]+)/);
    id = docMatch?.[1] ?? null;
  }

  if (!id || !DRIVE_ID.test(id)) return null;

  return {
    provider: 'GOOGLE_DRIVE',
    id,
    /**
     * `lh3.googleusercontent.com/d/ID` serves the file itself and, unlike the
     * older `uc?export=view` endpoint, does not bounce through an interstitial
     * for larger files.
     */
    url:
      kind === 'IMAGE'
        ? `https://lh3.googleusercontent.com/d/${id}`
        : `https://drive.google.com/file/d/${id}/view`,
    thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w1600`,
    embedUrl: `https://drive.google.com/file/d/${id}/preview`,
    kind,
  };
}

/**
 * Parse any supported link.
 *
 * Returns null rather than throwing, so the caller can show a specific message
 * instead of a stack trace.
 */
export function parseExternalMedia(
  input: string,
  hint: 'IMAGE' | 'VIDEO' = 'IMAGE',
): ParsedExternalMedia | null {
  return parseYouTube(input) ?? parseGoogleDrive(input, hint);
}

/**
 * Hosts an external media URL is permitted to come from.
 *
 * Used to keep `next.config.ts` `remotePatterns`, the render layer and the
 * validation layer in agreement. Adding a host in one place and not the others
 * produces an image that validates and then refuses to render.
 */
export const ALLOWED_MEDIA_HOSTS = [
  'res.cloudinary.com',
  'lh3.googleusercontent.com',
  'drive.google.com',
  'i.ytimg.com',
  'img.youtube.com',
] as const;

export function isAllowedMediaHost(rawUrl: string): boolean {
  try {
    const { hostname } = new URL(rawUrl);
    return (ALLOWED_MEDIA_HOSTS as readonly string[]).includes(hostname);
  } catch {
    return false;
  }
}

/**
 * Guidance shown in the admin when a Drive link is added.
 *
 * The overwhelmingly common failure is a Drive file left restricted: it works
 * for the person who pasted it, because they are signed in, and shows nothing
 * to every visitor. Saying so up front prevents most of those reports.
 */
export const DRIVE_SHARING_NOTE =
  'The Drive file must be shared as "Anyone with the link". If it is restricted it will look fine to you — because you are signed in — and be invisible to everyone else.';
