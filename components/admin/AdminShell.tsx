'use client';

import * as Dialog from '@radix-ui/react-dialog';
import {
  CalendarDays,
  FileDown,
  FolderOpen,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Newspaper,
  Quote,
  ScrollText,
  Settings,
  Trophy,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import type { Role } from '@prisma/client';

import { signOutAction } from '@/lib/actions/auth';
import {
  ADMIN_NAV_SECTIONS,
  ROLE_LABELS,
  navForRole,
  type AdminNavItem,
} from '@/lib/constants/adminNav';
import { cn } from '@/lib/utils/cn';

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Inbox,
  Newspaper,
  CalendarDays,
  Megaphone,
  Trophy,
  Users,
  Quote,
  Images,
  FolderOpen,
  FileDown,
  Settings,
  UserCog,
  ScrollText,
};

interface AdminShellProps {
  user: { name: string; email: string; role: Role };
  children: React.ReactNode;
}

function NavList({ items, pathname }: { items: AdminNavItem[]; pathname: string }) {
  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-6">
      {ADMIN_NAV_SECTIONS.map((section) => {
        const sectionItems = items.filter((item) => item.section === section.id);
        if (sectionItems.length === 0) return null;

        return (
          <div key={section.id}>
            {section.label ? (
              <h2 className="px-3 pb-2 text-overline text-neutral-400 uppercase">
                {section.label}
              </h2>
            ) : null}

            <ul className="flex flex-col gap-0.5">
              {sectionItems.map((item) => {
                const Icon = ICONS[item.icon] ?? LayoutDashboard;
                // Exact match for the dashboard, prefix match elsewhere —
                // otherwise "/admin" highlights on every single page.
                const active =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex min-h-11 items-center gap-3 rounded-md px-3 text-body-sm transition-colors',
                        active
                          ? 'bg-navy-700 font-medium text-neutral-0'
                          : 'text-neutral-300 hover:bg-navy-800 hover:text-neutral-0',
                      )}
                    >
                      <Icon aria-hidden="true" className="size-5 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function SidebarContent({
  user,
  pathname,
}: {
  user: AdminShellProps['user'];
  pathname: string;
}) {
  const items = navForRole(user.role);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-navy-700 px-5 py-4">
        <p className="font-serif text-h4 font-semibold text-neutral-0">
          Administration
        </p>
        <p className="text-caption text-neutral-400">School website</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4">
        <NavList items={items} pathname={pathname} />
      </div>

      <div className="border-t border-navy-700 p-4">
        <div className="mb-3">
          <p className="truncate text-body-sm font-medium text-neutral-0">
            {user.name}
          </p>
          <p className="truncate text-caption text-neutral-400">
            {ROLE_LABELS[user.role]}
          </p>
        </div>

        {/* A form, not a link. Signing out is a state change and must not be
            reachable by a GET a browser or scanner might prefetch. */}
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-body-sm text-neutral-300 transition-colors hover:bg-navy-800 hover:text-neutral-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <LogOut aria-hidden="true" className="size-5 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // Close the drawer when a link inside it is followed. An event handler, not
  // an effect on `pathname` — closing is a consequence of the tap, not of the
  // URL, and setting state in an effect causes a cascading render.
  function handleNavClick(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  }

  return (
    <div className="min-h-dvh bg-surface-sunken">
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-navy-900 lg:block">
        <SidebarContent user={user} pathname={pathname} />
      </aside>

      {/* Mobile header + drawer */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <span className="font-serif text-h4 font-semibold text-primary">
          Administration
        </span>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              aria-label="Open admin menu"
              className="inline-flex size-11 items-center justify-center rounded-md text-foreground hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Menu aria-hidden="true" className="size-6" />
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-neutral-900/50" />
            <Dialog.Content
              className="fixed inset-y-0 left-0 z-50 w-72 bg-navy-900 focus:outline-none"
              aria-describedby={undefined}
              onClick={handleNavClick}
            >
              <Dialog.Title className="sr-only">Admin navigation</Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-md text-neutral-300 hover:bg-navy-800"
                >
                  <X aria-hidden="true" className="size-6" />
                </button>
              </Dialog.Close>
              <SidebarContent user={user} pathname={pathname} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </header>

      <div className="lg:pl-64">
        <main id="admin-content" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
