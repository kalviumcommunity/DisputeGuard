import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export default async function AdminAuditPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/disputes');

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      actor: { select: { name: true } },
      dispute: { select: { transactionId: true, status: true } },
    },
  });

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--heading)', margin: '0 0 22px 0' }}>Audit Log</h2>
      <div className="card" style={{ padding: '6px 18px' }}>
        {logs.length === 0 && <div style={{ padding: '18px 0', color: 'var(--muted)' }}>No activity yet.</div>}
        {logs.map((log) => (
          <div key={log.id} style={{ padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <b style={{ color: 'var(--heading)' }}>{log.action.replaceAll('_', ' ')}</b>
              {' — '}
              <Link href={`/disputes/${log.disputeId}`} style={{ color: 'var(--blue-light)' }}>{log.dispute.transactionId}</Link>
              {log.actor && <span style={{ color: 'var(--muted)' }}> by {log.actor.name}</span>}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
