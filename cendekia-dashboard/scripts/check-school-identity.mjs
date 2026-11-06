import { browserSignIn } from './lib/browser-sign-in.mjs';
// Local integration check: temporarily edits the school identity, then restores it.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
let token, original, current, viewerId, browser;
const tag = `identity-${Date.now()}`;
async function request(path, method = 'GET', body, access = token) {
  const response = await fetch('http://localhost:5243/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text(); return { status: response.status, data: text ? JSON.parse(text).data : null };
}
async function save(value) {
  const r = await request('/cms/school-identity', 'PUT', { ...value, version: current.version });
  assert.equal(r.status, 200); current = r.data;
}
try {
  const login = await request('/auth/login', 'POST', { username: 'admin', password: process.env.CMS_ADMIN_PASSWORD || 'admin123' }, '');
  assert.equal(login.status, 200); token = login.data.access_token;
  assert.equal((await request('/cms/school-identity', 'GET', undefined, '')).status, 401);
  original = (await request('/cms/school-identity')).data; current = original;
  for (const fields of [{ missions: [{ title: '', text: 'Text' }] }, { missions: [null] }, { missions: Array.from({ length: 21 }, () => ({ title: 'Title', text: 'Text' })) }, { motto: 'x'.repeat(501) }])
    assert.equal((await request('/cms/school-identity', 'PUT', { ...current, ...fields })).status, 400);
  const account = await request('/users', 'POST', { username: tag, password: `Test-${tag}`, full_name: 'Identity Test', role: 'VIEWER', status: 'ACTIVE' });
  assert.equal(account.status, 201); viewerId = account.data.id;
  const viewer = (await request('/auth/login', 'POST', { username: tag, password: `Test-${tag}` }, '')).data.access_token;
  assert.equal((await request('/cms/school-identity', 'PUT', current, viewer)).status, 403);
  if (process.env.IDENTITY_BROWSER_CHECK === '1') {
    const { chromium } = createRequire(import.meta.url)('../.verify-cms/node_modules/playwright');
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await browserSignIn(page);
    await page.goto('http://localhost:3002/settings/identity');
    await page.getByLabel('Isi visi').fill(`Visi ${tag}`);
    await page.getByLabel('Isi motto').fill(`Motto ${tag}`);
    const count = original.missions.length;
    assert(count > 0 && count < 20, 'Browser fixture requires 1-19 existing missions');
    await page.getByRole('button', { name: '+ Tambah poin misi', exact: true }).click();
    await page.getByRole('button', { name: `Hapus misi ${count + 1}`, exact: true }).click();
    assert.equal(await page.getByLabel(`Judul misi ${count + 1}`).count(), 0);
    await page.getByRole('button', { name: '+ Tambah poin misi', exact: true }).click();
    await page.getByLabel(`Judul misi ${count + 1}`).fill(`Poin ${tag}`);
    await page.getByLabel(`Isi misi ${count + 1}`, { exact: true }).fill(`Isi ${tag}`);
    await page.getByRole('button', { name: `Naikkan misi ${count + 1}`, exact: true }).click();
    await page.getByRole('button', { name: 'Simpan perubahan', exact: true }).click();
    await page.getByText('Visi, misi, dan motto berhasil diperbarui di website.', { exact: true }).waitFor();
    current = (await request('/cms/school-identity')).data;
    assert.equal(current.missions[count - 1].title, `Poin ${tag}`);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: '.verify-cms/school-identity-admin.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.goto('http://localhost:3000');
    const section = page.locator('#tentang');
    assert((await section.innerText()).includes(`Visi ${tag}`));
    assert((await section.innerText()).includes(`Motto ${tag}`));
    await section.getByText(`Poin ${tag}`, { exact: true }).click();
    await section.getByText(`Isi ${tag}`, { exact: true }).first().waitFor({ state: 'visible' });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await section.screenshot({ path: '.verify-cms/school-identity-mobile.png' });
  } else await save({ ...current, vision: `Visi ${tag}`, motto: `Motto ${tag}`, missions: [{ title: 'Poin', text: 'Isi' }] });
  assert.equal((await request('/cms/school-identity', 'PUT', original)).status, 409);
  const pub = (await request('/school/identity', 'GET', undefined, '')).data;
  assert.equal(pub.vision, `Visi ${tag}`); assert.equal(pub.version, undefined);
  await save({ ...current, vision: '', motto: '', missions: [] });
  const html = await (await fetch('http://localhost:3000')).text();
  assert(!html.includes(`Visi ${tag}`));
  assert(!html.includes('Berkarakter, berprestasi, menginspirasi.'));
  console.log('PASS: identity validation, permissions, concurrency, public values, empty fields' + (browser ? ', admin edit/add/delete/reorder, mobile mission display.' : '.'));
} finally {
  if (browser) await browser.close();
  if (original) { current = (await request('/cms/school-identity')).data; await save(original); }
  if (viewerId) assert.equal((await request(`/users/${viewerId}`, 'DELETE')).status, 200);
}
