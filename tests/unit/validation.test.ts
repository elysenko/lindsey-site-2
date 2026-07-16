import { describe, it, expect } from 'vitest';
import {
  consultationStep1Schema,
  consultationStep2Schema,
  consultationSchema,
  brandBriefSchema,
  loginSchema,
  signupSchema,
  leadUpdateSchema,
  insightCreateSchema,
  insightUpdateSchema,
  wordCount,
  slugify,
  MIN_INSIGHT_WORDS,
} from '@/lib/validation';

describe('consultation validation', () => {
  it('accepts a valid step 1', () => {
    const r = consultationStep1Schema.safeParse({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
    });
    expect(r.success).toBe(true);
  });

  it('rejects a missing full name', () => {
    const r = consultationStep1Schema.safeParse({ email: 'ada@example.com' });
    expect(r.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const r = consultationStep1Schema.safeParse({ fullName: 'Ada', email: 'not-an-email' });
    expect(r.success).toBe(false);
  });

  it('requires at least one challenge category in step 2', () => {
    const r = consultationStep2Schema.safeParse({ challengeCategories: [] });
    expect(r.success).toBe(false);
  });

  it('accepts a full consultation payload', () => {
    const r = consultationSchema.safeParse({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      challengeCategories: ['positioning'],
      situationDescription: 'We need help.',
    });
    expect(r.success).toBe(true);
  });
});

describe('brand brief validation', () => {
  it('requires all seven fields', () => {
    const r = brandBriefSchema.safeParse({ mission: 'x' });
    expect(r.success).toBe(false);
  });

  it('accepts a complete brief', () => {
    const r = brandBriefSchema.safeParse({
      mission: 'm',
      vision: 'v',
      differentiator: 'd',
      brandStory: 's',
      audiences: 'a',
      brandVoice: 'bv',
      successDefinition: 'sd',
    });
    expect(r.success).toBe(true);
  });
});

describe('auth schemas', () => {
  it('login requires a password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
  });

  it('signup enforces an 8-char minimum password', () => {
    expect(signupSchema.safeParse({ email: 'a@b.com', password: 'short' }).success).toBe(false);
    expect(signupSchema.safeParse({ email: 'a@b.com', password: 'longenough' }).success).toBe(true);
  });
});

describe('admin update schemas', () => {
  it('lead update requires at least one field', () => {
    expect(leadUpdateSchema.safeParse({}).success).toBe(false);
    expect(leadUpdateSchema.safeParse({ leadStatus: 'WON' }).success).toBe(true);
  });

  it('insight create enforces the word-count minimum', () => {
    const short = insightCreateSchema.safeParse({ title: 'T', body: 'too short' });
    expect(short.success).toBe(false);
    const long = insightCreateSchema.safeParse({
      title: 'T',
      body: Array.from({ length: MIN_INSIGHT_WORDS }, () => 'word').join(' '),
    });
    expect(long.success).toBe(true);
  });

  it('insight update requires at least one field', () => {
    expect(insightUpdateSchema.safeParse({}).success).toBe(false);
  });
});

describe('helpers', () => {
  it('wordCount counts whitespace-separated tokens', () => {
    expect(wordCount('  one   two three ')).toBe(3);
    expect(wordCount('')).toBe(0);
  });

  it('slugify produces a URL-safe slug', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
    expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
  });
});
