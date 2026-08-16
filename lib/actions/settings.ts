'use server';

import { updateTag } from 'next/cache';
import { z } from 'zod';

import { type ActionResult, ok, toActionError } from '@/lib/actions/actionResult';
import { recordAudit } from '@/lib/audit/recordAudit';
import { ADMIN_ONLY, ENQUIRY_ROLES, requireAuth } from '@/lib/auth/guards';
import { CACHE_TAGS } from '@/lib/cache/tags';
import { db } from '@/lib/db/prisma';
import { ensureSlug } from '@/lib/utils/slug';
import { facilitiesBulkSchema } from '@/lib/validations/content';

/**
 * Settings Server Actions — SUPER_ADMIN only, with one deliberate exception.
 *
 * ⚠️ FACILITIES LIVE HERE, NOT IN THEIR OWN MODULE.
 *
 * Facilities are a Settings sub-resource administered by SUPER_ADMIN alone
 * (owner decision D-B23). There is no `/admin/facilities` route and no
 * EDITOR-accessible path to them. About a dozen records changed roughly once a
 * year does not justify a full CRUD module.
 *
 * ⚠️ DO NOT "FIX" THIS BY WIDENING SETTINGS ACCESS TO EDITOR.
 *
 * An earlier draft of the permission matrix gave EDITOR facility rights while
 * the only editing surface was SUPER_ADMIN-restricted Settings — a permission
 * with no route to exercise it. The tempting repair is to let EDITOR into
 * Settings, which would quietly hand every content editor control of the
 * school's contact details, statistics and global SEO. The correct resolution,
 * already taken, was to remove the unusable permission (CHANGE-0009).
 */

const settingsUpdateSchema = z.object({
  settings: z
    .array(
      z.object({
        key: z.string().min(1).max(120),
        value: z.string().max(5_000),
      }),
    )
    .max(120),
});

export async function updateSiteSettings(
  input: unknown,
): Promise<ActionResult<{ updated: number }>> {
  try {
    const user = await requireAuth(ADMIN_ONLY);
    const data = settingsUpdateSchema.parse(input);

    await db.$transaction(
      data.settings.map((entry) =>
        db.siteSetting.update({
          where: { key: entry.key },
          data: { value: entry.value, updatedById: user.id },
        }),
      ),
    );

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'SiteSetting',
      entityId: 'site-settings',
      // Keys, never values — a settings value could be the school's phone
      // number, and the audit log is not a place to duplicate contact data.
      summary: `Updated settings: ${data.settings.map((entry) => entry.key).join(', ')}`,
    });

    updateTag(CACHE_TAGS.settings);

    return ok({ updated: data.settings.length });
  } catch (error) {
    return toActionError(error, 'updateSiteSettings');
  }
}

const admissionsStatusSchema = z.object({
  cycleStatus: z.enum(['OPEN', 'CLOSED', 'OPENING_SOON']),
  academicYear: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/, 'Use the format 2026-27'),
});

/**
 * Open or close the admissions cycle.
 *
 * A separate action from `updateSiteSettings`, and deliberately so: it lets
 * admissions staff reach exactly these two keys without being handed the whole
 * settings surface. A role check broader than it needs to be is how privilege
 * creeps.
 *
 * The cycle status is the highest-staleness-risk content on the site (journey
 * J5) — an out-of-date "Admissions open" actively misleads a parent about
 * whether they can still apply. ADMISSIONS_MANAGER can change it because they
 * are the people who actually know. EDITOR cannot, because it is a business
 * statement rather than editorial content.
 */
export async function updateAdmissionsStatus(
  input: unknown,
): Promise<ActionResult<{ cycleStatus: string }>> {
  try {
    const user = await requireAuth(ENQUIRY_ROLES);
    const data = admissionsStatusSchema.parse(input);

    await db.$transaction([
      db.siteSetting.update({
        where: { key: 'admissions.cycleStatus' },
        data: { value: data.cycleStatus, updatedById: user.id },
      }),
      db.siteSetting.update({
        where: { key: 'admissions.academicYear' },
        data: { value: data.academicYear, updatedById: user.id },
      }),
    ]);

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'STATUS_CHANGE',
      entityType: 'SiteSetting',
      entityId: 'admissions.cycleStatus',
      summary: `Admissions cycle set to ${data.cycleStatus} for ${data.academicYear}`,
    });

    updateTag(CACHE_TAGS.settings);

    return ok({ cycleStatus: data.cycleStatus });
  } catch (error) {
    return toActionError(error, 'updateAdmissionsStatus');
  }
}

/**
 * Facilities — created, edited and removed as a set.
 *
 * SUPER_ADMIN only (D-B23). This is the single action named in the approved
 * action inventory for facilities; there is no per-facility create/update/delete
 * endpoint, because there is no per-facility UI.
 */
export async function updateFacilities(
  input: unknown,
): Promise<ActionResult<{ saved: number }>> {
  try {
    const user = await requireAuth(ADMIN_ONLY);
    const data = facilitiesBulkSchema.parse(input);

    const submittedIds = data.facilities
      .map((facility) => facility.id)
      .filter((id): id is string => Boolean(id));

    const saved = await db.$transaction(async (tx) => {
      // Anything previously live but absent from this submission was removed in
      // the form, so it is soft-deleted rather than left orphaned.
      await tx.facility.updateMany({
        where: {
          deletedAt: null,
          ...(submittedIds.length > 0 ? { id: { notIn: submittedIds } } : {}),
        },
        data: { deletedAt: new Date(), status: 'ARCHIVED' },
      });

      let count = 0;

      for (const [index, facility] of data.facilities.entries()) {
        const payload = {
          name: facility.name,
          description: facility.description,
          category: facility.category,
          imageId: facility.imageId?.trim() || null,
          displayOrder: facility.displayOrder ?? index,
          status: facility.status,
        };

        if (facility.id) {
          await tx.facility.update({
            where: { id: facility.id },
            data: { ...payload, slug: facility.slug, deletedAt: null },
          });
        } else {
          await tx.facility.create({
            data: {
              ...payload,
              slug: facility.slug || ensureSlug(facility.name, 'facility'),
              createdById: user.id,
            },
          });
        }

        count += 1;
      }

      return count;
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'Facility',
      entityId: 'facilities',
      summary: `Updated facilities (${saved} record(s))`,
    });

    updateTag(CACHE_TAGS.facilities);

    return ok({ saved });
  } catch (error) {
    return toActionError(error, 'updateFacilities');
  }
}
