const node = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
};
// Relative to the module, so nested GitHub Pages paths and fragment navigation work.
export const mediaURL = (path, moduleURL=import.meta.url) => new URL(`../${path}`, moduleURL).href;

let activeGallery = null;
export function openImageGallery(items, selected, title, opener, onClose=()=>{}) {
  activeGallery?.();
  const doc=opener.ownerDocument;
  const images=items.filter(item=>item.type==='image');
  let index=images.indexOf(selected), closed=false, touchStart=null;
  const dialog=node('dialog','project-gallery');
  dialog.setAttribute('aria-label',`${title} image gallery`);
  dialog.setAttribute('aria-modal','true');
  dialog.setAttribute('role','dialog');
  const header=node('div','gallery-header');
  header.append(node('h2','',title));
  const close=node('button','','Close ×');close.type='button';close.setAttribute('aria-label','Close image gallery');
  header.append(close);
  const figure=node('figure','gallery-figure'),image=node('img'),caption=node('figcaption');
  image.decoding='async';figure.append(image,caption);
  const fallback=node('p','image-fallback','Image unavailable. The verified caption remains below.');fallback.hidden=true;
  figure.append(fallback);
  image.addEventListener('error',()=>{image.hidden=true;fallback.hidden=false;});
  const controls=node('div','gallery-controls'),position=node('span','gallery-position');
  position.setAttribute('aria-live','polite');position.setAttribute('aria-atomic','true');
  const previous=node('button','','←'),next=node('button','','→');
  for(const [control,label] of [[previous,'Previous gallery image'],[next,'Next gallery image']]){control.type='button';control.setAttribute('aria-label',label);}
  if(images.length>1)controls.append(previous,position,next);else controls.append(position);
  dialog.append(header,figure,controls);
  function render(){
    const item=images[index];image.hidden=false;fallback.hidden=true;
    image.src=mediaURL(item.path);image.alt=item.alt;image.width=item.width;image.height=item.height;
    caption.textContent=item.caption;position.textContent=`${index+1} / ${images.length}`;
  }
  const move=delta=>{index=(index+delta+images.length)%images.length;render();};
  const overflow=[doc.body.style.overflow,doc.documentElement.style.overflow];
  const background=[...doc.body.children].map(element=>[element,element.hasAttribute('inert')]);
  background.forEach(([element])=>element.setAttribute('inert',''));
  doc.body.style.overflow='hidden';doc.documentElement.style.overflow='hidden';
  function finish(){
    if(closed)return;closed=true;observer.disconnect();
    dialog.remove();
    background.forEach(([element,wasInert])=>{if(!wasInert)element.removeAttribute('inert');});
    doc.body.style.overflow=overflow[0]||'';doc.documentElement.style.overflow=overflow[1]||'';
    if(activeGallery===finish)activeGallery=null;
    if(opener.isConnected)opener.focus({preventScroll:true});
    onClose();
    doc.dispatchEvent(new doc.defaultView.Event('project-gallery-change'));
  }
  previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
  close.addEventListener('click',()=>{if(dialog.close)dialog.close();finish();});
  dialog.addEventListener('cancel',event=>{event.preventDefault();if(dialog.close)dialog.close();finish();});
  dialog.addEventListener('close',finish);
  dialog.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();if(dialog.close)dialog.close();finish();}
    else if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}
    else if(event.key==='Tab'){
      const controls=[...dialog.querySelectorAll('button')],first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&doc.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&doc.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  figure.addEventListener('touchstart',event=>{touchStart=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true});
  figure.addEventListener('touchend',event=>{
    if(!touchStart||!event.changedTouches.length)return;
    const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;touchStart=null;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)move(dx<0?1:-1);
  },{passive:true});
  figure.addEventListener('touchcancel',()=>{touchStart=null;},{passive:true});
  const observer=new doc.defaultView.MutationObserver(()=>{if(!dialog.isConnected||!opener.isConnected)finish();});
  render();doc.body.append(dialog);observer.observe(doc,{childList:true,subtree:true});
  activeGallery=finish;
  if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');
  close.focus();
  doc.dispatchEvent(new doc.defaultView.Event('project-gallery-change'));
  return finish;
}

