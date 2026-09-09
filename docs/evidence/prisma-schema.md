# Prisma Schema Definition — verification and design

## Five assignment requirements

| Requirement | Implementation |
| --- | --- |
| At least two models | `frontend/prisma/schema.prisma`: existing `User` and new `Dispute` |
| Correct types and attributes | CUID IDs, unique email/reference, integer minor-unit money, enum status, timestamps, defaults and a required merchant relation |
| Datasource uses DATABASE_URL | PostgreSQL datasource in schema; `datasource.url: process.env["DATABASE_URL"]` in `frontend/prisma7.config.ts` |
| prisma generate succeeds | Prisma 7.10.0 successfully generated `frontend/lib/generated/prisma` |
| Generated Client example | `frontend/lib/merchant-disputes.ts` uses `Prisma.DisputeSelect`, `Prisma.DisputeGetPayload` and `PrismaClient.dispute.findMany`; `demo:schema` runs it |

Prisma 7 moves the connection URL out of schema.prisma into Prisma config. Adding
the older `url = env("DATABASE_URL")` schema syntax would fail validation in this
project. The config loads the same .env.local/.env values as Next.js; it never
prints the URL. See the [official Prisma 7 configuration reference](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference).
Generation/validation do not need a live database. Commands that connect require
a valid DATABASE_URL supplied locally; no connection string is committed.

## Model and SQL choices

One merchant (`User`) has many disputes. Each dispute belongs to exactly one user.
The migration adds a foreign key with ON DELETE RESTRICT, preserving dispute
records instead of cascading their deletion with an account. It adds a unique
reference index and a composite merchant/status/deadline index for filtered queues.
This is a schema slice, not a replacement for the existing mock dispute API and
not an authorization mechanism. A future caller must derive merchantId from a
trusted server identity. OAuth identity linking remains separate work.

Money is a positive PostgreSQL INTEGER in minor units (INR paise), avoiding binary
floating-point errors. This limits amounts to 2,147,483,647 minor units; larger
transactions would need BigInt or Decimal and appropriate serialization. Currency
is CHAR(3), defaults to INR, and has an uppercase-letter check; this does not
validate membership in an ISO currency catalogue. The enum restricts status to
ACTION_REQUIRED, UNDER_REVIEW, RESOLVED and ESCALATED. New enum values require a
migration. Deadline is supplied explicitly by the caller, not auto-derived here.

The SQL migration was generated from the before/after schema, then augmented with
positive-amount and uppercase-currency CHECK constraints, which Prisma schema
attributes cannot express. Future migrations must preserve these SQL checks.
`@id` maps to a primary key, `@unique` to a unique index, and `@default(now())`
to CURRENT_TIMESTAMP. CUID defaults and `@updatedAt` are supplied by Prisma Client,
not SQL defaults/triggers. Raw SQL writers must supply IDs and updatedAt themselves.
DateTime maps here to TIMESTAMP(3); callers should supply UTC dates consistently.

## Repeatable local verification

Run from `frontend` with Node 24 and pnpm:

```sh
pnpm install --frozen-lockfile
pnpm prisma:validate
pnpm prisma:generate
pnpm test:schema
pnpm demo:schema
```

The demo/test applies every committed migration SQL file, in order, to a new
in-memory PGlite database. It exposes only a temporary loopback port and uses the
real generated Prisma Client with PrismaPg. It never reads DATABASE_URL, writes
to a real database, starts a persistent service, or saves a database file. Cleanup
disconnects Prisma, closes the socket and disposes of the database in `finally`.
PGlite is PostgreSQL-compatible but is not proof of production performance,
concurrency, deployment permissions, or Prisma's migration-history bookkeeping.
Test migration deployment against a dedicated PostgreSQL database before production.

The repeatable seed adds two fictional merchants and three disputes. Unknown,
randomly generated passwords are hashed; no usable demo credentials are exposed.
Calling the seed twice does not duplicate or reset rows. The typed query limits
results to 50, orders them deterministically, and excludes password hashes.

## Results (2026-09-09)

- Prisma format, validate and generate: passed on Prisma 7.10.0.
- TypeScript `tsc --noEmit`: passed.
- Focused ESLint on config, query, seed, demo and tests: passed.
- Eight behavioral subtests passed (Node reports nine including their parent):
  1. All migrations apply and seeding twice preserves two users/three disputes.
  2. The generated relation query scopes by merchant and excludes passwordHash.
  3. IDs, dates, INR and ACTION_REQUIRED defaults work.
  4. Duplicate references and emails fail with P2002.
  5. An unknown merchant fails with P2003.
  6. Deleting a merchant with disputes fails with P2003.
  7. Invalid amount/currency values fail the named SQL CHECK constraints.
  8. Unsupported status fails the PostgreSQL enum constraint.
- Standalone demo output:

| Reference | Title | Minor units | Currency | Status |
| --- | --- | ---: | --- | --- |
| DG-SCHEMA-001 | Item not received | 149900 | INR | ACTION_REQUIRED |
| DG-SCHEMA-002 | Duplicate payment | 25000 | INR | UNDER_REVIEW |

The other merchant's dispute is absent, as expected. No production build or
browser flow is claimed: the runnable feature demonstration is the CLI command.
Video recording/upload is still a separate submission step.
