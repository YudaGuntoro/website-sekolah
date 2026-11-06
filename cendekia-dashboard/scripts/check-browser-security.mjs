import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { browserSignIn } from './lib/browser-sign-in.mjs';
const { chromium } = createRequire(import.meta.url)('../.verify-cms/node_modules/playwright');
const base = process.env.CMS_DASHBOARD_URL || 'http://localhost:3002';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const context = await browser.newContext();
  await browserSignIn(context);
  const page = await context.newPage();
  await page.goto(base + '/lmp/pendaftar');
  await page.getByRole('heading', { name: /Peserta|Pendaftar/i }).first().waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem('cendekia_access_token')), null);
  assert(!(await page.evaluate(() => document.cookie)).includes('cendekia_session'));
  const cookie = (await context.cookies()).find(x => x.name === 'cendekia_session');
  assert(cookie?.httpOnly); assert.equal(cookie.sameSite, 'Strict');
  await page.reload();
  await page.getByRole('heading', { name: /Peserta|Pendaftar/i }).first().waitFor();
  assert.equal(await page.evaluate(async () => (await fetch('/api/auth/logout', { method: 'POST' })).status), 403);
  // Verify a real save traverses the browser's CSRF header code, restoring the same values.
  await page.goto(base + '/settings/contact');
  await page.getByRole('button', { name: /Simpan/ }).waitFor();
  const saved = page.waitForResponse(r => r.url().includes('/api/cms/website-settings') && r.request().method() === 'PUT');
  await page.getByRole('button', { name: /Simpan/ }).click();
  assert.equal((await saved).status(), 200);
  await page.getByRole('button', { name: 'Open user menu' }).click();
  await page.getByRole('link', { name: 'Sign out' }).click();
  await page.waitForURL(/\/signin/);
  assert.equal((await page.request.get(base + '/api/auth/session')).status(), 401);
  console.log('PASS: real browser login/reload/save, no localStorage token, HttpOnly cookie invisibility, CSRF rejection, and logout.');
} finally { await browser.close(); }
