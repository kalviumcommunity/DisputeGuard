import OptimisticNotes from './optimistic-notes';

export default function OptimisticUiPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Optimistic UI with useOptimistic
        </h1>

        <p className="mt-2 text-slate-600">
          DisputeGuard review-note demonstration.
        </p>
      </div>

      <OptimisticNotes />
    </main>
  );
}
