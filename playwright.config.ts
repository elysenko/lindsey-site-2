import { defineConfig, devices } from '@playwright/test';

// E2E config. Point PLAYWRIGHT_BASE_URL at a running instance (with a seeded
// database). When BASE_URL is localhost, Playwright boots `next start` itself.
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const isLocal = baseURL.includes('localhost') || baseURL.includes('127.0.0.1');

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: isLocal
    ? {
        command: 'npm run start',
        url: baseURL,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
});
