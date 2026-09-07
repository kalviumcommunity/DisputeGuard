import { addDisputeAndRevalidateAction } from '@/app/actions/revalidate-actions';

export default function AddDisputePage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Create New Dispute</h1>
      <form action={addDisputeAndRevalidateAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="title" style={{ display: 'block', fontWeight: 'bold' }}>Title</label>
          <input type="text" id="title" name="title" required style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        <div>
          <label htmlFor="amount" style={{ display: 'block', fontWeight: 'bold' }}>Amount ($)</label>
          <input type="number" step="0.01" id="amount" name="amount" required style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '4px' }}>
          Submit & Revalidate
        </button>
      </form>
    </main>
  );
}