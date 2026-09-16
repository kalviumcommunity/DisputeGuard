import { cookies } from 'next/headers';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('VALIDATION_ERROR', 'Expected a JSON body.', 400);
  }
  if (!body || typeof body !== 'object' || !('theme' in body) ||
      (body.theme !== 'light' && body.theme !== 'dark')) {
    return errorResponse('VALIDATION_ERROR', 'Theme must be light or dark.', 400);
  }
  const cookieStore = await cookies();
  cookieStore.set('theme', body.theme, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  return successResponse({ theme: body.theme });
}
