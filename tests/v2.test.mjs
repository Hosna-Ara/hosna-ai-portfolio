import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,rm} from 'node:fs/promises';
import {retrieve,compose,createIndex,bm25,UNKNOWN} from '../src/retrieval.js';
import {LocalKnowledgeProvider} from '../src/providers.js';
import {validateEntities,validateMetadata,validURL,validAsset} from '../scripts/schema.mjs';
import {build,loadKnowledge} from '../scripts/build.mjs';
const payload=JSON.parse(await readFile('dist/knowledge.json','utf8'));
const entities=payload.entities;
const source={entities:await loadKnowledge(),links:JSON.parse(await readFile('knowledge/links.json','utf8')),media:JSON.parse(await readFile('knowledge/media.json','utf8'))};
const cases=JSON.parse(await readFile('evaluation/queries.json','utf8'));
for(const c of cases)test(`V2 evaluation regression: ${c.query} ${c.privateIds||''}`,()=>{
 const corpus=c.privateIds?entities.map(e=>c.privateIds.includes(e.id)?{...e,visibility:'private'}:e):entities;
 const result=retrieve(c.query,corpus,c.previousIds);
 if(!c.relevant.length)assert.deepEqual(result,[]);
 else {assert.ok(result.length);assert.ok(result.every(e=>c.relevant.includes(e.id)));assert.ok(c.relevant.every(id=>result.some(e=>e.id===id)),c.query);}
 if(c.status)assert.ok(result.every(e=>e.status===c.status));
});
test('status semantics are independent of array order',()=>{
 const reversed=[...entities].reverse();
 for(const q of ['What are her current projects?','What projects has she completed?','What is she planning next?'])assert.deepEqual(retrieve(q,reversed).map(e=>e.id),retrieve(q,entities).map(e=>e.id));
 assert.ok(!retrieve('What is she working on?',entities).some(e=>e.id==='threatbrief'));
 assert.deepEqual(retrieve('Show her current ThreatBrief project',entities),[]);
});
test('planned-only entities and proposed steps in current projects remain distinct',()=>{
 const planned={...entities.find(e=>e.id==='tasenergy'),id:'synthetic-planned',status:'planned',plannedWork:undefined};
 const corpus=[planned,...entities];
 assert.ok(retrieve('What projects are planned?',corpus).includes(planned));
 assert.ok(!retrieve('What are her current projects?',corpus).includes(planned));
 assert.equal(entities.find(e=>e.id==='tasenergy').status,'current');
});
test('recent completed project ties are disclosed instead of inventing chronology',()=>{
 const answer=compose(retrieve('What is her latest completed project?',entities),'What is her latest completed project?');
 assert.equal(answer.entries.length,2);assert.match(answer.text,/cannot be verified/);
});
test('research preparation is exploration, never an approved PhD or publication',()=>{
 const e=entities.find(e=>e.id==='phd-preparation');assert.match(e.summary,/not an established project, approved PhD topic/);
 assert.equal(retrieve('What is her approved PhD topic?',entities).length,0);
});
test('narrow responses select metadata without repeating the summary',async()=>{
 const p=new LocalKnowledgeProvider();
 for(const [q,pattern] of [['What technologies did she use?',/Technologies: Python/],['What was her role?',/Independent end-to-end/],['When did she work on it?',/Date: 2026/],['Can I see it?',/Verified public links/]]){
  const a=await p.answer(q,entities,['utas-assistant']);assert.match(a.details['utas-assistant'],pattern);assert.notEqual(a.details['utas-assistant'],a.entries[0].summary);
 }
 const a=await p.answer('Is she still working on it?',entities,['threatbrief']);assert.match(a.details.threatbrief,/Status: completed/);
 const missing=await p.answer('What technologies did she use?',entities,['cyberquiz']);assert.match(missing.details.cyberquiz,/does not list/);
 const noLink=await p.answer('Can I see it?',entities,['threatbrief']);assert.match(noLink.details.threatbrief,/No verified external/);
});
test('ambiguous context is not guessed; explicit topic switches override context',()=>{
 assert.deepEqual(retrieve('Tell me more about it',entities,['threatbrief','utas-assistant']),[]);
 assert.equal(retrieve('Tell me about CyberQuiz',entities,['utas-assistant'])[0].id,'cyberquiz');
});
test('additional paraphrases and entity plus category multi-intent',()=>{
 for(const q of ['What is she building at the moment?','What is Hosna working on?'])assert.ok(retrieve(q,entities).every(e=>e.status==='current'));
 assert.equal(retrieve('What was her contribution?',entities,['utas-assistant'])[0].id,'utas-assistant');
 const r=retrieve('Tell me about CyberQuiz and her education',entities);assert.ok(r.some(e=>e.id==='cyberquiz'));assert.ok(r.some(e=>e.id==='masters'));
});
test('BM25 document frequency counts documents, not repeated occurrences',()=>{
 const template=entities[0];const corpus=[{...template,id:'one',title:'zebra zebra',summary:'',role:'',tags:[],technologies:[]},{...template,id:'two',title:'zebra yak',summary:'',role:'',tags:[],technologies:[]}];
 const index=createIndex(corpus);assert.equal(index.df.get('zebra'),2);assert.equal(index.averageLength,2);
 const score=bm25(index,'zebra')[0];assert.equal(score.entity.id,'one');
 assert.ok(Math.abs(score.score-Math.log(1+.5/2.5)*(2*2.2)/(2+1.2))<1e-12);
 assert.ok(bm25(index,'absent').every(r=>r.score===0));
});
test('private records cannot escape via any route or a cached index',()=>{
 const corpus=structuredClone(entities);retrieve('Show projects',corpus);
 for(const e of corpus)e.visibility='private';
 for(const q of ['Show projects','ThreatBrief','UTAS Research Degree Assistant','What was her role?','Python'])assert.deepEqual(retrieve(q,corpus,['cyberquiz']),[]);
 assert.equal(compose(retrieve('Unsupported quantum research',entities)).text,UNKNOWN);
});
test('schema rejects malformed types, unknown fields, unsafe URLs and media paths',()=>{
 for(const change of [{id:''},{category:'made-up'},{title:3},{status:'recent'},{year:'2026'},{summary:null},{technologies:'Python'},{tags:[3]},{source:''},{visibility:'hidden'},{anchor:'../secret'},{privateNote:'SYNTHETIC_SECRET'},{urls:[{label:'bad',url:'javascript:alert(1)'}]}])assert.throws(()=>validateEntities([{...source.entities.find(e=>e.category==='projects'),...change}]));
 for(const url of ['javascript:alert(1)','data:text/html,test','http://example.org','https://user:password@example.org','https://localhost/x','mailto:a@example.org?bcc=secret@example.org'])assert.equal(validURL(url),false,url);
 for(const path of ['../secret.jpg','assets/raw.pdf','assets/selected/../private.jpg','https://example.org/x.jpg'])assert.equal(validAsset(path),false);
 const media=structuredClone(source.media);media.dashboards[0].width='1400';assert.throws(()=>validateMetadata(source.links,media));
});
test('actual build excludes synthetic private entities, links and media',async()=>{
 const input=structuredClone(source);input.entities.push({...input.entities[0],id:'synthetic-private',title:'SYNTHETIC_PRIVATE_ADDRESS',visibility:'private'});
 input.links.push({label:'SYNTHETIC_SECRET',url:'https://example.org/private',source:'Synthetic privacy fixture',visibility:'private'});
 input.media.dashboards.push({...input.media.dashboards[0],src:'assets/selected/synthetic-private.jpg',title:'SYNTHETIC_PRIVATE_PHONE',visibility:'private'});
 const output='.cache/v2-private-build';
 try{await build(input,output);const json=await readFile(`${output}/knowledge.json`,'utf8');assert.doesNotMatch(json,/SYNTHETIC_|synthetic-private/);assert.ok(!(await readdir(`${output}/assets/selected`)).includes('synthetic-private.jpg'));}
 finally{await rm(output,{recursive:true,force:true});}
});
test('public output has only explicit build files and reviewed JPEG previews',async()=>{
 async function walk(path){return (await Promise.all((await readdir(path,{withFileTypes:true})).map(async d=>d.isDirectory()?walk(`${path}/${d.name}`):`${path}/${d.name}`))).flat();}
 const files=await walk('dist');const expected=['dist/index.html','dist/styles.css','dist/favicon.svg','dist/knowledge.json','dist/assets/hosna-brand-mark-cropped.png',...['app.js','retrieval.js','providers.js','knowledge.js'].map(f=>`dist/src/${f}`),...[...Object.values(payload.media.projects),...payload.media.dashboards,...payload.media.moments].map(m=>`dist/${m.src}`)];
 assert.deepEqual(files.sort(),[...new Set(expected)].sort());assert.ok(files.every(f=>! /\.pdf$|\.env|CV|cache|evaluation/.test(f)));
});