export function createMediaCarousel(items, title) {
  const ordered = [...items].sort((a,b) => a.order-b.order);
  const root = node('div','media-carousel');
  root.setAttribute('role','region');
  root.setAttribute('aria-label',`${title} media`);
  root.setAttribute('aria-roledescription','carousel');
  const viewport = node('div','carousel-viewport');
  const status = node('span','carousel-position');
  status.setAttribute('aria-live','polite');
  status.setAttribute('aria-atomic','true');
  let index = 0, touchStart = null;
  let resetAutoplay = () => {};
  let videoPlaying = false;
  function render() {
    // Stop an outgoing video before removing it; never start playback automatically.
    viewport.querySelector('video')?.pause();
    videoPlaying = false;
    const item = ordered[index];
    const figure = node('figure','portfolio-media project-preview');
    figure.setAttribute('role','group');
    figure.setAttribute('aria-label',`${index+1} of ${ordered.length}`);
    const fallback = node('p','image-fallback','Preview unavailable. The verified description remains below.');
    fallback.hidden = true;
    let visual;
    if (item.type === 'video') {
      visual = node('video');
      visual.src = mediaURL(item.path);
      visual.controls = true;
      visual.preload = 'none';
      visual.setAttribute('playsinline','');
      visual.setAttribute('aria-label',item.alt);
      if (item.poster) visual.poster = mediaURL(item.poster);
      visual.width = item.width; visual.height = item.height;
      visual.append(node('p','',item.alt));
      for (const event of ['play','pause','ended','error']) visual.addEventListener(event,() => {
        if (viewport.querySelector('video') !== visual) return;
        videoPlaying = event === 'play';
        resetAutoplay();
      });
    } else {
      visual = node('a','image-link');
      visual.href = mediaURL(item.path); visual.target = '_blank'; visual.rel = 'noopener noreferrer';
      visual.setAttribute('aria-label',`View larger image: ${item.alt}`);
      visual.setAttribute('aria-haspopup','dialog');
      visual.addEventListener('click',event=>{
        if(event.button>0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
        event.preventDefault();openImageGallery(ordered,item,title,visual,resetAutoplay);
      });
      const image = node('img');
      image.src = mediaURL(item.path); image.alt = item.alt;
      image.width = item.width; image.height = item.height;
      image.loading = 'lazy'; image.decoding = 'async';
      image.addEventListener('error',() => {visual.hidden=true;fallback.hidden=false;});
      visual.append(image);
    }
    if (item.type === 'video') visual.addEventListener('error',() => {visual.hidden=true;fallback.hidden=false;});
    figure.append(visual,fallback,node('figcaption','',item.caption));
    viewport.replaceChildren(figure);
    status.textContent = `${index+1} / ${ordered.length}`;
  }
  root.append(viewport);
  if (ordered.length > 1) {
    root.tabIndex = 0;
    const controls = node('div','carousel-controls');
    const move = (delta,automatic=false) => {
      status.setAttribute('aria-live',automatic?'off':'polite');
      index=(index+delta+ordered.length)%ordered.length;render();resetAutoplay();
    };
    for (const [label,delta,text] of [['Previous',-1,'←'],['Next',1,'→']]) {
      const control = node('button','',text); control.type='button';
      control.setAttribute('aria-label',`${label} media for ${title}`);
      control.addEventListener('click',() => move(delta)); controls.append(control);
    }
    controls.insertBefore(status,controls.lastElementChild);
    root.append(controls);
    root.addEventListener('keydown',event => {
      // Leave native video keyboard controls intact.
      if (event.target.closest('video')) return;
      if (event.key==='ArrowLeft'||event.key==='ArrowRight') {
        event.preventDefault();const imageHadFocus=!!event.target.closest('.image-link');
        move(event.key==='ArrowLeft'?-1:1);if(imageHadFocus)root.focus();
      }
    });
    viewport.addEventListener('touchstart',event => {
      touchStart=event.touches.length===1&&!event.target.closest('video')?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;
    },{passive:true});
    viewport.addEventListener('touchend',event => {
      if (!touchStart || !event.changedTouches.length) return;
      const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;
      touchStart=null;
      if (Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5) move(dx<0?1:-1);
    },{passive:true});
    viewport.addEventListener('touchcancel',() => {touchStart=null;},{passive:true});
    const view = document.defaultView;
    const motion = view?.matchMedia?.('(prefers-reduced-motion: reduce)');
    // Without motion-preference detection, keep manual navigation available only.
    if (motion) {
      let timer = null, hovered = false, focused = false, disposed = false;
      let connected = false, pageHidden = false;
      const clearTimer = () => {if(timer!==null)view.clearTimeout(timer);timer=null;};
      resetAutoplay = () => {
        clearTimer();
        if(disposed||!root.isConnected||activeGallery||hovered||focused||motion.matches||videoPlaying||pageHidden||document.visibilityState==='hidden')return;
        timer=view.setTimeout(() => {timer=null;if(root.isConnected)move(1,true);else dispose();},2000);
      };
      const onMotion = () => resetAutoplay();
      const onVisibility = () => resetAutoplay();
      const onPageHide = () => {pageHidden=true;clearTimer();};
      const onPageShow = () => {pageHidden=false;resetAutoplay();};
      const observer = new view.MutationObserver(() => {
        if(root.isConnected){if(!connected){connected=true;resetAutoplay();}}
        else if(connected)dispose();
      });
      function dispose() {
        if(disposed)return;
        disposed=true;clearTimer();observer.disconnect();
        motion.removeEventListener('change',onMotion);
        document.removeEventListener('visibilitychange',onVisibility);
        document.removeEventListener('project-gallery-change',onVisibility);
        view.removeEventListener('pagehide',onPageHide);
        view.removeEventListener('pageshow',onPageShow);
      }
      root.addEventListener('mouseenter',() => {hovered=true;resetAutoplay();});
      root.addEventListener('mouseleave',() => {hovered=false;resetAutoplay();});
      root.addEventListener('focusin',() => {focused=true;resetAutoplay();});
      root.addEventListener('focusout',event => {focused=!!event.relatedTarget&&root.contains(event.relatedTarget);resetAutoplay();});
      motion.addEventListener('change',onMotion);
      document.addEventListener('visibilitychange',onVisibility);
      document.addEventListener('project-gallery-change',onVisibility);
      view.addEventListener('pagehide',onPageHide);
      view.addEventListener('pageshow',onPageShow);
      observer.observe(document,{childList:true,subtree:true});
    }
  } else root.append(status);
  render();
  return root;
}
