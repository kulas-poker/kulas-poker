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
  const chat = await sb.from('chat').select('id').limit(1);
  ok('czat działa', !chat.error, chat.error?.message);
  const badPin = await call('adminCheck', {}, '000000-zly');
  ok('zły PIN właściciela odrzucony', badPin && badPin.ok === false);
  const goodPin = await call('adminCheck', {}, process.env.ADMIN_PIN);
  ok('PIN właściciela działa', goodPin && goodPin.ok === true);
}
const page = await fetch(process.env.PAGE_URL).then(r => r.text()).catch(e => String(e));
ok('strona aplikacji się otwiera', page.includes('Kulas Poker'), process.env.PAGE_URL);
console.log(results.join('\n')); console.log(`\nNA ŻYWO: ${results.length - failed}/${results.length} OK`);
process.exit(failed ? 1 : 0);
