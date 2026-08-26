'use client';

export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_ANALYTICS_ID;

  return (
    <div style={{ fontSize: '0.75rem', color: '#999', padding: '1rem' }}>
      Analytics ID: {gaId}
    </div>
  );
}