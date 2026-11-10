import { browserSignIn } from './lib/browser-sign-in.mjs';
// Local check: temporarily changes image overrides and restores them in finally.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
let token, original, current, viewerId, browser;
async function request(path, method = 'GET', body, access = token) {
  const r = await fetch('http://localhost:5243/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text(); return { status: r.status, data: text ? JSON.parse(text).data : null };
}
async function save(value) {
  const r = await request('/cms/homepage-images', 'PUT', { ...value, version: current.version });
  assert.equal(r.status, 200); current = r.data;
}
try {
  const login = await request('/auth/login', 'POST', { username: 'admin', password: process.env.CMS_ADMIN_PASSWORD || 'admin123' }, '');
  assert.equal(login.status, 200); token = login.data.access_token;
  assert.equal((await request('/cms/homepage-images', 'GET', undefined, '')).status, 401);
  original = (await request('/cms/homepage-images')).data; current = original;
  assert.equal(original.photos?.length || 0, 0, "Run this local URL test before uploading real homepage photos.");
  for (const heroUrl of ['javascript:alert(1)', 'http://example.com/test.png', '//example.com/test.png', '/images/../secret', 'https://user:pass@example.com/test.png', null])
    assert.equal((await request('/cms/homepage-images', 'PUT', { ...current, heroUrl })).status, 400);
  const tag = `image-check-${Date.now()}`;
  const account = await request('/users', 'POST', { username: tag, password: `Test-${tag}`, full_name: 'Image Test', role: 'VIEWER', status: 'ACTIVE' });
  assert.equal(account.status, 201); viewerId = account.data.id;
  const viewer = (await request('/auth/login', 'POST', { username: tag, password: `Test-${tag}` }, '')).data.access_token;
  assert.equal((await request('/cms/homepage-images', 'PUT', current, viewer)).status, 403);
  const custom = '/images/school/siswa-ppdb-formulir.png';
  if (process.env.IMAGES_BROWSER_CHECK === '1') {
    const { chromium } = createRequire(import.meta.url)('../.verify-cms/node_modules/playwright');
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    await browserSignIn(context);
    await page.goto('http://localhost:3002/settings/images');
    await page.getByText('Gunakan URL gambar', {exact:true}).first().waitFor();
    for (const summary of await page.getByText('Gunakan URL gambar', {exact:true}).all()) await summary.click();
    for (const title of ['Banner Utama', 'Arah Pendidikan', 'Program Unggulan']) await page.getByLabel(`URL gambar ${title}`).fill(custom);
    await page.getByRole('button', { name: 'Simpan gambar', exact: true }).click();
    await page.getByText('Gambar beranda berhasil diperbarui di website.', { exact: true }).waitFor();
    current = (await request('/cms/homepage-images')).data;
    assert.equal(current.heroUrl, custom); assert.equal(current.directionUrl, custom); assert.equal(current.programUrl, custom);
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.goto('http://localhost:3000');
    for (const section of ['beranda', 'tentang', 'program']) assert.equal(await page.locator(`#${section} img`).first().evaluate(img => new URL(img.src).pathname), custom);
    await save({ ...current, heroUrl: 'https://images.example.invalid/unavailable.png' });
    await page.route('https://images.example.invalid/**', route => route.abort());
    await page.reload();
    await page.locator('#beranda img').first().scrollIntoViewIfNeeded();
    await page.waitForFunction(() => { const img = document.querySelector('#beranda img'); return img && new URL(img.src).pathname === '/images/school/siswa-ceria.png'; });
    await page.goto('http://localhost:3002/settings/images');
    await page.getByRole('button', {name: 'Gunakan gambar bawaan',exact:true}).first().waitFor();
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Gunakan gambar bawaan', exact: true }).nth(i).click();
    await page.getByRole('button', { name: 'Simpan gambar', exact: true }).click();
    await page.getByText('Gambar beranda berhasil diperbarui di website.', { exact: true }).waitFor();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: '.verify-cms/homepage-image-settings.png' });
    current = (await request('/cms/homepage-images')).data;
    await page.goto('http://localhost:3000');
    for (const [section, file] of [['beranda', 'siswa-ceria.png'], ['tentang', 'arah-pendidikan.png'], ['program', 'bimbingan-karier.png']])
      assert.equal(await page.locator(`#${section} img`).first().evaluate(img => new URL(img.src).pathname), `/images/school/${file}`);
  } else await save({ ...current, heroUrl: custom, directionUrl: custom, programUrl: custom });
  assert.equal((await request('/cms/homepage-images', 'PUT', original)).status, 409);
  const pub = (await request('/school/homepage-images', 'GET', undefined, '')).data;
  assert.equal(pub.version, undefined);
  console.log('PASS: image validation, permissions, stale updates, public settings' + (browser ? ', admin save/reset, custom images, broken-image fallback, defaults and mobile layout.' : '.'));
} finally {
  if (browser) await browser.close();
  if (original) { current = (await request('/cms/homepage-images')).data; await save(original); }
  if (viewerId) assert.equal((await request(`/users/${viewerId}`, 'DELETE')).status, 200);
}
