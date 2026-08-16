import { notFound } from 'next/navigation';

import { AccessDenied } from '@/components/admin/AccessDenied';
import { NoticeForm } from '@/components/admin/NoticeForm';
import { PageHeader } from '@/components/admin/PageHeader';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { getNoticeForEdit } from '@/lib/queries/admin';

export const metadata = { title: 'Edit notice' };

interface EditNoticePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNoticePage({ params }: EditNoticePageProps) {
  const user = await requirePageSession();

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  const { id } = await params;
  const notice = await getNoticeForEdit(id);

  if (!notice) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Edit notice" />

      <NoticeForm
        initial={{
          id: notice.id,
          title: notice.title,
          body: notice.body,
          category: notice.category,
          attachmentId: notice.attachmentId ?? '',
          pinned: notice.pinned,
          expiresAt: notice.expiresAt,
          status: notice.status,
        }}
      />
    </div>
  );
}
