'use client';

import { signOut, useSession } from 'next-auth/react';

export default function SessionClient() {
  const { data: session } = useSession();

  return (
    <div className="mt-5 rounded-xl border border-slate-200 p-5">
      <h2 className="font-semibold text-slate-900">
        Client Component Session
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        {session?.user?.email ?? 'No active session'}
      </p>
      <button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white" onClick={() => signOut({ callbackUrl: '/login' })}>
        Sign out
      </button>
    </div>
  );
}
