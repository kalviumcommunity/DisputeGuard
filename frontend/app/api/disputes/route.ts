// app/api/disputes/route.ts
import { ok, fail } from '@/lib/api-response';

// Simulated database
const disputes = [
  { id: '1', title: 'Unauthorized Charge', amount: 150.0 },
  { id: '2', title: 'Item Not Received', amount: 45.5 },
];

export async function GET() {
  try {
    return ok(disputes, 200);
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return fail('INTERNAL_SERVER_ERROR', 'Something went wrong', 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Task 2: Validation check returning appropriate 400 Bad Request status code
    if (!body.title || !body.amount) {
      return fail(
        'VALIDATION_ERROR',
        'Title and amount fields are required',
        400
      );
    }

    const newDispute = {
      id: String(disputes.length + 1),
      title: body.title,
      amount: Number(body.amount),
    };

    disputes.push(newDispute);

    // Task 2: Successful resource creation returning 201 Created status code
    return ok(newDispute, 201);
  } catch (error) {
    // Task 3: Hide raw errors from clients, log internally
    console.error('Unhandled server error in POST /api/disputes:', error);
    return fail('INTERNAL_SERVER_ERROR', 'Something went wrong', 500);
  }
}