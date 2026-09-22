import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import EvidenceUploader from '@/components/EvidenceUploader';

export default async function EvidencePage({ searchParams }: { searchParams: { disputeId?: string } }) {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role !== 'MERCHANT') redirect('/disputes');

  const pending = await prisma.dispute.findMany({
    where: { merchantId: user.id, status: 'ACTION_REQUIRED' },
    orderBy: { deadlineAt: 'asc' },
  });

  const submitted = await prisma.dispute.findMany({
    where: { merchantId: user.id, evidence: { some: {} } },
    include: { evidence: { orderBy: { submittedAt: 'desc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--heading)', margin: '0 0 22px 0' }}>Submit Evidence</h2>
      <EvidenceUploader
        pending={pending.map((d) => ({ ...d, amount: d.amount.toString(), createdAt: d.createdAt.toISOString(), deadlineAt: d.deadlineAt.toISOString() }))}
        submitted={submitted.map((d) => ({ id: d.id, transactionId: d.transactionId, reason: d.reason, evidence: d.evidence.map((e) => ({ fileName: e.fileName, submittedAt: e.submittedAt.toISOString() })) }))}
        autoOpenDisputeId={searchParams.disputeId}
      />
    </div>
  );
}
