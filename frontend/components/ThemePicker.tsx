'use client';

import { useState } from 'react';

export default function ThemePicker({ theme }: { theme: 'light' | 'dark' }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function changeTheme() {
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: theme === 'dark' ? 'light' : 'dark' }),
      });
      if (!response.ok) throw new Error('Theme update failed');
      window.location.reload();
    } catch {
      setError('Could not save your theme. Please try again.');
      setSaving(false);
    }
  }

  return (
    <div className="p-3 text-right">
      <button type="button" onClick={changeTheme} disabled={saving} className="rounded border px-3 py-1">
        {saving ? 'Saving theme…' : `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
