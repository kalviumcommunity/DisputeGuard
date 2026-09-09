import type { Prisma, PrismaClient } from './generated/prisma/client';

// Generated types check both the projection and the returned relation shape.
const merchantDisputeSelect = {
  reference: true,
  title: true,
  amountMinor: true,
  currency: true,
  status: true,
  responseDeadline: true,
  merchant: { select: { id: true, name: true } },
} satisfies Prisma.DisputeSelect;

export type MerchantDispute = Prisma.DisputeGetPayload<{
  select: typeof merchantDisputeSelect;
}>;

// The caller must establish merchantId server-side; this is not an auth boundary.
export async function listMerchantDisputes(
  client: PrismaClient,
  merchantId: string,
): Promise<MerchantDispute[]> {
  if (!merchantId.trim()) throw new Error('A merchant ID is required');
  return client.dispute.findMany({
    where: { merchantId },
    select: merchantDisputeSelect,
    orderBy: [{ responseDeadline: 'asc' }, { reference: 'asc' }],
    take: 50,
  });
}
