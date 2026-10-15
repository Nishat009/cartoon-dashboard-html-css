const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('searchbox')).toBeVisible();
});

test('background, layout, search, genre, sorting and empty-state recovery', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await expect(page.locator('.dashboard-background')).toHaveCSS('background-image', /bg\.webp/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: testInfo.outputPath('dashboard.png') });
  const search = page.getByRole('searchbox');
  await search.fill('spider');
  await search.press('Enter');
  await expect(page.locator('.catalog-card')).toHaveCount(1);
  await expect(page.locator('.catalog-card')).toContainText('Spider-Man');
  await page.getByRole('button', { name: 'Clear filters ×' }).click();
  await expect(page.locator('.catalog-card')).toHaveCount(10);
  await page.getByRole('button', { name: 'Comedy 3 shows' }).click();
  await expect(page.locator('.catalog-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Clear filters ×' }).click();
  await page.getByRole('combobox').selectOption('title');
  await expect(page.locator('.catalog-card').first()).toContainText('Anime Dreams');
  await search.fill('no-such-title');
  await expect(page.getByRole('heading', { name: 'No shows found' })).toBeVisible();
  await page.getByRole('button', { name: 'Show all cartoons' }).click();
  await expect(search).toHaveValue('');
  await expect(page.locator('.catalog-card')).toHaveCount(10);
  expect(errors).toEqual([]);
});

test('details, favorites persistence, library and dialog keyboard behavior', async ({ page }) => {
  await page.locator('.catalog-card').filter({ hasText: 'Spider-Man' }).getByRole('button', { name: 'View Spider-Man' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Spider-Man' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Add to favorites' }).click();
  await expect(dialog.getByRole('button', { name: 'Saved to favorites' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Library', exact: true }).click();
  await expect(dialog).toContainText('Spider-Man');
  await dialog.getByRole('button', { name: 'Remove Spider-Man from favorites' }).click();
  await expect(dialog).not.toContainText('Spider-Man');
});

test('preferences persist and audio selection uses the selected track', async ({ page }) => {
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('checkbox', { name: /Soft background/ }).check();
  await page.getByRole('checkbox', { name: /Decorative animations/ }).uncheck();
  await expect(page.locator('html')).toHaveClass(/soft-background/);
  await expect(page.locator('html')).toHaveClass(/calm-motion/);
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/soft-background/);
  await expect(page.locator('html')).toHaveClass(/calm-motion/);
  await page.getByRole('button', { name: "Play What's The Problem?", exact: true }).click();
  await expect(page.locator('app-music-player h2')).toHaveText("What's The Problem?");
  await expect(page.locator('audio')).toHaveAttribute('src', /OSKI-Whats-The-Problem/);
});
