// FR-11: Evidence File Constraints.
// These limits are enforced here, server-side, inside the upload Route
// Handler — never trust a client-side check alone (NFR-06).

export const ALLOWED_EVIDENCE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

export const MAX_EVIDENCE_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_EVIDENCE_FILES_PER_DISPUTE = 5;

export type FileValidationResult = { ok: true } | { ok: false; reason: string };

export function validateEvidenceFile(file: { type: string; size: number; name: string }): FileValidationResult {
  if (!ALLOWED_EVIDENCE_TYPES.includes(file.type)) {
    return { ok: false, reason: `File type "${file.type || 'unknown'}" is not allowed. Accepted: PDF, JPG, PNG, DOCX.` };
  }
  if (file.size <= 0) {
    return { ok: false, reason: 'File is empty.' };
  }
  if (file.size > MAX_EVIDENCE_FILE_BYTES) {
    return { ok: false, reason: `File exceeds the 10MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB).` };
  }
  return { ok: true };
}
