import type { EnquiryStatus } from '@prisma/client';
import Link from 'next/link';

import { AccessDenied } from '@/components/admin/AccessDenied';
import { EmptyState } from '@/components/admin/EmptyState';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { ENQUIRY_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { CLASS_LEVEL_LABELS, isClassLevel } from '@/lib/constants/classLevels';
import { getEnquiryStatusCounts, listEnquiries } from '@/lib/queries/enquiries';
import { cn } from '@/lib/utils/cn';

export const metadata = { title: 'Enquiries' };

interface EnquiriesPageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

const STATUSES: readonly { value: EnquiryStatus; label: string }[] = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

function parseStatus(value: string | undefined): EnquiryStatus | undefined {
  return STATUSES.some((status) => status.value === value)
    ? (value as EnquiryStatus)
    : undefined;
}

export default async function EnquiriesPage({ searchParams }: EnquiriesPageProps) {
  const user = await requirePageSession('/admin/enquiries');

  /**
   * ⚠️ EDITOR MUST NOT REACH THIS PAGE.
   *
   * This check is the courteous one; `listEnquiries` re-checks and would throw
   * regardless. Both exist because the page guard protects browsing and the
   * query guard protects the data.
   */
  if (!ENQUIRY_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const status = parseStatus(params.status);

  const [{ items, page, pageCount, total }, counts] = await Promise.all([
    listEnquiries({
      page: params.page ? Number(params.page) : 1,
      status,
    }),
    getEnquiryStatusCounts(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Admission enquiries"
        description="Every enquiry submitted through the website. These records contain personal details about parents and children — treat them accordingly."
      />

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/enquiries"
          aria-current={!status ? 'true' : undefined}
          className={cn(
            'inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-body-sm transition-colors',
            !status
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-surface text-foreground-muted hover:bg-surface-sunken',
          )}
        >
          All
          <span className="text-caption opacity-80">{total}</span>
        </Link>

        {STATUSES.map((option) => {
          const active = status === option.value;
          const count = counts[option.value] ?? 0;

          return (
            <Link
              key={option.value}
              href={`/admin/enquiries?status=${option.value}`}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-body-sm transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface text-foreground-muted hover:bg-surface-sunken',
                option.value === 'NEW' && count > 0 && !active
                  ? 'border-accent text-gold-900'
                  : '',
              )}
            >
              {option.label}
              <span className="text-caption opacity-80">{count}</span>
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={status ? `No ${status.toLowerCase()} enquiries` : 'No enquiries yet'}
          description="Enquiries submitted through the website appear here. Nothing is seeded — every record in this list is a real family."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full min-w-[48rem] border-collapse text-left">
              <caption className="sr-only">
                Admission enquiries, {total} in total
              </caption>
              <thead>
                <tr className="border-b border-border bg-surface-sunken">
                  <th scope="col" className="px-4 py-3 text-label font-medium">Parent</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Class</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Assigned</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Received</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/enquiries/${item.id}`}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {item.parentName}
                      </Link>
                      <p className="text-caption text-foreground-subtle">
                        {item.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-foreground-muted">
                      {isClassLevel(item.classApplying)
                        ? CLASS_LEVEL_LABELS[item.classApplying]
                        : item.classApplying}
                      <span className="block text-caption text-foreground-subtle">
                        {item.academicYear}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-sm border px-2 py-0.5 text-caption font-medium',
                          item.status === 'NEW'
                            ? 'border-accent bg-gold-50 text-gold-900'
                            : 'border-border bg-surface-sunken text-foreground-muted',
                        )}
                      >
                        {item.status.replace('_', ' ').toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-foreground-muted">
                      {item.assignedTo?.name ?? (
                        <span className="text-foreground-subtle">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-body-sm text-foreground-muted">
                      {item.createdAt.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            pageCount={pageCount}
            basePath="/admin/enquiries"
            params={{ status: params.status }}
          />
        </>
      )}
    </div>
  );
}
