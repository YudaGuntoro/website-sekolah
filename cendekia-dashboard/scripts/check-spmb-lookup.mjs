// Local integration test: inserts a synthetic application and removes it in finally.
import assert from 'node:assert/strict';
import {randomUUID,randomInt} from 'node:crypto';
import {mysql} from './lib/local-mysql.mjs';
if(process.env.SPMB_ALLOW_TEST_SETUP!=='1')throw Error('Run locally with SPMB_ALLOW_TEST_SETUP=1.');
const base=process.env.CMS_API_URL||'http://localhost:5243';
const web=process.env.SCHOOL_WEBSITE_URL||'http://localhost:3000';
const key=randomUUID(),name='Lookup Murid '+key.slice(0,8),nisn='8'+String(randomInt(100000000,999999999));
const registrationNumber='CHECK-'+key.slice(0,12);
function sql(query){const r=mysql(query);assert.equal(r.status,0,r.stderr);return r.stdout.trim();}
const fixture={studentName:name,nisn};
async function check(input,expected=200,host=base){const r=await fetch(host+'/api/spmb/check-status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});const p=await r.json();assert.equal(r.status,expected,JSON.stringify(p));assert.ok(r.headers.get('cache-control')?.includes('no-store'));return p.data;}
try{
 sql(`INSERT INTO spmb_applications(SubmissionKey,RegistrationNumber,AcademicYear,WaveNumber,WaveRevision,StudentName,Nisn,BirthPlace,BirthDate,Gender,PreviousSchool,TargetGrade,GuardianName,GuardianPhone,GuardianEmail,Address,Status,SubmittedAt,UpdatedAt,Version) SELECT '${key}','${registrationNumber}',AcademicYear,WaveNumber,Revision,'${name}','${nisn}','Purwakarta','2014-01-01','Perempuan','SD Contoh','VII','Private guardian','081234567890','private@example.invalid','Private address','Baru',UTC_TIMESTAMP(6),UTC_TIMESTAMP(6),1 FROM spmb_wave_periods ORDER BY AcademicYear DESC,WaveNumber DESC LIMIT 1;`);
 assert.equal(sql(`SELECT COUNT(*) FROM spmb_applications WHERE SubmissionKey='${key}'`),'1','Need an existing local historical wave period');
 const found=await check(fixture);assert.equal(found.found,true);assert.equal(found.registration.registrationNumber,registrationNumber);
 const allowed=['academicYear','nisn','paymentStatus','previousSchool','registrationNumber','status','studentName','submittedAt','targetGrade','waveNumber','whatsappGroupUrl'].sort();
 assert.deepEqual(Object.keys(found.registration).sort(),allowed,'Public lookup must not expose family, medical, payment or file data');
 assert.equal((await check({studentName:'  '+name.toUpperCase()+'  ',nisn})).found,true);
 assert.equal((await check({studentName:name.slice(0,-2),nisn})).found,false);
 assert.equal((await check({studentName:'Another Murid',nisn})).found,false);
 assert.equal((await check({studentName:name,nisn:'0000000000'})).found,false);
 await check({studentName:'',nisn},400);await check({studentName:name,nisn:'123'},400);await check({studentName:name,nisn:'abcdefghij'},400);
 for(const status of ['Diproses','Diterima','Ditolak']){sql(`UPDATE spmb_applications SET Status='${status}' WHERE SubmissionKey='${key}'`);assert.equal((await check(fixture)).registration.status,status);}
 const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:process.env.CMS_ADMIN_PASSWORD||'admin123'})});assert.equal(login.status,200);const token=(await login.json()).data.access_token;
 const auth={Authorization:'Bearer '+token,'Content-Type':'application/json'};
 const id=Number(sql(`SELECT Id FROM spmb_applications WHERE SubmissionKey='${key}'`));
 async function admin(path,method='GET',body,expected=200){const r=await fetch(base+'/api/spmb/applications'+path,{method,headers:auth,body:body?JSON.stringify(body):undefined});const p=await r.json();assert.equal(r.status,expected,JSON.stringify(p));return p.data;}
 let detail=await admin('/'+id);assert.equal(detail.paymentStatus,'Belum bayar');
 const version=detail.version;
 let updated=await admin('/'+id+'/status','PUT',{status:detail.status,paymentStatus:'Lunas',version});assert.equal(updated.status,'Ditolak');assert.equal(updated.paymentStatus,'Lunas');
 await admin('/'+id+'/status','PUT',{status:detail.status,paymentStatus:'Belum bayar',version},409);
 await admin('/'+id+'/status','PUT',{status:detail.status,paymentStatus:'Invalid',version:updated.version},400);
 updated=await admin('/'+id+'/status','PUT',{status:'Diproses',version:updated.version});assert.equal(updated.paymentStatus,'Lunas','Old status-only clients must preserve payment status');
 assert.equal((await check(fixture)).registration.paymentStatus,'Lunas');
 assert.equal((await admin('?'+new URLSearchParams({search:name,payment:'Lunas'}))).total,1);
 assert.equal((await admin('?'+new URLSearchParams({search:name,payment:'Belum bayar'}))).total,0);
 assert.equal((await fetch(base+'/api/spmb/applications/'+id+'/status',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'Baru',paymentStatus:'Lunas',version:updated.version})})).status,401);
 const invalidPayment=mysql(`UPDATE spmb_applications SET PaymentStatus='Invalid' WHERE SubmissionKey='${key}'`);assert.notEqual(invalidPayment.status,0,'DB must reject invalid payment status');
 console.log('PASS independent staff payment status, filters, optimistic concurrency, validation, authorization, backward compatibility and DB constraint');
 assert.equal((await check(fixture,200,web)).found,true);
 await check({studentName:name,nisn:'123'},400,web);
 await check({studentName:'a'.repeat(5000),nisn},400,web);
 if(process.env.CMS_BROWSER_CHECK==='1'){
  const {chromium}=await import('../.verify-cms/node_modules/playwright/index.mjs');const b=await chromium.launch({channel:'msedge',headless:true});
  try{
   const {browserSignIn}=await import('./lib/browser-sign-in.mjs');const adminContext=await b.newContext({viewport:{width:1440,height:1000}});adminContext.setDefaultNavigationTimeout(60000);await browserSignIn(adminContext);const dashboard=await adminContext.newPage();await dashboard.goto('http://localhost:3002/spmb/pendaftar',{waitUntil:'domcontentloaded'});await dashboard.getByLabel('Cari pendaftar',{exact:true}).fill(name);await dashboard.getByRole('button',{name:'Detail '+name,exact:true}).click();const modal=dashboard.locator('dialog[open]');assert.equal(await modal.getByLabel('Status pembayaran',{exact:true}).inputValue(),'Lunas');
   await modal.getByLabel('Status pembayaran',{exact:true}).selectOption('Belum bayar');const saved=dashboard.waitForResponse(r=>r.url().endsWith('/api/spmb/applications/'+id+'/status')&&r.request().method()==='PUT');await modal.getByRole('button',{name:'Simpan status',exact:true}).click();const response=await saved;assert.equal(response.status(),200);const savedData=(await response.json()).data;assert.equal(savedData.paymentStatus,'Belum bayar');assert.equal(savedData.status,'Diproses');await modal.getByRole('button',{name:'Tutup',exact:true}).click();await dashboard.getByLabel('Filter pembayaran',{exact:true}).selectOption('Belum bayar');await dashboard.getByRole('button',{name:'Detail '+name,exact:true}).waitFor();assert.ok(await dashboard.getByRole('columnheader',{name:'Pembayaran',exact:true}).isVisible());await dashboard.screenshot({path:'.verify-cms/spmb-payment-status-dashboard.png',fullPage:true});await adminContext.close();console.log('PASS dashboard payment column/filter and manual payment edit with unchanged admission status');
   const page=await b.newPage({viewport:{width:1280,height:900}});await page.goto(web+'/spmb');await page.getByRole('link',{name:'Cek Status Pendaftaran',exact:true}).first().click();await page.waitForURL('**/spmb/cek-status');
   await page.locator('input[name=studentName]').fill(name);await page.locator('input[name=nisn]').fill(nisn);await page.getByRole('button',{name:'Cek Status Pendaftaran',exact:true}).click();await page.getByRole('heading',{name:'Calon murid sudah terdaftar'}).waitFor();
   assert.ok(await page.getByText(registrationNumber,{exact:true}).isVisible());await page.screenshot({path:'.verify-cms/spmb-lookup-result.png',fullPage:true});await page.evaluate(()=>{window.printCount=0;window.print=()=>window.printCount++;});await page.getByRole('button',{name:'Cetak / Simpan PDF'}).click();assert.equal(await page.evaluate(()=>window.printCount),1);
   await page.emulateMedia({media:'print'});assert.equal(await page.locator('form').isVisible(),false);assert.ok(await page.getByText(registrationNumber,{exact:true}).isVisible());await page.pdf({path:'.verify-cms/spmb-lookup-proof.pdf',format:'A4'});await page.emulateMedia({media:'screen'});
   await page.setViewportSize({width:390,height:850});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.locator('input[name=studentName]').fill('Wrong Name');await page.getByRole('button',{name:'Cek Status Pendaftaran',exact:true}).click();await page.getByRole('heading',{name:'Data pendaftaran belum ditemukan'}).waitFor();assert.equal(await page.locator('.registration-receipt').count(),0);
   console.log('PASS browser navigation, matching result, print/PDF, mobile and clearing stale results');
  }finally{await b.close();}
 }
 console.log('PASS exact name/NISN lookup, case handling, status updates, private-field exclusion, invalid inputs and public proxy');
}finally{sql(`DELETE FROM spmb_applications WHERE SubmissionKey='${key}'`);}
