'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { ADMISSIONS_CTA, PRIMARY_NAV } from '@/lib/constants/site';

/**
 * Mobile navigation drawer.
 *
 * One of the few client components in the project (ADR-0010). Built on Radix
 * Dialog so focus trapping, focus restoration, `Escape` handling, scroll
 * locking and `aria-modal` semantics are correct — all things a hand-rolled
 * drawer typically gets wrong.
 *
 * Sections are plain `<details>` rather than a JS accordion: they work before
 * hydration, and a parent tapping "Academics" on a slow connection should not
 * have to wait for JavaScript to see the links.
 */
export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  /**
   * Close the drawer when a link inside it is followed, otherwise it stays
   * open over the newly navigated page.
   *
   * This is an event handler rather than an effect watching `pathname`.
   * Reacting to the route change would mean setting state during an effect,
   * which triggers a cascading render — and it is the wrong model anyway:
   * closing is a consequence of the tap, not of the URL.
   *
   * The listener sits on the container and checks for an anchor, so tapping a
   * `<summary>` to expand a section does NOT dismiss the drawer.
   */
  function handleNavClick(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('a')) {
      setOpen(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="inline-flex size-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
        >
          <Menu aria-hidden="true" className="size-6" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-sm" />

        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-surface shadow-xl focus:outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Dialog.Title className="font-serif text-h4 font-semibold text-primary">
              Menu
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close menu"
                className="inline-flex size-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <X aria-hidden="true" className="size-6" />
              </button>
            </Dialog.Close>
          </div>

          <nav
            aria-label="Mobile"
            onClick={handleNavClick}
            className="flex-1 overflow-y-auto overscroll-contain px-3 py-4"
          >
            <ul className="flex flex-col gap-1">
              {PRIMARY_NAV.map((item) => {
                const children = 'children' in item ? item.children : undefined;

                if (!children) {
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex min-h-11 items-center rounded-md px-3 py-2 text-body font-medium text-foreground hover:bg-surface-sunken"
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <details className="group">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md px-3 py-2 text-body font-medium text-foreground hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring">
                        {item.label}
                        <span
                          aria-hidden="true"
                          className="text-foreground-subtle transition-transform group-open:rotate-180"
                        >
                          ▾
                        </span>
                      </summary>
                      <ul className="mt-1 ml-3 flex flex-col gap-1 border-l border-border pl-3">
                        {children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="flex min-h-11 items-center rounded-md px-3 py-2 text-body-sm text-foreground-muted hover:bg-surface-sunken hover:text-primary"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-border p-4">
            {/* Royal blue, not gold — gold cannot reach 4.5:1 behind white
                text without turning brown (see components/ui/Button.tsx). */}
            <Link
              href={ADMISSIONS_CTA.href}
              className="flex min-h-12 w-full items-center justify-center rounded-md bg-cta px-5 font-medium text-cta-foreground shadow-sm transition-colors hover:bg-cta-hover"
            >
              {ADMISSIONS_CTA.label}
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
