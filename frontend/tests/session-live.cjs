// Integration fixture: creates tokens only in this local test process, never an app login bypass.
const assert = require('node:assert/strict');
const https = require('node:https');
const { loadEnvConfig } = require('@next/env');
const { encode } = require('next-auth/jwt');
loadEnvConfig(process.cwd());
const base = process.env.NEXTAUTH_URL;
assert.equal(new URL(base).hostname, 'localhost', 'Run only against the local demo');
function request(path, token) {
  return new Promise((resolve, reject) => {
    https.get(new URL(path, base), {
      // Limited to the local test server's self-signed development certificate.
      rejectUnauthorized: false,
      headers: token ? { Cookie: `__Secure-next-auth.session-token=${token}` } : {},
    }, (res) => {
      let body = '';
      res.on('data', (part) => { body += part; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    }).on('error', reject);
  });
}
function assertLoginRedirect(response) {
  // The parent loading boundary can begin streaming before redirect() executes.
  assert.ok(
    (response.status === 307 && response.headers.location === '/login') ||
    (response.status === 200 && response.body.includes('id="__next-page-redirect" http-equiv="refresh" content="1;url=/login"')),
  );
  assert.ok(!response.body.includes('session-test@example.test'));
}
(async () => {
  const anonymous = await request('/dashboard/session');
  assertLoginRedirect(anonymous);
  console.log('PASS: anonymous Server Component redirects to login');
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await encode({ secret, maxAge: 3600, token: { sub: 'test-merchant', name: 'Session Test Merchant', email: 'session-test@example.test', provider: 'credentials' } });
  const page = await request('/dashboard/session', token);
  assert.equal(page.status, 200);
  assert.ok(page.body.includes('session-test@example.test'));
  assert.ok(!page.body.includes(token));
  console.log('PASS: authenticated Server Component renders safe identity without raw JWT');
  const session = await request('/api/auth/session', token);
  assert.equal(session.status, 200);
  const json = JSON.parse(session.body);
  assert.deepEqual(Object.keys(json).sort(), ['expires', 'user']);
  assert.deepEqual(json.user, { name: 'Session Test Merchant', email: 'session-test@example.test' });
  const cookie = session.headers['set-cookie'].find((value) => value.startsWith('__Secure-next-auth.session-token='));
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Lax']) assert.ok(cookie.includes(flag));
  console.log('PASS: session API returns allowlisted identity and protected renewed cookie');
  for (const invalid of ['tampered-token', await encode({ secret, token: { sub: 'test-merchant' }, maxAge: -60 })]) {
    const response = await request('/dashboard/session', invalid);
    assertLoginRedirect(response);
  }
  console.log('PASS: invalid and expired sessions redirect to login');
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
