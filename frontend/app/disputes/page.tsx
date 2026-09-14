import { Suspense } from "react";
import { PrismaClient } from "@prisma/client";
import { FilterControls } from "./filter-controls";

const prisma = new PrismaClient();

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DisputesPage({ searchParams }: PageProps) {
  // Task 1: A Server Component reads searchParams via page props
  const resolvedParams = await searchParams;
  const statusFilter = typeof resolvedParams.status === "string" ? resolvedParams.status : "ALL";
  const sortOrder = typeof resolvedParams.sort === "string" && resolvedParams.sort === "asc" ? "asc" : "desc";

  // Task 2: Query database based on searchParams state
  const whereClause = statusFilter !== "ALL" ? { status: statusFilter as any } : {};
  const disputes = await prisma.dispute.findMany({
    where: whereClause,
    orderBy: { createdAt: sortOrder },
    take: 10,
    include: { merchant: { select: { name: true, email: true } } },
  });

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Dispute Dashboard (URL SearchParams Demo)</h1>

      <Suspense fallback={<div>Loading filters...</div>}>
        <FilterControls currentStatus={statusFilter} currentSort={sortOrder} />
      </Suspense>

      <div style={{ marginTop: "1rem" }}>
        <p>
          Active Filter: <strong>{statusFilter}</strong> | Sort: <strong>{sortOrder}</strong>
        </p>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd", background: "#f4f4f4" }}>
              <th style={{ padding: "8px" }}>Reference</th>
              <th style={{ padding: "8px" }}>Title</th>
              <th style={{ padding: "8px" }}>Amount</th>
              <th style={{ padding: "8px" }}>Status</th>
              <th style={{ padding: "8px" }}>Priority</th>
            </tr>
          </thead>
          <tbody>
            {disputes.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "16px", textAlign: "center" }}>
                  No disputes found matching status "{statusFilter}".
                </td>
              </tr>
            ) : (
              disputes.map((dispute) => (
                <tr key={dispute.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px" }}>{dispute.reference}</td>
                  <td style={{ padding: "8px" }}>{dispute.title}</td>
                  <td style={{ padding: "8px" }}>₹{(dispute.amountMinor / 100).toFixed(2)}</td>
                  <td style={{ padding: "8px" }}>
                    <span style={{ padding: "2px 6px", borderRadius: "4px", background: "#e0e0e0" }}>
                      {dispute.status}
                    </span>
                  </td>
                  <td style={{ padding: "8px" }}>{dispute.priority}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}