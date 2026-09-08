import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value ||
    request.cookies.get('session-token')?.value;

  // Task 3: Redirect unauthenticated requests to /login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Task 4: Authenticated requests proceed
  return NextResponse.next();
}

// Task 1 & 2 & 5: Matcher explicitly targets ONLY protected routes
// Public routes (/login, /public-info, etc.) are excluded automatically
export const config = {
  matcher: ['/dashboard/:path*', '/protected-disputes/:path*'],
};