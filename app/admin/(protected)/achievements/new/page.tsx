import { AccessDenied } from '@/components/admin/AccessDenied';
import { AchievementForm } from '@/components/admin/AchievementForm';
import { PageHeader } from '@/components/admin/PageHeader';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';

export const metadata = { title: 'Add achievement' };

export default async function NewAchievementPage() {
  const user = await requirePageSession('/admin/achievements/new');

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Add achievement" />
      <AchievementForm />
    </div>
  );
}
