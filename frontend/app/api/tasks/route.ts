import { logger } from '@/lib/logger';
import { createTaskHandler } from '@/lib/task-handler';

export const runtime = 'nodejs';
export const POST = createTaskHandler(logger);
