import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

import { CopyrightYear } from '@/components/layout/CopyrightYear';
import { PlaceholderText } from '@/components/ui/PlaceholderText';
import {
  ADMISSIONS_CTA,
  BOARD,
  FOOTER_LEGAL_LINKS,
  PRIMARY_NAV,
  SCHOOL_PLACEHOLDERS,
} from '@/lib/constants/site';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-navy-900 text-neutral-200">
      <div className="mx-auto max-w-(--container-2xl) px-5 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Identity */}
          <div className="lg:col-span-1">
            <p className="font-serif text-h4 font-semibold text-neutral-0">
              <PlaceholderText value={SCHOOL_PLACEHOLDERS.name} />
            </p>
            <p className="mt-3 text-body-sm text-neutral-300">
              <PlaceholderText value={SCHOOL_PLACEHOLDERS.tagline} />
            </p>
            <p className="mt-4 text-caption text-neutral-400">
              {BOARD} affiliation no.{' '}
              <PlaceholderText value={SCHOOL_PLACEHOLDERS.affiliationNumber} />
            </p>
          </div>

          {/* Explore */}
          <nav aria-labelledby="footer-explore">
            <h2
              id="footer-explore"
              className="text-overline text-neutral-400 uppercase"
            >
              Explore
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-sm text-neutral-300 transition-colors hover:text-neutral-0"
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

          {/* Contact */}
          <div>
            <h2 className="text-overline text-neutral-400 uppercase">Contact</h2>
            <ul className="mt-4 flex flex-col gap-3 text-body-sm">
              <li className="flex gap-3">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-neutral-400"
                />
                <address className="not-italic text-neutral-300">
                  <PlaceholderText value={SCHOOL_PLACEHOLDERS.address} />
                </address>
              </li>
              <li className="flex gap-3">
                <Phone
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-neutral-400"
                />
                <a
                  href={`tel:${SCHOOL_PLACEHOLDERS.phone}`}
                  className="text-neutral-300 transition-colors hover:text-neutral-0"
                >
                  <PlaceholderText value={SCHOOL_PLACEHOLDERS.phone} />
                </a>
              </li>
              <li className="flex gap-3">
                <Mail
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-neutral-400"
                />
                <a
                  href={`mailto:${SCHOOL_PLACEHOLDERS.email}`}
                  className="text-neutral-300 transition-colors hover:text-neutral-0"
                >
                  <PlaceholderText value={SCHOOL_PLACEHOLDERS.email} />
                </a>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h2 className="text-overline text-neutral-400 uppercase">
              Information
            </h2>
            <ul className="mt-4 flex flex-col gap-2 text-body-sm">
              <li>
                <Link
                  href="/downloads"
                  className="text-neutral-300 transition-colors hover:text-neutral-0"
                >
                  Downloads &amp; Mandatory Disclosure
                </Link>
              </li>
              <li>
                <Link
                  href="/notices"
                  className="text-neutral-300 transition-colors hover:text-neutral-0"
                >
                  Notices
                </Link>
              </li>
              {FOOTER_LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 transition-colors hover:text-neutral-0"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Safeguarding takedown route.
                48_MEDIA_CONSENT_AND_CHILD_SAFETY requires a PUBLISHED contact
                for image-removal requests. Any parent may ask for a photograph
                to be removed without justifying the request. */}
            <p className="mt-6 text-caption text-neutral-400">
              To request removal of a photograph, contact{' '}
              <a
                href={`mailto:${SCHOOL_PLACEHOLDERS.email}`}
                className="underline underline-offset-2 hover:text-neutral-200"
              >
                <PlaceholderText value={SCHOOL_PLACEHOLDERS.email} />
              </a>
              . Requests are actioned promptly and without question.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-neutral-700 pt-6 text-caption text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          {/* The year is computed, never typed — see CopyrightYear. */}
          <p>
            © <CopyrightYear />{' '}
            <PlaceholderText value={SCHOOL_PLACEHOLDERS.name} />. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
