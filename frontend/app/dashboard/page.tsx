import { Suspense } from "react";
import UserStats from "@/components/UserStats";
import AnalyticsChart from "@/components/AnalyticsChart";
import LiveFeed from "@/components/LiveFeed";

export default function DashboardPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ marginBottom: "2rem" }}>Dashboard</h1>

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