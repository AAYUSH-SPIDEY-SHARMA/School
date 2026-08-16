import type { ContentStatus } from '@prisma/client';

import { cn } from '@/lib/utils/cn';

/**
 * Publication status.
 *
 * ⚠️ Never colour alone. Each state carries a distinct WORD as well as a
 * distinct colour, so the meaning survives colour-blindness, a monochrome
 * screenshot and a printout (26_ACCESSIBILITY, 10_DESIGN_SYSTEM).
 */
const STATUS_STYLES: Record<ContentStatus, { label: string; className: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'border-warning bg-warning-soft text-gold-900',
  },
  PUBLISHED: {
    label: 'Published',
    className: 'border-success bg-success-soft text-foreground',
  },
  ARCHIVED: {
    label: 'Archived',
    className: 'border-border-strong bg-surface-sunken text-foreground-muted',
  },
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-caption font-medium',
        style.className,
      )}
    >
      {style.label}
    </span>
  );
}

/**
 * Expiry state for a notice.
 *
 * Expired notices are the specific failure this project exists to avoid — a
 * recruitment notice from 2020 was still live on a reference site in 2026
 * (F-3). Making expiry visible in the listing is how staff notice it.
 */
export function ExpiryBadge({
  expiresAt,
  /**
   * The instant to compare against, supplied by the caller.
   *
   * Not `Date.now()` inside the component: reading the clock during render is
   * impure, and it would also compare each row against a slightly different
   * moment. One timestamp for the whole listing is both pure and more correct.
   */
  now,
}: {
  expiresAt: Date | null;
  now: Date;
}) {
  if (!expiresAt) {
    return (
      <span className="text-caption text-foreground-subtle">No expiry set</span>
    );
  }

  const expired = expiresAt.getTime() <= now.getTime();

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-caption font-medium',
        expired
          ? 'border-error bg-error-soft text-error'
          : 'border-border bg-surface-sunken text-foreground-muted',
      )}
    >
      {expired ? 'Expired' : 'Expires'}{' '}
      {expiresAt.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}
    </span>
  );
}
