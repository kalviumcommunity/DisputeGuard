import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env.DATABASE_URL! }),
  log: [{ emit: "event", level: "query" }],
});

export async function GET() {
  const queryLogs: string[] = [];

  prisma.$on("query", (e: { query: string; params: string; duration: number }) => {
    queryLogs.push(`${e.query} -- Params: ${e.params} [${e.duration}ms]`);
  });

  // Relation Query using select to shape payload and include merchant relation
  const disputes = await prisma.dispute.findMany({
    select: {
      id: true,
      reference: true,
      title: true,
      amountMinor: true,
      status: true,
      priority: true,
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
