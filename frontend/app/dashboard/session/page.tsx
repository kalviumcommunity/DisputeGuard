import { getServerSession } from 'next-auth';
import SessionClient from '../session-client';

export default async function SessionDemoPage() {
  const session = await getServerSession();

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
            D
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            OAuth Session Demo
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Verifying the authenticated Google session in Server and Client Components.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">
            Server Component Session
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {session?.user?.email ?? 'No active session'}
          </p>
        </div>

        <SessionClient />
      </div>
    </main>
  );
}
