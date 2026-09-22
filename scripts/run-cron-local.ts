/**
 * Local dev stand-in for Google Cloud Scheduler.
 * Run alongside `npm run dev`: it hits /api/cron/run every hour so
 * reminders and escalations actually happen while you're developing.
 *
 * Usage: npm run cron:local
 *
 * In production (GCP), delete this script's role entirely — point a
 * Cloud Scheduler job at POST https://<your-domain>/api/cron/run
 * with header `x-cron-secret: <CRON_SECRET>` on an hourly schedule
 * instead (see NFR-04).
 */
const BASE_URL = process.env.APP_URL ?? 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;

async function runOnce() {
  if (!CRON_SECRET) {
    console.error('CRON_SECRET is not set — copy .env.example to .env first.');
    process.exit(1);
  }
  try {
    const res = await fetch(`${BASE_URL}/api/cron/run`, {
      method: 'POST',
      headers: { 'x-cron-secret': CRON_SECRET },
    });
    const data = await res.json();
    console.log(`[cron] ${new Date().toISOString()}`, data);
  } catch (err) {
    console.error('[cron] run failed:', err);
  }
}

runOnce();
setInterval(runOnce, 60 * 60 * 1000); // every hour, per NFR-04
