'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type PendingDispute = {
  id: string;
  transactionId: string;
  reason: string;
  paymentMethod: string;
  amount: string;
  deadlineAt: string;
};

type SubmittedDispute = {
  id: string;
  transactionId: string;
  reason: string;
  evidence: { fileName: string; submittedAt: string }[];
};

function daysLeftFromISO(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function EvidenceUploader({
  pending,
  submitted,
  autoOpenDisputeId,
}: {
  pending: PendingDispute[];
  submitted: SubmittedDispute[];
  autoOpenDisputeId?: string;
}) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (autoOpenDisputeId && pending.some((p) => p.id === autoOpenDisputeId)) {
      setActiveId(autoOpenDisputeId);
    }
  }, [autoOpenDisputeId, pending]);

  const active = pending.find((p) => p.id === activeId) ?? null;

  async function submitEvidence() {
    if (!active || !file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/disputes/${active.id}/evidence`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Upload failed.');
        return;
      }
      setActiveId(null);
      setFile(null);
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      {pending.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
          No disputes are currently awaiting evidence.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pending.map((d) => {
            const left = daysLeftFromISO(d.deadlineAt);
            return (
              <div key={d.id} className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid var(--red)' }}>
                <div>
                  <b style={{ color: 'var(--heading)' }}>{d.transactionId} — {d.reason}</b>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{d.paymentMethod} · ₹{d.amount} · {left} day{left === 1 ? '' : 's'} remaining</div>
                </div>
                <button className="btn btn-primary" onClick={() => setActiveId(d.id)}>Add info</button>
              </div>
            );
          })}
        </div>
      )}

      {submitted.length > 0 && (
        <>
          <div style={{ fontWeight: 700, color: 'var(--heading)', fontSize: 14, margin: '26px 0 12px 0' }}>Previously submitted</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {submitted.map((d) => (
              <div key={d.id} className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <b style={{ color: 'var(--heading)' }}>{d.transactionId} — {d.reason}</b>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                    {d.evidence[0]?.fileName} · submitted {d.evidence[0] && new Date(d.evidence[0].submittedAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <span style={{ color: 'var(--green)', fontSize: 13, fontWeight: 700 }}>Locked (immutable)</span>
              </div>
            ))}
          </div>
        </>
      )}

      {active && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setActiveId(null); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(4,10,20,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
        >
          <div className="card" style={{ width: 420, maxWidth: '92vw', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M4 20L16 4L14 13H20L8 20L10 13H4Z" fill="#2158D6" /></svg>
                <span style={{ fontWeight: 800, color: 'var(--heading)' }}>Razorpay</span>
              </div>
              <button onClick={() => setActiveId(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer' }}>&times;</button>
            </div>

            <h3 style={{ fontSize: 16, color: 'var(--blue-light)', margin: '14px 0 12px 0' }}>Submit your evidence</h3>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14 }}>
              {active.transactionId} · {active.reason} · {active.paymentMethod} · ₹{active.amount}<br />
              Upload a file that supports your response to this dispute.
            </div>

            <label
              style={{
                display: 'block', border: '2px dashed var(--blue-light)', borderRadius: 12, background: 'var(--blue-pale)',
                padding: '26px 16px', textAlign: 'center', cursor: 'pointer',
              }}
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--heading)' }}>{file ? file.name : 'Add file'}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>PDF, JPG, PNG or DOCX up to 10MB</div>
            </label>

            {error && <div className="error-text" style={{ marginTop: 12 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: '#FFF7E8', border: '1px solid #F3E0B0', borderRadius: 10, padding: '10px 12px', marginTop: 14, fontSize: 11.5, color: '#8A6410', lineHeight: 1.5 }}>
              Once submitted, this evidence becomes <b>immutable</b> — it cannot be edited or replaced.
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setActiveId(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={!file || uploading} onClick={submitEvidence}>
                {uploading ? 'Submitting…' : 'Submit evidence'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
