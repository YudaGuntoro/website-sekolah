// Local-only synthetic participants; existing registrations are never modified.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mysql} from './lib/local-mysql.mjs';
if(process.env.LMP_ALLOW_TEST_SETUP!=='1')throw Error('Run locally with LMP_ALLOW_TEST_SETUP=1.');
const base=process.env.CMS_API_URL||'http://localhost:5243',web=process.env.SCHOOL_WEBSITE_URL||'http://localhost:3000';
const tag=randomUUID().slice(0,8),name='Peserta Lookup '+tag,keys=[randomUUID(),randomUUID(),randomUUID()];
const numbers=['LMP-CHECK-A-'+tag,'LMP-CHECK-B-'+tag,'LMP-CHECK-C-'+tag], nisn='0123456789';
function sql(query){const r=mysql(query);assert.equal(r.status,0,r.stderr);return r.stdout.trim();}
async function check(studentName,expected=200,host=base,lookupNisn=nisn){const r=await fetch(host+'/api/lmp/check-status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentName,nisn:lookupNisn})});const p=await r.json();assert.equal(r.status,expected,JSON.stringify(p));assert.ok(r.headers.get('cache-control')?.includes('no-store'));return p.data;}
try{
 for(let i=0;i<3;i++)sql(`INSERT INTO lmp_applications(SubmissionKey,RegistrationNumber,EventId,SubjectId,StudentName,Nisn,PreviousSchool,Grade,ContactName,ContactPhone,Status,PaymentStatus,SubmittedAt,Version) SELECT '${keys[i]}','${numbers[i]}',e.Id,s.Id,'${name}',${i===2?'NULL':"'"+nisn+"'"},'SD Contoh ${i+1}',${i===0?5:6},'Private Teacher','081234567890','Baru','Belum bayar',UTC_TIMESTAMP(6),1 FROM lmp_events e CROSS JOIN lmp_subjects s ORDER BY e.Id DESC,s.Id LIMIT 1;`);
 assert.equal(sql(`SELECT COUNT(*) FROM lmp_applications WHERE SubmissionKey IN ('${keys.join("','")}')`),'3','Need existing local event and subject fixtures');
 const result=await check(name);assert.equal(result.found,true);assert.equal(result.registrations.length,2);assert.equal(result.registrations[0].registrationNumber,numbers[1]);
 const allowed=['registrationNumber','studentName','nisn','previousSchool','grade','subjects','eventTitle','competitionDate','submittedAt','status','paymentStatus','whatsappGroupUrl'].sort();
 for(const row of result.registrations)assert.deepEqual(Object.keys(row).sort(),allowed,'No contact, account, document, file bytes or internal IDs in public result');
 assert.equal((await check(' '+name.toUpperCase()+' ')).registrations.length,2);
 assert.equal((await check(name.slice(0,-2))).found,false);assert.equal((await check('Nonexistent '+tag)).registrations.length,0);
 assert.equal((await fetch(base+'/api/lmp/check-status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentName:name})})).status,400);
 await check(name,400,base,'');await check(name,400,base,'123456789');await check(name,400,base,'012345678a');
 assert.equal((await check(name,200,base,'1123456789')).found,false);
 await check('',400);await check('a',400);await check('a'.repeat(151),400);
 sql(`UPDATE lmp_applications SET Status='Terverifikasi',PaymentStatus='Lunas' WHERE SubmissionKey='${keys[0]}'`);
 const updated=(await check(name)).registrations.find(r=>r.registrationNumber===numbers[0]);assert.equal(updated.status,'Terverifikasi');assert.equal(updated.paymentStatus,'Lunas');
 const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:process.env.CMS_ADMIN_PASSWORD||'admin123'})});assert.equal(login.status,200);const token=(await login.json()).data.access_token;
 const id=Number(sql(`SELECT Id FROM lmp_applications WHERE SubmissionKey='${keys[2]}'`));const headers={'Content-Type':'application/json',Authorization:'Bearer '+token};
 const detail=(await (await fetch(base+'/api/lmp/applications/'+id,{headers})).json()).data;assert.equal(detail.nisn,null);
 const status={status:detail.status,paymentStatus:detail.paymentStatus,version:detail.version};
 assert.equal((await fetch(base+'/api/lmp/applications/'+id+'/status',{method:'PUT',headers,body:JSON.stringify({...status,nisn:'bad'})})).status,400);
 assert.equal((await fetch(base+'/api/lmp/applications/'+id+'/status',{method:'PUT',headers,body:JSON.stringify({...status,nisn:'1123456789'})})).status,200);
 assert.equal((await fetch(base+'/api/lmp/applications/'+id+'/status',{method:'PUT',headers,body:JSON.stringify({...status,nisn:nisn})})).status,409);
 assert.equal((await check(name,200,base,'1123456789')).registrations[0].registrationNumber,numbers[2]);
 assert.equal((await check(name,200,web)).registrations.length,2);await check('a'.repeat(5000),400,web);
 if(process.env.CMS_BROWSER_CHECK==='1'){
  const {chromium}=await import('../.verify-cms/node_modules/playwright/index.mjs');const browser=await chromium.launch({channel:'msedge',headless:true});
  try{const page=await browser.newPage({viewport:{width:1280,height:900}});await page.goto(web+'/lmp',{waitUntil:'domcontentloaded'});await page.getByRole('link',{name:'Cek Status Pendaftaran',exact:true}).first().click();await page.waitForURL('**/lmp/cek-status');assert.equal(await page.locator('input[name=nisn]').count(),1);await page.locator('input[name=nisn]').fill(nisn);
   await page.locator('input[name=studentName]').fill(name);const submit=page.getByRole('button',{name:'Cek Status Pendaftaran',exact:true});await submit.click();await page.getByRole('heading',{name:'Pilih data pendaftaran peserta'}).waitFor();assert.equal(await page.locator('.registration-receipt').count(),0);
   await page.getByRole('button').filter({hasText:numbers[0]}).click();const receipt=page.locator('.registration-receipt');await receipt.waitFor();assert.ok((await receipt.innerText()).includes('SD Contoh 1'));assert.ok((await receipt.innerText()).includes('Terverifikasi'));assert.ok((await receipt.innerText()).includes('Lunas'));assert.ok(await receipt.getByRole('complementary',{name:'Informasi grup WhatsApp LMP'}).isVisible());
   await page.evaluate(()=>{window.printed=0;window.print=()=>window.printed++;});await page.getByRole('button',{name:'Cetak / Simpan PDF'}).click();assert.equal(await page.evaluate(()=>window.printed),1);await page.emulateMedia({media:'print'});assert.equal(await page.locator('form').isVisible(),false);assert.equal(await page.getByRole('heading',{name:'Pilih data pendaftaran peserta'}).isVisible(),false);assert.ok(await receipt.getByText(numbers[0],{exact:true}).isVisible());await page.pdf({path:'.verify-cms/lmp-lookup-proof.pdf',format:'A4'});await page.emulateMedia({media:'screen'});
   await page.setViewportSize({width:390,height:850});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'.verify-cms/lmp-lookup-mobile.png',fullPage:true});
   await page.getByRole('button').filter({hasText:numbers[1]}).click();await receipt.getByText(numbers[1],{exact:true}).waitFor();assert.ok((await receipt.innerText()).includes('SD Contoh 2'));
   await page.locator('input[name=studentName]').fill('Nonexistent '+tag);await submit.click();await page.getByRole('heading',{name:'Data pendaftaran belum ditemukan'}).waitFor();assert.equal(await page.locator('.registration-receipt').count(),0);
   // With only one registration, show the result directly.
   sql(`DELETE FROM lmp_applications WHERE SubmissionKey='${keys[1]}'`);await page.locator('input[name=studentName]').fill(name);await submit.click();await receipt.waitFor();assert.equal(await page.getByRole('heading',{name:'Pilih data pendaftaran peserta'}).count(),0);
   console.log('PASS browser name + NISN search, multiple-registration selection, current statuses, WhatsApp, printing/PDF, mobile, stale-result clearing and single-result flow');
  }finally{await browser.close();}
 }
 console.log('PASS full-name + NISN LMP lookup, historical NULL excluded, bounded public fields, exact match/case handling, status refresh and public proxy');
}finally{sql(`DELETE FROM lmp_applications WHERE SubmissionKey IN ('${keys.join("','")}')`);}
