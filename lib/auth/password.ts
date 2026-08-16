import 'server-only';

import { hash, type Options, verify } from '@node-rs/argon2';

/**
 * `Algorithm.Argon2id`.
 *
 * Written as a literal rather than imported: `Algorithm` is declared as an
 * ambient `const enum`, which cannot be read under `isolatedModules`.
 *
 * It is stated explicitly rather than left to the library default, because
 * this is a security parameter — a default that changes in a future release
 * would silently downgrade every password hash, and nothing would fail.
 */
const ARGON2ID: Options['algorithm'] = 2;

/**
 * Password hashing — argon2id.
 *
 * Locked security rule I: passwords use argon2id. Never a fast hash. bcrypt is
 * acceptable-ish; SHA-family hashes are not, because they are designed to be
 * fast and a GPU will try billions per second against a stolen table.
 *
 * argon2id is memory-hard: an attacker needs the memory as well as the cycles,
 * which is what blunts GPU and ASIC attacks.
 *
 * Parameters follow the OWASP Password Storage Cheat Sheet configuration for
 * argon2id (19 MiB memory, 2 iterations, 1 degree of parallelism). The cost is
 * paid on a handful of staff logins per day, so there is no reason to weaken it.
 */
const ARGON2_OPTIONS: Options = {
  algorithm: ARGON2ID,
  memoryCost: 19_456, // KiB — 19 MiB
  timeCost: 2,
  parallelism: 1,
};

/**
 * Minimum password length.
 *
 * Length is the property that actually resists guessing; composition rules
 * ("one uppercase, one symbol") mostly produce `Password1!` and are not
 * imposed. NIST SP 800-63B takes the same position.
 */
export const MIN_PASSWORD_LENGTH = 12;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTIONS);
}

/**
 * Verify a password against a stored hash.
 *
 * Returns false rather than throwing on a malformed hash: a corrupt record must
 * fail the login, not surface a stack trace to an unauthenticated caller.
 */
export async function verifyPassword(
  storedHash: string,
  plain: string,
): Promise<boolean> {
  try {
    return await verify(storedHash, plain, ARGON2_OPTIONS);
  } catch {
    return false;
  }
}

/**
 * A hash of a throwaway value, used to equalise timing when no user is found.
 *
 * Without this, "unknown email" returns in microseconds while "wrong password"
 * takes the full argon2 cost, and the difference is measurable — which turns
 * the login form into an account enumeration oracle telling an attacker which
 * staff email addresses are real (15_BACKEND_ARCHITECTURE, "Enumeration").
 *
 * Computed once at module load.
 */
let dummyHashPromise: Promise<string> | undefined;

export async function equaliseTimingForUnknownUser(): Promise<void> {
  dummyHashPromise ??= hashPassword('timing-equalisation-placeholder-value');
  const dummy = await dummyHashPromise;
  await verifyPassword(dummy, 'definitely-not-the-password');
}
