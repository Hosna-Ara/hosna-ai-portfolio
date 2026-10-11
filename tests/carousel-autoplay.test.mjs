import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {createMediaCarousel,openImageGallery} from '../src/carousel.js';

const image={type:'image',path:'assets/selected/example.jpg',caption:'First',alt:'First project screenshot',width:100,height:80,order:1};
const items=[image,{...image,caption:'Second',order:2}];
const settle=async()=>{await Promise.resolve();await Promise.resolve();};
async function setup(t,{slides=items,reduced=false}={}) {
  const {document,window}=parseHTML('<html><body></body></html>');
  globalThis.document=document;
  const motion=new window.EventTarget();motion.matches=reduced;
  const original=window.matchMedia;window.matchMedia=()=>motion;
  t.after(()=>{window.matchMedia=original;});
  t.mock.timers.enable({apis:['setTimeout']});
  const schedule=t.mock.method(window,'setTimeout');
  const root=createMediaCarousel(slides,'Example');document.body.append(root);await settle();
  t.after(async()=>{root.remove();await settle();});
  const emit=(target,type,properties={})=>{const event=new window.Event(type,{bubbles:true});Object.assign(event,properties);target.dispatchEvent(event);};
  return {root,window,document,motion,emit,schedule,tick:ms=>t.mock.timers.tick(ms),caption:()=>root.querySelector('figcaption').textContent};
}

