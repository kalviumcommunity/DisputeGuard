import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { PrismaClient } from '../../lib/generated/prisma';
import { PrismaLibSql } from '@prisma/adapter-libsql';
const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as {
  DatabaseSync: new (file: string) => { exec(sql: string): void; close(): void };
};

export async function paginationDatabase(file: string) {
  const db = new DatabaseSync(file);
  try { db.exec(readFileSync('prisma/migrations/20260909102137_add_dispute_priority/migration.sql', 'utf8')); }
  finally { db.close(); }
  const client = new PrismaClient({ adapter: new PrismaLibSql({ url: `file:${file}` }) });
  await client.user.create({ data: { id: 'pagination-merchant', email: 'pagination@example.test', passwordHash: 'disabled-fixture-account', name: 'Pagination Demo Merchant' } });
  for (let i = 1; i <= 12; i++) {
    await client.dispute.create({ data: {
      id: `pagination-${String(i).padStart(2, '0')}`,
      reference: `DG-PAGE-${String(i).padStart(2, '0')}`,
      title: `Delivery dispute ${i}`, amountMinor: 10000 + i * 100,
      merchantId: 'pagination-merchant', status: i % 2 ? 'ACTION_REQUIRED' : 'UNDER_REVIEW',
      createdAt: new Date('2026-09-14T00:00:00Z'), responseDeadline: new Date('2026-09-21T00:00:00Z'),
    } });
  }
  return client;
}
