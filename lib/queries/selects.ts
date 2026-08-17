import 'server-only';

import type { Prisma } from '@prisma/client';

/**
 * Shared `select` fragments.
 *
 * Every query selects explicit fields. `findMany` with no `select` returns
 * every column, which on `User` means the argon2 hash travels into a React
 * payload — the exact accident that turns a template mistake into a credential
 * leak (15_BACKEND_ARCHITECTURE rule 3).
 *
 * Defining the shapes once also means a new column is opt-in rather than
 * automatically public.
 */

/**
 * ⚠️ THE ONLY User shape that may leave the server.
 *
 * `passwordHash` is absent by construction, not by remembering to omit it.
 */
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
} as const satisfies Prisma.UserSelect;

/** Author byline on admin listings — no email, no role. */
export const authorSelect = {
  id: true,
  name: true,
} as const satisfies Prisma.UserSelect;

/**
 * Media as rendered publicly.
 *
 * `width` and `height` are always selected: without intrinsic dimensions the
 * browser cannot reserve space and the page shifts as images load, which is a
 * direct CLS failure (NFR-005).
 *
 * `consentBasis` is deliberately NOT selected. It is an internal safeguarding
 * record and has no business travelling to a public page
 * (48_MEDIA_CONSENT_AND_CHILD_SAFETY).
 */
export const publicMediaSelect = {
  id: true,
  url: true,
  publicId: true,
  altText: true,
  caption: true,
  width: true,
  height: true,
  // Needed to decide how to render: a Cloudinary image, a Drive image, or a
  // YouTube video behind a click-to-play facade.
  source: true,
  kind: true,
  externalId: true,
  thumbnailUrl: true,
} as const satisfies Prisma.MediaAssetSelect;

/** Media in the admin library, where consent state must be visible. */
export const adminMediaSelect = {
  ...publicMediaSelect,
  fileName: true,
  mimeType: true,
  fileSize: true,
  containsMinors: true,
  consentBasis: true,
  metadataStripped: true,
  uploadedById: true,
  createdAt: true,
} as const satisfies Prisma.MediaAssetSelect;

/**
 * The filter every public read must apply.
 *
 * Published, and not soft-deleted. Applied IN THE QUERY, never in the UI — a
 * draft that reaches the client inside a hidden element has still leaked
 * (19_AUTHORIZATION_AND_ROLES layer 4, locked rule L).
 */
export const publishedOnly = {
  status: 'PUBLISHED',
  deletedAt: null,
} as const;

/** Live rows regardless of publication state, for admin listings. */
export const notDeleted = { deletedAt: null } as const;
