import type { Role } from '@prisma/client';

/**
 * Admin navigation, with the role that may see each item.
 *
 * ⚠️ THIS LIST IS PRESENTATION, NOT PERMISSION.
 *
 * Hiding a link stops it being clicked; it does not stop the URL being typed or
 * the underlying Server Action being invoked directly. The authorisation that
 * matters lives in `lib/auth/guards.ts` and runs inside every action and page
 * (19_AUTHORIZATION_AND_ROLES layer 1 vs layer 3).
 *
 * Roles here must mirror the permission matrix exactly. A link visible to a
 * role that cannot use it produces a dead end; a link hidden from a role that
 * can is a feature nobody finds.
 *
 * ⚠️ THERE IS NO "FACILITIES" ENTRY. Facilities are administered inside
 * Settings, SUPER_ADMIN only (D-B23). Do not add `/admin/facilities`.
 */

export interface AdminNavItem {
  label: string;
  href: string;
  icon: string;
  roles: readonly Role[];
  /** Groups the sidebar; purely visual. */
  section: 'overview' | 'admissions' | 'content' | 'media' | 'administration';
}

const CONTENT: readonly Role[] = ['SUPER_ADMIN', 'EDITOR'];
const ENQUIRIES: readonly Role[] = ['SUPER_ADMIN', 'ADMISSIONS_MANAGER'];
const ADMIN: readonly Role[] = ['SUPER_ADMIN'];
const ALL: readonly Role[] = ['SUPER_ADMIN', 'EDITOR', 'ADMISSIONS_MANAGER'];

export const ADMIN_NAV: readonly AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard', roles: ALL, section: 'overview' },

  /**
   * ⚠️ EDITOR IS ABSENT AND MUST STAY ABSENT.
   * Enquiries contain personal data about parents and minors. A teacher
   * publishing a sports report has no reason to see them — this is the one role
   * boundary in the system that earns its complexity (locked rule G).
   */
  { label: 'Enquiries', href: '/admin/enquiries', icon: 'Inbox', roles: ENQUIRIES, section: 'admissions' },

  { label: 'News', href: '/admin/news', icon: 'Newspaper', roles: CONTENT, section: 'content' },
  { label: 'Events', href: '/admin/events', icon: 'CalendarDays', roles: CONTENT, section: 'content' },
  { label: 'Notices', href: '/admin/notices', icon: 'Megaphone', roles: CONTENT, section: 'content' },
  { label: 'Achievements', href: '/admin/achievements', icon: 'Trophy', roles: CONTENT, section: 'content' },
  { label: 'Faculty', href: '/admin/faculty', icon: 'Users', roles: CONTENT, section: 'content' },
  { label: 'Testimonials', href: '/admin/testimonials', icon: 'Quote', roles: CONTENT, section: 'content' },

  { label: 'Gallery', href: '/admin/gallery', icon: 'Images', roles: CONTENT, section: 'media' },
  { label: 'Media library', href: '/admin/media', icon: 'FolderOpen', roles: CONTENT, section: 'media' },
  { label: 'Downloads', href: '/admin/downloads', icon: 'FileDown', roles: CONTENT, section: 'media' },

  { label: 'Settings', href: '/admin/settings', icon: 'Settings', roles: ADMIN, section: 'administration' },
  { label: 'Users', href: '/admin/users', icon: 'UserCog', roles: ADMIN, section: 'administration' },
  { label: 'Audit log', href: '/admin/audit-log', icon: 'ScrollText', roles: ADMIN, section: 'administration' },
];

export const ADMIN_NAV_SECTIONS = [
  { id: 'overview', label: null },
  { id: 'admissions', label: 'Admissions' },
  { id: 'content', label: 'Content' },
  { id: 'media', label: 'Media' },
  { id: 'administration', label: 'Administration' },
] as const;

export function navForRole(role: Role): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => item.roles.includes(role));
}

/** Human-readable role names for the admin UI. */
export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Administrator',
  EDITOR: 'Editor',
  ADMISSIONS_MANAGER: 'Admissions',
};
