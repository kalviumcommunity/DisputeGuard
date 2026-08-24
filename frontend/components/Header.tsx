import Link from "next/link";

export function Header() {
  return (
    <header style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}>
      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/dashboard">Dashboard</Link>
      </nav>
    </header>
  );
}