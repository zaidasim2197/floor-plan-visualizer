/**
 * Generate an opaque, non-sequential booking reference prefixed with a short
 * event slug fragment so references are human-readable and event-scoped.
 * e.g. EXPO-A1B2-C3D4
 */

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSegment(len: number): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    // crypto.getRandomValues is available in both Node 19+ and edge runtimes.
    // Fall back to Math.random for older Node environments.
    const idx =
      typeof globalThis.crypto !== "undefined"
        ? globalThis.crypto.getRandomValues(new Uint8Array(1))[0]! % CHARS.length
        : Math.floor(Math.random() * CHARS.length);
    out += CHARS[idx];
  }
  return out;
}

export function generateReference(eventSlug: string): string {
  const prefix = eventSlug
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4)
    .padEnd(4, "X");
  return `${prefix}-${randomSegment(4)}-${randomSegment(4)}`;
}
