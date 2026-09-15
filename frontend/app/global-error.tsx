"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Root Error Boundary caught an unhandled error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", padding: "3rem", backgroundColor: "#f87171", color: "#ffffff" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "2.5rem" }}>🚨 Fatal Application Error</h1>
          <p style={{ fontSize: "1.2rem", marginTop: "1rem" }}>
            {error.message || "A critical root-level error occurred."}
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              backgroundColor: "#ffffff",
              color: "#991b1b",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Reload Entire App (reset())
          </button>
        </div>
      </body>
    </html>
  );
}