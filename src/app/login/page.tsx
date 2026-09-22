'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Login failed.');
        return;
      }
      router.push(data.user.role === 'ADMIN' ? '/admin/audit' : '/dashboard');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <form onSubmit={onSubmit} className="card" style={{ width: 380, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path d="M4 20L16 4L14 13H20L8 20L10 13H4Z" fill="#2158D6" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: 19, color: 'var(--heading)' }}>Razorpay</span>
        </div>
        <h1 style={{ fontSize: 22, color: 'var(--heading)', margin: '10px 0 22px 0' }}>Sign in to Dispute Guard</h1>

        <label className="form-label" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginBottom: 16 }}
        />

        <label className="form-label" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginBottom: 20 }}
        />

        {error && <div className="error-text" style={{ marginBottom: 14 }}>{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 18, lineHeight: 1.6 }}>
          Sprint 1 demo accounts (see prisma/seed.ts):<br />
          Merchant — merchant@example.com / password123<br />
          Admin — admin@example.com / password123
        </p>
      </form>
    </div>
  );
}
