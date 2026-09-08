const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { encode, decode } = require('next-auth/jwt');
const { getServerSession } = require('next-auth');
process.env.NEXTAUTH_URL = 'https://localhost:3000';

function loadOptions(secret) {
  const previous = process.env.NEXTAUTH_SECRET;
  if (secret === undefined) delete process.env.NEXTAUTH_SECRET;
  else process.env.NEXTAUTH_SECRET = secret;
  const filename = path.resolve('lib/auth.ts');
  const mod = new Module(filename, module);
  mod.paths = module.paths;
  const original = mod.require.bind(mod);
  // Session verification must not query the credentials database.
  mod.require = (id) => id === '@/lib/prisma'
    ? { prisma: new Proxy({}, { get() { throw new Error('Unexpected database access'); } }) }
    : original(id);
  try {
    mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText, filename);
    return mod.exports.authOptions;
  } finally {
    if (previous === undefined) delete process.env.NEXTAUTH_SECRET;
    else process.env.NEXTAUTH_SECRET = previous;
  }
}

const secret = randomBytes(32).toString('base64');
const options = loadOptions(secret);

test('requires an environment secret, even in development', () => {
  assert.throws(() => loadOptions(undefined), /NEXTAUTH_SECRET/);
  assert.throws(() => loadOptions('short'), /NEXTAUTH_SECRET/);
  assert.equal(options.secret, secret);
});

test('JWT strategy uses a one-hour lifetime and protected cookie', () => {
  assert.equal(options.session.strategy, 'jwt');
  assert.equal(options.session.maxAge, 3600);
  assert.equal(options.jwt.maxAge, 3600);
  assert.deepEqual(options.cookies.sessionToken.options, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/',
  });
});

test('callbacks allowlist identity and ignore client privilege updates', async () => {
  const token = await options.callbacks.jwt({
    token: {}, user: { id: 'merchant-42', name: 'Demo Merchant', email: 'merchant@example.test', passwordHash: 'never-copy' },
    account: { provider: 'credentials', access_token: 'never-copy' },
  });
  assert.deepEqual(token, { sub: 'merchant-42', name: 'Demo Merchant', email: 'merchant@example.test', provider: 'credentials' });
  const updated = await options.callbacks.jwt({ token, trigger: 'update', session: { role: 'admin', email: 'attacker@example.test' } });
  assert.deepEqual(updated, token);
  const session = await options.callbacks.session({ session: { expires: 'later', rawToken: 'never-copy' }, token });
  assert.deepEqual(session, { expires: 'later', user: { name: 'Demo Merchant', email: 'merchant@example.test' } });
});

test('real NextAuth rejects tampered, expired and wrong-secret JWEs', async () => {
  const token = await encode({ secret, token: { sub: 'merchant-42' }, maxAge: 3600 });
  assert.equal(token.split('.').length, 5);
  assert.equal((await decode({ secret, token })).sub, 'merchant-42');
  await assert.rejects(decode({ secret: randomBytes(32).toString('hex'), token }));
  const parts = token.split('.');
  parts[3] = (parts[3][0] === 'A' ? 'B' : 'A') + parts[3].slice(1);
  await assert.rejects(decode({ secret, token: parts.join('.') }));
  await assert.rejects(decode({ secret, token: await encode({ secret, token: {}, maxAge: -60 }) }));
});

test('getServerSession returns safe identity and renews the protected cookie', async () => {
  const token = await encode({ secret, token: { sub: 'merchant-42', name: 'Demo Merchant', email: 'merchant@example.test' }, maxAge: 60 });
  const headers = new Map();
  const res = { getHeader: (key) => headers.get(key), setHeader: (key, value) => headers.set(key, value) };
  const session = await getServerSession({ headers: {}, cookies: { [options.cookies.sessionToken.name]: token } }, res, options);
  assert.deepEqual(session.user, { name: 'Demo Merchant', email: 'merchant@example.test' });
  const cookie = headers.get('Set-Cookie').join(';');
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Lax']) assert.ok(cookie.includes(flag));
  assert.ok(!JSON.stringify(session).includes(token));
  const anonymous = await getServerSession({ headers: {}, cookies: {} }, res, options);
  assert.equal(anonymous, null);
});
