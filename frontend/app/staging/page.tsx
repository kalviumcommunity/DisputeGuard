import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staging Preview",
  description: "Internal preview page - not for public indexing.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StagingPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-amber-600">⚠️ Internal Staging Preview</h1>
      <p className="mt-2 text-gray-600">
        This environment is blocked from search engine crawlers via noindex, nofollow.
      </p>
    </div>
  );
}