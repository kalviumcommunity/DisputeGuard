import assert from 'node:assert/strict';
import { test } from 'node:test';
import { listMerchantDisputes } from '../lib/merchant-disputes';
import { seedSchemaDemo } from '../prisma/demo-seed';
import { withSchemaDatabase } from './helpers/schema-database';

test('Prisma schema against isolated PostgreSQL-compatible database', async (t) => {
  await withSchemaDatabase(async (client) => {
    const { merchant, otherMerchant } = await seedSchemaDemo(client);
    await t.test('migrations and repeat seed preserve two merchants and three disputes', async () => {
      await seedSchemaDemo(client);
      assert.equal(await client.user.count(), 2);
      assert.equal(await client.dispute.count(), 3);
    });
    await t.test('generated projection scopes records and excludes passwordHash', async () => {
      const rows = await listMerchantDisputes(client, merchant.id);
      assert.equal(rows.length, 2);
      assert.ok(rows.every((row) => row.merchant.id === merchant.id));
      assert.ok(rows.every((row) => !('passwordHash' in row.merchant)));
      assert.equal((await listMerchantDisputes(client, otherMerchant.id)).length, 1);
      assert.deepEqual(await listMerchantDisputes(client, 'unknown-merchant'), []);
      await assert.rejects(listMerchantDisputes(client, ' '));
    });
    const data = { reference: 'DG-DEFAULTS', title: 'Default field verification', amountMinor: 100, responseDeadline: new Date('2026-09-16T12:00:00Z'), merchantId: merchant.id };
    await t.test('IDs, timestamps, default currency and status work through Prisma', async () => {
      const row = await client.dispute.create({ data });
      assert.ok(row.id.length > 0);
      assert.equal(row.currency, 'INR');
      assert.equal(row.status, 'ACTION_REQUIRED');
      assert.ok(row.createdAt instanceof Date);
      assert.ok(row.updatedAt instanceof Date);
      assert.equal(row.amountMinor, 100);
    });
    await t.test('unique references and emails reject duplicates', async () => {
      await assert.rejects(client.dispute.create({ data }), { code: 'P2002' });
      await assert.rejects(client.user.create({ data: { email: merchant.email, passwordHash: 'unused-test-value' } }), { code: 'P2002' });
    });
    await t.test('foreign key rejects an unknown merchant', async () => {
      await assert.rejects(client.dispute.create({ data: { ...data, reference: 'DG-ORPHAN', merchantId: 'missing' } }), { code: 'P2003' });
    });
    await t.test('deleting a merchant with disputes is restricted', async () => {
      await assert.rejects(client.user.delete({ where: { id: merchant.id } }), { code: 'P2003' });
    });
    await t.test('SQL checks reject zero amounts and malformed currency', async () => {
      await assert.rejects(client.dispute.create({ data: { ...data, reference: 'DG-ZERO', amountMinor: 0 } }), /Dispute_amountMinor_positive/);
      await assert.rejects(client.dispute.create({ data: { ...data, reference: 'DG-CURRENCY', currency: 'inr' } }), /Dispute_currency_uppercase/);
    });
    await t.test('database enum rejects an unsupported status', async () => {
      await assert.rejects(client.$executeRaw`UPDATE "Dispute" SET "status" = 'INVALID' WHERE "reference" = 'DG-DEFAULTS'`, /invalid input value for enum/);
    });
  });
});
