// Local check: temporarily edits the SPMB page configuration and restores it.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
let token, original, current, viewerId, browser;
const tag = `spmb-info-${Date.now()}`;
async function request(path, method = 'GET', body, access = token) {
  const r = await fetch('http://localhost:5243/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text(); return { status: r.status, data: text ? JSON.parse(text).data : null };
}
async function save(config) {
  const r = await request('/cms/spmb-information', 'PUT', { config, version: current.version });
  assert.equal(r.status, 200); current = r.data;
}
try {
  const login = await request('/auth/login', 'POST', { username: 'admin', password: process.env.CMS_ADMIN_PASSWORD || 'admin123' }, '');
  assert.equal(login.status, 200); token = login.data.access_token;
  const year = (await request('/spmb/schedule', 'GET', undefined, '')).data.academicYear;
  original = (await request('/cms/spmb-information')).data; current = original;
  assert.equal((await request('/cms/spmb-information', 'GET', undefined, '')).status, 401);
  for (const fields of [{ steps: [] }, { steps: [null] }, { steps: [{ ...original.config.steps[0], icon: 'invalid' }] }, { steps: [{ ...original.config.steps[0], showPayment: true }, { ...original.config.steps[0], showPayment: true }] }, { brochureUrl: 'javascript:alert(1)' }, { brochureUrl: '//example.com/file.pdf' }, { feeAmount: -1 }, { newStudentDocuments: ['x'.repeat(501)] }])
    assert.equal((await request('/cms/spmb-information', 'PUT', { config: { ...original.config, ...fields }, version: current.version })).status, 400);
  const account = await request('/users', 'POST', { username: tag, password: `Test-${tag}`, full_name: 'SPMB Info Test', role: 'VIEWER', status: 'ACTIVE' });
  assert.equal(account.status, 201); viewerId = account.data.id;
  const viewer = (await request('/auth/login', 'POST', { username: tag, password: `Test-${tag}` }, '')).data.access_token;
  assert.equal((await request('/cms/spmb-information', 'PUT', original, viewer)).status, 403);
  if (process.env.SPMB_INFO_BROWSER_CHECK === '1') {
    const { chromium } = createRequire(import.meta.url)('../.verify-cms/node_modules/playwright');
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    await page.addInitScript(auth => {
      localStorage.setItem('cendekia_access_token', auth.access_token);
      localStorage.setItem('cendekia_user', JSON.stringify(auth.user));
      localStorage.setItem('cendekia_expires_at', auth.expires_at);
    }, login.data);
    await page.goto('http://localhost:3000/spmb');
    assert((await page.locator('h1').innerText()).includes(year));
    assert.equal(await page.locator('main ol > li').count(), original.config.steps.length);
    await page.screenshot({ path: '.verify-cms/spmb-structured-desktop.png', fullPage: true });
    await page.goto('http://localhost:3002/content/spmb');
    await page.getByLabel('Judul tahap 1', { exact: true }).waitFor();
    assert(page.url().endsWith('/spmb/informasi'));
    await page.getByLabel('Judul tahap 1', { exact: true }).fill(`Tahap ${tag}`);
    await page.getByRole('button', { name: 'Ikon Buku tahap 1', exact: true }).click();
    await page.getByRole('button', { name: 'Turunkan tahap 1', exact: true }).click();
    await page.getByRole('button', { name: '+ Tambah tahap', exact: true }).click();
    await page.getByRole('button', { name: `Hapus tahap ${original.config.steps.length + 1}`, exact: true }).click();
    await page.getByLabel('Nominal biaya (Rp)', { exact: true }).fill('425000');
    await page.getByLabel('Berkas calon siswa baru').fill(`Berkas ${tag}`);
    await page.getByLabel('URL brosur').fill('https://example.invalid/brosur.pdf');
    await page.getByRole('button', { name: 'Simpan informasi SPMB', exact: true }).click();
    await page.getByText('Informasi SPMB berhasil diperbarui di website.', { exact: true }).waitFor();
    current = (await request('/cms/spmb-information')).data;
    assert.equal(current.config.steps[1].title, `Tahap ${tag}`); assert.equal(current.config.steps[1].icon, 'book');
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.goto('http://localhost:3000/spmb');
    assert((await page.locator('main ol > li').nth(1).innerText()).includes(`Tahap ${tag}`));
    assert((await page.locator('main').innerText()).includes('425.000'));
    assert((await page.locator('main').innerText()).includes(`Berkas ${tag}`));
    assert.equal(await page.getByRole('link', { name: 'Brosur SPMB', exact: true }).getAttribute('href'), 'https://example.invalid/brosur.pdf');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: '.verify-cms/spmb-structured-mobile.png', fullPage: true });
    await page.goto('http://localhost:3000/lmp'); assert((await page.locator('h1').innerText()).includes('Lomba Mata Pelajaran'));
    await page.goto('http://localhost:3000'); assert((await page.locator('#ppdb').innerText()).includes(year));
  } else await save({ ...current.config, introduction: tag });
  assert.equal((await request('/cms/spmb-information', 'PUT', original)).status, 409);
  const pub = (await request('/school/spmb-information', 'GET', undefined, '')).data;
  assert.equal(pub.version, undefined); assert.equal(pub.steps.length, current.config.steps.length);
  await save({ ...current.config, brochureUrl: '' });
  if (browser) { const page = await browser.newPage(); await page.goto('http://localhost:3000/spmb'); assert.equal(await page.getByRole('link', { name: 'Brosur SPMB', exact: true }).count(), 0); await page.close(); }
  console.log('PASS: SPMB structured config, validation, permissions, stale edits, brochure visibility' + (browser ? ', admin save/icons/reordering, desktop/mobile design, year synchronization, legacy redirect and LMP.' : '.'));
} finally {
  if (browser) await browser.close();
  if (original) { current = (await request('/cms/spmb-information')).data; await save(original.config); }
  if (viewerId) assert.equal((await request(`/users/${viewerId}`, 'DELETE')).status, 200);
}
