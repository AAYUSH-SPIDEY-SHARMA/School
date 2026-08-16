import { notFound } from 'next/navigation';

import { AccessDenied } from '@/components/admin/AccessDenied';
import { NewsForm } from '@/components/admin/NewsForm';
import { PageHeader } from '@/components/admin/PageHeader';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { getNewsForEdit } from '@/lib/queries/admin';

export const metadata = { title: 'Edit article' };

interface EditNewsPageProps {
  /** `params` is async in the Next.js 16 line. */
  params: Promise<{ id: string }>;
}

export default async function EditNewsPage({ params }: EditNewsPageProps) {
  const user = await requirePageSession();

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  const { id } = await params;
  const news = await getNewsForEdit(id);

  if (!news) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Edit article"
        description="Changing the URL creates a permanent redirect from the old address, so links already shared keep working."
      />

      <NewsForm
        initial={{
          id: news.id,
          title: news.title,
          slug: news.slug,
          excerpt: news.excerpt ?? '',
          body: news.body,
          coverImageId: news.coverImageId ?? '',
          category: news.category ?? '',
          featured: news.featured,
          authorName: news.authorName ?? '',
          status: news.status,
          seoTitle: news.seoTitle ?? '',
          seoDescription: news.seoDescription ?? '',
        }}
      />
    </div>
  );
}
