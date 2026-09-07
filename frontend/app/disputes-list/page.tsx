import Link from 'next/link';
import { disputesDb } from '@/lib/disputes-db';

export const dynamic = 'force-static'; // Caches page to prove revalidation behavior

export default async function DisputesListPage() {
  const renderedAt = new Date().toLocaleTimeString();

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Disputes List (Target Route)</h1>
      <p style={{ color: '#666', fontSize: '0.875rem' }}>
        Last Cache Build Time: <strong>{renderedAt}</strong>
      </p>

      <div style={{ margin: '1rem 0' }}>
        <Link
          href="/add-dispute"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none',
          }}
        >
          + Add New Dispute
        </Link>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {disputesDb.map((item) => (
          <li
            key={item.id}
            style={{
              padding: '0.75rem',
              borderBottom: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>{item.title}</span>
            <strong>${item.amount.toFixed(2)}</strong>
          </li>
        ))}
      </ul>
    </main>
  );
}