# Structured Logging with Pino

## Scope and implementation

The existing `POST /api/tasks` validation demo is the smallest server slice used for this assignment. Its successful response still echoes the validated task; it does not persist a task.

- `frontend/lib/logger.ts` exports the configured Pino instance, JSON timestamps, service/environment fields, an optional `LOG_LEVEL`, and redaction.
- `frontend/lib/task-handler.ts` uses info for received/successful requests, warn for invalid input, and error for unexpected failures. Each request gets a generated request ID, returned in `x-request-id`; completion logs include status and elapsed milliseconds.
- `frontend/app/api/tasks/route.ts` wires the handler to the shared logger using the Node.js runtime.
- Password, passwordHash, token, accessToken and refreshToken fields are redacted at the root and one object level down. Authorization/cookie headers are normalized before logging and redacted; configured response set-cookie fields are also redacted.
- Application log records are one JSON object per line. Next.js development banners are separate framework output, not Pino records.

## Verification

From `frontend`, after installing the locked dependencies:

```sh
pnpm test:logging
node scripts/capture-logging-evidence.mjs
pnpm exec eslint lib/logger.ts lib/task-handler.ts app/api/tasks/route.ts tests/logging.test.ts scripts/capture-logging-evidence.mjs
```

The capture command starts a temporary Next.js development server on port 3006, sends three real HTTP requests, captures the original Pino lines, and stops its own server. Keep that port free. It overwrites the evidence file intentionally when rerun. On Windows it uses taskkill only for the process tree it started.

Verified on 2026-09-15:

- Three automated tests passed: JSON line framing/redaction; request correlation and info/warn paths; an injected unexpected failure producing a safe 500 response and error-level record.
- Real HTTP responses were 201 (valid task), 400 (invalid fields), and 400 (malformed JSON).
- Six original records are in [pino-requests.jsonl](./pino-requests.jsonl). The capture verifies that fixture credentials, query tokens, and the task title are absent. Authorization and cookie values appear as `[REDACTED]`.
- Focused ESLint passed.
- Full TypeScript checking is blocked by existing missing `PrismaClient` exports in `app/api/disputes/route.ts` and `scripts/test-relation-query.ts`. No full-build success is claimed. Next.js also reports the existing middleware deprecation warning.

## Tradeoff

Structured fields let an aggregator parse each line and filter by service, requestId, event, status, or numeric level without parsing prose. The default level is info; debug (20) is for optional diagnostics, info (30) for normal events, warn (40) for rejected requests, and error (50) for unexpected failures. Set `LOG_LEVEL=debug` to enable debug calls if added later.

This focused route logs stable metadata rather than request bodies, query strings, arbitrary error text, or stacks. That reduces accidental disclosure but provides less failure detail. Redaction is case-sensitive and path-based, not a universal scrubber for arbitrary nested objects or secrets embedded in strings. New logged fields require a review of redaction paths. There is no pretty-print transport so application records remain machine-readable JSON.

## Required 3–5 minute screen-share outline

1. Explain how structured JSON fields support production search compared with free-form console output.
2. Show the exported base logger and its timestamp, service, environment, and level configuration.
3. Walk through debug/info/warn/error and the route's normal, invalid-input, and unexpected-error paths.
4. Run the logging tests to show password/token redaction; run the HTTP capture and show redacted headers in the evidence file.
5. Explain how an aggregator reads each JSON line and groups both records with the same requestId.

The presenter still needs to record and upload the video to Google Drive, enable “Anyone with the link can view,” and verify the link in a private browser tab. A recording or submission link has not been fabricated.
