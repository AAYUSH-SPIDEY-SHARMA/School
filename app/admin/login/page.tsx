import type { Metadata } from 'next';
import { Suspense } from 'react';

import { LoginForm } from '@/components/admin/LoginForm';
import { PlaceholderText } from '@/components/ui/PlaceholderText';
import { SCHOOL_PLACEHOLDERS } from '@/lib/constants/site';

export const metadata: Metadata = {
  title: 'Sign in',
  // The admin must never be indexed. Also enforced by a response header in
  // next.config.ts, because a meta tag does not cover non-HTML responses.
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

/**
 * Reads `searchParams`, which is request-time data.
 *
 * Isolated into its own component so only this part is dynamic. If the page
 * awaited `searchParams` directly, the entire route — including the static
 * chrome around it — would be excluded from prerendering, and a signed-out
 * visitor would wait on the server for markup that never changes.
 */
async function LoginFormSlot({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  return <LoginForm callbackUrl={params.callbackUrl ?? '/admin'} />;
}

/** Matches the form's height, so revealing the form causes no layout shift. */
function LoginFormSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-hidden="true">
      <div className="h-[70px] animate-pulse rounded-md bg-surface-sunken" />
      <div className="h-[70px] animate-pulse rounded-md bg-surface-sunken" />
      <div className="h-13 animate-pulse rounded-md bg-surface-sunken" />
    </div>
  );
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-sunken px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-serif text-h3 font-semibold text-primary">
            <PlaceholderText value={SCHOOL_PLACEHOLDERS.name} />
          </p>
          <h1 className="mt-2 text-body-lg text-foreground-muted">
            Website administration
          </h1>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginFormSlot searchParams={searchParams} />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-caption text-foreground-muted">
          This area is for school staff only. There is no public registration.
        </p>
      </div>
    </main>
  );
}
