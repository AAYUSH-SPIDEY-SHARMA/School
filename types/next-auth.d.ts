import type { Role } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

/**
 * Module augmentation so `session.user.role` is typed rather than `unknown`.
 *
 * Without this, every authorisation check silently degrades to an untyped
 * property access — and an authorisation check that is not type-checked is one
 * refactor away from comparing against a role string that no longer exists.
 *
 * ⚠️ The JWT interface must be augmented on `@auth/core/jwt`, NOT on
 * `next-auth/jwt`. The latter is only `export * from "@auth/core/jwt"`, and
 * declaration merging does not travel through a re-export — augmenting it
 * compiles silently and does nothing.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      sessionId: string;
    } & DefaultSession['user'];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    /** Primary key of the `sessions` row. The cookie carries nothing else. */
    sid?: string;
    uid?: string;
    role?: Role;
  }
}
