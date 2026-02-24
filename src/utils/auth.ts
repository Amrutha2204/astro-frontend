/**
 * Validates that a string looks like a JWT (three base64url segments).
 * Does not verify signature; backend validates.
 */
export function isValidJwtFormat(token: string | null | undefined): boolean {
  const t = token?.trim();
  return Boolean(t && t.split(".").length === 3);
}
