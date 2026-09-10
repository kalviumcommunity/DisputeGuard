import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: [{ emit: "event", level: "query" }],
});

async function main() {
  const logs: string[] = [];
  // @ts-ignore
  prisma.$on("query", (e: { query: string; duration: number }) => {
    logs.push(`SQL: ${e.query} [Duration: ${e.duration}ms]`);
  });

  console.log("Executing Prisma relation query with select & include...");

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
    take: 5,
  });

  const evidenceDir = path.join(process.cwd(), "docs", "evidence");
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  const logContent = [
    "=== DISPUTEGUARD RELATION QUERY EVIDENCE ===",
    `Timestamp: ${new Date().toISOString()}`,
    `Total SQL Queries Executed: ${logs.length}`,
    "--- Single SQL Query Log ---",
    ...logs,
    "----------------------------",
    "Sample Data Payload (Shaped):",
    JSON.stringify(disputes, null, 2),
  ].join("\n");

  fs.writeFileSync(path.join(evidenceDir, "query-log.txt"), logContent);
  console.log("Query log successfully recorded to docs/evidence/query-log.txt!");
}

main()
  .catch((err) => console.error(err))
  .finally(async () => await prisma.$disconnect());