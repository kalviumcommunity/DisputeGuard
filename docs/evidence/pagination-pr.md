# feat(pagination-offset-and-cursor-based): paginate the dispute list

## Summary

The dispute list previously returned only the first ten records. It now uses
Prisma offset pagination with five rows per page, URL-based page state, total
counts, page numbers and previous/next navigation.

- `frontend/lib/dispute-pagination.ts`: validated input, stable createdAt/ID
  ordering, filtered count and `skip`/`take` in a transaction.
- `frontend/app/disputes/page.tsx`: awaits URL parameters, renders metadata and
  records, and redirects invalid/out-of-range page values to their actual page.
- Filter/sort changes reset pagination; navigation preserves both.
- Removed the duplicate `/disputes` route handler that conflicted with the page.
- Added isolated test/demo fixtures and screenshot evidence.

## Strategy

Offset supports numbered pages, total counts and direct page jumps for this small
table. Large offsets become slower and concurrent inserts/deletes can move records
between pages. Cursor/keyset pagination is a future option for deep sequential
navigation; this PR implements offset only, as permitted by the assignment.

## Verification

From frontend: `pnpm test:pagination` and `pnpm demo:pagination`.
Setup and full evidence: `docs/evidence/pagination.md`.

Both automated tests and focused lint passed. Real Prisma checks cover 5/5/2 page
slices, timestamp ties, filtering, boundaries, empty results and invalid inputs.
Browser checks verified Next, final-page controls, Back, filter reset and refresh.

![Page two with records 6–10](https://raw.githubusercontent.com/kalviumcommunity/DisputeGuard/feature/pagination-offset-and-cursor-based/docs/evidence/pagination-page-2.png)

Full-repo typechecking still reports the existing PrismaClient import errors in
the API route and relation-query script. Public-list access behavior is unchanged;
this PR is not an authorization implementation. Verification uses fictional data.
The required video recording/Google Drive link remains pending.
