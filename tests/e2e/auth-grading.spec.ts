import { expect, test } from '@playwright/test';

// Stub e2e flows: login → submit → grade. Requires seeded auth + preview server.
// Run with: bun run e2e (PLAYWRIGHT_BASE_URL overrides preview URL).

test.describe('auth → submit → grade', () => {
  test('login flow renders dashboard', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/login/);
    // TODO: fill seeded credentials once test users exist.
    // await page.fill('[name=email]', 'student@triple4c.com');
  });

  test('student can open assignments and submit', async ({ page }) => {
    await page.goto('/assignments');
    await expect(page).toHaveURL(/assignments/);
  });

  test('staff can open speed grader', async ({ page }) => {
    await page.goto('/grade');
    // Grader route may redirect unauthenticated users to login — both OK in stub.
    await expect(page).toHaveURL(/grade|login/);
  });
});
