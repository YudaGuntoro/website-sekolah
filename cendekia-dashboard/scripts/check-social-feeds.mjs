// Local integration check. Creates temporary posts and removes only those posts in finally.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const base = 'http://localhost:5243/api';
const tag = `social-check-${Date.now()}`;
const created = [];
let token, browser;
async function request(path, method = 'GET', body, auth = true) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  return { status: response.status, payload: text ? JSON.parse(text) : null };
}
const fixture = (platform, overrides = {}) => ({ title: `${tag}-${platform}`, slug: `${tag}-${platform}`, category: 'Kegiatan sekolah', summary: 'Ringkasan postingan uji.', body: '', imageUrl: '', postUrl: platform === 'instagram' ? 'https://www.instagram.com/p/CENDEKIA_TEST/' : 'https://www.tiktok.com/@cendekia/video/123456789', status: 'Published', sortOrder: 0, ...overrides });
try {
  const login = await request('/auth/login', 'POST', { username: 'admin', password: process.env.CMS_ADMIN_PASSWORD || 'admin123' }, false);
  assert.equal(login.status, 200); token = login.payload.data.access_token;
  for (const platform of ['instagram', 'tiktok']) {
    for (const postUrl of ['', null, 'javascript:alert(1)', 'https://example.com/p/fake/', 'https://www.instagram.com.evil.example/p/fake/', 'https://www.instagram.com/', 'https://www.tiktok.com/@profile', platform === 'instagram' ? 'https://www.tiktok.com/@demo/video/123' : 'https://www.instagram.com/p/demo/']) {
      assert.equal((await request(`/cms/content/${platform}`, 'POST', fixture(platform, { postUrl }))).status, 400, `Reject ${platform}: ${postUrl}`);
    }
    assert.equal((await request(`/cms/content/${platform}`, 'POST', fixture(platform), false)).status, 401);
    const post = await request(`/cms/content/${platform}`, 'POST', fixture(platform));
    assert.equal(post.status, 201, JSON.stringify(post.payload));
    created.push({ platform, ...post.payload.data });
    const list = await request(`/cms/content/${platform}`);
    assert(list.payload.data.some(item => item.id === post.payload.data.id && item.postUrl === fixture(platform).postUrl));
  }
  let published = (await request('/school/content', 'GET', undefined, false)).payload.data;
  for (const post of created) assert(published.some(item => item.slug === post.slug && item.postUrl === post.postUrl));
  const html = await (await fetch('http://localhost:3000')).text();
  assert(html.indexOf('id="pengumuman"') < html.indexOf('id="instagram"'));
  assert(html.indexOf('id="instagram"') < html.indexOf('id="tiktok"'));
  assert(html.indexOf('id="tiktok"') < html.indexOf('id="guru"'));
  for (const post of created) assert(html.includes(post.postUrl));
  const post = created[0];
  assert.equal((await request(`/cms/content/instagram/${post.id}`, 'PUT', { ...post, postUrl: 'https://example.com/bad' })).status, 400);
  const draft = await request(`/cms/content/instagram/${post.id}`, 'PUT', { ...post, status: 'Draft' });
  assert.equal(draft.status, 200);
  published = (await request('/school/content', 'GET', undefined, false)).payload.data;
  assert(!published.some(item => item.slug === post.slug));
  const republish = await request(`/cms/content/instagram/${post.id}`, 'PUT', { ...draft.payload.data, status: 'Published' });
  assert.equal(republish.status, 200);
  if (process.env.SOCIAL_BROWSER_CHECK === '1') {
    const require = createRequire(import.meta.url);
    const { chromium } = require('../.verify-cms/node_modules/playwright');
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addInitScript(auth => {
      localStorage.setItem('cendekia_access_token', auth.access_token);
      localStorage.setItem('cendekia_user', JSON.stringify(auth.user));
      localStorage.setItem('cendekia_expires_at', auth.expires_at);
    }, login.payload.data);
    const page = await context.newPage();
    await page.goto('http://localhost:3000');
    for (const post of created) {
      const link = page.locator(`#${post.platform} a[href="${post.postUrl}"]`);
      assert.equal(await link.getAttribute('target'), '_blank');
      assert((await link.getAttribute('rel')).includes('noopener'));
    }
    await page.locator('#instagram').scrollIntoViewIfNeeded();
    await page.screenshot({ path: '.verify-cms/social-feeds-desktop.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.locator('#instagram').scrollIntoViewIfNeeded();
    await page.screenshot({ path: '.verify-cms/social-feeds-mobile.png' });
    await page.goto('http://localhost:3002/content/instagram');
    await page.getByRole('heading', { name: 'Feed Instagram', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Tambah', exact: true }).click();
    const urlInput = page.getByLabel('URL postingan Instagram');
    await urlInput.waitFor();
    assert.equal(await urlInput.getAttribute('required'), '');
    await page.getByRole('button', { name: 'Batal', exact: true }).click();
    await page.goto('http://localhost:3002/content/tiktok');
    await page.getByRole('heading', { name: 'Feed TikTok', exact: true }).waitFor();
  }
  console.log('PASS: social CRUD, URL validation, public ordering, draft visibility, external links' + (browser ? ', desktop/mobile and admin editor.' : '.'));
} finally {
  if (browser) await browser.close();
  for (const post of created) {
    const removed = await request(`/cms/content/${post.platform}/${post.id}`, 'DELETE');
    assert.equal(removed.status, 200, `Cleanup failed: ${post.id}`);
  }
}
