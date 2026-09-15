# PR title

feat: add structured Pino logging with redaction to the task API

# PR description

The task API now emits structured JSON logs for received, successful, invalid, and unexpectedly failed requests. Each request has a generated request ID returned in the response header, allowing its log records to be correlated.

## Assignment requirements

- Install Pino and export a configured instance from `frontend/lib/logger.ts`.
- Use `logger.info`, `logger.warn`, and `logger.error` in `frontend/lib/task-handler.ts`, connected through `frontend/app/api/tasks/route.ts`.
- Configure redaction for password/token fields and credential headers; avoid logging bodies, query strings, and raw exception text.
- Emit one JSON object per application log line with service, environment, timestamp, request ID, event, and completion status/duration.
- Include six original log lines from three real HTTP requests in `docs/evidence/pino-requests.jsonl`.

## Real request sample

These two original records came from a successful POST request to the local Next.js server:

```jsonl
{"level":30,"time":"2026-09-15T09:13:32.433Z","service":"disputeguard","environment":"development","requestId":"a85ede5d-32d4-41ba-8e8f-b493ea1d6794","route":"/api/tasks","method":"POST","event":"request_received","req":{"headers":{"authorization":"[REDACTED]","cookie":"[REDACTED]"}},"msg":"Task request received"}
{"level":30,"time":"2026-09-15T09:13:32.442Z","service":"disputeguard","environment":"development","requestId":"a85ede5d-32d4-41ba-8e8f-b493ea1d6794","route":"/api/tasks","method":"POST","event":"request_completed","status":201,"durationMs":14.4058,"msg":"Task request completed"}
```

## Verification

From `frontend`:

```sh
pnpm test:logging
node scripts/capture-logging-evidence.mjs
pnpm exec eslint lib/logger.ts lib/task-handler.ts app/api/tasks/route.ts tests/logging.test.ts scripts/capture-logging-evidence.mjs
```

- All three logging tests passed, including safe error-level logging for an injected unexpected failure.
- Real HTTP checks passed with statuses 201, 400, and 400; six JSON lines captured with no fixture secrets.
- Focused lint passed.
- Full TypeScript checking still reports existing missing PrismaClient exports in `app/api/disputes/route.ts` and `scripts/test-relation-query.ts`.

## Scope and tradeoff

The existing task validation demo provides a small, real server slice. Stable metadata and path-based redaction reduce disclosure risks, at the cost of omitting raw error text/stacks. New log fields still require redaction review. The route does not persist tasks. Implementation details, verification evidence, and the required video outline are in `docs/evidence/structured-logging-with-pino.md`.

The separate 3–5 minute video recording and shared Google Drive link remain to be supplied by the presenter.
