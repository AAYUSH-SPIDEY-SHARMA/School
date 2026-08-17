import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  ImageIcon,
  Microscope,
  Palette,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { PlaceholderText } from '@/components/ui/PlaceholderText';
import {
  ACADEMIC_STAGES,
  CLASS_LEVEL_LABELS,
} from '@/lib/constants/classLevels';
import {
  ADMISSIONS_CTA,
  BOARD,
  SCHOOL_CONFIRMED,
  SCHOOL_PLACEHOLDERS,
} from '@/lib/constants/site';

export const metadata = {
  /**
   * `absolute` so the root layout's "%s · School Name" template does not append
   * the school's name to a title that already contains it.
   */
  title: {
    absolute: `${SCHOOL_CONFIRMED.name} — ${BOARD} school in ${SCHOOL_CONFIRMED.city}`,
  },
};

/**
 * Homepage.
 *
 * Ordered by the parent's decision journey, not by what is easiest to build
 * (08_PAGE_SPECIFICATIONS). The admissions path is surfaced immediately and
 * again at the foot, because burying admissions is the specific sector gap this
 * project exists to close (45_RESEARCH_SOURCES F-1).
 *
 * NO CAROUSEL. An auto-advancing hero moves the LCP element, competes with the
 * primary CTA, and is read past by most visitors (10_DESIGN_SYSTEM).
 *
 * ⚠️ Sections that need real school content show a clearly-marked awaiting
 * state rather than invented copy or stock imagery. Nothing here is fabricated.
 */

const STAGE_ICONS = [BookOpen, Sparkles, Microscope, GraduationCap] as const;

