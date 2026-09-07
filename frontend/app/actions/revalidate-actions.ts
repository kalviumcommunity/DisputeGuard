'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { disputesDb } from '@/lib/disputes-db';

export async function addDisputeAndRevalidateAction(formData: FormData) {
  const title = formData.get('title') as string;
  const amount = parseFloat(formData.get('amount') as string);

  if (!title || isNaN(amount)) {
    throw new Error('Invalid dispute input data.');
  }

  // Task 1: Perform mutation
  disputesDb.push({
    id: String(Date.now()),
    title,
    amount,
  });

  // Task 1: Invalidate target cache via revalidatePath and revalidateTag
  revalidatePath('/disputes-list');
  revalidateTag('disputes-tag'); // FIX: Removed the second 'max-age' parameter

  // Task 4: Redirect back to the list page after revalidation
  redirect('/disputes-list');
}