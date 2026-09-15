import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLogger } from '../lib/logger';
import { createTaskHandler } from '../lib/task-handler';

function capture() {
  let output = '';
  const logger = createLogger({ write(line: string) { output += line; } });
  logger.level = 'info';
  return { logger, text: () => output, records: () => output.trim().split('\n').map((line) => JSON.parse(line)) };
}

test('JSON lines redact secrets at supported paths and preserve useful fields', () => {
  const sink = capture();
  sink.logger.info({ password: 'SECRET-PASS', token: 'SECRET-TOKEN', user: { passwordHash: 'SECRET-HASH', email: 'demo@example.test' }, body: { password: 'SECRET-BODY', token: 'SECRET-BODY-TOKEN' }, req: { headers: { authorization: 'SECRET-AUTH', cookie: 'SECRET-COOKIE' } } }, 'Redaction test\nremains one JSON line');
  const [record] = sink.records();
  assert.equal(sink.records().length, 1);
  assert.equal(record.service, 'disputeguard');
  assert.equal(record.level, 30);
  assert.ok(!Number.isNaN(Date.parse(record.time)));
  assert.equal(record.password, '[REDACTED]');
  assert.equal(record.body.token, '[REDACTED]');
  assert.equal(record.req.headers.authorization, '[REDACTED]');
  assert.equal(record.user.email, 'demo@example.test');
  assert.ok(!sink.text().includes('SECRET-'));
});

test('real handler emits correlated info/warn and does not log bodies or query strings', async () => {
  const sink = capture();
  const handler = createTaskHandler(sink.logger);
  for (const [body, status] of [[JSON.stringify({ title: 'PRIVATE-TITLE', priority: 'high', password: 'SECRET-PASS', token: 'SECRET-TOKEN' }), 201], [JSON.stringify({ title: 'x' }), 400], ['{ invalid SECRET-JSON', 400]] as const) {
    const response = await handler(new Request('http://localhost/api/tasks?token=SECRET-QUERY', { method: 'POST', body, headers: { authorization: 'SECRET-AUTH', cookie: 'token=SECRET-COOKIE' } }));
    assert.equal(response.status, status);
    const pair = sink.records().slice(-2);
    assert.equal(pair[0].requestId, response.headers.get('x-request-id'));
    assert.equal(pair[1].requestId, pair[0].requestId);
    assert.equal(pair[1].status, status);
    assert.equal(pair[1].level, status === 201 ? 30 : 40);
    assert.ok(pair[1].durationMs >= 0);
  }
  assert.equal(sink.records().length, 6);
  assert.ok(!sink.text().includes('SECRET-'));
  assert.ok(!sink.text().includes('PRIVATE-TITLE'));
});

test('unexpected failures emit error without exposing exception text', async () => {
  const sink = capture();
  const req = new Request('http://localhost/api/tasks', { method: 'POST' });
  req.json = async () => { throw new Error('SECRET-EXCEPTION'); };
  const response = await createTaskHandler(sink.logger)(req);
  assert.equal(response.status, 500);
  assert.equal(sink.records()[1].level, 50);
  assert.equal(sink.records()[1].event, 'request_failed');
  assert.ok(!sink.text().includes('SECRET-EXCEPTION'));
  assert.ok(!(await response.text()).includes('SECRET-EXCEPTION'));
});
