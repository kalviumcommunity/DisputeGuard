import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { writeAuditLog } from '@/lib/audit';

/**
 * POST /api/cron/run
 *
 * FR-08 (daily reminders) + FR-09 (automatic escalation) live here.
 * NFR-04 requires this to run at least hourly so escalation happens
 * within 1 hour of a deadline passing — see scripts/run-cron-local.ts
 * for a local dev runner, or wire this URL into Google Cloud Scheduler
 * for the real deployment.
 *
 * Protected by a shared secret header rather than a user session,
 * since the caller is a scheduler, not a logged-in person.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const results = { remindersSent: 0, escalated: 0, errors: [] as string[] };

  // Reminders: any ACTION_REQUIRED dispute that hasn't had a reminder
  // sent yet today, and hasn't hit its deadline.
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const pending = await prisma.dispute.findMany({
    where: { status: 'ACTION_REQUIRED', deadlineAt: { gt: now } },
  });

  for (const dispute of pending) {
    const alreadyRemindedToday = dispute.lastReminderAt && dispute.lastReminderAt >= startOfToday;
    if (alreadyRemindedToday) continue;

    try {
      await prisma.$transaction([
        prisma.reminder.create({ data: { disputeId: dispute.id } }),
        prisma.dispute.update({ where: { id: dispute.id }, data: { lastReminderAt: now } }),
      ]);
      await writeAuditLog({ disputeId: dispute.id, action: 'REMINDER_SENT' });
      results.remindersSent++;
      // NFR-05 note: a real deployment would send an actual email/SMS
      // here; for Sprint 1, the Reminder row + audit log IS the
      // observable reminder (visible on the merchant dashboard).
    } catch (err) {
      results.errors.push(`reminder failed for ${dispute.id}: ${(err as Error).message}`);
    }
  }

  // Escalation: any ACTION_REQUIRED dispute whose deadline has passed.
  const overdue = await prisma.dispute.findMany({
    where: { status: 'ACTION_REQUIRED', deadlineAt: { lte: now } },
  });

  for (const dispute of overdue) {
    try {
      await prisma.dispute.update({
        where: { id: dispute.id },
        data: { status: 'ESCALATED', escalatedAt: now },
      });
      await writeAuditLog({ disputeId: dispute.id, action: 'ESCALATED' });
      results.escalated++;
    } catch (err) {
      results.errors.push(`escalation failed for ${dispute.id}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({ ranAt: now.toISOString(), ...results });
}
