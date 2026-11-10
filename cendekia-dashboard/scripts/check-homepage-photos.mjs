// Local only; uses an empty photo store, restores settings and removes its own files.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mysql } from './lib/local-mysql.mjs';
import { browserSignIn } from './lib/browser-sign-in.mjs';

if (process.env.HOMEPAGE_PHOTOS_ALLOW_TEST_SETUP !== '1') throw Error('Run locally with HOMEPAGE_PHOTOS_ALLOW_TEST_SETUP=1.');
const base = 'http://localhost:5243', web = 'http://localhost:3000', max = 1024 * 1024;
const jpeg = readFileSync('.verify-cms/file-optimizer/proof-large.jpg'), png = readFileSync('.verify-cms/file-optimizer/transparent-photo.png');
const boundaryJpeg = Buffer.concat([jpeg, Buffer.alloc(max - jpeg.length)]);
let token, original, current, browser;
async function api(path, method = 'GET', body, expected = 200, access = token) {
  const response = await fetch(base + '/api' + path, { method, headers: { ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(access ? { Authorization: 'Bearer ' + access } : {}) }, body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body) });
  const text = await response.text(), payload = text ? JSON.parse(text) : {};
  assert.equal(response.status, expected, JSON.stringify(payload)); return payload.data;
}
const sql = query => { const r = mysql(query); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };
async function save(changes = {}, photos, expected = 200) {
  const values = { heroUrl: current.heroUrl, directionUrl: current.directionUrl, programUrl: current.programUrl, version: current.version, ...changes };
  let body = values;
  if (photos) {
    body = new FormData(); for (const [key, value] of Object.entries(values)) body.set(key, String(value));
    for (const [slot, file] of Object.entries(photos)) body.set(slot + 'Photo', new Blob([file.bytes]), file.name);
  }
  const result = await api('/cms/homepage-images', 'PUT', body, expected);
  if (expected === 200) current = result;
}
async function photo(slot, expected = 200, host = web) {
  const response = await fetch(host + '/api/school/homepage-images/' + slot);
  assert.equal(response.status, expected); assert.ok(response.headers.get('cache-control')?.includes('no-store'));
  if (expected === 200) { assert.ok(['image/jpeg', 'image/png', 'image/webp'].includes(response.headers.get('content-type'))); assert.equal(response.headers.get('x-content-type-options'), 'nosniff'); }
  return response;
}
try {
  token = (await api('/auth/login', 'POST', { username: 'admin', password: process.env.CMS_ADMIN_PASSWORD || 'admin123' }, 200, '')).access_token;
  original = await api('/cms/homepage-images'); current = original;
  assert.equal(original.photos.length, 0, 'Run before real homepage photo uploads; existing photos must stay untouched.');
  await photo('hero', 404); await photo('unknown', 404);
  for (const file of [
    { name: 'big.jpg', bytes: Buffer.concat([boundaryJpeg, Buffer.from([0])]) },
    { name: 'fake.jpg', bytes: Buffer.from([255, 216, 255, 0, 0, 0, 0, 0]) },
    { name: 'not-photo.svg', bytes: Buffer.from('<svg></svg>') },
  ]) await save({}, { hero: file }, 400);
  assert.equal(sql('SELECT COUNT(*) FROM homepage_image_files'), '0');
  await save({}, { hero: { name: 'one-mib.jpg', bytes: boundaryJpeg }, direction: { name: 'transparent.png', bytes: png }, program: { name: 'program.jpg', bytes: jpeg } });
  assert.equal(current.photos.length, 3);
  assert.match(current.heroUrl, /^\/api\/school\/homepage-images\/hero\?v=\d+$/);
  const hero = current.photos.find(p => p.slot === 'hero'); assert.equal(hero.originalBytes, max); assert.ok(hero.storedBytes < max * .7);
  const firstHero = Buffer.from(await (await photo('hero')).arrayBuffer()); assert.equal(firstHero.length, hero.storedBytes);
  assert.equal(sql('SELECT COUNT(*) FROM homepage_image_files'), '3');
  assert.equal(JSON.stringify(current).includes('content'), false); assert.ok(JSON.stringify(current).length < 2000);
  const publicSettings = await api('/school/homepage-images', 'GET', undefined, 200, '');
  assert.deepEqual(Object.keys(publicSettings).sort(), ['heroUrl', 'directionUrl', 'programUrl'].sort());
  const stored = sql('SELECT Slot,SHA2(Content,256),OriginalLength FROM homepage_image_files ORDER BY Slot');
  const migration = mysql(readFileSync('database/migrations/20261110_homepage_image_files.sql', 'utf8')); assert.equal(migration.status, 0, migration.stderr);
  assert.equal(sql('SELECT Slot,SHA2(Content,256),OriginalLength FROM homepage_image_files ORDER BY Slot'), stored);
  await save(); // Preserve every uploaded slot on ordinary JSON saves.
  assert.equal(sql('SELECT Slot,SHA2(Content,256),OriginalLength FROM homepage_image_files ORDER BY Slot'), stored);
  const stale = current.version - 1;
  await save({ version: stale }, { hero: { name: 'stale.png', bytes: png } }, 409);
  assert.equal(sql('SELECT Slot,SHA2(Content,256),OriginalLength FROM homepage_image_files ORDER BY Slot'), stored);
  await save({}, { hero: { name: 'replacement.png', bytes: png } });
  assert.equal(sql('SELECT COUNT(*) FROM homepage_image_files'), '3', 'Replacements overwrite the existing slot, never accumulate BLOBs');
  assert.notDeepEqual(Buffer.from(await (await photo('hero')).arrayBuffer()), firstHero);

  const { chromium } = await import('../.verify-cms/node_modules/playwright/index.mjs');
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage(); page.setDefaultNavigationTimeout(60000);
  await page.goto(web + '/', { waitUntil: 'domcontentloaded' });
  for (const [section, slot] of [['beranda', 'hero'], ['tentang', 'direction'], ['program', 'program']]) {
    const image = page.locator('#' + section + ' img').first(); assert.match(await image.getAttribute('src'), new RegExp('/api/school/homepage-images/' + slot));
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(img => { img.loading = 'eager'; return img.decode(); });
  }
  assert.equal(await page.evaluate(async () => { const img = new Image(); img.src = '/api/school/homepage-images/direction'; await img.decode(); const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0); return ctx.getImageData(0, 0, 1, 1).data[3]; }), 0, 'Transparent PNG must preserve alpha');
  await browserSignIn(context);
  await page.goto('http://localhost:3002/settings/images', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Upload foto Banner Utama').setInputFiles({ name: 'too-big.jpg', mimeType: 'image/jpeg', buffer: Buffer.concat([boundaryJpeg, Buffer.from([0])]) });
  await page.getByRole('alert').getByText('Foto harus JPG/PNG, maksimal 1 MB per foto.', { exact: true }).waitFor();
  await page.getByLabel('Upload foto Banner Utama').setInputFiles({ name: 'portal.jpg', mimeType: 'image/jpeg', buffer: jpeg });
  const preview = page.getByRole('img', { name: 'Pratinjau Banner Utama', exact: true });
  await preview.evaluate(img => img.decode()); assert.match(await preview.getAttribute('src'), /^blob:/);
  await page.getByRole('button', { name: 'Simpan gambar', exact: true }).click();
  await page.getByText('Gambar beranda berhasil diperbarui di website.', { exact: true }).waitFor();
  await preview.evaluate(img => img.decode()); assert.match(await preview.getAttribute('src'), /^\/api\/school\/homepage-images\/hero/);
  await page.getByRole('region', { name: 'Banner Utama', exact: true }).getByText(/Foto tersimpan:/).waitFor();
  await page.screenshot({ path: '.verify-cms/homepage-photos-admin-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 }); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.getByRole('region', { name: 'Banner Utama', exact: true }).screenshot({ path: '.verify-cms/homepage-photos-admin-mobile.png' });
  await page.getByRole('region', { name: 'Banner Utama', exact: true }).getByRole('button', { name: 'Gunakan gambar bawaan', exact: true }).click();
  const saved = page.waitForResponse(response => response.url().endsWith('/api/cms/homepage-images') && response.request().method() === 'PUT');
  await page.getByRole('button', { name: 'Simpan gambar', exact: true }).click(); assert.equal((await saved).status(), 200);
  await photo('hero', 404); assert.equal(sql('SELECT COUNT(*) FROM homepage_image_files'), '2');
  current = await api('/cms/homepage-images');
  await save({ directionUrl: '/images/school/arah-pendidikan.png', programUrl: '' });
  assert.equal(sql('SELECT COUNT(*) FROM homepage_image_files'), '0', 'Reset or URL replacement removes stored bytes');
  console.log(`PASS homepage photos: 1 MiB -> ${hero.storedBytes} bytes, three-slot upload, validation/limits, JSON preservation, replacement cleanup, migration preservation, stale upload rollback, public proxy/alpha, real portal upload/reset, live website and mobile.`);
} finally {
  if (browser) await browser.close();
  if (original && token) { current = await api('/cms/homepage-images'); await save({ ...original, version: current.version }); }
}
