import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans",
  description: "Transparent pricing for merchant chargeback protection and dispute recovery.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "DisputeGuard Pricing Plans",
    description: "Transparent pricing for merchant chargeback protection.",
    images: [
      {
        url: "https://disputeguard.com/og-pricing.png",
        width: 1200,
        height: 630,
        alt: "DisputeGuard Pricing Overview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DisputeGuard Pricing Plans",
    description: "Transparent pricing for merchant chargeback protection.",
    images: ["https://disputeguard.com/og-pricing.png"],
  },
};

export default function PricingPage() {
  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold">Pricing Plans</h1>
      <p className="mt-4 text-gray-600">
        Choose the right dispute management plan for your transaction volume.
      </p>
    </section>
  );
}