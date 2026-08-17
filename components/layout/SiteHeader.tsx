import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

import { MobileNav } from '@/components/layout/MobileNav';
import { PrimaryNav } from '@/components/layout/PrimaryNav';
import { Button } from '@/components/ui/Button';
import { PlaceholderText } from '@/components/ui/PlaceholderText';
import {
  ADMISSIONS_CTA,
  BOARD,
  SCHOOL_CONFIRMED,
  SCHOOL_PLACEHOLDERS,
} from '@/lib/constants/site';

/**
 * Site header.
 *
 * A Server Component. Only the mobile drawer needs client JavaScript, and it is
 * isolated so the header itself ships none (ADR-0010, 27_PERFORMANCE).
 *
 * The navy utility strip is deliberate: it puts a band of the brand colour at
 * the very top of every page, which is a large part of why an institutional
 * site reads as considered rather than generic.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40">
      {/* Utility strip — phone and address are the fastest conversion path for
          a parent who has already decided to just ring the school (journey J1). */}
      <div className="ink-surface hidden md:block">
        <div className="shell flex items-center justify-between gap-6 py-2 text-caption">
          <p className="flex items-center gap-2 text-navy-200">
            <MapPin aria-hidden="true" className="size-3.5 text-gold-400" />
            {SCHOOL_CONFIRMED.fullAddress}
          </p>

          <div className="flex items-center gap-5">
            <a
              href={`tel:${SCHOOL_PLACEHOLDERS.phone}`}
              className="flex items-center gap-2 text-navy-200 transition-colors hover:text-gold-300"
            >
              <Phone aria-hidden="true" className="size-3.5 text-gold-400" />
              <PlaceholderText value={SCHOOL_PLACEHOLDERS.phone} />
            </a>
            <a
              href={`mailto:${SCHOOL_PLACEHOLDERS.email}`}
              className="flex items-center gap-2 text-navy-200 transition-colors hover:text-gold-300"
            >
              <Mail aria-hidden="true" className="size-3.5 text-gold-400" />
              <PlaceholderText value={SCHOOL_PLACEHOLDERS.email} />
            </a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-border bg-surface/95 backdrop-blur-sm supports-[backdrop-filter]:bg-surface/85">
        <div className="shell flex items-center justify-between gap-4 py-3.5">
          <Link
            href="/"
            className="flex min-w-0 shrink items-center gap-3"
            aria-label={`${SCHOOL_CONFIRMED.name} — home`}
          >
            {/* ⚠️ The school's logo has not been supplied (OD-002). This is a
                deliberately plain crest-shaped stand-in, not a designed mark —
                it should be obvious that it is waiting to be replaced. */}
            <span
              aria-hidden="true"
              className="grid size-12 shrink-0 place-items-center rounded-sm border border-dashed border-gold-600/70 bg-navy-800 font-serif text-caption font-bold tracking-widest text-gold-400"
            >
              MS
            </span>

            <span className="min-w-0">
              <span className="block truncate font-serif text-[0.98rem] leading-tight font-bold text-primary sm:text-[1.1rem] lg:text-h4">
                {SCHOOL_CONFIRMED.name}
              </span>
              <span className="block text-overline text-accent-ink uppercase">
                {BOARD} · {SCHOOL_CONFIRMED.city}
              </span>
            </span>
          </Link>

          <PrimaryNav />

          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="cta" className="hidden lg:inline-flex">
              <Link href={ADMISSIONS_CTA.href}>{ADMISSIONS_CTA.label}</Link>
            </Button>
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
