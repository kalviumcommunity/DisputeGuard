# feat(database-seeding-for-development): add repeatable development seed data

## Summary

- Added `frontend/prisma/seed.ts` with two merchants and three related disputes.
- Added package.json `prisma.seed` and wired Prisma 7 `migrations.seed` to it.
- Verified the actual `prisma db seed` command populates SQLite.
- Used transactional upserts by email/reference so repeats preserve IDs and
  local changes without duplicating or deleting records.
- Added a real database-viewer screenshot and reproducible integration test.
- Added the SQLite adapter/runtime dependencies needed by the current schema.

## Verification

Run from frontend: `pnpm prisma:generate`, `pnpm test:seed`.
The integration test passes real migrations and runs the seed command twice,
checking counts, relationships, stable IDs, preservation of edits/unrelated
records and production refusal. Focused lint and generation pass.

Setup, limitations, observed results and video outline:
[`docs/evidence/development-seeding.md`](docs/evidence/development-seeding.md).

![Seeded records in the read-only SQLite viewer](https://raw.githubusercontent.com/kalviumcommunity/DisputeGuard/feature/database-seeding-for-development/docs/evidence/development-seed-records.png)

## Tradeoff and limits

Empty upsert updates preserve developer edits; changed fixtures require a fresh
test DB for an exact baseline. Passwords are randomly generated and hashed, with
no shared demo login or admin user. The seed accepts local SQLite file URLs and
refuses production mode. No live database was modified.

Full-repo typechecking still reports pre-existing PrismaClient import errors in
the relation-query route/script; this PR does not broaden scope to those files.
The required screen-share recording and Google Drive link are still pending.
