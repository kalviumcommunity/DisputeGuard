import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { getDisputePage, parsePagination, paginationHref } from '../lib/dispute-pagination';
import { paginationDatabase } from './helpers/pagination-database';

test('URL input is bounded and navigation preserves filters', () => {
  for (const page of ['0', '-1', '2.5', 'abc', '999999999999999999999', ['2', '3']]) assert.equal(parsePagination({ page }).page, 1);
  assert.equal(parsePagination({ status: 'WON' }).status, 'ALL');
  assert.equal(paginationHref(parsePagination({ status: 'RESOLVED', sort: 'asc' }), 2), '/disputes?page=2&sort=asc&status=RESOLVED');
});
test('Prisma skip/take returns stable, filtered page slices and metadata', async () => {
  await mkdir('.seed-verification', { recursive: true });
  const directory = await mkdtemp('.seed-verification/pagination-test-');
  const client = await paginationDatabase(`${directory}/test.db`);
  try {
    const pages = [];
    for (let page = 1; page <= 3; page++) pages.push(await getDisputePage(client, { page: String(page), sort: 'asc' }));
    assert.deepEqual(pages.map((p) => p.records.length), [5, 5, 2]);
    const ids = pages.flatMap((p) => p.records.map((r) => r.id));
    assert.equal(new Set(ids).size, 12);
    assert.deepEqual(ids, [...ids].sort());
    assert.equal(pages[0].hasPrevious, false); assert.equal(pages[2].hasNext, false);
    assert.equal(pages[1].total, 12); assert.equal(pages[1].totalPages, 3);
    const reverse = await getDisputePage(client, { page: '1', sort: 'desc' });
    assert.deepEqual(reverse.records.map((r) => r.id), [...ids].reverse().slice(0, 5));
    const filtered = await getDisputePage(client, { page: '2', status: 'ACTION_REQUIRED' });
    assert.equal(filtered.total, 6); assert.equal(filtered.records.length, 1);
    assert.ok(filtered.records.every((r) => r.status === 'ACTION_REQUIRED'));
    assert.equal((await getDisputePage(client, { page: '999999' })).page, 3);
    const empty = await getDisputePage(client, { page: '2', status: 'RESOLVED' });
    assert.equal(empty.page, 1); assert.equal(empty.total, 0); assert.equal(empty.records.length, 0);
    assert.equal(empty.hasNext, false); assert.equal(empty.hasPrevious, false);
  } finally {
    await client.$disconnect();
    await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
});
