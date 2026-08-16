import { notFound } from 'next/navigation';

import { AccessDenied } from '@/components/admin/AccessDenied';
import { PageHeader } from '@/components/admin/PageHeader';
import { UserForm } from '@/components/admin/UserForm';
import { ADMIN_ONLY } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { listUsers } from '@/lib/queries/admin';

export const metadata = { title: 'Edit account' };

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const user = await requirePageSession();

  if (!ADMIN_ONLY.includes(user.role)) {
    return <AccessDenied />;
  }

  const { id } = await params;

  // `listUsers` already excludes passwordHash by construction, so reusing it
  // here avoids writing a second select that might not.
  const account = (await listUsers()).find((row) => row.id === id);

  if (!account) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Edit account"
        description="Changing the role or deactivating the account signs the person out immediately — it does not wait for their session to expire."
      />

      <UserForm
        initial={{
          id: account.id,
          name: account.name,
          email: account.email,
          role: account.role,
          isActive: account.isActive,
        }}
      />
    </div>
  );
}
