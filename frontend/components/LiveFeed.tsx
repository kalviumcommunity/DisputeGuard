export default async function LiveFeed() {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h2>Live Feed</h2>

      {[1, 2, 3].map((i) => (
        <div key={i} style={{ padding: "1rem", border: "1px solid #ddd" }}>
          <p>Event {i} - Just happened</p>
        </div>
      ))}
    </div>
  );
}