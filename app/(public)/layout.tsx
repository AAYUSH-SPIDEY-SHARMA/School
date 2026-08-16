import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

/**
 * Public layout.
 *
 * The `(public)` route group isolates this chrome from `/admin`, which has an
 * entirely different layout, without adding a URL segment — so pages resolve to
 * `/about`, not `/public/about` (36_PROJECT_STRUCTURE).
 */
export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* First focusable element on the page. WCAG 2.4.1 Bypass Blocks —
          without it, a keyboard user tabs through the entire navigation on
          every single page before reaching the content. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <SiteHeader />

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
