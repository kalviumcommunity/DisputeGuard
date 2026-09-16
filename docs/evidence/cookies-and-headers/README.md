# Cookies and headers assignment

## Implementation

- `frontend/app/layout.tsx` awaits `cookies()` and sets `html[data-theme]` before HTML is sent. Missing or invalid values default to light. CSS uses that attribute instead of the operating-system preference, preventing a late theme change.
- `frontend/app/api/theme/route.ts` validates JSON and writes the preference with `cookieStore.set`: Path=/, Max-Age=31536000, SameSite=Lax, HttpOnly, and Secure in production. The browser stores this as a persistent cookie (subject to browser/user privacy settings). Invalid input returns 400 without changing the cookie.
- `frontend/components/ThemePicker.tsx` receives the server's theme as a prop, sends a POST, then reloads. It never reads or writes `document.cookie`.
- `frontend/app/dashboard/page.tsx` awaits `headers()` and renders actual user-agent/accept-language values, with “Not provided” for null. It demonstrates matching uppercase/lowercase header lookups without using the header as authentication.
- `frontend/lib/feature-flags.ts` accepts a bounded comma-separated list of lowercase flag names. The `dispute-preview` flag changes dashboard text. Absent, malformed, unknown, or oversized input takes the standard UI path. Flags are presentation-only; a production load balancer must overwrite incoming flag headers if they should be trusted.
- The existing NextAuth GET/POST route already sets an HttpOnly, Secure, SameSite=Lax session cookie. Verification exercises renewal of a valid locally signed fixture, not an actual credentials/Google login. Removed the old simulated-login button that wrote a fake JavaScript cookie; real login remains unchanged.

## Dynamic versus static

The root cookie lookup makes normal App Router routes request-rendered. `/dashboard` is marked `ƒ` in the successful build. `/rendering-control` is a small Pages Router page outside the cookie-reading root layout and is automatically static (`○`), giving a genuine control in the same build without moving existing routes. A Pages Router control introduces nullable `useSearchParams` typings; the existing filter now handles that null value.

Two existing revalidation demonstrations, `/disputes-list` and `/unaffected-route`, explicitly use `force-static`. Their override returns empty cookies during prerendering, so they retain the default light theme. Their caching behavior is preserved. The independent control also intentionally has no per-user theme. No `force-dynamic` override is used to manufacture the dashboard result.

## Required build repairs

The synced main branch could not build. Only these supporting repairs were made:

- Removed `frontend/app/pricing/page.tsx`, an exact duplicate of `(marketing)/pricing/page.tsx` that caused a conflicting route error. `/pricing`, its content, and metadata remain in the marketing route.
- Corrected Prisma imports in the disputes API and relation-query script to the project's generated client, supplying the existing SQLite adapter pattern. No database migration or data write was performed for this assignment.

## Reproduce verification

Use the project's existing environment configuration and locked dependencies. From `frontend`:

```sh
node scripts/capture-cookies-build.mjs
node scripts/verify-cookies-and-headers.mjs
```

The first command runs the real `next build` and saves its unmodified text (ANSI styling removed) to `build.txt`. Network access is needed for the existing Google Fonts. The second starts `next start` on port 3007, sends real HTTP requests, and stops only its own server process tree. Keep port 3007 free. Its signed session fixture remains in memory and is never written to evidence. It requires the existing NEXTAUTH_SECRET, but prints no secrets.

Seven groups passed; see [verification.txt](./verification.txt). Coverage includes initial server HTML, persistent-cookie attributes and reload, rejected bodies, actual headers, flag fallbacks, session-cookie renewal, and build classification. Focused ESLint and the production build's TypeScript check passed. The existing middleware deprecation warning remains.

Browser verification also passed: switching to dark mode reloaded with the saved dark theme, and another reload retained it. A full browser restart was not automated; persistence is verified through the one-year Max-Age attribute. [dark-theme.png](./dark-theme.png) captures the saved dark view. No app/component source contains `document.cookie`.

[build.png](./build.png) is a browser screenshot of the captured build text showing the dynamic dashboard and static control. The original full output is [build.txt](./build.txt).

## 3–5 minute video outline (presenter still needs to record)

1. Explain that `next/headers` reads the incoming request on the server. Browser JavaScript does not have that server request context; HttpOnly cookies are inaccessible to it.
2. Show `app/layout.tsx`, the awaited cookie read, light fallback, and initial `data-theme`. Switch to dark on `/public-info`, reload, and inspect the first HTML response.
3. Show the theme POST handler. Reading is allowed in request-time Server Components/handlers/actions; writes must happen in a route handler, Server Action, or middleware before response streaming, not during Server Component rendering.
4. Explain SameSite=Lax, HttpOnly, Secure in production, and the one-year preference lifetime. Show the existing secure session-cookie configuration separately.
5. Show header values, enabled versus absent/malformed feature flags using the verification script, and `ƒ /dashboard` versus `○ /rendering-control` in the build. Explain the per-request rendering cost and loss of ordinary static caching for cookie-dependent pages.

Record the screen-share, upload it to Google Drive, set “Anyone with the link can view,” and test in a private browser window. The video and Drive link are not yet supplied.
