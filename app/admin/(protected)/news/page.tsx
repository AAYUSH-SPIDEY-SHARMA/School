import type { ContentStatus } from '@prisma/client';
import Link from 'next/link';

import { DeleteButton } from '@/components/admin/DeleteButton';
import { EmptyState } from '@/components/admin/EmptyState';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { AccessDenied } from '@/components/admin/AccessDenied';
import { Button } from '@/components/ui/Button';
import { deleteNews } from '@/lib/actions/news';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { listNewsForAdmin } from '@/lib/queries/admin';

export const metadata = { title: 'News' };

interface NewsAdminPageProps {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}

function parseStatus(value: string | undefined): ContentStatus | undefined {
  return value === 'DRAFT' || value === 'PUBLISHED' || value === 'ARCHIVED'
    ? value
    : undefined;
}

export default async function NewsAdminPage({ searchParams }: NewsAdminPageProps) {
  const user = await requirePageSession('/admin/news');

  // Page-level check for a decent experience. The real boundary is inside
  // `listNewsForAdmin` and every news action, both of which re-check.
  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const status = parseStatus(params.status);

  const { items, page, pageCount, total } = await listNewsForAdmin({
    page: params.page ? Number(params.page) : 1,
    status,
    search: params.search,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="News"
        description="Editorial articles for prospective and current families. Long-lived — for time-sensitive operational messages, use Notices instead."
        action={{ label: 'New article', href: '/admin/news/new' }}
      />

      <div className="flex flex-wrap gap-2">
        {[
          { label: 'All', value: undefined },
          { label: 'Published', value: 'PUBLISHED' },
          { label: 'Drafts', value: 'DRAFT' },
          { label: 'Archived', value: 'ARCHIVED' },
        ].map((filter) => {
          const active = params.status === filter.value;
          return (
            <Link
              key={filter.label}
              href={filter.value ? `/admin/news?status=${filter.value}` : '/admin/news'}
              aria-current={active ? 'true' : undefined}
              className={`inline-flex min-h-9 items-center rounded-md border px-3 text-body-sm transition-colors ${
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface text-foreground-muted hover:bg-surface-sunken'
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={status ? `No ${status.toLowerCase()} articles` : 'No articles yet'}
          description="News articles appear on the public site and on the homepage. Nothing has been created yet — no sample content is provided, because invented school news would be misleading."
          action={{ label: 'Write the first article', href: '/admin/news/new' }}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <caption className="sr-only">
                News articles, {total} in total
              </caption>
              <thead>
                <tr className="border-b border-border bg-surface-sunken">
                  <th scope="col" className="px-4 py-3 text-label font-medium">Title</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Updated</th>
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
                        href={`/admin/news/${item.id}/edit`}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {item.title}
                      </Link>
                      {item.featured ? (
                        <span className="ml-2 text-caption text-accent">Featured</span>
                      ) : null}
                      <p className="text-caption text-foreground-subtle">/news/{item.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-body-sm text-foreground-muted">
                      {item.updatedAt.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/news/${item.id}/edit`}>Edit</Link>
                        </Button>
                        <DeleteButton
                          id={item.id}
                          label="this article"
                          action={deleteNews}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            pageCount={pageCount}
            basePath="/admin/news"
            params={{ status: params.status }}
          />
        </>
      )}
    </div>
  );
}
