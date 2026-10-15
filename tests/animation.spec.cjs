const { test, expect } = require('@playwright/test');

test('playlist autoplays through the last slide, pauses on hover and resumes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const slider = page.locator('.playlist-swiper');
  const bullets = slider.locator('.swiper-pagination-bullet');
  await expect(bullets).toHaveCount(5);
  await bullets.last().click();
  await expect(slider.locator('.swiper-slide-active')).toHaveAttribute('data-swiper-slide-index', '4');
  await page.evaluate(() => document.activeElement.blur());
  await page.mouse.move(0, 0);
  await expect(slider.locator('.swiper-slide-active')).toHaveAttribute('data-swiper-slide-index', '0', { timeout: 8000 });
  await slider.dispatchEvent('pointerenter', { pointerType: 'mouse' });
  const index = await slider.locator('.swiper-slide-active').getAttribute('data-swiper-slide-index');
  await page.waitForTimeout(3600);
  await expect(slider.locator('.swiper-slide-active')).toHaveAttribute('data-swiper-slide-index', index);
  await slider.dispatchEvent('pointerleave', { pointerType: 'mouse' });
  await expect(slider.locator('.swiper-slide-active')).not.toHaveAttribute('data-swiper-slide-index', index, { timeout: 8000 });
});

test('every horizontal collection scrolls automatically and reverses at the end', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const rows = page.locator('.scroll-row');
  await expect(rows).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    const row = rows.nth(i);
    await row.evaluate(el => el.scrollIntoView({ block: 'center' }));
    await page.mouse.move(0, 0);
    const initial = await row.evaluate(el => el.scrollLeft);
    await expect.poll(() => row.evaluate(el => el.scrollLeft), { timeout: 4000 }).toBeGreaterThan(initial + 8);
    const end = await row.evaluate(el => { el.scrollLeft = el.scrollWidth; return el.scrollLeft; });
    await expect.poll(() => row.evaluate(el => el.scrollLeft), { timeout: 4000 }).toBeLessThan(end - 8);
  }
  const row = rows.last();
  await row.focus();
  await page.keyboard.press('Home');
  await expect.poll(() => row.evaluate(el => el.scrollLeft)).toBe(0);
  await page.keyboard.press('End');
  await expect.poll(() => row.evaluate(el => el.scrollWidth - el.clientWidth - el.scrollLeft)).toBeLessThanOrEqual(1);
});

test('motion settings and system preference stop autoplay and keep sections visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => localStorage.setItem('cartoon-preferences', JSON.stringify({ motion: false })));
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/calm-motion/);
  const active = page.locator('.swiper-slide-active');
  const original = await active.getAttribute('data-swiper-slide-index');
  const row = page.locator('.scroll-row').first();
  await row.evaluate(el => el.scrollIntoView({ block: 'center' }));
  await expect(page.locator('.reveal').first()).toHaveCSS('opacity', '1');
  await page.waitForTimeout(3300);
  await expect(active).toHaveAttribute('data-swiper-slide-index', original);
  expect(await row.evaluate(el => el.scrollLeft)).toBe(0);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('checkbox', { name: /Decorative animations/ }).check();
  await page.keyboard.press('Escape');
  await expect(page.locator('html')).not.toHaveClass(/calm-motion/);
  await row.evaluate(el => el.scrollIntoView({ block: 'center' }));
  await page.mouse.move(0, 0);
  await expect.poll(() => row.evaluate(el => el.scrollLeft), { timeout: 4000 }).toBeGreaterThan(8);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveClass(/calm-motion/);
  const position = await row.evaluate(el => el.scrollLeft);
  await page.waitForTimeout(400);
  expect(await row.evaluate(el => el.scrollLeft)).toBe(position);
});
