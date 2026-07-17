import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import { CreateConsultationDto } from '../consultation/dto/create-consultation.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { CreateInsightDto } from '../insights/dto/insights.dto';

/** Returns the set of failing property names for a payload against a DTO class. */
function failingProps<T extends object>(
  cls: new () => T,
  payload: Record<string, unknown>,
): string[] {
  const instance = plainToInstance(cls, payload);
  const errors: ValidationError[] = validateSync(instance as object, {
    whitelist: true,
    forbidNonWhitelisted: false,
  });
  return errors.map((e) => e.property);
}

describe('CreateConsultationDto validation', () => {
  const valid = {
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    challengeCategories: ['positioning'],
    situationDescription: 'We need help.',
  };

  it('accepts a valid payload', () => {
    expect(failingProps(CreateConsultationDto, valid)).toEqual([]);
  });

  it('rejects a missing full name', () => {
    const { fullName, ...rest } = valid;
    expect(failingProps(CreateConsultationDto, rest)).toContain('fullName');
  });

  it('rejects an invalid email', () => {
    expect(
      failingProps(CreateConsultationDto, { ...valid, email: 'not-an-email' }),
    ).toContain('email');
  });

  it('requires at least one challenge category', () => {
    expect(
      failingProps(CreateConsultationDto, { ...valid, challengeCategories: [] }),
    ).toContain('challengeCategories');
  });
});

describe('LoginDto validation', () => {
  it('rejects an empty password', () => {
    expect(
      failingProps(LoginDto, { email: 'a@b.com', password: '' }),
    ).toContain('password');
  });

  it('rejects a malformed email', () => {
    expect(
      failingProps(LoginDto, { email: 'bad', password: 'secret' }),
    ).toContain('email');
  });

  it('accepts a valid login', () => {
    expect(
      failingProps(LoginDto, { email: 'a@b.com', password: 'secret' }),
    ).toEqual([]);
  });
});

describe('CreateInsightDto validation', () => {
  it('requires a non-empty title and body', () => {
    const props = failingProps(CreateInsightDto, { title: '', body: '' });
    expect(props).toEqual(expect.arrayContaining(['title', 'body']));
  });

  it('accepts title + body (word-count is enforced in the service on publish)', () => {
    expect(
      failingProps(CreateInsightDto, { title: 'T', body: 'short body' }),
    ).toEqual([]);
  });
});
