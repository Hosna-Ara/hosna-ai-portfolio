import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
const html=await readFile('dist/index.html','utf8');
const knowledge=JSON.parse(await readFile('dist/knowledge.json','utf8'));
const {window,document}=parseHTML(html);
globalThis.document=document;
globalThis.location={hash:'',reload(){}};
globalThis.fetch=async()=>({ok:true,json:async()=>knowledge});
await import('../src/app.js');
await new Promise(resolve=>setTimeout(resolve,10));
const $=q=>document.querySelector(q);
const click=e=>e.dispatchEvent(new window.Event('click',{bubbles:true}));
const settle=()=>new Promise(resolve=>setTimeout(resolve,230));
const submit=async q=>{$('#question').value=q;$('#chat-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await settle();};
const lastAnswer=()=>[...document.querySelectorAll('.assistant-message')].at(-1);

test('landing identity and all major sections render',()=>{
  assert.match($('#hero-title').textContent,/Hosna Ara/);
  for(const id of ['home','about','work','assistant','research','publications','experience','education','skills','leadership','contact'])assert.ok($(`#${id}`),id);
  assert.equal(document.querySelectorAll('.project-card').length,4);
  assert.equal(document.querySelectorAll('.publication').length,3);
  assert.equal(document.querySelectorAll('.education-entry').length,2);
  assert.match($('#about-summary').textContent,/nearly four years/);
});
test('all rendered internal anchors resolve',()=>{for(const a of document.querySelectorAll('a[href^="#"]'))assert.ok(document.getElementById(a.getAttribute('href').slice(1)),a.outerHTML);});
test('the only working assistant is in the hero, with input and starters exposed immediately',()=>{
  assert.equal(document.querySelectorAll('#assistant').length,1);assert.equal(document.querySelectorAll('#chat-form').length,1);
  assert.ok($('#home #assistant #question'));assert.equal($('#chat-welcome').hidden,false);assert.equal($('#question').disabled,false);
  assert.equal($('#home img'),null);assert.equal($('#home .hero-object'),null);assert.equal($('#home #suggestions').children.length,4);
  assert.match($('.conversation-invitation').textContent,/work, projects, research, experience or education/);
});
test('evidence sections follow the requested sequence',()=>{
  const markup=document.body.innerHTML;const ids=['work','experience','research','education','skills','leadership','contact'];
  let last=-1;for(const id of ids){const position=markup.indexOf(`id="${id}"`);assert.ok(position>last,id);last=position;}
});
test('seven reviewed previews render with accessible text and intrinsic dimensions',()=>{
  const images=[...document.querySelectorAll('.portfolio-media img')];assert.equal(images.length,7);
  for(const image of images){assert.ok(image.alt.length>20);assert.ok(Number(image.width)>0&&Number(image.height)>0);assert.match(image.src,/assets\/selected\/.+\.jpg$/);}
  assert.equal(document.querySelectorAll('iframe,embed,object').length,0);
});
test('all rendered external links belong to approved knowledge',()=>{
  const approved=new Set([...knowledge.links,...knowledge.entities.flatMap(e=>e.urls)].map(e=>e.url));
  for(const a of document.querySelectorAll('a[href^="https:"],a[href^="mailto:"]')){assert.ok(approved.has(a.getAttribute('href')),a.outerHTML);if(a.target==='_blank')assert.match(a.rel,/noopener/);}
});
test('project filtering and reset update visibility and accessibility',()=>{
  click($('[data-filter="bi"]'));const visible=[...document.querySelectorAll('.project-card')].filter(c=>!c.hidden);
  assert.equal(visible.length,1);assert.equal(visible[0].id,'project-tasenergy');assert.equal($('[data-filter="bi"]').getAttribute('aria-pressed'),'true');assert.match($('#filter-status').textContent,/1 project/);
  click($('[data-filter="all"]'));assert.ok([...document.querySelectorAll('.project-card')].every(c=>!c.hidden));
});
test('mobile menu opens, closes on navigation and supports Escape',()=>{
  click($('#menu-toggle'));assert.equal($('#menu-toggle').getAttribute('aria-expanded'),'true');assert.ok($('#main-nav').classList.contains('open'));
  click($('#main-nav a'));assert.equal($('#menu-toggle').getAttribute('aria-expanded'),'false');
  click($('#menu-toggle'));const escape=new window.Event('keydown');escape.key='Escape';document.dispatchEvent(escape);assert.equal($('#menu-toggle').getAttribute('aria-expanded'),'false');
});
test('suggested questions run the real app handlers and produce cited answers',async()=>{
  for(const b of document.querySelectorAll('#suggestions button')){click($('#clear-chat'));assert.equal($('#chat-welcome').hidden,false);click(b);assert.equal($('#chat-form button').disabled,true);assert.equal($('#chat-welcome').hidden,true);await settle();assert.match(lastAnswer().textContent,/Source:/,b.textContent);assert.doesNotMatch(lastAnswer().textContent,/don't have verified/,b.textContent);assert.equal($('#chat-form button').disabled,false);assert.equal($('#chat-log').getAttribute('aria-busy'),'false');}
});
test('typed education, research, latest project and BI queries work inside the hero',async()=>{
  for(const [q,evidence] of [['Tell me about her education.','expected'],['Tell me about her research.','PRISMA'],['Show me her latest AI project.','UTAS Research Degree Assistant'],['What is her Data & BI experience?','Power BI']]){await submit(q);assert.ok(lastAnswer().textContent.includes(evidence),q);assert.ok($('#home').contains(lastAnswer()));}
  assert.ok(lastAnswer().querySelector('a[href="#analytics"]'));
});
test('typed contextual follow-up keeps the selected project and verified GitHub action',async()=>{
  await submit('Tell me about the UTAS Research Degree Assistant.');await submit('Tell me more');assert.match(lastAnswer().textContent,/UTAS Research Degree Assistant/);assert.ok(lastAnswer().querySelector('a[href="https://github.com/Hosna-Ara/utas-research-degree-assistant"]'));
});
test('contextual project navigation unhides a filtered destination',async()=>{
  await submit('What was her role in CyberQuiz Pro?');assert.match(lastAnswer().textContent,/Project Manager \/ Communication Lead/);
  click($('[data-filter="bi"]'));assert.ok($('#project-cyberquiz').hidden);
  const link=lastAnswer().querySelector('a[href="#project-cyberquiz"]');assert.ok(link);click(link);assert.equal($('#project-cyberquiz').hidden,false);
});
test('contextual follow-up questions work',async()=>{
  await submit('Tell me about her research.');const b=lastAnswer().querySelector('.followups button');assert.match(b.textContent,/published/);click(b);await settle();assert.match(lastAnswer().textContent,/Springer/);
});
test('unknown answer does not invent evidence or a URL',async()=>{
  await submit('Does she have experience with Kubernetes?');assert.match(lastAnswer().textContent,/don't have verified/);assert.equal(lastAnswer().querySelectorAll('a').length,0);
});
test('injected markup is displayed only as text',async()=>{
  await submit('<img src=x onerror=alert(1)>');assert.equal($('#chat-log').querySelectorAll('img').length,0);assert.ok($('#chat-log').textContent.includes('<img src=x onerror=alert(1)>'));
});
test('clear resets messages, context and character count',()=>{
  click($('#clear-chat'));assert.equal(document.querySelectorAll('.message').length,1);assert.equal($('#question').value,'');assert.equal($('#char-count').textContent,'0 / 400');assert.equal($('#chat-welcome').hidden,false);
});
test('empty submissions do not create messages',async()=>{await submit('   ');assert.equal(document.querySelectorAll('.message').length,1);});
test('project exploration buttons ask about the selected project',async()=>{
  click($('#project-threatbrief button'));await settle();assert.equal(location.hash,'assistant');assert.match(lastAnswer().textContent,/winning team/);assert.match(lastAnswer().textContent,/coordination/);
});
test('no prohibited private facts appear in rendered application',()=>{
  assert.doesNotMatch(document.body.textContent,/SYNTHETIC_PRIVATE_ADDRESS|SYNTHETIC_PRIVATE_PHONE|SYNTHETIC_SECRET/);
});
test('reduced motion, mobile layouts and focus treatment are defined',async()=>{
  const css=await readFile('dist/styles.css','utf8');assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:480px\)/);assert.match(css,/\.input-row input\{[^}]*min-width:0/);
});
test('missing preview keeps the description and hides its broken image action',()=>{
  const image=$('.project-preview img');image.dispatchEvent(new window.Event('error'));
  assert.equal($('.project-preview .image-link').hidden,true);assert.equal($('.project-preview .image-fallback').hidden,false);assert.match($('#project-utas-assistant').textContent,/Independently built/);
});
test('assistant branding and accessible form/log semantics remain intact',()=>{
 const logo=$('.site-header .brand-mark');assert.ok(logo);assert.equal(logo.alt,'Hosna Ara');assert.equal(logo.getAttribute('width'),'256');assert.equal(logo.getAttribute('height'),'128');assert.equal(logo.getAttribute('src'),'./assets/hosna-brand-mark-cropped.png');assert.equal(logo.parentElement.getAttribute('aria-label'),'Hosna Ara, home');
 assert.equal($('#assistant-title').textContent,"Hosna's Personal AI Assistant");
 assert.doesNotMatch(document.body.textContent,/Hosna AI|HOSNA AI/);
 assert.equal($('#chat-log').getAttribute('role'),'log');assert.equal($('#chat-log').getAttribute('aria-live'),'polite');
 assert.ok(document.querySelector('label[for="question"]'));assert.equal($('#question').getAttribute('maxlength'),'400');
 assert.ok(document.querySelector('.skip-link[href="#main"]'));
});
test('current work excludes completed projects and narrow follow-ups render metadata',async()=>{
 await submit('What is Hosna working on currently?');assert.match(lastAnswer().textContent,/UTAS Research Degree Assistant/);assert.match(lastAnswer().textContent,/interactive AI portfolio/);assert.doesNotMatch(lastAnswer().textContent,/ThreatBrief/);
 await submit('Tell me about ThreatBrief');await submit('Is she still working on it?');assert.match(lastAnswer().textContent,/Status: completed/);
 await submit('Tell me about the UTAS Research Degree Assistant');await submit('What technologies did she use?');assert.match(lastAnswer().textContent,/Technologies: Python/);assert.doesNotMatch(lastAnswer().textContent,/Independently built/);
 await submit('Where is her ORCID profile?');assert.ok(lastAnswer().querySelector('a[href^="https://orcid.org/"]'));
});
test('knowledge load failure displays recovery UI and disables chat',async()=>{
  const fresh=parseHTML(html);globalThis.document=fresh.document;globalThis.fetch=async()=>{throw Error('unavailable');};
  await import('../src/app.js?failure');await settle();
  assert.match(fresh.document.querySelector('[role="alert"]').textContent,/Retry loading/);assert.equal(fresh.document.querySelector('#chat-form button').disabled,true);
});
