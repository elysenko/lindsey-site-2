import DOMPurify from 'isomorphic-dompurify';

/**
 * Strip ALL HTML/script markup from a free-text value before persistence.
 * We store plain text only — no tags are allowed in user-supplied fields.
 */
export function sanitizeText(input: unknown): string {
  if (input == null) return '';
  const str = typeof input === 'string' ? input : String(input);
  // ALLOWED_TAGS: [] removes every tag; keep text content only.
  const clean = DOMPurify.sanitize(str, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return clean.trim();
}

/** Sanitize an optional field; returns undefined when input is nullish/empty. */
export function sanitizeOptional(input: unknown): string | undefined {
  if (input == null) return undefined;
  const cleaned = sanitizeText(input);
  return cleaned.length ? cleaned : undefined;
}

/** Sanitize each string element of an array, dropping empties. */
export function sanitizeArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.map((v) => sanitizeText(v)).filter((v) => v.length > 0);
}

/**
 * Deep-sanitize an object's string fields in place (shallow one level).
 * Convenience for whole-payload sanitization after zod validation.
 */
export function sanitizeRecord<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') out[k] = sanitizeText(v);
    else if (Array.isArray(v)) out[k] = sanitizeArray(v);
    else out[k] = v;
  }
  return out as T;
}
