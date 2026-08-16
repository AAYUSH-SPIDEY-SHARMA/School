import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

interface PaginationProps {
  page: number;
  pageCount: number;
  /** Base path; the page number is appended as a query parameter. */
  basePath: string;
  /** Preserved alongside `page` so filters survive paging. */
  params?: Record<string, string | undefined>;
}

/**
 * Listing pagination.
 *
 * Real links, not buttons: each page is a distinct URL, so it can be
 * bookmarked, opened in a new tab and navigated with the browser's back button.
 * A JavaScript-only pager breaks all three.
 */
export function Pagination({ page, pageCount, basePath, params = {} }: PaginationProps) {
  if (pageCount <= 1) return null;

  function hrefFor(target: number): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value);
    }
    if (target > 1) search.set('page', String(target));
    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  const linkClass =
    'inline-flex min-h-11 items-center gap-1 rounded-md border border-border bg-surface px-3 text-body-sm text-foreground transition-colors hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring';

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 pt-2"
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass} rel="prev">
          <ChevronLeft aria-hidden="true" className="size-4" />
          Previous
        </Link>
      ) : (
        <span className={cn(linkClass, 'pointer-events-none opacity-40')} aria-hidden="true">
          <ChevronLeft className="size-4" />
          Previous
        </span>
      )}

      <p className="text-body-sm text-foreground-muted" aria-live="polite">
        Page {page} of {pageCount}
      </p>

      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className={linkClass} rel="next">
          Next
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span className={cn(linkClass, 'pointer-events-none opacity-40')} aria-hidden="true">
          Next
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
