// lib/disputes-db.ts

export interface DisputeItem {
  id: string;
  title: string;
  amount: number;
}

export const disputesDb: DisputeItem[] = [
  { id: '1', title: 'Unauthorized Subscription Charge', amount: 49.99 },
  { id: '2', title: 'Duplicate Merchant Charge', amount: 120.00 },
];