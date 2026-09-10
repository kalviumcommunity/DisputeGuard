import {
  getUserByEmail,
  listUsers,
} from '@/lib/data/user-queries';

export default async function TypeSafeQueriesPage() {
  const users = await listUsers();

  const firstUser = users[0]
    ? await getUserByEmail(users[0].email)
    : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Type-safe Database Queries
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Prisma Client provides typed database queries generated from the
          schema.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              findMany()
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Users returned: {users.length}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              findUnique()
            </h2>

            {firstUser ? (
              <div className="mt-2 text-sm text-slate-600">
                <p>Email: {firstUser.email}</p>
                <p>Name: {firstUser.name ?? '—'}</p>
                <p>Role: {firstUser.role}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                No users found.
              </p>
            )}
          </section>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-5">
          <h2 className="font-semibold text-slate-900">
            Prisma operations implemented
          </h2>

          <ul className="mt-3 space-y-1 text-sm text-slate-600">
            <li>✓ findMany()</li>
            <li>✓ findUnique()</li>
            <li>✓ create()</li>
            <li>✓ update()</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
