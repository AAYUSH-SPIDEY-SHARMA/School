import { AccessDenied } from '@/components/admin/AccessDenied';
import { NewsForm } from '@/components/admin/NewsForm';
import { PageHeader } from '@/components/admin/PageHeader';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';

export const metadata = { title: 'New article' };

export default async function NewNewsPage() {
  const user = await requirePageSession('/admin/news/new');

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New article"
        description="Articles save as drafts by default. Nothing is visible on the public site until you set the status to Published."
      />
      <NewsForm />
    </div>
  );
}
