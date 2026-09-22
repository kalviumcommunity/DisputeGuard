# Dispute Guard

Merchant dispute proof & evidence platform — Kalvium Sem 3, Sprint 1.
JECRC Campus · Squad 125 · Team 03.

Built on the stack specified in the PRD: **Next.js, PostgreSQL, Prisma, GCP, GitHub Actions.**

---

## Running it locally

You'll need Node.js 20+, Docker (for local Postgres, or use your own instance), and real internet access to install packages — none of that is available in the environment this was written in, so this hasn't been run end-to-end yet. These steps are what you'll run yourself.

```bash
# 1. Install dependencies
npm install

# 2. Start a local Postgres (or point DATABASE_URL at your own instance)
docker compose up -d

# 3. Configure environment
cp .env.example .env
# then edit .env — at minimum set JWT_SECRET and CRON_SECRET to real random strings
# (openssl rand -base64 48)

# 4. Create the database schema
npx prisma migrate dev --name init

# 5. Seed demo data (FR-13: simulated dispute data for the MVP)
npm run prisma:seed

# 6. Run the app
npm run dev
```

Open http://localhost:3000. Demo logins (from the seed script):

- **Merchant:** `merchant@example.com` / `password123`
- **Admin:** `admin@example.com` / `password123`

### Keeping reminders/escalations running while you develop

In a second terminal:

```bash
npm run cron:local
```

This hits `POST /api/cron/run` every hour, same as the real scheduler will in production (see below). Run it once manually if you don't want to wait an hour to see it work — it runs immediately on start, then hourly after that.

---

## Deploying to GCP

1. **Cloud SQL for PostgreSQL** — create an instance, set `DATABASE_URL` accordingly.
2. **Cloud Run** (or App Engine) — deploy the Next.js app as a container; `next build && next start` works out of the box.
3. **Cloud Storage** — swap the body of `saveEvidenceFile()` in `src/lib/storage.ts` for the GCS SDK (the function signature is already designed so nothing calling it needs to change). Turn on a **bucket retention policy** for real storage-level immutability, on top of the app-level immutability (hash + no update/delete route) that's already enforced.
4. **Cloud Scheduler** — create an hourly job that sends `POST https://<your-domain>/api/cron/run` with header `x-cron-secret: <CRON_SECRET>`. This replaces `scripts/run-cron-local.ts`, which is dev-only.
5. **GitHub Actions** (`.github/workflows/ci.yml`) is already wired for lint + build on every push to `main`/`develop`.

---

## How this maps to the PRD

| PRD requirement | Where it lives |
|---|---|
| FR-01/02/03 — dashboard, list, detail | `src/app/(app)/dashboard`, `disputes`, `disputes/[id]` |
| FR-04/05/06 — upload, submit, immutable evidence | `src/app/api/disputes/[id]/evidence/route.ts` — only `GET`/`POST` exported, no `PUT`/`PATCH`/`DELETE` anywhere |
| FR-07 — 7-day timer | `src/lib/disputes.ts` (`computeDeadline`, `daysLeft`) |
| FR-08 — daily reminders | `src/app/api/cron/run/route.ts`, `Reminder` model |
| FR-09 — auto-escalation | same cron route |
| FR-10 — status enum | `DisputeStatus` in `prisma/schema.prisma` |
| FR-11 — evidence file constraints | `src/lib/validation.ts`, enforced server-side inside the upload route |
| FR-12 — audit logging | `src/lib/audit.ts`, `AuditLog` model, admin-only `/admin/audit` page |
| FR-13 — dispute creation source | `POST /api/disputes` (admin-facing simulated entry point) + `prisma/seed.ts` |
| NFR-04/05 — scheduler reliability | cron route returns a structured result with an `errors` array per-dispute, so one failure doesn't silently skip others |
| NFR-06/07 — server-side validation & auth | `src/middleware.ts` + every route re-checks `requireUser`/`requireAdmin`/`canAccessDispute` itself |
| NFR-09/10 — hashing, no mutation routes | `src/lib/hash.ts`, evidence route file header |
| NFR-11/12 — lint, CI | `.eslintrc.json`, `.github/workflows/ci.yml` |

### What's intentionally out of scope (per the PRD's Non-Goals)

Payment processing, automated dispute decisions, AI-based analysis, direct bank/card-network integration, and advanced analytics — none of that is here, on purpose.

### Known limitations of this Sprint 1 version

- Evidence files are stored on local disk (`/uploads`), not GCS — see `src/lib/storage.ts` for the documented swap.
- Reminders are recorded as `Reminder` rows + audit log entries, not actually emailed/texted — the PRD's MVP scope only requires the mechanism to exist and be visible, not a real notification channel.
- `POST /api/disputes` (the FR-13 simulated entry point) is a plain JSON API an admin/script calls — there's no admin UI form for it yet in this pass. Easy to add as a page under `src/app/(app)/admin/` if you want one.
