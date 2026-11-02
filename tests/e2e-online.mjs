// Three real browser players at one table, clicking through the app against the local test server.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
import { start } from './mock-server.mjs';

const results = []; let failed = 0;
const ok = (name, cond, info = '') => { results.push(`${cond ? '✅' : '❌'} ${name}${info ? ' — ' + info : ''}`); if (!cond) failed++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const server = await start(0);
const base = `http://localhost:${server.address().port}/`;
const mock = fs.readFileSync(new URL('./mock-client.js', import.meta.url), 'utf8');
const browser = await chromium.launch();
const errs = [];
async function player(name, w = 390, h = 844) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(mock);
  await ctx.route('**/fonts.googleapis.com/**', r => r.abort());
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(name + ': ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_FAILED|Failed to load resource/.test(m.text())) errs.push(name + ': ' + m.text()); });
  await p.goto(base); await sleep(400);
  return p;
}
const ev = (p, s) => p.evaluate(s);

const A = await player('Ala'), B = await player('Bartek', 1280, 800), C = await player('Celina');
ok('ekran startowy z polem kodu', await ev(A, `!$('join').hidden && !!$('codeInput')`));

// wrong code
await A.fill('#nameInput', 'Ala Nowak'); await A.fill('#codeInput', 'ZLY');
await A.click('#joinBtn'); await sleep(200);
ok('zły kod nie wpuszcza', await ev(A, `!isMember && !$('join').hidden`));
// join all three
const invites = [];
for (const [p, n] of [[A, 'Ala Nowak'], [B, 'Bartek Kot'], [C, 'Celina Lis']]) {
  await p.fill('#nameInput', n); await p.fill('#codeInput', 'test'); await p.click('#joinBtn'); await sleep(350);
  invites.push(await p.isVisible('#tutInvite'));
  if (await p.isVisible('#tutNo')) await p.click('#tutNo');
}
await sleep(300);
ok('trzech graczy przy stole u każdego', (await Promise.all([A, B, C].map(p => ev(p, 'viewState().players.length')))).every(n => n === 3));
ok('zaproszenie do samouczka po wejściu', invites.every(Boolean));

// deal
await A.click('[data-a="deal"]'); await sleep(2600);
const hands = await Promise.all([A, B, C].map(p => ev(p, `JSON.stringify({me, mine: viewState().hand.hole[me], others: Object.entries(viewState().hand.hole).filter(([k])=>k!==me).map(([,v])=>v)})`))).then(a => a.map(JSON.parse));
ok('każdy widzi swoje 2 karty', hands.every(h => h.mine.length === 2 && !h.mine.includes('XX')));
ok('nikt nie widzi cudzych kart', hands.every(h => h.others.every(c => c[0] === 'XX' && c[1] === 'XX')));
const allCards = hands.flatMap(h => h.mine);
ok('karty graczy różne', new Set(allCards).size === allCards.length);
ok('karty w panelu po tasowaniu', (await Promise.all([A, B, C].map(p => ev(p, `document.querySelectorAll('.mycards .card:not(.back)').length`)))).every(n => n === 2));
const raw = await Promise.all([A, B, C].map(p => ev(p, 'JSON.stringify(state)')));
ok('cudze karty nie docierają nawet do telefonu', hands.every((h, i) => [0, 1, 2].filter(k => k !== i).every(k => hands[k].mine.every(c => !raw[i].includes(`"${c}"`)))));

// play the hand: whoever has the move clicks; first actor raises with chips + POSTAW
let raised = false, guard = 0;
while (guard++ < 40) {
  const st = await ev(A, `(()=>{const s=viewState();return s.hand&&!s.hand.result?s.hand.toAct:'end'})()`);
  if (st === 'end') break;
  const ids = await Promise.all([A, B, C].map(p => ev(p, 'me')));
  const p = [A, B, C][ids.indexOf(st)];
  await sleep(250);
  if (!raised) {
    await p.click('.tok.d50'); await p.click('.tok.d25'); await p.click('.postaw'); await sleep(300);
    raised = await ev(A, `viewState().hand.currentBet>=75`);
    ok('podbicie żetonami + POSTAW widać u innych', raised);
  } else {
    await p.click('[data-a="call"],[data-a="check"]'); await sleep(300);
  }
}
const res = await ev(B, 'JSON.stringify(viewState().hand.result)').then(JSON.parse);
ok('rozdanie kończy się u wszystkich', !!res && (await Promise.all([A, C].map(p => ev(p, '!!viewState().hand.result')))).every(Boolean));
if (res && res.showdown) {
  const rev = await ev(C, 'JSON.stringify(viewState().hand.revealed)').then(JSON.parse);
  ok('przy sprawdzeniu karty odkryte dla wszystkich', Object.keys(rev).length >= 2);
  ok('zwycięskie karty podświetlone', (await ev(C, `document.querySelectorAll('#center .card.win').length`)) >= 1);
}
const chips = await ev(A, 'viewState().players.reduce((a,p)=>a+p.chips,0)');
ok('żetony się zgadzają (3000)', chips === 3000, String(chips));

// chat
await A.click('#fab'); await A.fill('#chatInput', 'cześć z testu'); await A.click('.send'); await sleep(400);
await B.click('#fab'); await sleep(300);
ok('wiadomość z czatu dochodzi do innych', await ev(B, `$('msgs').textContent.includes('cześć z testu')`));
await A.click('#chatClose'); await B.click('#chatClose');

// owner
await A.click('#btnMenu'); await A.fill('#pinInput', '0000'); await A.click('#ownerLoginBtn'); await sleep(200);
ok('zły PIN właściciela odrzucony', await ev(A, '!isOwner'));
await A.fill('#pinInput', '1234'); await A.click('#ownerLoginBtn'); await sleep(200);
ok('dobry PIN: tryb właściciela', await ev(A, 'isOwner && !$("ownerTools").hidden'));
await A.click('[data-close="menuBox"]');
await A.click('#blindsPill'); await A.click('[data-level="25,50"]'); await sleep(400);
ok('właściciel zmienia ciemne, inni to widzą', await ev(C, 'viewState().sb===25&&viewState().bb===50'));
ok('zwykły gracz nie zmieni ciemnych', (await ev(B, `KP.send('blinds',{sb:5,bb:10}).then(r=>r.ok)`)) === false);

// next hand after lock, then a fold
await sleep(5200);
await B.click('[data-a="deal"]'); await sleep(2600);
const no = await ev(C, 'viewState().hand.no');
ok('drugie rozdanie startuje', no === 2);

// step away and come back (C)
const finishHand = async () => { for (let i = 0; i < 40; i++) {
  const st = await ev(A, `(()=>{const s=viewState();return s.hand&&!s.hand.result?s.hand.toAct:'end'})()`); if (st === 'end') return;
  const ids = await Promise.all([A, B, C].map(p => ev(p, 'me'))); const p = [A, B, C][ids.indexOf(st)];
  await p.click('[data-a="call"],[data-a="check"]'); await sleep(250); } };
if (await ev(C, 'viewState().hand.toAct===me')) { await C.click('[data-a="fold"]'); await sleep(300); }
await C.click('[data-a="away"]'); await sleep(400);
ok('„Odejdź od stołu” → panel z przyciskiem „Usiądź”', await C.isVisible('[data-a="back"]'));
ok('inni widzą, że obserwuje', await ev(A, `!!P(viewState(),${JSON.stringify(await ev(C,'me'))}).away && document.body.textContent.includes('obserwuje')`));
await finishHand(); await sleep(5300);
await A.click('[data-a="deal"]'); await sleep(2600);
const cId = await ev(C, 'me');
ok('obserwujący nie dostaje kart', !(await ev(A, `viewState().hand.order.includes(${JSON.stringify(cId)})`)) && (await ev(C, `document.querySelectorAll('.mycards .card').length`)) === 0);
await C.click('[data-a="back"]'); await sleep(400);
ok('„Usiądź” wraca do gry', await ev(A, `!P(viewState(),${JSON.stringify(cId)}).away`));
await finishHand(); await sleep(5300);
await B.click('[data-a="deal"]'); await sleep(2600);
ok('po powrocie znów dostaje karty', await ev(C, `viewState().hand.order.includes(me) && document.querySelectorAll('.mycards .card:not(.back)').length===2`));
await finishHand();
// leave
await C.click('#btnMenu'); await C.click('#leaveBtn'); await sleep(500);
ok('wyjście od stołu widać u innych', (await ev(A, 'viewState().players.length')) === 2);
ok('ranking się bilansuje', await ev(A, `Object.values(viewState().ranking||{}).reduce((a,r)=>a+r.won-r.lost,0)===0`));
ok('brak poziomego przewijania (telefon i komputer)', (await Promise.all([A, B].map(p => ev(p, 'document.documentElement.scrollWidth<=innerWidth+1')))).every(Boolean));
ok('brak błędów JavaScript', errs.length === 0, errs.slice(0, 3).join(' | '));

await browser.close(); server.close();
console.log(results.join('\n')); console.log(`\nWYNIK: ${results.length - failed}/${results.length} OK`);
process.exit(failed ? 1 : 0);
