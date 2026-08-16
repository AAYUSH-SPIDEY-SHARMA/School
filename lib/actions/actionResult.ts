import 'server-only';

import { ZodError } from 'zod';

import {
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  UnauthenticatedError,
  ValidationError,
} from '@/lib/auth/errors';

/**
 * The shape every Server Action returns.
 *
 * Actions return a result rather than throwing across the network boundary,
 * because a thrown error in a Server Action reaches the client as an opaque
 * "An error occurred in the Server Components render" — which tells a member of
 * school staff nothing and tells a developer almost nothing.
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'VALIDATION' | 'RATE_LIMITED' | 'NOT_FOUND' | 'SERVER_ERROR';
      fieldErrors?: Record<string, string[]>;
      retryAfterSeconds?: number;
    };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

/**
 * Convert a thrown error into a safe result.
 *
 * ⚠️ Internal details, stack traces and database messages never reach the user
 * (NFR-053). A Postgres error string can disclose table and column names, and a
 * Prisma error can disclose the query. Both are logged server-side in full and
 * replaced with a generic apology on the way out.
 */
export function toActionError(error: unknown, context: string): ActionResult<never> {
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join('.') || '_form';
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return {
      ok: false,
      code: 'VALIDATION',
      error: 'Please check the highlighted fields.',
      fieldErrors,
    };
  }

  if (error instanceof ValidationError) {
    return {
      ok: false,
      code: 'VALIDATION',
      error: error.message,
      fieldErrors: error.fieldErrors,
    };
  }

  if (error instanceof UnauthenticatedError) {
    return { ok: false, code: 'UNAUTHENTICATED', error: error.message };
  }

  if (error instanceof ForbiddenError) {
    return { ok: false, code: 'FORBIDDEN', error: error.message };
  }

  if (error instanceof NotFoundError) {
    return { ok: false, code: 'NOT_FOUND', error: error.message };
  }

  if (error instanceof RateLimitError) {
    return {
      ok: false,
      code: 'RATE_LIMITED',
      error: error.message,
      retryAfterSeconds: error.retryAfterSeconds,
    };
  }

  // Anything unrecognised is a bug. Log it fully, tell the user nothing.
  console.error(`[action:${context}] unhandled error`, error);

  return {
    ok: false,
    code: 'SERVER_ERROR',
    error: 'Something went wrong. Please try again.',
  };
}
