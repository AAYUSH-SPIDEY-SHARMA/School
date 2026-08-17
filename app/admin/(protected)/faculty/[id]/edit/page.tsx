import { notFound } from 'next/navigation';

import { AccessDenied } from '@/components/admin/AccessDenied';
import { FacultyForm } from '@/components/admin/FacultyForm';
import { PageHeader } from '@/components/admin/PageHeader';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { getFacultyForEdit, listDepartments } from '@/lib/queries/admin';

export const metadata = { title: 'Edit teacher' };

interface EditFacultyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFacultyPage({ params }: EditFacultyPageProps) {
  const user = await requirePageSession();

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  const { id } = await params;
  const [faculty, departments] = await Promise.all([
    getFacultyForEdit(id),
    listDepartments(),
  ]);

  if (!faculty) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Edit teacher" />

      <FacultyForm
        departments={departments}
        initial={{
          id: faculty.id,
          name: faculty.name,
          slug: faculty.slug,
          designation: faculty.designation,
          qualification: faculty.qualification ?? '',
          experienceYears: faculty.experienceYears,
          bio: faculty.bio ?? '',
          photoId: faculty.photoId ?? '',
          departmentId: faculty.departmentId ?? '',
          isLeadership: faculty.isLeadership,
          displayOrder: faculty.displayOrder,
          status: faculty.status,
          seoTitle: faculty.seoTitle ?? '',
          seoDescription: faculty.seoDescription ?? '',
        }}
      />
    </div>
  );
}
