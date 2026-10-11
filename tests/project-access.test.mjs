import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {LocalKnowledgeProvider} from '../src/providers.js';
import {validURL} from '../scripts/schema.mjs';
const projects=JSON.parse(await readFile('knowledge/projects.json','utf8'));
const {entities}=JSON.parse(await readFile('dist/knowledge.json','utf8'));
const mapping={
 'utas-assistant':{label:'Try Live Demo',url:'https://utas-research-degree-assistant.streamlit.app'},
 cyberquiz:{label:'Try Live Demo',url:'https://d2q8nnpm7i97w5.cloudfront.net'},
 tasenergy:{label:'View Power BI Report',url:'https://github.com/Hosna-Ara/tasenergy-insight/blob/main/powerbi/TasEnergy_Insight.pdf'}
};
test('canonical project records contain exactly the three owner-supplied access URLs',()=>{
 for(const [id,link] of Object.entries(mapping)){
  const project=projects.find(e=>e.id===id);assert.ok(project.urls.some(u=>u.label===link.label&&u.url===link.url));assert.equal(validURL(link.url),true);
  assert.equal(project.urls.length,2);assert.match(project.source,/URL supplied by owner/);
 }
 assert.equal(projects.flatMap(e=>e.urls).filter(u=>u.label==='Try Live Demo').length,2);
 for(const project of projects.filter(e=>!mapping[e.id]))assert.ok(!project.urls.some(u=>/demo|Power BI Report/.test(u.label)));
 assert.ok(!projects.find(e=>e.id==='tasenergy').urls.some(u=>/demo/i.test(u.label)));
});
test('existing GitHub and certificate links and project statuses remain available',()=>{
 for(const [id,url] of [['utas-assistant','https://github.com/Hosna-Ara/utas-research-degree-assistant'],['tasenergy','https://github.com/Hosna-Ara/tasenergy-insight'],['cyberquiz','./assets/selected/cyberquiz-certificate.jpg']])assert.ok(projects.find(e=>e.id===id).urls.some(u=>u.url===url));
 assert.equal(projects.find(e=>e.id==='utas-assistant').status,'current');
 for(const id of ['cyberquiz','tasenergy','threatbrief'])assert.equal(projects.find(e=>e.id===id).status,'completed');
 assert.deepEqual(projects.find(e=>e.id==='threatbrief').urls,[]);
});
test('deterministic project and contextual link responses retain all canonical access actions',async()=>{
 const provider=new LocalKnowledgeProvider();
 for(const [id,link] of Object.entries(mapping)){
  const project=projects.find(e=>e.id===id),answer=await provider.answer(`Tell me about ${project.title}`,entities);
  assert.equal(answer.entries[0].id,id);assert.deepEqual(answer.entries[0].urls,project.urls);
  const followup=await provider.answer('Can I see it?',entities,[id]);
  assert.match(followup.details[id],/Verified public links/);assert.ok(followup.entries[0].urls.some(u=>u.url===link.url));
 }
 const missing=await provider.answer('Can I see it?',entities,['threatbrief']);assert.deepEqual(missing.entries[0].urls,[]);assert.match(missing.details.threatbrief,/No verified external/);
});
test('private projects cannot expose their new URLs through named or contextual retrieval',async()=>{
 const provider=new LocalKnowledgeProvider();
 for(const id of Object.keys(mapping)){
  const project=projects.find(e=>e.id===id),privateEntities=entities.map(e=>e.id===id?{...e,visibility:'private'}:e);
  for(const [query,context] of [[`Tell me about ${project.title}`,[]],['Can I see it?',[id]]]){
   const answer=await provider.answer(query,privateEntities,context);assert.deepEqual(answer.entries,[]);assert.ok(!JSON.stringify(answer).includes(mapping[id].url));
  }
 }
});
