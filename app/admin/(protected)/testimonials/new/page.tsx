import { AccessDenied } from '@/components/admin/AccessDenied';
import { PageHeader } from '@/components/admin/PageHeader';
import { TestimonialForm } from '@/components/admin/TestimonialForm';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';

export const metadata = { title: 'Add testimonial' };

export default async function NewTestimonialPage() {
  const user = await requirePageSession('/admin/testimonials/new');

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Add testimonial" />
      <TestimonialForm />
    </div>
  );
}
