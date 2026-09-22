import type { DisputeStatus } from '@prisma/client';

export const RESPONSE_WINDOW_DAYS = 7; // FR-07

export function computeDeadline(createdAt: Date): Date {
  const deadline = new Date(createdAt);
  deadline.setDate(deadline.getDate() + RESPONSE_WINDOW_DAYS);
  return deadline;
}

export function daysLeft(deadlineAt: Date, now: Date = new Date()): number {
  const ms = deadlineAt.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export const STATUS_LABELS: Record<DisputeStatus, string> = {
  ACTION_REQUIRED: 'Action required',
  EVIDENCE_SUBMITTED: 'Evidence submitted',
  UNDER_REVIEW: 'Under review',
  RESOLVED: 'Resolved',
  ESCALATED: 'Escalated',
};
