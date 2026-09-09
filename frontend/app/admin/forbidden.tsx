export default function Forbidden() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
          403
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Forbidden
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          You do not have permission to access the admin area.
        </p>

        <p className="mt-2 text-xs text-slate-400">
          Admin role required.
        </p>
      </div>
    </main>
  );
}