// Local check: temporarily changes settings and restores the original values in finally.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
let token, original, current, browser;
const users = [];
const tag = `contact-${Date.now()}`;
async function request(path, method = 'GET', body, access = token) {
  const r = await fetch('http://localhost:5243/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text(); return { status: r.status, body: text ? JSON.parse(text) : null };
}
async function save(value) {
  const r = await request('/cms/website-settings', 'PUT', { ...value, version: current.version });
  assert.equal(r.status, 200, JSON.stringify(r.body)); current = r.body.data; return current;
}
try {
  const login = await request('/auth/login', 'POST', { username: 'admin', password: process.env.CMS_ADMIN_PASSWORD || 'admin123' }, '');
  assert.equal(login.status, 200); token = login.body.data.access_token;
  assert.equal((await request('/cms/website-settings', 'GET', undefined, '')).status, 401);
  original = (await request('/cms/website-settings')).body.data; current = original;
  assert.equal((await request('/cms/website-settings', 'PUT', original, '')).status, 401);
  for (const role of ['VIEWER', 'OPERATOR']) {
    const username = `${tag}-${role.toLowerCase()}`, password = `Test-${tag}`;
    const account = await request('/users', 'POST', { username, password, full_name: 'Contact Test', role, status: 'ACTIVE' });
    assert.equal(account.status, 201); users.push(account.body.data.id);
    const auth = (await request('/auth/login', 'POST', { username, password }, '')).body.data.access_token;
    assert.equal((await request('/cms/website-settings', 'PUT', original, auth)).status, 403);
  }
  for (const fields of [{ email: 'bad email' }, { whatsappNumber: 'not-phone' }, { instagramUrl: 'javascript:alert(1)' }, { instagramUrl: 'https://instagram.com.evil.example/user' }, { facebookUrl: 'https://www.tiktok.com/@wrong' }])
    assert.equal((await request('/cms/website-settings', 'PUT', { ...current, ...fields })).status, 400);
  const fixture = { ...current, whatsappNumber: '081234567890', email: `${tag}@example.invalid`, address: `Alamat uji ${tag}`, instagramUrl: 'https://www.instagram.com/cendekia_test/', tiktokUrl: 'https://www.tiktok.com/@cendekia_test', facebookUrl: 'https://www.facebook.com/cendekia_test' };
  await save(fixture);
  assert.equal((await request('/cms/website-settings', 'PUT', original)).status, 409);
  const pub = (await request('/school/contact', 'GET', undefined, '')).body.data;
  assert.equal(pub.email, fixture.email); assert.equal(pub.version, undefined);
  if (process.env.CONTACT_BROWSER_CHECK === '1') {
    const { chromium } = createRequire(import.meta.url)('../.verify-cms/node_modules/playwright');
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addInitScript(auth => {
      localStorage.setItem('cendekia_access_token', auth.access_token);
      localStorage.setItem('cendekia_user', JSON.stringify(auth.user));
      localStorage.setItem('cendekia_expires_at', auth.expires_at);
    }, login.body.data);
    const page = await context.newPage();
    await page.goto('http://localhost:3002/settings/contact');
    await page.getByLabel('Email sekolah').waitFor();
    await page.getByLabel('Email sekolah').fill(`ui-${tag}@example.invalid`);
    await page.getByRole('button', { name: 'Simpan pengaturan' }).click();
    await page.getByText('Kontak dan media sosial berhasil diperbarui di website.', { exact: true }).waitFor();
    current = (await request('/cms/website-settings')).body.data;
    assert.equal(current.email, `ui-${tag}@example.invalid`);
    await page.screenshot({ path: '.verify-cms/contact-settings-desktop.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: '.verify-cms/contact-settings-mobile.png' });
    await page.goto('http://localhost:3000');
    assert.equal(await page.locator('footer a[title="WhatsApp"]').getAttribute('href'), 'https://wa.me/6281234567890');
    assert.equal(await page.locator('footer a[title="Email"]').getAttribute('href'), `mailto:${current.email}`);
    assert.equal(await page.locator('footer a[title="Instagram"]').getAttribute('href'), fixture.instagramUrl);
    assert((await page.locator('footer').innerText()).includes(fixture.address));
  }
  await save({ ...current, whatsappNumber: '', email: '', address: '', instagramUrl: '', tiktokUrl: '', facebookUrl: '' });
  if (browser) {
    const page = await browser.newPage(); await page.goto('http://localhost:3000');
    assert.equal(await page.locator('footer a[title="Instagram"], footer a[title="Email"], footer a[title="WhatsApp"]').count(), 0);
    assert.equal(await page.getByRole('link', { name: 'Butuh informasi? Hubungi SMPIT Cendekia melalui WhatsApp', exact: true }).count(), 0);
    await page.close();
  }
  console.log('PASS: contacts validation, role permissions, stale update rejection, public settings, optional fields' + (browser ? ', admin save and footer browser checks, mobile layout.' : '.'));
} finally {
  if (browser) await browser.close();
  if (original && current) await save(original);
  for (const id of users) assert.equal((await request(`/users/${id}`, 'DELETE')).status, 200);
}
