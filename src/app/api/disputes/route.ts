import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireUser, requireAdmin } from '@/lib/auth';
import { computeDeadline } from '@/lib/disputes';
import { writeAuditLog } from '@/lib/audit';
import type { DisputeStatus } from '@prisma/client';

// GET /api/disputes?status=ACTION_REQUIRED
// FR-01/FR-02: merchants see only their own disputes; admins see all (FR-01 admin dashboard).
export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const status = req.nextUrl.searchParams.get('status') as DisputeStatus | null;

  const disputes = await prisma.dispute.findMany({
    where: {
      ...(user.role === 'MERCHANT' ? { merchantId: user.id } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { evidence: { select: { id: true, fileName: true, submittedAt: true } } },
  });

  return NextResponse.json({ disputes });
}

// POST /api/disputes
// FR-13: Dispute Creation Source. For the Sprint 1 MVP there is no live
// Razorpay webhook — this admin-only endpoint simulates an incoming
// chargeback notification. It's a stand-in for the real-time webhook
// integration described in the PRD's Future Scope (§19).
const createSchema = z.object({
  merchantEmail: z.string().email(),
  transactionId: z.string().min(1),
  amount: z.number().positive(),
  reason: z.string().min(1),
  paymentMethod: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid dispute payload.', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const merchant = await prisma.user.findUnique({ where: { email: data.merchantEmail } });
  if (!merchant || merchant.role !== 'MERCHANT') {
    return NextResponse.json({ error: 'No merchant found with that email.' }, { status: 404 });
  }

  const createdAt = new Date();
  const dispute = await prisma.dispute.create({
    data: {
      transactionId: data.transactionId,
      amount: data.amount,
      reason: data.reason,
      paymentMethod: data.paymentMethod,
      merchantId: merchant.id,
      createdAt,
      deadlineAt: computeDeadline(createdAt),
      status: 'ACTION_REQUIRED',
    },
  });

  await writeAuditLog({ disputeId: dispute.id, action: 'DISPUTE_CREATED', actorId: admin.id });

  return NextResponse.json({ dispute }, { status: 201 });
}
