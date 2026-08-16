/**
 * Authorisation errors.
 *
 * Messages are deliberately generic and never reveal whether a resource exists.
 * "You don't have permission to edit article 42" confirms article 42 exists;
 * that is a small leak, but it is free to avoid (19_AUTHORIZATION_AND_ROLES).
 */

export class UnauthenticatedError extends Error {
  readonly code = 'UNAUTHENTICATED' as const;

  constructor(message = 'You need to sign in to do that.') {
    super(message);
    this.name = 'UnauthenticatedError';
  }
}

export class ForbiddenError extends Error {
  readonly code = 'FORBIDDEN' as const;

  constructor(message = "You don't have permission to do that.") {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class RateLimitError extends Error {
  readonly code = 'RATE_LIMITED' as const;
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number, message = 'Too many attempts. Please wait and try again.') {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class ValidationError extends Error {
  readonly code = 'VALIDATION' as const;
  readonly fieldErrors: Record<string, string[]>;

  constructor(fieldErrors: Record<string, string[]>, message = 'Please check the highlighted fields.') {
    super(message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export class NotFoundError extends Error {
  readonly code = 'NOT_FOUND' as const;

  constructor(message = 'Not found.') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export function isAuthError(
  error: unknown,
): error is UnauthenticatedError | ForbiddenError {
  return (
    error instanceof UnauthenticatedError || error instanceof ForbiddenError
  );
}
