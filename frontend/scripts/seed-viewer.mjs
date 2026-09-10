import { DatabaseSync } from 'node:sqlite';
import { createServer } from 'node:http';

// Local, read-only DB viewer for seed evidence; no passwords or write endpoints.
const db = new DatabaseSync('.seed-verification/demo.db', { readOnly: true });
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function table(rows) {
  if (!rows.length) return '<p>No records</p>';
  return '<table><thead><tr>' + Object.keys(rows[0]).map((key) => `<th>${escape(key)}</th>`).join('') + '</tr></thead><tbody>' + rows.map((row) => '<tr>' + Object.values(row).map((value) => `<td>${escape(value)}</td>`).join('') + '</tr>').join('') + '</tbody></table>';
}
const server = createServer((req, res) => {
  if (req.url !== '/') { res.writeHead(404).end(); return; }
  const users = db.prepare('SELECT name, email, role FROM User ORDER BY email').all();
  const disputes = db.prepare('SELECT d.reference, d.title, d.amountMinor, d.currency, d.status, d.priority, u.name AS merchant FROM Dispute d JOIN User u ON u.id=d.merchantId ORDER BY d.reference').all();
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(`<!doctype html><html><head><title>DisputeGuard seed database viewer</title><style>body{font:16px system-ui;margin:40px;color:#142336;background:#f6f8fb}h1{font-size:28px}h2{margin-top:36px}table{border-collapse:collapse;background:white;width:100%;font-size:14px}th,td{padding:14px;text-align:left;border:1px solid #dce3eb}th{background:#e8eef5}p{color:#526174}</style></head><body><h1>DisputeGuard · Development seed database</h1><p>Read-only SQLite viewer · Live SELECT queries from .seed-verification/demo.db</p><h2>User — ${users.length} records</h2>${table(users)}<h2>Dispute — ${disputes.length} records</h2>${table(disputes)}<p>Seeded through prisma db seed. Password hashes are excluded from this viewer.</p></body></html>`);
});
server.listen(51234, '127.0.0.1', () => console.log('Seed DB viewer: http://127.0.0.1:51234'));
process.on('SIGINT', () => { server.close(); db.close(); });
