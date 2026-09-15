"use client";

import { useEffect } from "react";

export default function DisputeSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for segment-level tracking
    console.error("Disputes Segment Error Boundary caught an error:", error);
  }, [error]);

  return (
    <div
      style={{
        padding: "2rem",
        margin: "1.5rem",
        borderRadius: "8px",
        border: "2px solid #ef4444",
        backgroundColor: "#fef2f2",
        color: "#991b1b",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ marginTop: 0 }}>⚠️ Disputes Segment Error</h2>
      <p style={{ fontWeight: "bold" }}>
        {error.message || "An unexpected error occurred while loading disputes."}
      </p>
      {error.digest && (
        <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
          Error Digest ID: <code>{error.digest}</code>
        </p>
      )}

      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#dc2626",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          🔄 Try Again (reset())
        </button>
      </div>
    </div>
  );
}