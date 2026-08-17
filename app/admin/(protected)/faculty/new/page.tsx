import { AccessDenied } from '@/components/admin/AccessDenied';
import { FacultyForm } from '@/components/admin/FacultyForm';
import { PageHeader } from '@/components/admin/PageHeader';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { listDepartments } from '@/lib/queries/admin';

export const metadata = { title: 'Add teacher' };

export default async function NewFacultyPage() {
  const user = await requirePageSession('/admin/faculty/new');

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  const departments = await listDepartments();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Add teacher" />
      <FacultyForm departments={departments} />
    </div>
  );
}
