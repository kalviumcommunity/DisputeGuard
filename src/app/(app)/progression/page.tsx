import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { STATUS_LABELS } from '@/lib/disputes';
import type { DisputeStatus } from '@prisma/client';

type StepState = 'done' | 'fail' | 'pending';

function stepsFor(status: DisputeStatus): { label: string; state: StepState }[] {
  const steps: { label: string; state: StepState }[] = [
    { label: 'Created', state: 'done' },
    { label: 'Evidence Submitted', state: 'pending' },
    { label: 'Under Review', state: 'pending' },
    { label: 'Resolved', state: 'pending' },
  ];
  if (status === 'EVIDENCE_SUBMITTED') steps[1].state = 'done';
  if (status === 'UNDER_REVIEW') { steps[1].state = 'done'; steps[2].state = 'done'; }
  if (status === 'RESOLVED') { steps[1].state = 'done'; steps[2].state = 'done'; steps[3].state = 'done'; }
  if (status === 'ESCALATED') { steps[1].state = 'fail'; steps[2].state = 'fail'; steps[3].state = 'fail'; }
  return steps;
}

export default async function ProgressionPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const disputes = await prisma.dispute.findMany({
    where: user.role === 'MERCHANT' ? { merchantId: user.id } : {},
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--heading)', margin: '0 0 22px 0' }}>Check Progression</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {disputes.map((d) => {
          const steps = stepsFor(d.status);
          return (
            <div key={d.id} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <b style={{ color: 'var(--heading)' }}>{d.transactionId} — {d.reason}</b>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    Date: {new Date(d.createdAt).toLocaleDateString('en-IN')} · {d.paymentMethod}
                  </div>
                </div>
                <span className={`status-pill status-${d.status}`}>{STATUS_LABELS[d.status]}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
                {steps.map((s, i) => (
                  <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 }}>
                    {i < steps.length - 1 && (
                      <div
                        style={{
                          position: 'absolute', top: 10, left: '50%', width: '100%', height: 3, zIndex: 0,
                          background: steps[i + 1].state === 'fail' ? 'var(--red)' : steps[i + 1].state === 'done' ? 'var(--green)' : '#33486A',
                        }}
                      />
                    )}
                    <div
                      style={{
                        width: 20, height: 20, borderRadius: '50%', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: s.state === 'done' ? 'var(--green)' : s.state === 'fail' ? 'var(--red)' : '#33486A',
                      }}
                    >
                      {s.state === 'done' && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}
                      {s.state === 'fail' && <span style={{ color: '#fff', fontSize: 11 }}>✕</span>}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 7, textAlign: 'center', maxWidth: 80 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
