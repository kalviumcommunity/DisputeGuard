import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const secret = process.env.NEXTAUTH_SECRET;

if (!secret || secret.length < 32) {
  throw new Error(
    'Set NEXTAUTH_SECRET to a random value of at least 32 characters.'
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: 'Credentials',

      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (
          typeof credentials?.email !== 'string' ||
          typeof credentials?.password !== 'string'
        ) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        const passwordMatches = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!passwordMatches) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role === 'admin' ? 'admin' : 'user',
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60,
  },

  pages: {
    signIn: '/login',
  },

  secret,

  jwt: {
    maxAge: 60 * 60,
  },

  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
      },
    },
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Only authenticated provider output is accepted;
      // client updates are ignored.
      if (user) {
        return {
          sub: user.id,
          name: user.name,
          email: user.email,
          role: user.role === 'admin' ? 'admin' : 'user',
          provider: account?.provider,
        };
      }

      return token;
    },

    async session({ session, token }) {
      // Explicit allowlist: never serialize the JWT
      // or provider credentials.
      return {
        expires: session.expires,
        user: {
          name: token.name ?? null,
          email: token.email ?? null,
          role: token.role ?? 'user',
        },
      };
    },
  },
};