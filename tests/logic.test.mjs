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
      const done = r < .12 ? L.act(s, id, 'fold', 0, t) : r < .22 ? L.act(s, id, 'allin', 0, t)
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
console.log(`Zasady: ${hands} rozdań, ${checks - fails}/${checks} sprawdzeń OK`);
if (fails) process.exit(1);
