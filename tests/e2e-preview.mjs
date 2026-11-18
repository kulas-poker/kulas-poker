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
  ok(pre+'stosy żetonów przy każdym graczu z żetonami',await ev(`viewState().players.filter(p=>p.chips>0).every(p=>!!document.querySelector('#seats .pstack[data-for="'+p.id+'"] .pc'))`));
  await p.waitForTimeout(400);
  ok(pre+'przy moich kartach widać, co mam z kartami na stole',await ev(`(()=>{const h=viewState().hand,el=document.querySelector('#controls .myhand b');return !!el&&el.textContent===handLabel(h.hole[me].concat(visibleBoard(h)))})()`),await ev(`document.querySelector('#controls .myhand')?.textContent`));
  ok(pre+'nic nie zasłania kart na środku stołu',await ev(`(()=>{const cs=[...document.querySelectorAll('#center .board .card')];return cs.length===5&&cs.every(c=>{const r=c.getBoundingClientRect();return [[r.left+3,r.top+3],[r.right-3,r.top+3],[r.left+3,r.bottom-3],[r.right-3,r.bottom-3],[(r.left+r.right)/2,(r.top+r.bottom)/2]].every(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&c.contains(e)})})})()`));
  ok(pre+'żadne miejsce gracza nie wchodzi na karty',await ev(`(()=>{const Z=boardZone();return [...document.querySelectorAll('#seats .seat')].every(s=>{const b=seatBox(s);return b.right<=Z.left+8||b.left>=Z.right-8||b.bottom<=Z.top+8||b.top>=Z.bottom-8})})()`));
  ok(pre+'mój stos żetonów nie chowa się pod zegarem ani zdjęciem',await ev(`(()=>{const st=document.querySelector('#seats .pstack[data-for="'+me+'"]');if(!st)return true;const a=st.getBoundingClientRect(),hit=el=>{if(!el)return false;const c=el.getBoundingClientRect();return !(a.right<=c.left||a.left>=c.right||a.bottom<=c.top||a.top>=c.bottom)};return !hit(document.querySelector('.seat.me .av'))&&!hit(document.querySelector('.seat.me .seat-clock'))})()`));
  ok(pre+'żetony zawsze sumują się do kwoty, większa kwota = wyższa kupka',await ev(`(()=>{for(let a=5;a<=6000;a+=5){if(chipList(a).reduce((x,y)=>x+y,0)!==a)return false}return chipList(20).length<chipList(100).length&&chipList(100).length<chipList(500).length&&chipList(500).length<chipList(2000).length})()`));
  ok(pre+'dziennik: czyja kolej i ostatni ruch',await ev(`$('feed').textContent.includes('Twoja kolej')&&$('feed').textContent.includes((viewState().log||[]).slice(-1)[0].slice(0,12))`));
  ok(pre+'stosy bez śmieciowych znaków',await ev(`!$('seats').textContent.includes('">')`));
  await p.click('.tok.d25');
  ok(pre+'kliknięty żeton ląduje na kupce na stole i przy kwocie',await ev(`$('pending').querySelectorAll('.pc').length===1&&$('stakePile').querySelectorAll('.pc').length===1`));
  await p.click('.tok.d25');
  ok(pre+'kupka rośnie z każdym żetonem',await ev(`$('pending').querySelectorAll('.pc.pc25').length===2&&$('stakePile').querySelectorAll('.pc.pc25').length===2`));
  ok(pre+'stawiane żetony widać na stole',await ev(`!$('pending').hidden&&$('pending').textContent.includes('+50')`));
  ok(pre+'po dołożeniu żetonów Check zmienia się na Bet',await ev(`(()=>{const m=$('midAct');return m.dataset.a==='bet'&&/^bet/i.test(m.textContent.trim())&&m.textContent.includes('50')})()`),await ev(`$('midAct').textContent`));
  ok(pre+'nie ma innych przycisków Postaw',await ev(`document.querySelectorAll('[data-a="bet"]').length===1&&!document.querySelector('.postaw,.pend-go')`));
  if(width>=600) await ev(`$('demoBar').hidden=true;renderTable(viewState())`);
  if(width>=600)   ok(pre+'okienko stawiania nie zasłania puli',await ev(`(()=>{const a=$('pending').getBoundingClientRect(),b=document.querySelector('#center .pot');if(!b)return true;const c=b.getBoundingClientRect();return a.right<=c.left||a.left>=c.right||a.bottom<=c.top||a.top>=c.bottom})()`));
  ok(pre+'żetony dodają się do kwoty',await ev(`$('betInput').value==='50'`),await ev(`$('betInput').value`));
  await p.click('[data-clear]');ok(pre+'Wyczyść zeruje kwotę',await ev(`$('betInput').value===''&&betAmt===0`));
  await p.fill('#betInput','7');await p.click('#midAct');await p.waitForTimeout(100);
  ok(pre+'zła kwota nie przechodzi',await ev('viewState().hand.toAct===me'));
  await p.click('#pending .pend-x');ok(pre+'✕ na stole czyści stawkę',await ev(`$('pending').hidden&&betAmt===0`));
  ok(pre+'bez żetonów środkowy przycisk wraca na Check/Call',await ev(`['check','call'].includes($('midAct').dataset.a)`));
  await p.click('.tok.d50');await p.click('.tok.d10');await p.click('#midAct');await p.waitForTimeout(150);
  ok(pre+'POSTAW 60 = podbicie do 60',await ev(`viewState().hand.currentBet===60&&viewState().hand.st[me].bet===60`),await ev('JSON.stringify(viewState().hand.st[me])'));
  ok(pre+'na stole leżą dokładnie moje żetony (50 i 10)',await ev(`[...document.querySelectorAll('#seats .bet.mine .pc')].map(e=>e.className.match(/pc(\\d+)/)[1]).join()==='50,10'`),await ev(`document.querySelector('#seats .bet.mine')?.innerHTML`));
  let r=await botsUntilMe();
  if(r==='me'){await p.click('[data-a="call"],[data-a="check"]');await p.waitForTimeout(100)}
  for(let i=0;i<6&&(r=await botsUntilMe())==='me';i++){await p.click('[data-a="call"],[data-a="check"]');await p.waitForTimeout(100)}
  ok(pre+'rozdanie dochodzi do końca',r==='end');
  const sd=await ev('!!viewState().hand.result.showdown');
  ok(pre+'wynik ukryty, dopóki krupier odkrywa karty',!sd||await ev(`revealing(viewState().hand)?document.querySelectorAll('#center .card.win').length===0&&!document.querySelector('#center .banner'):true`));
  await p.waitForFunction(()=>!revealing(viewState().hand),null,{timeout:8000});await p.waitForTimeout(150);
  if(sd) ok(pre+'podświetlone zwycięskie karty',await ev(`document.querySelectorAll('#center .card.win').length>=1`));
  ok(pre+'„Następne rozdanie” zablokowane 5 s',await ev(`document.querySelector('[data-a="deal"]').disabled`));
  await p.waitForTimeout(5300);
  ok(pre+'po 5 s przycisk aktywny',await ev(`!document.querySelector('[data-a="deal"]').disabled`));
  ok(pre+'podświetlenie znika po 5 s',await ev(`document.querySelectorAll('#center .card.win').length===0`));
  const no=await ev('viewState().hand.no');
  await p.click('[data-a="deal"]');await p.waitForTimeout(250);
  ok(pre+'nowe rozdanie startuje',await ev(`viewState().hand.no===${no}+1`));
  ok(pre+'animacja tasowania widoczna',await ev(`!!document.querySelector('.shuffler')`));
  ok(pre+'rozdawanie od gracza po lewej rozdającego, po 1 karcie w 2 kółkach',await ev(`(()=>{const h=viewState().hand,n=h.order.length,seq=dealPlan.seq;
    if(seq[0]!==h.order[(h.order.indexOf(h.dealer)+1)%n]) return false;
    const t=[];for(let c=0;c<2;c++)seq.forEach(id=>t.push(dealDelay(id,c)));return t.every((v,i)=>i===0||v>t[i-1])})()`));
  ok(pre+'karty lecą na stół w trakcie rozdawania',await ev(`document.querySelectorAll('#seats .card.fly').length>=4`));
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
  ok(pre+'Dokup się daje 1000 i liczy dokupienie',await ev(`P(viewState(),me).chips===1000&&viewState().game[me].rebuys===${rb0}+1&&!!document.querySelector('.seat.me .rbs')`));
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
  // board cards: face down first, turned over together about a second later
  await ev(`(()=>{state=JSON.parse(JSON.stringify(state));if(state.hand&&state.hand.result)state.hand.result.at=0;boardAnim=null})()`);
  if(await ev('P(viewState(),me).away')){await p.click('[data-a="back"]');await p.waitForTimeout(100)}
  await ev(`mutate((s,now)=>{if(handActive(s))return false;return startHand(s,now)})`);await p.waitForTimeout(2600);
  await ev(`mutate((s,now)=>{let g=0;while(handActive(s)&&s.hand.stage==='preflop'&&g++<20){const h=s.hand,id=h.toAct;act(s,id,h.currentBet-h.st[id].bet>0?'call':'check',0,now)}return true})`);
  await p.waitForTimeout(150);
  if(await ev('viewState().hand.board.length===3&&handActive(viewState())')){
    ok(pre+'dziennik działa w trakcie odkrywania kart',await ev(`$('feed').querySelectorAll('.flist li:not(.sep)').length>0||innerWidth<860`));
    ok(pre+'flop: 3 karty najpierw zakryte',await ev(`document.querySelectorAll('#center .board .card.back').length===3`));
    await p.waitForTimeout(1900);
    ok(pre+'po sekundzie odkryte wszystkie naraz',await ev(`document.querySelectorAll('#center .board .card.back').length===0&&document.querySelectorAll('#center .board .card:not(.slot)').length===3`));
  }
  // automatic fold
  await p.click('#autoFoldBox');await p.waitForTimeout(150);
  ok(pre+'pole „Automatyczny fold” włącza go',await ev('!!P(viewState(),me).autoFold'));
  for(let i=0;i<20;i++){const r=await ev(`(()=>{const s=viewState(),h=s.hand;if(!handActive(s))return 'end';return h.toAct===me?'me':'bot'})()`);if(r!=='bot')break;
    await ev(`mutate((s,now)=>{const h=s.hand,id=h.toAct,t=h.currentBet-h.st[id].bet;return act(s,id,t>0?'call':'check',0,now)})`);await p.waitForTimeout(30)}
  ok(pre+'gdy przychodzi moja kolej, pasuję automatycznie',await ev('!handActive(viewState())||(viewState().hand.st[me]&&viewState().hand.st[me].folded&&viewState().hand.toAct!==me)'));
  await p.click('#autoFoldBox');await p.waitForTimeout(150);
  ok(pre+'pole można wyłączyć',await ev('!P(viewState(),me).autoFold'));
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
  ok(pre+'po zakończeniu gry od razu widać rozliczenie',await ev(`!$('logBox').hidden&&!$('histGames').hidden&&$('histGames').textContent.includes('Kto komu przelewa')`));
  ok(pre+'rozliczenie się bilansuje',await ev(`(()=>{const g=demoHistory[0];const t=settle(g.players);const b={};g.players.forEach(p=>b[p.id]=p.net);t.forEach(x=>{b[x.fromId]+=x.amount;b[x.toId]-=x.amount});return Object.values(b).every(v=>v===0)})()`));
  ok(pre+'Historia → Gry: zakończona gra z datą i graczami',await ev(`document.querySelectorAll('#histGames .gcard:not(.live)').length===1&&document.querySelectorAll('#histGames .gcard:not(.live) .grow').length>=2&&/rozdań/.test($('histGames').textContent)`));
  await p.click('#htHands');await p.click('[data-close="logBox"]');
  ok(pre+'Nowa gra: wszyscy po 1000, bieżący ranking pusty',await ev(`viewState().players.every(p=>p.chips===1000&&p.buyins===1)&&Object.keys(viewState().game).length===0&&Object.keys(viewState().ranking).length>0`));
  // tutorial full run
  await p.click('#btnMenu');await p.click('#tutMenu');await p.waitForTimeout(300);
  let steps=0;for(;steps<20;steps++){const nx=await p.$('[data-tut="next"]');if(!nx)break;await nx.click();await p.waitForTimeout(60)}
  await p.click('[data-tut="end"]');await p.waitForTimeout(200);
  ok(pre+'samouczek przechodzi wszystkie kroki',steps===14&&await ev('tut===null'),`kroków ${steps+1}`);
  // leave table (start a fresh preview first)
  await ev('startDemo()');await p.waitForTimeout(300);await ev('clearTimeout(demoTimer)');
  await p.click('#btnMenu');await p.click('#leaveBtn');await p.waitForTimeout(150);
  ok(pre+'Wstań od stołu',await ev('!P(viewState(),me)'));
  ok(pre+'brak błędów JavaScript',errs.length===0,errs.slice(0,3).join(' | '));
  await b.close();
}
(async()=>{await run(390,844,'telefon');await run(1280,800,'komputer');console.log(results.join('\n'));console.log(`\nWYNIK: ${results.length-failed}/${results.length} OK`);server.close();process.exit(failed?1:0)})();
