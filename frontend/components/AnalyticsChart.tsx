export default async function AnalyticsChart() {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return (
    <div
      style={{
        height: "300px",
        border: "1px solid #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p>📊 Chart loaded (took 3 seconds)</p>
    </div>
  );
}