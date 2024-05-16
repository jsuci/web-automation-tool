import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://inboundfound.com/');

  await page.waitForLoadState("networkidle")

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Inbound/);
});

test('compare snapshots', async ({ page }) => {
  await page.goto('https://inboundfound.com/');
  await page.waitForLoadState("networkidle")

  await expect(page).toHaveScreenshot({
    fullPage: true,
  });
});

test('click About link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});