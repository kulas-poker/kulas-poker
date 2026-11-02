// KULAS POKER: server-side action handler (no I/O, so it can be tested anywhere).
// The table state is split in two:
//   publicState: what every player may see (no hole cards except revealed ones)
//   secret:      the hole cards of the current hand (only the server reads it)
import * as G from './logic.mjs';

export function mergeState(publicState, secret) {
  const s = publicState ? structuredClone(publicState) : G.newState();
  G.migrate(s);
  if (s.hand) {
    s.hand.hole = (secret && secret.handNo === s.hand.no && secret.hole) ? structuredClone(secret.hole) : {};
    delete s.hand.revealed;
  }
  return s;
}

export function splitState(full) {
  const pub = structuredClone(full);
  let secret = null;
  if (pub.hand) {
    const h = pub.hand;
    secret = { handNo: h.no, hole: h.hole || {} };
    const revealed = {};
    if (h.result) {
      if (h.result.showdown) h.order.forEach(id => { if (!h.st[id].folded) revealed[id] = h.hole[id]; });
      Object.keys(h.shown || {}).forEach(id => { if (h.hole[id]) revealed[id] = h.hole[id]; });
    }
    h.revealed = revealed;
    delete h.hole;
    delete h.deck;
  }
  return { pub, secret };
}

const ADMIN_ACTIONS = new Set(['blinds', 'reset', 'resetRanking']);

// Returns {ok, error?, state?, secret?, holes?} where holes = {handNo, cards:{id:[c,c]}} when a new hand was dealt.
export function handleAction({ publicState, secret, uid, action, args = {}, isAdmin = false, now = Date.now() }) {
  if (!uid) return { ok: false, error: 'Brak zalogowania.' };
  if (ADMIN_ACTIONS.has(action) && !isAdmin) return { ok: false, error: 'Tylko właściciel stołu może to zrobić.' };
  const s = mergeState(publicState, secret);
  const prevNo = s.hand ? s.hand.no : null;
  const seated = !!G.P(s, uid);
  const needSeat = !['join', 'timeout', 'blinds', 'reset', 'resetRanking'].includes(action);
  if (needSeat && !seated) return { ok: false, error: 'Najpierw usiądź przy stole.' };

  let done = false;
  switch (action) {
    case 'join': done = G.joinPlayer(s, uid, args.name); if (!done) return { ok: false, error: s.players.length >= G.MAXP ? 'Stół jest pełny.' : 'Wpisz imię i nazwisko.' }; break;
    case 'leave': done = G.leavePlayer(s, uid, now); break;
    case 'deal': done = G.dealHand(s, now); break;
    case 'act': {
      const type = String(args.type || '');
      if (!['fold', 'check', 'call', 'raise', 'allin'].includes(type)) return { ok: false, error: 'Nieznany ruch.' };
      done = G.act(s, uid, type, Number(args.amount) || 0, now);
      if (!done) return { ok: false, error: 'Ten ruch nie jest teraz możliwy.' };
      break;
    }
    case 'rebuy': done = G.rebuy(s, uid); break;
    case 'away': done = G.sitOut(s, uid, now); break;
    case 'back': done = G.sitIn(s, uid); break;
    case 'show': done = G.showCards(s, uid); break;
    case 'timeout': done = G.timeoutFold(s, now); break;
    case 'blinds': done = G.setBlinds(s, Number(args.sb), Number(args.bb)); break;
    case 'reset': done = G.resetGame(s); break;
    case 'resetRanking': done = G.resetRanking(s); break;
    default: return { ok: false, error: 'Nieznana akcja.' };
  }
  if (!done) return { ok: true, unchanged: true };

  const { pub, secret: newSecret } = splitState(s);
  const out = { ok: true, state: pub, secret: newSecret };
  if (s.hand && s.hand.no !== prevNo) out.holes = { handNo: s.hand.no, cards: structuredClone(s.hand.hole) };
  return out;
}
