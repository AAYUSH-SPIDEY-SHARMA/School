import Link from 'next/link';

import { AccessDenied } from '@/components/admin/AccessDenied';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { EmptyState } from '@/components/admin/EmptyState';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/Button';
import { deleteTestimonial } from '@/lib/actions/testimonials';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { listTestimonialsForAdmin } from '@/lib/queries/admin';

export const metadata = { title: 'Testimonials' };

interface TestimonialsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function TestimonialsAdminPage({
  searchParams,
}: TestimonialsPageProps) {
  const user = await requirePageSession('/admin/testimonials');

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const { items, page, pageCount, total } = await listTestimonialsForAdmin({
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Testimonials"
        description="What parents, alumni and students have actually said. Only publish quotes that were genuinely given, by people who agreed to have them shown."
        action={{ label: 'Add testimonial', href: '/admin/testimonials/new' }}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No testimonials yet"
          description="None are pre-filled, deliberately. Invented praise on a school website misleads families making a six-year decision."
          action={{ label: 'Add the first testimonial', href: '/admin/testimonials/new' }}
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <blockquote className="text-body text-foreground">
                      &ldquo;{item.quote.length > 180
                        ? `${item.quote.slice(0, 180)}…`
                        : item.quote}&rdquo;
                    </blockquote>
                    <p className="mt-2 text-body-sm text-foreground-muted">
                      {item.authorName}
                      {item.authorDetail ? ` — ${item.authorDetail}` : ''}
                      <span className="ml-2 text-caption text-foreground-subtle">
                        {item.authorType.toLowerCase()}
                      </span>
                      {item.featured ? (
                        <span className="ml-2 text-caption text-accent">Featured</span>
                      ) : null}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={item.status} />
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/testimonials/${item.id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteButton
                      id={item.id}
                      label="this testimonial"
                      action={deleteTestimonial}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <p className="sr-only">{total} testimonials in total</p>

          <Pagination page={page} pageCount={pageCount} basePath="/admin/testimonials" />
        </>
      )}
    </div>
  );
}
