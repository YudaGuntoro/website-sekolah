import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mysql} from './lib/local-mysql.mjs';
const base=process.env.CMS_API_URL || 'http://localhost:5243';
const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:process.env.CMS_ADMIN_PASSWORD || 'admin123'})});
assert.equal(login.status,200);const token=(await login.json()).data.access_token;
const headers={Authorization:'Bearer '+token};
const slug='image-check-'+Date.now();const ids=new Set();
function sql(query){const r=mysql(query);assert.equal(r.status,0,r.stderr);return r.stdout.trim();}
const baseline=sql('SELECT COUNT(*) FROM school_content_images');
const original=readFileSync('.verify-cms/file-optimizer/proof-large.jpg');
const transparent=readFileSync('.verify-cms/file-optimizer/transparent-photo.png');
const defaults={title:'Temporary image check',slug,category:'',summary:'',body:'',imageUrl:'',postUrl:'',status:'Draft',sortOrder:0,version:0};
async function save(data,file,expected=200,id){
 let body,requestHeaders={...headers};
 if(file){body=new FormData();for(const [k,v] of Object.entries(data))if(v!==null)body.set(k,String(v));body.set('photo',new Blob([file.bytes]),file.name);}
 else {body=JSON.stringify(data);requestHeaders['Content-Type']='application/json';}
 const r=await fetch(base+'/api/cms/content/berita'+(id?'/'+id:''),{method:id?'PUT':'POST',headers:requestHeaders,body});
 const p=await r.json();assert.equal(r.status,expected,JSON.stringify(p));if(r.ok&&p.data?.id)ids.add(p.data.id);return p.data;
}
async function image(url,status,auth=false,host=base){const r=await fetch(host+url,{headers:auth?headers:{}});assert.equal(r.status,status,await (r.ok?Promise.resolve(''):r.text()));return r;}
try{
 let row=await save(defaults,{name:'photo.jpg',bytes:original},201);
 assert.match(row.imageUrl,/^\/api\/school\/images\/[a-f0-9-]{36}$/);assert.equal(row.image,undefined);
 const first=row.imageUrl;const key=first.split('/').at(-1);
 const stored=Number(sql(`SELECT OCTET_LENGTH(Content) FROM school_content_images WHERE Id='${key}'`));assert.ok(stored<original.length*0.7);
 await image(first,404);await image(first,200,true);await image(first,404,false,'http://localhost:3000');
 row=await save({...row,status:'Published'},null,200,row.id);
 assert.equal(row.imageUrl,first);let photo=await image(first,200);assert.equal(photo.headers.get('content-type'),'image/jpeg');assert.equal((await photo.arrayBuffer()).byteLength,stored);
 await image(first,200,false,'http://localhost:3000');
 row=await save({...row,title:'Text edit keeps image'},null,200,row.id);assert.equal(row.imageUrl,first);
 await save({...row,version:0},{name:'new.png',bytes:transparent},409,row.id);
 await save({...defaults},{name:'duplicate.jpg',bytes:original},409);
 assert.equal(sql('SELECT COUNT(*) FROM school_content_images'),String(Number(baseline)+1));
 row=await save(row,{name:'transparent.png',bytes:transparent},200,row.id);assert.notEqual(row.imageUrl,first);
 await image(first,404,true);photo=await image(row.imageUrl,200);assert.ok(['image/png','image/webp'].includes(photo.headers.get('content-type')));
 assert.equal(sql(`SELECT COUNT(*) FROM school_content_images WHERE Id='${key}'`),'0');
 const second=row.imageUrl;row=await save({...row,imageUrl:''},null,200,row.id);assert.equal(row.imageUrl,'');await image(second,404,true);
 assert.equal(sql('SELECT COUNT(*) FROM school_content_images'),baseline);
 row=await save(row,{name:'delete.jpg',bytes:original},200,row.id);await image(row.imageUrl,200);
 let deleted=await fetch(base+'/api/cms/content/berita/'+row.id,{method:'DELETE',headers});assert.equal(deleted.status,200);ids.delete(row.id);await image(row.imageUrl,404,true);
 await save({...defaults,slug:slug+'-invalid'},{name:'fake.jpg',bytes:Buffer.from([255,216,255,0,0,0,0,0])},400);
 await save({...defaults,slug:slug+'-large'},{name:'big.jpg',bytes:Buffer.alloc(2097153)},400);
 assert.equal(sql('SELECT COUNT(*) FROM school_content_images'),baseline);
 console.log(`PASS CMS image upload, ${original.length} -> ${stored} bytes, draft privacy, public proxy, text edits, replacement/removal/deletion, transaction rollback and invalid files`);
}finally{
 for(const id of ids)await fetch(base+'/api/cms/content/berita/'+id,{method:'DELETE',headers});
 assert.equal(sql('SELECT COUNT(*) FROM school_content_images'),baseline,'Image check must clean up assets');
}
