import { z } from 'zod';

/**
 * Environment validation.
 *
 * Environment mistakes are the classic "works locally, breaks in production"
 * failure, and the ones here are expensive: a wrong NEXT_PUBLIC_SITE_URL
 * silently corrupts every canonical tag and sitemap entry, and a missing
 * AUTH_SECRET breaks sign-in only once deployed.
 *
 * Validating at module load turns all of that into one loud, readable failure
 * at boot instead of a scattering of undefined-shaped bugs later.
 *
 * Two schemas, deliberately separated: server variables must never be bundled
 * into client JavaScript. Only `NEXT_PUBLIC_*` values may cross that line.
 */

const serverSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  // Pooled — application runtime.
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  // Unpooled — migrations only.
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),

  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET must be at least 32 characters'),
  AUTH_URL: z.url().optional(),
  AUTH_TRUST_HOST: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  // Server-only. Signs upload credentials — must never reach the browser.
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default('school'),

  REVALIDATE_SECRET: z.string().min(1),

  // Email provider is an unresolved owner decision (OD-014), so these are
  // optional: their absence must not stop the application booting. The enquiry
  // write never depends on email succeeding in any case.
  EMAIL_FROM: z.string().optional(),
  EMAIL_TO_ADMISSIONS: z.string().optional(),
  EMAIL_PROVIDER_API_KEY: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url('NEXT_PUBLIC_SITE_URL must be an absolute URL'),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
});

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
}

function parseServerEnv() {
  // During `next build` the client bundle is compiled in the same process, and
  // Next.js also collects page data without server secrets present in some
  // contexts. Failing loudly is still right — a build that silently produces a
  // broken deployment is worse than one that stops.
  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      `Invalid server environment variables:\n${formatIssues(parsed.error)}\n\n` +
        'Copy .env.example to .env and fill in the values.',
    );
  }

  return parsed.data;
}

function parseClientEnv() {
  // These must be referenced by their full literal name, not looked up
  // dynamically — the bundler inlines `process.env.NEXT_PUBLIC_*` by exact
  // textual match, so `process.env[key]` would be `undefined` in the browser.
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid public environment variables:\n${formatIssues(parsed.error)}`,
    );
  }

  return parsed.data;
}

/** Server-only configuration. Importing this from a client component is a bug. */
export const serverEnv = parseServerEnv();

/** Safe to reference from client components. */
export const clientEnv = parseClientEnv();

/** Canonical absolute origin, with any trailing slash removed. */
export const SITE_URL = clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
