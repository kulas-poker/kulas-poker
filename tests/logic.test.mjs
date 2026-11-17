// Rules tests: deck, no duplicate cards, hand rankings, rankings balance.
import * as L from '../supabase/functions/_shared/logic.mjs';
let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { fails++; if (fails < 10) console.log('FAIL:', m); } };

const deck = L.freshDeck();
ok(deck.length === 52 && new Set(deck).size === 52, 'deck has 52 different cards');

const c = s => s.split(' ');
[['As Ks Qs Js Ts 2d 3c', 'Poker królewski'], ['9h 8h 7h 6h 5h Ad Ac', 'Poker'], ['5c 4c 3c 2c Ac Kd Kh', 'Poker'],
 ['Kd Kh Ks Kc 2d 3c 7h', 'Kareta'], ['Qd Qh Qs 7c 7d 2c 3h', 'Full'], ['Ah 9h 6h 3h 2h Kd Kc', 'Kolor'],
 ['Ad 2c 3h 4s 5d Kc Kh', 'Strit'], ['Td Jc Qh Ks Ad 2c 3h', 'Strit'], ['7d 7c 7h Ks 2d 4c 9h', 'Trójka'],
 ['Jd Jc 4h 4s Ad 2c 9h', 'Dwie pary'], ['8d 8c Ah Ks 2d 4c 9h', 'Para'], ['Ad Kc 9h 7s 4d 3c 2h', 'Wysoka karta']]
  .forEach(([h, n]) => ok(L.best7(c(h)).name === n, h + ' = ' + n));
[['Ah Kd 8c 8h 2s 3d 4c', 'Qh Jd 8c 8h 2s 3d 4c'], ['Ah Ad Kc Kh 2s 3d 9c', 'Ah Ad Qc Qh 2s 3d 9c'],
 ['6h 5d 4c 3h 2s Kd Qc', '5h 4d 3c 2h As Kd Qc'], ['Ah Kh 2h 3h 9h Td Jc', 'Qh Jh 2h 3h 9h Td Jc'],
 ['2h 2d 2c 3h 3s Kd Qc', 'Ah Ad Kc Kh Qs 3d 4c'], ['Ah Ad Ac 2h 2s Kd Qc', 'Kh Kd Kc Ah As Qd Jc']]
  .forEach(([a, b]) => ok(L.best7(c(a)).score > L.best7(c(b)).score, a + ' > ' + b));
ok(L.best7(c('Ah Kd 2c 3h 7s 8d 9c')).score === L.best7(c('As Kc 2c 3h 7s 8d 9c')).score, 'tie');

