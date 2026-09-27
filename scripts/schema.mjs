import assert from 'node:assert/strict';
export const categories=['profile','contact','education','experience','projects','research','publications','skills','achievements','leadership','links','dashboards'];
const text=v=>typeof v==='string'&&v.trim().length>0;
const slug=v=>typeof v==='string'&&/^[a-z][a-z0-9-]*$/.test(v);
const visibility=e=>assert.ok(['public','private'].includes(e.visibility),'Invalid visibility');
export function validURL(value){
  if(typeof value!=='string'||/[\s\u0000-\u001f]/.test(value))return false;
  try{const u=new URL(value);return u.protocol==='https:'?!!u.hostname&&!u.username&&!u.password&&!/^(localhost|127\.|\[|0\.)/.test(u.hostname):u.protocol==='mailto:'&&/^mailto:[^?@]+@[^?@]+\.[^?@]+$/.test(value);}catch{return false;}
}
export const validAsset=value=>typeof value==='string'&&/^assets\/selected\/[a-z0-9-]+\.jpg$/.test(value);
function urls(values){assert.ok(Array.isArray(values),'URLs must be an array');for(const u of values){assert.ok(text(u.label));assert.ok(validURL(u.url),'Unsafe URL');}}
export function validateEntities(entities){
  assert.ok(Array.isArray(entities));const ids=new Set();
  for(const e of entities){
    const allowed=new Set(['id','category','title','date','summary','role','technologies','tags','source','visibility','anchor','urls','status','year','plannedWork','featured']);
    assert.ok(Object.keys(e).every(k=>allowed.has(k)),'Unrecognised entity field; review before publication');
    assert.ok(slug(e.id)&&!ids.has(e.id),'Invalid or duplicate ID');ids.add(e.id);
    assert.ok(categories.includes(e.category),'Invalid category');visibility(e);
    for(const key of ['title','summary','source'])assert.ok(text(e[key]),`Invalid ${key}`);
    for(const key of ['date','role'])assert.equal(typeof e[key],'string',`Invalid ${key}`);
    for(const key of ['technologies','tags'])assert.ok(Array.isArray(e[key])&&e[key].every(text),`Invalid ${key}`);
    assert.ok(slug(e.anchor),'Invalid anchor');urls(e.urls);
    if(['projects','research'].includes(e.category)||e.status!==undefined)assert.ok(['current','planned','completed'].includes(e.status),'Invalid status');
    if(e.year!==undefined)assert.ok(Number.isInteger(e.year)&&e.year>=1900&&e.year<=2100,'Invalid year');
    if(e.plannedWork!==undefined)assert.ok(text(e.plannedWork),'Invalid planned work');
    if(e.featured!==undefined)assert.equal(typeof e.featured,'boolean');
  }
}
export function validateMetadata(links,media){
  assert.ok(Array.isArray(links));
  for(const l of links){assert.ok(Object.keys(l).every(k=>['label','url','source','visibility'].includes(k)),'Unrecognised link field');visibility(l);assert.ok(text(l.source));urls([l]);}
  assert.ok(media&&typeof media.projects==='object'&&!Array.isArray(media.projects));
  assert.ok(Array.isArray(media.dashboards)&&Array.isArray(media.moments));
  for(const m of [...Object.values(media.projects),...media.dashboards,...media.moments]){
    assert.ok(Object.keys(m).every(k=>['src','width','height','alt','caption','source','title','description','anchor','visibility'].includes(k)),'Unrecognised media field');
    visibility(m);assert.ok(validAsset(m.src),'Unapproved asset path');
    for(const k of ['alt','caption','source'])assert.ok(text(m[k]),`Invalid media ${k}`);
    for(const k of ['width','height'])assert.ok(Number.isInteger(m[k])&&m[k]>0,`Invalid media ${k}`);
    if(m.anchor!==undefined)assert.ok(slug(m.anchor));
  }
  for(const m of [...media.dashboards,...media.moments])for(const k of ['title','description'])assert.ok(text(m[k]));
}
export function publicPayload(entities,links,media){
  validateEntities(entities);validateMetadata(links,media);
  const publicIds=new Set(entities.filter(e=>e.visibility==='public').map(e=>e.id));
  return {entities:entities.filter(e=>e.visibility==='public'),links:links.filter(l=>l.visibility==='public'),media:{projects:Object.fromEntries(Object.entries(media.projects).filter(([id,m])=>m.visibility==='public'&&publicIds.has(id))),dashboards:media.dashboards.filter(m=>m.visibility==='public'),moments:media.moments.filter(m=>m.visibility==='public')}};
}
