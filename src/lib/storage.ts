import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

/**
 * Evidence storage abstraction.
 *
 * For Sprint 1 this writes to local disk under /uploads, which is
 * enough to prove out the immutability model end-to-end (hash at
 * write time, no update/delete route — see FR-06, NFR-10).
 *
 * For the real GCP deployment (see PRD §18, Technical Considerations),
 * swap the body of saveEvidenceFile() for the Google Cloud Storage
 * SDK, and turn on a bucket retention policy for actual storage-level
 * immutability (see the Risks table, §17.1, in the revised PRD) —
 * the function signature below does not need to change, so nothing
 * that calls it needs to change either.
 *
 *   import { Storage } from '@google-cloud/storage';
 *   const bucket = new Storage().bucket(process.env.GCS_BUCKET!);
 *   await bucket.file(objectName).save(buffer, { contentType: mimeType });
 *   return `gs://${process.env.GCS_BUCKET}/${objectName}`;
 */
export async function saveEvidenceFile(params: {
  disputeId: string;
  originalName: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<{ url: string }> {
  const uploadRoot = path.join(process.cwd(), 'uploads', params.disputeId);
  await mkdir(uploadRoot, { recursive: true });

  const safeExt = path.extname(params.originalName).slice(0, 10);
  const objectName = `${randomUUID()}${safeExt}`;
  const fullPath = path.join(uploadRoot, objectName);

  await writeFile(fullPath, params.buffer);

  // Stored as a path relative to /uploads so it's storage-backend agnostic.
  return { url: `/uploads/${params.disputeId}/${objectName}` };
}
