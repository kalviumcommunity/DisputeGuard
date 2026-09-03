'use server';

import { appendFile } from 'node:fs/promises';

export async function createTask(
  previousState: { success: boolean; message: string },
  formData: FormData
) {
  const title = formData.get('title');

  if (typeof title !== 'string' || title.trim().length < 3) {
    return {
      success: false,
      message: 'Task title must be at least 3 characters.',
    };
  }

  const task = {
    title: title.trim(),
    createdAt: new Date().toISOString(),
  };

  await appendFile(
    'server-action-tasks.jsonl',
    JSON.stringify(task) + '\n'
  );

  return {
    success: true,
    message: `Task "${task.title}" created successfully on the server.`,
  };
}
