import { stripHtml, deepSanitize } from './sanitize.util';

describe('stripHtml', () => {
  it('strips script tags and their payload', () => {
    const out = stripHtml('<script>alert("xss")</script>hello');
    expect(out).not.toContain('<script>');
    expect(out).not.toContain('alert');
    expect(out).toContain('hello');
  });

  it('removes all HTML tags but keeps text content', () => {
    expect(stripHtml('<b>bold</b> <i>text</i>')).toBe('bold text');
  });

  it('leaves a SQL-injection-style string as inert plain text', () => {
    const payload = "Robert'); DROP TABLE leads;--";
    // No tags, so text is preserved verbatim; Prisma parameterization defeats SQLi.
    expect(stripHtml(payload)).toBe(payload);
  });

  it('trims surrounding whitespace', () => {
    expect(stripHtml('  hi <script>x</script> ')).toBe('hi');
  });
});

describe('deepSanitize', () => {
  it('sanitizes strings and string-arrays, preserving other values', () => {
    const out = deepSanitize({
      name: '<b>Ada</b>',
      tags: ['<i>x</i>', 'y'],
      count: 3,
    });
    expect(out).toEqual({ name: 'Ada', tags: ['x', 'y'], count: 3 });
  });

  it('recurses into nested objects and arrays', () => {
    const out = deepSanitize({
      lead: { note: '<script>bad</script>ok', extra: 5 },
      list: [{ v: '<b>a</b>' }],
    });
    expect(out).toEqual({
      lead: { note: 'ok', extra: 5 },
      list: [{ v: 'a' }],
    });
  });

  it('passes through non-string primitives untouched', () => {
    expect(deepSanitize(42)).toBe(42);
    expect(deepSanitize(true)).toBe(true);
    expect(deepSanitize(null)).toBeNull();
  });
});
