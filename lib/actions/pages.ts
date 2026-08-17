'use server';

import type { Prisma } from '@prisma/client';
import { updateTag } from 'next/cache';

import { type ActionResult, ok, toActionError } from '@/lib/actions/actionResult';
import { recordAudit } from '@/lib/audit/recordAudit';
import { NotFoundError, ValidationError } from '@/lib/auth/errors';
import { CONTENT_ROLES, requireAuth } from '@/lib/auth/guards';
import { db } from '@/lib/db/prisma';
import { NAV_TAG, PAGE_TAG, pageTag } from '@/lib/queries/pages';
import {
  defaultSectionContent,
  parseSectionContent,
  type SectionTypeKey,
} from '@/lib/sections/schemas';
import {
  addSectionSchema,
  deleteSectionSchema,
  navItemSchema,
  navItemUpdateSchema,
  pageSchema,
  pageUpdateSchema,
  reorderNavSchema,
  reorderSectionsSchema,
  updateSectionSchema,
} from '@/lib/validations/pages';

/**
 * Page composition actions (ADR-0012).
 *
 * Every action follows the same five-step contract as the rest of the system:
 * authenticate, authorise, validate, execute, audit and invalidate. These are
 * directly invocable HTTP endpoints like any other Server Action.
 */

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createPage(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = pageSchema.parse(input);

    const clash = await db.page.findFirst({
      where: { slug: data.slug, deletedAt: null },
      select: { id: true },
    });

    if (clash) {
      throw new ValidationError({
        slug: ['A page already uses that address.'],
      });
    }

    const page = await db.page.create({
      data: {
        slug: data.slug,
        title: data.title,
        adminNote: emptyToNull(data.adminNote),
        status: data.status,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        seoTitle: emptyToNull(data.seoTitle),
        seoDescription: emptyToNull(data.seoDescription),
        ogImageId: emptyToNull(data.ogImageId),
        createdById: user.id,
      },
      select: { id: true, slug: true },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'CREATE',
      entityType: 'Page',
      entityId: page.id,
      summary: `Created page "${data.title}" (/${data.slug})`,
    });

    updateTag(PAGE_TAG);
    updateTag(pageTag(page.slug));

    return ok({ id: page.id });
  } catch (error) {
    return toActionError(error, 'createPage');
  }
}

export async function updatePage(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = pageUpdateSchema.parse(input);

    const existing = await db.page.findFirst({
      where: { id: data.id, deletedAt: null },
      select: { id: true, slug: true, isSystem: true, publishedAt: true },
    });

    if (!existing) throw new NotFoundError();

    /**
     * ⚠️ A system page's address is fixed.
     *
     * Its route exists in the codebase and the navigation points at it;
     * changing the slug would 404 a link the site itself renders. Everything
     * else about the page — title, sections, SEO — stays editable.
     */
    if (existing.isSystem && data.slug !== existing.slug) {
      throw new ValidationError({
        slug: [
          'This is a built-in page, so its address cannot be changed. Everything else can be edited.',
        ],
      });
    }

    const page = await db.page.update({
      where: { id: data.id },
      data: {
        slug: data.slug,
        title: data.title,
        adminNote: emptyToNull(data.adminNote),
        status: data.status,
        publishedAt:
          data.status === 'PUBLISHED'
            ? (existing.publishedAt ?? new Date())
            : null,
        seoTitle: emptyToNull(data.seoTitle),
        seoDescription: emptyToNull(data.seoDescription),
        ogImageId: emptyToNull(data.ogImageId),
      },
      select: { id: true, slug: true },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'Page',
      entityId: page.id,
      summary: `Updated page "${data.title}"`,
    });

    updateTag(PAGE_TAG);
    updateTag(pageTag(page.slug));
    if (existing.slug !== page.slug) updateTag(pageTag(existing.slug));

    return ok({ id: page.id });
  } catch (error) {
    return toActionError(error, 'updatePage');
  }
}

export async function deletePage(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = deleteSectionSchema.parse(input);

    const existing = await db.page.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, slug: true, title: true, isSystem: true },
    });

    if (!existing) throw new NotFoundError();

    if (existing.isSystem) {
      throw new ValidationError(
        { _form: ['Built-in pages cannot be deleted.'] },
        'This page is part of the site structure and cannot be deleted. You can unpublish it instead.',
      );
    }

    await db.page.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'DELETE',
      entityType: 'Page',
      entityId: id,
      summary: `Deleted page "${existing.title}"`,
    });

    updateTag(PAGE_TAG);
    updateTag(pageTag(existing.slug));

    return ok({ id });
  } catch (error) {
    return toActionError(error, 'deletePage');
  }
}

