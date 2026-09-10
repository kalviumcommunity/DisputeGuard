import { NextResponse } from "next/server";
import { PrismaClient } from "../../lib/generated/prisma";

const prisma = new PrismaClient({
  log: [{ emit: "event", level: "query" }],
});

export async function GET() {
  const queryLogs: string[] = [];

  // @ts-ignore
  prisma.$on("query", (e: { query: string; params: string; duration: number }) => {
    queryLogs.push(`${e.query} -- Params: ${e.params} [${e.duration}ms]`);
  });

  // Task 2 & 3: Use select to shape payload and include/select related merchant
  const disputes = await prisma.dispute.findMany({
    select: {
      id: true,
      reference: true,
      title: true,
      amountMinor: true,
      status: true,
      priority: true,
      // Task 2 & 3: Fetching related User record (merchant) with restricted fields
      merchant: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    take: 10,
  });

  return NextResponse.json({
    data: disputes,
    executedQueriesCount: queryLogs.length,
    sqlQueryLogs: queryLogs,
  });
}