export const dynamic = 'force-static';

export default async function UnaffectedPage() {
  const renderedAt = new Date().toLocaleTimeString();

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Unaffected Control Route</h1>
      <p style={{ color: '#666' }}>
        Static Build Timestamp: <strong>{renderedAt}</strong>
      </p>
      <p>
        This page does NOT listen to <code>revalidatePath('/disputes-list')</code> or <code>disputes-tag</code>.
        Its cache timestamp remains static even after adding a dispute.
      </p>
    </main>
  );
}