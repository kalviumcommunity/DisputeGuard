# RBAC Assignment Evidence

## Role Matrix

| Role | Authentication | `/admin` access |
|---|---|---|
| Signed out | No | Not authorized |
| `user` | Yes | 403 Forbidden |
| `admin` | Yes | Allowed |

## Enforcement Points

- **Database role:** `prisma/schema.prisma`
  - `User.role` defaults to `user`.
  - Role is stored server-side in PostgreSQL.
- **JWT:** `lib/auth.ts`
  - Authenticated provider data supplies the role.
  - The role is stored in the NextAuth JWT.
- **Session:** `lib/auth.ts`
  - The role is explicitly exposed on `session.user.role`.
- **Central authorization helper:** `lib/authorization.ts`
  - `requireRole()` checks authentication and the required role.
  - Returns `401` for unauthenticated users.
  - Returns `403` for authenticated users with the wrong role.
- **Admin route:** `app/admin/page.tsx`
  - Calls `requireRole('admin')`.
  - Calls Next.js `forbidden()` for authenticated non-admin users.
- **403 UI:** `app/admin/forbidden.tsx`
  - Displays the admin authorization failure.

## Verification

### Regular user

A signed-in user with role `user` attempted to access `/admin`.

Result:

- HTTP authorization outcome: `403 Forbidden`
- Message: `You do not have permission to access the admin area.`
- Admin dashboard was not displayed.

### Admin user

The same account was promoted to role `admin` in the database and the user signed in again so the JWT contained the updated role.

Result:

- `/admin` displayed `Admin Dashboard`.
- Session displayed `Role: admin`.

## Validation

- `pnpm exec tsc --noEmit` passed.
- `git diff --check` passed.
- Regular-user 403 behavior verified in browser.
- Admin access verified in browser.
