import sanitizeHtml from 'sanitize-html';

/**
 * Strip ALL HTML/script content from a free-text string. Neutralizes stored-XSS
 * and HTML-injection payloads before persistence. We intentionally allow no tags
 * and no attributes — every user-facing free-text field in this app is plain text.
 */
export function stripHtml(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  }).trim();
}

/**
 * Recursively sanitize every string in a value (objects, arrays, primitives).
 * Keys are preserved; only string values are transformed.
 */
export function deepSanitize<T>(value: T): T {
  if (typeof value === 'string') {
    return stripHtml(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => deepSanitize(v)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = deepSanitize(v);
    }
    return out as unknown as T;
  }
  return value;
}
