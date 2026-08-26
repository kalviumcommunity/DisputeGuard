export default async function UserStats() {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1rem",
      }}
    >
      <div style={{ padding: "1rem", border: "1px solid #ccc" }}>
        <h3>Active Users</h3>
        <p style={{ fontSize: "2rem", fontWeight: "bold" }}>1,234</p>
      </div>

      <div style={{ padding: "1rem", border: "1px solid #ccc" }}>
        <h3>Total Revenue</h3>
        <p style={{ fontSize: "2rem", fontWeight: "bold" }}>$56.2K</p>
      </div>

      <div style={{ padding: "1rem", border: "1px solid #ccc" }}>
        <h3>Conversion Rate</h3>
        <p style={{ fontSize: "2rem", fontWeight: "bold" }}>3.2%</p>
      </div>
    </div>
  );
}