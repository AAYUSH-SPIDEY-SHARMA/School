import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';

/**
 * Shown when a signed-in user reaches a page their role does not cover.
 *
 * ⚠️ The message is deliberately non-specific. It does not name the resource,
 * confirm that it exists, or say which role would be required — a denial that
 * explains itself in detail is a small information leak, and the user cannot
 * act on the detail anyway (19_AUTHORIZATION_AND_ROLES).
 *
 * It offers a way back rather than leaving a dead end, because the usual cause
 * is a stale bookmark or a shared link, not an attack.
 */
export function AccessDenied() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-lg border border-border bg-surface px-6 py-16 text-center">
      <ShieldAlert aria-hidden="true" className="size-10 text-warning" />

      <h1 className="font-serif text-h2 text-foreground">
        You don&rsquo;t have permission to view this
      </h1>

      <p className="max-w-prose-measure text-body text-foreground-muted">
        Your account doesn&rsquo;t have access to this section. If you think it
        should, ask a site administrator to check your role.
      </p>

      <Button asChild variant="secondary" className="mt-2">
        <Link href="/admin">Back to dashboard</Link>
      </Button>
    </div>
  );
}
