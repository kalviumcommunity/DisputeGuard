'use server';

import { z } from 'zod';

// Define error state interface for field-level errors
export interface FormState {
  success: boolean;
  errors?: {
    title?: string[];
    amount?: string[];
  };
  message?: string;
}

// Task 1: Zod schema for FormData validation
const disputeSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  amount: z.coerce.number().gt(0, { message: 'Amount must be greater than 0' }),
});

// Task 2: Action returns structured error state object instead of throwing
export async function createDisputeAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = {
    title: formData.get('title'),
    amount: formData.get('amount'),
  };

  const validatedFields = disputeSchema.safeParse(rawData);

  // Return validation failure state without throwing errors
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please fix errors below.',
    };
  }

  // Simulate successful server mutation
  console.log('Dispute created successfully:', validatedFields.data);

  // Task 4: Successful submission state
  return {
    success: true,
    message: 'Dispute submitted successfully!',
  };
}