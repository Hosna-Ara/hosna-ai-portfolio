import {mkdir, readFile, writeFile, cp, rm, stat} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {publicPayload,validateEntities,mediaAssets} from './schema.mjs';
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
const paths=new Set(mediaAssets(media).flatMap(m=>[m.path||m.src,...(m.poster?[m.poster]:[])]));
for(const e of entities)for(const u of e.urls)if(u.url.startsWith('./assets/')&&!paths.has(u.url.slice(2)))throw new Error(`Evidence asset is not published: ${u.url}`);
for(const path of ['assets/hb-monogram-cropped.png',...paths])if(!(await stat(`public/${path}`)).isFile())throw new Error(`Missing reviewed media: ${path}`);
// All validation happens before removing the last good build.
await rm(output,{recursive:true,force:true});
await mkdir(`${output}/src`,{recursive:true});
// Public uploads may contain source PDFs or unaudited photos. Copy only approved files.
for(const file of ['index.html','styles.css','favicon.svg']) await cp(`public/${file}`,`${output}/${file}`);
await mkdir(`${output}/assets/selected`,{recursive:true});
await cp('public/assets/hb-monogram-cropped.png',`${output}/assets/hb-monogram-cropped.png`);
for(const path of paths) {
  // Schema validates all paths before output removal; no directory copy is permitted.
  await cp(`public/${path}`,`${output}/${path}`);
}
for(const file of ['app.js','carousel.js','retrieval.js','providers.js','knowledge.js'])await cp(`src/${file}`,`${output}/src/${file}`);
await writeFile(`${output}/knowledge.json`,JSON.stringify({entities,links,media}));
console.log(`Built static portfolio: ${entities.length} public knowledge entities. CV and source caches excluded.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await build();
