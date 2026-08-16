import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { PlaceholderText } from '@/components/ui/PlaceholderText';
import { ADMISSIONS_CTA, SCHOOL_PLACEHOLDERS } from '@/lib/constants/site';

/**
 * Homepage.
 *
 * Ordered by the parent's decision journey, not by what is easiest to build
 * (08_PAGE_SPECIFICATIONS). Sections are added as their data layer lands; the
 * hero and the admissions path come first because surfacing admissions is the
 * specific sector gap this project exists to close (45_RESEARCH_SOURCES F-1).
 *
 * NO CAROUSEL. An auto-advancing hero moves the LCP element, competes with the
 * primary CTA and is read past by most visitors (10_DESIGN_SYSTEM).
 */
export default function HomePage() {
  return (
    <>
      <section className="border-b border-border bg-linear-to-b from-surface-sunken to-background">
        <div className="mx-auto max-w-(--container-2xl) px-5 py-20 md:px-8 md:py-28">
          <div className="max-w-3xl">
            <p className="text-overline text-accent uppercase">
              Admissions open for{' '}
              <PlaceholderText value={SCHOOL_PLACEHOLDERS.academicYear} />
            </p>

            <h1 className="mt-4 font-serif text-display text-primary">
              <PlaceholderText value={SCHOOL_PLACEHOLDERS.name} />
            </h1>

            <p className="mt-6 max-w-prose-measure text-body-lg text-foreground-muted">
              <PlaceholderText value={SCHOOL_PLACEHOLDERS.tagline} />
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild variant="accent" size="lg">
                <Link href={ADMISSIONS_CTA.enquireHref}>
                  Enquire about admission
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/about">About the school</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ⚠️ Build status marker — removed before launch.
          Remaining homepage sections (trust statistics, academic overview,
          facilities, news and notices, testimonials, admissions band) depend on
          the data layer and on school-supplied content. They are specified in
          08_PAGE_SPECIFICATIONS and are not stubbed with invented content. */}
      <section className="section-y">
        <div className="mx-auto max-w-(--container-2xl) px-5 md:px-8">
          <div className="rounded-lg border border-dashed border-border-strong bg-surface-sunken p-8">
            <h2 className="font-serif text-h3 text-foreground">
              Content awaiting school assets
            </h2>
            <p className="mt-3 max-w-prose-measure text-body text-foreground-muted">
              The remaining homepage sections are driven by real school content —
              photography, statistics, faculty and notices. None of it is
              invented here. See{' '}
              <code className="rounded-sm bg-surface px-1 py-0.5 text-body-sm">
                BLUEPRINT/51_SCHOOL_ASSET_REQUEST.md
              </code>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
