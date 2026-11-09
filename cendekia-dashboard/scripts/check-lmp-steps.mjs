import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mysql} from './lib/local-mysql.mjs';
const base=process.env.CMS_API_URL || 'http://localhost:5243';
const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:process.env.CMS_ADMIN_PASSWORD || 'admin123'})});assert.equal(login.status,200);const token=(await login.json()).data.access_token;
async function api(path,method='GET',body,expected=200){const r=await fetch(base+'/api/lmp/'+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const p=await r.json();assert.equal(r.status,expected,JSON.stringify(p));return p.data;}
const original=await api('settings');let current=original;
const step=(title)=>({title,description:'Penjelasan '+title,icon:'test',showPayment:false});
try{
 const custom=[step('Tahap uji LMP satu'),{...step('Tahap uji LMP dua'),showPayment:true}];
 current=await api('settings','PUT',{config:{...current.config,steps:custom},version:current.version});
 assert.deepEqual((await api('information')).config.steps,custom);
 await api('settings','PUT',{config:current.config,version:original.version},409);
 for(const steps of [[],[null],[step(' ')],[{...step('Salah ikon'),icon:'unknown'}],[{...step('Terlalu panjang'),description:'x'.repeat(3001)}],custom.map(x=>({...x,showPayment:true})),Array.from({length:21},(_,i)=>step('Tahap '+i))]){
  await api('settings','PUT',{config:{...current.config,steps},version:current.version},400);
 }
 const rerun=mysql(readFileSync('database/migrations/20261109_lmp_information_steps.sql','utf8'));assert.equal(rerun.status,0,rerun.stderr);assert.deepEqual((await api('settings')).config.steps,custom,'Migration rerun must preserve edits');
 const twenty=Array.from({length:20},(_,i)=>step('Tahap '+i));
 current=await api('settings','PUT',{config:{...current.config,steps:twenty},version:current.version});assert.equal(current.config.steps.length,20);
 current=await api('settings','PUT',{config:{...current.config,steps:[custom[1],custom[0]]},version:current.version});
 assert.deepEqual(current.config.steps,[custom[1],custom[0]]);
 const html=await(await fetch('http://localhost:3000/lmp')).text();assert.ok(html.includes(custom[1].title));assert.ok(html.indexOf(custom[1].title)<html.indexOf(custom[0].title));
 console.log('PASS: LMP steps persistence, order, add/delete up to 20, public rendering, validation, version conflicts and idempotent migration.');
}finally{
 const latest=await api('settings');await api('settings','PUT',{config:original.config,version:latest.version});assert.deepEqual((await api('settings')).config,original.config);
}
