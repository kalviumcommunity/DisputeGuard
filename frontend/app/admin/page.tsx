import { forbidden } from 'next/navigation';
import { requireRole } from '@/lib/authorization';

export default async function AdminPage() {
  const result = await requireRole('admin');

  if (!result.authorized) {
    if (result.status === 403) {
      forbidden();
    }

    return null;
  }

  if (!result.session) {
    return null;
  }

  const session = result.session;

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
          A
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Admin Dashboard
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          You have administrator access to Dispute Guard.
        </p>

        <p className="mt-4 text-sm font-medium text-slate-700">
          Signed in as: {session.user.email}
        </p>

        <p className="mt-2 text-xs text-slate-400">
          Role: {session.user.role}
        </p>
      </div>
    </main>
  );
}