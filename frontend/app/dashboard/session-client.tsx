'use client';

import { useSession } from 'next-auth/react';

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
    </div>
  );
}