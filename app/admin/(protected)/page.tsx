import { AlertTriangle, ArrowRight, Clock, Inbox } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import {
  getDashboardCounts,
  getStaleContentWarnings,
} from '@/lib/queries/admin';
import { CONTENT_ROLES } from '@/lib/auth/guards';

export const metadata = { title: 'Dashboard' };

function StatTile({
  label,
  value,
  href,
  emphasis = false,
}: {
  label: string;
  value: number;
  href: string;
  emphasis?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-border bg-surface p-5 transition-shadow hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <p className="text-caption text-foreground-muted">{label}</p>
      <p
        className={`mt-1 font-serif text-h2 ${
          emphasis && value > 0 ? 'text-accent' : 'text-foreground'
        }`}
      >
        {value}
      </p>
      <span className="mt-2 inline-flex items-center gap-1 text-caption text-primary">
        View
        <ArrowRight
          aria-hidden="true"
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const counts = await getDashboardCounts();

  /**
   * Freshness warnings are only fetched for roles that can act on them.
   * An ADMISSIONS_MANAGER cannot edit notices, so showing them a list of
   * expiring notices would be noise they have no way to resolve.
   */
  const warnings = CONTENT_ROLES.includes(counts.role)
    ? await getStaleContentWarnings()
    : null;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-serif text-h1 text-foreground">Dashboard</h1>
        <p className="mt-1 text-body text-foreground-muted">
          What needs attention today.
        </p>
      </header>

      {/* Enquiries first for those who can see them — an unanswered enquiry is
          a family waiting for a reply, which outranks any content task. */}
      {counts.canSeeEnquiries ? (
        <section aria-labelledby="admissions-heading">
          <h2
            id="admissions-heading"
            className="mb-3 text-overline text-foreground-muted uppercase"
          >
            Admissions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatTile
              label="New enquiries"
              value={counts.newEnquiries}
              href="/admin/enquiries?status=NEW"
              emphasis
            />
            <StatTile
              label="Open enquiries"
              value={counts.openEnquiries}
              href="/admin/enquiries"
            />
          </div>

          {counts.newEnquiries > 0 ? (
            <p className="mt-3 flex items-center gap-2 rounded-md border border-accent bg-gold-50 px-3 py-2 text-body-sm text-gold-900">
              <Inbox aria-hidden="true" className="size-4 shrink-0" />
              {counts.newEnquiries === 1
                ? '1 family is waiting for a first response.'
                : `${counts.newEnquiries} families are waiting for a first response.`}
            </p>
          ) : null}
        </section>
      ) : null}

      {counts.canSeeContent ? (
        <section aria-labelledby="content-heading">
          <h2
            id="content-heading"
            className="mb-3 text-overline text-foreground-muted uppercase"
          >
            Content
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Live notices" value={counts.noticesLive} href="/admin/notices" />
            <StatTile label="Upcoming events" value={counts.upcomingEvents} href="/admin/events" />
            <StatTile label="Published news" value={counts.newsPublished} href="/admin/news" />
            <StatTile label="Drafts" value={counts.newsDrafts} href="/admin/news?status=DRAFT" />
          </div>
        </section>
      ) : null}

      {/* Content freshness is an operational responsibility in v1 with no
          automation behind it, so the dashboard is where it gets surfaced.
          An unnoticed stale notice is precisely the failure found in reference
          research — a 2020 notice still live in 2026 (F-3). */}
      {warnings &&
      (warnings.expiringSoon.length > 0 || warnings.publishedWithoutExpiry > 0) ? (
        <section aria-labelledby="freshness-heading">
          <h2
            id="freshness-heading"
            className="mb-3 text-overline text-foreground-muted uppercase"
          >
            Keeping content current
          </h2>

          <div className="rounded-lg border border-border bg-surface p-5">
            {warnings.expiringSoon.length > 0 ? (
              <>
                <p className="flex items-center gap-2 text-body-sm font-medium text-foreground">
                  <Clock aria-hidden="true" className="size-4 text-warning" />
                  Expiring within a week
                </p>
                <ul className="mt-2 flex flex-col gap-1">
                  {warnings.expiringSoon.map((notice) => (
                    <li key={notice.id} className="text-body-sm text-foreground-muted">
                      {notice.title}
                      {notice.expiresAt ? (
                        <span className="text-foreground-subtle">
                          {' '}
                          — {notice.expiresAt.toLocaleDateString('en-IN')}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {warnings.publishedWithoutExpiry > 0 ? (
              <p className="mt-4 flex items-start gap-2 text-body-sm text-foreground-muted">
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-warning"
                />
                <span>
                  {warnings.publishedWithoutExpiry} published{' '}
                  {warnings.publishedWithoutExpiry === 1 ? 'notice has' : 'notices have'}{' '}
                  no expiry date. Without one, they stay live until somebody
                  remembers to remove them.
                </span>
              </p>
            ) : null}

            <Button asChild variant="ghost" size="sm" className="mt-4">
              <Link href="/admin/notices">Review notices</Link>
            </Button>
          </div>
        </section>
      ) : null}

      {/* ⚠️ Launch dependency, shown to staff rather than buried in a document. */}
      <section
        aria-labelledby="assets-heading"
        className="rounded-lg border border-dashed border-border-strong bg-surface-sunken p-5"
      >
        <h2 id="assets-heading" className="text-body font-medium text-foreground">
          The site is still using placeholder school details
        </h2>
        <p className="mt-2 max-w-prose-measure text-body-sm text-foreground-muted">
          School name, address, phone number, statistics and photographs are
          shown as bracketed placeholders until real values are supplied. Nothing
          has been invented to fill the gaps. Settings is where the text values
          go once you have them.
        </p>
      </section>
    </div>
  );
}
