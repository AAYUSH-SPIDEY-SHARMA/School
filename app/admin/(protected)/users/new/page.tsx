import { AccessDenied } from '@/components/admin/AccessDenied';
import { PageHeader } from '@/components/admin/PageHeader';
import { UserForm } from '@/components/admin/UserForm';
import { ADMIN_ONLY } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';

export const metadata = { title: 'New account' };

export default async function NewUserPage() {
  const user = await requirePageSession('/admin/users/new');

  if (!ADMIN_ONLY.includes(user.role)) {
    return <AccessDenied />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New staff account"
        description="Give the person the least access that lets them do their job. Roles can be changed later, and every change is recorded."
      />
      <UserForm />
    </div>
  );
}
