// KULAS POKER: game server. Every move goes through here, so cards stay secret and rules are enforced.
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { handleAction } from '../_shared/core.mjs';

const TABLE = 'main';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const URL_ = Deno.env.get('SUPABASE_URL')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ADMIN_PIN = (Deno.env.get('ADMIN_PIN') || '').trim();
const TABLE_CODE = (Deno.env.get('TABLE_CODE') || '').trim().toUpperCase();
const db = createClient(URL_, SERVICE, { auth: { persistSession: false } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const userClient = createClient(URL_, ANON, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
      auth: { persistSession: false },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ ok: false, error: 'Zaloguj się ponownie (odśwież stronę).' }, 401);
    const uid = user.id;

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');
    const args = body.args || {};
    const isAdmin = !!ADMIN_PIN && String(body.pin || '').trim() === ADMIN_PIN;

    if (action === 'adminCheck') return json({ ok: isAdmin, error: isAdmin ? undefined : 'Zły PIN.' });

    if (action === 'join' || action === 'enter') {
      // the table code lets someone in (to watch); 'join' also gives them a seat
      if (!TABLE_CODE || String(args.code || '').trim().toUpperCase() !== TABLE_CODE)
        return json({ ok: false, error: 'Zły kod stołu. Zapytaj właściciela o kod.' });
      const name = String(args.name || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      if (action === 'join' && !name) return json({ ok: false, error: 'Wpisz imię i nazwisko.' });
      const { error: mErr } = await db.from('members').upsert({ uid, name: name || 'Gość' });
      if (mErr) return json({ ok: false, error: 'Błąd serwera: ' + mErr.message }, 500);
      if (action === 'enter') return json({ ok: true });
    } else {
      const { data: m } = await db.from('members').select('uid').eq('uid', uid).maybeSingle();
      if (!m) return json({ ok: false, error: 'Najpierw wpisz kod stołu.' });
    }

    // optimistic locking: re-read and retry if someone else moved at the same moment
    for (let attempt = 0; attempt < 8; attempt++) {
      const { data: g } = await db.from('games').select('state, version').eq('id', TABLE).maybeSingle();
      const { data: sec } = await db.from('game_secrets').select('secret').eq('id', TABLE).maybeSingle();
      const res = handleAction({
        publicState: g?.state ?? null, secret: sec?.secret ?? null,
        uid, action, args, isAdmin, now: Date.now(),
      });
      if (!res.ok) return json(res);
      if (res.unchanged) return json({ ok: true });
      const { data: v, error } = await db.rpc('save_game', {
        p_id: TABLE, p_expected: g ? g.version : -1, p_state: res.state,
        p_secret: res.secret, p_holes: res.holes ?? null,
      });
      if (error) return json({ ok: false, error: 'Błąd serwera: ' + error.message }, 500);
      if (v !== null) return json({ ok: true });
      await new Promise((r) => setTimeout(r, 40 + Math.random() * 120));
    }
    return json({ ok: false, error: 'Stół jest zajęty, spróbuj jeszcze raz.' });
  } catch (e) {
    return json({ ok: false, error: 'Błąd serwera: ' + (e as Error).message }, 500);
  }
});
