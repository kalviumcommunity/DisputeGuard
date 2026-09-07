import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const SALT_ROUNDS = 12;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    const password =
      typeof body.password === 'string' ? body.password : '';

    const name =
      typeof body.name === 'string' && body.name.trim()
        ? body.name.trim()
        : null;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required.',
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 8 characters.',
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User already exists.',
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
   } catch {
  return NextResponse.json(
      { success: false, error: 'Unable to create account.' },
      { status: 500 }
    );
  }
}
