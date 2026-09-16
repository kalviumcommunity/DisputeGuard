import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import nextEnv from '@next/env';
import { encode } from 'next-auth/jwt';

nextEnv.loadEnvConfig(process.cwd());
const port = 3007;
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--port', String(port)], { windowsHide: true });
let output = '';
server.stdout.on('data', (chunk) => { output += chunk.toString(); });
server.stderr.on('data', (chunk) => { process.stderr.write(chunk); });
const results = [];
function pass(message) { results.push(`PASS: ${message}`); console.log(results.at(-1)); }
function request(path, headers = {}, body) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: 'localhost', port, path, method: body === undefined ? 'GET' : 'POST', headers }, (res) => {
      let text = '';
      res.on('data', (chunk) => { text += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, text }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

try {
  for (let attempt = 0; !output.includes('Ready in'); attempt++) {
    assert.ok(attempt < 120 && server.exitCode === null, 'Production server did not start');
    await setTimeout(250);
  }
  for (const [cookie, theme] of [['', 'light'], ['theme=dark', 'dark'], ['theme=light', 'light'], ['theme=invalid', 'light']]) {
    const response = await request('/public-info', { cookie });
    assert.equal(response.status, 200);
    assert.match(response.text, new RegExp(`<html[^>]*data-theme="${theme}"`));
  }
  pass('Initial HTML: light default, saved dark/light, and invalid theme fallback; no JavaScript executed.');

  for (const theme of ['dark', 'light']) {
    const response = await request('/api/theme', { 'content-type': 'application/json' }, JSON.stringify({ theme }));
    assert.equal(response.status, 200);
    const cookie = response.headers['set-cookie'].find((value) => value.startsWith(`theme=${theme};`));
    for (const attribute of ['Path=/', 'Max-Age=31536000', 'SameSite=lax', 'HttpOnly', 'Secure']) assert.ok(cookie.toLowerCase().includes(attribute.toLowerCase()));
    const reloaded = await request('/public-info', { cookie: cookie.split(';')[0] });
    assert.match(reloaded.text, new RegExp(`<html[^>]*data-theme="${theme}"`));
  }
  pass('POST sets persistent one-year theme cookie (Path=/, SameSite=Lax, HttpOnly, Secure); next request renders saved theme.');

  for (const body of ['{', 'null', '{}', '{"theme":"blue"}', '{"theme":42}']) {
    const response = await request('/api/theme', { 'content-type': 'application/json' }, body);
    assert.equal(response.status, 400);
    assert.equal(response.headers['set-cookie'], undefined);
  }
  pass('Malformed and invalid theme bodies return 400 without changing cookies.');

  // Local signed fixture only; never a production authentication bypass or persisted token.
  const token = await encode({ secret: process.env.NEXTAUTH_SECRET, maxAge: 300, token: { sub: 'cookies-test', name: 'Cookie Test', role: 'user' } });
  const cookie = `__Secure-next-auth.session-token=${token}`;
  const page = await request('/dashboard', { cookie, 'User-Agent': 'DisputeGuard-Header-Test/1.0', 'Accept-Language': 'en-IN,hi;q=0.9', 'X-User-Id': 'case-test', 'X-Feature-Flags': 'dispute-preview' });
  assert.equal(page.status, 200);
  for (const text of ['DisputeGuard-Header-Test/1.0', 'en-IN,hi;q=0.9', 'Matches', 'Dispute preview is enabled for this request.']) assert.ok(page.text.includes(text));
  pass('Dashboard renders actual user-agent/language, case-insensitive header lookup, and enabled feature UI.');
  for (const flags of [undefined, '', 'unknown', '{invalid}', 'dispute-preview,', 'x'.repeat(513)]) {
    const response = await request('/dashboard', { cookie, ...(flags === undefined ? {} : { 'x-feature-flags': flags }) });
    assert.equal(response.status, 200);
    assert.ok(response.text.includes('Not provided'));
    assert.ok(response.text.includes('Standard dispute dashboard.'));
  }
  pass('Absent, empty, unknown, malformed and oversized flags use fallback; missing browser headers render Not provided.');

  const session = await request('/api/auth/session', { cookie });
  assert.equal(session.status, 200);
  assert.equal(JSON.parse(session.text).user.name, 'Cookie Test');
  const renewed = session.headers['set-cookie'].find((value) => value.startsWith('__Secure-next-auth.session-token='));
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/']) assert.ok(renewed.includes(flag));
  assert.ok(!session.text.includes(token));
  pass('Existing NextAuth route renews a valid session using HttpOnly, Secure, SameSite=Lax, Path=/; token is not in response JSON.');

  const build = await readFile('../docs/evidence/cookies-and-headers/build.txt', 'utf8');
  assert.match(build, /ƒ \/dashboard\s/);
  assert.match(build, /○ \/rendering-control/);
  const control = await request('/rendering-control');
  assert.equal(control.status, 200);
  assert.ok(control.text.includes('DisputeGuard static rendering control'));
  pass('Successful build marks dashboard dynamic (ƒ) and independent rendering-control static (○); control responds 200.');
  await mkdir('../docs/evidence/cookies-and-headers', { recursive: true });
  await writeFile('../docs/evidence/cookies-and-headers/verification.txt', results.join('\n') + '\n');
} finally {
  if (server.exitCode === null) {
    if (process.platform === 'win32') execFileSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    else server.kill('SIGTERM');
  }
}
