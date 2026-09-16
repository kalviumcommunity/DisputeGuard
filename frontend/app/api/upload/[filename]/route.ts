import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { errorResponse } from '@/lib/api-response';

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
    return errorResponse(
      'VALIDATION_ERROR',
      'Invalid filename.',
      400,
      {
        field: 'filename',
        issue: 'invalid_filename',
      },
    );
  }

  try {
    const filePath = path.join(process.cwd(), 'uploads', filename);
    const file = await readFile(filePath);

    return new Response(file, {
      headers: {
        'Content-Type': allowedExtensions[extension],
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('File retrieval failed:', error);

    return errorResponse(
      'NOT_FOUND',
      'File not found.',
      404,
    );
  }
}
