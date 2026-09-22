import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth-edge';

// NFR-07: authorization is enforced server-side, not just by hiding
// UI elements. This middleware is the first gate; individual API
// routes and Server Components re-check role/ownership themselves
// (see lib/auth.ts: requireUser / requireAdmin / canAccessDispute),
// since middleware alone can't check per-dispute ownership.
//
// IMPORTANT: import only from lib/auth-edge, never lib/auth — the
// latter pulls in jsonwebtoken and PrismaClient, neither of which
// runs in the Edge runtime.
const PROTECTED_PREFIXES = ['/dashboard', '/disputes', '/evidence', '/progression', '/admin'];
const ADMIN_ONLY_PREFIXES = ['/admin'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const user = await getSessionFromRequest(req);

  if (!user) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdminRoute = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (isAdminRoute && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/disputes/:path*', '/evidence/:path*', '/progression/:path*', '/admin/:path*'],
};
