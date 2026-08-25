export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "3rem 1.5rem",
      }}
    >
      {children}
    </main>
  );
}