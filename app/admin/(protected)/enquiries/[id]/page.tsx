import { ArrowLeft, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AccessDenied } from '@/components/admin/AccessDenied';
import { EnquiryControls } from '@/components/admin/EnquiryControls';
import { Button } from '@/components/ui/Button';
import { ENQUIRY_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { CLASS_LEVEL_LABELS, isClassLevel } from '@/lib/constants/classLevels';
import { getAssignableStaff, getEnquiry } from '@/lib/queries/enquiries';

export const metadata = { title: 'Enquiry' };

interface EnquiryDetailPageProps {
  params: Promise<{ id: string }>;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-3 last:border-0 sm:flex-row sm:gap-4">
      <dt className="text-body-sm text-foreground-muted sm:w-40 sm:shrink-0">
        {label}
      </dt>
      <dd className="text-body text-foreground">{value}</dd>
    </div>
  );
}

export default async function EnquiryDetailPage({ params }: EnquiryDetailPageProps) {
  const user = await requirePageSession();

  if (!ENQUIRY_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  const { id } = await params;
  const [enquiry, staff] = await Promise.all([
    getEnquiry(id),
    getAssignableStaff(),
  ]);

  if (!enquiry) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href="/admin/enquiries">
            <ArrowLeft aria-hidden="true" className="size-4" />
            All enquiries
          </Link>
        </Button>

        <h1 className="mt-2 font-serif text-h1 text-foreground">
          {enquiry.parentName}
        </h1>
        <p className="mt-1 text-body text-foreground-muted">
          Enquiry received{' '}
          {enquiry.createdAt.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Contact actions first — the job here is to ring the family back, and
          a tel: link is one tap on the phone most staff will be holding. */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <a href={`tel:${enquiry.phone}`}>
            <Phone aria-hidden="true" />
            Call {enquiry.phone}
          </a>
        </Button>
        <Button asChild variant="secondary">
          <a href={`mailto:${enquiry.email}`}>
            <Mail aria-hidden="true" />
            Email
          </a>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section
          aria-labelledby="details-heading"
          className="rounded-lg border border-border bg-surface p-5 lg:col-span-2"
        >
          <h2 id="details-heading" className="text-h4 font-medium text-foreground">
            Enquiry details
          </h2>

          <dl className="mt-3">
            <DetailRow label="Parent name" value={enquiry.parentName} />
            <DetailRow label="Phone" value={enquiry.phone} />
            <DetailRow label="Email" value={enquiry.email} />
            <DetailRow
              label="Child's name"
              value={
                enquiry.studentName ?? (
                  /* Optional by design — the school can follow up without it,
                     and collecting it by default would mean holding
                     identifying information about a child for every casual
                     enquiry. */
                  <span className="text-foreground-subtle">Not provided</span>
                )
              }
            />
            <DetailRow
              label="Class applying for"
              value={
                isClassLevel(enquiry.classApplying)
                  ? CLASS_LEVEL_LABELS[enquiry.classApplying]
                  : enquiry.classApplying
              }
            />
            <DetailRow label="Academic year" value={enquiry.academicYear} />
            <DetailRow
              label="Locality"
              value={
                enquiry.locality ?? (
                  <span className="text-foreground-subtle">Not provided</span>
                )
              }
            />
            <DetailRow
              label="Message"
              value={
                enquiry.message ? (
                  <span className="whitespace-pre-wrap">{enquiry.message}</span>
                ) : (
                  <span className="text-foreground-subtle">No message</span>
                )
              }
            />
            <DetailRow
              label="Consent given"
              value={enquiry.consentAt.toLocaleString('en-IN')}
            />
          </dl>
        </section>

        <aside className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-h4 font-medium text-foreground">Manage</h2>
          <div className="mt-4">
            <EnquiryControls
              enquiryId={enquiry.id}
              status={enquiry.status}
              assignedToId={enquiry.assignedTo?.id ?? null}
              staff={staff}
            />
          </div>
        </aside>
      </div>

      <section aria-labelledby="notes-heading">
        <h2 id="notes-heading" className="text-h4 font-medium text-foreground">
          Follow-up notes
        </h2>

        {enquiry.notes.length === 0 ? (
          <p className="mt-2 text-body-sm text-foreground-muted">
            No notes yet. Recording each call here is what stops two people
            ringing the same family.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {enquiry.notes.map((note) => (
              <li
                key={note.id}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <p className="whitespace-pre-wrap text-body text-foreground">
                  {note.body}
                </p>
                <p className="mt-2 text-caption text-foreground-subtle">
                  {note.author.name} ·{' '}
                  {note.createdAt.toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
