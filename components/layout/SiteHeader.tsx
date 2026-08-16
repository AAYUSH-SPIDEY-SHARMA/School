import Link from 'next/link';

import { MobileNav } from '@/components/layout/MobileNav';
import { PrimaryNav } from '@/components/layout/PrimaryNav';
import { PlaceholderText } from '@/components/ui/PlaceholderText';
import { Button } from '@/components/ui/Button';
import {
  ADMISSIONS_CTA,
  SCHOOL_PLACEHOLDERS,
} from '@/lib/constants/site';

/**
 * Site header.
 *
 * A Server Component. Only the mobile drawer and the desktop dropdown behaviour
 * need client JavaScript, and those are isolated into their own components so
 * the header itself ships no JS (ADR-0010, 27_PERFORMANCE).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      {/* Utility bar — phone and email are the fastest conversion path for a
          parent who has decided to just ring the school (journey J1). */}
      <div className="hidden border-b border-border bg-surface-sunken md:block">
        <div className="mx-auto flex max-w-(--container-2xl) items-center justify-end gap-6 px-8 py-2 text-caption">
          <a
            href={`tel:${SCHOOL_PLACEHOLDERS.phone}`}
            className="text-foreground-muted transition-colors hover:text-primary"
          >
            <PlaceholderText value={SCHOOL_PLACEHOLDERS.phone} />
          </a>
          <a
            href={`mailto:${SCHOOL_PLACEHOLDERS.email}`}
            className="text-foreground-muted transition-colors hover:text-primary"
          >
            <PlaceholderText value={SCHOOL_PLACEHOLDERS.email} />
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-(--container-2xl) items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          aria-label={`${SCHOOL_PLACEHOLDERS.name} — home`}
        >
          {/* ⚠️ The school's logo has not been supplied (OD-002). This is a
              deliberately plain stand-in, not a designed mark. */}
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-md border border-dashed border-border-strong bg-surface-sunken text-caption font-semibold text-foreground-subtle"
          >
            LOGO
          </span>
          <span className="font-serif text-h4 leading-tight font-semibold text-primary">
            <PlaceholderText value={SCHOOL_PLACEHOLDERS.name} />
          </span>
        </Link>

        <PrimaryNav />

        <div className="flex items-center gap-2">
          <Button asChild variant="accent" className="hidden lg:inline-flex">
            <Link href={ADMISSIONS_CTA.href}>{ADMISSIONS_CTA.label}</Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
