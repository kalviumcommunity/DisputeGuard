import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export type Role = 'admin' | 'user';

export async function requireRole(requiredRole: Role) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      authorized: false,
      status: 401 as const,
      session: null,
    };
  }

  const role = session.user.role;

  if (role !== requiredRole) {
    return {
      authorized: false,
      status: 403 as const,
      session,
    };
  }

  return {
    authorized: true,
    status: 200 as const,
    session,
  };
}