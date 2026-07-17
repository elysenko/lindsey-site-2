import { AppConfigService, PLACEHOLDER } from './app-config.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AppConfigService.resolveConfig fallback', () => {
  let prisma: { systemSetting: { findUnique: jest.Mock } };
  let service: AppConfigService;
  const KEY = 'SMTP_HOST';

  beforeEach(() => {
    delete process.env[KEY];
    prisma = { systemSetting: { findUnique: jest.fn() } };
    service = new AppConfigService(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    delete process.env[KEY];
  });

  it('prefers the environment variable when set', async () => {
    process.env[KEY] = 'env-host';
    prisma.systemSetting.findUnique.mockResolvedValue({ value: 'db-host' });
    await expect(service.resolveConfig(KEY)).resolves.toBe('env-host');
    // Env hit short-circuits — no DB round-trip.
    expect(prisma.systemSetting.findUnique).not.toHaveBeenCalled();
  });

  it('falls back to the SystemSetting DB row when env is unset', async () => {
    prisma.systemSetting.findUnique.mockResolvedValue({ value: 'db-host' });
    await expect(service.resolveConfig(KEY)).resolves.toBe('db-host');
    expect(prisma.systemSetting.findUnique).toHaveBeenCalledWith({
      where: { key: KEY },
    });
  });

  it('returns null when neither env nor DB provides a value', async () => {
    prisma.systemSetting.findUnique.mockResolvedValue(null);
    await expect(service.resolveConfig(KEY)).resolves.toBeNull();
  });

  it('treats the PLACEHOLDER sentinel as unconfigured (env and DB)', async () => {
    process.env[KEY] = PLACEHOLDER;
    prisma.systemSetting.findUnique.mockResolvedValue({ value: PLACEHOLDER });
    await expect(service.resolveConfig(KEY)).resolves.toBeNull();
  });

  it('resolveEnv reads env only, treating placeholder/empty as null', () => {
    expect(service.resolveEnv(KEY)).toBeNull();
    process.env[KEY] = PLACEHOLDER;
    expect(service.resolveEnv(KEY)).toBeNull();
    process.env[KEY] = 'real';
    expect(service.resolveEnv(KEY)).toBe('real');
  });

  it('isConfigured reflects presence of a non-placeholder value', () => {
    expect(service.isConfigured(null)).toBe(false);
    expect(service.isConfigured(PLACEHOLDER)).toBe(false);
    expect(service.isConfigured('x')).toBe(true);
  });
});