let hands = 0;
for (let g = 0; g < 3000; g++) {
  const s = L.newState(); const n = 2 + (g % 8);
  for (let i = 0; i < n; i++) L.joinPlayer(s, 'p' + i, 'P' + i);
  let t = 0;
  for (let k = 0; k < 10; k++) {
    t += 10000;
    if (!L.dealHand(s, t)) { s.players.forEach(p => L.rebuy(s, p.id)); if (!L.dealHand(s, t)) break; }
    const h = s.hand; let st = 0;
    while (L.handActive(s) && st++ < 300) {
      const id = h.toAct, tc = h.currentBet - h.st[id].bet, r = Math.random();
      const done = r < .12 ? L.act(s, id, 'fold', 0, t) : r < .22 ? (L.act(s, id, 'allin', 0, t) || (!L.canRaise(h, id) && L.act(s, id, tc > 0 ? 'call' : 'check', 0, t)))
        : r < .35 ? (L.act(s, id, 'raise', h.currentBet + h.minRaise + 5 * Math.floor(Math.random() * 20), t) || L.act(s, id, tc > 0 ? 'call' : 'check', 0, t))
        : L.act(s, id, tc > 0 ? 'call' : 'check', 0, t);
      ok(done, 'legal move');
      const all = h.board.concat(...Object.values(h.hole));
      ok(new Set(all).size === all.length, 'no duplicate cards');
    }
    ok(!!h.result, 'hand ends'); hands++;
    if (h.result.showdown) ok(h.board.length === 5, '5 board cards at showdown');
  }
  const sum = m => Object.values(m || {}).reduce((a, r) => a + r.won - r.lost, 0);
  ok(sum(s.ranking) === 0 && sum(s.game) === 0, 'rankings balance');
  s.players.forEach(p => { const r = s.game[p.id]; ok((r ? r.won - r.lost : 0) === p.chips - p.buyins * L.START, 'current game = chips'); });
}
// incomplete all-in raise: those who already acted may only call or fold (official rule)
{
  const mk = (stacks) => { const s = L.newState(); stacks.forEach((c, i) => { L.joinPlayer(s, 'p' + i, 'Gracz ' + i); L.P(s, 'p' + i).chips = c; }); L.dealHand(s, 5e6); return s; };
  let t = 5e6 + 1, tested = 0;
  for (let k = 0; k < 200 && tested < 50; k++) {
    const s = mk([5000, 5000, 5000]), h = s.hand;
    // preflop: everyone calls, so the flop starts with a clean betting round
    for (let g = 0; g < 6 && h.stage === 'preflop'; g++) L.act(s, h.toAct, 'call', 0, t++) || L.act(s, h.toAct, 'check', 0, t++);
    if (h.stage !== 'flop') continue;
    const first = h.toAct; ok(L.act(s, first, 'raise', 100, t++), 'flop bet 100');
    const second = h.toAct; L.P(s, second).chips = 130; // a short stack goes all-in for 130: only 30 more, not a full raise
    ok(L.act(s, second, 'allin', 0, t++), 'short all-in');
    const third = h.toAct;
    ok(L.canRaise(h, third), 'someone who has not acted yet may still raise');
    ok(L.act(s, third, 'call', 0, t++), 'third calls 130');
    ok(h.toAct === first, 'back to the first bettor');
    ok(!L.canRaise(h, first), 'first bettor may not re-raise after an incomplete all-in');
    ok(!L.act(s, first, 'raise', 400, t) && !L.act(s, first, 'allin', 0, t), 'raise refused');
    ok(L.act(s, first, 'call', 0, t++), 'but may call');
    tested++;
  }
  ok(tested >= 50, 'incomplete all-in scenario played ' + tested + ' times');
  // a full raise reopens the betting
  for (let k = 0; k < 50; k++) {
    const s = mk([5000, 5000, 5000]), h = s.hand;
    for (let g = 0; g < 6 && h.stage === 'preflop'; g++) L.act(s, h.toAct, 'call', 0, t++) || L.act(s, h.toAct, 'check', 0, t++);
    if (h.stage !== 'flop') continue;
    const first = h.toAct; L.act(s, first, 'raise', 100, t++);
    const second = h.toAct; L.act(s, second, 'raise', 300, t++);
    const third = h.toAct; L.act(s, third, 'call', 0, t++);
    ok(h.toAct === first && L.canRaise(h, first), 'after a full raise the first bettor may raise again');
  }
}
// settlement: who pays whom
for (let k = 0; k < 3000; k++) {
  const n = 2 + (k % 8), ps = []; let sum = 0;
  for (let i = 0; i < n - 1; i++) { const v = 5 * (Math.floor(Math.random() * 801) - 400); ps.push({ id: 'p' + i, name: 'P' + i, net: v }); sum += v; }
  ps.push({ id: 'p' + (n - 1), name: 'P' + (n - 1), net: -sum });
  const tr = L.settle(ps), bal = Object.fromEntries(ps.map(p => [p.id, p.net]));
  tr.forEach(t => { bal[t.fromId] += t.amount; bal[t.toId] -= t.amount; });
  ok(Object.values(bal).every(v => v === 0), 'settlement leaves everyone at zero');
  ok(tr.every(t => t.amount > 0) && tr.length <= n - 1, 'settlement: few, positive transfers');
}
// side pots: all-ins with different stacks, checked against an independent calculation
{
  let sp = 0;
  const run = (stacks, foldIdx = -1) => {
    const s = L.newState(), ids = stacks.map((_, i) => 'p' + i); let t = 1e6;
    ids.forEach((id, i) => { L.joinPlayer(s, id, 'Gracz ' + i); L.P(s, id).chips = stacks[i]; });
    L.dealHand(s, t); const h = s.hand;
    for (let g = 0; !h.result && g < 50; g++) { const id = h.toAct; if (ids.indexOf(id) === foldIdx) L.act(s, id, 'fold', 0, t += 10); else L.act(s, id, 'allin', 0, t += 10) || L.act(s, id, 'call', 0, t) || L.act(s, id, 'check', 0, t); }
    ok(!!h.result, 'all-in hand finishes');
    const total = ids.reduce((a, id) => a + L.P(s, id).chips, 0); ok(total === stacks.reduce((a, b) => a + b, 0), 'side pots: no chips lost or created');
    const sorted = stacks.slice().sort((a, b) => b - a), top = ids[stacks.indexOf(sorted[0])];
    if (sorted[0] > sorted[1]) ok(h.result.refund && h.result.refund.id === top && h.result.refund.amount === sorted[0] - sorted[1], 'uncalled part goes back to its owner');
    if (!h.result.showdown) return;
    const live = ids.filter(id => !h.st[id].folded), sc = Object.fromEntries(live.map(id => [id, L.best7(h.hole[id].concat(h.board)).score]));
    const tot = Object.fromEntries(ids.map(id => [id, h.st[id].total])), exp = {}; let prev = 0;
    for (const lvl of [...new Set(Object.values(tot))].filter(x => x > 0).sort((a, b) => a - b)) {
      let pot = 0; ids.forEach(id => pot += Math.max(0, Math.min(tot[id], lvl) - prev)); prev = lvl;
      const el = live.filter(id => tot[id] >= lvl), top2 = Math.max(...el.map(id => sc[id])), ws = el.filter(id => sc[id] === top2);
      ws.forEach(id => exp[id] = (exp[id] || 0) + pot / ws.length);
    }
    const got = {}; h.result.winners.forEach(w => got[w.id] = w.amount);
    ok(ids.every(id => Math.abs((got[id] || 0) - (exp[id] || 0)) <= L.UNIT), 'side pots paid like in real poker ' + JSON.stringify({ stacks, got, exp }));
    sp++;
  };
  for (let i = 0; i < 3000; i++) { run([6000, 1500]); run([1500, 6000]); run([6000, 1500, 3000]); run([6000, 1500, 3000, 800]); run([6000, 1500, 3000, 2000], 3); run([2000, 2000, 500]); }
  console.log(`Pule boczne: ${sp} rozdań all-in sprawdzonych`);
}
console.log(`Zasady: ${hands} rozdań, ${checks - fails}/${checks} sprawdzeń OK`);
if (fails) process.exit(1);
