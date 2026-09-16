"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function FilterControls({
  currentStatus,
  currentSort,
}: {
  currentStatus: string;
  currentSort: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('page', '1');
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
      <div>
        <label htmlFor="status-select" style={{ fontWeight: "bold", marginRight: "0.5rem" }}>
          Filter Status:
        </label>
        <select
          id="status-select"
          value={currentStatus}
          onChange={(e) => updateParam("status", e.target.value)}
          style={{ padding: "0.4rem 0.8rem", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTION_REQUIRED">Action Required</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="ESCALATED">Escalated</option>
        </select>
      </div>

      <div>
        <label htmlFor="sort-select" style={{ fontWeight: "bold", marginRight: "0.5rem" }}>
          Sort By:
        </label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          style={{ padding: "0.4rem 0.8rem", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>
    </div>
  );
}
