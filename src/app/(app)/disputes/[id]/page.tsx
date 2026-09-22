import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getSession, canAccessDispute } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { daysLeft, STATUS_LABELS } from '@/lib/disputes';

export default async function DisputeDetailPage({ params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user) redirect('/login');
  if (!(await canAccessDispute(user, params.id))) notFound();

  const dispute = await prisma.dispute.findUnique({
    where: { id: params.id },
    include: {
      evidence: { orderBy: { submittedAt: 'asc' } },
      auditLogs: { orderBy: { createdAt: 'asc' }, include: { actor: { select: { name: true } } } },
      merchant: { select: { name: true, email: true } },
    },
  });
  if (!dispute) notFound();

  const left = daysLeft(dispute.deadlineAt);

  return (
    <div>
      <Link href="/disputes" style={{ color: 'var(--blue-light)', fontWeight: 700, fontSize: 14 }}>← Back to disputes</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '18px 0 24px 0' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--heading)', margin: 0 }}>{dispute.transactionId}</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{dispute.reason} · {dispute.paymentMethod} · ₹{dispute.amount.toString()}</div>
        </div>
        <span className={`status-pill status-${dispute.status}`}>{STATUS_LABELS[dispute.status]}</span>
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Filed on</div>
        <div style={{ color: 'var(--heading)', marginBottom: 12 }}>{new Date(dispute.createdAt).toLocaleString('en-IN')}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Response deadline</div>
        <div style={{ color: left <= 2 && dispute.status === 'ACTION_REQUIRED' ? 'var(--red)' : 'var(--heading)' }}>
          {new Date(dispute.deadlineAt).toLocaleString('en-IN')}
          {dispute.status === 'ACTION_REQUIRED' && ` (${left > 0 ? `${left} days left` : 'overdue'})`}
        </div>
      </div>

      {dispute.status === 'ACTION_REQUIRED' && user.role === 'MERCHANT' && (
        <Link href={`/evidence?disputeId=${dispute.id}`} className="btn btn-primary" style={{ marginBottom: 20 }}>
          Submit evidence for this dispute
        </Link>
      )}

      <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--heading)', margin: '10px 0 12px 0' }}>Submitted evidence</h3>
      {dispute.evidence.length === 0 ? (
        <div className="card" style={{ padding: 16, color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>No evidence submitted yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {dispute.evidence.map((e) => (
            <div key={e.id} className="card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--heading)', fontWeight: 600 }}>{e.fileName}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                  Submitted {new Date(e.submittedAt).toLocaleString('en-IN')} · SHA-256: {e.sha256Hash.slice(0, 16)}…
                </div>
              </div>
              <span style={{ color: 'var(--green)', fontSize: 12.5, fontWeight: 700 }}>Locked (immutable)</span>
            </div>
          ))}
        </div>
      )}

      {user.role === 'ADMIN' && (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--heading)', margin: '10px 0 12px 0' }}>Audit trail</h3>
          <div className="card" style={{ padding: '6px 18px' }}>
            {dispute.auditLogs.map((log) => (
              <div key={log.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13 }}>
                <b style={{ color: 'var(--heading)' }}>{log.action.replaceAll('_', ' ')}</b>
                {log.actor && <> by {log.actor.name}</>}
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{new Date(log.createdAt).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
