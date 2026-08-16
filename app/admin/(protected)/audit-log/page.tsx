import { AccessDenied } from '@/components/admin/AccessDenied';
import { EmptyState } from '@/components/admin/EmptyState';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { ADMIN_ONLY } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { listAuditLog } from '@/lib/queries/admin';
import { cn } from '@/lib/utils/cn';

export const metadata = { title: 'Audit log' };

interface AuditLogPageProps {
  searchParams: Promise<{ page?: string }>;
}

/** Actions worth visually distinguishing when scanning a long list. */
const NOTABLE = new Set(['DELETE', 'ROLE_CHANGE', 'LOGIN_FAILED', 'EXPORT']);

export default async function AuditLogPage({ searchParams }: AuditLogPageProps) {
  const user = await requirePageSession('/admin/audit-log');

  if (!ADMIN_ONLY.includes(user.role)) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const { items, page, pageCount, total } = await listAuditLog({
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit log"
        description="Who changed what, and when. Append-only — entries cannot be edited or removed by anyone, including administrators."
      />

      <p className="max-w-prose-measure rounded-md border border-border bg-surface-sunken px-4 py-3 text-body-sm text-foreground-muted">
        This log deliberately records <strong>that</strong> something changed,
        never the personal details involved. An enquiry entry names the record
        and the status, never the parent&rsquo;s name or phone number — otherwise
        this page would become a second, less protected copy of the most
        sensitive data on the site.
      </p>

      {items.length === 0 ? (
        <EmptyState
          title="Nothing recorded yet"
          description="Entries appear as staff sign in and change content."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full min-w-[48rem] border-collapse text-left">
              <caption className="sr-only">Audit entries, {total} in total</caption>
              <thead>
                <tr className="border-b border-border bg-surface-sunken">
                  <th scope="col" className="px-4 py-3 text-label font-medium">When</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Who</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Action</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">What</th>
                </tr>
              </thead>
              <tbody>
                {items.map((entry) => (
                  <tr key={entry.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-body-sm whitespace-nowrap text-foreground-muted">
                      {entry.createdAt.toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-body-sm text-foreground">
                      {entry.actorEmail}
                      {entry.ipAddress ? (
                        <span className="block text-caption text-foreground-subtle">
                          {entry.ipAddress}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-sm border px-2 py-0.5 text-caption font-medium',
                          NOTABLE.has(entry.action)
                            ? 'border-warning bg-warning-soft text-gold-900'
                            : 'border-border bg-surface-sunken text-foreground-muted',
                        )}
                      >
                        {entry.action.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-foreground-muted">
                      {entry.summary ?? `${entry.entityType} ${entry.entityId}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} pageCount={pageCount} basePath="/admin/audit-log" />
        </>
      )}
    </div>
  );
}
