import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

const allowedExtensions: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;
  const extension = path.extname(filename).toLowerCase();

  if (
    !allowedExtensions[extension] ||
    path.basename(filename) !== filename
  ) {
    return NextResponse.json(
      { error: 'Invalid filename.' },
      { status: 400 },
    );
  }

  try {
    const filePath = path.join(process.cwd(), 'uploads', filename);
    const file = await readFile(filePath);

    return new NextResponse(file, {
      headers: {
        'Content-Type': allowedExtensions[extension],
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'File not found.' },
      { status: 404 },
    );
  }
}
