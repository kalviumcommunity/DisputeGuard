import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AppShell from '@/components/AppShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  // Belt-and-braces: middleware already redirects unauthenticated
  // requests, but Server Components re-check too (NFR-07).
  if (!user) redirect('/login');

  return <AppShell user={user}>{children}</AppShell>;
}
