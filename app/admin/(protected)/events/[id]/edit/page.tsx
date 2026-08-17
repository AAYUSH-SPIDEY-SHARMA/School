import { notFound } from 'next/navigation';

import { AccessDenied } from '@/components/admin/AccessDenied';
import { EventForm } from '@/components/admin/EventForm';
import { PageHeader } from '@/components/admin/PageHeader';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { getEventForEdit } from '@/lib/queries/admin';

export const metadata = { title: 'Edit event' };

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const user = await requirePageSession();

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  const { id } = await params;
  const event = await getEventForEdit(id);

  if (!event) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Edit event" />

      <EventForm
        initial={{
          id: event.id,
          title: event.title,
          slug: event.slug,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          venue: event.venue ?? '',
          coverImageId: event.coverImageId ?? '',
          isAcademicCalendar: event.isAcademicCalendar,
          status: event.status,
          seoTitle: event.seoTitle ?? '',
          seoDescription: event.seoDescription ?? '',
        }}
      />
    </div>
  );
}
