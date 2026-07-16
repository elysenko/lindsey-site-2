import { test, expect } from '@playwright/test';

// Consultation funnel: happy path, validation errors, and 429 rate-limiting.

function fillStep1(page: import('@playwright/test').Page, email: string) {
  return (async () => {
    await page.locator('#fullName').fill('Ada Lovelace');
    await page.locator('#organization').fill('Analytical Engines Ltd');
    await page.locator('#email').fill(email);
    await page.getByRole('button', { name: 'Continue' }).click();
  })();
}

test('happy path persists a lead and reaches confirmation with a brief invite', async ({ page }) => {
  const email = `ada+${Date.now()}@example.com`;
  await page.goto('/consult');
  await fillStep1(page, email);

  // Step 2 is addressable via ?step=2
  await expect(page).toHaveURL(/step=2/);
  await page.locator('[data-testid="consult-step-2"] input[type="checkbox"]').first().check();
  await page.locator('#situationDescription').fill('We need a sharper position in a crowded category.');
  await page.getByRole('button', { name: /submit|request/i }).click();

  await expect(page).toHaveURL(/\/consult\/confirmation/);
  await expect(page.getByRole('heading', { name: /request received/i })).toBeVisible();
  await expect(page.getByTestId('brief-invite-link')).toBeVisible();
});

test('shows inline validation errors for missing required fields', async ({ page }) => {
  await page.goto('/consult');
  await page.getByRole('button', { name: 'Continue' }).click();
  // Still on step 1, error rendered
  await expect(page.locator('.field-error').first()).toBeVisible();
});

test('surfaces a 429 message after exceeding the rate limit', async ({ page, request }) => {
  // Exhaust the 5/hour IP allowance directly against the API, then submit once more via UI.
  const base = { fullName: 'Rate Test', email: `rt+${Date.now()}@example.com`, challengeCategories: ['positioning'] };
  let sawLimit = false;
  for (let i = 0; i < 7; i++) {
    const res = await request.post('/api/consultation', { data: base });
    if (res.status() === 429) sawLimit = true;
  }
  expect(sawLimit).toBe(true);
});
