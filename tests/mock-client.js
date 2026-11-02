// Injected into the page during tests: the same interface as backend.mjs, but talking to mock-server.mjs.
window.KP_MOCK = (() => {
  const uid = 'u-' + Math.random().toString(36).slice(2, 10);
  let pin = null;
  const j = (r, b) => fetch('/api/' + r + (r.includes('?') ? '&' : '?') + 'uid=' + uid, b === undefined ? {} : { method: 'POST', body: JSON.stringify(b) }).then(x => x.json());
  return {
    async init() { return uid; },
    async isMember() { return (await j('member')).member; },
    send: (action, args = {}) => j('send', { uid, action, args, pin }),
    async restoreAdmin() { return false; },
    async adminLogin(p) { const r = await j('send', { uid, action: 'adminCheck', pin: p }); if (r.ok) pin = p; return !!r.ok; },
    adminLogout() { pin = null; },
    myCards: () => j('cards'),
    sendChat: (m) => j('chat', m),
    savePhoto: (photo) => j('photos', { photo }),
    async uploadGif() { throw new Error('no gifs in tests'); },
    gifUrl: (p) => p,
    subscribe({ onState, onChat, onPhotos, onGifs }) {
      const load = { state: async () => onState((await j('state')).state), chat: async () => onChat(await j('chat')), photos: async () => onPhotos(await j('photos')) };
      const es = new EventSource('/api/events');
      es.onmessage = e => load[e.data] && load[e.data]();
      load.state(); load.chat(); load.photos(); onGifs([]);
    },
  };
})();