/* ── Sections ─────────────────────────────────────────────────────────────── */

export async function addSection(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = addSectionSchema.parse(input);

    const page = await db.page.findFirst({
      where: { id: data.pageId, deletedAt: null },
      select: { id: true, slug: true, title: true },
    });

    if (!page) throw new NotFoundError();

    const last = await db.pageSection.findFirst({
      where: { pageId: data.pageId },
      select: { displayOrder: true },
      orderBy: { displayOrder: 'desc' },
    });

    const type = data.type as SectionTypeKey;

    const section = await db.pageSection.create({
      data: {
        pageId: data.pageId,
        type,
        displayOrder: (last?.displayOrder ?? -1) + 1,
        // Defaults come from the type's own schema, so they live in one place.
        content: defaultSectionContent(type) as Prisma.InputJsonValue,
        // New sections start hidden, so a half-filled section is never briefly
        // live on a published page.
        isVisible: false,
      },
      select: { id: true },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'CREATE',
      entityType: 'PageSection',
      entityId: section.id,
      summary: `Added a ${type} section to "${page.title}"`,
    });

    updateTag(PAGE_TAG);
    updateTag(pageTag(page.slug));

    return ok({ id: section.id });
  } catch (error) {
    return toActionError(error, 'addSection');
  }
}

export async function updateSection(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = updateSectionSchema.parse(input);

    const existing = await db.pageSection.findUnique({
      where: { id: data.id },
      select: {
        id: true,
        type: true,
        page: { select: { id: true, slug: true, title: true } },
      },
    });

    if (!existing) throw new NotFoundError();

    /**
     * ⚠️ Validated against the type stored on the ROW, never a type supplied by
     * the caller. Trusting a submitted type would let someone send `SPACER`
     * content to a `HERO` section — or bypass the field rules entirely by
     * claiming a laxer type.
     */
    const content = parseSectionContent(
      existing.type as SectionTypeKey,
      data.content,
    );

    await db.pageSection.update({
      where: { id: data.id },
      data: {
        content: content as Prisma.InputJsonValue,
        ...(data.isVisible === undefined ? {} : { isVisible: data.isVisible }),
      },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'PageSection',
      entityId: data.id,
      summary: `Edited a ${existing.type} section on "${existing.page.title}"`,
    });

    updateTag(PAGE_TAG);
    updateTag(pageTag(existing.page.slug));

    return ok({ id: data.id });
  } catch (error) {
    return toActionError(error, 'updateSection');
  }
}

/**
 * Reorder a page's sections.
 *
 * The feature the owner actually asked for: "which section placed in which
 * place, upper, down or where."
 *
 * Every update is scoped to the page, so a crafted payload cannot drag another
 * page's sections into this one's ordering.
 */
export async function reorderSections(
  input: unknown,
): Promise<ActionResult<{ count: number }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = reorderSectionsSchema.parse(input);

    const page = await db.page.findFirst({
      where: { id: data.pageId, deletedAt: null },
      select: { id: true, slug: true, title: true },
    });

    if (!page) throw new NotFoundError();

    await db.$transaction(
      data.sectionIds.map((sectionId, index) =>
        db.pageSection.updateMany({
          where: { id: sectionId, pageId: data.pageId },
          data: { displayOrder: index },
        }),
      ),
    );

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'Page',
      entityId: page.id,
      summary: `Reordered sections on "${page.title}"`,
    });

    updateTag(PAGE_TAG);
    updateTag(pageTag(page.slug));

    return ok({ count: data.sectionIds.length });
  } catch (error) {
    return toActionError(error, 'reorderSections');
  }
}

