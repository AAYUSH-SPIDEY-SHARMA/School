import { AccessDenied } from '@/components/admin/AccessDenied';
import { NoticeForm } from '@/components/admin/NoticeForm';
import { PageHeader } from '@/components/admin/PageHeader';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';

export const metadata = { title: 'New notice' };

export default async function NewNoticePage() {
  const user = await requirePageSession('/admin/notices/new');

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New notice"
        description="Set an expiry date so the notice removes itself when it stops being relevant."
      />
      <NoticeForm />
    </div>
  );
}
