import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { success: true, data: [] },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: '1',
          name: body.name,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON' },
      { status: 400 }
    );
  }
}