# JWT session verification

## Scope and implementation

The existing credentials and Google providers share `frontend/lib/auth.ts` with
the NextAuth route and `/dashboard/session`. The Server Component calls
`getServerSession(authOptions)` and redirects unauthenticated visitors to login.
This slice protects the session page; it does not claim to secure every existing
dashboard route or dispute API.

- `session.strategy` is explicitly `jwt`; session and JWT lifetime are one hour.
- `NEXTAUTH_SECRET` must contain at least 32 characters. Generate 32 random bytes;
  length validation alone cannot establish entropy. No secret is committed.
- The session cookie is `__Secure-next-auth.session-token`, with HttpOnly,
  Secure, SameSite=Lax and Path=/. Use HTTPS locally as well as in production.
- NextAuth encrypts the JWT as a JWE. It is stored by the browser as an HttpOnly
  cookie, but never returned as a raw token to browser JavaScript, HTML or session JSON.
- The session callback returns only name, email and the session expiry.

## JWT fields and tradeoff

`sub` is the authenticated provider's user ID. `provider` records whether that ID
came from credentials or Google; provider IDs are not automatically linked to a
single merchant database account. `name` and `email` support the account display.
NextAuth adds `iat`, `exp` and `jti` for issuance, expiry and token identification.
No password/hash, OAuth access/refresh token, payment details, role or permission
is copied. Client-supplied session updates cannot change identity claims.
Do not use email alone as authorization for merchant records. Future ownership
checks need a server-established merchant ID and explicit provider account linking.

JWT sessions avoid a session-table lookup on each request. The tradeoff is that
deleting a database user or signing out does not revoke a stolen copy instantly.
Sign-out removes this browser's cookie; a copied token remains valid until expiry.
Immediate revocation needs a database session or a server-side revocation/version
check. Identity display fields can remain stale until the next sign-in.

NextAuth's session endpoint re-encodes a valid token and extends the cookie's
one-hour expiry. The existing SessionProvider accesses this endpoint. This is a
rolling lifetime, not a one-hour absolute limit on an active login. Server Component
reads cannot write the renewed cookie; reads there alone do not extend it.
Expired or invalid tokens require login again. `session.updateAge` does not throttle
JWT renewal. This is distinct from OAuth access-token refresh, which is not added.
Changing NEXTAUTH_SECRET invalidates existing cookies; coordinate a secret rotation
and expect users to sign in again. No custom cryptography or multi-key fallback is used.

## Reproduce

From `frontend`:

1. `pnpm install --frozen-lockfile` (includes Prisma client generation).
2. Copy `.env.example` to `.env.local`. Generate NEXTAUTH_SECRET with
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
3. Set NEXTAUTH_URL to `https://localhost:3000`. Configure the existing PostgreSQL
   DATABASE_URL for credentials, or Google credentials and its HTTPS callback URL
   for OAuth. Do not commit `.env.local`.
4. Run `pnpm exec next dev --experimental-https` and trust the local certificate.
5. Run `node --test tests/session.test.cjs` for policy, callback allowlisting,
   encrypted token validation, expiry, cookie flags and server-session tests.
6. Visit `/dashboard/session` while signed out: expect login. Sign in using an
   existing provider, then visit `/dashboard/session`: both views show your email.
7. Inspect `/api/auth/session`: only safe user fields and expiry are returned.
   In browser storage confirm the session cookie's HttpOnly/Secure/SameSite flags.
   Do not capture the cookie value in evidence. `document.cookie` cannot read it.
8. Sign out and revisit the session page: expect login again.

The automated unit harness stubs only the database module and deliberately fails
on database access. It tests the real NextAuth encryption/session implementation;
it does not claim to test Google consent or credentials database authentication.

## References

- https://next-auth.js.org/configuration/options
- https://next-auth.js.org/configuration/nextjs
- https://next-auth.js.org/configuration/callbacks
