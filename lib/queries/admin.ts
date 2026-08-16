import 'server-only';

import type { ContentStatus, Prisma } from '@prisma/client';

import { ENQUIRY_ROLES, requireAuth } from '@/lib/auth/guards';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { PAGE_SIZE } from '@/lib/constants/site';
import { db } from '@/lib/db/prisma';
import { authorSelect } from '@/lib/queries/selects';

/**
 * Admin reads.
 *
 * ⚠️ NONE OF THESE ARE CACHED. The admin must always show current state — a
 * cached listing that omits the article an editor just saved is the exact
 * friction that makes staff stop trusting a CMS.
 *
 * ⚠️ These queries return DRAFTS and SOFT-DELETED rows, which public queries
 * never do. They are therefore authorised at the query itself, not merely at
 * the page: a query that returns unpublished content must not be callable
 * without a role check, however it is reached.
 */

export interface AdminListOptions {
  page?: number;
  status?: ContentStatus;
  search?: string;
}

function paginate(options: AdminListOptions) {
  const page = Math.max(1, options.page ?? 1);
  return { page, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE };
}

/** `contains` with `mode: insensitive`, or nothing at all. */
function searchFilter(
  search: string | undefined,
  fields: readonly string[],
): Prisma.NewsWhereInput | Record<string, never> {
  const term = search?.trim();
  if (!term) return {};

  return {
    OR: fields.map((field) => ({
      [field]: { contains: term, mode: 'insensitive' },
    })),
  } as Prisma.NewsWhereInput;
}

export async function listNewsForAdmin(options: AdminListOptions = {}) {
  await requireAuth(CONTENT_ROLES);

  const { page, take, skip } = paginate(options);

  const where: Prisma.NewsWhereInput = {
    deletedAt: null,
    ...(options.status ? { status: options.status } : {}),
    ...searchFilter(options.search, ['title', 'excerpt']),
  };

  const [items, total] = await Promise.all([
    db.news.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        featured: true,
        publishedAt: true,
        updatedAt: true,
        createdBy: { select: authorSelect },
      },
      orderBy: { updatedAt: 'desc' },
      take,
      skip,
    }),
    db.news.count({ where }),
  ]);

  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / take)) };
}

export async function getNewsForEdit(id: string) {
  await requireAuth(CONTENT_ROLES);

  return db.news.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      body: true,
      category: true,
      featured: true,
      authorName: true,
      status: true,
      seoTitle: true,
      seoDescription: true,
      coverImageId: true,
    },
  });
}

export async function listNoticesForAdmin(options: AdminListOptions = {}) {
  await requireAuth(CONTENT_ROLES);

  const { page, take, skip } = paginate(options);

  const where: Prisma.NoticeWhereInput = {
    deletedAt: null,
    ...(options.status ? { status: options.status } : {}),
  };

  const [items, total] = await Promise.all([
    db.notice.findMany({
      where,
      select: {
        id: true,
        title: true,
        category: true,
        pinned: true,
        status: true,
        publishedAt: true,
        expiresAt: true,
        updatedAt: true,
      },
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
      take,
      skip,
    }),
    db.notice.count({ where }),
  ]);

  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / take)) };
}

export async function listEventsForAdmin(options: AdminListOptions = {}) {
  await requireAuth(CONTENT_ROLES);

  const { page, take, skip } = paginate(options);

  const where: Prisma.EventWhereInput = {
    deletedAt: null,
    ...(options.status ? { status: options.status } : {}),
  };

  const [items, total] = await Promise.all([
    db.event.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        startDate: true,
        endDate: true,
        status: true,
        isAcademicCalendar: true,
        updatedAt: true,
      },
      orderBy: { startDate: 'desc' },
      take,
      skip,
    }),
    db.event.count({ where }),
  ]);

  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / take)) };
}

export async function listFacultyForAdmin(options: AdminListOptions = {}) {
  await requireAuth(CONTENT_ROLES);

  const { page, take, skip } = paginate(options);

  const where: Prisma.FacultyWhereInput = {
    deletedAt: null,
    ...(options.status ? { status: options.status } : {}),
  };

  const [items, total] = await Promise.all([
    db.faculty.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        designation: true,
        isLeadership: true,
        displayOrder: true,
        status: true,
        department: { select: { id: true, name: true } },
      },
      orderBy: [{ isLeadership: 'desc' }, { displayOrder: 'asc' }, { name: 'asc' }],
      take,
      skip,
    }),
    db.faculty.count({ where }),
  ]);

  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / take)) };
}

