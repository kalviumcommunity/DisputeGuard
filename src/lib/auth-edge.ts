import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

/**
 * Edge-runtime-safe session verification.
 *
 * middleware.ts runs in the Edge runtime, which has no Node `crypto`
 * module and cannot load PrismaClient. lib/auth.ts imports both
 * (jsonwebtoken + prisma), so it must NEVER be imported from middleware.
 * This file uses `jose`, which runs on Web Crypto, and imports nothing else.
 *
 * Tokens are still signed by lib/auth.ts with jsonwebtoken (HS256) —
 * the two are interoperable because both treat a string secret as raw
 * UTF-8 bytes.
 */

export const SESSION_COOKIE = 'dispute_guard_session';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'MERCHANT' | 'ADMIN';
};

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set.');
  return new TextEncoder().encode(secret);
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
    if (!payload.id || !payload.role) return null;
    return {
      id: String(payload.id),
      email: String(payload.email ?? ''),
      name: String(payload.name ?? ''),
      role: payload.role === 'ADMIN' ? 'ADMIN' : 'MERCHANT',
    };
  } catch (err) {
    // Expired or tampered token, or a secret mismatch between the
    // signing route and this verifier. Logged so it isn't silent.
    console.warn('[middleware] session verify failed:', (err as Error).message);
    return null;
  }
}
