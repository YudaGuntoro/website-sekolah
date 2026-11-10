// Local integration test; restores the original section and removes its temporary viewer.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { mysql } from './lib/local-mysql.mjs';
import { browserSignIn } from './lib/browser-sign-in.mjs';

if (process.env.HIGHLIGHTS_ALLOW_TEST_SETUP !== '1') throw Error('Run locally with HIGHLIGHTS_ALLOW_TEST_SETUP=1.');
const base = process.env.CMS_API_URL || 'http://localhost:5243', web = process.env.SCHOOL_WEBSITE_URL || 'http://localhost:3000';
const tag = randomUUID().slice(0, 8);
let token, original, current, browser, viewerId;
async function api(path, method = 'GET', body, access = token, expected = 200) {
  const response = await fetch(base + '/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(access ? { Authorization: 'Bearer ' + access } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text(); const payload = text ? JSON.parse(text) : {}; assert.equal(response.status, expected, JSON.stringify(payload));
  return { ...payload, response };
}
async function save(values, expected = 200) {
  const result = await api('/cms/school-highlights', 'PUT', { ...current, ...values }, token, expected);
  if (expected === 200) current = result.data;
  return result;
}
function migrate() { const r = mysql(readFileSync('database/migrations/20261110_school_highlights.sql', 'utf8')); assert.equal(r.status, 0, r.stderr); }
try {
  token = (await api('/auth/login', 'POST', { username: 'admin', password: process.env.CMS_ADMIN_PASSWORD || 'admin123' }, '')).data.access_token;
  original = (await api('/cms/school-highlights')).data; current = original;
  await api('/cms/school-highlights', 'GET', undefined, '', 401);
  await api('/cms/school-highlights', 'PUT', original, '', 401);
  const publicResult = await api('/school/highlights', 'GET', undefined, '');
  assert.ok(publicResult.response.headers.get('cache-control').includes('no-store'));
  assert.equal(publicResult.data.version, undefined);
  assert.deepEqual(Object.keys(publicResult.data).sort(), ['heading', 'accent', 'description', 'enabled', 'cards'].sort());
  const card = { title: 'Ruang Uji ' + tag, category: 'Fasilitas', text: 'Deskripsi statistik ' + tag, value: '17+', icon: 'classroom' };
  for (const changes of [{ heading: '' }, { cards: null }, { cards: [null] }, { cards: Array(13).fill(card) }, { cards: [{ ...card, title: ' ' }] }, ...['-1', '1.5', '10 orang', '1234567', '01', '12++', ''].map(value => ({ cards: [{ ...card, value }] })), { cards: [{ ...card, icon: 'unknown' }] }]) await save(changes, 400);
  await save({ heading: 'Statistik Uji ' + tag, accent: 'data sekolah', description: 'Informasi uji ' + tag, enabled: true, cards: [card, { ...card, title: 'Kartu Nol', value: '0', icon: 'library' }, { ...card, title: 'Kartu Maksimal', value: '999999+', icon: 'growth' }] });
  await save({ version: original.version }, 409);
  migrate(); assert.deepEqual((await api('/cms/school-highlights')).data, current, 'Migration rerun must preserve edits and version');
  const password = randomUUID();
  const account = (await api('/users', 'POST', { username: 'stats-viewer-' + tag, password, full_name: 'Temporary statistics viewer', role: 'VIEWER', status: 'ACTIVE' }, token, 201)).data;
  viewerId = account.id;
  const viewer = (await api('/auth/login', 'POST', { username: 'stats-viewer-' + tag, password }, '')).data.access_token;
  await api('/cms/school-highlights', 'PUT', current, viewer, 403);
  await api('/cms/school-highlights', 'GET', undefined, viewer);

  const { chromium } = await import('../.verify-cms/node_modules/playwright/index.mjs');
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage(); page.setDefaultNavigationTimeout(60000);
  await page.goto(web + '/', { waitUntil: 'domcontentloaded' });
  const section = page.locator('#keunggulan');
  await section.getByRole('heading', { name: 'Statistik Uji ' + tag + ' data sekolah' }).waitFor();
  assert.deepEqual(await section.locator('h3').allTextContents(), [card.title, 'Kartu Nol', 'Kartu Maksimal']);
  await section.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('#keunggulan [aria-label="17+"]')?.textContent === '17+');
  assert.equal(await section.locator('article').count(), 3);
  assert.equal(await section.locator('article').last().evaluate(el => { const outer = el.getBoundingClientRect(), number = el.querySelector('[aria-label]').getBoundingClientRect(); return number.left >= outer.left && number.right <= outer.right; }), true);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await section.screenshot({ path: '.verify-cms/highlights-public-mobile.png' });
  await browserSignIn(context);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://localhost:3002/settings/highlights', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Statistik Beranda', exact: true }).waitFor();
  await page.getByLabel('Judul utama', { exact: true }).fill('Judul Portal ' + tag);
  await page.getByLabel('Angka kartu 1').fill('27+');
  await page.getByRole('button', { name: 'Turunkan kartu 1', exact: true }).click();
  await page.getByRole('button', { name: '+ Tambah kartu', exact: true }).click();
  await page.getByLabel('Judul kartu 4', { exact: true }).fill('Kartu Tambahan');
  await page.getByLabel('Angka kartu 4').fill('9');
  await page.getByRole('button', { name: 'Simpan statistik beranda', exact: true }).click();
  await page.getByText('Statistik beranda berhasil diperbarui di website.', { exact: true }).waitFor();
  current = (await api('/cms/school-highlights')).data;
  assert.equal(current.cards.length, 4); assert.equal(current.cards[1].value, '27+'); assert.equal(current.cards[0].title, 'Kartu Nol');
  await page.getByRole('button', { name: 'Hapus kartu 4', exact: true }).click();
  const saved = page.waitForResponse(response => response.url().endsWith('/api/cms/school-highlights') && response.request().method() === 'PUT');
  await page.getByRole('button', { name: 'Simpan statistik beranda', exact: true }).click(); assert.equal((await saved).status(), 200);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: '.verify-cms/highlights-admin-mobile.png', fullPage: true });
  await page.goto(web + '/', { waitUntil: 'domcontentloaded' });
  await section.getByRole('heading', { name: 'Judul Portal ' + tag + ' data sekolah' }).waitFor();
  assert.equal(await section.locator('article').count(), 3);
  await section.locator('[aria-label="27+"]').waitFor();
  current = (await api('/cms/school-highlights')).data;
  await save({ enabled: false });
  await page.reload({ waitUntil: 'domcontentloaded' }); assert.equal(await section.count(), 0);
  await save({ enabled: true, cards: [] });
  migrate(); assert.equal((await api('/cms/school-highlights')).data.cards.length, 0, 'Deleted cards must not be reseeded');
  await page.reload({ waitUntil: 'domcontentloaded' }); assert.equal(await section.count(), 0, 'No hardcoded fallback for empty cards');
  console.log('PASS highlights: relational persistence, migration preservation, validation, permissions, concurrency, real portal editing/add/remove/order, public updates/counters, hide/empty behavior, mobile and maximum value layout.');
} finally {
  if (browser) await browser.close();
  if (original && token) { current = (await api('/cms/school-highlights')).data; await save({ ...original, version: current.version }); }
  if (viewerId) await api('/users/' + viewerId, 'DELETE');
}
