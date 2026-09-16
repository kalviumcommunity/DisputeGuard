import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { errorResponse, successResponse } from '@/lib/api-response';

const allowedTypes = [
  'image/png',
  'image/jpeg',
  'application/pdf',
];

const maxSize = 2 * 1024 * 1024;

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return errorResponse(
      'VALIDATION_ERROR',
      'A multipart form-data request is required.',
      400,
      {
        field: 'file',
        issue: 'invalid_form_data',
      },
    );
  }

  const file = formData.get('file');

  if (!(file instanceof File)) {
    return errorResponse(
      'VALIDATION_ERROR',
      'File is required.',
      400,
      {
        field: 'file',
        issue: 'required',
      },
    );
  }

  if (!allowedTypes.includes(file.type)) {
    return errorResponse(
      'VALIDATION_ERROR',
      'Only PNG, JPEG, and PDF files are supported.',
      400,
      {
        field: 'file',
        issue: 'unsupported_type',
        allowedTypes,
      },
    );
  }

  if (file.size > maxSize) {
    return errorResponse(
      'VALIDATION_ERROR',
      'Maximum file size is 2 MB.',
      400,
      {
        field: 'file',
        issue: 'file_too_large',
        maxSizeBytes: maxSize,
      },
    );
  }

  try {
    const extensionByType: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'application/pdf': '.pdf',
    };

    const filename =
      `${crypto.randomUUID()}${extensionByType[file.type]}`;

    const uploadDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    return successResponse({
      file: {
        name: filename,
        type: file.type,
        size: file.size,
        url: `/api/upload/${filename}`,
      },
    });
  } catch (error) {
    console.error('File upload failed:', error);

    return errorResponse(
      'INTERNAL_SERVER_ERROR',
      'The file could not be uploaded.',
      500,
    );
  }
}
