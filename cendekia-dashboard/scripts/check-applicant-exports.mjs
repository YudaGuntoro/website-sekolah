import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const base=process.env.CMS_API_URL || 'http://localhost:5243';
const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:process.env.CMS_ADMIN_PASSWORD || 'admin123'})});
assert.equal(login.status,200);const token=(await login.json()).data.access_token;
const headers={Authorization:'Bearer '+token};
async function json(path){const r=await fetch(base+'/api/'+path,{headers});assert.equal(r.status,200);return(await r.json()).data;}
const checks=[];
for(const module of ['spmb','lmp']){
 assert.equal((await fetch(base+'/api/'+module+'/applications/export')).status,401);
 const all=await json(module+'/applications?limit=1');
 const row=all.items[0];
 const filters=[{}, {search:'NO-RESULT-XLSX-EXPORT-CHECK'}];
 if(row){
  filters.push({search:row.studentName});
  if(module==='spmb')filters.push({year:row.academicYear},{wave:String(row.waveNumber)},{status:row.status},{payment:row.paymentStatus},{year:row.academicYear,wave:String(row.waveNumber),status:row.status,payment:row.paymentStatus,search:row.studentName});
  else filters.push({subject:row.subjects},{grade:String(row.grade)},{status:row.status},{payment:row.paymentStatus},{subject:row.subjects,grade:String(row.grade),status:row.status,payment:row.paymentStatus,search:row.studentName});
 }
 for(const filter of filters){
  const query=new URLSearchParams(filter);let entries=[];
  for(let page=1;;page++){const list=await json(module+'/applications?'+new URLSearchParams({...filter,page:String(page),limit:'100'}));entries.push(...list.items);if(entries.length>=list.total)break;}
  const r=await fetch(base+'/api/'+module+'/applications/export?'+query,{headers});assert.equal(r.status,200);
  assert.match(r.headers.get('content-type'),/spreadsheetml.sheet/);assert.match(r.headers.get('content-disposition'),/\.xlsx/);assert.equal(r.headers.get('cache-control'),'no-store');
  const bytes=Buffer.from(await r.arrayBuffer());
  checks.push({module,filter,workbook:bytes.toString('base64'),numbers:entries.map(x=>x.registrationNumber),names:entries.map(x=>x.studentName)});
 }
}
const result=spawnSync('python',['-c',String.raw`
import sys,json,base64,io,zipfile,xml.etree.ElementTree as E
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
for check in json.load(sys.stdin):
 with zipfile.ZipFile(io.BytesIO(base64.b64decode(check['workbook']))) as z:
  assert z.testzip() is None
  for name in z.namelist():
   if name.endswith(('.xml','.rels')):E.fromstring(z.read(name))
  sheet=E.fromstring(z.read('xl/worksheets/sheet1.xml'))
  shared=[]
  if 'xl/sharedStrings.xml' in z.namelist():
   shared=[''.join(si.itertext()) for si in E.fromstring(z.read('xl/sharedStrings.xml'))]
  def cell_value(c):
   if c.get('t')=='s':return shared[int(c.find('s:v',ns).text)]
   if c.get('t')=='inlineStr':return ''.join(c.find('s:is',ns).itertext())
   v=c.find('s:v',ns)
   return v.text or '' if v is not None else ''
  def column(ref):
   result=0
   for letter in ref:
    if not letter.isalpha():break
    result=result*26+ord(letter)-64
   return result
  rows=sheet.findall('s:sheetData/s:row',ns)
  data_rows=[r for r in rows if int(r.get('r'))>6]
  assert len(data_rows)==len(check['numbers'])
  all_values={}
  for row in rows:
   cells=list(row);values=['']*max([column(c.get('r')) for c in cells]+[1])
   for c in cells:values[column(c.get('r'))-1]=cell_value(c)
   all_values[int(row.get('r'))-1]=values
  assert 'LAPORAN PENDAFTAR '+check['module'].upper() in all_values[0][0]
  assert 'Jumlah pendaftar: '+str(len(check['numbers'])) in all_values[1][0]
  filter_text=' '.join(all_values[2]+all_values[3])
  for value in check['filter'].values():assert value in filter_text
  assert not any(name.startswith('xl/media/') for name in z.namelist())
  assert sheet.find('s:pageSetup',ns).get('orientation')=='landscape'
  assert sheet.find('s:sheetViews/s:sheetView',ns).get('showGridLines')=='0'
  assert sheet.find('s:sheetViews/s:sheetView/s:pane',ns).get('ySplit')=='6'
  values=[all_values[i] for i in range(5,6+len(check["numbers"]))]
  assert [v[1] for v in values[1:]]==check['numbers']
  index=values[0].index('Nama calon siswa' if check['module']=='spmb' else 'Nama peserta')
  if check['module']=='spmb':assert 'Status pembayaran' in values[0]
  else:assert 'NISN' in values[0]
  assert [v[index] for v in values[1:]]==check['names']
  assert sheet.find('s:sheetViews/s:sheetView/s:pane',ns).get('state') in ('frozen','frozenSplit')
  assert sheet.find('s:autoFilter',ns) is not None
  assert not sheet.findall('.//s:f',ns)
print('PASS: authenticated XLSX downloads, matching list order and all filter combinations, empty results, report title, filter summary, row counts, print layout, text cells, frozen header and Excel filters.')
`],{input:JSON.stringify(checks),encoding:'utf8',windowsHide:true,maxBuffer:10*1024*1024});
process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');assert.equal(result.status,0);
console.log('Reports checked:',checks.length);
