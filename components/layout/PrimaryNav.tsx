import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

import { PRIMARY_NAV } from '@/lib/constants/site';

/**
 * Desktop primary navigation.
 *
 * A Server Component that ships **no JavaScript**. Submenus open on hover and
 * on `:focus-within`, so a keyboard user reaches every child link by tabbing —
 * the same interaction a mouse user gets, without a bundle cost on a 4G phone.
 *
 * The parent item is a real link to a real overview page, not a dead toggle.
 * "About" that cannot be clicked is a common and irritating pattern; here every
 * top-level item is a destination in its own right.
 */
export function PrimaryNav() {
  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {PRIMARY_NAV.map((item) => {
          const children = 'children' in item ? item.children : undefined;

          return (
            <li key={item.href} className="group relative">
              <Link
                href={item.href}
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-body-sm font-medium text-foreground transition-colors hover:text-primary group-focus-within:text-primary"
              >
                {item.label}
                {children ? (
                  <ChevronDown
                    aria-hidden="true"
                    className="size-4 text-foreground-subtle transition-transform duration-(--duration-fast) group-hover:rotate-180 group-focus-within:rotate-180"
                  />
                ) : null}
              </Link>

              {children ? (
                <div
                  className={[
                    'invisible absolute top-full left-0 z-50 opacity-0',
                    'group-hover:visible group-hover:opacity-100',
                    'group-focus-within:visible group-focus-within:opacity-100',
                    'transition-[opacity,visibility] duration-(--duration-fast)',
                    'motion-reduce:transition-none',
                  ].join(' ')}
                >
                  {/* A small bridge, so the pointer can travel from the trigger
                      to the panel without crossing a gap that closes it. */}
                  <div className="h-2" aria-hidden="true" />
                  <ul className="min-w-60 rounded-lg border border-border bg-surface p-2 shadow-lg">
                    {children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block rounded-md px-3 py-2 text-body-sm text-foreground-muted transition-colors hover:bg-surface-sunken hover:text-primary focus-visible:bg-surface-sunken"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
