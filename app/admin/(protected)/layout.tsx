import { AdminShell } from '@/components/admin/AdminShell';
import { requirePageSession } from '@/lib/auth/pageGuards';

/**
 * Every admin route is rendered per-request and never prerendered.
 *
 * This is the approved behaviour, not a concession: "the enquiry form and all
 * of /admin are dynamic and never cached" (ADR-0010). Each request must reflect
 * the caller's identity and role, and must show content — including drafts —
 * exactly as it stands right now.
 *
 * Declared with `instant = false` rather than wrapped in Suspense because there
 * is no meaningful shell to stream first: with no valid session the correct
 * response is a redirect, and rendering admin chrome around a fallback for
 * someone who is about to be bounced to the login form would be worse than
 * waiting.
 */
export const instant = false;

/**
 * Protected admin layout.
 *
 * Everything under `/admin` except the login form renders inside this. The
 * route group `(protected)` adds no URL segment, so the dashboard is still at
 * `/admin` while `/admin/login` sits outside the gate.
 *
 * The session check here reaches the database on every request, which is what
 * makes a deactivated account lose access immediately rather than when a token
 * expires (ADR-0011).
 */
export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requirePageSession();

  return (
    <AdminShell
      user={{ name: user.name, email: user.email, role: user.role }}
    >
      {children}
    </AdminShell>
  );
}
