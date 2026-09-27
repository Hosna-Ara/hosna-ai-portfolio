import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
await mkdir('.cache/browser-tmp',{recursive:true});
process.env.TMPDIR=resolve('.cache/browser-tmp');
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({
  executablePath:process.env.BROWSER_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  chromiumSandbox:true,
  env:{...process.env,TMPDIR:resolve('.cache/browser-tmp')},
  headless:true
});
let checks=0;
const check=(condition,message)=>{assert.ok(condition,message);checks++;console.log(`PASS ${message}`);};
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();const errors=[];const externalRequests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4173'))externalRequests.push(r.url());});
  await page.goto('http://127.0.0.1:4173');await page.locator('.project-card').last().waitFor();
  for(const [width,height] of [[1440,900],[1366,768],[1280,720],[1024,768]]){
    await page.setViewportSize({width,height});await page.evaluate(()=>window.scrollTo(0,0));
    const input=await page.locator('#question').boundingBox();
    check(input.y>=0&&input.y+input.height<=height,`working hero input is above the fold at ${width}×${height}`);
    check(await page.locator('#home #assistant').count()===1,'single hero assistant is immediately visible');
  }
  await page.setViewportSize({width:1440,height:900});
  await page.screenshot({path:'test-results/hero-desktop.png'});
  check(await page.title()==='Hosna Ara · AI, Data Analytics & Business Intelligence','page metadata');
  for(const id of ['home','about','work','research','publications','experience','education','skills','leadership','contact','assistant'])check(await page.locator(`#${id}`).count()===1,`${id} section present`);
  check(!/SYNTHETIC_PRIVATE_ADDRESS|SYNTHETIC_PRIVATE_PHONE|SYNTHETIC_SECRET/i.test(await page.locator('body').innerText()),'rendered content privacy');
  const badAnchors=await page.locator('a[href^="#"]').evaluateAll(links=>links.map(a=>a.getAttribute('href')).filter(h=>!document.getElementById(h.slice(1))));
  check(badAnchors.length===0,'all internal destinations exist');
  await page.getByRole('button',{name:'Data & BI',exact:true}).click();
  check(await page.locator('.project-card:visible').count()===1,'BI filter narrows to relevant project');
  check(await page.locator('.project-card:visible').innerText().then(t=>t.includes('TasEnergy')),'BI filter returns TasEnergy');
  await page.getByRole('button',{name:'All work',exact:true}).click();
  for(const button of await page.locator('#suggestions button').all()){
    await page.getByRole('button',{name:'Clear chat',exact:true}).click();
    await button.click();await page.waitForFunction(()=>!document.querySelector('#chat-form button').disabled);
    const last=await page.locator('.assistant-message').last().innerText();
    check(last.includes('Source:')&&!last.includes("don't have verified"),`suggestion: ${await button.innerText()}`);
  }
  await page.getByRole('button',{name:'Clear chat',exact:true}).click();
  check(await page.locator('.user-message').count()===0,'clear chat removes session');
  await page.locator('#question').fill('Does she have experience with Kubernetes?');await page.locator('#question').press('Enter');
  await page.waitForFunction(()=>!document.querySelector('#chat-form button').disabled);
  check((await page.locator('.assistant-message').last().innerText()).includes("don't have verified information"),'unknown skill is not invented');
  await page.locator('#question').fill('What was her role in CyberQuiz Pro?');await page.getByRole('button',{name:'Send question'}).click();
  await page.waitForFunction(()=>!document.querySelector('#chat-form button').disabled);
  check((await page.locator('.assistant-message').last().innerText()).includes('Project Manager / Communication Lead'),'assistant team ownership');
  await page.getByRole('button',{name:'Data & BI',exact:true}).click();
  await page.locator('.assistant-message').last().getByRole('link',{name:'View project →'}).click();
  check(await page.locator('#project-cyberquiz').isVisible(),'contextual navigation reveals filtered projects');
  await page.locator('#question').fill('<img src=x onerror=alert(1)>');await page.locator('#question').press('Enter');await page.waitForFunction(()=>!document.querySelector('#chat-form button').disabled);
  check(await page.locator('#chat-log img').count()===0,'user input cannot inject HTML');
  check(externalRequests.length===0,'static assistant sends no external requests');
  check(errors.length===0,'no browser runtime errors');
  await page.getByRole('button',{name:'Clear chat',exact:true}).click();
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:'test-results/desktop.png',fullPage:true});
  for(const width of [320,375,390,768,1440]){
    await page.setViewportSize({width,height:900});
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`no horizontal overflow at ${width}px`);
  }
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Menu'}).click();check(await page.locator('#main-nav').isVisible(),'mobile navigation expands');
  await page.keyboard.press('Escape');check(!(await page.locator('#main-nav').isVisible()),'Escape closes mobile navigation');
  await page.getByRole('button',{name:'Menu'}).click();await page.locator('#main-nav a[href="#assistant"]').click();
  check(!(await page.locator('#main-nav').isVisible()),'mobile navigation closes after selecting a section');
  await page.locator('#question').fill('Tell me about her education.');await page.locator('#question').press('Enter');await page.waitForFunction(()=>!document.querySelector('#chat-form button').disabled);
  check((await page.locator('.assistant-message').last().innerText()).includes('expected'),'mobile chat works');
  await page.screenshot({path:'test-results/mobile.png',fullPage:true});
  await page.locator('#assistant').screenshot({path:'test-results/mobile-chat.png'});
  for(const image of await page.locator('img').all()){
    await image.scrollIntoViewIfNeeded();await image.evaluate(async img=>{if(!img.complete)await new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});});});
    check(await image.evaluate(img=>img.complete&&img.naturalWidth>0),`preview loads: ${await image.getAttribute('src')}`);
  }
  const missingPage=await context.newPage();await missingPage.route('**/assets/selected/utas-research-assistant.jpg',route=>route.abort());await missingPage.goto('http://127.0.0.1:4173');await missingPage.locator('#project-utas-assistant').scrollIntoViewIfNeeded();await missingPage.locator('#project-utas-assistant .image-fallback').waitFor();check(await missingPage.locator('#project-utas-assistant h3').isVisible(),'missing image preserves project description');
  const failurePage=await context.newPage();await failurePage.route('**/knowledge.json',route=>route.abort());await failurePage.goto('http://127.0.0.1:4173');await failurePage.getByRole('alert').waitFor();
  check(await failurePage.getByRole('button',{name:'Retry loading'}).isVisible(),'knowledge loading failure offers retry');
  check(await failurePage.getByRole('button',{name:'Send question'}).isDisabled(),'unavailable knowledge disables submission');
  const pdf=await context.request.get('http://127.0.0.1:4173/Hosna_Ara_CV.pdf');check(pdf.status()===404,'raw CV is not served');
  const env=await context.request.get('http://127.0.0.1:4173/.env');check(env.status()===404,'environment files are not served');
  await context.close();console.log(`${checks} browser checks passed.`);
}finally{await browser.close();}
