"use client";

import { useState } from "react";
import Link from "next/link";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? "60px" : "200px",
        padding: "1rem",
        background: "#f3f4f6",
        transition: "width 0.2s",
      }}
    >
  <button
  onClick={() => setCollapsed((c) => !c)}
  style={{
    color: "#111827",
    background: "#ffffff",
    border: "1px solid #d1d5db",
    padding: "0.5rem",
    cursor: "pointer",
  }}
>
  {collapsed ? "→" : "← Collapse"}
</button>

      {!collapsed && (
        <nav
          style={{
            marginTop: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <Link href="/dashboard">Overview</Link>
          <Link href="/dashboard/settings">Settings</Link>
        </nav>
      )}
    </aside>
  );
}