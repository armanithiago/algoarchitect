/** Class joiner: drops falsy values. Class names must always be written out in full (no string building). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
