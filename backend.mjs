// Connection to the game server (Supabase). The page talks only to this object.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

const TABLE = 'main';

export function createBackend(cfg) {
  const sb = createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true, autoRefreshToken: true } });
  let uid = null;
  let pin = null;
  try { pin = localStorage.getItem('kp-admin-pin'); } catch (_) {}

  const toMsg = r => ({ uid: r.uid, name: r.name, kind: r.kind, text: r.text, sticker: r.sticker, gif: r.gif, at: Date.parse(r.at) });

  async function call(action, args = {}, withPin = pin) {
    const { data, error } = await sb.functions.invoke('game', { body: { action, args, pin: withPin || undefined } });
    if (error) {
      let body = null;
      try { body = await error.context.json(); } catch (_) {}
      if (body && body.error) return { ok: false, error: body.error };
      throw error;
    }
    return data || { ok: false };
  }

  return {
    async init() {
      const { data: { session } } = await sb.auth.getSession();
      if (session?.user) { uid = session.user.id; return uid; }
      const { data, error } = await sb.auth.signInAnonymously();
      if (error) throw error;
      uid = data.user.id; return uid;
    },
    async isMember() {
      const { data } = await sb.from('members').select('uid').eq('uid', uid).maybeSingle();
      return !!data;
    },
    send: (action, args) => call(action, args),
    async restoreAdmin() {
      if (!pin) return false;
      const r = await call('adminCheck', {}, pin).catch(() => ({ ok: false }));
      if (!r.ok) { pin = null; try { localStorage.removeItem('kp-admin-pin'); } catch (_) {} }
      return !!r.ok;
    },
    async adminLogin(p) {
      const r = await call('adminCheck', {}, p).catch(() => ({ ok: false }));
      if (r.ok) { pin = p; try { localStorage.setItem('kp-admin-pin', p); } catch (_) {} }
      return !!r.ok;
    },
    adminLogout() { pin = null; try { localStorage.removeItem('kp-admin-pin'); } catch (_) {} },
    async myCards() {
      const { data } = await sb.from('hole_cards').select('hand_no, cards').eq('table_id', TABLE).eq('player_id', uid).maybeSingle();
      return data || null;
    },
    async sendChat(m) {
      const { error } = await sb.from('chat').insert({ uid, name: m.name, kind: m.kind, text: m.text ?? null, sticker: m.sticker ?? null, gif: m.gif ?? null });
      if (error) throw error;
    },
    async savePhoto(dataUrl) {
      const { error } = await sb.from('profiles').upsert({ uid, photo: dataUrl, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    async uploadGif(file) {
      const ext = (file.name.split('.').pop() || 'gif').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'gif';
      const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await sb.storage.from('gifs').upload(path, file, { contentType: file.type || undefined });
      if (error) throw error;
      await sb.from('gif_library').insert({ path, added_by: uid });
      return path;
    },
    gifUrl(path) { return sb.storage.from('gifs').getPublicUrl(path).data.publicUrl; },

    subscribe({ onState, onChat, onPhotos, onGifs, onStatus }) {
      let chat = [], photos = {}, gifs = [];
      const loadState = async () => {
        const { data } = await sb.from('games').select('state').eq('id', TABLE).maybeSingle();
        onState(data ? data.state : null);
      };
      const loadChat = async () => {
        const { data } = await sb.from('chat').select('*').order('id', { ascending: false }).limit(120);
        chat = (data || []).reverse().map(toMsg); onChat(chat);
      };
      const loadPhotos = async () => {
        const { data } = await sb.from('profiles').select('uid, photo');
        photos = {}; (data || []).forEach(r => { if (r.photo) photos[r.uid] = r.photo; }); onPhotos(photos);
      };
      const loadGifs = async () => {
        const { data } = await sb.from('gif_library').select('path').order('at', { ascending: true }).limit(200);
        gifs = (data || []).map(r => r.path); onGifs(gifs);
      };
      const all = () => Promise.all([loadState(), loadChat(), loadPhotos(), loadGifs()]).catch(() => {});

      sb.channel('kulas')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=eq.${TABLE}` },
          p => { if (p.new && p.new.state) onState(p.new.state); })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat' },
          p => { chat = chat.concat(toMsg(p.new)).slice(-120); onChat(chat); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' },
          p => { if (p.new && p.new.uid) { photos = { ...photos, [p.new.uid]: p.new.photo }; onPhotos(photos); } })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gif_library' },
          p => { gifs = gifs.concat(p.new.path); onGifs(gifs); })
        .subscribe(status => {
          if (status === 'SUBSCRIBED') { all(); onStatus && onStatus(true); }
          else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') onStatus && onStatus(false);
        });
      all();
      // safety net: phones put apps to sleep, so re-read when the app comes back and every 20 s
      document.addEventListener('visibilitychange', () => { if (!document.hidden) all(); });
      setInterval(() => { if (!document.hidden) loadState(); }, 20000);
    },
  };
}
