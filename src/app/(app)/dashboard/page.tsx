import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { daysLeft } from '@/lib/disputes';

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role === 'ADMIN') redirect('/admin/audit');

  const disputes = await prisma.dispute.findMany({
    where: { merchantId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const actionNeeded = disputes.filter((d) => d.status === 'ACTION_REQUIRED');
  const escalatedDisputes = disputes.filter((d) => d.status === 'ESCALATED');
  const resolvedDisputes = disputes.filter((d) => d.status === 'RESOLVED');
  const escalated = escalatedDisputes.length;
  const resolved = resolvedDisputes.length;

  // Personal insights — pure arithmetic over data we already have,
  // no new dependencies or schema changes.
  const amountAtRisk = [...actionNeeded, ...escalatedDisputes].reduce(
    (sum, d) => sum + Number(d.amount),
    0,
  );

  const avgResolutionDays = (() => {
    const withDuration = resolvedDisputes.filter((d) => d.resolvedAt);
    if (withDuration.length === 0) return null;
    const totalDays = withDuration.reduce((sum, d) => {
      const ms = d.resolvedAt!.getTime() - d.createdAt.getTime();
      return sum + ms / (1000 * 60 * 60 * 24);
    }, 0);
    return totalDays / withDuration.length;
  })();

  // "Win rate" = resolved vs. (resolved + escalated) — the two closed-out
  // outcomes. Disputes still in progress (ACTION_REQUIRED / EVIDENCE_SUBMITTED /
  // UNDER_REVIEW) are excluded since they haven't reached an outcome yet.
  const closedOut = resolved + escalated;
  const winRate = closedOut > 0 ? (resolved / closedOut) * 100 : null;

  const urgent = [...actionNeeded]
    .sort((a, b) => daysLeft(a.deadlineAt) - daysLeft(b.deadlineAt))
    .slice(0, 3);

  // Recent activity: real audit log entries for this merchant's disputes,
  // newest first. This is the same AuditLog table the admin audit page
  // reads from — FR-12, not mock data.
  const recentActivity = await prisma.auditLog.findMany({
    where: { dispute: { merchantId: user.id } },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: { dispute: { select: { transactionId: true } } },
  });

  const ACTIVITY_COLOR: Record<string, string> = {
    DISPUTE_CREATED: 'var(--blue-light)',
    EVIDENCE_UPLOADED: 'var(--blue-light)',
    EVIDENCE_SUBMITTED: 'var(--green)',
    REMINDER_SENT: 'var(--amber)',
    ESCALATED: 'var(--red)',
    ADMIN_REVIEWED_EVIDENCE: 'var(--blue-light)',
  };
  const ACTIVITY_TEXT: Record<string, string> = {
    DISPUTE_CREATED: 'was filed',
    EVIDENCE_UPLOADED: 'had evidence uploaded',
    EVIDENCE_SUBMITTED: 'had evidence submitted',
    REMINDER_SENT: 'got a reminder sent',
    ESCALATED: 'was auto-escalated after the 7-day deadline passed',
    ADMIN_REVIEWED_EVIDENCE: 'had its evidence reviewed by an admin',
  };

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--heading)', margin: 0 }}>Chargeback Management</h2>
      <div style={{ color: 'var(--muted)', fontSize: 14.5, margin: '10px 0 26px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span>✓ Centralize disputes</span>
        <span>✓ Track chargebacks end-to-end</span>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
        <InsightCard label="Amount at risk" value={`₹${amountAtRisk.toLocaleString('en-IN')}`} sub="Open + escalated disputes" />
        <InsightCard label="Avg. resolution time" value={avgResolutionDays !== null ? `${avgResolutionDays.toFixed(1)}d` : '—'} sub="Across resolved disputes" />
        <InsightCard label="Win rate" value={winRate !== null ? `${winRate.toFixed(0)}%` : '—'} sub={closedOut > 0 ? `${resolved} of ${closedOut} closed disputes` : 'No closed disputes yet'} />
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <StatLink href="/disputes?status=ACTION_REQUIRED" num={actionNeeded.length} label="Need your response" color="var(--red)" bg="#fdecec" />
        <StatLink href="/disputes?status=ESCALATED" num={escalated} label="Escalated" color="var(--amber)" bg="#fdf2de" />
        <StatLink href="/disputes?status=RESOLVED" num={resolved} label="Resolved" color="var(--green)" bg="#e7f8ee" />
        <StatLink href="/disputes" num={disputes.length} label="Total disputes" color="var(--blue)" bg="var(--blue-pale)" />
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--heading)', margin: '34px 0 14px 0' }}>Needs your attention</h3>
      {urgent.length === 0 ? (
        <div className="card" style={{ padding: '16px 18px', color: 'var(--muted)', fontSize: 13 }}>
          Nothing needs your response right now — you&apos;re all caught up.
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {urgent.map((d) => {
            const left = daysLeft(d.deadlineAt);
            return (
              <div key={d.id} className="card" style={{ flex: '1 1 240px', padding: '15px 17px', borderLeft: '4px solid var(--red)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <b style={{ color: 'var(--heading)' }}>{d.transactionId}</b>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', background: 'rgba(255,107,107,0.14)', padding: '3px 9px', borderRadius: 20 }}>
                    {left > 0 ? `${left}d left` : 'Overdue'}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 10 }}>{d.reason} · ₹{d.amount.toString()}</div>
                <Link href={`/evidence?disputeId=${d.id}`} className="btn" style={{ background: 'var(--red)', color: '#fff', fontSize: 12.5 }}>
                  Respond now
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--heading)', margin: '34px 0 14px 0' }}>Quick actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <QuickTile href="/disputes" title="Filed Disputes" sub="Browse every dispute and its current status." />
        <QuickTile href="/evidence" title="Submit Evidence" sub="Upload proof for disputes needing a response." />
        <QuickTile href="/progression" title="Check Progression" sub="Track each case from filed to resolved." />
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--heading)', margin: '34px 0 14px 0' }}>Recent activity</h3>
      {recentActivity.length === 0 ? (
        <div className="card" style={{ padding: '16px 18px', color: 'var(--muted)', fontSize: 13 }}>
          Nothing&apos;s happened yet — activity will show up here as disputes move.
        </div>
      ) : (
        <div className="card" style={{ padding: '6px 18px' }}>
          {recentActivity.map((log) => (
            <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0, background: ACTIVITY_COLOR[log.action] ?? 'var(--muted)' }} />
              <div>
                <div style={{ fontSize: 13, color: 'var(--ink)' }}>
                  <b style={{ color: 'var(--heading)' }}>{log.dispute.transactionId}</b> {ACTIVITY_TEXT[log.action] ?? log.action.replaceAll('_', ' ').toLowerCase()}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                  {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InsightCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card" style={{ flex: '1 1 200px', padding: '15px 18px' }}>
      <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--heading)', margin: '4px 0' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>
    </div>
  );
}

function StatLink({ href, num, label, color, bg }: { href: string; num: number; label: string; color: string; bg: string }) {
  return (
    <Link href={href} className="card" style={{ padding: '16px 18px', minWidth: 160, display: 'flex', alignItems: 'center', gap: 13, cursor: 'pointer' }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
        {num}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--heading)', lineHeight: 1 }}>{num}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
      </div>
    </Link>
  );
}

function QuickTile({ href, title, sub }: { href: string; title: string; sub: string }) {
  return (
    <Link href={href} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer' }}>
      <div style={{ fontWeight: 700, color: 'var(--heading)', fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{sub}</div>
    </Link>
  );
}
