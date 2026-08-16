/**
 * End-to-end check of the real sign-in path against the running dev server.
 *
 * Exercises: CSRF handshake -> credentials POST -> argon2 verify -> Session row
 * created -> cookie issued -> protected page renders -> role gate honoured.
 */

const BASE = 'http://localhost:3000';

const jar = new Map();

function storeCookies(response) {
  const raw = response.headers.getSetCookie?.() ?? [];
  for (const cookie of raw) {
    const [pair] = cookie.split(';');
    const index = pair.indexOf('=');
    if (index > 0) jar.set(pair.slice(0, index).trim(), pair.slice(index + 1));
  }
}

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}

async function req(path, init = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    redirect: 'manual',
    headers: { cookie: cookieHeader(), ...(init.headers ?? {}) },
  });
  storeCookies(response);
  return response;
}

function report(label, pass, detail = '') {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!pass) process.exitCode = 1;
}

const csrfResponse = await req('/api/auth/csrf');
const { csrfToken } = await csrfResponse.json();
report('CSRF token issued', Boolean(csrfToken));

// 1. Wrong password must be rejected.
const badBody = new URLSearchParams({
  csrfToken,
  email: 'admin@example.test',
  password: 'definitely-the-wrong-password',
  callbackUrl: `${BASE}/admin`,
});

const bad = await req('/api/auth/callback/credentials', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: badBody.toString(),
});

const badLocation = bad.headers.get('location') ?? '';
report(
  'wrong password rejected',
  badLocation.includes('error') || badLocation.includes('login'),
  `-> ${badLocation.slice(0, 80)}`,
);

// 2. Protected route must redirect while signed out.
jar.clear();
const anon = await req('/admin');
report('signed-out /admin redirects', anon.status === 307 || anon.status === 302,
  `status ${anon.status}`);

// 3. Correct credentials must sign in.
const csrf2 = await (await req('/api/auth/csrf')).json();

const goodBody = new URLSearchParams({
  csrfToken: csrf2.csrfToken,
  email: 'admin@example.test',
  password: process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe-Local-Dev-Only-2026',
  callbackUrl: `${BASE}/admin`,
});

const good = await req('/api/auth/callback/credentials', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: goodBody.toString(),
});

const goodLocation = good.headers.get('location') ?? '';
report(
  'correct password accepted',
  !goodLocation.includes('error'),
  `-> ${goodLocation.slice(0, 80)}`,
);

const sessionCookie = [...jar.keys()].find((k) => k.includes('session-token'));
report('session cookie issued', Boolean(sessionCookie), sessionCookie ?? 'none');

// 4. Protected page must now render.
const dashboard = await req('/admin');
const html = dashboard.status === 200 ? await dashboard.text() : '';
report('/admin renders when signed in', dashboard.status === 200, `status ${dashboard.status}`);
report('dashboard shows admin content', html.includes('Dashboard'));

// 5. SUPER_ADMIN reaches admin-only pages.
const users = await req('/admin/users');
report('SUPER_ADMIN reaches /admin/users', users.status === 200, `status ${users.status}`);

const audit = await req('/admin/audit-log');
report('SUPER_ADMIN reaches /admin/audit-log', audit.status === 200, `status ${audit.status}`);

const enquiries = await req('/admin/enquiries');
report('SUPER_ADMIN reaches /admin/enquiries', enquiries.status === 200, `status ${enquiries.status}`);

// 6. The session must be a real database row, not just a token.
const sessionInfo = await (await req('/api/auth/session')).json();
report('session resolves to the seeded account', sessionInfo?.user?.email === 'admin@example.test',
  sessionInfo?.user?.email ?? 'no user');
report('session carries role', sessionInfo?.user?.role === 'SUPER_ADMIN',
  sessionInfo?.user?.role ?? 'no role');
