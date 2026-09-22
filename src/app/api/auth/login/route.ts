import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { signSession, SESSION_COOKIE } from '@/lib/auth';

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Deliberately identical error for "no such user" and "wrong password"
    // so the response doesn't leak which emails are registered.
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = signSession({ id: user.id, email: user.email, name: user.name, role: user.role });

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  } catch (err) {
    // Without this, a Prisma connection failure (P1001) propagates as an
    // unhandled throw and Next returns a 500 with an EMPTY body — which is
    // what makes res.json() blow up on the client with
    // "Unexpected end of JSON input" instead of showing a real message.
    const code = (err as { code?: string }).code;
    console.error('[login] failed:', code ?? '', err);

    if (code === 'P1001' || code === 'P1002') {
      return NextResponse.json(
        { error: 'Cannot reach the database right now. Please try again in a moment.' },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
