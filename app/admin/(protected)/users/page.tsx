import Link from 'next/link';

import { AccessDenied } from '@/components/admin/AccessDenied';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/Button';
import { ADMIN_ONLY } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { ROLE_LABELS } from '@/lib/constants/adminNav';
import { listUsers } from '@/lib/queries/admin';
import { cn } from '@/lib/utils/cn';

export const metadata = { title: 'Users' };

export default async function UsersPage() {
  const user = await requirePageSession('/admin/users');

  if (!ADMIN_ONLY.includes(user.role)) {
    return <AccessDenied />;
  }

  const users = await listUsers();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff accounts"
        description="There is no public registration — every account is created here. Accounts are deactivated rather than deleted, so their history in the audit log stays intact."
        action={{ label: 'New account', href: '/admin/users/new' }}
      />

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[42rem] border-collapse text-left">
          <caption className="sr-only">Staff accounts</caption>
          <thead>
            <tr className="border-b border-border bg-surface-sunken">
              <th scope="col" className="px-4 py-3 text-label font-medium">Name</th>
              <th scope="col" className="px-4 py-3 text-label font-medium">Role</th>
              <th scope="col" className="px-4 py-3 text-label font-medium">Status</th>
              <th scope="col" className="px-4 py-3 text-label font-medium">Last sign-in</th>
              <th scope="col" className="px-4 py-3 text-label font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((account) => (
              <tr key={account.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/users/${account.id}/edit`}
                    className="font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {account.name}
                  </Link>
                  <p className="text-caption text-foreground-subtle">{account.email}</p>
                </td>
                <td className="px-4 py-3 text-body-sm text-foreground-muted">
                  {ROLE_LABELS[account.role]}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-sm border px-2 py-0.5 text-caption font-medium',
                      account.isActive
                        ? 'border-success bg-success-soft text-foreground'
                        : 'border-border-strong bg-surface-sunken text-foreground-muted',
                    )}
                  >
                    {account.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="px-4 py-3 text-body-sm text-foreground-muted">
                  {account.lastLoginAt
                    ? account.lastLoginAt.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Never'}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/users/${account.id}/edit`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="max-w-prose-measure rounded-md border border-border bg-surface-sunken px-4 py-3 text-body-sm text-foreground-muted">
        <strong className="font-medium text-foreground">No shared accounts.</strong>{' '}
        Every action is recorded against the person who performed it. A shared
        office login silently destroys that accountability, which is what every
        other control here depends on.
      </p>
    </div>
  );
}
