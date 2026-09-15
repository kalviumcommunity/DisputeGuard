import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

const allowedTypes = [
  'image/png',
  'image/jpeg',
  'application/pdf',
];

const maxSize = 2 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'File is required.',
          },
        },
        { status: 400 },
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: 'Only PNG, JPEG, and PDF files are supported.',
          },
        },
        { status: 400 },
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'Maximum file size is 2 MB.',
          },
        },
        { status: 400 },
      );
    }

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

    return NextResponse.json({
      success: true,
      file: {
        name: filename,
        type: file.type,
        size: file.size,
        url: `/api/upload/${filename}`,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: 'The file could not be uploaded.',
        },
      },
      { status: 500 },
    );
  }
}
