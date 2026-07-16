import { test, expect } from '@playwright/test';

// Brand Intelligence Brief: happy submission, abandonment, and invalid token.

async function createLeadToken(request: import('@playwright/test').APIRequestContext): Promise<string> {
  const res = await request.post('/api/consultation', {
    data: {
      fullName: 'Brief Tester',
      email: `brief+${Date.now()}@example.com`,
      challengeCategories: ['positioning'],
      situationDescription: 'Testing the brief flow.',
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  return body.token as string;
}

test('valid token renders the brief and completes it', async ({ page, request }) => {
  const token = await createLeadToken(request);
  await page.goto(`/brief/${token}`);

  const fields = ['mission', 'vision', 'differentiator', 'brandStory', 'audiences', 'brandVoice', 'successDefinition'];
  for (const f of fields) {
    const field = page.locator(`#${f}`);
    if (await field.count()) await field.fill(`Answer for ${f}.`);
  }
  await page.getByRole('button', { name: /submit|complete/i }).click();
  await expect(page).toHaveURL(/\/brief\/.*\/complete/);
});

test('abandoning the brief leaves the lead pending (page still reachable)', async ({ page, request }) => {
  const token = await createLeadToken(request);
  await page.goto(`/brief/${token}`);
  await expect(page.locator('#mission')).toBeVisible();
  // Navigate away without submitting — revisiting should still show the form.
  await page.goto('/');
  await page.goto(`/brief/${token}`);
  await expect(page.locator('#mission')).toBeVisible();
});

test('an invalid token yields a not-found / contact page', async ({ page }) => {
  const res = await page.goto('/brief/00000000-0000-0000-0000-000000000000');
  expect(res?.status()).toBe(404);
});
