'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminReviewActions({ disputeId }: { disputeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<'approve' | 'deny' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(decision: 'approve' | 'deny') {
    setLoading(decision);
    setError(null);
    try {
      const res = await fetch(`/api/disputes/${disputeId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        return;
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="card" style={{ padding: 18, marginBottom: 24 }}>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
        This dispute has evidence submitted and is awaiting a decision.
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className="btn"
          style={{ background: 'var(--green)', color: '#fff' }}
          disabled={loading !== null}
          onClick={() => decide('approve')}
        >
          {loading === 'approve' ? 'Approving…' : 'Approve — resolve dispute'}
        </button>
        <button
          className="btn"
          style={{ background: 'var(--red)', color: '#fff' }}
          disabled={loading !== null}
          onClick={() => decide('deny')}
        >
          {loading === 'deny' ? 'Denying…' : 'Deny — escalate dispute'}
        </button>
      </div>
      {error && <div className="error-text" style={{ marginTop: 12 }}>{error}</div>}
    </div>
  );
}
