// Flags are comma-separated lowercase names. Invalid input fails closed.
// These presentation flags must never grant access to protected data.
export function hasFeatureFlag(value: string | null, flag: string): boolean {
  if (!value || value.length > 512) return false;
  const flags = value.split(',').map((item) => item.trim());
  if (!flags.every((item) => /^[a-z][a-z0-9-]{0,63}$/.test(item))) return false;
  return flags.includes(flag);
}
