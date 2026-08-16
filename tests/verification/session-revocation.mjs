/**
 * Verifies the central claim of ADR-0011: sessions are database-backed and
 * revocation takes effect on the very next request, not whenever a token
 * happens to expire.
 */

import { execSync } from 'node:child_process';

const BASE = 'http://localhost:3000';
const jar = new Map();

function storeCookies(response) {
  for (const cookie of response.headers.getSetCookie?.() ?? []) {
    const [pair] = cookie.split(';');
    const i = pair.indexOf('=');
    if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1));
  }
}

async function req(path, init = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    redirect: 'manual',
    headers: { cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; '), ...(init.headers ?? {}) },
  });
  storeCookies(response);
  return response;
}

function psql(sql) {
  return execSync(
    `docker exec school-pg psql -U devuser -d schooldb -t -A -c "${sql}"`,
    { encoding: 'utf8' },
  ).trim();
}

function report(label, pass, detail = '') {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!pass) process.exitCode = 1;
}

// Sign in.
const { csrfToken } = await (await req('/api/auth/csrf')).json();
await req('/api/auth/callback/credentials', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    csrfToken,
    email: 'admin@example.test',
    password: 'ChangeMe-Local-Dev-Only-2026',
    callbackUrl: `${BASE}/admin`,
  }).toString(),
});

const before = await req('/admin');
report('signed in, /admin renders', before.status === 200, `status ${before.status}`);

// The session must exist as an actual row, not merely as a signed token.
const rowCount = Number(psql('SELECT count(*) FROM sessions;'));
report('session exists as a database row', rowCount > 0, `${rowCount} row(s)`);

const expiryShape = psql(
  `SELECT (\\"absoluteExpiry\\" > \\"expires\\")::text FROM sessions LIMIT 1;`,
);
report(
  'absolute lifetime exceeds idle expiry',
  expiryShape === 'true' || expiryShape === 't',
  `absoluteExpiry > expires = ${expiryShape}`,
);

// Revoke by deleting the row — simulating deactivation or an admin sign-out.
psql('DELETE FROM sessions;');
report('session row deleted', Number(psql('SELECT count(*) FROM sessions;')) === 0);

// The very next request must be rejected, with the same cookie still held.
const after = await req('/admin');
report(
  'revoked session loses access immediately',
  after.status === 307 || after.status === 302,
  `status ${after.status} (cookie unchanged)`,
);

const session = await (await req('/api/auth/session')).json();
report(
  'session endpoint reports signed out',
  !session?.user,
  session?.user ? 'still returned a user' : 'no user',
);
