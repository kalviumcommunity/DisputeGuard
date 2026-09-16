import { Suspense } from "react";
import { headers } from "next/headers";
import { hasFeatureFlag } from "@/lib/feature-flags";
import UserStats from "@/components/UserStats";
import AnalyticsChart from "@/components/AnalyticsChart";
import LiveFeed from "@/components/LiveFeed";

export default async function DashboardPage() {
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent");
  const language = requestHeaders.get("accept-language");
  const previewEnabled = hasFeatureFlag(requestHeaders.get("x-feature-flags"), "dispute-preview");
  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ marginBottom: "2rem" }}>Dashboard</h1>
      <section aria-labelledby="request-details" className="mb-6 rounded border p-4 break-words">
        <h2 id="request-details">Your request</h2>
        <dl>
          <dt>User agent</dt><dd>{userAgent ?? "Not provided"}</dd>
          <dt>Accepted languages</dt><dd>{language ?? "Not provided"}</dd>
          <dt>X-User-Id (case-insensitive lookup)</dt>
          <dd>{requestHeaders.get("X-User-Id") === requestHeaders.get("x-user-id") ? "Matches" : "Does not match"}</dd>
        </dl>
        {previewEnabled ? <p>Dispute preview is enabled for this request.</p> : <p>Standard dispute dashboard.</p>}
      </section>

      {/* User Stats - 2 second delay */}
      <Suspense
        fallback={
          <div
            style={{
              height: "100px",
              backgroundColor: "#1f2937",
              color: "white",
              marginBottom: "1rem",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #374151",
            }}
          >
            Loading user stats...
          </div>
        }
      >
        <UserStats />
      </Suspense>

      {/* Analytics Chart - 3 second delay */}
      <Suspense
        fallback={
          <div
            style={{
              height: "300px",
              backgroundColor: "#1f2937",
              color: "white",
              marginBottom: "1rem",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #374151",
            }}
          >
            Loading chart...
          </div>
        }
      >
        <AnalyticsChart />
      </Suspense>

      {/* Live Feed - 1 second delay */}
      <Suspense
        fallback={
          <div
            style={{
              height: "200px",
              backgroundColor: "#1f2937",
              color: "white",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #374151",
            }}
          >
            Loading feed...
          </div>
        }
      >
        <LiveFeed />
      </Suspense>
    </div>
  );
}
