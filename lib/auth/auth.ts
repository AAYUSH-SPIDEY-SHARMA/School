import 'server-only';

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { authConfig } from '@/lib/auth/auth.config';
import {
  equaliseTimingForUnknownUser,
  verifyPassword,
} from '@/lib/auth/password';
import {
  createSession,
  validateAndTouchSession,
} from '@/lib/auth/sessionStore';
import { getClientIp, recordAudit } from '@/lib/audit/recordAudit';
import { db } from '@/lib/db/prisma';
import { checkLoginRateLimit } from '@/lib/security/rateLimit';
import { loginSchema } from '@/lib/validations/auth';

/**
 * Full Auth.js configuration.
 *
 * ⚠️ Never import this from `proxy.ts` — it reaches the database, and the
 * request-interception boundary must stay adapter-free. `auth.config.ts` is the
 * file the proxy imports.
 *
 * ── On the session strategy ──────────────────────────────────────────────────
 *
 * The approved architecture requires the Credentials provider AND
 * database-backed, revocable sessions (ADR-0004). Auth.js does not support its
 * adapter `strategy: 'database'` together with Credentials — a documented
 * limitation of the library, not an oversight in the blueprint.
 *
 * Rather than work around it with an `encode` override — which is fragile and
 * version-specific — the session record is owned directly. The cookie carries
 * an opaque pointer (`sid`) and nothing else; the authoritative session state
 * is the `sessions` row, revalidated against the database on every request.
 *
 * That satisfies each property the decision actually asked for:
 *   • session state lives in the database        ✅
 *   • deactivation kills live sessions at once   ✅
 *   • role changes take effect without re-login  ✅
 *   • individual sessions are revocable          ✅
 *
 * Recorded in ADR-0011. This is an implementation of the approved decision, not
 * a change to it.
 */

const CREDENTIALS_FAILED = 'CredentialsSignin';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        const ipAddress = await getClientIp();

        // Malformed input is treated exactly like a wrong password. Saying
        // "that is not a valid email" distinguishes shapes of failure for an
        // unauthenticated caller for no benefit.
        if (!parsed.success) {
          await equaliseTimingForUnknownUser();
          return null;
        }

        const { email, password } = parsed.data;

        const limit = await checkLoginRateLimit(ipAddress);
        if (!limit.allowed) {
          // Distinguishable from a bad password on purpose: a locked-out
          // legitimate user needs to know to wait rather than keep guessing.
          throw new Error(CREDENTIALS_FAILED);
        }

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            passwordHash: true,
          },
        });

        if (!user) {
          // Burn equivalent time so an unknown address cannot be told apart
          // from a wrong password by response timing — otherwise the login
          // form becomes an account-enumeration oracle for staff addresses.
          await equaliseTimingForUnknownUser();
          await recordAudit({
            actorId: null,
            actorEmail: email,
            action: 'LOGIN_FAILED',
            entityType: 'User',
            entityId: 'unknown',
            summary: 'Sign-in failed: no such account',
            ipAddress,
          });
          return null;
        }

        const passwordValid = await verifyPassword(user.passwordHash, password);

        // The password is verified even for a deactivated account, so that a
        // disabled account is not distinguishable by how fast it fails.
        if (!passwordValid || !user.isActive) {
          await recordAudit({
            actorId: user.id,
            actorEmail: user.email,
            action: 'LOGIN_FAILED',
            entityType: 'User',
            entityId: user.id,
            summary: passwordValid
              ? 'Sign-in failed: account deactivated'
              : 'Sign-in failed: incorrect password',
            ipAddress,
          });
          return null;
        }

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        await recordAudit({
          actorId: user.id,
          actorEmail: user.email,
          action: 'LOGIN',
          entityType: 'User',
          entityId: user.id,
          summary: 'Signed in',
          ipAddress,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * Runs on sign-in and on every subsequent session read.
     *
     * Returning `null` invalidates the cookie, which is how a revoked,
     * expired or deactivated session is forced to sign out.
     */
    async jwt({ token, user }) {
      // Sign-in: mint the database session and keep only its id in the cookie.
      if (user?.id) {
        const sessionId = await createSession(user.id);
        return { sid: sessionId };
      }

      if (!token.sid) return null;

      // Every subsequent request revalidates against the database. This is the
      // read that makes revocation immediate, and the reason sessions are not
      // stateless tokens.
      const active = await validateAndTouchSession(token.sid);
      if (!active) return null;

      token.uid = active.userId;
      token.role = active.role;
      token.name = active.name;
      token.email = active.email;

      return token;
    },

    async session({ session, token }) {
      if (token.uid && token.role && token.sid) {
        session.user.id = token.uid;
        session.user.role = token.role;
        session.user.sessionId = token.sid;
        session.user.name = token.name ?? '';
        session.user.email = token.email ?? '';
      }
      return session;
    },
  },
});
