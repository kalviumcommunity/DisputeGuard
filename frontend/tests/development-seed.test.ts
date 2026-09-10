import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../lib/generated/prisma';
import { createRequire } from 'node:module';
// Node 24 provides SQLite; this repo still uses Node 20 declaration files.
const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as {
  DatabaseSync: new (filename: string) => { close(): void };
};

test('real prisma db seed is repeatable and preserves local data', async () => {
  await mkdir('.seed-verification', { recursive: true });
  const directory = await mkdtemp(path.resolve('.seed-verification/test-'));
  const url = `file:./${path.relative(process.cwd(), path.join(directory, 'seed.db')).replaceAll('\\', '/')}`;
  const env: NodeJS.ProcessEnv = { ...process.env, DATABASE_URL: url, NODE_ENV: 'test' };
  const cli = path.resolve('node_modules/prisma/build/index.js');
  const run = (...args: string[]) => execFileSync(process.execPath, [cli, ...args], { env, encoding: 'utf8', timeout: 60000 });
  const client = new PrismaClient({ adapter: new PrismaLibSql({ url }) });
  try {
    new DatabaseSync(path.join(directory, 'seed.db')).close();
    run('migrate', 'deploy');
    assert.match(run('db', 'seed'), /2 users and 3 disputes ensured/);
    const first = await client.user.findMany({ orderBy: { email: 'asc' } });
    const disputes = await client.dispute.findMany({ orderBy: { reference: 'asc' } });
    assert.equal(first.length, 2);
    assert.equal(disputes.length, 3);
    assert.ok(disputes.every((d) => first.some((u) => u.id === d.merchantId)));
    assert.ok(first.every((u) => u.role === 'user' && u.passwordHash.startsWith('$2')));
    await client.dispute.update({ where: { reference: 'DG-DEV-001' }, data: { title: 'Local edit', status: 'RESOLVED' } });
    const unrelated = await client.user.create({ data: { email: 'unrelated@example.test', passwordHash: 'test-only', name: 'Keep me' } });
    assert.match(run('db', 'seed'), /2 users and 3 disputes ensured/);
    assert.equal(await client.user.count(), 3);
    assert.equal(await client.dispute.count(), 3);
    assert.deepEqual(await client.user.findMany({ where: { id: { in: first.map((u) => u.id) } }, orderBy: { email: 'asc' } }), first);
    const edited = await client.dispute.findUniqueOrThrow({ where: { reference: 'DG-DEV-001' } });
    assert.equal(edited.title, 'Local edit');
    assert.equal(edited.status, 'RESOLVED');
    assert.equal((await client.user.findUniqueOrThrow({ where: { id: unrelated.id } })).name, 'Keep me');
    assert.deepEqual((await client.dispute.findMany({ orderBy: { reference: 'asc' } })).map((d) => d.id), disputes.map((d) => d.id));
    assert.throws(() => execFileSync(process.execPath, [cli, 'db', 'seed'], { env: { ...env, NODE_ENV: 'production' }, stdio: 'pipe', timeout: 60000 }), /disabled in production/);
    assert.equal(await client.dispute.count(), 3);
  } finally {
    await client.$disconnect();
    // Only the unique directory created above is removed.
    await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
});
