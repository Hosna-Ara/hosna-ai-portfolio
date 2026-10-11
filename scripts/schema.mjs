import assert from 'node:assert/strict';
export const categories=['profile','contact','education','experience','projects','research','publications','skills','achievements','leadership','links','dashboards'];
const text=v=>typeof v==='string'&&v.trim().length>0;
const slug=v=>typeof v==='string'&&/^[a-z][a-z0-9-]*$/.test(v);
const visibility=e=>assert.ok(['public','private'].includes(e.visibility),'Invalid visibility');
export function validURL(value){
  if(typeof value!=='string'||/[\s\u0000-\u001f]/.test(value))return false;
  if(/^\.\/assets\/selected\/[a-z0-9-]+\.jpg$/.test(value))return true;
  try{const u=new URL(value);return u.protocol==='https:'?!!u.hostname&&!u.username&&!u.password&&!/^(localhost|127\.|\[|0\.)/.test(u.hostname):u.protocol==='mailto:'&&/^mailto:[^?@]+@[^?@]+\.[^?@]+$/.test(value);}catch{return false;}
}
export const validAsset=value=>typeof value==='string'&&/^assets\/selected\/[a-z0-9-]+\.jpg$/.test(value);
export const validVideo=value=>typeof value==='string'&&/^assets\/selected\/[a-z0-9-]+\.(mp4|webm)$/.test(value);
export const mediaAssets=media=>[...Object.values(media.projects).flat(),...Object.values(media.achievements||{}).flat(),...media.dashboards,...media.moments];
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
  if(media.achievements!==undefined)assert.ok(media.achievements&&typeof media.achievements==='object'&&!Array.isArray(media.achievements),'Invalid achievement media map');
  assert.ok(Array.isArray(media.dashboards)&&Array.isArray(media.moments));
  for(const sequence of Object.values(media.achievements||{}))assert.ok(Array.isArray(sequence)&&sequence.every(m=>m.type==='image'),'Achievement media must contain images');
  for(const sequence of [...Object.values(media.projects),...Object.values(media.achievements||{})]){
    assert.ok(Array.isArray(sequence)&&sequence.length>0,'Project media must be a nonempty sequence');
    const orders=new Set();
    for(const m of sequence){
      assert.ok(['image','video'].includes(m.type),'Invalid media type');
      assert.ok(Number.isInteger(m.order)&&m.order>0&&!orders.has(m.order),'Invalid or duplicate media order');orders.add(m.order);
      assert.ok(m.type==='image'?validAsset(m.path):validVideo(m.path),'Unapproved project media path');
      assert.equal(m.src,undefined,'Project media uses path');
      if(m.poster!==undefined)assert.ok(m.type==='video'&&validAsset(m.poster),'Invalid video poster');
    }
  }
  for(const m of [...media.dashboards,...media.moments]){
    assert.ok(Object.keys(m).every(k=>['src','width','height','alt','caption','source','title','description','anchor','visibility'].includes(k)),'Unrecognised static media field');
    assert.ok(validAsset(m.src),'Unapproved static media path');
  }
  for(const m of [...Object.values(media.projects).flat(),...Object.values(media.achievements||{}).flat()])assert.ok(Object.keys(m).every(k=>['path','type','order','poster','width','height','alt','caption','source','visibility'].includes(k)),'Unrecognised ordered media field');
  for(const m of mediaAssets(media)){
    visibility(m);if(m.src!==undefined)assert.ok(validAsset(m.src),'Unapproved asset path');
    for(const k of ['alt','caption','source'])assert.ok(text(m[k]),`Invalid media ${k}`);
    for(const k of ['width','height'])assert.ok(Number.isInteger(m[k])&&m[k]>0,`Invalid media ${k}`);
    if(m.anchor!==undefined)assert.ok(slug(m.anchor));
  }
  for(const m of [...media.dashboards,...media.moments])for(const k of ['title','description'])assert.ok(text(m[k]));
}
export function publicPayload(entities,links,media){
  validateEntities(entities);validateMetadata(links,media);
  const publicIds=new Set(entities.filter(e=>e.visibility==='public').map(e=>e.id));
  const publicSequences=(sequences,category)=>Object.fromEntries(Object.entries(sequences).map(([id,items])=>[id,items.filter(m=>m.visibility==='public')]).filter(([id,items])=>items.length&&entities.some(e=>e.id===id&&e.category===category&&publicIds.has(id))));
  return {entities:entities.filter(e=>e.visibility==='public'),links:links.filter(l=>l.visibility==='public'),media:{projects:publicSequences(media.projects,'projects'),achievements:publicSequences(media.achievements||{},'achievements'),dashboards:media.dashboards.filter(m=>m.visibility==='public'),moments:media.moments.filter(m=>m.visibility==='public')}};
}
