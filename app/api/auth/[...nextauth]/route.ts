import { handlers } from '@/lib/auth/auth';

/**
 * Auth.js route handlers.
 *
 * One of only five HTTP handlers in the entire application
 * (18_API_SPECIFICATION). There is no general REST or GraphQL API — this
 * exists because the auth library needs its own callback endpoints, not
 * because the project exposes an API.
 *
 * The other four: /api/health, /api/revalidate, /api/og/[type]/[slug],
 * /api/media/sign.
 */
export const { GET, POST } = handlers;
