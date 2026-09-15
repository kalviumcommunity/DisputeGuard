import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';

const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--port', '3006'], { windowsHide: true });
let output = '';
server.stdout.on('data', (chunk) => { output += chunk.toString(); });
server.stderr.on('data', (chunk) => { process.stderr.write(chunk); });
try {
  for (let attempt = 0; !output.includes('Ready in'); attempt++) {
    assert.ok(attempt < 120 && server.exitCode === null, 'Local server did not become ready');
    await setTimeout(500);
  }
  const requestIds = [];
  for (const [body, expected] of [
    [JSON.stringify({ title: 'Review dispute evidence', priority: 'high', password: 'SECRET-FIXTURE-PASSWORD', token: 'SECRET-FIXTURE-TOKEN' }), 201],
    [JSON.stringify({ title: 'x' }), 400],
    ['{invalid JSON', 400],
  ]) {
    const response = await fetch('http://localhost:3006/api/tasks?token=SECRET-QUERY', {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer SECRET-FIXTURE', cookie: 'session=SECRET-FIXTURE' }, body,
    });
    assert.equal(response.status, expected);
    requestIds.push(response.headers.get('x-request-id'));
    await response.text();
  }
  let lines = [];
  for (let attempt = 0; attempt < 20; attempt++) {
    lines = output.split(/\r?\n/).filter((line) => {
      try { const record = JSON.parse(line); return record.service === 'disputeguard' && requestIds.includes(record.requestId); }
      catch { return false; }
    });
    if (lines.length === 6) break;
    await setTimeout(100);
  }
  assert.equal(lines.length, 6);
  assert.ok(!lines.join('\n').includes('SECRET-'));
  assert.ok(!lines.join('\n').includes('Review dispute evidence'));
  for (const line of lines) {
    const record = JSON.parse(line);
    assert.equal(record.route, '/api/tasks');
    if (record.req) assert.equal(record.req.headers.authorization, '[REDACTED]');
  }
  await mkdir('../docs/evidence', { recursive: true });
  await writeFile('../docs/evidence/pino-requests.jsonl', lines.join('\n') + '\n');
  console.log('PASS: three real HTTP requests returned 201/400/400; six original JSON log lines captured with no fixture secrets.');
} finally {
  if (server.exitCode === null) {
    if (process.platform === 'win32') execFileSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    else server.kill('SIGTERM');
  }
}
