import 'server-only';

import { db } from '@/lib/db/prisma';
import type { SlugEntityType } from '@/lib/utils/slug';

/**
 * Resolve a retired slug to its current one.
 *
 * Called when a detail page would otherwise 404. If the slug is in
 * `slug_history`, the visitor is issued a permanent 301 to the current URL
 * instead of being shown a dead end.
 *
 * The URL they followed may have come from a parent WhatsApp group, a printed
 * circular or a Google result cached months ago. A 404 there loses both the
 * visitor and the accumulated ranking signal (NFR-028).
 *
 * Not resolved in `proxy.ts`: that boundary has no database access. It is
 * resolved in the route's not-found path, where the database is available.
 */
export async function resolveRetiredSlug(
  entityType: SlugEntityType,
  oldSlug: string,
): Promise<string | null> {
  const history = await db.slugHistory.findUnique({
    where: { entityType_oldSlug: { entityType, oldSlug } },
    select: { entityId: true },
  });

  if (!history) return null;

  // Look up the entity's CURRENT slug. Chained renames therefore resolve in one
  // hop — a → b → c sends a straight to c, rather than 301-ing to b and then
  // again to c, which wastes a round trip and dilutes the redirect signal.
  const current = await getCurrentSlug(entityType, history.entityId);

  // The entity may have been deleted since. A redirect to a deleted page would
  // be a 301 to a 404, which is worse than an honest 404.
  return current;
}

async function getCurrentSlug(
  entityType: SlugEntityType,
  entityId: string,
): Promise<string | null> {
  const select = { slug: true, deletedAt: true, status: true } as const;

  switch (entityType) {
    case 'news': {
      const row = await db.news.findUnique({ where: { id: entityId }, select });
      return row && !row.deletedAt && row.status === 'PUBLISHED' ? row.slug : null;
    }
    case 'events': {
      const row = await db.event.findUnique({ where: { id: entityId }, select });
      return row && !row.deletedAt && row.status === 'PUBLISHED' ? row.slug : null;
    }
    case 'gallery': {
      const row = await db.galleryAlbum.findUnique({
        where: { id: entityId },
        select,
      });
      return row && !row.deletedAt && row.status === 'PUBLISHED' ? row.slug : null;
    }
    case 'faculty': {
      const row = await db.faculty.findUnique({
        where: { id: entityId },
        select,
      });
      return row && !row.deletedAt && row.status === 'PUBLISHED' ? row.slug : null;
    }
  }
}

/**
 * Record a slug change.
 *
 * ⚠️ Must run inside the same transaction as the entity update. If the entity's
 * slug changes but this write fails, the old URL 404s permanently and there is
 * no record left of what it used to be.
 *
 * Only called for content that has been PUBLISHED — a draft's slug was never
 * public, so retiring it protects nothing and would just accumulate rows.
 */
export function slugHistoryCreateArgs(params: {
  entityType: SlugEntityType;
  entityId: string;
  oldSlug: string;
}) {
  return {
    where: {
      entityType_oldSlug: {
        entityType: params.entityType,
        oldSlug: params.oldSlug,
      },
    },
    update: { entityId: params.entityId },
    create: {
      entityType: params.entityType,
      entityId: params.entityId,
      oldSlug: params.oldSlug,
    },
  };
}
