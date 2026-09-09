# Prisma schema screen-share (3–5 minutes)

1. **0:00–0:40 — Schema structure:** Open schema.prisma. Explain generator,
   PostgreSQL datasource, User and Dispute. Show DATABASE_URL in Prisma 7 config
   without opening actual local credentials.
2. **0:40–1:30 — Models:** Explain one merchant to many disputes, merchantId,
   integer minor-unit amount, currency, enum status, deadline and timestamps.
3. **1:30–2:10 — Attributes:** Explain @id, @default(cuid()), @default(now()),
   @unique, @updatedAt and the compound queue index.
4. **2:10–3:10 — Generation and query:** Run `pnpm prisma:generate`, then
   `pnpm demo:schema`. Show the two returned merchant disputes and the generated
   types used by `lib/merchant-disputes.ts`.
5. **3:10–4:20 — SQL mapping and verification:** Show the migration's table, enum,
   unique index, foreign key and SQL CHECK constraints. Explain restrictive
   deletion and that CUID/updatedAt are Prisma-managed. Run `pnpm test:schema`.

Record your own screen-share, upload it to Google Drive, enable “Anyone with the
link can view”, and verify the link in a private browser window. Submit that link
alongside the PR URL. This outline is not a recorded video.
