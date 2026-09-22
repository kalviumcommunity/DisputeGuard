import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { daysLeft, STATUS_LABELS } from '@/lib/disputes';
import type { DisputeStatus } from '@prisma/client';

export default async function DisputesPage({ searchParams }: { searchParams: { status?: string } }) {
  const user = await getSession();
  if (!user) redirect('/login');

  const status = (searchParams.status as DisputeStatus | undefined) ?? undefined;

  const disputes = await prisma.dispute.findMany({
    where: {
      ...(user.role === 'MERCHANT' ? { merchantId: user.id } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { merchant: { select: { name: true } } },
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--heading)', margin: 0 }}>
          {user.role === 'ADMIN' ? 'All Disputes' : 'Filed Disputes'}
        </h2>
      </div>

      {status && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--blue-pale)', border: '1px solid rgba(143,187,250,0.3)', color: 'var(--heading)', fontSize: 13, padding: '8px 8px 8px 14px', borderRadius: 30, marginBottom: 18 }}>
          Showing: <b style={{ color: 'var(--blue-light)' }}>{STATUS_LABELS[status]}</b> ({disputes.length})
          <Link href="/disputes" style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
            Clear filter ×
          </Link>
        </div>
      )}

      {disputes.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
          No disputes match this filter.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {disputes.map((d) => {
            const left = daysLeft(d.deadlineAt);
            const accent = d.status === 'RESOLVED' ? 'var(--green)' : d.status === 'ACTION_REQUIRED' || d.status === 'ESCALATED' ? 'var(--red)' : 'var(--amber)';
            return (
              <Link key={d.id} href={`/disputes/${d.id}`} className="card" style={{ padding: '16px 16px 16px 19px', borderLeft: `4px solid ${accent}`, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, color: 'var(--heading)' }}>{d.transactionId}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7 }}>
                  {user.role === 'ADMIN' && <>Merchant: <b style={{ color: 'var(--ink)' }}>{d.merchant.name}</b><br /></>}
                  Reason: <b style={{ color: 'var(--ink)' }}>{d.reason}</b><br />
                  Date: <b style={{ color: 'var(--ink)' }}>{new Date(d.createdAt).toLocaleDateString('en-IN')}</b><br />
                  {d.paymentMethod} · ₹{d.amount.toString()}
                </div>
                <span className={`status-pill status-${d.status}`} style={{ marginTop: 12, display: 'inline-block' }}>
                  {STATUS_LABELS[d.status]}
                </span>
                {d.status === 'ACTION_REQUIRED' && (
                  <div style={{ fontSize: 11.5, marginTop: 10, color: left <= 2 ? 'var(--red)' : 'var(--muted)', fontWeight: left <= 2 ? 700 : 400 }}>
                    {left > 0 ? `${left} day${left === 1 ? '' : 's'} left to respond` : 'Deadline passed'}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
