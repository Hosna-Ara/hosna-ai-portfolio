import {LocalKnowledgeProvider} from './providers.js';
import {suggestions} from './retrieval.js';
const $ = selector => document.querySelector(selector);
const el = (tag, className, text) => {const node=document.createElement(tag);if(className)node.className=className;if(text)node.textContent=text;return node;};
const external = ({label,url}) => {const a=el('a','',`${label} ↗`);a.href=url;if(url.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer';}return a;};
const jump = (anchor,label) => {const a=el('a','',label);a.href=`#${anchor}`;return a;};
const button = (text, action) => {const b=el('button','',text);b.type='button';b.addEventListener('click',action);return b;};
const menu = $('#menu-toggle');
menu.addEventListener('click',() => {const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));$('#main-nav').classList.toggle('open',open);});
$('#main-nav').addEventListener('click',e=>{if(e.target.closest('a')){menu.setAttribute('aria-expanded','false');$('#main-nav').classList.remove('open');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){menu.click();menu.focus();}});
let entities=[], previousIds=[], busy=false;
const provider=new LocalKnowledgeProvider();
const initialMessage=$('#chat-log').firstElementChild.cloneNode(true);

function tags(values){const group=el('div','tags');values.forEach(t=>group.append(el('span','tag',t)));return group;}
function mediaFigure(media, className='') {
  const figure=el('figure',`portfolio-media ${className}`);
  const link=el('a','image-link');link.href=`./${media.src}`;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`View larger image: ${media.title || media.alt}`);
  const image=el('img');image.src=`./${media.src}`;image.alt=media.alt;image.width=media.width;image.height=media.height;image.loading='lazy';image.decoding='async';
  const fallback=el('p','image-fallback','Preview unavailable. The verified description remains below.');fallback.hidden=true;
  image.addEventListener('error',()=>{link.hidden=true;fallback.hidden=false;figure.classList.add('missing-image');});
  link.append(image);figure.append(link,fallback,el('figcaption','',media.caption));return figure;
}
function renderProjects(media){
  const art = {'utas-assistant':['KNOWLEDGE-GROUNDED AI','Research, connected.'],'threatbrief':['HACKATHON WINNING TEAM','Signals into intelligence.'],'cyberquiz':['COLLABORATIVE DELIVERY','Learning, adaptive.'],'tasenergy':['DATA & BI · IN PROGRESS','Energy in perspective.']};
  entities.filter(e=>e.category==='projects'&&e.featured!==false).forEach(e=>{
    const card=el('article','project-card');card.id=e.anchor;card.dataset.tags=e.tags.join(' ');
    let visual;
    if(media.projects[e.id]){visual=mediaFigure(media.projects[e.id],'project-preview');}
    else{visual=el('div','project-art');visual.setAttribute('aria-hidden','true');visual.append(el('span','art-label',art[e.id][0]),el('span','art-title',art[e.id][1]));}
    const body=el('div','project-body');body.append(el('p','card-kicker',e.date.toUpperCase()),el('h3','',e.title),el('p','',e.summary),el('p','role',e.role),tags(e.technologies.slice(0,5)));
    const links=el('div','card-links');e.urls.forEach(u=>links.append(external(u)));links.append(button('Explore with the assistant →',()=>{location.hash='assistant';ask(`Tell me about ${e.title}.`);$('#question').focus({preventScroll:true});}));body.append(links);card.append(visual,body);$('#projects').append(card);
  });
}
function renderContent(links,media){
  $('#about-summary').textContent=entities.find(e=>e.id==='profile').summary;
  renderProjects(media);
  for(const item of media.dashboards){const card=el('article','dashboard-example');card.append(mediaFigure(item,'dashboard-preview'),el('h4','',item.title),el('p','',item.description));$('#dashboard-previews').append(card);}
  for(const item of media.moments){const card=el('article','leadership-moment');const copy=el('div','moment-copy');copy.append(el('h3','',item.title),el('p','',item.description));if(item.anchor!=='leadership')copy.append(jump(item.anchor,'Explore the team project →'));card.append(mediaFigure(item,'moment-preview'),copy);$('#leadership-moments').append(card);}
  entities.filter(e=>e.category==='research'&&e.featured!==false).forEach(e=>{const c=el('article','research-card');c.append(el('span','date',e.date),el('h3','',e.title),el('p','',e.summary));e.urls.forEach(u=>{const a=external(u);a.className='text-link';c.append(a);});$('#research-list').append(c);});
  entities.filter(e=>e.category==='publications').forEach(e=>{const c=el('article','publication'),body=el('div');body.append(el('h4','',e.title),el('p','',e.summary));c.append(el('span','year',e.date),body,external(e.urls[0]));$('#publication-list').append(c);});
  for(const [category,target,cls] of [['experience','#experience-list','timeline-entry'],['education','#education-list','education-entry'],['skills','#skills-list','skill-entry'],['achievements','#leadership-list','leadership-card'],['leadership','#leadership-list','leadership-card']]){
    entities.filter(e=>e.category===category).forEach(e=>{const c=el('article',cls);if(category!=='skills')c.append(el('span','date',e.date));c.append(el('h3','',e.title),el('p','',e.summary));$(target).append(c);});
  }
  links.filter(l=>l.label!=='Previous portfolio').forEach(l=>$('#contact-links').append(external(l)));
  suggestions.forEach(q=>$('#suggestions').append(button(q,()=>{ask(q);$('#question').focus({preventScroll:true});})));
}
function showAllProjects(){document.querySelector('[data-filter="all"]').click();}
document.addEventListener('click',e=>{const link=e.target.closest('a[href^="#project-"]');if(link)showAllProjects();if(e.target.closest('a[href="#about"]'))$('#about').open=true;});
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.filter').forEach(f=>{f.classList.toggle('active',f===b);f.setAttribute('aria-pressed',String(f===b));});
  let count=0;document.querySelectorAll('.project-card').forEach(c=>{c.hidden=b.dataset.filter!=='all'&&!c.dataset.tags.split(' ').includes(b.dataset.filter);if(!c.hidden)count++;});
  $('#filter-status').textContent=`Showing ${count} ${count===1?'project':'projects'}.`;
}));
function renderAnswer(answer){
  const msg=el('div','message assistant-message');msg.append(el('span','message-label','ASSISTANT · VERIFIED KNOWLEDGE'));
  if(answer.text)msg.append(el('p','',answer.text));
  if(answer.notice)msg.append(el('p','message-footnote',answer.notice));
  for(const e of answer.entries){const entry=el('div','answer-entry');entry.append(el('h4','',e.title),el('p','',answer.details?.[e.id] || e.summary));if(e.role && (!answer.facet || answer.facet==='summary'))entry.append(el('p','message-footnote',`Role: ${e.role}`));entry.append(el('p','answer-source',`Source: ${e.source}`));const actions=el('div','answer-actions');actions.append(jump(e.anchor,e.category==='publications'?'Explore publications →':e.category==='projects'?'View project →':`Explore ${e.category==='profile'?'background':e.category} →`));if(e.category==='experience'||e.id==='skills-bi')actions.append(jump('analytics','View dashboard examples →'));e.urls.forEach(u=>actions.append(external(u)));entry.append(actions);msg.append(entry);}
  const followups=el('div','followups');answer.followups.forEach(q=>followups.append(button(q,()=>ask(q))));msg.append(followups);return msg;
}
async function ask(raw){
  const question=raw.trim().slice(0,400);if(!question||busy||!entities.length)return;
  busy=true;$('#assistant').classList.add('has-conversation');$('#chat-welcome').hidden=true;const log=$('#chat-log');log.setAttribute('aria-busy','true');const user=el('div','message user-message');user.append(el('span','message-label','YOU'),el('p','',question));log.append(user);
  $('#question').value='';$('#char-count').textContent='0 / 400';$('#chat-status').textContent='Finding relevant portfolio knowledge…';$('#chat-form button').disabled=true;$('#clear-chat').disabled=true;
  log.scrollTop=log.scrollHeight;
  try{const answer=await provider.answer(question,entities,previousIds);previousIds=answer.entries.map(e=>e.id);const response=renderAnswer(answer);log.append(response);log.scrollTop=response.offsetTop-log.offsetTop;}
  catch{const error=el('div','message assistant-message');error.append(el('p','','I couldn’t load an answer. Please try again or explore the sections below.'));log.append(error);}
  finally{busy=false;log.setAttribute('aria-busy','false');$('#chat-status').textContent='';$('#chat-form button').disabled=false;$('#clear-chat').disabled=false;}
}
$('#chat-form').addEventListener('submit',e=>{e.preventDefault();ask($('#question').value);});
$('#question').addEventListener('input',()=>{$('#char-count').textContent=`${$('#question').value.length} / 400`;});
$('#clear-chat').addEventListener('click',()=>{$('#chat-log').replaceChildren(initialMessage.cloneNode(true));$('#assistant').classList.remove('has-conversation');$('#chat-welcome').hidden=false;previousIds=[];$('#question').value='';$('#char-count').textContent='0 / 400';$('#question').focus();});
async function init(){
  try{const response=await fetch(new URL('../knowledge.json',import.meta.url));if(!response.ok)throw new Error('Knowledge unavailable');const data=await response.json();entities=data.entities.filter(e=>e.visibility==='public');renderContent(data.links,data.media || {projects:{},dashboards:[],moments:[]});$('#chat-status').textContent='';$('#chat-form button').disabled=false;}
  catch{const error=el('div','load-error');error.setAttribute('role','alert');error.append(el('p','','Portfolio details could not load. Please retry or contact Hosna by email.'),button('Retry loading',()=>location.reload()));$('#main').prepend(error);$('#chat-status').textContent='Knowledge unavailable. Please reload to try again.';$('#chat-form button').disabled=true;}
}
init();
