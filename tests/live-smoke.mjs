// Live check against the real server (runs on GitHub after publishing). Does not take a seat or change the game.
import { createClient } from '@supabase/supabase-js';
import cfg from '../config.mjs';

const results = []; let failed = 0;
const ok = (n, c, info = '') => { results.push(`${c ? '✅' : '❌'} ${n}${info ? ' — ' + info : ''}`); if (!c) failed++; };
const sb = createClient(cfg.url, cfg.anonKey, { auth: { persistSession: false } });
const call = async (action, args = {}, pin) => {
  const { data, error } = await sb.functions.invoke('game', { body: { action, args, pin } });
  if (error) { try { return await error.context.json(); } catch { return { ok: false, error: String(error.message) }; } }
  return data;
};

const { data: auth, error: authErr } = await sb.auth.signInAnonymously();
ok('logowanie anonimowe (Allow anonymous sign-ins)', !authErr && !!auth?.user, authErr?.message);
if (!authErr) {
  const wrong = await call('enter', { code: 'zly-kod-' + Date.now() });
  ok('serwer gry odpowiada i odrzuca zły kod', wrong && wrong.ok === false && /kod/i.test(wrong.error || ''), JSON.stringify(wrong));
  const g0 = await sb.from('games').select('id').limit(1);
  ok('bez kodu nie widać stołu', !g0.error && g0.data.length === 0, g0.error?.message);
  const enter = await call('enter', { code: process.env.TABLE_CODE });
  ok('dobry kod wpuszcza do stołu', enter && enter.ok === true, JSON.stringify(enter));
  const g1 = await sb.from('games').select('state').eq('id', 'main').maybeSingle();
  ok('po kodzie stół jest czytelny', !g1.error, g1.error?.message);
  const deal = await call('deal');
  ok('bez miejsca przy stole nie można rozdać', deal && deal.ok === false, JSON.stringify(deal));
  const sec = await sb.from('game_secrets').select('*');
  ok('ukryte karty niedostępne dla graczy', !sec.error ? sec.data.length === 0 : true, sec.error?.message);
  const hc = await sb.from('hole_cards').select('*');
  ok('cudze karty niedostępne', !hc.error && hc.data.length === 0, hc.error?.message);
  const gh = await sb.from('game_history').select('id, started_at, players').limit(1);
  ok('historia gier jest dostępna dla graczy', !gh.error, gh.error?.message);
  const chat = await sb.from('chat').select('id').limit(1);
  ok('czat działa', !chat.error, chat.error?.message);
  const badPin = await call('adminCheck', {}, '000000-zly');
  ok('zły PIN właściciela odrzucony', badPin && badPin.ok === false);
  const goodPin = await call('adminCheck', {}, process.env.ADMIN_PIN);
  ok('PIN właściciela działa i podaje kod stołu', goodPin && goodPin.ok === true && goodPin.tableCode === String(process.env.TABLE_CODE).trim().toUpperCase());
  const pinAsCode = await call('enter', { code: process.env.ADMIN_PIN });
  ok('PIN właściciela działa też jako kod stołu', pinAsCode && pinAsCode.ok === true && pinAsCode.admin === true, JSON.stringify(pinAsCode));
}
// a whole hand on the hidden test table: real moves, real cards, real save and game history
async function tester(name) {
  const c = createClient(cfg.url, cfg.anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await c.auth.signInAnonymously(); if (error) throw error;
  const send = async (action, args = {}, pin) => {
    const r = await c.functions.invoke('game', { body: { action, args, pin, table: 'selftest' } });
    if (r.error) { try { return await r.error.context.json(); } catch { return { ok: false, error: String(r.error.message) }; } }
    return r.data;
  };
  return { c, uid: data.user.id, send, name };
}
try {
  const A = await tester('Test A'), B = await tester('Test B');
  const PIN = process.env.ADMIN_PIN;
  const ja = await A.send('join', { name: 'Robot A', code: process.env.TABLE_CODE });
  const jb = await B.send('join', { name: 'Robot B', code: process.env.TABLE_CODE });
  ok('stolik testowy: dwóch graczy siada', ja.ok && jb.ok && !!ja.account && !!jb.account && ja.account !== jb.account, JSON.stringify([ja, jb]));
  A.id = ja.account; B.id = jb.account; // players are accounts (one per full name), not phones
  // clean start: remove robots left over from an earlier run, end any earlier test game
  const before = (await A.c.from('games').select('state').eq('id', 'selftest').maybeSingle()).data?.state;
  for (const p of (before?.players || [])) if (p.id !== A.id && p.id !== B.id) await A.send('kick', { id: p.id }, PIN);
  await A.send('reset', {}, PIN);
  const d = await A.send('deal');
  ok('stolik testowy: rozdanie kart (zapis ruchu na serwerze)', d.ok, JSON.stringify(d));
  const read = async who => (await who.c.from('games').select('state').eq('id', 'selftest').maybeSingle()).data?.state;
  const st0 = await read(A);
  const ca = (await A.c.from('hole_cards').select('*').eq('table_id', 'selftest')).data || [];
  const cb = (await B.c.from('hole_cards').select('*').eq('table_id', 'selftest')).data || [];
  ok('każdy dostaje tylko swoje 2 karty', ca.length === 1 && cb.length === 1 && ca[0].player_id === A.id && cb[0].player_id === B.id && ca[0].cards.length === 2, `${ca.length}/${cb.length}`);
  // the previous showdown stays public on purpose (lastHand, shown in the history), so only the rest of the state is checked
  const hidden = [...(ca[0]?.cards || []), ...(cb[0]?.cards || [])];
  const pubNow = st0 ? JSON.stringify({ ...st0, lastHand: null }) : '';
  ok('stan stołu nie zawiera ukrytych kart', st0 && st0.hand && !st0.hand.hole && hidden.length === 4 && hidden.every(c => !pubNow.includes(`"${c}"`)), hidden.filter(c => pubNow.includes(`"${c}"`)).join());
  // the same name from another phone is the same account and sees the same cards
  const A2 = await tester('Test A2');
  const ja2 = await A2.send('join', { name: '  robot   A ', code: process.env.TABLE_CODE });
  const ca2 = (await A2.c.from('hole_cards').select('*').eq('table_id', 'selftest')).data || [];
  ok('to samo imię z innego telefonu = to samo konto i te same karty', ja2.ok && ja2.account === A.id && ca2.length === 1 && JSON.stringify(ca2[0].cards) === JSON.stringify(ca[0]?.cards), JSON.stringify(ja2));
  let st = st0, g = 0;
  while (st && st.hand && !st.hand.result && g++ < 40) {
    const who = st.hand.toAct === A.id ? A : B, me = st.hand.st[who.id];
    const r = await who.send('act', { type: st.hand.currentBet - me.bet > 0 ? 'call' : 'check' });
    if (!r.ok) break;
    st = await read(A);
  }
  ok('rozdanie zagrane do końca na prawdziwym serwerze', !!(st && st.hand && st.hand.result), st?.hand?.stage);
  ok('żetony się zgadzają', st && st.players.reduce((a, p) => a + p.chips, 0) === 2000);
  const end = await A.send('reset', {}, PIN);
  ok('zakończenie gry', end.ok, JSON.stringify(end));
  const h = await A.c.from('game_history').select('*').eq('table_id', 'selftest').order('id', { ascending: false }).limit(1);
  const rec = h.data && h.data[0];
  ok('gra zapisana w historii (data, gracze, wynik)', !!rec && rec.hands === 1 && rec.players.length === 2 && rec.players.reduce((a, p) => a + p.net, 0) === 0 && Date.parse(rec.ended_at) > Date.now() - 600000, JSON.stringify(rec)?.slice(0, 200));
  const main = await A.c.from('game_history').select('id').eq('table_id', 'main').limit(1);
  ok('historia prawdziwego stołu osobno od testowej', !main.error);
  await A.send('leave'); await B.send('leave');
} catch (e) { ok('stolik testowy', false, String(e && e.message || e)); }

// presence (who has the app open) — on a separate channel so the robots never show up at the real table
try {
  const X = await tester('Obecność X'), Y = await tester('Obecność Y');
  const join = (t) => new Promise((res, rej) => {
    const ch = t.c.channel('kulas-selftest', { config: { presence: { key: t.uid } } });
    ch.on('presence', { event: 'sync' }, () => {});
    ch.subscribe(st => { if (st === 'SUBSCRIBED') ch.track({ at: Date.now() }).then(() => res(ch)); else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') rej(new Error(st)); });
    setTimeout(() => rej(new Error('timeout')), 15000);
  });
  const cx = await join(X), cy = await join(Y);
  const seen = async (ch, uid, want) => { for (let i = 0; i < 30; i++) { if (Object.keys(ch.presenceState()).includes(uid) === want) return true; await new Promise(r => setTimeout(r, 500)); } return false; };
  ok('obecność: widać, kto ma otwartą aplikację', await seen(cy, X.uid, true));
  await X.c.removeChannel(cx);
  ok('obecność: po zamknięciu aplikacji znika z listy', await seen(cy, X.uid, false));
  await Y.c.removeChannel(cy); X.c.realtime.disconnect(); Y.c.realtime.disconnect();
} catch (e) { ok('obecność graczy', false, String(e && e.message || e)); }

const page = await fetch(process.env.PAGE_URL).then(r => r.text()).catch(e => String(e));
ok('strona aplikacji się otwiera', page.includes('Kulas Poker'), process.env.PAGE_URL);
console.log(results.join('\n')); console.log(`\nNA ŻYWO: ${results.length - failed}/${results.length} OK`);
process.exit(failed ? 1 : 0);
