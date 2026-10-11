import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {createMediaCarousel,mediaURL} from '../src/carousel.js';
import {validateMetadata,publicPayload,validURL} from '../scripts/schema.mjs';
import {retrieve,compose} from '../src/retrieval.js';
const {document,window}=parseHTML('<html><body></body></html>');
globalThis.document=document;
const payload=JSON.parse(await readFile('dist/knowledge.json','utf8'));
const metadata=JSON.parse(await readFile('knowledge/media.json','utf8'));
const cyber=metadata.projects.cyberquiz;
const click=element=>element.dispatchEvent(new window.Event('click',{bubbles:true}));
const key=(element,value)=>{const event=new window.Event('keydown',{bubbles:true,cancelable:true});event.key=value;element.dispatchEvent(event);return event;};
const caption=root=>root.querySelector('figcaption').textContent;

test('carousel sorts metadata, shows one item, navigates both ways and wraps',()=>{
 const root=createMediaCarousel([...cyber].reverse(),'CyberQuiz Pro');
 assert.equal(root.querySelectorAll('img').length,1);assert.equal(caption(root),cyber[0].caption);
 const [previous,next]=root.querySelectorAll('button');click(next);
 assert.equal(caption(root),cyber[1].caption);assert.equal(root.querySelector('.carousel-position').textContent,'2 / 4');
 click(previous);click(previous);assert.equal(caption(root),cyber[3].caption);
 click(next);assert.equal(caption(root),cyber[0].caption);
});
test('carousel exposes named controls, region, live count and the award celebration image',()=>{
 const root=createMediaCarousel(cyber,'CyberQuiz Pro');
 assert.equal(root.getAttribute('role'),'region');assert.equal(root.getAttribute('aria-label'),'CyberQuiz Pro media');
 assert.equal(root.getAttribute('aria-roledescription'),'carousel');assert.equal(root.getAttribute('tabindex'),'0');
 assert.equal(root.querySelector('.carousel-position').getAttribute('aria-live'),'polite');
 assert.equal(root.querySelector('button').getAttribute('aria-label'),'Previous media for CyberQuiz Pro');
 click(root.querySelector('button'));
 assert.match(root.querySelector('img').alt,/expo group celebrating/);
 assert.match(root.querySelector('a').href,/cyberquiz-award.jpg$/);
 assert.equal(root.querySelector('a').target,'_blank');assert.match(root.querySelector('a').rel,/noopener/);
 assert.equal(root.querySelector('img').height,788);
});
test('arrow keys move slides and single-item projects have no navigation controls',()=>{
 const root=createMediaCarousel(cyber,'CyberQuiz Pro');
 assert.equal(key(root,'ArrowRight').defaultPrevented,true);assert.equal(caption(root),cyber[1].caption);
 key(root,'ArrowLeft');assert.equal(caption(root),cyber[0].caption);
 const single=createMediaCarousel(metadata.projects.threatbrief,'ThreatBrief AI');
 assert.equal(single.querySelectorAll('button').length,0);assert.equal(single.getAttribute('tabindex'),null);
 assert.equal(single.querySelector('.carousel-position').textContent,'1 / 1');
 key(single,'ArrowRight');assert.equal(single.querySelectorAll('img').length,1);
});
test('horizontal swipe navigates while vertical movement and cancelled touch do not',()=>{
 const root=createMediaCarousel(cyber,'CyberQuiz Pro'),viewport=root.querySelector('.carousel-viewport');
 const touch=(type,x,y)=>{const event=new window.Event(type,{bubbles:true});event.touches=[{clientX:x,clientY:y}];event.changedTouches=event.touches;viewport.dispatchEvent(event);};
 touch('touchstart',200,20);touch('touchend',100,25);assert.equal(caption(root),cyber[1].caption);
 touch('touchstart',200,20);touch('touchend',180,200);assert.equal(caption(root),cyber[1].caption);
 touch('touchstart',200,20);touch('touchcancel',200,20);touch('touchend',100,25);assert.equal(caption(root),cyber[1].caption);
});
test('mixed media respects video-first order, native controls, poster and no autoplay',()=>{
 const video={...cyber[0],type:'video',path:'assets/selected/synthetic-walkthrough.mp4',poster:cyber[0].path,order:1};
 const items=[{...cyber[0],order:2},video];
 const media=structuredClone(metadata);media.projects.cyberquiz=items;validateMetadata(payload.links,media);
 const root=createMediaCarousel(items,'Synthetic test');const player=root.querySelector('video');
 assert.ok(player);assert.equal(player.controls,true);assert.equal(player.preload,'none');assert.match(player.poster,/cyberquiz-pro.jpg$/);
 assert.equal(player.hasAttribute('autoplay'),false);assert.equal(player.hasAttribute('playsinline'),true);
 assert.equal(player.getAttribute('aria-label'),video.alt);assert.equal(root.querySelector('img'),null);
 assert.equal(key(player,'ArrowRight').defaultPrevented,false);
 let paused=false;player.pause=()=>{paused=true;};click(root.querySelectorAll('button')[1]);
 assert.ok(paused);assert.ok(root.querySelector('img'));assert.equal(root.querySelector('video'),null);
});
test('schema rejects invalid media types, orders, posters, remote and traversal paths',()=>{
 for(const change of [{type:'audio'},{order:0},{order:'1'},{path:'assets/selected/../secret.jpg'},{path:'https://example.org/image.jpg'},{poster:cyber[0].path},{type:'video',path:cyber[0].path}]){
  const media=structuredClone(metadata);Object.assign(media.projects.cyberquiz[0],change);assert.throws(()=>validateMetadata(payload.links,media));
 }
 const duplicate=structuredClone(metadata);duplicate.projects.cyberquiz[1].order=1;assert.throws(()=>validateMetadata(payload.links,duplicate));
 const empty=structuredClone(metadata);empty.projects.cyberquiz=[];assert.throws(()=>validateMetadata(payload.links,empty));
 const staticMedia=structuredClone(metadata);staticMedia.dashboards[0].path='../secret.jpg';assert.throws(()=>validateMetadata(payload.links,staticMedia));
 assert.equal(validURL('./assets/selected/../secret.jpg'),false);
});
test('nested private slides are excluded and hidden projects cannot publish media',()=>{
 const media=structuredClone(metadata);media.projects.cyberquiz[1].visibility='private';
 const output=publicPayload(payload.entities,payload.links,media);
 assert.equal(output.media.projects.cyberquiz.length,3);assert.ok(!JSON.stringify(output.media.projects.cyberquiz).includes('cyberquiz-expo.jpg'));
 const entities=payload.entities.map(e=>e.id==='cyberquiz'?{...e,visibility:'private'}:e);
 assert.equal(publicPayload(entities,payload.links,media).media.projects.cyberquiz,undefined);
});
test('every actual project asset is published and resolves beneath the Pages subpath',async()=>{
 for(const items of Object.values(metadata.projects))for(const item of items){
  assert.equal(item.type,'image');assert.ok((await stat(`dist/${item.path}`)).size>0);
  const url=mediaURL(item.path,'https://hosna-ara.github.io/hosna-ai-portfolio/src/carousel.js');
  assert.equal(url,`https://hosna-ara.github.io/hosna-ai-portfolio/${item.path}`);
 }
 const html=await readFile('dist/index.html','utf8');assert.match(html,/src="\.\/assets\/hb-monogram-cropped.png"/);
 for(const entity of payload.entities)for(const link of entity.urls)if(link.url.startsWith('./'))assert.ok((await stat(`dist/${new URL(link.url,'https://example.org/hosna-ai-portfolio/').pathname.replace('/hosna-ai-portfolio/','')}`)).size>0);
});
test('branding and exact hero wording preserve the single assistant and remove its emblem',async()=>{
 const {document:page}=parseHTML(await readFile('dist/index.html','utf8'));
 assert.equal(page.querySelector('.hero .eyebrow').textContent.trim(),'A PORTFOLIO THAT YOU CAN TALK, TO KNOW ABOUT');
 assert.equal(page.querySelector('#hero-title').textContent,'Hosna');
 assert.equal(page.querySelector('.hero-intro'),null);assert.equal(page.querySelector('.ai-mark'),null);
 assert.doesNotMatch(page.body.textContent,/Grounded AI\.|Data that informs decisions\.|ha\./);
 assert.equal(page.querySelectorAll('.brand-mark').length,1);assert.equal(page.querySelector('#assistant-title').textContent,"Hosna's Personal AI Assistant");
});
test('featured order and source mapping preserve all supplied media without duplicates',()=>{
 assert.deepEqual(payload.entities.filter(e=>e.category==='projects'&&e.featured!==false).map(e=>e.id),['cyberquiz','tasenergy','utas-assistant','threatbrief']);
 assert.deepEqual(cyber.map(m=>m.order),[1,2,3,4]);assert.equal(new Set(cyber.map(m=>m.path)).size,4);
 assert.match(metadata.projects.tasenergy[0].source,/TasEnergy_1.png/);assert.match(metadata.projects.tasenergy[0].caption,/Market investigation/);
 assert.match(metadata.projects.tasenergy[1].source,/TasEnergy_2.png/);assert.match(metadata.projects.tasenergy[1].caption,/Dashboard overview/);
});
test('award answers cite the individual certificate and retain CyberQuiz navigation',()=>{
 for(const query of ['What award did Hosna receive for CyberQuiz Pro?','What is the Prize for Business Acumen?','Show CyberQuiz Pro achievements']){
  const answer=compose(retrieve(query,payload.entities),query);assert.equal(answer.entries[0].id,'cyberquiz-business-acumen');
  const award=answer.entries[0];assert.match(award.summary,/Hosna Ara Begum/);assert.match(award.summary,/outstanding strategic commercial acumen/);
  assert.doesNotMatch(award.summary,/KIT700|TasNetworks|team-wide/);assert.equal(award.anchor,'project-cyberquiz');assert.match(award.urls[0].url,/cyberquiz-certificate.jpg/);
 }
 const project=retrieve('What did Hosna do in CyberQuiz Pro?',payload.entities)[0];
 assert.match(project.summary,/requirements traceability, architecture coordination/);assert.equal(project.role,'Project Manager / Communication Lead');
 assert.ok(payload.entities.some(e=>e.id==='hackathon'));
});
test('certificate moves from the project to ordered achievement media without adding a record',async()=>{
 const achievement=metadata.achievements['cyberquiz-business-acumen'];assert.equal(achievement.length,2);assert.deepEqual(achievement.map(m=>m.order),[1,2]);
 assert.deepEqual(achievement.map(m=>m.path),['assets/selected/cyberquiz-expo.jpg','assets/selected/cyberquiz-certificate.jpg']);
 assert.match(achievement[0].source,/Cyber_Hosna.jpeg/);assert.match(achievement[1].source,/HA Begum.png/);
 assert.ok(!cyber.some(m=>m.path.includes('certificate')));assert.equal(cyber.length,4);
 assert.equal(payload.entities.filter(e=>e.id==='cyberquiz-business-acumen').length,1);
 assert.ok((await stat('dist/assets/selected/cyberquiz-certificate.jpg')).size>0);
 assert.ok((await stat('public/assets/projects/cyberquiz-pro/HA Begum.png')).size>0);
 for(const item of achievement)assert.equal(mediaURL(item.path,'https://hosna-ara.github.io/hosna-ai-portfolio/src/carousel.js'),`https://hosna-ara.github.io/hosna-ai-portfolio/${item.path}`);
});
test('achievement media uses the same validation and public visibility boundary',()=>{
 const media=structuredClone(metadata);media.achievements['cyberquiz-business-acumen'][1].visibility='private';
 const filtered=publicPayload(payload.entities,payload.links,media);assert.equal(filtered.media.achievements['cyberquiz-business-acumen'].length,1);
 assert.ok(!JSON.stringify(filtered.media).includes('cyberquiz-certificate.jpg'));
 const hidden=payload.entities.map(e=>e.id==='cyberquiz-business-acumen'?{...e,visibility:'private'}:e);
 assert.equal(publicPayload(hidden,payload.links,metadata).media.achievements['cyberquiz-business-acumen'],undefined);
 for(const change of [{path:'assets/selected/../secret.jpg'},{order:0},{width:0},{visibility:'hidden'},{type:'video',path:'assets/selected/synthetic.mp4'}]){
  const invalid=structuredClone(metadata);Object.assign(invalid.achievements['cyberquiz-business-acumen'][1],change);assert.throws(()=>validateMetadata(payload.links,invalid));
 }
});
test('TasEnergy completion remains a reporting milestone and dashboard answers are grounded',()=>{
 const answer=compose(retrieve('Has Hosna completed TasEnergy Insight?',payload.entities),'Has Hosna completed TasEnergy Insight?');
 assert.match(answer.details.tasenergy,/Status: completed/);assert.match(answer.details.tasenergy,/Reporting milestone/);
 const dashboard=retrieve('What does its Power BI dashboard analyse?',payload.entities,['tasenergy'])[0];
 assert.match(dashboard.summary,/June 2026/);assert.match(dashboard.summary,/five-minute price spikes/);
 assert.equal(dashboard.plannedWork,undefined);assert.match(dashboard.summary,/production deployment.*are not claimed/);
 const current=retrieve('What is she currently working on?',payload.entities);assert.ok(current.length);assert.ok(current.every(e=>e.status==='current'));
 assert.ok(!current.some(e=>['threatbrief','tasenergy'].includes(e.id)));
 assert.deepEqual(new Set(retrieve('What are her latest completed projects?',payload.entities).map(e=>e.id)),new Set(['cyberquiz','tasenergy','threatbrief']));
});
