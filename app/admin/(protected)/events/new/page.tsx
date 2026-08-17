import { AccessDenied } from '@/components/admin/AccessDenied';
import { EventForm } from '@/components/admin/EventForm';
import { PageHeader } from '@/components/admin/PageHeader';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';

export const metadata = { title: 'New event' };

export default async function NewEventPage() {
  const user = await requirePageSession('/admin/events/new');

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="New event" />
      <EventForm />
    </div>
  );
}
