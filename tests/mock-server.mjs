// Local stand-in for Supabase, for automated tests only. Runs the real game core (core.mjs).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { handleAction } from '../supabase/functions/_shared/core.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TABLE_CODE = 'TEST', ADMIN_PIN = '1234';
const db = { pub: null, secret: null, holes: null, members: new Set(), chat: [], photos: {}, gifs: [] };
const clients = new Set();
const push = (type) => { for (const res of clients) res.write(`data: ${type}\n\n`); };
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };

function api(route, body, q) {
  if (route === 'send') {
    const { uid, action, args = {}, pin } = body;
    const isAdmin = String(pin || '') === ADMIN_PIN;
    if (action === 'adminCheck') return { ok: isAdmin };
    if (action === 'enter' || action === 'join') {
      if (String(args.code || '').trim().toUpperCase() !== TABLE_CODE) return { ok: false, error: 'Zły kod stołu. Zapytaj właściciela o kod.' };
      db.members.add(uid);
      if (action === 'enter') return { ok: true };
    } else if (!db.members.has(uid)) return { ok: false, error: 'Najpierw wpisz kod stołu.' };
    const r = handleAction({ publicState: db.pub, secret: db.secret, uid, action, args, isAdmin, now: Date.now() });
    if (r.ok && !r.unchanged) { db.pub = r.state; db.secret = r.secret; if (r.holes) db.holes = r.holes; push('state'); }
    return { ok: r.ok, error: r.error };
  }
  const uid = q.get('uid');
  if (!db.members.has(uid)) return { error: 'not member' };
  if (route === 'state') return { state: db.pub };
  if (route === 'cards') return db.holes && db.holes.cards[uid] ? { hand_no: db.holes.handNo, cards: db.holes.cards[uid] } : null;
  if (route === 'chat') { if (body) { db.chat.push({ ...body, uid, at: Date.now() }); push('chat'); return { ok: true }; } return db.chat.slice(-120); }
  if (route === 'photos') { if (body) { db.photos[uid] = body.photo; push('photos'); return { ok: true }; } return db.photos; }
  if (route === 'member') return { member: true };
  return { error: 'unknown' };
}

export function start(port = 0) {
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    if (u.pathname === '/api/events') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
      clients.add(res); req.on('close', () => clients.delete(res)); return;
    }
    if (u.pathname.startsWith('/api/')) {
      let data = '';
      req.on('data', c => data += c);
      req.on('end', () => {
        const route = u.pathname.slice(5);
        if (route === 'member') { const uid = u.searchParams.get('uid'); res.end(JSON.stringify({ member: db.members.has(uid) })); return; }
        const out = api(route, data ? JSON.parse(data) : null, u.searchParams);
        res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(out));
      });
      return;
    }
    let f = path.join(ROOT, decodeURIComponent(u.pathname));
    if (u.pathname === '/') f = path.join(ROOT, 'index.html');
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => server.listen(port, () => r(server)));
}
