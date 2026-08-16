'use server';

import { type ActionResult, ok, toActionError } from '@/lib/actions/actionResult';
import { recordAudit } from '@/lib/audit/recordAudit';
import { NotFoundError, ValidationError } from '@/lib/auth/errors';
import { ADMIN_ONLY, ENQUIRY_ROLES, requireAuth } from '@/lib/auth/guards';
import { db } from '@/lib/db/prisma';
import {
  enquiryAssignSchema,
  enquiryDeleteSchema,
  enquiryNoteSchema,
  enquiryStatusSchema,
} from '@/lib/validations/enquiry';

/**
 * Enquiry management actions.
 *
 * ⚠️ AUDIT ENTRIES IN THIS FILE MUST NEVER CONTAIN ENQUIRY PII.
 *
 * They record *that* enquiry `abc123` moved to CONTACTED by user `u_4` — never
 * the parent's name, phone number, email or message. Otherwise the audit log
 * becomes a second copy of the most sensitive data in the system: retained
 * longer, protected less, append-only so it cannot be corrected, and invisible
 * to anyone processing a deletion request.
 *
 * This is the single easiest mistake to make here, because writing the parent's
 * name into the summary would genuinely make the log more readable.
 */

/** Lifecycle timestamps, set when the status first reaches each state. */
function timestampsFor(
  status: 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
  existing: { contactedAt: Date | null; resolvedAt: Date | null; closedAt: Date | null },
) {
  const now = new Date();

  return {
    // Preserved once set — "first contacted" is the useful figure for response
    // time, and overwriting it on every later status change would destroy it.
    contactedAt:
      status === 'CONTACTED' ? (existing.contactedAt ?? now) : existing.contactedAt,
    resolvedAt:
      status === 'RESOLVED' ? (existing.resolvedAt ?? now) : existing.resolvedAt,
    closedAt: status === 'CLOSED' ? (existing.closedAt ?? now) : existing.closedAt,
  };
}

export async function updateEnquiryStatus(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(ENQUIRY_ROLES);
    const data = enquiryStatusSchema.parse(input);

    const existing = await db.admissionEnquiry.findUnique({
      where: { id: data.id },
      select: {
        id: true,
        status: true,
        contactedAt: true,
        resolvedAt: true,
        closedAt: true,
      },
    });

    if (!existing) throw new NotFoundError();

    await db.admissionEnquiry.update({
      where: { id: data.id },
      data: { status: data.status, ...timestampsFor(data.status, existing) },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'STATUS_CHANGE',
      entityType: 'AdmissionEnquiry',
      entityId: data.id,
      // ⚠️ Status only. No parent name, no contact details.
      summary: `Enquiry status ${existing.status} → ${data.status}`,
    });

    return ok({ id: data.id });
  } catch (error) {
    return toActionError(error, 'updateEnquiryStatus');
  }
}

export async function assignEnquiry(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(ENQUIRY_ROLES);
    const data = enquiryAssignSchema.parse(input);

    const assignedToId = data.assignedToId?.trim() || null;

    const existing = await db.admissionEnquiry.findUnique({
      where: { id: data.id },
      select: { id: true },
    });

    if (!existing) throw new NotFoundError();

    if (assignedToId) {
      // An enquiry assigned to someone who cannot open it is a silent dead end,
      // so the assignee is checked rather than trusted from the form.
      const assignee = await db.user.findFirst({
        where: {
          id: assignedToId,
          isActive: true,
          role: { in: ['SUPER_ADMIN', 'ADMISSIONS_MANAGER'] },
        },
        select: { id: true },
      });

      if (!assignee) {
        throw new ValidationError({
          assignedToId: ['That person cannot be assigned enquiries.'],
        });
      }
    }

    await db.admissionEnquiry.update({
      where: { id: data.id },
      data: { assignedToId },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'AdmissionEnquiry',
      entityId: data.id,
      // Staff ids are not enquiry PII; the parent's details still never appear.
      summary: assignedToId
        ? `Enquiry assigned to user ${assignedToId}`
        : 'Enquiry unassigned',
    });

    return ok({ id: data.id });
  } catch (error) {
    return toActionError(error, 'assignEnquiry');
  }
}

