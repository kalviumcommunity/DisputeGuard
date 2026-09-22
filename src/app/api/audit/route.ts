import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET /api/audit?disputeId=... — US-11: admin traces exactly what
// happened and when. Audit logs are never exposed to merchants.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });

  const disputeId = req.nextUrl.searchParams.get('disputeId');

  const logs = await prisma.auditLog.findMany({
    where: disputeId ? { disputeId } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      actor: { select: { name: true, email: true, role: true } },
      dispute: { select: { transactionId: true, status: true } },
    },
  });

  return NextResponse.json({ logs });
}
