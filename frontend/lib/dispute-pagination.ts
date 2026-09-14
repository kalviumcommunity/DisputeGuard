import { DisputeStatus, type PrismaClient } from './generated/prisma';

export const PAGE_SIZE = 5;
export type QueryParams = Record<string, string | string[] | undefined>;
export function parsePagination(params: QueryParams) {
  const number = typeof params.page === 'string' && /^[1-9]\d*$/.test(params.page) ? Number(params.page) : 1;
  return {
    page: Number.isSafeInteger(number) ? number : 1,
    status: typeof params.status === 'string' && Object.values(DisputeStatus).includes(params.status as DisputeStatus)
      ? params.status as DisputeStatus : 'ALL' as const,
    sort: params.sort === 'asc' ? 'asc' as const : 'desc' as const,
  };
}
export function paginationHref(query: ReturnType<typeof parsePagination>, page: number) {
  const params = new URLSearchParams({ page: String(page), sort: query.sort });
  if (query.status !== 'ALL') params.set('status', query.status);
  return `/disputes?${params}`;
}
export async function getDisputePage(client: PrismaClient, params: QueryParams) {
  const query = parsePagination(params);
  const where = query.status === 'ALL' ? {} : { status: query.status };
  return client.$transaction(async (tx) => {
    const total = await tx.dispute.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(query.page, totalPages);
    const records = await tx.dispute.findMany({
      where,
      // ID breaks timestamp ties, preventing unstable page boundaries.
      orderBy: [{ createdAt: query.sort }, { id: query.sort }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, reference: true, title: true, amountMinor: true, currency: true, status: true, priority: true },
    });
    return { records, query, page, total, totalPages, hasPrevious: page > 1, hasNext: page < totalPages };
  });
}
