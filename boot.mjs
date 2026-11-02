// Loads the game rules for the page and connects to the game server in the background.
import * as Logic from './supabase/functions/_shared/logic.mjs';
import cfg from './config.mjs';
Object.assign(window, Logic);
const configured = cfg.url && !cfg.url.startsWith('WSTAW') && cfg.anonKey && !cfg.anonKey.startsWith('WSTAW');
window.KP_READY = window.KP_MOCK
  ? Promise.resolve(window.KP_MOCK)
  : configured
    ? import('./backend.mjs').then(m => m.createBackend(cfg)).catch(e => { console.error(e); return null; })
    : Promise.resolve(null);
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
