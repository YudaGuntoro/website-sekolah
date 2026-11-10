// Local integration check. Only creates/deletes its own temporary activity.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mysql } from './lib/local-mysql.mjs';
import { browserSignIn } from './lib/browser-sign-in.mjs';

const base = process.env.CMS_API_URL || 'http://localhost:5243';
const web = process.env.SCHOOL_WEBSITE_URL || 'http://localhost:3000';
const slug = 'activity-check-' + randomUUID(), title = 'Kegiatan Uji ' + slug.slice(-8);
const login = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: process.env.CMS_ADMIN_PASSWORD || 'admin123' }) });
assert.equal(login.status, 200);
const auth = { Authorization: 'Bearer ' + (await login.json()).data.access_token };
let row, browser;
const image = readFileSync('.verify-cms/file-optimizer/proof-large.jpg');
async function save(data, expected = 200, photo) {
  let body = JSON.stringify(data), headers = { ...auth, 'Content-Type': 'application/json' };
  if (photo) {
    body = new FormData(); headers = auth;
    for (const [key, value] of Object.entries(data)) if (value !== null) body.set(key, String(value));
    body.set('photo', new Blob([photo], { type: 'image/jpeg' }), 'kegiatan.jpg');
  }
  const response = await fetch(base + '/api/cms/content/ekstrakurikuler' + (row ? '/' + row.id : ''), { method: row ? 'PUT' : 'POST', headers, body });
  const payload = await response.json(); assert.equal(response.status, expected, JSON.stringify(payload));
  if (response.ok) row = payload.data;
}
async function notFound(slug) {
  const response = await fetch(web + '/ekstrakurikuler/' + slug);
  const html = await response.text();
  // Next streams a 200 shell before async notFound; verify the 404 boundary and noindex.
  assert.ok(response.status === 404 || (html.includes('NEXT_HTTP_ERROR_FALLBACK;404') && html.includes('noindex')));
}
async function published() {
  const response = await fetch(base + '/api/school/content'); assert.equal(response.status, 200);
  return (await response.json()).data.find(entry => entry.slug === slug);
}
try {
  await save({ title, slug, category: 'Olahraga', coachName: 'Pelatih Pengujian', summary: 'Belajar teknik dasar dan kerja sama.', body: 'Pemanasan dan latihan teknik dasar.\n\nLatihan bersama dengan pendampingan pelatih.', imageUrl: '', postUrl: '', status: 'Draft', sortOrder: 0, version: 0 }, 201, image);
  assert.equal(row.coachName, 'Pelatih Pengujian'); assert.match(row.imageUrl, /^\/api\/school\/images\//);
  const length = mysql(`SELECT OCTET_LENGTH(Content) FROM school_content_images WHERE Id='${row.imageUrl.split('/').at(-1)}';`);
  assert.equal(length.status, 0, length.stderr); assert.ok(Number(length.stdout.trim()) < image.length);
  assert.equal(await published(), undefined);
  await notFound(slug);
  await save({ ...row, coachName: 'x'.repeat(201) }, 400);
  await save({ ...row, status: 'Published' });
  assert.equal((await published()).coachName, 'Pelatih Pengujian');
  const oldClient = { ...row }; delete oldClient.coachName;
  await save(oldClient); assert.equal(row.coachName, 'Pelatih Pengujian');
  const photoResponse = await fetch(web + row.imageUrl); assert.equal(photoResponse.status, 200);
  assert.ok((await photoResponse.arrayBuffer()).byteLength < image.length);

  const { chromium } = await import('../.verify-cms/node_modules/playwright/index.mjs');
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage(); page.setDefaultNavigationTimeout(60000);
  await page.goto(web + '/ekstrakurikuler', { waitUntil: 'domcontentloaded' });
  const card = page.locator(`main a[href='/ekstrakurikuler/${slug}']`);
  await card.waitFor(); assert.equal(await card.locator('svg').count(), 0);
  await card.locator('img').evaluate(img => img.decode());
  await card.click(); await page.waitForURL('**/ekstrakurikuler/' + slug);
  await page.getByRole('heading', { name: title, exact: true }).waitFor();
  await page.getByText('Pelatih Pengujian', { exact: true }).waitFor();
  await page.getByText('Pemanasan dan latihan teknik dasar.', { exact: true }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: '.verify-cms/extracurricular-detail-mobile.png', fullPage: true });

  await browserSignIn(context);
  await page.goto('http://localhost:3002/content/ekstrakurikuler', { waitUntil: 'domcontentloaded' });
  await page.getByRole('textbox', { name: 'Cari konten', exact: true }).fill(title);
  await page.getByRole('button', { name: 'Update ' + title, exact: true }).click();
  const dialog = page.locator('dialog[open]');
  assert.equal(await dialog.getByLabel('Pelatih / pembina', { exact: false }).inputValue(), 'Pelatih Pengujian');
  await dialog.getByLabel('Pelatih / pembina', { exact: false }).fill('Pembina Terbaru');
  await dialog.getByLabel('Kegiatan dan latihan', { exact: false }).fill('Latihan bertahap bersama pembina.');
  await dialog.getByRole('button', { name: 'Simpan & terbitkan', exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });
  assert.equal((await published()).coachName, 'Pembina Terbaru');
  await page.goto(web + '/ekstrakurikuler/' + slug, { waitUntil: 'domcontentloaded' });
  await page.getByText('Pembina Terbaru', { exact: true }).waitFor();
  await page.getByText('Latihan bertahap bersama pembina.', { exact: true }).waitFor();
  await notFound('unknown-' + slug);
  console.log('PASS extracurricular image compression/BLOB, coach validation/preservation, draft privacy/404, image cards/detail navigation, mobile and real portal editing.');
} finally {
  if (browser) await browser.close();
  if (row) {
    const deleted = await fetch(base + '/api/cms/content/ekstrakurikuler/' + row.id, { method: 'DELETE', headers: auth });
    assert.equal(deleted.status, 200);
    await notFound(slug);
  }
}
