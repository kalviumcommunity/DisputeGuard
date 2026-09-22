import { createHash } from 'crypto';

/**
 * NFR-09: every submitted evidence file gets a SHA-256 hash computed
 * server-side at submission time and stored alongside its record, so
 * tampering can be detected later by re-hashing and comparing.
 */
export function sha256Buffer(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}
