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
  idSchema,
  newsSchema,
  newsUpdateSchema,
} from '@/lib/validations/content';

/**
 * News Server Actions.
 *
 * ⚠️ EVERY ACTION IN THIS FILE IS A PUBLICLY INVOCABLE HTTP ENDPOINT.
 *
 * The framework compiles each one into a callable endpoint. Anyone can invoke
 * it directly, with arbitrary input, without ever loading the admin UI. The
 * hidden button and the proxy route gate protect nothing here.
 *
 * So each action follows the same five steps, in order, with no data access
 * before step 3 completes (15_BACKEND_ARCHITECTURE, locked rules C, D, E):
 *
 *   1. AUTHENTICATE   requireAuth() — who is this?
 *   2. AUTHORISE      requireAuth() — may they do this?
 *   3. VALIDATE       Zod — is the input well-formed?
 *   4. EXECUTE
 *   5. AUDIT + INVALIDATE
 *
 * Step 5 uses `updateTag`, not `revalidateTag`. That is read-your-writes: the
 * editor sees their change immediately. Without it they publish, see nothing,
 * and publish again — the friction that makes staff abandon a CMS and leaves
 * content to rot (ADR-0010, F-3).
 */

/** Empty strings from HTML forms become NULL, not "". */
function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createNews(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = newsSchema.parse(input);

    const publishing = data.status === 'PUBLISHED';

    const news = await db.news.create({
      data: {
        slug: data.slug,
        title: data.title,
        excerpt: emptyToNull(data.excerpt),
        body: data.body,
        coverImageId: emptyToNull(data.coverImageId),
        category: emptyToNull(data.category),
        featured: data.featured,
        authorName: emptyToNull(data.authorName),
        status: data.status,
        // The database CHECK requires a timestamp whenever status is
        // PUBLISHED, so it is set here rather than left to a later update.
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
      entityType: 'News',
      entityId: news.id,
      summary: `Created news "${data.title}"${publishing ? ' (published)' : ' (draft)'}`,
    });

    updateTag(CACHE_TAGS.news);
    updateTag(itemTag(CACHE_TAGS.news, news.slug));

    return ok({ id: news.id });
  } catch (error) {
    return toActionError(error, 'createNews');
  }
}

export async function updateNews(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = newsUpdateSchema.parse(input);

    const existing = await db.news.findFirst({
      where: { id: data.id, deletedAt: null },
      select: { id: true, slug: true, publishedAt: true },
    });

    if (!existing) throw new NotFoundError();

    const slugChanged = existing.slug !== data.slug;

    /**
     * A slug change on PUBLISHED content retires the old URL.
     *
     * Written inside a transaction with the update: if the slug changed but the
     * history write failed, the old URL would 404 permanently with no record of
     * what it used to be.
     *
     * Only for content that has actually been published — a draft's slug was
     * never public, so retiring it protects nothing and just accumulates rows.
     */
    const retireOldSlug = slugChanged && existing.publishedAt !== null;

    const publishing = data.status === 'PUBLISHED';

    const [news] = await db.$transaction([
      db.news.update({
        where: { id: data.id },
        data: {
          slug: data.slug,
          title: data.title,
          excerpt: emptyToNull(data.excerpt),
          body: data.body,
          coverImageId: emptyToNull(data.coverImageId),
          category: emptyToNull(data.category),
          featured: data.featured,
          authorName: emptyToNull(data.authorName),
          status: data.status,
          // Preserve the original publication date across edits — an edit is
          // not a republication, and resetting it would reorder the listing.
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
                entityType: 'news',
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
      entityType: 'News',
      entityId: news.id,
      summary: retireOldSlug
        ? `Updated news "${data.title}"; slug ${existing.slug} → ${data.slug} (301 recorded)`
        : `Updated news "${data.title}"`,
    });

    updateTag(CACHE_TAGS.news);
    updateTag(itemTag(CACHE_TAGS.news, news.slug));
    if (slugChanged) updateTag(itemTag(CACHE_TAGS.news, existing.slug));

    return ok({ id: news.id });
  } catch (error) {
    return toActionError(error, 'updateNews');
  }
}

export async function publishNews(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return setNewsPublished(input, true);
}

export async function unpublishNews(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return setNewsPublished(input, false);
}

async function setNewsPublished(
  input: unknown,
  publish: boolean,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = idSchema.parse(input);

    const existing = await db.news.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, slug: true, title: true, publishedAt: true },
    });

    if (!existing) throw new NotFoundError();

    const news = await db.news.update({
      where: { id },
      data: {
        status: publish ? 'PUBLISHED' : 'DRAFT',
        publishedAt: publish ? (existing.publishedAt ?? new Date()) : null,
      },
      select: { id: true, slug: true },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: publish ? 'PUBLISH' : 'UNPUBLISH',
      entityType: 'News',
      entityId: news.id,
      summary: `${publish ? 'Published' : 'Unpublished'} news "${existing.title}"`,
    });

    updateTag(CACHE_TAGS.news);
    updateTag(itemTag(CACHE_TAGS.news, news.slug));

    return ok({ id: news.id });
  } catch (error) {
    return toActionError(error, 'setNewsPublished');
  }
}

/**
 * Soft delete.
 *
 * Content is soft-deleted so an accidental removal does not require a database
 * restore. The row stays, `deletedAt` is set, and every public query already
 * filters it out (locked rule L).
 *
 * The partial unique index on `slug` is scoped to live rows, so deleting an
 * article releases its slug for reuse rather than reserving it permanently.
 */
export async function deleteNews(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = idSchema.parse(input);

    const existing = await db.news.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, slug: true, title: true },
    });

    if (!existing) throw new NotFoundError();

    await db.news.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'DELETE',
      entityType: 'News',
      entityId: id,
      summary: `Deleted news "${existing.title}"`,
    });

    updateTag(CACHE_TAGS.news);
    updateTag(itemTag(CACHE_TAGS.news, existing.slug));

    return ok({ id });
  } catch (error) {
    return toActionError(error, 'deleteNews');
  }
}
