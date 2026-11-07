import { browserSignIn } from './lib/browser-sign-in.mjs';
// Local integration check; restores settings and removes only its own synthetic records.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const tag = `LMP-TEST-${Date.now()}`;
const keys = []; let token, original, current, browser, viewerId;
const root = new URL('../', import.meta.url);
async function api(path, method = 'GET', body, access = token) {
  const response = await fetch('http://localhost:5243/api' + path, { method, headers: { ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(access ? { Authorization: `Bearer ${access}` } : {}) }, body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body) });
  const text = await response.text(); let payload; try { payload = JSON.parse(text); } catch { payload = {}; }
  return { status: response.status, data: payload.data, payload, response };
}
async function save(config) { const r = await api('/lmp/settings', 'PUT', { config, version: current.version }); assert.equal(r.status, 200, JSON.stringify(r.payload)); current = r.data; }
function form(fields = {}, file) {
  const key = fields.submissionKey || randomUUID(); keys.push(key);
  const data = { submissionKey: key, settingsVersion: current.version, studentName: tag, previousSchool: 'SD Pengujian', grade: 5, subjects: 'Matematika', contactName: 'Wali Pengujian', contactPhone: '081234567890', consent: true, ...fields };
  const body = new FormData(); for (const [key, value] of Object.entries(data)) for (const v of Array.isArray(value) ? value : [value]) body.append(key, String(v));
  if (file) body.append('document', new Blob([file.body], { type: 'application/pdf' }), file.name);
  return body;
}
const pdf = { name: 'berkas.pdf', body: '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF' };
try {
  const login = await api('/auth/login', 'POST', { username: 'admin', password: process.env.CMS_ADMIN_PASSWORD || 'admin123' }, '');
  assert.equal(login.status, 200); token = login.data.access_token;
  original = (await api('/lmp/settings')).data; current = original;
  assert.equal((await api('/lmp/settings', 'GET', undefined, '')).status, 401);
  assert.equal((await api('/lmp/applications', 'GET', undefined, '')).status, 401);
  const today = current.today;
  const enabled = { ...original.config, enabled: true, registrationStart: today, registrationEnd: today, whatsappGroupUrl: 'https://chat.whatsapp.com/LmpTestGroup' };
  for (const fields of [{ enabled: true, registrationStart: null }, { registrationStart: '2027-01-22', registrationEnd: '2027-01-21' }, { feeAmount: -1 }, { whatsappGroupUrl: 'javascript:alert(1)' }, { whatsappGroupUrl: 'https://example.com/group' }])
    assert.equal((await api('/lmp/settings', 'PUT', { config: { ...enabled, ...fields }, version: current.version })).status, 400);
  await save(enabled);
  for (const fields of [{ grade: 4 }, { grade: 7 }, { subjects: 'IPA' }, { subjects: ['Matematika','Bahasa Inggris'] }, { consent: false }, { studentName: ' ' }, { contactPhone: '123' }])
    assert.equal((await api('/lmp/applications', 'POST', form(fields), '')).status, 400, JSON.stringify(fields));
  assert.equal((await api('/lmp/applications', 'POST', form({}, { name: 'bad.pdf', body: 'not a PDF' }), '')).status, 400);
  assert.equal((await api('/lmp/applications', 'POST', form({}, { name: 'bad.exe', body: pdf.body }), '')).status, 400);
  assert.equal((await api('/lmp/applications', 'POST', form({}, { name: 'large.pdf', body: '%PDF-' + 'x'.repeat(2097152) }), '')).status, 400);
  await save({ ...enabled, documentRequired: true });
  assert.equal((await api('/lmp/applications', 'POST', form(), '')).status, 400);
  const key = randomUUID();
  const receipts = await Promise.all([1,2].map(() => api('/lmp/applications','POST',form({ submissionKey: key }, pdf), '')));
  receipts.forEach(r => assert.equal(r.status,200,JSON.stringify(r.payload)));
  assert.equal(receipts[0].data.registrationNumber, receipts[1].data.registrationNumber);
  for (const receipt of receipts) {
    assert.equal(receipt.data.studentName, tag);
    assert.equal(receipt.data.previousSchool, 'SD Pengujian');
    assert.equal(receipt.data.grade, 5);
    assert.equal(receipt.data.subjects, 'Matematika');
    assert.equal(receipt.data.contactName, 'Wali Pengujian');
    assert.equal(receipt.data.contactPhone, '081234567890');
    assert.equal(receipt.data.hasDocument, true);
    assert.equal(receipt.data.paymentStatus, 'Belum bayar');
    assert.ok(receipt.data.submittedAt);
    assert.equal(receipt.data.whatsappGroupUrl, enabled.whatsappGroupUrl);
    assert.equal(receipt.data.waveNumber, undefined);
  }
  const retried = await api('/lmp/applications','POST',form({submissionKey:key,studentName:tag+'-changed'},pdf),'');
  assert.equal(retried.data.studentName, tag, 'Receipt must reflect the stored participant, including retries');
  const entries = (await api('/lmp/applications?search=' + tag)).data;
  assert.equal(entries.total, 1);
  const id = entries.items[0].id;
  const detail = (await api('/lmp/applications/' + id)).data;
  assert.equal(detail.hasDocument, true); assert.equal(detail.document, undefined); assert.equal(detail.paymentStatus,'Belum bayar');
  assert.equal((await api(`/lmp/applications/${id}/document`, 'GET', undefined, '')).status, 401);
  const file = await api(`/lmp/applications/${id}/document`); assert.equal(file.status, 200); assert.equal(file.response.headers.get('content-type'), 'application/pdf'); assert.match(file.response.headers.get('content-disposition'), /attachment/);
  const changed = await api(`/lmp/applications/${id}/status`,'PUT',{status:'Terverifikasi',paymentStatus:'Lunas',version:detail.version}); assert.equal(changed.status,200);
  assert.equal((await api(`/lmp/applications/${id}/status`,'PUT',{status:'Baru',paymentStatus:'Belum bayar',version:detail.version})).status,409);
  await save({ ...enabled, feeAmount: 40000 });
  assert.equal((await api('/lmp/applications/' + id)).data.feeAmount, original.config.feeAmount);
  for (let i = 0; i < 2; i++) assert.equal((await api('/lmp/applications', 'POST', form({}, pdf), '')).status, 200);
  const repriced = (await api('/lmp/applications?search=' + tag)).data;
  assert.equal(repriced.total, 3);
  for (const item of repriced.items.filter(x => x.id !== id)) assert.equal((await api('/lmp/applications/' + item.id)).data.feeAmount, 40000);
  assert.equal((await api('/lmp/applications','POST',form({settingsVersion:1}), '')).status,409);
  const future = new Date(today + 'T00:00:00Z'); future.setUTCDate(future.getUTCDate()+1); const tomorrow = future.toISOString().slice(0,10);
  await save({ ...enabled, registrationStart: tomorrow, registrationEnd: tomorrow });
  assert.equal(current.isOpen,false); assert.equal((await api('/lmp/applications','POST',form(), '')).status,409);
  await save({ ...enabled, enabled:false }); assert.equal((await api('/lmp/applications','POST',form(), '')).status,409);
  const account = await api('/users','POST',{username:tag.toLowerCase(),password:tag,full_name:tag,role:'VIEWER',status:'ACTIVE'}); assert.equal(account.status,201); viewerId=account.data.id;
  const viewer = (await api('/auth/login','POST',{username:tag.toLowerCase(),password:tag},'')).data.access_token;
  for(const path of ['/lmp/settings','/lmp/applications',`/lmp/applications/${id}`,`/lmp/applications/${id}/document`]) assert.equal((await api(path,'GET',undefined,viewer)).status,403);
  assert.equal((await api('/lmp/settings','PUT',{config:enabled,version:current.version},viewer)).status,403);
  if (process.env.LMP_BROWSER_CHECK === '1') {
    await save({ ...enabled, documentRequired:true });
    const {chromium} = createRequire(import.meta.url)('../.verify-cms/node_modules/playwright'); browser = await chromium.launch({channel:'msedge',headless:true});
    const context = await browser.newContext({viewport:{width:1440,height:1000}});
    const page = await context.newPage();
    await page.goto('http://localhost:3000/lmp',{waitUntil:'domcontentloaded'}); await page.getByRole('heading',{name:'Lomba Mata Pelajaran.'}).waitFor();
    assert((await page.locator('main').innerText()).includes('35.000'));
    await page.screenshot({path:'.verify-cms/lmp-desktop.png',fullPage:true,animations:'disabled'});
    await page.setViewportSize({width:390,height:844}); assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:'.verify-cms/lmp-mobile.png',fullPage:true,animations:'disabled'});
    await page.goto('http://localhost:3000/lmp/daftar',{waitUntil:'domcontentloaded'});
    await page.locator('[name=studentName]').fill(tag+'-browser'); await page.locator('[name=previousSchool]').fill('SD Pengujian');
    await page.locator('[name=grade]').selectOption('6'); await page.locator('[name=subjects]').selectOption('Bahasa Inggris');
    await page.locator('[name=contactName]').fill('Pendamping Uji'); await page.locator('[name=contactPhone]').fill('081234567890');
    await page.locator('[name=document]').setInputFiles({name:'berkas.pdf',mimeType:'application/pdf',buffer:Buffer.from(pdf.body)}); await page.locator('[name=consent]').check();
    await page.screenshot({path:'.verify-cms/lmp-form-mobile.png',fullPage:true,animations:'disabled'});
    await page.getByRole('button',{name:'Kirim pendaftaran LMP',exact:true}).click(); await page.getByRole('heading',{name:'Data peserta telah diterima'}).waitFor();
    assert.ok((await page.getByRole('status').innerText()).includes(tag+'-browser'));
    await page.getByRole('heading',{name:'Ringkasan data peserta',exact:true}).waitFor();
    await page.getByRole('heading',{name:'Jangan lupa screenshot halaman ini',exact:true}).waitFor();
    assert.ok((await page.locator('dl').allTextContents()).join(' ').includes('Bahasa Inggris'));
    assert.ok((await page.locator('dl').allTextContents()).join(' ').includes('PDF berhasil diunggah'));
    assert.equal(await page.getByRole('link',{name:'Gabung grup WhatsApp LMP',exact:true}).getAttribute('href'),enabled.whatsappGroupUrl);
    const receipt = page.locator('section[aria-labelledby="lmp-receipt-title"]');
    assert.ok(!(await receipt.innerText()).includes('Gelombang'));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:'.verify-cms/lmp-receipt-mobile.png',fullPage:true,animations:'disabled'});
    await page.setViewportSize({width:1440,height:1000});
    await page.screenshot({path:'.verify-cms/lmp-receipt-desktop.png',fullPage:true,animations:'disabled'});
    await browserSignIn(page);
    await page.setViewportSize({width:1600,height:1000});
    await page.goto('http://localhost:3002/lmp/pendaftar',{waitUntil:'domcontentloaded'});
    await page.getByRole('button',{name:'Detail '+tag+'-browser',exact:true}).waitFor();
    assert((await page.locator('tbody tr').first().innerText()).includes(tag+'-browser'));
    await page.screenshot({path:'.verify-cms/lmp-admin-list.png',fullPage:true,animations:'disabled'});
    await page.getByRole('button',{name:'Detail '+tag+'-browser',exact:true}).click(); await page.getByRole('heading',{name:'Detail pendaftaran'}).waitFor();
    const download = page.waitForEvent('download'); await page.getByRole('button',{name:'Unduh berkas PDF',exact:true}).click(); assert.match((await download).suggestedFilename(),/^LMP-.*\.pdf$/);
    await page.getByRole('combobox',{name:'Status pembayaran',exact:true}).selectOption('Lunas'); await page.getByRole('button',{name:'Simpan status',exact:true}).click(); await page.getByText('Status peserta LMP disimpan.',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Tutup detail',exact:true}).click();
    await page.goto('http://localhost:3002/lmp/informasi',{waitUntil:'domcontentloaded'}); await page.getByLabel('Judul lomba',{exact:true}).waitFor();
    await page.getByLabel('Deskripsi pembuka',{exact:true}).fill(tag+' deskripsi'); await page.getByRole('button',{name:'Simpan pengaturan LMP',exact:true}).click(); await page.getByText('Informasi LMP berhasil diperbarui di website.',{exact:true}).waitFor();
    await page.screenshot({path:'.verify-cms/lmp-admin-settings.png',fullPage:true,animations:'disabled'});
    await page.setViewportSize({width:390,height:844}); assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.goto('http://localhost:3000/lmp',{waitUntil:'domcontentloaded'}); await page.getByText(tag+' deskripsi',{exact:true}).waitFor();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  console.log('PASS: LMP dates/WIB, validation, single subject, PDF privacy/limits, concurrent idempotency, status concurrency, snapshots, role privacy' + (browser ? ', mobile/desktop, real public submit, admin list/download/payment and live settings.' : '.'));
} finally {
  if(browser) await browser.close();
  if(original && token) { current=(await api('/lmp/settings')).data; await save(original.config); }
  if(viewerId) assert.equal((await api('/users/'+viewerId,'DELETE')).status,200);
  const settings = JSON.parse(readFileSync(new URL('Backend/Cendekia.WebAPI/appsettings.Development.json',root),'utf8'));
  const parts = Object.fromEntries((process.env.ConnectionStrings__DefaultConnection || settings.ConnectionStrings.DefaultConnection).split(';').filter(Boolean).map(s=>{const i=s.indexOf('=');return[s.slice(0,i),s.slice(i+1)]}));
  assert.equal(parts.Database,'cendekia_cms'); assert(/^LMP-TEST-\d+$/.test(tag));
  const result = spawnSync(process.env.MYSQL_EXE || 'C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe', [`--host=${parts.Server}`,`--port=${parts.Port}`,`--user=${parts['User ID']}`,'--default-character-set=utf8mb4'],{env:{...process.env,MYSQL_PWD:parts.Password},input:`USE cendekia_cms; DELETE FROM lmp_applications WHERE StudentName IN ('${tag}','${tag}-browser');`,encoding:'utf8',windowsHide:true});
  assert.equal(result.status,0,'Failed to remove synthetic test records.');
}
