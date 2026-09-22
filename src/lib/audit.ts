import { prisma } from './db';
import type { AuditAction, Prisma } from '@prisma/client';

/**
 * FR-12: Audit Logging. Every meaningful dispute action gets a row
 * here, independent of the Evidence submission record (FR-06). This
 * is append-only — no route in this app ever updates or deletes an
 * AuditLog row.
 */
export async function writeAuditLog(params: {
  disputeId: string;
  action: AuditAction;
  actorId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.auditLog.create({
    data: {
      disputeId: params.disputeId,
      action: params.action,
      actorId: params.actorId ?? null,
      metadata: params.metadata,
    },
  });
}
