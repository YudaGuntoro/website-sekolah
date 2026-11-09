import {spmbProfileFields} from './lib/spmb-profile-fixture.mjs';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {mysql} from './lib/local-mysql.mjs';
const base=process.env.CMS_API_URL || 'http://localhost:5243',website=process.env.WEBSITE_URL || 'http://localhost:3000';
const tag='SPMB-DOC-'+Date.now();let token,original,current;const ids=[];
async function api(path,method='GET',data){const r=await fetch(base+'/api'+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});const p=await r.json();assert.equal(r.status,200,JSON.stringify(p));return p.data;}
function pdf(padding=0){
 const content='%'+ 'x'.repeat(padding)+'\nBT /F1 16 Tf 50 750 Td (Persyaratan SPMB - Contoh Dokumen) Tj ET\n';
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>','<< /Length '+Buffer.byteLength(content)+' >>\nstream\n'+content+'endstream','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
 let text='%PDF-1.4\n';const offsets=[0];for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(text));text+=(i+1)+' 0 obj\n'+objects[i]+'\nendobj\n';}const start=Buffer.byteLength(text);text+='xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF';return Buffer.from(text);
}
async function submit(bytes,name='persyaratan.pdf',expected=200){
 const form=new FormData();const fields={...spmbProfileFields(),submissionKey:randomUUID(),scheduleVersion:current.version,studentName:tag,previousSchool:'Sekolah Uji',birthPlace:'Purwakarta',birthDate:'2014-01-01',gender:'Perempuan',targetGrade:'VII',guardianName:'Wali Uji',guardianPhone:'081234567890',address:'Alamat Uji',transferAccountName:'Rekening Uji',consent:true};
 for(const[k,v]of Object.entries(fields))form.set(k,String(v));form.set('paymentProof',new Blob([pdf()],{type:'application/pdf'}),'transfer.pdf');if(bytes!==null)form.set('document',new Blob([bytes],{type:'application/pdf'}),name);
 const r=await fetch(website+'/api/spmb',{method:'POST',body:form});const body=await r.json();assert.equal(r.status,expected,JSON.stringify(body));if(expected!==200)return;
 assert.equal(body.data.hasDocument,true);const list=await api('/spmb/applications?search='+tag);const row=list.items.find(x=>x.registrationNumber===body.data.registrationNumber);assert.ok(row);ids.push(row.id);
 const detail=await api('/spmb/applications/'+row.id);assert.equal(detail.hasDocument,true);
 const url=base+'/api/spmb/applications/'+row.id+'/document';assert.equal((await fetch(url)).status,401);
 const download=await fetch(url,{headers:{Authorization:'Bearer '+token}});assert.equal(download.status,200);assert.equal(download.headers.get('content-type'),'application/pdf');assert.match(download.headers.get('content-disposition'),/attachment/);assert.equal(download.headers.get('cache-control'),'no-store');
 const decoded=Buffer.from(await download.arrayBuffer());assert.equal(createHash('sha256').update(decoded).digest('hex'),createHash('sha256').update(bytes).digest('hex'));
 const stored=mysql(`SELECT Compression,OCTET_LENGTH(Content),OriginalLength FROM spmb_application_documents WHERE ApplicationId=${row.id};`);assert.equal(stored.status,0,stored.stderr);const[compression,length,originalSize]=stored.stdout.trim().split(/\s+/);assert.equal(compression,'br');assert.equal(Number(originalSize),bytes.length);assert.ok(Number(length)<bytes.length);console.log('PDF storage:',bytes.length,'->',length,'bytes; downloaded PDF matches original.');
}
try{
 const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:process.env.CMS_ADMIN_PASSWORD || 'admin123'})});assert.equal(login.status,200);token=(await login.json()).data.access_token;
 original=await api('/spmb/settings');current=await api('/spmb/settings','PUT',{...original,enabled:true,waves:[1,2,3,4].map(number=>({number,startDate:number===1?original.today:null,endDate:number===1?original.today:null,whatsappGroupUrl:original.waves.find(x=>x.number===number)?.whatsappGroupUrl||''}))});
 await submit(pdf(10000));let padding=1048576-pdf().length;let maximum;for(let i=0;i<5;i++){maximum=pdf(padding);padding+=1048576-maximum.length;}assert.equal(maximum.length,1048576);await submit(maximum);
 await submit(Buffer.concat([maximum,Buffer.from('x')]),'persyaratan.pdf',400);await submit(null,'persyaratan.pdf',400);await submit(Buffer.from('not a pdf'),'persyaratan.pdf',400);await submit(pdf(),'persyaratan.exe',400);
 const removed=mysql(`DELETE FROM spmb_application_documents WHERE ApplicationId=${ids[0]};`);assert.equal(removed.status,0,removed.stderr);assert.equal((await api('/spmb/applications/'+ids[0])).hasDocument,false);assert.equal((await fetch(base+'/api/spmb/applications/'+ids[0]+'/document',{headers:{Authorization:'Bearer '+token}})).status,404);
 console.log('PASS: required SPMB PDF, exact 1 MB acceptance, oversize/type/missing rejection, compressed DB storage, authenticated lossless download and legacy records.');
}finally{
 if(original){const latest=await api('/spmb/settings');await api('/spmb/settings','PUT',{...original,version:latest.version});}
 const result=mysql(`DELETE FROM spmb_applications WHERE StudentName='${tag}'; SELECT COUNT(*) FROM spmb_applications WHERE StudentName='${tag}';`);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout.trim(),'0');
}
