'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { SessionUser } from '@/lib/auth';

const MERCHANT_NAV = [
  { href: '/dashboard', label: 'Home', icon: 'home' },
  { href: '/disputes', label: 'Filed Disputes', icon: 'filed' },
  { href: '/evidence', label: 'Submit Evidence', icon: 'evidence' },
  { href: '/progression', label: 'Check Progression', icon: 'progress' },
];

const ADMIN_NAV = [
  { href: '/disputes', label: 'All Disputes', icon: 'filed' },
  { href: '/admin/audit', label: 'Audit Log', icon: 'progress' },
];

const ICONS: Record<string, JSX.Element> = {
  filed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
    </svg>
  ),
  evidence: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 16h6" />
    </svg>
  ),
  progress: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" />
    </svg>
  ),
};

export default function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const nav = user.role === 'ADMIN' ? ADMIN_NAV : MERCHANT_NAV;

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Top bar */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 64, display: 'flex', alignItems: 'center',
          gap: 16, padding: '0 22px', background: 'rgba(11,26,48,0.75)', backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)', zIndex: 46,
        }}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Open menu"
          style={{
            width: 40, height: 40, borderRadius: 11, background: 'var(--card)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--heading)" strokeWidth="2.2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M4 20L16 4L14 13H20L8 20L10 13H4Z" fill="#2158D6" /></svg>
          <span style={{ fontWeight: 800, fontSize: 19, color: 'var(--heading)' }}>Razorpay</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{user.name} · {user.role === 'ADMIN' ? 'Admin' : 'Merchant'}</span>
          <button onClick={logout} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12.5 }}>Log out</button>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 64 }}>
        {/* Sidebar (push panel) */}
        <aside
          style={{
            width: open ? 270 : 0, flexShrink: 0, padding: open ? '28px 18px' : '28px 0',
            display: 'flex', flexDirection: 'column', gap: 22,
            background: 'linear-gradient(180deg, #0D2340 0%, #0A1A32 100%)',
            borderRight: open ? '1px solid rgba(255,255,255,0.07)' : '0px solid transparent',
            overflow: 'hidden',
            transition: 'width .24s cubic-bezier(.4,0,.2,1), padding .24s cubic-bezier(.4,0,.2,1), border-right-width .24s ease',
          }}
        >
          <div style={{ minWidth: 234 }}>
            <div className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {nav.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => { router.push(item.href); setOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 13,
                      background: active ? 'linear-gradient(135deg, #2158D6 0%, #123A9E 100%)' : 'transparent',
                      color: active ? '#fff' : 'var(--heading)', fontWeight: 600, fontSize: 14.5, border: 'none',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      boxShadow: active ? '0 10px 22px rgba(33,88,214,0.38)' : 'none',
                    }}
                  >
                    <span style={{ width: 18, height: 18, display: 'flex' }}>{ICONS[item.icon]}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div
              className="card"
              style={{
                marginTop: 22, padding: '15px 17px',
                background: 'linear-gradient(145deg, var(--navy) 0%, #123A9E 130%)',
                fontSize: 12.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5,
              }}
            >
              <b style={{ color: '#fff' }}>Dispute Guard</b><br />
              Sprint 1 — Squad 125, Team 03
            </div>
          </div>
        </aside>

        <main style={{ flex: 1, minWidth: 0, padding: '34px', position: 'relative' }}>
          <div style={{ maxWidth: 1400, position: 'relative', zIndex: 1 }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
