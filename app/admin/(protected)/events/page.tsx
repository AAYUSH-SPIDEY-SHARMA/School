import Link from 'next/link';

import { AccessDenied } from '@/components/admin/AccessDenied';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { EmptyState } from '@/components/admin/EmptyState';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/Button';
import { deleteEvent } from '@/lib/actions/events';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { listEventsForAdmin } from '@/lib/queries/admin';

export const metadata = { title: 'Events' };

interface EventsAdminPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function EventsAdminPage({ searchParams }: EventsAdminPageProps) {
  const user = await requirePageSession('/admin/events');

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const { items, page, pageCount, total } = await listEventsForAdmin({
    page: params.page ? Number(params.page) : 1,
  });

  const now = new Date();

  const dateFormat: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Events"
        description="Open days, sports days, cultural programmes and examinations. Past events are kept rather than deleted — an event archive is a credibility signal for prospective families."
        action={{ label: 'New event', href: '/admin/events/new' }}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No events yet"
          description="Upcoming events give prospective parents a reason to visit the campus, and past events show an active school."
          action={{ label: 'Create the first event', href: '/admin/events/new' }}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <caption className="sr-only">Events, {total} in total</caption>
              <thead>
                <tr className="border-b border-border bg-surface-sunken">
                  <th scope="col" className="px-4 py-3 text-label font-medium">Event</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Date</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const finished = (item.endDate ?? item.startDate) < now;

                  return (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/events/${item.id}/edit`}
                          className="font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {item.title}
                        </Link>
                        {item.isAcademicCalendar ? (
                          <span className="ml-2 text-caption text-accent">Calendar</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-body-sm text-foreground-muted">
                        {item.startDate.toLocaleDateString('en-IN', dateFormat)}
                        {item.endDate
                          ? ` – ${item.endDate.toLocaleDateString('en-IN', dateFormat)}`
                          : ''}
                        <span className="block text-caption text-foreground-subtle">
                          {finished ? 'Past' : 'Upcoming'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/events/${item.id}/edit`}>Edit</Link>
                          </Button>
                          <DeleteButton
                            id={item.id}
                            label="this event"
                            action={deleteEvent}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination page={page} pageCount={pageCount} basePath="/admin/events" />
        </>
      )}
    </div>
  );
}
