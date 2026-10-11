import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {createMediaCarousel,mediaURL} from '../src/carousel.js';
const image={type:'image',path:'assets/selected/first.jpg',caption:'First caption',alt:'First project view',width:1400,height:800,order:1};
const certificate={...image,path:'assets/selected/certificate.jpg',caption:'Certificate caption',alt:'Individual certificate',width:1335,height:1888,order:2};
const settle=async()=>{await Promise.resolve();await Promise.resolve();};
async function setup(t,items=[image,certificate]){
 const {document,window}=parseHTML('<html><body><main>Portfolio</main></body></html>');globalThis.document=document;
 const root=createMediaCarousel(items,'Project');document.querySelector('main').append(root);
 const emit=(target,type,properties={})=>{const event=new window.Event(type,{bubbles:true,cancelable:true});Object.assign(event,properties);target.dispatchEvent(event);return event;};
 t.after(async()=>{document.querySelector('.project-gallery button')?.click();root.remove();await settle();});
 return {root,document,window,emit,open:()=>emit(root.querySelector('.image-link'),'click'),gallery:()=>document.querySelector('.project-gallery')};
}
test('selected image opens a named gallery, locks scrolling and restores original state on close',async t=>{
 const h=await setup(t);h.document.body.style.overflow='auto';h.document.documentElement.style.overflow='scroll';
 const existing=h.document.createElement('aside');existing.setAttribute('inert','');h.document.body.append(existing);
 h.emit(h.root.querySelector('button'),'click');const opener=h.root.querySelector('a');let restored=false;opener.focus=()=>{restored=true;};
 assert.equal(h.open().defaultPrevented,true);const dialog=h.gallery();
 assert.equal(dialog.getAttribute('role'),'dialog');assert.equal(dialog.getAttribute('aria-modal'),'true');assert.equal(dialog.getAttribute('aria-label'),'Project image gallery');
 assert.match(dialog.querySelector('img').src,/certificate.jpg$/);assert.equal(dialog.querySelector('img').alt,certificate.alt);
 assert.equal(dialog.querySelector('img').height,1888);assert.equal(dialog.querySelector('figcaption').textContent,certificate.caption);
 assert.equal(dialog.querySelector('.gallery-position').textContent,'2 / 2');assert.equal(h.document.body.style.overflow,'hidden');assert.ok(h.document.querySelector('main').hasAttribute('inert'));
 h.emit(dialog.querySelector('button'),'click');assert.equal(h.gallery(),null);assert.ok(restored);
 assert.equal(h.document.body.style.overflow,'auto');assert.equal(h.document.documentElement.style.overflow,'scroll');assert.ok(!h.document.querySelector('main').hasAttribute('inert'));assert.ok(existing.hasAttribute('inert'));
});
test('gallery buttons and keyboard navigate, wrap and Escape closes',async t=>{
 const h=await setup(t);h.open();const dialog=h.gallery();
 h.emit(dialog.querySelector('[aria-label="Next gallery image"]'),'click');assert.equal(dialog.querySelector('figcaption').textContent,certificate.caption);
 h.emit(dialog,'keydown',{key:'ArrowRight'});assert.equal(dialog.querySelector('figcaption').textContent,image.caption);
 h.emit(dialog,'keydown',{key:'ArrowLeft'});assert.equal(dialog.querySelector('figcaption').textContent,certificate.caption);
 h.emit(dialog.querySelector('[aria-label="Previous gallery image"]'),'click');assert.equal(dialog.querySelector('figcaption').textContent,image.caption);
 assert.equal(h.emit(dialog,'keydown',{key:'Escape'}).defaultPrevented,true);assert.equal(h.gallery(),null);
});
test('Tab and Shift+Tab wrap focus within gallery controls',async t=>{
 const h=await setup(t);h.open();const dialog=h.gallery(),buttons=dialog.querySelectorAll('button');
 let target;buttons[0].focus=()=>{target='first';};buttons[buttons.length-1].focus=()=>{target='last';};
 Object.defineProperty(h.document,'activeElement',{value:buttons[buttons.length-1],configurable:true});
 assert.equal(h.emit(dialog,'keydown',{key:'Tab'}).defaultPrevented,true);assert.equal(target,'first');
 Object.defineProperty(h.document,'activeElement',{value:buttons[0],configurable:true});
 assert.equal(h.emit(dialog,'keydown',{key:'Tab',shiftKey:true}).defaultPrevented,true);assert.equal(target,'last');
});
test('gallery swipe respects horizontal direction, ignores vertical motion and cancellation',async t=>{
 const h=await setup(t);h.open();const figure=h.gallery().querySelector('figure');
 const start=()=>h.emit(figure,'touchstart',{touches:[{clientX:200,clientY:20}]});
 const end=(x,y)=>h.emit(figure,'touchend',{changedTouches:[{clientX:x,clientY:y}]});
 start();end(100,25);assert.equal(h.gallery().querySelector('figcaption').textContent,certificate.caption);
 start();end(180,200);assert.equal(h.gallery().querySelector('figcaption').textContent,certificate.caption);
 start();h.emit(figure,'touchcancel');end(100,25);assert.equal(h.gallery().querySelector('figcaption').textContent,certificate.caption);
 start();end(300,25);assert.equal(h.gallery().querySelector('figcaption').textContent,image.caption);
});
test('single-image gallery has only a close control and mixed media gallery skips future videos',async t=>{
 const h=await setup(t,[image]);h.open();assert.equal(h.gallery().querySelectorAll('button').length,1);assert.equal(h.gallery().querySelector('.gallery-position').textContent,'1 / 1');
 h.emit(h.gallery().querySelector('button'),'click');
 const mixed=createMediaCarousel([image,{...image,type:'video',path:'assets/selected/synthetic.mp4',order:2}, {...certificate,order:3}],'Mixed');h.document.querySelector('main').append(mixed);
 h.emit(mixed.querySelector('a'),'click');assert.equal(h.gallery().querySelector('.gallery-position').textContent,'1 / 2');
 h.emit(h.gallery(),'keydown',{key:'ArrowRight'});assert.equal(h.gallery().querySelector('figcaption').textContent,certificate.caption);assert.equal(h.gallery().querySelector('video'),null);
});
test('modified clicks keep the full-size image link and do not open an overlay',async t=>{
 const h=await setup(t);
 for(const change of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1}])assert.equal(h.emit(h.root.querySelector('a'),'click',change).defaultPrevented,false);
 assert.equal(h.gallery(),null);assert.match(h.root.querySelector('a').href,/first.jpg$/);assert.equal(h.root.querySelector('a').target,'_blank');
});
test('gallery cleanup handles removal and reopening without stacking overlays',async t=>{
 const h=await setup(t);h.open();h.open();assert.equal(h.document.querySelectorAll('.project-gallery').length,1);
 h.root.remove();await settle();assert.equal(h.gallery(),null);assert.notEqual(h.document.body.style.overflow,'hidden');
});
test('missing gallery image leaves the verified caption and navigation available',async t=>{
 const h=await setup(t);h.open();h.emit(h.gallery().querySelector('img'),'error');
 assert.equal(h.gallery().querySelector('img').hidden,true);assert.equal(h.gallery().querySelector('.image-fallback').hidden,false);assert.equal(h.gallery().querySelector('figcaption').textContent,image.caption);
 h.emit(h.gallery(),'keydown',{key:'ArrowRight'});assert.equal(h.gallery().querySelector('img').hidden,false);
});
test('gallery reuses reviewed media URLs and displays captions as text without markup injection',async t=>{
 const item={...image,caption:'<img src=x onerror=alert(1)> Public caption'};
 const h=await setup(t,[item]);h.open();const dialog=h.gallery();
 assert.equal(dialog.querySelector('img').src,mediaURL(item.path));assert.equal(dialog.querySelectorAll('img').length,1);
 assert.equal(dialog.querySelector('figcaption').textContent,item.caption);assert.equal(dialog.querySelectorAll('iframe,script,video').length,0);
 assert.equal(mediaURL(item.path,'https://hosna-ara.github.io/hosna-ai-portfolio/src/carousel.js'),'https://hosna-ara.github.io/hosna-ai-portfolio/assets/selected/first.jpg');
});
test('native dialog opening and cancellation clean up the overlay once',async t=>{
 const h=await setup(t);const create=h.document.createElement.bind(h.document);let opened=0,closed=0;
 t.mock.method(h.document,'createElement',tag=>{
  const element=create(tag);
  if(tag==='dialog'){
   element.showModal=()=>{opened++;element.setAttribute('open','');};
   element.close=()=>{closed++;h.emit(element,'close');};
  }
  return element;
 });
 h.open();assert.equal(opened,1);const dialog=h.gallery();
 assert.equal(h.emit(dialog,'cancel').defaultPrevented,true);assert.equal(closed,1);assert.equal(h.gallery(),null);
 h.emit(dialog,'close');assert.notEqual(h.document.body.style.overflow,'hidden');
});
