import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function deadline(createdAt: Date): Date {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + 7);
  return d;
}

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const merchant = await prisma.user.upsert({
    where: { email: 'merchant@example.com' },
    update: {},
    create: { email: 'merchant@example.com', name: 'Priya Sharma (Merchant)', role: 'MERCHANT', passwordHash },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', name: 'Razorpay Ops Admin', role: 'ADMIN', passwordHash },
  });

  // FR-13: this seed script IS the "simulated incoming chargeback
  // notification" for the MVP — see the API route at
  // /api/disputes (POST) for the admin-facing equivalent at runtime.
  const seedDisputes = [
    { transactionId: 'TXN-1042', reason: 'Item not received', paymentMethod: 'UPI', amount: 2499, created: daysAgo(1), status: 'ACTION_REQUIRED' as const },
    { transactionId: 'TXN-1039', reason: 'Unrecognized transaction', paymentMethod: 'Credit Card', amount: 8750, created: daysAgo(2), status: 'ACTION_REQUIRED' as const },
    { transactionId: 'TXN-1035', reason: 'Product not as described', paymentMethod: 'Net Banking', amount: 1200, created: daysAgo(4), status: 'ACTION_REQUIRED' as const },
    { transactionId: 'TXN-1031', reason: 'Duplicate charge', paymentMethod: 'UPI', amount: 4300, created: daysAgo(3), status: 'EVIDENCE_SUBMITTED' as const },
    { transactionId: 'TXN-1027', reason: 'Service not rendered', paymentMethod: 'Debit Card', amount: 15000, created: daysAgo(6), status: 'UNDER_REVIEW' as const },
    { transactionId: 'TXN-1019', reason: 'Item not received', paymentMethod: 'Wallet', amount: 950, created: daysAgo(9), status: 'RESOLVED' as const, resolved: true },
    { transactionId: 'TXN-1012', reason: 'Unrecognized transaction', paymentMethod: 'Credit Card', amount: 6600, created: daysAgo(10), status: 'ESCALATED' as const },
  ];

  for (const s of seedDisputes) {
    const existing = await prisma.dispute.findFirst({ where: { transactionId: s.transactionId } });
    if (existing) continue;

    const dispute = await prisma.dispute.create({
      data: {
        transactionId: s.transactionId,
        reason: s.reason,
        paymentMethod: s.paymentMethod,
        amount: s.amount,
        merchantId: merchant.id,
        createdAt: s.created,
        deadlineAt: deadline(s.created),
        status: s.status,
        escalatedAt: s.status === 'ESCALATED' ? daysAgo(1) : null,
        resolvedAt: 'resolved' in s && s.resolved ? daysAgo(1) : null,
      },
    });

    await prisma.auditLog.create({ data: { disputeId: dispute.id, action: 'DISPUTE_CREATED', actorId: admin.id } });
    if (s.status === 'ESCALATED') {
      await prisma.auditLog.create({ data: { disputeId: dispute.id, action: 'ESCALATED' } });
    }
  }

  console.log('Seed complete.');
  console.log('  Merchant login: merchant@example.com / password123');
  console.log('  Admin login:    admin@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
