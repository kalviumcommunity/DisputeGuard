import { randomUUID } from 'node:crypto';
import type { Logger } from 'pino';
import { z } from 'zod';

const createTaskSchema = z.object({ title: z.string().min(3), priority: z.enum(['low', 'medium', 'high']) });

export function createTaskHandler(logger: Logger) {
  return async function POST(req: Request) {
    const started = performance.now();
    const requestId = randomUUID();
    const log = logger.child({ requestId, route: '/api/tasks', method: 'POST' });
    const headers = { 'x-request-id': requestId };
    // Normalize header casing and never log the body, query string or free text.
    log.info({ event: 'request_received', req: { headers: {
      authorization: req.headers.get('authorization'), cookie: req.headers.get('cookie'),
    } } }, 'Task request received');
    try {
      const body = await req.json();
      const parsed = createTaskSchema.safeParse(body);
      if (!parsed.success) {
        log.warn({ event: 'validation_failed', status: 400, durationMs: performance.now() - started }, 'Task validation failed');
        return Response.json({ success: false, error: parsed.error.flatten() }, { status: 400, headers });
      }
      log.info({ event: 'request_completed', status: 201, durationMs: performance.now() - started }, 'Task request completed');
      return Response.json({ success: true, message: 'Task created successfully', task: parsed.data }, { status: 201, headers });
    } catch (error) {
      const malformed = error instanceof SyntaxError;
      const status = malformed ? 400 : 500;
      // Exception messages/stacks can contain payloads or credentials; use stable codes.
      const fields = { event: malformed ? 'invalid_json' : 'request_failed', status, durationMs: performance.now() - started };
      if (malformed) log.warn(fields, 'Invalid task JSON');
      else log.error(fields, 'Unexpected task request failure');
      return Response.json({ success: false, error: malformed ? 'Invalid JSON request body' : 'Internal server error' }, { status, headers });
    }
  };
}
