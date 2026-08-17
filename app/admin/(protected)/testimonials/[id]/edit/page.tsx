import { notFound } from 'next/navigation';

import { AccessDenied } from '@/components/admin/AccessDenied';
import { PageHeader } from '@/components/admin/PageHeader';
import { TestimonialForm } from '@/components/admin/TestimonialForm';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { getTestimonialForEdit } from '@/lib/queries/admin';

export const metadata = { title: 'Edit testimonial' };

interface EditTestimonialPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTestimonialPage({
  params,
}: EditTestimonialPageProps) {
  const user = await requirePageSession();

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  const { id } = await params;
  const testimonial = await getTestimonialForEdit(id);

  if (!testimonial) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Edit testimonial" />

      <TestimonialForm
        initial={{
          id: testimonial.id,
          quote: testimonial.quote,
          authorName: testimonial.authorName,
          authorType: testimonial.authorType,
          authorDetail: testimonial.authorDetail ?? '',
          photoId: testimonial.photoId ?? '',
          featured: testimonial.featured,
          status: testimonial.status,
        }}
      />
    </div>
  );
}