export async function deleteSection(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = deleteSectionSchema.parse(input);

    const existing = await db.pageSection.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        page: { select: { slug: true, title: true } },
      },
    });

    if (!existing) throw new NotFoundError();

    // Hard delete: a section is a small piece of content, and keeping deleted
    // ones would clutter every ordering query for no real benefit. Hiding is
    // the reversible option, and it is one click away.
    await db.pageSection.delete({ where: { id } });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'DELETE',
      entityType: 'PageSection',
      entityId: id,
      summary: `Removed a ${existing.type} section from "${existing.page.title}"`,
    });

    updateTag(PAGE_TAG);
    updateTag(pageTag(existing.page.slug));

    return ok({ id });
  } catch (error) {
    return toActionError(error, 'deleteSection');
  }
}

/* ── Navigation ───────────────────────────────────────────────────────────── */

export async function createNavItem(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = navItemSchema.parse(input);

    const parentId = emptyToNull(data.parentId);

    if (parentId) {
      // One level only. A third level is unusable on a phone and no school site
      // needs it.
      const parent = await db.navItem.findUnique({
        where: { id: parentId },
        select: { parentId: true },
      });

      if (!parent) {
        throw new ValidationError({ parentId: ['That menu no longer exists.'] });
      }

      if (parent.parentId) {
        throw new ValidationError({
          parentId: ['Menus can only be one level deep.'],
        });
      }
    }

    const last = await db.navItem.findFirst({
      where: { location: data.location, parentId },
      select: { displayOrder: true },
      orderBy: { displayOrder: 'desc' },
    });

    const item = await db.navItem.create({
      data: {
        label: data.label,
        href: data.href,
        parentId,
        location: data.location,
        isVisible: data.isVisible,
        displayOrder: (last?.displayOrder ?? -1) + 1,
      },
      select: { id: true },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'CREATE',
      entityType: 'NavItem',
      entityId: item.id,
      summary: `Added menu link "${data.label}" → ${data.href}`,
    });

    updateTag(NAV_TAG);

    return ok({ id: item.id });
  } catch (error) {
    return toActionError(error, 'createNavItem');
  }
}

export async function updateNavItem(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = navItemUpdateSchema.parse(input);

    const existing = await db.navItem.findUnique({
      where: { id: data.id },
      select: { id: true },
    });

    if (!existing) throw new NotFoundError();

    await db.navItem.update({
      where: { id: data.id },
      data: {
        label: data.label,
        href: data.href,
        isVisible: data.isVisible,
      },
    });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'NavItem',
      entityId: data.id,
      summary: `Updated menu link "${data.label}"`,
    });

    updateTag(NAV_TAG);

    return ok({ id: data.id });
  } catch (error) {
    return toActionError(error, 'updateNavItem');
  }
}

export async function deleteNavItem(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const { id } = deleteSectionSchema.parse(input);

    const existing = await db.navItem.findUnique({
      where: { id },
      select: { id: true, label: true, _count: { select: { children: true } } },
    });

    if (!existing) throw new NotFoundError();

    // Children cascade at the database. Said out loud here because deleting a
    // top-level item silently taking six sub-links with it would be a surprise.
    await db.navItem.delete({ where: { id } });

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'DELETE',
      entityType: 'NavItem',
      entityId: id,
      summary: `Removed menu link "${existing.label}"${existing._count.children > 0 ? ` and its ${existing._count.children} sub-link(s)` : ''}`,
    });

    updateTag(NAV_TAG);

    return ok({ id });
  } catch (error) {
    return toActionError(error, 'deleteNavItem');
  }
}

export async function reorderNav(
  input: unknown,
): Promise<ActionResult<{ count: number }>> {
  try {
    const user = await requireAuth(CONTENT_ROLES);
    const data = reorderNavSchema.parse(input);

    const updates: Prisma.PrismaPromise<unknown>[] = [];

    data.items.forEach((item, index) => {
      updates.push(
        db.navItem.updateMany({
          where: { id: item.id, location: data.location },
          data: { displayOrder: index, parentId: null },
        }),
      );

      item.childIds.forEach((childId, childIndex) => {
        updates.push(
          db.navItem.updateMany({
            where: { id: childId, location: data.location },
            data: { displayOrder: childIndex, parentId: item.id },
          }),
        );
      });
    });

    await db.$transaction(updates);

    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'UPDATE',
      entityType: 'NavItem',
      entityId: data.location,
      summary: `Reordered the ${data.location} menu`,
    });

    updateTag(NAV_TAG);

    return ok({ count: data.items.length });
  } catch (error) {
    return toActionError(error, 'reorderNav');
  }
}