export default function HomePage() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="ink-surface relative overflow-hidden">
        {/* Depth without imagery — the campus photographs have not been
            supplied yet (OD-003), and stock photography of generic children is
            recognisable and destroys trust. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_15%,var(--color-navy-600),transparent_60%)] opacity-70"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 size-[28rem] rounded-full border border-gold-500/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -bottom-40 size-[22rem] rounded-full border border-gold-500/10"
        />

        <div className="shell relative py-20 md:py-28 lg:py-36">
          <div className="max-w-3xl">
            <p className="text-overline text-gold-400 uppercase">
              {BOARD} · Nursery to Class 10 · {SCHOOL_CONFIRMED.city}
            </p>

            <h1 className="mt-6 font-serif text-display">
              <span className="block text-gold-400">Curiosity, taught</span>
              <span className="block text-cream-50">with care.</span>
            </h1>

            <p className="mt-7 max-w-xl text-body-lg text-navy-100">
              <PlaceholderText value={SCHOOL_PLACEHOLDERS.tagline} />
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild variant="onInk" size="lg">
                <Link href={ADMISSIONS_CTA.enquireHref}>
                  Enquire about admission
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="onInkOutline" size="lg">
                <Link href="/about">Discover the school</Link>
              </Button>
            </div>

            <p className="mt-8 text-body-sm text-navy-300">
              {SCHOOL_CONFIRMED.fullAddress}
            </p>
          </div>
        </div>
      </section>

      {/* ── TRUST BAND ────────────────────────────────────────────────────── */}
      <section aria-labelledby="glance-heading" className="border-b border-border bg-surface">
        <h2 id="glance-heading" className="sr-only">
          At a glance
        </h2>

        <div className="shell grid grid-cols-2 gap-y-10 py-12 lg:grid-cols-4">
          {[
            { label: 'Established', value: SCHOOL_PLACEHOLDERS.establishedYear },
            { label: 'Students', value: SCHOOL_PLACEHOLDERS.studentCount },
            { label: 'Teachers', value: SCHOOL_PLACEHOLDERS.facultyCount },
            { label: 'Board result', value: SCHOOL_PLACEHOLDERS.boardResultPct },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              {/* ⚠️ These are the highest-risk numbers on the site. They stay
                  as visible placeholders until the school supplies figures it
                  can evidence — a false board result misleads a family making
                  a six-year decision (OD-004). */}
              <p className="font-serif text-h2 text-accent-ink">
                <PlaceholderText value={stat.value} />
              </p>
              <p className="mt-1 text-overline text-foreground-subtle uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOUNDATION ────────────────────────────────────────────────────── */}
      <section aria-labelledby="foundation-heading" className="section-y">
        <div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-overline text-accent-ink uppercase">Our foundation</p>
            <h2 id="foundation-heading" className="gold-rule mt-3 font-serif text-h1">
              A school built around the child
            </h2>

            <div className="mt-8 flex flex-col gap-4 text-body text-foreground-muted">
              <p className="max-w-prose-measure">
                <PlaceholderText
                  value="[ABOUT_INTRO_PARAGRAPH]"
                  className="block"
                />
              </p>
              <p className="max-w-prose-measure text-body-sm">
                This introduction is written by the school. Nothing has been
                drafted on its behalf — a school&rsquo;s own account of itself is
                the one thing a website cannot invent.
              </p>
            </div>

            <Button asChild variant="secondary" className="mt-8">
              <Link href="/about">
                About {SCHOOL_PLACEHOLDERS.shortName}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {/* Gold-framed media slot, awaiting real campus photography. */}
          <div className="gold-frame aspect-4/3 bg-surface-sunken p-1">
            <div className="flex size-full flex-col items-center justify-center gap-3 text-center">
              <ImageIcon aria-hidden="true" className="size-9 text-gold-600" />
              <p className="px-6 text-body-sm text-foreground-muted">
                Campus photograph
              </p>
              <p className="px-8 text-caption text-foreground-subtle">
                Real photographs of {SCHOOL_PLACEHOLDERS.shortName} go here.
                Stock images of generic children are recognisable and cost more
                trust than they buy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ACADEMIC STAGES ───────────────────────────────────────────────── */}
      <section
        aria-labelledby="academics-heading"
        className="section-y bg-surface-sunken"
      >
        <div className="shell">
          <div className="text-center">
            <p className="text-overline text-accent-ink uppercase">Academics</p>
            <h2
              id="academics-heading"
              className="gold-rule gold-rule-center mt-3 font-serif text-h1"
            >
              Nursery through Class 10
            </h2>
            <p className="mx-auto mt-6 max-w-prose-measure text-body text-foreground-muted">
              Four stages, each with its own approach — from first steps in
              pre-primary to the {BOARD} board year.
            </p>
          </div>

          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ACADEMIC_STAGES.map((stage, index) => {
              const Icon = STAGE_ICONS[index] ?? BookOpen;

              return (
                <li key={stage.slug}>
                  <Link
                    href={`/academics/${stage.slug}`}
                    className="group flex h-full flex-col rounded-lg border border-border bg-surface p-7 transition-all duration-(--duration-base) hover:-translate-y-1 hover:border-gold-400 hover:shadow-lg"
                  >
                    <span className="grid size-12 place-items-center rounded-sm bg-navy-800 text-gold-400 transition-colors group-hover:bg-navy-900">
                      <Icon aria-hidden="true" className="size-6" />
                    </span>

                    <h3 className="mt-5 font-serif text-h4">{stage.label}</h3>

                    {/* The class range, rather than a count — "Class 1 to
                        Class 5" is what a parent is actually looking for. */}
                    <p className="mt-2 text-body-sm text-foreground-muted">
                      {CLASS_LEVEL_LABELS[stage.levels[0]]} to{' '}
                      {CLASS_LEVEL_LABELS[stage.levels[stage.levels.length - 1]!]}
                    </p>

                    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-body-sm font-medium text-cta">
                      Explore
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── CAMPUS LIFE ───────────────────────────────────────────────────── */}
      <section aria-labelledby="life-heading" className="section-y">
        <div className="shell">
          <div className="max-w-2xl">
            <p className="text-overline text-accent-ink uppercase">Campus life</p>
            <h2 id="life-heading" className="gold-rule mt-3 font-serif text-h1">
              More than the timetable
            </h2>
          </div>

          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Palette,
                title: 'Arts & culture',
                body: 'Music, dance, drama and the visual arts through the school year.',
                href: '/campus-life/arts',
              },
              {
                icon: Users,
                title: 'Sports & clubs',
                body: 'Team games, athletics and student-led clubs.',
                href: '/campus-life/sports',
              },
              {
                icon: ShieldCheck,
                title: 'Safety & wellbeing',
                body: 'How the school looks after children through the day.',
                href: '/about/safety',
              },
            ].map((card) => (
              <li key={card.href}>
                <Link
                  href={card.href}
                  className="group flex h-full flex-col rounded-lg border border-border bg-surface p-7 transition-all duration-(--duration-base) hover:-translate-y-1 hover:border-gold-400 hover:shadow-lg"
                >
                  <card.icon aria-hidden="true" className="size-7 text-gold-700" />
                  <h3 className="mt-5 font-serif text-h4">{card.title}</h3>
                  <p className="mt-2 text-body-sm text-foreground-muted">{card.body}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-body-sm font-medium text-cta">
                    Read more
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── ADMISSIONS BAND ───────────────────────────────────────────────── */}
      <section aria-labelledby="admissions-heading" className="ink-surface relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,var(--color-navy-600),transparent_65%)] opacity-60"
        />

        <div className="shell relative flex flex-col items-start gap-8 py-16 md:py-20 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-overline text-gold-400 uppercase">Admissions</p>
            <h2 id="admissions-heading" className="mt-3 font-serif text-h1">
              Come and see the school
            </h2>
            <p className="mt-4 max-w-prose-measure text-body-lg text-navy-100">
              Send an enquiry and the admissions team will get back to you. It
              takes a minute, and you do not need to create an account.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-4">
            <Button asChild variant="onInk" size="lg">
              <Link href={ADMISSIONS_CTA.enquireHref}>
                Enquire now
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="onInkOutline" size="lg">
              <Link href={ADMISSIONS_CTA.href}>How admission works</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
