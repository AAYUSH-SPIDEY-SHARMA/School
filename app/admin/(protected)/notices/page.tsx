import Link from 'next/link';

import { AccessDenied } from '@/components/admin/AccessDenied';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { EmptyState } from '@/components/admin/EmptyState';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { ExpiryBadge, StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/Button';
import { deleteNotice } from '@/lib/actions/notices';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { listNoticesForAdmin } from '@/lib/queries/admin';

export const metadata = { title: 'Notices' };

interface NoticesAdminPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function NoticesAdminPage({
  searchParams,
}: NoticesAdminPageProps) {
  const user = await requirePageSession('/admin/notices');

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const { items, page, pageCount, total } = await listNoticesForAdmin({
    page: params.page ? Number(params.page) : 1,
  });

  // One instant for the whole listing: every row is compared against the same
  // moment, and nothing reads the clock during render.
  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notices"
        description="Short operational messages for current families — holidays, exam schedules, circulars. Time-sensitive, and separate from News."
        action={{ label: 'New notice', href: '/admin/notices/new' }}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No notices yet"
          description="Notices are the messages current parents check most often. They expire automatically, so the list stays current without anyone having to remember."
          action={{ label: 'Create the first notice', href: '/admin/notices/new' }}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <caption className="sr-only">Notices, {total} in total</caption>
              <thead>
                <tr className="border-b border-border bg-surface-sunken">
                  <th scope="col" className="px-4 py-3 text-label font-medium">Title</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Category</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Expiry</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/notices/${item.id}/edit`}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {item.title}
                      </Link>
                      {item.pinned ? (
                        <span className="ml-2 text-caption text-accent">Pinned</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-body-sm text-foreground-muted">
                      {item.category.charAt(0) + item.category.slice(1).toLowerCase()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3">
                      <ExpiryBadge expiresAt={item.expiresAt} now={now} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/notices/${item.id}/edit`}>Edit</Link>
                        </Button>
                        <DeleteButton
                          id={item.id}
                          label="this notice"
                          action={deleteNotice}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} pageCount={pageCount} basePath="/admin/notices" />
        </>
      )}
    </div>
  );
}
