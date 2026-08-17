import { notFound } from 'next/navigation';

import { AccessDenied } from '@/components/admin/AccessDenied';
import { AchievementForm } from '@/components/admin/AchievementForm';
import { PageHeader } from '@/components/admin/PageHeader';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { getAchievementForEdit } from '@/lib/queries/admin';

export const metadata = { title: 'Edit achievement' };

interface EditAchievementPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAchievementPage({
  params,
}: EditAchievementPageProps) {
  const user = await requirePageSession();

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  const { id } = await params;
  const achievement = await getAchievementForEdit(id);

  if (!achievement) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Edit achievement" />

      <AchievementForm
        initial={{
          id: achievement.id,
          title: achievement.title,
          description: achievement.description ?? '',
          type: achievement.type,
          achieverName: achievement.achieverName ?? '',
          level: achievement.level ?? '',
          achievedOn: achievement.achievedOn,
          imageId: achievement.imageId ?? '',
          featured: achievement.featured,
          status: achievement.status,
        }}
      />
    </div>
  );
}
