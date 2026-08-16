import 'server-only';

import type { EnquiryStatus, Prisma } from '@prisma/client';

import { ENQUIRY_ROLES, requireAuth } from '@/lib/auth/guards';
import { PAGE_SIZE } from '@/lib/constants/site';
import { db } from '@/lib/db/prisma';

/**
 * Enquiry reads.
 *
 * ⚠️ THE MOST SENSITIVE DATA IN THE SYSTEM.
 *
 * Every row contains a parent's name, phone number and email address, and
 * often a child's name. Three rules govern this file and none of them is
 * negotiable:
 *
 *  1. **EDITOR CANNOT REACH THIS DATA BY ANY ROUTE.** Every function
 *     authorises against `ENQUIRY_ROLES`, at the query itself and not merely
 *     at the page that calls it. A teacher publishing a sports report has no
 *     reason to see a parent's phone number, and this is the one role boundary
 *     in the system that earns its complexity (locked rule G).
 *
 *  2. **NOTHING HERE IS CACHED.** Caching personal data would put it in a
 *     shared store keyed by URL, where it could outlive a deletion request.
 *
 *  3. **NONE OF THIS IS EVER REACHABLE FROM A PUBLIC QUERY.** There is no
 *     public read path to enquiries at all — not a count, not an aggregate.
 */

const listSelect = {
  id: true,
  parentName: true,
  phone: true,
  email: true,
  classApplying: true,
  academicYear: true,
  status: true,
  createdAt: true,
  contactedAt: true,
  assignedTo: { select: { id: true, name: true } },
  _count: { select: { notes: true } },
} as const satisfies Prisma.AdmissionEnquirySelect;

export interface EnquiryListOptions {
  page?: number;
  status?: EnquiryStatus;
  assignedToId?: string;
  search?: string;
}

export async function listEnquiries(options: EnquiryListOptions = {}) {
  await requireAuth(ENQUIRY_ROLES);

  const page = Math.max(1, options.page ?? 1);
  const term = options.search?.trim();

  const where: Prisma.AdmissionEnquiryWhereInput = {
    ...(options.status ? { status: options.status } : {}),
    ...(options.assignedToId ? { assignedToId: options.assignedToId } : {}),
    ...(term
      ? {
          OR: [
            { parentName: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
            { phone: { contains: term } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.admissionEnquiry.findMany({
      where,
      select: listSelect,
      // Oldest-first within NEW would be kinder, but staff scan for "what
      // arrived since I last looked", so newest first is the working order.
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    db.admissionEnquiry.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Full detail, including the child's name and the parent's message. */
export async function getEnquiry(id: string) {
  await requireAuth(ENQUIRY_ROLES);

  return db.admissionEnquiry.findUnique({
    where: { id },
    select: {
      id: true,
      parentName: true,
      phone: true,
      email: true,
      studentName: true,
      classApplying: true,
      academicYear: true,
      locality: true,
      message: true,
      status: true,
      source: true,
      consentAt: true,
      createdAt: true,
      contactedAt: true,
      resolvedAt: true,
      closedAt: true,
      assignedTo: { select: { id: true, name: true } },
      notes: {
        select: {
          id: true,
          body: true,
          createdAt: true,
          author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

/** Counts per status, for the filter chips. */
export async function getEnquiryStatusCounts() {
  await requireAuth(ENQUIRY_ROLES);

  const rows = await db.admissionEnquiry.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.status] = row._count._all;

  return counts;
}

/**
 * Staff who can be assigned an enquiry.
 *
 * Only roles that can actually work enquiries appear. Offering an EDITOR in the
 * assignee list would create an enquiry assigned to someone who cannot open it.
 */
export async function getAssignableStaff() {
  await requireAuth(ENQUIRY_ROLES);

  return db.user.findMany({
    where: { isActive: true, role: { in: ['SUPER_ADMIN', 'ADMISSIONS_MANAGER'] } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}
