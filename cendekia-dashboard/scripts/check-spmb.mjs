// Local integration test. Temporarily changes the schedule, restores it in finally,
// and writes an exact-key cleanup SQL file for synthetic applicants.
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { mysql } from './lib/local-mysql.mjs';
if (process.env.SPMB_ALLOW_TEST_SETUP !== '1') throw new Error('Run only on a local test checkout with SPMB_ALLOW_TEST_SETUP=1. This test temporarily changes the registration schedule.');
const base = process.env.CMS_API_URL || 'http://localhost:5243';
const tag = 'SPMB-TEST-' + Date.now().toString(36);
let token = '', original, current, viewerId, operatorId;
const keys = [];
let firstWaveBody;
let otherYear, originalOtherGroups;
const recordIds = [];
async function request(path, method = 'GET', body, access = token) {
  const response = await fetch(base + '/api/spmb' + path, { method, headers: { 'Content-Type': 'application/json', ...(access ? { Authorization: 'Bearer ' + access } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  return { status: response.status, payload: text ? JSON.parse(text) : null };
}
async function account(path, method, body, access = token) {
  const r = await fetch(base + '/api/' + path, { method, headers: { 'Content-Type': 'application/json', ...(access ? { Authorization: 'Bearer ' + access } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: r.status, payload: await r.json() };
}
const day = offset => new Date(Date.parse(original.today + 'T12:00:00Z') + offset * 86400000).toISOString().slice(0, 10);
const configFor = target => ({ academicYear: original.academicYear, enabled: true, version: current.version, waves: [1,2,3,4].map(number => ({ number, startDate: day((number - target) * 10), endDate: day((number - target) * 10), whatsappGroupUrl: `https://chat.whatsapp.com/TestWave${number}` })) });
async function configure(value) { const r = await request('/settings', 'PUT', { ...value, version: current.version }); assert.equal(r.status, 200, JSON.stringify(r.payload)); current = r.payload.data; }
function submission(overrides = {}) {
  const key = randomUUID(); keys.push(key);
  return { submissionKey: key, scheduleVersion: current.version, studentName: tag, nisn: null, birthPlace: 'Kota Uji', birthDate: '2014-01-15', gender: 'Perempuan', previousSchool: 'Sekolah Uji', targetGrade: 'VII', guardianName: 'Wali Uji', guardianPhone: '08000000000', guardianEmail: 'spmb-test@example.invalid', address: 'Alamat pengujian lokal', consent: true, ...overrides };
}
try {
  const login = await account('auth/login', 'POST', { username: 'admin', password: process.env.CMS_ADMIN_PASSWORD || 'admin123' }, '');
  assert.equal(login.status, 200); token = login.payload.data.access_token;
  original = (await request('/settings')).payload.data; current = original;
  otherYear = original.academicYear === '2098/2099' ? '2097/2098' : '2098/2099';
  const groupSnapshot = mysql(`SELECT JSON_OBJECT('number', WaveNumber, 'url', WhatsappGroupUrl) FROM spmb_wave_groups WHERE AcademicYear='${otherYear}';`);
  assert.equal(groupSnapshot.status, 0, groupSnapshot.stderr);
  originalOtherGroups = groupSnapshot.stdout.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
  assert.equal((await request('/applications', 'GET', undefined, '')).status, 401);
  assert.equal((await request('/settings', 'GET', undefined, '')).status, 401);
  const publicSchedule = await request('/schedule', 'GET', undefined, ''); assert.equal(publicSchedule.status, 200);
  assert.equal(publicSchedule.payload.data.waves.length, 4);
  for (const url of ['http://chat.whatsapp.com/Code', 'https://example.com/Code', 'https://chat.whatsapp.com.evil.test/Code', 'javascript:alert(1)', 'https://chat.whatsapp.com/']) {
    const invalid = configFor(1); invalid.waves[0].whatsappGroupUrl = url;
    assert.equal((await request('/settings', 'PUT', invalid)).status, 400, 'Invalid group invitation must be rejected');
  }
  const overlap = configFor(1); overlap.waves[1].startDate = overlap.waves[0].endDate;
  assert.equal((await request('/settings', 'PUT', overlap)).status, 400, 'Inclusive date ranges must not overlap');
  const reversed = configFor(1); reversed.waves[0].endDate = day(-1);
  assert.equal((await request('/settings', 'PUT', reversed)).status, 400);
  assert.equal((await request('/settings', 'PUT', { ...configFor(1), waves: configFor(1).waves.slice(0, 3) })).status, 400);
  const empty = { ...configFor(1), waves: [1,2,3,4].map(number => ({ number, startDate: null, endDate: null })) };
  assert.equal((await request('/settings', 'PUT', empty)).status, 400, 'Opening requires at least one date range');
  await configure({ ...empty, enabled: false });
  assert.equal(current.activeWave, null);
  const partial = configFor(1); partial.waves[0].endDate = null;
  assert.equal((await request('/settings', 'PUT', partial)).status, 400, 'Partial date ranges must be rejected');
  const sharedLink = configFor(1); sharedLink.waves[0].whatsappGroupUrl = '  https://chat.whatsapp.com/TestWave1?mode=gi_t  ';
  sharedLink.waves[0].enabled = false; // Obsolete client flags cannot disable a dated wave.
  await configure(sharedLink);
  assert.equal(current.activeWave, 1);
  assert.equal(current.waves[0].whatsappGroupUrl, 'https://chat.whatsapp.com/TestWave1?mode=gi_t');
  await configure({ ...configFor(1), enabled: false });
  assert.equal((await request('/applications', 'POST', submission(), '')).status, 409, 'Disabled schedule must reject direct API submissions');
  for (const number of [1,2,3,4]) {
    await configure(configFor(number));
    const schedule = await request('/schedule', 'GET', undefined, ''); assert.equal(schedule.payload.data.activeWave, number);
    const body = submission({ waveNumber: number === 4 ? 1 : 4, studentName: tag + '-wave-' + number });
    if (number === 1) firstWaveBody = body;
    const [first, repeated] = await Promise.all([request('/applications', 'POST', body, ''), request('/applications', 'POST', body, '')]);
    assert.equal(first.status, 200, JSON.stringify(first.payload)); assert.equal(repeated.status, 200);
    assert.equal(first.payload.data.waveNumber, number, 'Wave must come from server schedule, not client input');
    assert.equal(first.payload.data.registrationNumber, repeated.payload.data.registrationNumber, 'Concurrent retries must return one receipt');
    assert.equal(first.payload.data.studentName, body.studentName);
    assert.equal(first.payload.data.guardianName, body.guardianName);
    assert.equal(first.payload.data.previousSchool, body.previousSchool);
    assert.equal(first.payload.data.birthDate, body.birthDate);
    assert.equal(first.payload.data.address, body.address);
    assert.equal(first.payload.data.guardianPhone, body.guardianPhone);
    assert.equal(repeated.payload.data.studentName, body.studentName);
    assert.equal(first.payload.data.whatsappGroupUrl, `https://chat.whatsapp.com/TestWave${number}`);
    assert.equal(repeated.payload.data.whatsappGroupUrl, first.payload.data.whatsappGroupUrl);
    assert.ok(schedule.payload.data.waves.every(w => !w.whatsappGroupUrl), 'Group invitations stay out of the public schedule');
    const list = await request('/applications?search=' + encodeURIComponent(tag));
    assert.equal(list.payload.data.total, number, 'Retries must not create duplicate applicants');
    const row = list.payload.data.items.find(x => x.registrationNumber === first.payload.data.registrationNumber); assert.ok(row); recordIds.push(row.id);
  }
  await configure(configFor(2));
  const blank = configFor(2); blank.waves[1].whatsappGroupUrl = ''; await configure(blank);
  assert.equal((await request('/applications', 'POST', submission(), '')).payload.data.whatsappGroupUrl, '', 'An unset link produces no join invitation');
  await configure(configFor(2));
  const staleVersion = current.version;
  await configure(configFor(2));
  assert.equal((await request('/applications', 'POST', submission({ scheduleVersion: staleVersion }), '')).status, 409);
  assert.equal((await request('/settings', 'PUT', { ...configFor(2), version: staleVersion })).status, 409);
  const nisn = String(parseInt(createHash('sha256').update(tag).digest('hex').slice(0,8),16)).padStart(10,'0').slice(0,10);
  assert.equal((await request('/applications', 'POST', submission({ nisn, targetGrade: 'VIII' }), '')).status, 200);
  assert.equal((await request('/applications', 'POST', submission({ nisn, targetGrade: 'VIII' }), '')).status, 409);
  assert.equal((await request('/applications', 'POST', submission({ targetGrade: 'VIII' }), '')).status, 400);
  assert.equal((await request('/applications', 'POST', submission({ consent: false }), '')).status, 400);
  assert.equal((await request('/applications', 'POST', submission({ birthDate: day(1) }), '')).status, 400);
  const originalDetail = (await request('/applications/' + recordIds[0])).payload.data;
  await configure({ ...configFor(2), academicYear: otherYear, waves: [1,2,3,4].map(number => ({ number, startDate: day(number * 10), endDate: day(number * 10 + 2), whatsappGroupUrl: `https://chat.whatsapp.com/OtherYearWave${number}` })) });
  assert.equal((await request('/schedule', 'GET', undefined, '')).payload.data.activeWave, null);
  assert.equal((await request('/applications', 'POST', submission(), '')).status, 409, 'Outside all ranges must be closed');
  assert.equal((await request('/applications', 'POST', firstWaveBody, '')).payload.data.whatsappGroupUrl, 'https://chat.whatsapp.com/TestWave1', 'Retry after a year change must retain the original year group');
  const detail = (await request('/applications/' + recordIds[0])).payload.data;
  assert.equal(detail.academicYear, originalDetail.academicYear); assert.equal(detail.waveNumber, 1); assert.equal(detail.waveStartDate, originalDetail.waveStartDate);
  const changed = await request('/applications/' + recordIds[0] + '/status', 'PUT', { status: 'Diproses', version: detail.version }); assert.equal(changed.status, 200);
  assert.equal((await request('/applications/' + recordIds[0] + '/status', 'PUT', { status: 'Diterima', version: detail.version })).status, 409);
  for (const role of ['VIEWER','OPERATOR']) {
    const username = tag.toLowerCase() + '-' + role.toLowerCase();
    const created = await account('users','POST',{username,full_name:tag,password:'Test-local-'+tag,role,status:'ACTIVE'}); assert.equal(created.status,201);
    if(role==='VIEWER') viewerId=created.payload.data.id; else operatorId=created.payload.data.id;
    const loginRole = await account('auth/login','POST',{username,password:'Test-local-'+tag},''); const access=loginRole.payload.data.access_token;
    assert.equal((await request('/applications','GET',undefined,access)).status,role==='VIEWER'?403:200);
    assert.equal((await request('/settings','PUT',configFor(2),access)).status,403);
  }
  if (process.env.SPMB_BROWSER_CHECK === '1') {
    await configure(configFor(2));
    const { createRequire } = await import('node:module'); const require=createRequire(import.meta.url);
    const { chromium }=require('../.verify-cms/node_modules/playwright');
    const browser=await chromium.launch({channel:'msedge',headless:true});
    try {
      const page=await browser.newPage({viewport:{width:1440,height:1000}});
      const name=tag+'-browser';
      await page.goto('http://localhost:3000/spmb/daftar');
      await page.getByRole('button',{name:'Kirim pendaftaran'}).waitFor({state:'visible'});
      await page.locator('input[name=studentName]').fill(name);
      await page.locator('input[name=birthPlace]').fill('Kota Uji'); await page.getByRole('textbox',{name:'Tanggal lahir',exact:true}).fill('15/01/2014'); await page.getByRole('textbox',{name:'Tanggal lahir',exact:true}).press('Tab');
      await page.locator('select[name=gender]').selectOption('Perempuan'); await page.locator('input[name=previousSchool]').fill('Sekolah Uji');
      await page.locator('select[name=targetGrade]').selectOption('VII'); await page.locator('input[name=guardianName]').fill('Wali Uji');
      await page.locator('input[name=guardianPhone]').fill('08000000000'); await page.locator('textarea[name=address]').fill('Alamat pengujian lokal');
      await page.locator('input[name=consent]').check();
      page.on('request', r => { if(r.url().endsWith('/api/spmb') && r.method()==='POST') { const data=r.postDataJSON(); if(data.submissionKey) keys.push(data.submissionKey); } });
      await page.getByRole('button',{name:'Kirim pendaftaran'}).click();
      await page.getByRole('heading',{name:'Data pendaftaran telah diterima'}).waitFor();
      assert.ok((await page.getByRole('status').innerText()).includes(name));
      assert.ok((await page.getByRole('status').innerText()).includes('Gelombang 2'));
      await page.getByRole('heading', {name:'Ringkasan data pendaftar',exact:true}).waitFor();
      await page.getByRole('heading', {name:'Jangan lupa screenshot halaman ini',exact:true}).waitFor();
      assert.ok((await page.locator('dl').allTextContents()).join(' ').includes('Sekolah Uji'));
      assert.equal(await page.getByRole('link', {name: 'Gabung grup WhatsApp Gelombang 2', exact: true}).getAttribute('href'), 'https://chat.whatsapp.com/TestWave2');
      await page.screenshot({path:'.verify-cms/spmb-receipt.png',fullPage:true});
      await page.setViewportSize({width:390,height:844});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.screenshot({path:'.verify-cms/spmb-receipt-mobile.png',fullPage:true});
      await page.setViewportSize({width:1440,height:1000});
      await page.goto('http://localhost:3002/signin'); await page.getByLabel('Nama pengguna').fill('admin');await page.locator('input[name=password]').fill(process.env.CMS_ADMIN_PASSWORD || 'admin123');await page.getByRole('button',{name:'Masuk',exact:true}).click();await page.waitForURL('http://localhost:3002/');
      await page.goto('http://localhost:3002/spmb/pendaftar');await page.getByRole('button',{name:'Detail '+name,exact:true}).waitFor();await page.getByRole('button',{name:'Detail '+name,exact:true}).click();await page.getByRole('heading',{name:'Detail pendaftaran',exact:true}).waitFor();assert.ok((await page.locator('dialog').innerText()).includes('Gelombang 2'));await page.screenshot({path:'.verify-cms/spmb-applicant-detail.png',fullPage:true});await page.getByRole('button',{name:'Tutup detail',exact:true}).click();
      await page.goto('http://localhost:3002/spmb/gelombang');await page.getByRole('heading',{name:'Gelombang 4',exact:true}).waitFor();await page.screenshot({path:'.verify-cms/spmb-wave-settings.png',fullPage:true});
      for (const number of [1,2,3,4]) assert.equal(await page.getByRole('textbox', { name: `Tautan grup WhatsApp Gelombang ${number}`, exact: true }).inputValue(), `https://chat.whatsapp.com/TestWave${number}`);
      await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    } finally { await browser.close(); }
  }
  console.log('PASS: 4 waves, inclusive dates, no overlaps, closed/outside schedule rejection, server assignment, idempotent concurrent retry, NISN validation, immutable wave snapshots, status concurrency, role privacy, and website/dashboard flow.');
} finally {
  if(original && current && token) {
    const latest=await request('/settings');
    const restored=await request('/settings','PUT',{...original,version:latest.payload.data.version});
    if(restored.status!==200) throw new Error('Failed to restore original SPMB settings.');
  }
  if(viewerId) await account('users/'+viewerId,'DELETE');
  if(operatorId) await account('users/'+operatorId,'DELETE');
  if (originalOtherGroups) {
    const inserts = originalOtherGroups.map(g => `INSERT INTO spmb_wave_groups(AcademicYear,WaveNumber,WhatsappGroupUrl) VALUES('${otherYear}',${Number(g.number)},CONVERT(X'${Buffer.from(g.url).toString('hex')}' USING utf8mb4));`).join('\n');
    const restored = mysql(`START TRANSACTION; DELETE FROM spmb_wave_groups WHERE AcademicYear='${otherYear}'; ${inserts} COMMIT;`);
    assert.equal(restored.status, 0, restored.stderr);
  }
  mkdirSync('.verify-cms',{recursive:true});
  assert.ok(keys.every(k=>/^[a-f0-9-]{36}$/.test(k)));
  writeFileSync('.verify-cms/spmb-test-cleanup.sql', 'USE cendekia_cms;\n' + (keys.length ? `DELETE FROM spmb_applications WHERE SubmissionKey IN (${keys.map(k=>"'"+k+"'").join(',')}) AND StudentName LIKE 'SPMB-TEST-%';\n` : '') + 'SELECT COUNT(*) AS remaining_synthetic_applicants FROM spmb_applications WHERE StudentName LIKE \'SPMB-TEST-%\';\n');
}
