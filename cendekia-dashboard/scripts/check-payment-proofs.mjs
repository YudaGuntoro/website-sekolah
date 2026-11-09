import {spmbProfileFields} from './lib/spmb-profile-fixture.mjs';
// Local integration: validates file types, maximum sizes, privacy, and old registrations.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { randomUUID, createHash } from 'node:crypto';
import { mysql } from './lib/local-mysql.mjs';
const base=process.env.CMS_API_URL || 'http://localhost:5243';
const website=process.env.WEBSITE_URL || 'http://localhost:3000';
const tag='PAYMENT-TEST-'+Date.now();
const ids={spmb:[],lmp:[]}; let token; const originals={};
async function api(path,method='GET',body){const r=await fetch(base+'/api'+path,{method,headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});const payload=await r.json();assert.equal(r.status,200,JSON.stringify(payload));return payload.data;}
function file(type,large=false){
 if(type==='png')return {name:'transfer.png',mime:'image/png',bytes:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAB1JREFUOI1j/P///38GCgATJZpHDRg1YNSAwWQAAGvKBByn4XVTAAAAAElFTkSuQmCC','base64')};
 if(type==='jpg')return {name:'transfer.jpg',mime:'image/jpeg',bytes:Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAQABADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpgA//Z','base64')};
 return {name:'transfer.pdf',mime:'application/pdf',bytes:Buffer.from('%PDF-1.4\n'+(large?'x'.repeat(1048576-15):'Payment test')+'\n%%EOF')};
}
async function submit(mod,settings,proof,document,expectedStatus=200){
 const fields={submissionKey:randomUUID(),studentName:tag,previousSchool:'Sekolah Uji Pembayaran',transferAccountName:'Pemilik Rekening Uji',consent:true,...(mod==='spmb'?{...spmbProfileFields(),scheduleVersion:settings.version,birthPlace:'Kota Uji',birthDate:'2014-01-01',gender:'Perempuan',targetGrade:'VII',guardianName:'Wali Uji',guardianPhone:'081234567890',address:'Alamat Uji'}:{settingsVersion:settings.version,grade:5,subjects:'Matematika',contactName:'Wali Uji',contactPhone:'081234567890'})};
 const form=new FormData();for(const [k,v]of Object.entries(fields))form.set(k,String(v));
 form.set('paymentProof',new Blob([proof.bytes],{type:proof.mime}),proof.name);
 if(mod==='spmb' && !document)document=file('pdf');
 if(document)form.set('document',new Blob([document.bytes],{type:document.mime}),document.name);
 const response=await fetch(website+'/api/'+mod,{method:'POST',body:form});const result=await response.json();assert.equal(response.status,expectedStatus,JSON.stringify(result));if(expectedStatus!==200)return;
 assert.equal(result.data.transferAccountName,fields.transferAccountName);assert.equal(result.data.hasPaymentProof,true);
 const list=await api('/'+mod+'/applications?search='+tag);const row=list.items.find(x=>x.registrationNumber===result.data.registrationNumber);assert.ok(row);ids[mod].push(row.id);
 const url=base+'/api/'+mod+'/applications/'+row.id+'/payment-proof';assert.equal((await fetch(url)).status,401);
 const download=await fetch(url,{headers:{Authorization:'Bearer '+token}});assert.equal(download.status,200);assert.equal(download.headers.get('content-type'),proof.mime);assert.match(download.headers.get('content-disposition'),/attachment/);assert.equal(download.headers.get('cache-control'),'no-store');assert.equal(download.headers.get('x-content-type-options'),'nosniff');
 const stored=Buffer.from(await download.arrayBuffer());assert.ok(stored.length<=proof.bytes.length,'Stored proof must never be larger');
 if(proof.name==='photo-large.jpg')assert.ok(stored.length<proof.bytes.length*0.7,'Large photo must be compressed before storage');
 if(proof.mime==='application/pdf')assert.equal(createHash('sha256').update(stored).digest('hex'),createHash('sha256').update(proof.bytes).digest('hex'));
}
try{
 const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:process.env.CMS_ADMIN_PASSWORD || 'admin123'})});assert.equal(login.status,200);token=(await login.json()).data.access_token;
 for(const mod of ['spmb','lmp']){
  originals[mod]=await api('/'+mod+'/settings');const today=originals[mod].today;
  const enabled=mod==='spmb'?{...originals[mod],enabled:true,waves:[1,2,3,4].map(number=>({number,startDate:number===1?today:null,endDate:number===1?today:null,whatsappGroupUrl:originals[mod].waves.find(w=>w.number===number)?.whatsappGroupUrl || ''}))}:{...originals[mod],config:{...originals[mod].config,enabled:true,registrationStart:today,registrationEnd:today,documentRequired:false}};
  const settings=await api('/'+mod+'/settings','PUT',enabled);
  for(const type of ['png','jpg'])await submit(mod,settings,file(type));
  await submit(mod,settings,{name:'photo-large.jpg',mime:'image/jpeg',bytes:readFileSync('.verify-cms/file-optimizer/proof-large.jpg')});
  const large=file('pdf',true);assert.equal(large.bytes.length,1048576);
  const document=mod==='lmp'?{...large,bytes:Buffer.from('%PDF-1.4\n'+'x'.repeat(2097152-15)+'\n%%EOF')}:undefined;
  await submit(mod,settings,large,document);
  await submit(mod,settings,{...large,bytes:Buffer.concat([large.bytes,Buffer.from("x")])},undefined,400);
  // Legacy records remain readable even without the optional relation.
  const id=ids[mod][0];const removed=mysql(`DELETE FROM ${mod}_payment_proofs WHERE ApplicationId=${id};`);assert.equal(removed.status,0,removed.stderr);
  const old=await api('/'+mod+'/applications/'+id);assert.equal(old.hasPaymentProof,false);assert.equal(old.transferAccountName,null);
  assert.equal((await fetch(base+'/api/'+mod+'/applications/'+id+'/payment-proof',{headers:{Authorization:'Bearer '+token}})).status,404);
 }
 console.log('PASS: PNG/JPEG/PDF, exact 1 MB proofs, LMP two-file 3 MB public submission, large photo compression, protected downloads and PDF byte integrity, and legacy records.');
}finally{
 for(const mod of Object.keys(originals)){const current=await api('/'+mod+'/settings');await api('/'+mod+'/settings','PUT',{...originals[mod],version:current.version});}
 for(const mod of ['spmb','lmp']){const result=mysql(`DELETE FROM ${mod}_applications WHERE StudentName='${tag}'; SELECT COUNT(*) FROM ${mod}_applications WHERE StudentName='${tag}';`);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout.trim(),'0');}
}
