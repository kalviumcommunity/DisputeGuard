import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'dispute_guard_session';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'MERCHANT' | 'ADMIN';
};

function requireSecret(): string {
  if (!JWT_SECRET) {
    // Fail loudly rather than silently signing tokens with an empty
    // secret — see NFR-08 (no secrets committed; must come from env).
    throw new Error('JWT_SECRET is not set. Copy .env.example to .env and set it.');
  }
  return JWT_SECRET;
}

export function signSession(user: SessionUser): string {
  return jwt.sign(user, requireSecret(), { expiresIn: '7d' });
}

export function verifySessionToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, requireSecret()) as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Reads the session from the request cookie. Used inside Route Handlers
 * and Server Components. Every protected route must call this and check
 * the result itself — see NFR-07: authorization is enforced server-side
 * on every route, never assumed from the client.
 */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Variant for use inside middleware, which receives a NextRequest directly. */
export function getSessionFromRequest(req: NextRequest): SessionUser | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const SESSION_COOKIE = COOKIE_NAME;

/** Throws-free guard used by API routes: returns the user or null. */
export async function requireUser(): Promise<SessionUser | null> {
  return getSession();
}

/** Throws-free guard: returns the user only if they are an admin. */
export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getSession();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

/** Confirms a dispute belongs to the given merchant (or the caller is an admin). */
export async function canAccessDispute(user: SessionUser, disputeId: string): Promise<boolean> {
  if (user.role === 'ADMIN') return true;
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId }, select: { merchantId: true } });
  return !!dispute && dispute.merchantId === user.id;
}
