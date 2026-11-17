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
ok('okno logowania bez poziomego paska (telefon i komputer)', (await Promise.all([A, B].map(p => ev(p, `$('joinForm').scrollWidth<=$('joinForm').clientWidth+1`)))).every(Boolean));

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
// the same name on another phone = the same account (seat, chips and cards); letters' case and Polish letters do not matter
const B2 = await player('Bartek2');
await B2.fill('#nameInput', '  bartek   KOT '); await B2.fill('#codeInput', 'test'); await B2.click('#joinBtn'); await sleep(700);
if (await B2.isVisible('#tutNo')) await B2.click('#tutNo');
ok('to samo imię i nazwisko z innego telefonu = to samo konto', (await ev(B2, 'me')) === (await ev(B, 'me')) && (await ev(A, 'viewState().players.length')) === 3);
await sleep(600);
ok('na drugim telefonie widać swoje karty z rozdania', JSON.stringify(await ev(B2, 'myHole&&myHole.cards')) === JSON.stringify(await ev(B, 'myHole&&myHole.cards')) && (await ev(B2, `document.querySelectorAll('.mycards .card:not(.back)').length`)) === 2);
await B2.context().close();

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
// the owner can type their PIN instead of the table code
const D = await player('Właściciel');
await D.fill('#nameInput', 'Paweł Właściciel'); await D.fill('#codeInput', '1234'); await D.click('#joinBtn'); await sleep(500);
if (await D.isVisible('#tutNo')) await D.click('#tutNo');
ok('PIN właściciela działa jako kod stołu i włącza tryb właściciela', await ev(D, `isMember && !!mySeat() && isOwner && !$('ownerTools').hidden`));
await D.click('#btnMenu'); await sleep(200);
ok('właściciel widzi kod stołu w Menu', await ev(D, `!$('ownerCodeBox').hidden && $('ownerCode').textContent==='TEST'`));
ok('zwykły gracz nie widzi kodu stołu', await ev(B, `$('ownerCodeBox').hidden`));
ok('zwykły kod stołu nie daje trybu właściciela', (await ev(B, 'isOwner')) === false);
await D.click('[data-close="menuBox"]').catch(()=>{});
await D.click('#btnMenu'); await D.click('#resetBtn'); await D.click('#resetConfirm'); await sleep(500);
await sleep(1200);
ok('po zakończeniu gry każdemu otwiera się rozliczenie', await ev(B, `!$('logBox').hidden && !$('histGames').hidden && $('histGames').textContent.includes('Kto komu przelewa')`));
const trs = await ev(B, `[...document.querySelectorAll('#histGames .gcard:not(.live)')][0].querySelectorAll('.st-row').length`);
const nets = await ev(B, `[...document.querySelectorAll('#histGames .gcard:not(.live)')][0].querySelectorAll('.grow .gz.up,.grow .gz.down').length`);
ok('rozliczenie: przelewy od przegranych do wygranych', nets < 2 || (trs >= 1 && trs <= nets - 1), trs + '/' + nets);
const gtxt = await ev(B, `$('histGames').textContent`);
ok('zakończona gra w historii u innych graczy', /rozdań/.test(gtxt) && gtxt.includes('Ala Nowak') && gtxt.includes('Bartek Kot'));
ok('gracz, który wyszedł wcześniej, jest w historii z godziną', gtxt.includes('Celina Lis') && gtxt.includes('przed końcem gry'));
ok('po zakończeniu gry wszyscy mają po 1000', await ev(A, 'viewState().players.every(p=>p.chips===1000)'));
await B.click('[data-close="logBox"]');
for (const p of [A, D]) if (await p.isVisible('#logBox')) await p.click('#logBox [data-close="logBox"]');
// owner manages the players: someone closed the browser and still sits at the table
const E = await player('Fryzjer');
await E.fill('#nameInput', 'Fryzjer z Turcji'); await E.fill('#codeInput', 'TEST'); await E.click('#joinBtn'); await sleep(500);
const eId = await ev(E, 'me');
ok('nowe imię i nazwisko = nowe konto', !(await Promise.all([A, B, D].map(p => ev(p, 'me')))).includes(eId));
ok('nowy gracz siada przy stole', await ev(D, `!!P(viewState(),${JSON.stringify(eId)})`));
await E.context().close(); await sleep(600);
await D.click('#btnMenu'); await D.click('#ownerPlayers summary'); await sleep(300);
const row = id => `#ownerPlayersList [data-op="${id}"]`;
ok('właściciel widzi listę graczy przy stole', (await ev(D, `$('ownerPlayersList').querySelectorAll('.op-row').length`)) === (await ev(D, 'viewState().players.length')));
ok('widać, kto zamknął aplikację, a kto jest', (await D.textContent(row(eId))).includes('zamknął aplikację') && (await D.textContent(row(await ev(A, 'me')))).includes('w aplikacji'));
await D.click(`${row(eId)} [data-kick]`); await sleep(150);
ok('minus pyta o potwierdzenie', await D.isVisible(`${row(eId)} [data-kick-yes]`) && !!(await ev(D, `P(viewState(),${JSON.stringify(eId)})`)));
await D.click(`${row(eId)} [data-kick-yes]`); await sleep(600);
ok('właściciel usuwa gracza, inni to widzą', !(await ev(A, `P(viewState(),${JSON.stringify(eId)})`)) && !(await ev(D, `!!document.querySelector('${row(eId)}')`)));
ok('w dzienniku: usunięty przez właściciela', (await ev(A, `(viewState().log||[]).join('|')`)).includes('Właściciel usunął Fryzjer z Turcji'));
ok('zwykły gracz nie ma listy i nie może usuwać', (await ev(B, `$('ownerTools').hidden`)) && (await ev(B, `KP.send('kick',{id:${JSON.stringify(await ev(A, 'me'))}}).then(r=>r.ok)`)) === false);
await D.click('[data-close="menuBox"]');
ok('brak błędów JavaScript', errs.length === 0, errs.slice(0, 3).join(' | '));

await browser.close(); server.close();
console.log(results.join('\n')); console.log(`\nWYNIK: ${results.length - failed}/${results.length} OK`);
process.exit(failed ? 1 : 0);
