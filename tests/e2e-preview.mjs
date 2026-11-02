// Clicks through the whole game in preview mode (local rules), on a phone and a computer screen.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { start } from './mock-server.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const server = await start(0);
const base = `http://localhost:${server.address().port}/`;
const mock = fs.readFileSync(new URL('./mock-client.js', import.meta.url), 'utf8');
const results=[];let failed=0;
const ok=(name,cond,info='')=>{results.push(`${cond?'✅':'❌'} ${name}${info?' — '+info:''}`);if(!cond)failed++};
async function run(width,height,label){
  const b=await chromium.launch();const ctx=await b.newContext({viewport:{width,height}});await ctx.addInitScript(mock);const p=await ctx.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_FAILED|Failed to load resource/.test(m.text()))errs.push(m.text())});
  await p.route('**/fonts.googleapis.com/**',r=>r.abort());
  await p.goto(base+'#podglad');await p.waitForTimeout(700);
  const ev=s=>p.evaluate(s);
  await ev('clearTimeout(demoTimer); window.__t=setInterval(()=>clearTimeout(demoTimer),50)'); // stop bots, we drive them
  const botsUntilMe=async()=>{for(let i=0;i<40;i++){const st=await ev(`(()=>{const s=viewState(),h=s.hand;if(!handActive(s))return 'end';return h.toAct===me?'me':'bot'})()`);if(st!=='bot')return st;
      await ev(`mutate((s,now)=>{const h=s.hand,id=h.toAct,t=h.currentBet-h.st[id].bet;return act(s,id,t>0?'call':'check',0,now)})`);await p.waitForTimeout(30)}return 'loop'};
  const pre=`[${label}] `;
  ok(pre+'brak poziomego przewijania',await ev('document.documentElement.scrollWidth<=innerWidth+1'));
  // my turn at flop in demo
  ok(pre+'mój ruch po starcie podglądu',await ev('viewState().hand.toAct===me'));
  ok(pre+'zegar przy graczu z ruchem',await ev(`!!document.querySelector('.seat.turn #seatClock')`));
  await p.click('.tok.d25');await p.click('.tok.d25');
  ok(pre+'żetony dodają się do kwoty',await ev(`$('betInput').value==='50'`),await ev(`$('betInput').value`));
  await p.click('[data-clear]');ok(pre+'Wyczyść zeruje kwotę',await ev(`$('betInput').value===''&&betAmt===0`));
  await p.fill('#betInput','7');await p.click('.postaw');await p.waitForTimeout(100);
  ok(pre+'zła kwota nie przechodzi',await ev('viewState().hand.toAct===me'));
  await p.click('[data-clear]');await p.click('.tok.d50');await p.click('.tok.d10');await p.click('.postaw');await p.waitForTimeout(150);
  ok(pre+'POSTAW 60 = podbicie do 60',await ev(`viewState().hand.currentBet===60&&viewState().hand.st[me].bet===60`),await ev('JSON.stringify(viewState().hand.st[me])'));
  let r=await botsUntilMe();
  if(r==='me'){await p.click('[data-a="call"],[data-a="check"]');await p.waitForTimeout(100)}
  for(let i=0;i<6&&(r=await botsUntilMe())==='me';i++){await p.click('[data-a="call"],[data-a="check"]');await p.waitForTimeout(100)}
  ok(pre+'rozdanie dochodzi do końca',r==='end');
  const sd=await ev('!!viewState().hand.result.showdown');
  if(sd) ok(pre+'podświetlone zwycięskie karty',await ev(`document.querySelectorAll('#center .card.win').length>=1`));
  ok(pre+'„Następne rozdanie” zablokowane 5 s',await ev(`document.querySelector('[data-a="deal"]').disabled`));
  await p.waitForTimeout(5300);
  ok(pre+'po 5 s przycisk aktywny',await ev(`!document.querySelector('[data-a="deal"]').disabled`));
  ok(pre+'podświetlenie znika po 5 s',await ev(`document.querySelectorAll('#center .card.win').length===0`));
  const no=await ev('viewState().hand.no');
  await p.click('[data-a="deal"]');await p.waitForTimeout(250);
  ok(pre+'nowe rozdanie startuje',await ev(`viewState().hand.no===${no}+1`));
  ok(pre+'animacja tasowania widoczna',await ev(`!!document.querySelector('.shuffler')`));
  await p.waitForTimeout(2300);
  ok(pre+'po tasowaniu moje 2 karty w panelu',await ev(`document.querySelectorAll('.mycards .card').length===2`));
  ok(pre+'karty bez duplikatów',await ev(`(()=>{const h=viewState().hand;const a=h.board.concat(...Object.values(h.hole));return new Set(a).size===a.length})()`));
  // fold path
  r=await botsUntilMe(); if(r==='me'){await p.click('[data-a="fold"]');await p.waitForTimeout(100);ok(pre+'FOLD działa',await ev('viewState().hand.st[me].folded'))}
  await botsUntilMe();
  // all-in + bust + rebuy
  await ev(`(()=>{state=JSON.parse(JSON.stringify(state));state.hand.result.at=0})()`);
  await ev(`mutate((s,now)=>{P(s,me).chips=40;return startHand(s,now)})`);await p.waitForTimeout(2300);
  r=await botsUntilMe(); if(r==='me'){await p.click('[data-a="allin"]');await p.waitForTimeout(100);ok(pre+'ALL-IN stawia wszystko',await ev('viewState().hand.st[me].allIn'))}
  // make bots fold so hand ends fast
  for(let i=0;i<80;i++){const st=await ev(`(()=>{const s=viewState();return handActive(s)?s.hand.toAct:'end'})()`);if(st==='end')break;await ev(`mutate((s,now)=>{const h=s.hand,id=h.toAct,t=h.currentBet-h.st[id].bet;return act(s,id,t>0?'call':'check',0,now)})`)}
  await ev(`mutate(s=>{P(s,me).chips=0;s.hand.result.at=0;return true})`);await p.waitForTimeout(150);
  const rb0=await ev('(viewState().game[me]||{}).rebuys||0');
  await p.click('[data-a="rebuy"]');await p.waitForTimeout(150);
  ok(pre+'Dokup daje 1000 i liczy dokupkę',await ev(`P(viewState(),me).chips===1000&&viewState().game[me].rebuys===${rb0}+1&&!!document.querySelector('.seat.me .rbs')`));
  // show cards after everyone folds to me
  await ev(`mutate((s,now)=>{startHand(s,now);let g=0;while(handActive(s)&&g++<20){const id=s.hand.toAct;act(s,id,id===me?(s.hand.currentBet-s.hand.st[id].bet>0?'call':'check'):'fold',0,now)}s.hand.result.at=0;return true})`);await p.waitForTimeout(200);
  const canShow=await ev(`!!document.querySelector('[data-a="show"]')`);
  if(canShow){await p.click('[data-a="show"]');await p.waitForTimeout(100);ok(pre+'„Pokaż karty” działa',await ev('!!viewState().hand.shown[me]'))}
  else ok(pre+'„Pokaż karty” dostępne po wygranej bez sprawdzenia',await ev(`viewState().hand.result.winners[0].id!==me`),'wygrał ktoś inny');
  // timer auto-fold
  await ev(`mutate((s,now)=>{startHand(s,now);return true})`);await p.waitForTimeout(2200);r=await botsUntilMe();
  if(r==='me'){await ev(`(()=>{state=JSON.parse(JSON.stringify(state));state.hand.turnAt=Date.now()-120500})()`);await p.waitForTimeout(800);
    ok(pre+'po 2 minutach automatyczny fold',await ev('viewState().hand.st[me].folded'))}
  // step away and back
  if(await ev('P(viewState(),me).away')){
    ok(pre+'po braku ruchu gracz przechodzi do obserwowania',await p.isVisible('[data-a="back"]'));
    await p.click('[data-a="back"]');await p.waitForTimeout(150);
  }
  await botsUntilMe(); await ev(`(()=>{state=JSON.parse(JSON.stringify(state));if(state.hand&&state.hand.result)state.hand.result.at=0})()`);
  if(await ev('handActive(viewState())&&viewState().hand.toAct===me')){await p.click('[data-a="fold"]');await p.waitForTimeout(100)}
  await p.click('[data-a="away"]');await p.waitForTimeout(150);
  ok(pre+'„Odejdź od stołu” i przycisk „Usiądź”',await ev('P(viewState(),me).away')&&await p.isVisible('[data-a="back"]'));
  await p.click('[data-a="back"]');await p.waitForTimeout(150);
  ok(pre+'„Usiądź” wraca do gry',await ev('!P(viewState(),me).away'));
  // chat
  await p.click('#fab');await p.waitForTimeout(200);
  ok(pre+'czat się otwiera i nie zasłania stołu',await ev(`(()=>{const c=$('chat').getBoundingClientRect(),r=$('room').getBoundingClientRect();return c.width>0&&(c.left>=r.right-1||c.top>=r.bottom-1)})()`));
  await p.fill('#chatInput','test wiadomości');await p.click('.send');await p.waitForTimeout(150);
  ok(pre+'wysłanie wiadomości',await ev(`$('msgs').textContent.includes('test wiadomości')`));
  await p.click('#emojiBtn');await p.click('.pgrid .em');ok(pre+'emotka wstawia się do pola',await ev(`$('chatInput').value.length>0`));
  await p.click('[data-ptab="stk"]');await p.click('[data-stk="allin"]');await p.waitForTimeout(150);
  ok(pre+'naklejka wysłana',await ev(`!!document.querySelector('#msgs .sticker')`));
  await p.click('#chatClose');
  // menu items
  await p.click('#btnLog');ok(pre+'Historia: ostatnie rozdanie z kartami',await ev(`document.querySelectorAll('#lastHand .lh-row').length>=2`));await p.click('[data-close="logBox"]');
  await p.click('#btnMenu');await p.click('#rankMenu');
  ok(pre+'Ranking: bieżąca gra',await ev(`document.querySelectorAll('#rankList .rk').length>=2`));
  await p.click('#rtAll');ok(pre+'Ranking: wszechczasów',await ev(`rankTab==='all'&&document.querySelectorAll('#rankList .rk').length>=2`));
  ok(pre+'ranking się bilansuje',await ev(`['game','ranking'].every(k=>Object.values(viewState()[k]).reduce((a,r)=>a+r.won-r.lost,0)===0)`));
  await p.click('[data-close="rankBox"]');
  await p.click('#blindsPill');await p.click('[data-level="25,50"]');await p.waitForTimeout(100);
  ok(pre+'zmiana ciemnych (właściciel)',await ev('viewState().sb===25&&viewState().bb===50'));
  await ev(`$('ownerTools').hidden=false`);await p.click('#btnMenu');await p.click('#resetBtn');await p.click('#resetConfirm');await p.waitForTimeout(150);
  ok(pre+'Nowa gra: wszyscy po 1000, bieżący ranking pusty',await ev(`viewState().players.every(p=>p.chips===1000&&p.buyins===1)&&Object.keys(viewState().game).length===0&&Object.keys(viewState().ranking).length>0`));
  // tutorial full run
  await p.click('#btnMenu');await p.click('#tutMenu');await p.waitForTimeout(300);
  let steps=0;for(;steps<20;steps++){const nx=await p.$('[data-tut="next"]');if(!nx)break;await nx.click();await p.waitForTimeout(60)}
  await p.click('[data-tut="end"]');await p.waitForTimeout(200);
  ok(pre+'samouczek przechodzi wszystkie kroki',steps===15&&await ev('tut===null'),`kroków ${steps+1}`);
  // leave table (start a fresh preview first)
  await ev('startDemo()');await p.waitForTimeout(300);await ev('clearTimeout(demoTimer)');
  await p.click('#btnMenu');await p.click('#leaveBtn');await p.waitForTimeout(150);
  ok(pre+'Wstań od stołu',await ev('!P(viewState(),me)'));
  ok(pre+'brak błędów JavaScript',errs.length===0,errs.slice(0,3).join(' | '));
  await b.close();
}
(async()=>{await run(390,844,'telefon');await run(1280,800,'komputer');console.log(results.join('\n'));console.log(`\nWYNIK: ${results.length-failed}/${results.length} OK`);server.close();process.exit(failed?1:0)})();
