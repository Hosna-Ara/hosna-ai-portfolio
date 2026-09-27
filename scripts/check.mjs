import {readdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {loadKnowledge} from './build.mjs';
import {validateEntities,validateMetadata} from './schema.mjs';
for (const folder of ['src','scripts','tests']) {
  for (const file of await readdir(folder)) {
    if (!/\.m?js$/.test(file)) continue;
    const result = spawnSync(process.execPath,['--check',`${folder}/${file}`],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
  }
}
validateEntities(await loadKnowledge());
validateMetadata(JSON.parse(await readFile('knowledge/links.json','utf8')),JSON.parse(await readFile('knowledge/media.json','utf8')));
console.log('JavaScript syntax and knowledge schema checks passed.');
