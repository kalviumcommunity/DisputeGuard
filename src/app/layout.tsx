import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dispute Guard — Razorpay',
  description: 'Merchant dispute proof & evidence platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