test('autoplay advances at exactly 2000ms, loops and resets after manual navigation',async t=>{
 const h=await setup(t);h.tick(1999);assert.equal(h.caption(),'First');h.tick(1);assert.equal(h.caption(),'Second');
 assert.equal(h.root.querySelector('.carousel-position').textContent,'2 / 2');
 assert.equal(h.root.querySelector('.carousel-position').getAttribute('aria-live'),'off');
 h.tick(2000);assert.equal(h.caption(),'First');h.tick(1000);
 h.emit(h.root.querySelectorAll('button')[1],'click');assert.equal(h.caption(),'Second');
 assert.equal(h.root.querySelector('.carousel-position').getAttribute('aria-live'),'polite');
 h.tick(1000);assert.equal(h.caption(),'Second');h.tick(999);assert.equal(h.caption(),'Second');h.tick(1);assert.equal(h.caption(),'First');
});
test('hover and keyboard focus both pause; leaving one alone does not resume',async t=>{
 const h=await setup(t);h.tick(1000);h.emit(h.root,'mouseenter');h.tick(5000);assert.equal(h.caption(),'First');
 h.emit(h.root,'focusin');h.emit(h.root,'mouseleave');h.tick(5000);assert.equal(h.caption(),'First');
 h.emit(h.root,'focusout',{relatedTarget:h.root.querySelector('button')});h.tick(5000);assert.equal(h.caption(),'First');
 h.emit(h.root,'focusout',{relatedTarget:null});h.tick(1999);assert.equal(h.caption(),'First');h.tick(1);assert.equal(h.caption(),'Second');
 h.emit(h.root,'mouseenter');h.emit(h.root,'mouseleave');h.tick(2000);assert.equal(h.caption(),'First');
});
test('reduced motion disables autoplay and preference changes clear/restart one timer',async t=>{
 const h=await setup(t,{reduced:true});h.tick(10000);assert.equal(h.caption(),'First');
 h.motion.matches=false;h.emit(h.motion,'change');h.tick(1000);
 h.motion.matches=true;h.emit(h.motion,'change');h.tick(5000);assert.equal(h.caption(),'First');
 h.motion.matches=false;h.emit(h.motion,'change');h.emit(h.motion,'change');h.tick(2000);assert.equal(h.caption(),'Second');
 h.tick(2000);assert.equal(h.caption(),'First');
});
test('single-slide carousel creates no autoplay lifecycle or timers',async t=>{
 const h=await setup(t,{slides:[image]});h.tick(10000);assert.equal(h.caption(),'First');assert.equal(h.root.querySelector('button'),null);
 assert.equal(h.schedule.mock.callCount(),0);
});
test('keyboard and swipe navigation each reset the autoplay interval',async t=>{
 const h=await setup(t);h.tick(1000);h.emit(h.root,'keydown',{key:'ArrowRight'});
 h.tick(1999);assert.equal(h.caption(),'Second');h.tick(1);assert.equal(h.caption(),'First');
 h.tick(1000);const viewport=h.root.querySelector('.carousel-viewport');
 h.emit(viewport,'touchstart',{touches:[{clientX:200,clientY:20}]});
 h.emit(viewport,'touchend',{changedTouches:[{clientX:100,clientY:25}]});
 h.tick(1999);assert.equal(h.caption(),'Second');h.tick(1);assert.equal(h.caption(),'First');
});
test('playing video pauses autoplay; paused or ended video resumes without playing automatically',async t=>{
 const video={...image,type:'video',path:'assets/selected/example.mp4',caption:'Video'};
 const h=await setup(t,{slides:[video,items[1]]});const player=h.root.querySelector('video');player.pause=()=>{};
 assert.equal(player.hasAttribute('autoplay'),false);
 h.emit(player,'play');h.tick(10000);assert.equal(h.caption(),'Video');
 h.emit(player,'pause');h.tick(1000);h.emit(player,'play');h.tick(10000);assert.equal(h.caption(),'Video');
 h.emit(player,'ended');h.tick(1999);assert.equal(h.caption(),'Video');h.tick(1);assert.equal(h.caption(),'Second');
});
test('removal cleans up timers and global preference/page listeners',async t=>{
 const h=await setup(t);h.root.remove();await settle();h.tick(10000);assert.equal(h.caption(),'First');
 h.motion.matches=false;h.emit(h.motion,'change');h.emit(h.window,'pageshow');h.tick(10000);assert.equal(h.caption(),'First');
 // A disposed instance does not resurrect its timer if the same node is reinserted.
 h.document.body.append(h.root);await settle();h.tick(10000);assert.equal(h.caption(),'First');
});
test('hidden documents and page lifecycle pause timers and resume a fresh interval',async t=>{
 const h=await setup(t);h.tick(1000);
 h.document.visibilityState='hidden';h.emit(h.document,'visibilitychange');h.tick(5000);assert.equal(h.caption(),'First');
 h.document.visibilityState='visible';h.emit(h.document,'visibilitychange');h.tick(2000);assert.equal(h.caption(),'Second');
 h.emit(h.window,'pagehide');h.tick(5000);assert.equal(h.caption(),'Second');
 h.emit(h.window,'pageshow');h.tick(2000);assert.equal(h.caption(),'First');
});
test('open gallery pauses all carousels and closing resumes fresh timers with focus/reduced-motion guards',async t=>{
 const h=await setup(t);const other=createMediaCarousel(items,'Other');h.document.body.append(other);await settle();
 t.after(()=>other.remove());h.tick(1000);h.emit(h.root.querySelector('a'),'click');
 const gallery=h.document.querySelector('.project-gallery');assert.ok(gallery);
 h.tick(10000);assert.equal(h.caption(),'First');assert.equal(other.querySelector('figcaption').textContent,'First');
 h.emit(gallery,'keydown',{key:'ArrowRight'});assert.equal(gallery.querySelector('figcaption').textContent,'Second');assert.equal(h.caption(),'First');
 h.emit(h.root,'focusin');h.emit(gallery,'keydown',{key:'Escape'});
 h.tick(2000);assert.equal(h.caption(),'First');assert.equal(other.querySelector('figcaption').textContent,'Second');
 h.emit(h.root,'focusout',{relatedTarget:null});h.tick(1999);assert.equal(h.caption(),'First');h.tick(1);assert.equal(h.caption(),'Second');
 h.emit(h.root.querySelector('a'),'click');h.motion.matches=true;h.emit(h.motion,'change');
 h.emit(h.document.querySelector('.project-gallery'),'keydown',{key:'Escape'});h.tick(10000);assert.equal(h.caption(),'Second');
});
test('achievement gallery opened outside a carousel pauses and resumes project autoplay',async t=>{
 const h=await setup(t),opener=h.document.createElement('a');h.document.body.append(opener);
 h.tick(1000);openImageGallery(items,items[1],'Achievement',opener);
 h.tick(10000);assert.equal(h.caption(),'First');assert.equal(h.document.querySelector('.gallery-position').textContent,'2 / 2');
 h.emit(h.document.querySelector('.project-gallery'),'keydown',{key:'Escape'});
 h.tick(1999);assert.equal(h.caption(),'First');h.tick(1);assert.equal(h.caption(),'Second');
});
