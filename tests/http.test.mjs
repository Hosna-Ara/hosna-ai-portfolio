import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const port=4187;
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
after(()=>server.kill());
await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error(`Server exited ${code}`)));});
const request=path=>fetch(`http://127.0.0.1:${port}${path}`);
test('production HTML, styles, scripts and knowledge are served with valid content types',async()=>{
  for(const [path,type] of [['/','text/html'],['/styles.css','text/css'],['/src/app.js','text/javascript'],['/knowledge.json','application/json'],['/favicon.svg','image/svg+xml'],['/assets/hosna-brand-mark-cropped.png','image/png']]){
    const r=await request(path);assert.equal(r.status,200,path);assert.ok(r.headers.get('content-type').includes(type));assert.equal(r.headers.get('x-content-type-options'),'nosniff');
  }
});
test('private sources, environment and repository data cannot be requested',async()=>{
  for(const path of ['/Hosna_Ara_CV.pdf','/.env','/.env.example','/.git/config','/knowledge/profile.json','/.cache/portfolio.html','/..%2fHosna_Ara_CV.pdf','/assets/hospital-analytics.pdf','/assets/pharma-analytics.pdf','/assets/hosna-brand-mark.png','/assets/industry-event.jpg','/assets/utas-research-assistant.png'])assert.equal((await request(path)).status,404,path);
});
test('every approved preview loads as a JPEG from the production server',async()=>{
  const {media}=await (await request('/knowledge.json')).json();
  for(const image of [...Object.values(media.projects),...media.dashboards,...media.moments]){const response=await request('/'+image.src);assert.equal(response.status,200,image.src);assert.equal(response.headers.get('content-type'),'image/jpeg');const bytes=new Uint8Array(await response.arrayBuffer());assert.equal(bytes[0],255);assert.equal(bytes[1],216);assert.ok(bytes.length<400000);}
});
test('production knowledge is usable and public only',async()=>{
  const {entities,links}=await (await request('/knowledge.json')).json();assert.equal(entities.length,32);assert.ok(entities.every(e=>e.visibility==='public'));assert.ok(links.length>=4);
});
