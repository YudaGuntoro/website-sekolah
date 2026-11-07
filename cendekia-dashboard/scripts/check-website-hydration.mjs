// Read-only browser regression check; run with the public website on port 3000.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('../.verify-cms/node_modules/playwright');
const base = process.env.WEBSITE_URL || 'http://localhost:3000';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const failures = [];
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    page.on('pageerror', error => failures.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && /hydration|server rendered HTML|did not match/i.test(message.text())) failures.push(message.text());
    });
    for (let reload = 0; reload < 5; reload++) {
      const response = await page.goto(base, { waitUntil: 'domcontentloaded' });
      assert.equal(response.status(), 200);
      await page.locator('main > #beranda').waitFor();
      // Leave real social embeds enabled; the original failure was intermittent.
      await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
      assert.equal(await page.locator('main').count(), 1);
      assert.equal(await page.locator('body > header').count(), 1);
      assert.equal(await page.locator('body > footer').count(), 1);
      assert.deepEqual(failures, [], 'Reload must not produce hydration or page errors');
    }
    if (viewport.width < 1280) {
      await page.getByRole('button', { name: 'Buka menu', exact: true }).click();
      await page.getByRole('navigation', { name: 'Navigasi seluler' }).getByRole('link', { name: 'SPMB', exact: true }).click();
    } else {
      await page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link', { name: 'SPMB', exact: true }).click();
    }
    await page.waitForURL(`${base}/spmb`);
    await page.locator('main').waitFor();
    await page.locator('header').getByRole('link').first().click();
    await page.waitForURL(`${base}/`);
    await page.locator('main > #beranda').waitFor();
    assert.deepEqual(failures, [], 'Client navigation back to the homepage must hydrate correctly');
    await context.close();
  }
  console.log('PASS: ten homepage reloads, desktop/mobile menus, and client navigation with no hydration errors.');
} finally {
  await browser.close();
}
