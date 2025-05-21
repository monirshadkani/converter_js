import { test, expect } from '@playwright/test';

test.describe("Démo Counter App", () => {
  // Increase individual test timeout
  test.setTimeout(60000);

  // Before each test, navigate to the application
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#app");
  });

  test('has title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Démo tests/);
  });

  test('has button', async ({ page }) => {
    // Add to favorites
    const counterButton = page.locator("#counterButton");
    await counterButton.click();

    // Check if button text changed to "Remove from Favorites"
    await expect(counterButton).toBeVisible();
  });

  test('button click increments counter', async ({ page }) => {
    const counterButton = page.locator("#counterButton");
    await expect(counterButton).toHaveText("count is 0");
    await counterButton.click();
    await expect(counterButton).toHaveText("count is 1");
  });
});