/**
 * Add a follow-up note.
 *
 * Notes are a separate table rather than a JSON blob so each carries a real
 * author and timestamp. That is the mechanism that stops two staff members
 * ringing the same parent an hour apart (journey J8).
 */
export async function addEnquiryNote(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(ENQUIRY_ROLES);
    const data = enquiryNoteSchema.parse(input);

    const enquiry = await db.admissionEnquiry.findUnique({
      where: { id: data.enquiryId },
      select: { id: true },
    });

    if (!enquiry) throw new NotFoundError();

    const note = await db.enquiryNote.create({
      data: {
        enquiryId: data.enquiryId,
        authorId: user.id,
        body: data.body,
      },
      select: { id: true },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'CREATE',
      entityType: 'EnquiryNote',
      entityId: note.id,
      // ⚠️ Never the note body. A note may well quote what the parent said.
      summary: `Note added to enquiry ${data.enquiryId}`,
    });

    return ok({ id: note.id });
  } catch (error) {
    return toActionError(error, 'addEnquiryNote');
  }
}

/**
 * Delete an enquiry — SUPER_ADMIN only, and a HARD delete.
 *
 * ⚠️ Deliberately not a soft delete. Content is soft-deleted so mistakes are
 * recoverable, but this is a privacy operation: a data-subject request or
 * retention expiry. "Deleted" must mean the row is gone, not hidden behind a
 * flag where it would still be returned by any query that forgot the filter,
 * and would still be sitting in a backup labelled as deleted.
 *
 * Notes cascade with it.
 *
 * The retention PERIOD is an unresolved school decision (OD-011). The mechanism
 * is built and configurable; no period is invented here, and nothing expires
 * automatically until the school states one.
 */
export async function deleteEnquiry(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(ADMIN_ONLY);
    const data = enquiryDeleteSchema.parse(input);

    const existing = await db.admissionEnquiry.findUnique({
      where: { id: data.id },
      select: { id: true, academicYear: true },
    });

    if (!existing) throw new NotFoundError();

    await db.admissionEnquiry.delete({ where: { id: data.id } });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'DELETE',
      entityType: 'AdmissionEnquiry',
      entityId: data.id,
      // The record of the deletion must not itself preserve what was deleted.
      summary: `Enquiry permanently deleted (${existing.academicYear})`,
    });

    return ok({ id: data.id });
  } catch (error) {
    return toActionError(error, 'deleteEnquiry');
  }
}

/**
 * Export enquiries as CSV.
 *
 * ⚠️ Exporting moves personal data OUTSIDE every protection this system
 * provides — into a spreadsheet on someone's laptop, an email attachment, a
 * shared drive. It is permitted because admissions staff genuinely need it, and
 * it is audited every single time precisely because of where the data goes.
 */
export async function exportEnquiries(): Promise<
  ActionResult<{ csv: string; count: number }>
> {
  try {
    const user = await requireAuth(ENQUIRY_ROLES);

    const rows = await db.admissionEnquiry.findMany({
      select: {
        id: true,
        parentName: true,
        phone: true,
        email: true,
        studentName: true,
        classApplying: true,
        academicYear: true,
        locality: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Quote every field and double internal quotes. A parent's message or
    // locality containing a comma would otherwise shift every later column.
    const escape = (value: unknown): string => {
      const text = value == null ? '' : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    const header = [
      'Received',
      'Parent name',
      'Phone',
      'Email',
      'Student name',
      'Class',
      'Academic year',
      'Locality',
      'Status',
    ];

    const csv = [
      header.map(escape).join(','),
      ...rows.map((row) =>
        [
          row.createdAt.toISOString(),
          row.parentName,
          row.phone,
          row.email,
          row.studentName ?? '',
          row.classApplying,
          row.academicYear,
          row.locality ?? '',
          row.status,
        ]
          .map(escape)
          .join(','),
      ),
    ].join('\n');

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'EXPORT',
      entityType: 'AdmissionEnquiry',
      entityId: 'bulk-export',
      summary: `Exported ${rows.length} enquiry record(s) to CSV`,
    });

    return ok({ csv, count: rows.length });
  } catch (error) {
    return toActionError(error, 'exportEnquiries');
  }
}
