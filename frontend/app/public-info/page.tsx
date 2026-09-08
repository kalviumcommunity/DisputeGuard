export default function PublicInfoPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Public Information</h1>
      <p>This public route is excluded by the middleware matcher.</p>
    </main>
  );
}