# feat(prisma-schema-definition): model merchant disputes with Prisma

DisputeGuard previously had only a User database model. This adds a related
Dispute model and a runnable, generated-type-checked merchant dispute query.

## Assignment requirements

- **Two models:** User and Dispute in `frontend/prisma/schema.prisma`.
- **Types and attributes:** CUID primary keys, unique email/reference, integer
  minor-unit money, status enum, timestamps, defaults and a required foreign key.
- **DATABASE_URL:** PostgreSQL datasource is wired through
  `frontend/prisma7.config.ts`, as required by Prisma 7. The schema documents this
  location; legacy schema-level URL syntax is not compatible with this version.
- **Generate:** Prisma 7.10.0 generation and validation pass.
- **Client example:** `frontend/lib/merchant-disputes.ts` uses generated
  `Prisma.DisputeSelect`, `Prisma.DisputeGetPayload` and `PrismaClient` types:

```ts
const disputes = await listMerchantDisputes(client, merchant.id);
// Typed records include reference, amountMinor, currency, status and merchant.
```

Run the complete example with `pnpm demo:schema` from frontend.

## Migration and tradeoffs

Added an incremental migration with enum, unique reference, merchant foreign key,
queue index, and SQL checks for positive amounts and uppercase currency codes.
Deleting a merchant with disputes is restricted to preserve records. Integer minor
units avoid float rounding but impose an integer range limit. The existing mock
API is unchanged; this focused schema demo does not implement application-wide
authorization or migrate a live database.

## Verification

From frontend: `pnpm prisma:validate`, `pnpm prisma:generate`,
`pnpm test:schema`, `pnpm demo:schema`.

All eight behavioral checks pass (nine including the parent test), as do TypeScript
and focused lint. The isolated PGlite test applies the full migration SQL history,
seeds twice, uses the real Prisma Client and verifies relation queries, defaults,
unique keys, foreign keys, deletion restrictions and check/enum constraints.
It creates no persistent database or service. Dedicated PostgreSQL migration
deployment still needs verification before production.

Evidence, observed output, setup and SQL mapping: `docs/evidence/prisma-schema.md`.
Screen-share outline: `docs/evidence/prisma-schema-video.md`.
The required video recording and Google Drive upload are still pending.
