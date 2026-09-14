'use server';

import { revalidatePath } from 'next/cache';

export type DisputeNote = {
  id: string;
  text: string;
};

export async function addDisputeNote(
  note: DisputeNote,
  shouldFail: boolean,
) {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (shouldFail) {
    throw new Error('The server rejected this dispute note.');
  }

  revalidatePath('/optimistic-ui');

  return note;
}
