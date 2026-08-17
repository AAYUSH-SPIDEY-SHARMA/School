import { NextResponse } from 'next/server';

import { CONTENT_ROLES, requireAuth } from '@/lib/auth/guards';
import { isAuthError } from '@/lib/auth/errors';
import { createUploadSignature } from '@/lib/media/cloudinary';
import { signUploadSchema } from '@/lib/validations/media';

/**
 * Signed upload credentials for Cloudinary.
 *
 * One of only five HTTP handlers in the whole application
 * (18_API_SPECIFICATION). It exists because the browser must talk to Cloudinary
 * directly — routing multi-megabyte originals through the application server
 * would be slow, expensive, and pointless when the file's destination is
 * elsewhere. That is doubly true under the full-quality policy, where files are
 * large by design.
 *
 * ⚠️ This endpoint hands out the ability to write into the school's Cloudinary
 * account, so it authorises exactly like a Server Action: authenticate, then
 * check the role, before signing anything. The API secret never leaves the
 * server; only a short-lived signature does.
 */
export async function POST(request: Request) {
  try {
    // Called for the authorisation, not for the identity — the upload itself is
    // audited when the asset is registered, so signing does not need its own
    // entry and would only add noise.
    await requireAuth(CONTENT_ROLES);

    const body = await request.json().catch(() => ({}));
    const { resourceType } = signUploadSchema.parse(body);

    const signed = createUploadSignature({ resourceType });

    return NextResponse.json(signed, {
      // A signature is single-use and time-bound; caching it anywhere would be
      // both useless and a small credential leak.
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json(
        { error: 'Not permitted.' },
        { status: error.code === 'UNAUTHENTICATED' ? 401 : 403 },
      );
    }

    console.error('[api/media/sign] failed', error);

    // Never leak internals to an unauthenticated caller.
    return NextResponse.json(
      { error: 'Could not prepare the upload.' },
      { status: 500 },
    );
  }
}
