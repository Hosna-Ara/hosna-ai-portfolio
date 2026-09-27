import {mkdir, readFile, writeFile, cp, rm} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {publicPayload,validateEntities} from './schema.mjs';
import {enrichKnowledge} from '../src/knowledge.js';
const categories = ['profile','education','experience','projects','research','publications','skills','achievements','leadership'];
export async function loadKnowledge() {
  return (await Promise.all(categories.map(c => readFile(new URL(`../knowledge/${c}.json`, import.meta.url),'utf8').then(JSON.parse)))).flat();
}
export async function build(input, output='dist') {
const data=input || {entities:await loadKnowledge(),links:JSON.parse(await readFile('knowledge/links.json','utf8')),media:JSON.parse(await readFile('knowledge/media.json','utf8'))};
const {entities:publicEntities,links,media}=publicPayload(data.entities,data.links,data.media);
const entities=enrichKnowledge(publicEntities,links,media);
validateEntities(entities);
// All validation happens before removing the last good build.
await rm(output,{recursive:true,force:true});
await mkdir(`${output}/src`,{recursive:true});
// Public uploads may contain source PDFs or unaudited photos. Copy only approved files.
for(const file of ['index.html','styles.css','favicon.svg']) await cp(`public/${file}`,`${output}/${file}`);
await mkdir(`${output}/assets/selected`,{recursive:true});
await cp('public/assets/hosna-brand-mark-cropped.png',`${output}/assets/hosna-brand-mark-cropped.png`);
for(const asset of [...Object.values(media.projects),...media.dashboards,...media.moments]) {
  if(!/^assets\/selected\/[a-z0-9-]+\.jpg$/.test(asset.src)) throw new Error(`Unapproved asset path: ${asset.src}`);
  try { await cp(`public/${asset.src}`,`${output}/${asset.src}`); }
  catch(error) { if(error.code!=='ENOENT')throw error;console.warn(`Optional preview missing: ${asset.src}; the UI will show its fallback.`); }
}
for(const file of ['app.js','retrieval.js','providers.js','knowledge.js'])await cp(`src/${file}`,`${output}/src/${file}`);
await writeFile(`${output}/knowledge.json`,JSON.stringify({entities,links,media}));
console.log(`Built static portfolio: ${entities.length} public knowledge entities. CV and source caches excluded.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await build();
