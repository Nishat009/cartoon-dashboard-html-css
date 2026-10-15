const { test, expect } = require('@playwright/test');

test('layout fits phones, tablets, desktops and landscape screens', async ({ page }, testInfo) => {
  test.setTimeout(60000);
  await page.goto('/');
  await expect(page.getByRole('searchbox')).toBeVisible();
  for (const [width, height] of [[320, 640], [360, 740], [390, 844], [600, 800], [640, 800], [768, 1024], [844, 390], [1024, 768], [1280, 800], [1536, 864], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth), { message: `Page overflow at ${width}x${height}` }).toBeLessThanOrEqual(1);
    const layout = await page.locator('app-music-player').evaluate(player => ({
      parent: player.getBoundingClientRect().toJSON(),
      buttons: [...player.querySelectorAll('button')].map(button => button.getBoundingClientRect().toJSON())
    }));
    for (const bounds of layout.buttons) {
      const parent = layout.parent;
      expect(bounds.x, `Player control at ${width}px`).toBeGreaterThanOrEqual(parent.x);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(parent.x + parent.width);
    }
    if ([390, 768, 1280].includes(width)) {
      await page.screenshot({ path: testInfo.outputPath(`responsive-${width}.png`) });
    }
  }
});

test('phone navigation remains reachable and clears the section heading', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main', exact: true });
  await nav.getByRole('button', { name: 'Trending', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Discover your next favorite' })).toBeInViewport();
  const heading = await page.getByRole('heading', { name: 'Discover your next favorite' }).boundingBox();
  const menu = await nav.boundingBox();
  expect(menu.y).toBeGreaterThanOrEqual(0);
  expect(heading.y).toBeGreaterThanOrEqual(menu.y + menu.height);
  await nav.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
