import { randomBytes } from 'node:crypto';
import { hash } from 'bcryptjs';
import { DisputeStatus, type PrismaClient } from '../lib/generated/prisma/client';

// Called only by the isolated demo/test. No known password or real account is seeded.
export async function seedSchemaDemo(client: PrismaClient) {
  const passwordHash = await hash(randomBytes(32).toString('hex'), 10);
  const merchant = await client.user.upsert({
    where: { email: 'schema-demo@example.test' },
    create: { email: 'schema-demo@example.test', name: 'DisputeGuard Demo Merchant', passwordHash },
    update: {},
  });
  const otherMerchant = await client.user.upsert({
    where: { email: 'schema-other@example.test' },
    create: { email: 'schema-other@example.test', name: 'Other Demo Merchant', passwordHash },
    update: {},
  });
  const fixtures = [
    { reference: 'DG-SCHEMA-001', title: 'Item not received', amountMinor: 149900, merchantId: merchant.id, status: DisputeStatus.ACTION_REQUIRED },
    { reference: 'DG-SCHEMA-002', title: 'Duplicate payment', amountMinor: 25000, merchantId: merchant.id, status: DisputeStatus.UNDER_REVIEW },
    { reference: 'DG-SCHEMA-003', title: 'Unrecognized payment', amountMinor: 50000, merchantId: otherMerchant.id, status: DisputeStatus.ACTION_REQUIRED },
  ];
  for (const fixture of fixtures) {
    await client.dispute.upsert({
      where: { reference: fixture.reference },
      create: { ...fixture, responseDeadline: new Date('2026-09-16T12:00:00Z') },
      update: {},
    });
  }
  return { merchant, otherMerchant };
}
