import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; href: string };
}

/**
 * Shown when a listing has no rows.
 *
 * An empty table with headings and nothing under them reads as a broken page.
 * Naming what is missing and offering the next step is the difference between
 * "this is new" and "this is broken" — and staff who conclude the CMS is broken
 * stop using it (F-3, journey J7).
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
      <FileQuestion aria-hidden="true" className="size-8 text-foreground-subtle" />

      <h2 className="text-h4 font-medium text-foreground">{title}</h2>

      <p className="max-w-prose-measure text-body-sm text-foreground-muted">
        {description}
      </p>

      {action ? (
        <Button asChild variant="secondary" className="mt-2">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}
