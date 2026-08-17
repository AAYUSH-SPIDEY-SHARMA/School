import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

import { CopyrightYear } from '@/components/layout/CopyrightYear';
import { PlaceholderText } from '@/components/ui/PlaceholderText';
import {
  ADMISSIONS_CTA,
  BOARD,
  FOOTER_LEGAL_LINKS,
  PRIMARY_NAV,
  SCHOOL_CONFIRMED,
  SCHOOL_PLACEHOLDERS,
} from '@/lib/constants/site';

export function SiteFooter() {
  return (
    <footer className="ink-surface mt-auto">
      {/* A thin gold rule across the top of the footer. Small detail, and it
          does a disproportionate amount of the "considered" work. */}
      <div className="h-px bg-linear-to-r from-transparent via-gold-500/70 to-transparent" />

      <div className="shell py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Identity */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-12 shrink-0 place-items-center rounded-sm border border-gold-600/70 font-serif text-caption font-bold tracking-widest text-gold-400"
              >
                MS
              </span>
              <p className="font-serif text-h4 leading-tight font-bold text-cream-50">
                {SCHOOL_CONFIRMED.name}
              </p>
            </div>

            <p className="mt-4 max-w-sm text-body-sm text-navy-200">
              <PlaceholderText value={SCHOOL_PLACEHOLDERS.tagline} />
            </p>

            <p className="mt-5 text-caption text-navy-300">
              {BOARD} affiliation no.{' '}
              <PlaceholderText value={SCHOOL_PLACEHOLDERS.affiliationNumber} />
            </p>
          </div>

          {/* Explore */}
          <nav aria-labelledby="footer-explore" className="lg:col-span-2">
            <h2 id="footer-explore" className="text-overline text-gold-400 uppercase">
              Explore
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-sm text-navy-200 transition-colors hover:text-cream-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={ADMISSIONS_CTA.href}
                  className="text-body-sm font-medium text-gold-300 transition-colors hover:text-gold-200"
                >
                  {ADMISSIONS_CTA.label}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Information */}
          <nav aria-labelledby="footer-info" className="lg:col-span-3">
            <h2 id="footer-info" className="text-overline text-gold-400 uppercase">
              Information
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-body-sm">
              <li>
                <Link
                  href="/downloads"
                  className="text-navy-200 transition-colors hover:text-cream-50"
                >
                  Downloads &amp; Mandatory Disclosure
                </Link>
              </li>
              <li>
                <Link
                  href="/notices"
                  className="text-navy-200 transition-colors hover:text-cream-50"
                >
                  Notices
                </Link>
              </li>
              {FOOTER_LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-navy-200 transition-colors hover:text-cream-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h2 className="text-overline text-gold-400 uppercase">Contact</h2>
            <ul className="mt-4 flex flex-col gap-3.5 text-body-sm">
              <li className="flex gap-3">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-gold-500"
                />
                <address className="text-navy-200 not-italic">
                  {SCHOOL_CONFIRMED.addressLine}
                  <br />
                  {SCHOOL_CONFIRMED.state} {SCHOOL_CONFIRMED.postalCode}
                </address>
              </li>
              <li className="flex gap-3">
                <Phone
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-gold-500"
                />
                <a
                  href={`tel:${SCHOOL_PLACEHOLDERS.phone}`}
                  className="text-navy-200 transition-colors hover:text-cream-50"
                >
                  <PlaceholderText value={SCHOOL_PLACEHOLDERS.phone} />
                </a>
              </li>
              <li className="flex gap-3">
                <Mail
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-gold-500"
                />
                <a
                  href={`mailto:${SCHOOL_PLACEHOLDERS.email}`}
                  className="text-navy-200 transition-colors hover:text-cream-50"
                >
                  <PlaceholderText value={SCHOOL_PLACEHOLDERS.email} />
                </a>
              </li>
            </ul>

            {/* Safeguarding takedown route. 48_MEDIA_CONSENT_AND_CHILD_SAFETY
                requires a PUBLISHED contact for image-removal requests. Any
                parent may ask without justifying the request. */}
            <p className="mt-6 text-caption text-navy-300">
              To request removal of a photograph, contact{' '}
              <a
                href={`mailto:${SCHOOL_PLACEHOLDERS.email}`}
                className="underline underline-offset-2 hover:text-navy-100"
              >
                <PlaceholderText value={SCHOOL_PLACEHOLDERS.email} />
              </a>
              . Requests are actioned promptly and without question.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-navy-700 pt-6 text-caption text-navy-300 sm:flex-row sm:items-center sm:justify-between">
          {/* The year is computed, never typed — see CopyrightYear. */}
          <p>
            © <CopyrightYear /> {SCHOOL_CONFIRMED.name}. All rights reserved.
          </p>
          <p>
            <Link href="/admin" className="transition-colors hover:text-navy-100">
              Staff sign-in
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
