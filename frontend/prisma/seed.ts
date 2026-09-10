import { loadEnvConfig } from '@next/env';
import { randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { hash } from 'bcryptjs';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient, DisputeStatus, Priority } from '../lib/generated/prisma';

export async function seedDevelopment(client: PrismaClient) {
  // No shared login password or admin account is introduced by development data.
  const passwordHash = await hash(randomBytes(32).toString('hex'), 10);
  return client.$transaction(async (tx) => {
    const merchants = [];
    for (const [email, name] of [
      ['seed-kavya@example.test', 'Kavya Demo Store'],
      ['seed-arjun@example.test', 'Arjun Demo Store'],
    ]) {
      merchants.push(await tx.user.upsert({
        where: { email },
        create: { email, name, passwordHash, role: 'user' },
        update: {}, // Preserve local edits, passwords and role on subsequent runs.
      }));
    }
    const fixtures = [
      { reference: 'DG-DEV-001', title: 'Item not received', amountMinor: 149900, status: DisputeStatus.ACTION_REQUIRED, priority: Priority.HIGH, merchantId: merchants[0].id },
      { reference: 'DG-DEV-002', title: 'Duplicate payment', amountMinor: 25000, status: DisputeStatus.UNDER_REVIEW, priority: Priority.MEDIUM, merchantId: merchants[0].id },
      { reference: 'DG-DEV-003', title: 'Unrecognized payment', amountMinor: 50000, status: DisputeStatus.ESCALATED, priority: Priority.URGENT, merchantId: merchants[1].id },
    ];
    for (const fixture of fixtures) {
      await tx.dispute.upsert({
        where: { reference: fixture.reference },
        create: { ...fixture, currency: 'INR', responseDeadline: new Date('2026-09-17T12:00:00Z') },
        update: {},
      });
    }
    return { users: merchants.length, disputes: fixtures.length };
  });
}

async function main() {
  loadEnvConfig(process.cwd());
  if (process.env.NODE_ENV === 'production') throw new Error('Development seeding is disabled in production.');
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith('file:')) throw new Error('Set DATABASE_URL to a local SQLite file: URL.');
  const client = new PrismaClient({ adapter: new PrismaLibSql({ url }) });
  try {
    const result = await seedDevelopment(client);
    console.log(`Development seed complete: ${result.users} users and ${result.disputes} disputes ensured.`);
  } finally {
    await client.$disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : 'Development seed failed');
    process.exitCode = 1;
  });
}