export async function listAlbumsForAdmin(options: AdminListOptions = {}) {
  await requireAuth(CONTENT_ROLES);

  const { page, take, skip } = paginate(options);

  const where: Prisma.GalleryAlbumWhereInput = {
    deletedAt: null,
    ...(options.status ? { status: options.status } : {}),
  };

  const [items, total] = await Promise.all([
    db.galleryAlbum.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        status: true,
        eventDate: true,
        updatedAt: true,
        _count: { select: { images: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take,
      skip,
    }),
    db.galleryAlbum.count({ where }),
  ]);

  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / take)) };
}

/**
 * Dashboard counts.
 *
 * ⚠️ Enquiry counts are returned ONLY for roles permitted to see enquiries.
 * An EDITOR must not learn how many enquiries exist — even a bare count is
 * information about admissions activity they have no business receiving, and
 * returning it "just for the tile" is how a boundary erodes.
 */
export async function getDashboardCounts() {
  const user = await requireAuth([
    'SUPER_ADMIN',
    'EDITOR',
    'ADMISSIONS_MANAGER',
  ]);

  const canSeeEnquiries = ENQUIRY_ROLES.includes(user.role);
  const canSeeContent = CONTENT_ROLES.includes(user.role);

  const [
    newsDrafts,
    newsPublished,
    noticesLive,
    upcomingEvents,
    newEnquiries,
    openEnquiries,
  ] = await Promise.all([
    canSeeContent
      ? db.news.count({ where: { status: 'DRAFT', deletedAt: null } })
      : Promise.resolve(0),
    canSeeContent
      ? db.news.count({ where: { status: 'PUBLISHED', deletedAt: null } })
      : Promise.resolve(0),
    canSeeContent
      ? db.notice.count({
          where: {
            status: 'PUBLISHED',
            deletedAt: null,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        })
      : Promise.resolve(0),
    canSeeContent
      ? db.event.count({
          where: {
            status: 'PUBLISHED',
            deletedAt: null,
            startDate: { gte: new Date() },
          },
        })
      : Promise.resolve(0),
    canSeeEnquiries
      ? db.admissionEnquiry.count({ where: { status: 'NEW' } })
      : Promise.resolve(0),
    canSeeEnquiries
      ? db.admissionEnquiry.count({
          where: { status: { in: ['NEW', 'CONTACTED', 'IN_PROGRESS'] } },
        })
      : Promise.resolve(0),
  ]);

  return {
    role: user.role,
    canSeeEnquiries,
    canSeeContent,
    newsDrafts,
    newsPublished,
    noticesLive,
    upcomingEvents,
    newEnquiries,
    openEnquiries,
  };
}

/**
 * Notices that have expired or are about to.
 *
 * Surfaced on the dashboard because content freshness is an operational
 * responsibility in v1 with no automation behind it — and an unnoticed stale
 * notice is exactly the failure found in reference research (F-3).
 */
export async function getStaleContentWarnings() {
  await requireAuth(CONTENT_ROLES);

  const soon = new Date();
  soon.setDate(soon.getDate() + 7);

  const [expiringSoon, publishedWithoutExpiry] = await Promise.all([
    db.notice.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
        expiresAt: { gt: new Date(), lte: soon },
      },
      select: { id: true, title: true, expiresAt: true },
      orderBy: { expiresAt: 'asc' },
      take: 5,
    }),
    db.notice.count({
      where: { status: 'PUBLISHED', deletedAt: null, expiresAt: null },
    }),
  ]);

  return { expiringSoon, publishedWithoutExpiry };
}

/** Audit log — SUPER_ADMIN only. */
export async function listAuditLog(options: { page?: number } = {}) {
  await requireAuth(['SUPER_ADMIN']);

  const { page, take, skip } = paginate(options);

  const [items, total] = await Promise.all([
    db.auditLog.findMany({
      select: {
        id: true,
        actorEmail: true,
        action: true,
        entityType: true,
        entityId: true,
        summary: true,
        ipAddress: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    db.auditLog.count(),
  ]);

  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / take)) };
}

/** Staff accounts — SUPER_ADMIN only. */
export async function listUsers() {
  await requireAuth(['SUPER_ADMIN']);

  return db.user.findMany({
    // `passwordHash` is absent from this select by construction.
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  });
}

/** All settings, including empty ones, for the settings form. */
export async function getSettingsForAdmin() {
  await requireAuth(['SUPER_ADMIN']);

  return db.siteSetting.findMany({
    select: { key: true, value: true, group: true, updatedAt: true },
    orderBy: [{ group: 'asc' }, { key: 'asc' }],
  });
}

/** Facilities for the Settings sub-resource form — SUPER_ADMIN only (D-B23). */
export async function getFacilitiesForAdmin() {
  await requireAuth(['SUPER_ADMIN']);

  return db.facility.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      category: true,
      imageId: true,
      displayOrder: true,
      status: true,
    },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });
}
