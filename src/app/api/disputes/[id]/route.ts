import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser, canAccessDispute } from '@/lib/auth';

// GET /api/disputes/:id
// FR-03: Dispute Details — reason, status, deadline, submitted evidence.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!(await canAccessDispute(user, params.id))) {
    // Same response whether the dispute doesn't exist or belongs to
    // someone else — avoids leaking which dispute IDs are valid.
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const dispute = await prisma.dispute.findUnique({
    where: { id: params.id },
    include: {
      evidence: { orderBy: { submittedAt: 'asc' } },
      auditLogs: { orderBy: { createdAt: 'asc' } },
      merchant: { select: { id: true, name: true, email: true } },
    },
  });

  if (!dispute) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ dispute });
}
