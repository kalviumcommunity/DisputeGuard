# Type-safe Database Queries — Evidence

## Task 1 — Prisma Client in server functions

`lib/data/user-queries.ts` imports the shared Prisma Client singleton and uses it in server-side query functions.

Implemented functions:
- `listUsers()`
- `getUserByEmail()`
- `createUser()`
- `updateQueryDemoUser()`

## Task 2 — Typed CRUD queries

The data layer demonstrates the required Prisma Client operations:

- `findMany()` in `listUsers()`
- `findUnique()` in `getUserByEmail()`
- `create()` in `createUser()`
- `update()` in `updateQueryDemoUser()`

The queries use Prisma-generated model types and typed `select` fields.

## Task 3 — No `any`

Validation command:

```text
pnpm exec tsc --noEmit
