import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Unit-test runner config. Only the pure `src/lib` modules are exercised here;
// Playwright owns the end-to-end suite (tests/e2e) and is excluded below.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    env: {
      JWT_SECRET: 'unit-test-secret-abcdefghijklmnopqrstuvwxyz-0123456789',
      NEXT_PUBLIC_SITE_URL: 'https://lebarregroup.com',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
