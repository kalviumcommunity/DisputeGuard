# PR title

feat: read theme cookies and request headers on the server

# PR description

## Summary

Render the saved theme in the initial HTML using `await cookies()` in the root layout. Add a validated theme POST route, server-rendered dashboard request headers, and conditional UI for the `dispute-preview` feature flag.

## Changes

- Apply light/dark `data-theme` before hydration, defaulting invalid/missing cookies to light.
- Write the theme cookie using `cookieStore.set` with Path=/, one-year Max-Age, SameSite=Lax, HttpOnly, and Secure in production.
- Add a theme switch that posts to the route handler and reloads without accessing `document.cookie`.
- Read actual user-agent, accept-language, and x-feature-flags headers on the server; handle missing/malformed values and demonstrate case-insensitive lookup.
- Verify the existing NextAuth route's HttpOnly session-cookie renewal and remove the old fake client-cookie login button.
- Add an independent static control page and real HTTP/build verification evidence.

## Build evidence

The production build passes and marks `/dashboard` as dynamic (`ƒ`) and `/rendering-control` as static (`○`). This screenshot shows the actual captured build output; the complete text is in `docs/evidence/cookies-and-headers/build.txt`.

![Dynamic dashboard and static control in build output](https://github.com/kalviumcommunity/DisputeGuard/blob/feature/cookies-and-headers/docs/evidence/cookies-and-headers/build.png?raw=true)

## Verification

From `frontend`:

```sh
node scripts/capture-cookies-build.mjs
node scripts/verify-cookies-and-headers.mjs
```

- Production build and its TypeScript check passed.
- Seven real-request verification groups passed: initial HTML; persistent cookie attributes/reload; invalid input; request headers/case-insensitivity; feature flag fallbacks; secure session-cookie renewal; dynamic/static build classification.
- Focused ESLint passed.
- Browser theme switch and reload passed; screenshot saved in the evidence folder. Browser restart was not automated; persistent-cookie Max-Age was verified.

## Supporting fixes and tradeoff

The synced main branch had a duplicate `/pricing` route and invalid Prisma client imports that blocked the required build. Keep the identical marketing pricing page, remove its duplicate, and correct the two client imports/adapter configurations. The filter's query parameters now handle nullable typings introduced by the independent Pages Router control.

Request-dependent themes require dynamic rendering. Existing explicitly force-static revalidation demos retain their light fallback and caching behavior. Feature flags only change presentation, not authorization. See `docs/evidence/cookies-and-headers/README.md` for details and verification instructions.

The required 3–5 minute screen-share and Google Drive link remain to be supplied by the presenter.
