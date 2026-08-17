import Link from 'next/link';

import { AccessDenied } from '@/components/admin/AccessDenied';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { EmptyState } from '@/components/admin/EmptyState';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/Button';
import { deleteFaculty } from '@/lib/actions/faculty';
import { CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { listFacultyForAdmin } from '@/lib/queries/admin';

export const metadata = { title: 'Faculty' };

interface FacultyAdminPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function FacultyAdminPage({ searchParams }: FacultyAdminPageProps) {
  const user = await requirePageSession('/admin/faculty');

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const { items, page, pageCount, total } = await listFacultyForAdmin({
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Faculty"
        description="Teaching staff and leadership. Teacher quality is one of the factors parents weigh most heavily when choosing a school."
        action={{ label: 'Add teacher', href: '/admin/faculty/new' }}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No faculty added yet"
          description="Each teacher gets a profile page. Nothing is pre-filled — real names, designations and qualifications must come from the school."
          action={{ label: 'Add the first teacher', href: '/admin/faculty/new' }}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <caption className="sr-only">Faculty, {total} in total</caption>
              <thead>
                <tr className="border-b border-border bg-surface-sunken">
                  <th scope="col" className="px-4 py-3 text-label font-medium">Name</th>
                  <th scope="col" className="px-4 py-3 text-label font-medium">Department</th>
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
                        href={`/admin/faculty/${item.id}/edit`}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="text-caption text-foreground-subtle">
                        {item.designation}
                      </p>
                      {item.isLeadership ? (
                        <span className="text-caption text-accent">Leadership</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-body-sm text-foreground-muted">
                      {item.department?.name ?? (
                        <span className="text-foreground-subtle">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/faculty/${item.id}/edit`}>Edit</Link>
                        </Button>
                        <DeleteButton
                          id={item.id}
                          label="this profile"
                          action={deleteFaculty}
                          consequence="The profile is removed from the website. The record is kept so any news articles or audit entries referring to this person stay intact."
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} pageCount={pageCount} basePath="/admin/faculty" />
        </>
      )}
    </div>
  );
}
