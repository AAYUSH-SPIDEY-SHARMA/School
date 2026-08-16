import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Administration',
    template: '%s · Administration',
  },
  // Belt and braces with the X-Robots-Tag header set in next.config.ts. A meta
  // tag alone does not cover non-HTML responses.
  robots: { index: false, follow: false },
};

/**
 * Outer admin layout.
 *
 * Deliberately does NO authentication. `/admin/login` lives inside this segment
 * and must be reachable while signed out; the gate belongs one level down, in
 * the `(protected)` route group, which covers every admin page except the
 * login form.
 */
export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
