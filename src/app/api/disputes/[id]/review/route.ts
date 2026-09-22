import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

const bodySchema = z.object({
  decision: z.enum(['approve', 'deny']),
});

// POST /api/disputes/:id/review — admin decides on submitted evidence.
// Only valid from EVIDENCE_SUBMITTED or UNDER_REVIEW; only these two
// outcomes exist for Sprint 1 (no schema/migration change required):
//   approve -> RESOLVED
//   deny    -> ESCALATED
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const dispute = await prisma.dispute.findUnique({ where: { id: params.id } });
  if (!dispute) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (dispute.status !== 'EVIDENCE_SUBMITTED' && dispute.status !== 'UNDER_REVIEW') {
    return NextResponse.json(
      { error: `Dispute is "${dispute.status}" — only disputes with submitted evidence can be reviewed.` },
      { status: 409 },
    );
  }

  const { decision } = parsed.data;
  const now = new Date();

  const updated = await prisma.dispute.update({
    where: { id: dispute.id },
    data:
      decision === 'approve'
        ? { status: 'RESOLVED', resolvedAt: now }
        : { status: 'ESCALATED', escalatedAt: now },
  });

  await writeAuditLog({
    disputeId: dispute.id,
    action: 'ADMIN_REVIEWED_EVIDENCE',
    actorId: admin.id,
    metadata: { decision },
  });

  return NextResponse.json({ dispute: updated });
}
