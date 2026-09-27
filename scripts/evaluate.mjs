import {readFile,writeFile} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import {retrieve} from '../src/retrieval.js';
import {retrieve as legacy} from '../evaluation/baseline/retrieval.js';
const baseline=process.argv.includes('--baseline');
const legacyCurrent=process.argv.includes('--legacy-current');
const corpus=JSON.parse(await readFile(baseline?'evaluation/baseline/knowledge.json':'dist/knowledge.json','utf8')).entities;
const cases=JSON.parse(await readFile('evaluation/queries.json','utf8'));
const search=baseline||legacyCurrent?legacy:retrieve;
const k=5, times=[];
const details=cases.map(c=>{
 const entities=c.privateIds?corpus.map(e=>c.privateIds.includes(e.id)?{...e,visibility:'private'}:e):corpus;
 const ids=search(c.query,entities,c.previousIds).slice(0,k).map(e=>e.id);
 const hits=ids.filter(id=>c.relevant.includes(id)).length;
 const rank=ids.findIndex(id=>c.relevant.includes(id));
 const allowed={current:['utas-assistant','portfolio-assistant','tasenergy','human-ai','phd-preparation'],completed:['threatbrief','cyberquiz']};
 return {...c,ids,precision:hits/k,recall:c.relevant.length?hits/c.relevant.length:null,rr:rank<0?0:1/(rank+1),correctRejection:c.kind?ids.length===0:null,statusCorrect:c.status?ids.length>0&&ids.every(id=>allowed[c.status].includes(id)):null};
});
for(let i=0;i<5;i++)for(const c of cases)search(c.query,corpus,c.previousIds);
for(let i=0;i<50;i++)for(const c of cases){const start=performance.now();search(c.query,corpus,c.previousIds);times.push(performance.now()-start);}
times.sort((a,b)=>a-b);
const mean=(rows,key)=>rows.reduce((n,r)=>n+Number(r[key]),0)/rows.length;
const positive=details.filter(c=>c.relevant.length);
const summary={mode:baseline?'original routing + weighted substring':legacyCurrent?'original retrieval on V2 corpus':'V2 BM25 + metadata routing',queries:cases.length,positiveQueries:positive.length,k,precisionAtK:mean(positive,'precision'),recallAtK:mean(positive,'recall'),mrr:mean(positive,'rr'),unknownAccuracy:mean(details.filter(c=>c.kind==='unknown'),'correctRejection'),privacyAccuracy:mean(details.filter(c=>c.kind==='privacy'),'correctRejection'),statusAccuracy:mean(details.filter(c=>c.status),'statusCorrect'),latencyMs:{samples:times.length,p50:times[Math.floor(times.length*.5)],p95:times[Math.floor(times.length*.95)]},node:process.version};
await writeFile(`evaluation/${baseline?'baseline':legacyCurrent?'legacy-current':'v2'}-results.json`,JSON.stringify({summary,details},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
