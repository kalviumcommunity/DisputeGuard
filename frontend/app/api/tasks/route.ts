import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(3),
  priority: z.enum(['low', 'medium', 'high']),
});

type CreateTaskInput = z.infer<typeof createTaskSchema>;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const task: CreateTaskInput = parsed.data;

    // Business logic would use ONLY validated data.
    return Response.json(
      {
        success: true,
        message: 'Task created successfully',
        task,
      },
      { status: 201 }
    );
  } catch {
    return Response.json(
      {
        success: false,
        error: 'Invalid JSON request body',
      },
      { status: 400 }
    );
  }
}