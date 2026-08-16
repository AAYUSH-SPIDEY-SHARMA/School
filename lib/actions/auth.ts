'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

import type { ActionResult } from '@/lib/actions/actionResult';
import { auth, signIn, signOut } from '@/lib/auth/auth';
import { destroySession } from '@/lib/auth/sessionStore';
import { loginSchema } from '@/lib/validations/auth';

/**
 * Sign-in and sign-out actions.
 *
 * ⚠️ The failure message is IDENTICAL for every cause: unknown email, wrong
 * password, deactivated account, malformed input. Distinguishing them would
 * turn the login form into an oracle that confirms which staff email addresses
 * are real and which accounts still exist (15_BACKEND_ARCHITECTURE,
 * "Enumeration"). Timing is equalised in the provider for the same reason.
 *
 * The only distinguishable outcome is rate limiting, because a locked-out
 * legitimate user needs to know to wait rather than keep guessing.
 */

const GENERIC_FAILURE = 'Incorrect email or password.';

export async function signInAction(
  _prevState: unknown,
  formData: FormData,
): Promise<ActionResult<never> | { ok: false; error: string; code: 'VALIDATION' }> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { ok: false, error: GENERIC_FAILURE, code: 'VALIDATION' };
  }

  // `callbackUrl` decides where the user lands after signing in, so it is a
  // redirect target supplied by the client. Only same-origin absolute paths are
  // accepted — without this check, a crafted link could bounce a freshly
  // authenticated staff member to an external phishing page that looks like the
  // admin.
  const requested = formData.get('callbackUrl');
  const callbackUrl =
    typeof requested === 'string' &&
    requested.startsWith('/') &&
    !requested.startsWith('//')
      ? requested
      : '/admin';

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    // Auth.js signals a successful sign-in by throwing a redirect, so this must
    // be rethrown rather than swallowed as a failure.
    if (error instanceof AuthError) {
      return { ok: false, error: GENERIC_FAILURE, code: 'VALIDATION' };
    }
    throw error;
  }

  // Unreachable in practice — signIn redirects.
  return { ok: false, error: GENERIC_FAILURE, code: 'VALIDATION' };
}

/**
 * Sign out.
 *
 * Deletes the database session row as well as clearing the cookie. Clearing the
 * cookie alone would leave a valid session record behind, so anyone holding a
 * copy of that cookie would still be signed in — which is precisely what a
 * revocable session store exists to prevent.
 */
export async function signOutAction(): Promise<void> {
  const session = await auth();

  if (session?.user?.sessionId) {
    await destroySession(session.user.sessionId);
  }

  await signOut({ redirect: false });

  // Returns void so this can be passed straight to a `<form action>`, which
  // requires `(formData) => void | Promise<void>`.
  redirect('/admin/login');
}
