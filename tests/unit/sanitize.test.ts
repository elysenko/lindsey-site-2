import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeOptional, sanitizeArray, sanitizeRecord } from '@/lib/sanitize';

describe('sanitizeText', () => {
  it('strips script tags and their payload', () => {
    const out = sanitizeText('<script>alert("xss")</script>hello');
    expect(out).not.toContain('<script>');
    expect(out).not.toContain('alert');
    expect(out).toContain('hello');
  });

  it('removes all HTML tags but keeps text content', () => {
    expect(sanitizeText('<b>bold</b> <i>text</i>')).toBe('bold text');
  });

  it('leaves a SQL-injection-style string as inert plain text', () => {
    const payload = "Robert'); DROP TABLE leads;--";
    // No tags, so text is preserved verbatim; Prisma parameterization defeats SQLi.
    expect(sanitizeText(payload)).toBe(payload);
  });

  it('returns empty string for nullish input', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
  });
});

describe('sanitizeOptional', () => {
  it('returns undefined for empty/nullish', () => {
    expect(sanitizeOptional('')).toBeUndefined();
    expect(sanitizeOptional('   ')).toBeUndefined();
    expect(sanitizeOptional(null)).toBeUndefined();
  });

  it('returns cleaned string otherwise', () => {
    expect(sanitizeOptional('  hi <script>x</script> ')).toBe('hi');
  });
});

describe('sanitizeArray', () => {
  it('sanitizes each element and drops empties', () => {
    expect(sanitizeArray(['<b>a</b>', '', '<script></script>', 'b'])).toEqual(['a', 'b']);
  });

  it('returns [] for non-arrays', () => {
    expect(sanitizeArray('nope')).toEqual([]);
  });
});

describe('sanitizeRecord', () => {
  it('sanitizes strings and string-arrays, preserving other values', () => {
    const out = sanitizeRecord({
      name: '<b>Ada</b>',
      tags: ['<i>x</i>', 'y'],
      count: 3,
    });
    expect(out).toEqual({ name: 'Ada', tags: ['x', 'y'], count: 3 });
  });
});
