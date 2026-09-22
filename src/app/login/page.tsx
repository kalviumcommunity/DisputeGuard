'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const FEATURES = [
  {
    title: 'One dashboard for every dispute',
    desc: 'No more digging through emails and gateway portals — every chargeback lands in a single, centralized view.',
    color: 'var(--blue)',
    bg: 'var(--blue-pale)',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    title: 'Automatic 7-day SLA',
    desc: 'Deadlines are calculated the moment a dispute is filed, with reminders and auto-escalation if the window closes.',
    color: 'var(--amber)',
    bg: 'var(--amber-pale)',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    title: 'Tamper-evident evidence',
    desc: 'Every upload is SHA-256 hashed and logged — there is no route to edit or delete it once submitted.',
    color: 'var(--green)',
    bg: 'var(--green-pale)',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

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
    <div className="login-wrap">
      {/* Left: product story — hidden under 920px, form below is unaffected */}
      <div className="login-left">
        {/* Decorative concentric rings, matching the app's own radial-gradient brand motif */}
        <svg
          width="520" height="520" viewBox="0 0 520 520"
          style={{ position: 'absolute', top: -140, right: -160, opacity: 0.5, pointerEvents: 'none' }}
        >
          <circle cx="260" cy="260" r="259" fill="none" stroke="var(--border)" strokeWidth="1.5" />
          <circle cx="260" cy="260" r="200" fill="none" stroke="var(--border)" strokeWidth="1.5" />
          <circle cx="260" cy="260" r="140" fill="var(--card)" opacity="0.5" />
        </svg>

        <div style={{ position: 'relative', maxWidth: 460 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 28 }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path d="M4 20L16 4L14 13H20L8 20L10 13H4Z" fill="#2158D6" />
            </svg>
            <span style={{ fontWeight: 800, fontSize: 19, color: 'var(--heading)' }}>Razorpay</span>
          </div>

          <h1 style={{ fontSize: 34, lineHeight: 1.25, color: 'var(--heading)', margin: 0, fontWeight: 800 }}>
            Respond to disputes<br />before the <span style={{ color: 'var(--blue-light)' }}>clock runs out</span>.
          </h1>
          <p style={{ fontSize: 14.5, color: 'var(--muted)', marginTop: 14, lineHeight: 1.6 }}>
            Dispute Guard centralizes every chargeback your business receives, enforces a strict 7-day
            response window, and keeps an immutable record of everything you submit as proof.
          </p>

          {FEATURES.map((f) => (
            <div className="login-feature" key={f.title}>
              <div className="login-feature-icon" style={{ background: f.bg, color: f.color }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--heading)' }}>{f.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3, lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: sign-in form — unchanged logic, same fields, same demo accounts */}
      <div className="login-right">
        <form onSubmit={onSubmit} className="card" style={{ width: 380, padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path d="M4 20L16 4L14 13H20L8 20L10 13H4Z" fill="#2158D6" />
            </svg>
            <span style={{ fontWeight: 800, fontSize: 19, color: 'var(--heading)' }}>Razorpay</span>
          </div>
          <h2 style={{ fontSize: 22, color: 'var(--heading)', margin: '10px 0 22px 0' }}>Sign in to Dispute Guard</h2>

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
    </div>
  );
}
