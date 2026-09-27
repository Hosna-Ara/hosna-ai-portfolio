export const UNKNOWN = "I don't have verified information about that in Hosna's portfolio yet.";
export const normalize = value => String(value).normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const stop=new Set('a an the is are was were does do did has have had she her hosna hosnas s me tell about what how can could you i of in on to for and or with show please it that this more my by from at'.split(' '));
const canonical={projects:'project',publications:'publication',published:'publication',papers:'publication',paper:'publication',skills:'skill',technologies:'technology',tools:'technology',dashboards:'dashboard',reports:'reporting',qualifications:'education',qualification:'education',studying:'education',studied:'education',degrees:'degree',awards:'award',achievements:'achievement',links:'link',profiles:'profile',tumor:'tumour',humans:'human',planning:'planned',plans:'planned',finished:'completed',complete:'completed',currently:'current',ongoing:'current',active:'current',now:'current',preparing:'preparation',pharma:'pharmaceutical',knows:'know',uses:'use',used:'use'};
export const tokenize=value=>normalize(value).split(' ').filter(t=>t&&!stop.has(t)).map(t=>canonical[t]||t);
const generic=new Set('who background biography meet describe explain give list all any some which where when much many years year most latest recent recently relevant working work worked doing remain still earned next future near term preparation planned current completed history professional personal information details detail portfolio question technology technical skill use build building built role contribution responsibilities responsibility know familiar proficient proficiency knowledge see view look examples example link profile project research researching experience experiences education publication degree bachelor master masters graduate graduated job employment career contact connect reach hire email award achievement won winner leadership community club volunteer data science business intelligence ai bi analytics direction topic approved moment'.split(' '));
const unsafe=/\b(salary|visa|birthday|birth|address|phone|family|married|religion|politic|password|secret|credentials|private|ignore|disregard|pretend|system prompt|instructions|api key|cv|resume)\b/;
const aliases=[
 ['utas-assistant',/\butas\b.*assistant|research degree assistant|\brag\b|retrieval augmented|supervisors?/],
 ['threatbrief',/threatbrief|threat intelligence/],['cyberquiz',/cyberquiz/],
 ['tasenergy',/tasenergy|energy.*analytics/],['portfolio-assistant',/interactive.*portfolio|personal ai assistant/],
 ['brain-research',/brain|tumou?r|grad cam/],['microwave-research',/microwave|stroke/],
 ['phd-preparation',/phd|metahuman/]
];
const cache=new WeakMap();
const fields=e=>[e.title,e.summary,e.role,...e.tags,...e.technologies,e.plannedWork||''].join(' ');
/** Genuine Okapi BM25 over the public corpus. Filtering is independent of scoring. */
export function createIndex(entities){
 const docs=entities.filter(e=>e.visibility==='public').map(entity=>{
  const terms=tokenize(fields(entity)),tf=new Map();
  for(const term of terms)tf.set(term,(tf.get(term)||0)+1);
  return {entity,tf,length:terms.length};
 });
 const df=new Map();for(const d of docs)for(const term of d.tf.keys())df.set(term,(df.get(term)||0)+1);
 return {docs,df,averageLength:docs.reduce((s,d)=>s+d.length,0)/(docs.length||1)};
}
export function bm25(index,question,{k1=1.2,b=.75}={}){
 const terms=[...new Set(tokenize(question))],N=index.docs.length;
 return index.docs.map(d=>{
  let score=0;
  for(const term of terms){
   const tf=d.tf.get(term)||0;if(!tf)continue;
   const df=index.df.get(term),idf=Math.log(1+(N-df+.5)/(df+.5));
   score+=idf*(tf*(k1+1))/(tf+k1*(1-b+b*d.length/(index.averageLength||1)));
  }
  return {entity:d.entity,score};
 }).sort((a,b)=>b.score-a.score||a.entity.id.localeCompare(b.entity.id));
}
function indexFor(entities){
 // Arrays are immutable snapshots in the application. Recheck visibility on every return path.
 if(!cache.has(entities))cache.set(entities,createIndex(entities));
 return cache.get(entities);
}
export function facetFor(question){
 const q=normalize(question);
 if(/technolog|tech stack|tools|languages/.test(q))return 'technologies';
 if(/\bwhen\b|\bdate\b/.test(q))return 'date';
 if(/\brole\b|contribut|responsibil/.test(q))return 'role';
 if(/still|status|completed|finished|current|active|ongoing|working on/.test(q))return 'status';
 if(/\bsee\b|\bview\b|\blink\b|github|demo/.test(q))return 'links';
 return 'summary';
}
function isFollowup(q){
 return /^(tell me more|more)( about (it|this|that))?$/.test(q) || /\b(it|this|that)\b/.test(q) || /^(what (was|is|were|are) her (role|contribution|responsibilities)|what technologies did she use|show me the link|can i see the project)$/.test(q);
}
export function retrieve(question,entities,previousIds=[]){
 const q=normalize(question);
 if(!q||unsafe.test(q)||/\b(approved|accepted|confirmed)\b.*\bphd\b/.test(q))return [];
 // Resolve independent clauses before entity aliases; preserve a distinct topic per clause.
 const clauses=q.split(/\s+(?:and|also|plus)\s+/);
 if(clauses.length>1){
  const groups=clauses.map(clause=>retrieve(clause,entities,previousIds));
  if(groups.every(group=>group.length)){
   const merged=[];
   for(let i=0;i<5;i++)for(const group of groups)if(group[i]&&!merged.some(e=>e.id===group[i].id))merged.push(group[i]);
   return merged.slice(0,5);
  }
 }
 const publicEntities=entities.filter(e=>e.visibility==='public');
 const subjects=tokenize(q).filter(t=>!generic.has(t));
 const publication=/publish|publication|papers?\b/.test(q);
 const exactIds=aliases.filter(([id,pattern])=>pattern.test(q)&&(!publication||!['brain-research','microwave-research','phd-preparation'].includes(id))).map(([id])=>id);
 if(exactIds.length){
  let matches=publicEntities.filter(e=>exactIds.includes(e.id)&&subjects.every(t=>tokenize(fields(e)).includes(t)||tokenize(e.title).some(v=>v.includes(t))));
  if(/^(show|list|which|what are)\b/.test(q)){
   if(/\b(current|currently|active|ongoing)\b/.test(q))matches=matches.filter(e=>e.status==='current');
   if(/\b(completed|finished)\b/.test(q))matches=matches.filter(e=>e.status==='completed');
   if(/\b(planned|planning)\b/.test(q))matches=matches.filter(e=>e.status==='planned'||e.plannedWork);
  }
  return matches;
 }
 if(isFollowup(q)){
  if(previousIds.length!==1)return [];
  const e=publicEntities.find(e=>e.id===previousIds[0]);
  return e&&subjects.every(t=>tokenize(fields(e)).includes(t))?[e]:[];
 }
 let categories=[];
 const add=c=>{if(!categories.includes(c))categories.push(c);};
 if(publication)add('publications');
 if(/education|degree|bachelor|master|qualification|studied|studying/.test(q))add('education');
 if(/contact|email|connect|reach|hire/.test(q))add('contact');
 if(/leadership|community|clubs?|volunteer/.test(q))add('leadership');
 if(/awards?|achievements?|won|winner/.test(q))add('achievements');
 if(/orcid|linkedin|github|scholar|professional (links?|profiles?)/.test(q))add('links');
 if(/hospital|pharma|dashboard|reporting examples/.test(q)&&!/experience|projects?/.test(q))add('dashboards');
 const skill=/technolog|skills?|tech stack|tools|programming|know|familiar|proficien|has she used/.test(q);
 if(skill)add('skills');
 if(/experience|employment|career|power bi|\bbi\b|analytics/.test(q)&&!skill&&!/projects?|hospital|pharma|dashboard/.test(q))add('experience');
 if(/research/.test(q))add('research');
 if(/who is|who s|background|biography|about hosna/.test(q)&&!categories.length)add('profile');
 if(/projects?|\brag\b|ai work|machine learning work/.test(q))add('projects');
 const current=/\b(current|currently|now|active|ongoing)\b|working on|at the moment/.test(q);
 const completed=/\b(completed|finished|complete)\b/.test(q);
 const planned=/\b(plan|plans|planning|planned|next|preparing)\b/.test(q);
 if((current||completed||planned)&&!categories.length)categories=completed?['projects']:['projects','research'];
 if(!categories.length&&subjects.length){const available=new Set(publicEntities.flatMap(e=>tokenize(fields(e))));if(subjects.every(t=>available.has(t)))categories=[...new Set(publicEntities.map(e=>e.category))];}
 if(!categories.length)return [];
 let candidates=publicEntities.filter(e=>categories.includes(e.category));
 if(completed)candidates=candidates.filter(e=>e.status==='completed');
 else if(planned)candidates=candidates.filter(e=>e.status==='planned'||e.plannedWork);
 else if(current)candidates=candidates.filter(e=>e.status==='current');
 if(categories.includes('projects')&&/\bai\b/.test(q))candidates=candidates.filter(e=>e.category!=='projects'||e.tags.includes('ai'));
 if(categories.includes('projects')&&/\bbi\b|data and bi/.test(q))candidates=candidates.filter(e=>e.category!=='projects'||e.tags.includes('bi'));
 // Every substantive subject must occur in the same candidate: no unrelated zero-score fallback.
 if(subjects.length)candidates=candidates.filter(e=>subjects.every(t=>tokenize(fields(e)).includes(t)));
 const ids=new Set(candidates.map(e=>e.id));
 let ranked=bm25(indexFor(entities),q).filter(r=>ids.has(r.entity.id)&&r.entity.visibility==='public');
 if(subjects.length)ranked=ranked.filter(r=>r.score>0);
 if(/\b(latest|recent|recently)\b/.test(q)&&categories.includes('projects')){const years=ranked.map(r=>r.entity.year).filter(Number.isInteger);if(years.length){const newest=Math.max(...years);ranked=ranked.filter(r=>r.entity.year===newest);}}
 // Round-robin categories prevents the first intent from consuming all five slots.
 const selected=[];
 for(let n=0;selected.length<5;n++){
  let added=false;
  for(const category of categories){const item=ranked.filter(r=>r.entity.category===category)[n];if(item&&selected.length<5){selected.push(item.entity);added=true;}}
  if(!added)break;
 }
 return selected;
}
export const suggestions=['What is Hosna working on now?','Show me her AI projects','What is her Data & BI experience?','Tell me about her research'];
export function compose(entities,question=''){
 if(!entities.length)return {text:UNKNOWN,entries:[],followups:['Who is Hosna?','Show me her AI projects.']};
 const facet=facetFor(question),category=entities[0].category;
 let text='';
 if(/\b(latest|recent|recently)\b/.test(normalize(question))&&entities.filter(e=>e.category==='projects').length>1)text='Project dates are recorded at year level; a unique newest project cannot be verified within the same year.';
 const details=Object.fromEntries(entities.map(e=>{
  let value=e.summary;
  if(e.category==='skills'){
   const asked=tokenize(question).filter(t=>!generic.has(t));
   if(asked.length)value=`Verified skill evidence: ${asked.join(', ')}. ${e.summary}`;
  }
  if(facet==='technologies')value=e.technologies.length?`Technologies: ${e.technologies.join(', ')}.`:'The verified knowledge does not list technologies for this work.';
  if(facet==='role')value=e.role?`Role: ${e.role}.`:'A specific role is not recorded in the verified knowledge.';
  if(facet==='date')value=`Date: ${e.date||'not recorded'}.${e.status?` Status: ${e.status}.`:''}`;
  if(facet==='status')value=e.status?`Status: ${e.status}. Date: ${e.date||'not recorded'}.${e.plannedWork?` Proposed next steps: ${e.plannedWork}`:''}`:'A current/completed status is not recorded for this item.';
  if(facet==='links')value=e.urls.length?'Verified public links are available below.':'No verified external project or live demo URL is recorded. Explore the portfolio section below.';
  if(/\b(plan|planning|planned|next|preparing)\b/.test(normalize(question))&&e.plannedWork)value=e.plannedWork;
  return [e.id,value];
 }));
 const followups=category==='research'?['What has she published?','Show me her AI projects.']:category==='projects'&&entities.length===1?['What technologies did she use?','Can I see the project?']:['How can I contact Hosna?','Tell me about her research.'];
 return {text,entries:entities,details,facet,followups};
}
