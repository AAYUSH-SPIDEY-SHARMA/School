import Link from 'next/link';

import { AccessDenied } from '@/components/admin/AccessDenied';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { EmptyState } from '@/components/admin/EmptyState';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/Button';
import { deleteAchievement } from '@/lib/actions/achievements';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { listAchievementsForAdmin } from '@/lib/queries/admin';

export const metadata = { title: 'Achievements' };

interface AchievementsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AchievementsAdminPage({
  searchParams,
}: AchievementsPageProps) {
  const user = await requirePageSession('/admin/achievements');

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const { items, page, pageCount, total } = await listAchievementsForAdmin({
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Achievements"
        description="Specific, dated results — board toppers, olympiad ranks, sports wins. Concrete achievements are one of the strongest trust signals a school website has."
        action={{ label: 'Add achievement', href: '/admin/achievements/new' }}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No achievements yet"
          description="Nothing is pre-filled. Every achievement here should be one the school can evidence."
          action={{ label: 'Add the first achievement', href: '/admin/achievements/new' }}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <caption className="sr-only">Achievements, {total} in total</caption>
              <thead>
                <tr className="border-b border-border bg-surface-sunken">
                  <th scope="col" className="px-4 py-3 text-label font-medium">Achievement</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Category</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Date</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/achievements/${item.id}/edit`}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {item.title}
                      </Link>
                      {item.level ? (
                        <p className="text-caption text-foreground-subtle">{item.level}</p>
                      ) : null}
                      {item.featured ? (
                        <span className="text-caption text-accent">Featured</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-body-sm text-foreground-muted">
                      {item.type.charAt(0) + item.type.slice(1).toLowerCase()}
                    </td>
                    <td className="px-4 py-3 text-body-sm text-foreground-muted">
                      {item.achievedOn.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/achievements/${item.id}/edit`}>Edit</Link>
                        </Button>
                        <DeleteButton
                          id={item.id}
                          label="this achievement"
                          action={deleteAchievement}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} pageCount={pageCount} basePath="/admin/achievements" />
        </>
      )}
    </div>
  );
}
