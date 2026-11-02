// Server tests: rules, permissions and that nobody can see other players' cards.
import { handleAction } from '../supabase/functions/_shared/core.mjs';
import * as G from '../supabase/functions/_shared/logic.mjs';

let fails = 0, checks = 0;
const ok = (c, msg) => { checks++; if (!c) { fails++; if (fails < 10) console.log('FAIL:', msg); } };

function server() {
  let pub = null, secret = null, holes = {};
  return {
    call(uid, action, args = {}, isAdmin = false, now = Date.now()) {
      const r = handleAction({ publicState: pub, secret, uid, action, args, isAdmin, now });
      if (r.ok && !r.unchanged) {
        pub = JSON.parse(JSON.stringify(r.state)); secret = JSON.parse(JSON.stringify(r.secret));
        if (r.holes) holes = r.holes;
      }
      return r;
    },
    get pub() { return pub; }, get secret() { return secret; }, get holes() { return holes; },
  };
}

// permissions
{
  const S = server();
  ok(!S.call('a', 'deal').ok, 'deal without seat must fail');
  ok(S.call('a', 'join', { name: 'Ala Kot' }).ok, 'join');
  ok(!S.call('a', 'blinds', { sb: 25, bb: 50 }).ok, 'blinds without admin must fail');
  ok(S.call('x', 'blinds', { sb: 25, bb: 50 }, true).ok && S.pub.sb === 25, 'admin blinds');
  ok(!S.call('a', 'reset').ok && !S.call('a', 'resetRanking').ok, 'reset needs admin');
  for (let i = 0; i < 8; i++) S.call('p' + i, 'join', { name: 'Gracz ' + i });
  ok(!S.call('z', 'join', { name: 'Dziesiąty' }).ok, 'table of 9 is full');
  ok(!S.call('b', 'join', { name: '   ' }).ok, 'empty name rejected');
}

// random games with privacy and chip checks
for (let g = 0; g < 400; g++) {
  const S = server(); const n = 2 + (g % 8); const ids = [];
  for (let i = 0; i < n; i++) { ids.push('u' + i); S.call('u' + i, 'join', { name: 'U' + i }); }
  let t = 1_000_000;
  for (let k = 0; k < 15; k++) {
    t += 10_000;
    const r = S.call(ids[k % n], 'deal', {}, false, t);
    if (!r.ok || r.unchanged) {
      ids.forEach(id => S.call(id, 'rebuy'));
      if (S.call(ids[0], 'deal', {}, false, t).unchanged) break;
    }
    const total0 = S.pub.players.reduce((a, p) => a + p.chips, 0) + (S.pub.hand.result ? 0 : S.pub.hand.pot);
    ok(S.holes.handNo === S.pub.hand.no, 'new hand writes hole cards');
    ok(Object.keys(S.holes.cards).length === S.pub.hand.order.length, 'every player gets cards');
    let steps = 0;
    while (S.pub.hand && !S.pub.hand.result && steps++ < 300) {
      const h = S.pub.hand;
      ok(h.hole === undefined && h.deck === undefined, 'public state has no hidden cards');
      ok(Object.keys(h.revealed || {}).length === 0, 'nothing revealed during the hand');
      ok(S.secret.hole && Object.keys(S.secret.hole).length === h.order.length, 'secret holds all hands');
      const other = h.order.find(id => id !== h.toAct);
      ok(!S.call(other, 'act', { type: 'check' }, false, t).ok, 'out-of-turn move rejected');
      const st = h.st[h.toAct], toCall = h.currentBet - st.bet, r2 = Math.random();
      const type = r2 < .12 ? 'fold' : r2 < .2 ? 'allin' : r2 < .35 ? 'raise' : (toCall > 0 ? 'call' : 'check');
      let res = S.call(h.toAct, 'act', { type, amount: h.currentBet + h.minRaise + 5 * Math.floor(Math.random() * 30) }, false, t);
      if (!res.ok) res = S.call(h.toAct, 'act', { type: toCall > 0 ? 'call' : 'check' }, false, t);
      ok(res.ok, 'a legal move always exists');
      if (Math.random() < 0.01) { t += 121_000; S.call(ids[0], 'timeout', {}, false, t); }
    }
    const h = S.pub.hand;
    ok(!!h.result, 'hand finishes');
    const total1 = S.pub.players.reduce((a, p) => a + p.chips, 0);
    ok(total0 === total1, 'chips conserved');
    if (h.result.showdown) {
      const live = h.order.filter(id => !h.st[id].folded);
      ok(live.every(id => h.revealed[id] && h.revealed[id].length === 2), 'showdown reveals live hands');
      ok(h.order.filter(id => h.st[id].folded).every(id => !h.revealed[id]), 'folded hands stay hidden on the table');
    }
    const all = h.board.concat(...Object.values(S.secret.hole));
    ok(new Set(all).size === all.length, 'no duplicate cards');
    // show cards after a fold-win
    if (!h.result.showdown) { const w = h.result.winners[0].id; S.call(w, 'show', {}, false, t); ok(!!S.pub.hand.revealed[w], 'show reveals winner cards'); }
    ok(!S.call(ids[0], 'deal', {}, false, t + 100).ok || S.call(ids[0], 'deal', {}, false, t + 100).unchanged, 'deal locked for 5 s after result');
  }
  const sum = m => Object.values(m || {}).reduce((a, r) => a + r.won - r.lost, 0);
  ok(sum(S.pub.ranking) === 0 && sum(S.pub.game) === 0, 'rankings balance');
  // leave mid-game
  S.call(ids[0], 'leave', {}, false, t + 10_000);
  ok(!G.P(S.pub, ids[0]), 'leave removes player');
}

// timeout only after 2 minutes
{
  const S = server(); S.call('a', 'join', { name: 'A' }); S.call('b', 'join', { name: 'B' });
  const t = 5_000_000; S.call('a', 'deal', {}, false, t);
  ok(S.call('a', 'timeout', {}, false, t + 60_000).unchanged, 'no timeout after 1 min');
  const who = S.pub.hand.toAct; S.call('a', 'timeout', {}, false, t + 121_000);
  ok(S.pub.hand.result && S.pub.hand.st[who].folded, 'timeout folds after 2 min');
}

console.log(`Serwer: ${checks - fails}/${checks} sprawdzeń OK`);
if (fails) process.exit(1);
