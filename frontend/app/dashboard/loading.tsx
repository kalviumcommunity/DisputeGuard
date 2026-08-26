export default function DashboardLoading() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Dashboard</h1>

      {/* User stats skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: "100px",
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              animation: "pulse 2s infinite",
            }}
          />
        ))}
      </div>

      {/* Chart skeleton */}
      <div
        style={{
          height: "300px",
          backgroundColor: "#1f2937",
          border: "1px solid #374151",
          borderRadius: "8px",
          marginBottom: "2rem",
          animation: "pulse 2s infinite",
        }}
      />

      {/* Feed skeleton */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: "60px",
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              animation: "pulse 2s infinite",
            }}
          />
        ))}
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  );
}