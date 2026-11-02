
// ---------- emoji + sticker catalog ----------
const EMOJI_TABS=[
 ['😀','Buźki','😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 🫠 😉 😊 😇 🥰 😍 🤩 😘 😗 ☺️ 😚 😙 🥲 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🫢 🫣 🤫 🤔 🫡 🤐 🤨 😐 😑 😶 🫥 😏 😒 🙄 😬 😮‍💨 🤥 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🤧 🥵 🥶 🥴 😵 😵‍💫 🤯 🤠 🥳 🥸 😎 🤓 🧐 😕 🫤 😟 🙁 ☹️ 😮 😯 😲 😳 🥺 🥹 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 ☠️ 💩 🤡 👹 👺 👻 👽 👾 🤖 😺 😸 😹 😻 😼 😽 🙀 😿 😾 🙈 🙉 🙊'],
 ['👋','Gesty i ludzie','👋 🤚 🖐️ ✋ 🖖 🫱 🫲 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝️ 🫵 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 🫶 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦵 🦶 👂 👃 🧠 👀 👁️ 👅 👄 🫦 👶 🧒 👦 👧 🧑 👱 👨 🧔 👩 🧓 👴 👵 🙍 🙎 🙅 🙆 💁 🙋 🧏 🙇 🤦 🤷 👮 🕵️ 💂 🥷 👷 🤴 👸 🤵 👰 🤰 🎅 🤶 🦸 🦹 🧙 🧚 🧛 🧜 🧝 🧞 🧟 💆 💇 🚶 🧍 🧎 🏃 💃 🕺 🕴️ 👯 🧖 🧗 🤺 🏇 ⛷️ 🏂 🏌️ 🏄 🚣 🏊 ⛹️ 🏋️ 🚴 🤸 🤼 🤽 🤾 🤹 🧘 🛀 👭 👫 👬 💏 💑 👪'],
 ['❤️','Serca i symbole','❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❤️‍🔥 ❤️‍🩹 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 💯 💢 💥 💫 💦 💨 💬 💭 💤 ✅ ❌ ❓ ❗ ‼️ ⁉️ ⚠️ 🚫 ⛔ ♠️ ♥️ ♦️ ♣️ 🃏 🀄 🎴 🔥 ✨ ⭐ 🌟 ⚡ 🆗 🆒 🆕 🆓 🔝 ➕ ➖ ✖️ ➗ 💲 💱 ™️ ©️ ®️ 〰️ ➰ 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤 🔺 🔻 💠 🔘 🏁 🚩 🏴 🏳️ 🏳️‍🌈 🇵🇱 🇺🇸 🇬🇧 🇩🇪 🇫🇷 🇪🇸 🇮🇹 🇳🇱 🇺🇦 🇧🇷 🇯🇵'],
 ['🐶','Zwierzęta i natura','🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🐤 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🪱 🐛 🦋 🐌 🐞 🐜 🪰 🕷️ 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦞 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🦧 🐘 🦛 🦏 🐪 🐫 🦒 🦘 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🐈 🐓 🦃 🦚 🦜 🦢 🦩 🕊️ 🐇 🦝 🦨 🦡 🦫 🦦 🦥 🐁 🐀 🐿️ 🦔 🌵 🎄 🌲 🌳 🌴 🌱 🌿 ☘️ 🍀 🎍 🍃 🍂 🍁 🍄 🌾 💐 🌷 🌹 🥀 🌺 🌸 🌼 🌻 🌞 🌝 🌛 🌜 🌚 🌕 🌙 🌎 🪐 🌈 ☀️ ⛅ ☁️ 🌧️ ⛈️ 🌩️ ❄️ ☃️ ⛄ 🌬️ 🌪️ 🌊 💧'],
 ['🍕','Jedzenie i picie','🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶️ 🫑 🌽 🥕 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🧈 🥞 🧇 🥓 🥩 🍗 🍖 🌭 🍔 🍟 🍕 🫓 🥪 🥙 🧆 🌮 🌯 🫔 🥗 🥘 🫕 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🍤 🍙 🍚 🍘 🍥 🥠 🍢 🍡 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 🌰 🥜 🍯 🥛 ☕ 🫖 🍵 🧃 🥤 🧋 🍶 🍺 🍻 🥂 🍷 🥃 🍸 🍹 🧉 🍾 🧊 🥄 🍴 🍽️'],
 ['⚽','Zabawa i przedmioty','⚽ 🏀 🏈 ⚾ 🎾 🏐 🏉 🥏 🎱 🏓 🏸 🏒 🥊 🥋 ⛳ 🎣 🎽 🛹 🎿 🏆 🥇 🥈 🥉 🏅 🎖️ 🎫 🎟️ 🎪 🎭 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🎷 🎺 🎸 🪕 🎻 🎲 ♟️ 🎯 🎳 🎮 🎰 🧩 🎉 🎊 🎈 🎁 🎀 🪅 🪩 💰 💴 💵 💶 💷 💸 💳 🪙 💎 ⚖️ 🔑 🗝️ 🔨 🪓 ⛏️ 🔧 🔩 ⚙️ 🧲 💣 🧨 🛡️ 🔮 📿 💈 🔭 🔬 💊 🧬 🌡️ 🧹 🧻 🛁 🔔 🎙️ 📱 💻 ⌨️ 🖥️ 🕹️ 📷 📸 📹 🎥 📞 ☎️ 📺 📻 ⏰ ⌛ ⏳ 📡 🔋 🔌 💡 🔦 🕯️ 📦 📫 ✉️ 📩 📝 📁 📅 📌 📍 ✂️ 🔒 🔓 🚗 🚕 🚙 🚌 🏎️ 🚓 🚑 🚒 🚜 🛵 🏍️ 🚲 🛴 🚨 🚀 ✈️ 🛸 🚁 ⛵ 🚢 ⚓ 🏠 🏡 🏢 🏰 🗼 🗽 ⛪ 🕌 ⛩️ 🏝️ 🏖️ 🌋 🗻 🎡 🎢 🏙️ 🌃 🌉']
];
const STICKERS=[
 {id:'allin',e:'🔥',cap:'All-in!',a:'pulse'},{id:'blef',e:'🤥',cap:'Blef?',a:'wobble'},
 {id:'gg',e:'🤝',cap:'GG',a:'bounce'},{id:'nice',e:'👏',cap:'Ładna ręka',a:'pulse'},
 {id:'rip',e:'💀',cap:'RIP',a:'shake'},{id:'kasa',e:'💰',cap:'Dawaj kasę',a:'spin'},
 {id:'fart',e:'🍀',cap:'Farciarz',a:'float'},{id:'hmm',e:'🤔',cap:'Hmm…',a:'tilt'},
 {id:'lol',e:'😂',cap:'Hahaha',a:'shake'},{id:'badbeat',e:'😭',cap:'Bad beat',a:'drip'},
 {id:'face',e:'😎',cap:'Pokerface',a:'slide'},{id:'pas',e:'🏳️',cap:'Pas',a:'wave'},
 {id:'rak',e:'🦈',cap:'Rekin',a:'slide'},{id:'clown',e:'🤡',cap:'Klaun',a:'wobble'},
 {id:'boom',e:'💥',cap:'Boom!',a:'pulse'},{id:'pijemy',e:'🍻',cap:'Zdrówko',a:'bounce'},
 {id:'czas',e:'⏳',cap:'Szybciej!',a:'spin'},{id:'love',e:'😍',cap:'Kocham te karty',a:'pulse'},
 {id:'zly',e:'🤬',cap:'Serio?!',a:'shake'},{id:'krol',e:'👑',cap:'Król stołu',a:'float'}
];


// ---------- app ----------
const $=id=>document.getElementById(id);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const TAB=Math.random().toString(36).slice(2,8);
let KP=null,me=null,isOwner=false,myHole=null,serverOk=false,isMember=false,live=false;
const SHUF_MS=1900; let shuffleUntil=0, tut=null, demo=false,demoSaved=null,lastRealState=null,lastRealMsgs=[],betAmt=0,dealAnimNo=-1,state=null,photos={},watching=false,pendingPhoto=null,busy=false,lastBarKey='',raiseVal=0,lastBoardLen=0;
let messages=[],chatOpen=false,pickerTab=null,gifLib=[],lastSeen=0,firstChatLoad=true;
try{lastSeen=+localStorage.getItem('ns-seen')||0}catch(_){}

function toast(t){const el=document.createElement('div');el.className='toast';el.textContent=t;document.body.appendChild(el);setTimeout(()=>el.remove(),3200)}
function initials(name){return esc((name||'?').split(/\s+/).map(w=>w[0]||'').join('').slice(0,2).toUpperCase())}
function cardHtml(c,cls=''){
  if(!c) return `<div class="card slot ${cls}"></div>`;
  if(c==='back'||c==='XX') return `<div class="card back ${cls}"></div>`;
  const r=c[0]==='T'?'10':c[0], s={s:'♠',h:'♥',d:'♦',c:'♣'}[c[1]], red=c[1]==='h'||c[1]==='d';
  return `<div class="card ${red?'red':''} ${cls}" aria-label="${r}${s}">${r}<span class="s">${s}</span></div>`;
}
function chipFace(d){return `<span class="holo"></span><i class="st s1">♠</i><i class="st s2">♥</i><i class="st s3">♣</i><i class="st s4">♦</i><span class="core"><b>${d}</b></span>`}
function stacksHtml(amount,maxCols=3,maxH=5,cls=''){
  if(!amount) return '';
  return `<span class="stacks ${cls}" aria-hidden="true">${breakdown(amount).slice(0,maxCols).map(([d,c])=>`<span class="stk">${('<i class="d d'+d+'"></i>').repeat(Math.min(c,maxH))}</span>`).join('')}</span>`;
}
function avatarHtml(p,extra=''){
  const img=photos[p.id];
  return img?`<img src="${esc(img)}" alt="">${extra}`:`${initials(p.name)}${extra}`;
}

function online(){return serverOk&&isMember||demo}
async function mutate(fn){
  if(demo){
    const prev=viewState(), s=JSON.parse(JSON.stringify(state)); migrate(s);
    if(fn(s,Date.now())===false) return false;
    state=s; try{onStateChange(prev,viewState())}catch(_){} render(); demoTick(); return true;
  }
  return false;
}

// online: every move goes to the server, which checks the rules and deals the cards
async function send(action,args={}){
  if(!KP||busy) return false;
  busy=true;
  try{
    const r=await KP.send(action,args);
    if(!r.ok&&r.error) toast(r.error);
    return !!r.ok;
  }catch(e){toast('Brak połączenia z serwerem. Sprawdź internet i spróbuj jeszcze raz.');return false}
  finally{busy=false}
}
// in the offline preview the same rules run locally
function doIt(action,args,localFn){return demo?mutate(localFn):send(action,args)}

function resizeImage(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>{const img=new Image();img.onload=()=>{const S=160,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');const m=Math.min(img.width,img.height);g.drawImage(img,(img.width-m)/2,(img.height-m)/2,m,m,0,0,S,S);res(c.toDataURL('image/jpeg',.75))};img.onerror=rej;img.src=fr.result};fr.onerror=rej;fr.readAsDataURL(file)})}
async function savePhoto(dataUrl){ if(demo||!KP) return; try{ await KP.savePhoto(dataUrl); }catch(e){ toast('Nie udało się zapisać zdjęcia.'); } }

// ---------- render: table ----------
function viewState(){
  const s=state?JSON.parse(JSON.stringify(state)):newState();
  if(s.v!==VERSION){s.hand=null;s.players.forEach(p=>p.chips=START);s.sb=5;s.bb=10}
  if(!demo&&s.hand){
    const h=s.hand, rev=h.revealed||{}; h.hole={};
    h.order.forEach(id=>{h.hole[id]=(id===me&&myHole&&myHole.hand_no===h.no)?myHole.cards:(rev[id]||['XX','XX'])});
  }
  return s;
}
function mySeat(){return state&&me?P(state,me):null}
function render(){
  const s=viewState(), h=s.hand, seated=!!mySeat();
  $('btnMenu').hidden=!online();
  $('photoChange').hidden=!seated; $('leaveBtn').hidden=!seated;
  renderRanking(s);
  $('join').hidden = seated || watching || !(serverOk||demo) || demo;
  $('fab').hidden = !online() || chatOpen;
  if(!$('join').hidden){ $('joinBtn').disabled = isMember && s.players.length>=MAXP; }

  const curSb=handActive(s)?h.sbAmt:s.sb, curBb=handActive(s)?h.bbAmt:s.bb;
  const pending=handActive(s)&&(s.sb!==h.sbAmt||s.bb!==h.bbAmt);
  const pill=$('blindsPill');
  pill.innerHTML=`Ciemne ${curSb}/${curBb}${pending?` <em>→ ${s.sb}/${s.bb}</em>`:''}`;
  pill.classList.toggle('owner',isOwner);
  $('chatMembers').textContent = s.players.length ? s.players.map(p=>p.name.split(' ')[0]).join(', ') : 'czat przy stole';
  renderTable(s); renderBar(s); renderLevels(s);
  scheduleHl(h);
  renderLastHand(s);
  $('logList').innerHTML=(s.log||[]).slice().reverse().map(l=>`<div>${esc(l)}</div>`).join('')||'<div>Jeszcze nic się nie wydarzyło.</div>';
}
let rankTab='game';
function renderRanking(s){
  const box=$('rankList'); if(!box) return;
  $('rankOwner').hidden=!(isOwner&&rankTab==='all');
  $('rtGame').classList.toggle('on',rankTab==='game'); $('rtAll').classList.toggle('on',rankTab==='all');
  $('rtGame').setAttribute('aria-selected',rankTab==='game'); $('rtAll').setAttribute('aria-selected',rankTab==='all');
  $('rankNote').textContent = rankTab==='game'
    ? 'Wyniki od ostatniej „Nowej gry”. Liczą się tylko zakończone rozdania.'
    : 'Wszystkie rozdania od początku, także sprzed resetów gry.';
  const map=(rankTab==='game'?s.game:s.ranking)||{};
  const seated=new Set(s.players.map(p=>p.id));
  const rows=Object.entries(map).map(([id,r])=>({id,name:(P(s,id)||{}).name||r.name,won:r.won||0,lost:r.lost||0,rebuys:r.rebuys||0,hands:r.hands||0,wins:r.wins||0,best:r.best||0,net:(r.won||0)-(r.lost||0),seated:seated.has(id)}))
    .sort((a,b)=>b.net-a.net||b.wins-a.wins);
  if(!rows.length){box.innerHTML='<div class="lh-empty">Ranking pojawi się po pierwszym zakończonym rozdaniu.</div>';return}
  const zl=v=>zlFmt(Math.round(v*ZL_PER_CHIP*100)/100)+' zł';
  box.innerHTML='<div class="rank">'+rows.map((r,i)=>{
    const cls=r.net>0?'up':r.net<0?'down':'even', sign=r.net>0?'+':r.net<0?'−':'±';
    return `<div class="rk p${i+1}"><span class="pos">${i===0&&r.net>0?'👑':i+1}</span>
      <span class="nm2">${esc(r.name||'Gracz')}${r.seated?'':'<small>(nie gra)</small>'}</span>
      <span class="zl2 ${cls}">${sign}${zl(Math.abs(r.net))}<small>${r.net>0?'+':''}${r.net} żet.</small></span>
      <span><span class="wl"><span class="w">zarobione +${zl(r.won)}</span><span class="l">stracone −${zl(r.lost)}</span></span>
      <span class="rb ${r.rebuys?'on':''}">${r.rebuys?`🔄 Dokupki: ${r.rebuys}× · ${zl(r.rebuys*START)}`:'Bez dokupek'}</span>
      <span class="st2">rozdań ${r.hands} · wygranych ${r.wins}${r.best?` · największa pula ${r.best}`:''}</span></span></div>`;
  }).join('')+'</div>';
}
function renderLastHand(s){
  const L=s.lastHand, box=$('lastHand');
  if(!L){box.innerHTML='<h3>Ostatnie rozdanie</h3><div class="lh-empty">Tu pojawią się karty wszystkich graczy po zakończeniu rozdania.</div>';return}
  const win=new Set(); Object.values(L.best||{}).forEach(cs=>(cs||[]).forEach(c=>win.add(c)));
  const hs=win.size?win:null;
  const rows=L.players.slice().sort((a,b)=>(b.won>0)-(a.won>0)||(a.folded-b.folded)).map(p=>{
    const cls=p.won>0?'w':(p.folded?'f':'');
    const info=p.won>0?`wygrywa ${p.won}${p.hand?' · '+esc(p.hand):''}`:(p.folded?`pas${p.hand?' · układ: '+esc(p.hand):''}`:(p.hand?esc(p.hand):''));
    return `<div class="lh-row ${cls}"><span class="n">${p.won>0?'★ ':''}${esc(p.name)}</span><span class="cs">${p.cards.map(c=>cardHtml(c,'sm'+(hs&&!p.folded?hlCls(hs,c):''))).join('')}</span><span class="h">${info}</span></div>`;
  }).join('');
  box.innerHTML=`<h3>Ostatnie rozdanie #${L.no}</h3>
    <div class="board">${L.board.length?L.board.map(c=>cardHtml(c,'sm'+hlCls(hs,c))).join(''):'<span class="lh-empty">Karty wspólne nie zostały odkryte.</span>'}</div>${rows}`;
}
function renderLevels(s){
  $('levels').innerHTML=LEVELS.map(([a,b])=>`<button class="btn ${s.sb===a&&s.bb===b?'on':''}" data-level="${a},${b}" type="button">${a} / ${b}</button>`).join('');
  $('blindsNote').textContent = handActive(s) ? 'Zmiana zacznie działać od następnego rozdania.' : 'Wybierz poziom ciemnych dla kolejnych rozdań.';
}
// ---------- chips → złote ----------
const zlFmt=v=>v.toLocaleString('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:2});
const moneyAnim={};
function moneyNow(id,target){
  const a=moneyAnim[id];
  if(!a){moneyAnim[id]={from:target,to:target,t0:0};return target}
  if(a.to!==target){const cur=moneyNow(id,a.to);moneyAnim[id]={from:cur,to:target,t0:performance.now()};kickMoney();return cur}
  if(!a.t0) return target;
  const k=Math.min(1,(performance.now()-a.t0)/1400), e=1-Math.pow(1-k,3);
  if(k>=1){a.t0=0;a.from=a.to;return a.to}
  return a.from+(a.to-a.from)*e;
}
function moneyParts(chips,buyins){
  const val=chips*ZL_PER_CHIP, net=(chips-(buyins||1)*START)*ZL_PER_CHIP;
  return {val,net};
}
function moneyInner(id,chips,buyins){
  const shown=moneyNow(id,chips), {val,net}=moneyParts(shown,buyins);
  const r=Math.round(net*100)/100;
  const cls=r>0?'up':r<0?'down':'even', sign=r>0?'+':r<0?'−':'±';
  return `<span class="zl">${zlFmt(val)} zł</span><span class="dl ${cls}">${sign}${zlFmt(Math.abs(r))}</span>`;
}
function moneyHtml(p){
  const b=p.buyins||1;
  return `<div class="money" data-money="${esc(p.id)}" data-chips="${p.chips}" data-buyins="${b}" title="Wartość żetonów i bilans (dokupki: ${b})">${moneyInner(p.id,p.chips,b)}</div>`;
}
let moneyRaf=0;
function kickMoney(){
  if(moneyRaf) return;
  const step=()=>{
    let running=false;
    document.querySelectorAll('[data-money]').forEach(el=>{
      const id=el.dataset.money, a=moneyAnim[id];
      if(a&&a.t0){running=true;el.innerHTML=moneyInner(id,+el.dataset.chips,+el.dataset.buyins)}
    });
    moneyRaf=running?requestAnimationFrame(step):0;
  };
  moneyRaf=requestAnimationFrame(step);
}

const HL_MS=5000;
function hlCards(h){
  if(!h||!h.result||!h.result.best||!h.result.at) return null;
  if(Date.now()-h.result.at>=HL_MS) return null;
  const set=new Set(); Object.values(h.result.best).forEach(cs=>(cs||[]).forEach(c=>set.add(c)));
  return set.size?set:null;
}
const hlCls=(set,c)=>set?(set.has(c)?' win':' lose'):'';
let hlTimer=0;
function scheduleHl(h){
  clearTimeout(hlTimer);
  if(!h||!h.result||!h.result.at) return;
  const left=HL_MS-(Date.now()-h.result.at);
  if(left>0) hlTimer=setTimeout(()=>{lastBarKey='';render()},Math.min(1000,left)+30);
}
function layout(s){
  const players=s.players, N=players.length, myIdx=players.findIndex(p=>p.id===me);
  const room=$('room'), W=Math.max(room.clientWidth,200), H=Math.max(room.clientHeight,200);
  const rx=Math.min(45, 50-(60/W)*100*0.9), ry=Math.min(43, 50-(60/H)*100);
  const pos={};
  players.forEach((p,i)=>{
    const rel=myIdx>=0?(i-myIdx+N)%N:i;
    const ang=Math.PI/2+rel*2*Math.PI/Math.max(N,2);
    pos[p.id]={x:50+rx*Math.cos(ang),y:50+ry*Math.sin(ang),bx:50+rx*0.58*Math.cos(ang),by:50+ry*0.58*Math.sin(ang)};
  });
  return {pos,W,H};
}
function renderTable(s){
  const h=s.hand, players=s.players;
  const L=layout(s), W=L.W, H=L.H;
  let html='';
  const winIds=new Set(h&&h.result?h.result.winners.map(w=>w.id):[]);
  const dealing=h&&dealAnimNo===h.no; if(dealing) dealAnimNo=-1;
  players.forEach((p,i)=>{
    const {x,y,bx,by}=L.pos[p.id];
    const st=h&&h.st?h.st[p.id]:null, isMe=p.id===me;
    const shown=!!(h&&h.shown&&h.shown[p.id]);
    let cls='seat'; if(isMe)cls+=' me'; if(h&&h.toAct===p.id)cls+=' turn'; if(winIds.has(p.id))cls+=' won';
    if(!st||st.folded) cls+=' out';
    let tag='';
    if(!st) tag = h&&!h.result ? 'czeka' : (p.chips===0?'bez żetonów':'');
    else if(h.result&&h.result.showdown&&h.result.hands&&h.result.hands[p.id]) tag=`<span class="tag hand">${esc(h.result.hands[p.id])}</span>`;
    else if(st.folded) tag='pas';
    else if(st.allIn) tag='all-in';
    else if(h.last&&h.last[p.id]) tag=esc(h.last[p.id]);
    if(tag && !tag.startsWith('<')) tag=`<span class="tag">${tag}</span>`;
    if(shown && !(h.result&&h.result.showdown)) tag=`<span class="tag hand">pokazuje</span>`;
    let hole='';
    const flyAttr=(ci)=>dealing?` fly" style="--fx:${((50-x)/100*W).toFixed(0)}px;--fy:${((50-y)/100*H).toFixed(0)}px;animation-delay:${SHUF_MS+(i*2+ci)*70}ms`:'';
    if(st && (!st.folded || shown)){
      const show = isMe || shown || (h.result&&h.result.showdown);
      const hs=show?hlCards(h):null;
      hole=`<div class="hole">${h.hole[p.id].map((c,ci)=>cardHtml(show?c:'back',(isMe?'md':'sm')+flyAttr(ci)+hlCls(hs,c))).join('')}</div>`;
    }
    if(isMe) hole='';
    const dealer=h&&h.dealer===p.id?'<span class="dealer" title="Rozdający">D</span>':'';
    const turnNow=h&&!h.result&&h.toAct===p.id;
    const ring=turnNow?'<span class="ring"></span>':'';
    const sclock=turnNow?`<span class="seat-clock" id="seatClock">${fmtClock(Math.max(0,SKIP_MS-(Date.now()-h.turnAt)))}</span>`:'';
    html+=`<div class="${cls}" style="left:${x}%;top:${y}%">${sclock}
      <div class="av ${isMe?'mine':''}" ${isMe?'data-photo="1" title="Zmień zdjęcie"':''}>${ring}${avatarHtml(p,dealer)}</div>
      <div class="plate"><div class="nm">${esc(p.name)}</div><div class="ch">${p.chips}</div>${moneyHtml(p)}${(p.buyins||1)>1?`<span class="rbs">🔄 dokupki: ${(p.buyins||1)-1}</span>`:''}${tag}</div>
      ${hole}
    </div>`;
    if(st&&st.bet>0){
      html+=`<div class="bet" style="left:${bx}%;top:${by}%">${stacksHtml(st.bet,4,6)}${st.bet}</div>`;
    }
  });
  $('seats').innerHTML=html;

  let c='';
  if(h){
    const fresh=h.board.length>lastBoardLen;
    const hs=hlCards(h);
    const slots=[0,1,2,3,4].map(i=>cardHtml(h.board[i], (fresh&&i>=lastBoardLen?'deal':'')+(h.board[i]?hlCls(hs,h.board[i]):''))).join('');
    lastBoardLen=h.board.length;
    c+=`<div class="board">${slots}</div>`;
    if(h.result){
      c+=`<div class="banner">${h.result.winners.map(w=>`<b>${esc(nm(s,w.id))}</b> wygrywa ${w.amount}${w.hand?` · ${esc(w.hand)}`:''}`).join('<br>')}</div>`;
    } else c+=`<div class="pot">${stacksHtml(h.pot,6,8,'big')}<div><div class="lbl">Pula</div>${h.pot}</div></div>`;
  } else {
    lastBoardLen=0;
    c+= s.players.length<2 ? `<div class="hint">Czekamy na graczy. Wyślij znajomym link do tej strony.</div>` : `<div class="hint">Gotowe do gry. Kliknij „Rozdaj karty”.</div>`;
  }
  $('center').innerHTML=c;
}

// ---------- sound (synthesized, no files) ----------
let actx=null, muted=false;
try{muted=localStorage.getItem('ns-mute')==='1'}catch(_){}
function ac(){
  if(!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)()}catch(_){return null}}
  if(actx.state==='suspended') actx.resume().catch(()=>{});
  return actx;
}
function tone(f,dur,type='sine',vol=.18,when=0,slideTo=0){
  const a=actx; if(!a||muted||a.state!=='running') return;
  const t=a.currentTime+when, o=a.createOscillator(), g=a.createGain();
  o.type=type; o.frequency.setValueAtTime(f,t); if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo,t+dur);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.008); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t+dur+.02);
}
function noise(dur,vol=.15,when=0,freq=2000,q=1){
  const a=actx; if(!a||muted||a.state!=='running') return;
  const t=a.currentTime+when, len=Math.max(1,Math.floor(a.sampleRate*dur)), buf=a.createBuffer(1,len,a.sampleRate), d=buf.getChannelData(0);
  for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-i/len);
  const src=a.createBufferSource(), bp=a.createBiquadFilter(), g=a.createGain();
  src.buffer=buf; bp.type='bandpass'; bp.frequency.value=freq; bp.Q.value=q; g.gain.value=vol;
  src.connect(bp).connect(g).connect(a.destination); src.start(t);
}
const SFX={
  shuffle(){[0.12,0.92].forEach(o=>{for(let i=0;i<14;i++)noise(.04,.2,o+.28+i*.028,1800+Math.random()*1800,.8)});noise(.06,.25,1.72,900,.7)},
  deal(n,base=.55){for(let i=0;i<n;i++)noise(.035,.16,base+i*.07,3500,1.2)},
  chip(k=1){for(let i=0;i<k;i++){const w=i*.06+Math.random()*.02;tone(2500+Math.random()*700,.07,'triangle',.12,w);tone(3600+Math.random()*500,.05,'sine',.06,w+.01)}},
  check(){tone(160,.07,'sine',.35);tone(150,.07,'sine',.3,.12)},
  fold(){noise(.18,.12,0,900,.6)},
  turn(){tone(880,.16,'sine',.2);tone(1318,.28,'sine',.18,.13)},
  tick(){tone(1200,.04,'square',.05)},
  win(){[523,659,784,1047].forEach((f,i)=>tone(f,.3,'triangle',.17,i*.12));tone(1568,.5,'sine',.12,.5)},
  lose(){tone(392,.25,'triangle',.12);tone(330,.35,'triangle',.1,.2)}
};
function setMuteUI(){const b=$('btnMute');b.textContent=muted?'🔇':'🔊';b.setAttribute('aria-label',muted?'Włącz dźwięki':'Wycisz dźwięki')}

// ---------- dealer shuffle ----------
function playShuffle(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  shuffleUntil=Date.now()+SHUF_MS;
  const room=$('room'); const old=room.querySelector('.shuffler'); if(old) old.remove();
  const half=(cls)=>`<div class="half ${cls}">${[0,1,2,3,4,5,6,7].map(i=>`<i class="cb" style="transform:translate(${(cls==='l'?-1:1)*i*.7}px,${-i*2}px)"></i>`).join('')}</div>`;
  const el=document.createElement('div'); el.className='shuffler';
  el.innerHTML=`<div class="pile">${half('l')}${half('r')}</div>`;
  room.appendChild(el); room.classList.add('shuffling');
  setTimeout(()=>{el.classList.add('out')},SHUF_MS-150);
  setTimeout(()=>{el.remove();room.classList.remove('shuffling')},SHUF_MS+250);
}

// ---------- chip and card motion ----------
function flyChips(from,to,amount,delay=0){
  if(!amount) return;
  const el=document.createElement('div'); el.className='flychips';
  el.innerHTML=stacksHtml(amount,3,4); el.style.left=from.x+'%'; el.style.top=from.y+'%';
  $('room').appendChild(el);
  setTimeout(()=>{requestAnimationFrame(()=>{el.style.left=to.x+'%';el.style.top=to.y+'%';el.style.opacity='0'})},delay+20);
  setTimeout(()=>el.remove(),delay+900);
}
const CENTER={x:50,y:47};
function onStateChange(prev,next){
  const ph=prev&&prev.hand, nh=next.hand;
  if(!nh) return;
  const L=layout(next), pos=id=>L.pos[id];
  const sameHand=ph&&ph.no===nh.no;
  if(!sameHand){
    if(!nh.result){dealAnimNo=nh.no;playShuffle();SFX.shuffle();SFX.deal(nh.order.length*2,SHUF_MS/1000+.1)}
    if(nh.toAct===me) setTimeout(()=>SFX.turn(),SHUF_MS+900);
    return;
  }
  // actions
  let chipSound=0;
  nh.order.forEach(id=>{
    const a=ph.st[id], b=nh.st[id], p=pos(id); if(!a||!b||!p) return;
    if(b.total>a.total){const delta=b.total-a.total; flyChips({x:p.x,y:p.y},b.bet>0?{x:p.bx,y:p.by}:CENTER,delta); chipSound++}
    if(b.folded&&!a.folded) SFX.fold();
    else if(nh.last&&nh.last[id]==='czeka'&&(!ph.last||ph.last[id]!=='czeka')) SFX.check();
  });
  if(chipSound) SFX.chip(Math.min(4,chipSound+1));
  // street ended: bets slide into the pot
  const streetEnded = ph.stage!==nh.stage || (!ph.result&&nh.result);
  if(streetEnded) nh.order.forEach(id=>{const a=ph.st[id], b=nh.st[id], p=pos(id); const amt=a?a.bet:0; if(p&&amt>0) flyChips({x:p.bx,y:p.by},CENTER,amt,chipSound?350:0)});
  if(streetEnded&&!nh.result) setTimeout(()=>SFX.deal(nh.board.length-ph.board.length),100);
  // hand finished: pot goes to the winners
  if(!ph.result&&nh.result){
    nh.result.winners.forEach((w,i)=>{const p=pos(w.id); if(p) flyChips(CENTER,{x:p.x,y:p.y},w.amount,700+i*150)});
    const iWon=nh.result.winners.some(w=>w.id===me), iPlayed=!!nh.st[me];
    setTimeout(()=>{iWon?SFX.win():(iPlayed?SFX.lose():SFX.chip(3))},650);
  }
  if(nh.toAct===me&&ph.toAct!==me) SFX.turn();
}

// ---------- turn timer ----------
let autoActedFor=null, lastTickSec=-1;
let lastTimeoutTry=0;
function tickTimer(){
  if(!demo&&state&&handActive(state)&&state.hand.toAct!==me&&mySeat()){
    const lft=SKIP_MS-(Date.now()-(state.hand.turnAt||0));
    if(lft<-3000&&Date.now()-lastTimeoutTry>5000){lastTimeoutTry=Date.now();KP&&KP.send('timeout',{}).catch(()=>{})}
  }
  if(!state) return;
  const s=viewState(), h=s.hand;
  if(!handActive(s)||!h.toAct) return;
  const left=Math.max(0,SKIP_MS-(Date.now()-(h.turnAt||0)));
  const ring=document.querySelector('.seat.turn .ring');
  if(ring){ring.style.setProperty('--p',(left/SKIP_MS).toFixed(3));ring.style.setProperty('--rc',left<15000?'#e5534b':'var(--brass)')}
  const sc=$('seatClock'); if(sc){sc.textContent=fmtClock(left);sc.classList.toggle('low',left<15000)}
  if(h.toAct===me){
    const sec=Math.ceil(left/1000);
    if(sec<=5&&sec>0&&sec!==lastTickSec){lastTickSec=sec;SFX.tick()}
    if(left===0&&autoActedFor!==h.turnAt&&!tut){
      autoActedFor=h.turnAt;
      doIt('timeout',{},(ns,now)=>act(ns,me,'fold',0,now)).then(ok=>{if(ok)toast('Czas minął: automatyczny fold.')});
    }
  }
}

// ---------- render: action bar ----------
function fmtClock(ms){const s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function updateBetUI(){
  const i=$('betInput'); if(i&&document.activeElement!==i) i.value=betAmt||'';
  const mx=i?+i.dataset.max:0;
  document.querySelectorAll('.tok[data-add]').forEach(t=>t.disabled=betAmt+ +t.dataset.add>mx);
}
function renderBar(s){
  const h=s.hand, meP=mySeat()?P(s,me):null;
  let status='', key='', controls='';
  if(!online()){status=serverOk?'':'Łączenie z serwerem…'; key='nodb'+serverOk;}
  else if(!meP){status= watching?'Oglądasz grę.':''; key='watch'+watching;
    if(watching) controls=`<div class="acts" style="grid-template-columns:1fr"><button class="btn primary" data-a="sit">Usiądź przy stole</button></div>`;}
  else {
    const live=handActive(s), st=live&&h.st?h.st[me]:null, myTurn=live&&h.toAct===me;
    const left=live?Math.max(0,SKIP_MS-(Date.now()-h.turnAt)):0;
    const toCall=myTurn?Math.min(h.currentBet-st.bet,meP.chips):0;
    const minRaiseAdd=myTurn?h.currentBet+h.minRaise-st.bet:0;
    const late=live&&!myTurn&&Date.now()-(h.turnAt||0)>SKIP_MS+5000;
    const elig=s.players.filter(p=>p.chips>0).length;
    const canShow=!!(h&&h.result&&!h.result.showdown&&h.st&&h.st[me]&&!(h.shown&&h.shown[me]));
    const lockLeft=h&&h.result&&h.result.at?Math.ceil((HL_MS-(Date.now()-h.result.at))/1000):0;
    key=`p${lockLeft>0?lockLeft:0}${live}${myTurn}${h?h.no:0}${h?h.stage:''}${h?h.currentBet:0}${st?st.bet:0}${meP.chips}${late}${st&&st.folded}${elig}${canShow}${photos[me]?1:0}`;
    if(myTurn && key!==lastBarKey) betAmt=0;
    const who=live&&h.toAct?esc(nm(s,h.toAct)):'';
    if(!live) status = elig<2 ? 'Potrzeba co najmniej 2 graczy z żetonami.' : (h?'Rozdanie zakończone.':'Wszyscy gotowi?');
    else if(myTurn) status='';
    else status=(st&&!st.folded?`Ruch: <b>${who}</b>`:(st?`Spasowałeś. Ruch: <b>${who}</b>`:`Dołączysz od następnego rozdania. Ruch: <b>${who}</b>`));
    const strip=`<div class="me-strip">
        <div class="av mine" data-photo="1" title="Zmień zdjęcie">${avatarHtml(meP)}</div>
        <div class="who"><b>${esc(meP.name)}</b>${moneyHtml(meP)}</div>
        ${h&&h.st&&h.st[me]&&h.hole[me]?`<div class="mycards">${h.hole[me].map((c,ci)=>{const w=shuffleUntil-Date.now()+ci*120;return cardHtml(c,'md'+(h.st[me].folded?' dim':'')+hlCls(hlCards(h),c)+(w>-300?` late" style="animation-delay:${Math.max(0,w)}ms`:''))}).join('')}</div>`:''}
        ${myTurn?`<button class="btn primary postaw" data-a="bet" type="button">Postaw</button>`:''}
        <div class="stackv">${meP.chips}<small>żetonów</small></div>
      </div>`;
    const rack=`<div class="rack">${DENOMS.slice().reverse().map(d=>`<button class="tok d${d}" data-add="${d}" type="button" aria-label="Postaw ${d}" ${myTurn?'':'disabled'}>${chipFace(d)}</button>`).join('')}</div>`;
    let rest='';
    if(myTurn){
      rest=`<div class="need">Do sprawdzenia: <b>${toCall}</b>${meP.chips>toCall?` · min. podbicie: <b>${Math.min(minRaiseAdd,meP.chips)}</b>`:''}</div>
      <div class="stake"><input type="number" id="betInput" inputmode="numeric" min="0" step="${UNIT}" data-max="${meP.chips}" placeholder="0" aria-label="Kwota do postawienia"><button class="btn" data-clear="1" type="button">Wyczyść</button></div>
      <div class="big-acts">
        <button class="btn fold" data-a="fold" type="button">Fold</button>
        ${toCall>0?`<button class="btn call" data-a="call" type="button">Call<small>${toCall}</small></button>`:`<button class="btn call" data-a="check" type="button">Check</button>`}
        <button class="btn allin" data-a="allin" type="button">All-in<small>${meP.chips}</small></button>
      </div>`;
    } else if(!live){
      const cols=1+(meP.chips===0?1:0)+(canShow?1:0);
      rest=`<div class="big-acts" style="grid-template-columns:repeat(${cols},1fr)">
        ${canShow?`<button class="btn call" data-a="show" type="button">Pokaż karty</button>`:''}
        ${meP.chips===0?`<button class="btn fold" data-a="rebuy" type="button">Dokup<small>${START} żet.</small></button>`:''}
        <button class="btn allin" data-a="deal" type="button" ${elig<2||lockLeft>0?'disabled':''}>${h?'Następne rozdanie':'Rozdaj karty'}${lockLeft>0?`<small>za ${lockLeft} s</small>`:''}</button></div>`;
    } else if(late){
      rest=`<div class="acts" style="grid-template-columns:1fr"><button class="btn" data-a="skip">${who} nie odpowiada: spasuj za niego</button></div>`;
    }
    controls=`<div class="me-panel ${myTurn?'myturn':''}">${strip}${rack}${rest}</div>`;
  }
  $('status').innerHTML=status;
  if(key!==lastBarKey){ $('controls').innerHTML=controls; lastBarKey=key; updateBetUI(); }
}

// ---------- chat ----------
const NAME_COLORS=['#25d366','#53bdeb','#ffb347','#ff7a8a','#c792ea','#7fdbca','#f4d35e','#ff9f68','#9be15d'];
function colorFor(id){let h=0;for(const ch of String(id))h=(h*31+ch.charCodeAt(0))>>>0;return NAME_COLORS[h%NAME_COLORS.length]}
function myChatName(){const p=mySeat();if(p)return p.name;try{const n=localStorage.getItem('ns-name');if(n)return n}catch(_){}return 'Widz'}
function isEmojiOnly(t){const s=t.replace(/\s/g,'');if(!s||s.length>24)return false;return /^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Regional_Indicator}|‍|️|⃣|[#*0-9])+$/u.test(s)&&!/^[#*0-9]+$/.test(s)}
function fmtTime(ts){const d=new Date(ts);return d.toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'})}
function fmtDay(ts){const d=new Date(ts),t=new Date();const y=new Date();y.setDate(t.getDate()-1);
  if(d.toDateString()===t.toDateString())return 'Dzisiaj'; if(d.toDateString()===y.toDateString())return 'Wczoraj';
  return d.toLocaleDateString('pl-PL',{day:'numeric',month:'long'})}
function stickerHtml(id){const k=STICKERS.find(x=>x.id===id)||STICKERS[0];return `<div class="sticker"><span class="e a-${k.a}">${k.e}</span><span class="cap">${esc(k.cap)}</span></div>`}
function renderChat(){
  const box=$('msgs'); if(!box) return;
  const nearBottom=box.scrollHeight-box.scrollTop-box.clientHeight<80;
  if(!messages.length){box.innerHTML='<div class="empty-chat">Wiadomości z tego czatu widzą wszyscy przy stole. Napisz coś pierwszy!</div>';return}
  let html='',prevDay='',prevUid=null,prevAt=0;
  for(const m of messages){
    const day=fmtDay(m.at); if(day!==prevDay){html+=`<div class="day">${esc(day)}</div>`;prevDay=day;prevUid=null}
    const mine=m.uid===me, first=m.uid!==prevUid||m.at-prevAt>5*60000;
    const meta=`<span class="meta">${fmtTime(m.at)}${mine?'<span class="tick">✓✓</span>':''}</span>`;
    const who=!mine&&first?`<div class="who" style="color:${colorFor(m.uid)}">${esc(m.name||'Gracz')}</div>`:'';
    let cls=`msg ${mine?'out':'in'}${first?' first':''}`, body='';
    if(m.kind==='sticker'){cls+=' big';body=`${who}${stickerHtml(m.sticker)}${meta}`}
    else if(m.kind==='gif'&&m.gif){cls+=' media';body=`${who}<img class="gif" src="${esc(KP?KP.gifUrl(m.gif):'')}" alt="GIF" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{textContent:'GIF niedostępny',style:'padding:20px;color:#8696a0'}))">${meta}`}
    else if(isEmojiOnly(m.text||'')){cls+=' big';body=`${who}<div class="txt">${esc(m.text)}</div>${meta}`}
    else body=`${who}<span class="txt">${esc(m.text||'')}</span>${meta}`;
    html+=`<div class="${cls}">${body}</div>`;
    prevUid=m.uid; prevAt=m.at;
  }
  box.innerHTML=html;
  if(nearBottom||firstChatLoad) box.scrollTop=box.scrollHeight;
}
function updateBadge(){
  const unread=messages.filter(m=>m.at>lastSeen&&m.uid!==me).length;
  const b=$('badge'); b.hidden=!unread||chatOpen; b.textContent=unread>99?'99+':unread;
}
function markSeen(){if(messages.length){lastSeen=messages[messages.length-1].at;try{localStorage.setItem('ns-seen',String(lastSeen))}catch(_){}}updateBadge()}
function setChat(open){
  chatOpen=open; $('main').classList.toggle('chat-open',open); $('fab').hidden=open||!online();
  if(open){markSeen();firstChatLoad=true;renderChat();firstChatLoad=false;setTimeout(()=>{if(matchMedia('(min-width:860px)').matches)$('chatInput').focus()},50)}
  else{$('picker').hidden=true}
  requestAnimationFrame(()=>{if(state)renderTable(viewState())});
}
async function sendMsg(data){
  if(demo){messages=messages.concat(Object.assign({uid:me,name:myChatName(),at:Date.now()},data));renderChat();return true}
  if(!KP||!isMember){toast('Najpierw wejdź do stołu.');return false}
  try{ await KP.sendChat(Object.assign({name:myChatName()},data)); return true; }
  catch(e){ toast('Nie udało się wysłać wiadomości.'); return false; }
}
function renderPicker(){
  const tabs=EMOJI_TABS.map((t,i)=>`<button type="button" data-ptab="${i}" class="${pickerTab===i?'on':''}" title="${t[1]}">${t[0]}</button>`).join('')
    +`<button type="button" class="txt ${pickerTab==='stk'?'on':''}" data-ptab="stk">NAKLEJKI</button><button type="button" class="txt ${pickerTab==='gif'?'on':''}" data-ptab="gif">GIF</button>`;
  $('ptabs').innerHTML=tabs;
  const g=$('pgrid');
  if(pickerTab==='stk'){g.className='pgrid wide';g.innerHTML=STICKERS.map(k=>`<button type="button" class="stk-pick" data-stk="${k.id}">${stickerHtml(k.id)}</button>`).join('')}
  else if(pickerTab==='gif'){
    g.className='pgrid wide';
    g.innerHTML=`<div class="pnote">GIF-y dodane przez graczy. Dodaj własny z telefonu, a zostanie tu dla wszystkich.</div>`
      +(KP&&!demo?`<button type="button" class="gif-add" data-gifadd="1">+ Dodaj GIF</button>`:'<div class="pnote">W podglądzie nie można dodawać GIF-ów.</div>')
      +gifLib.slice().reverse().map(id=>`<button type="button" class="gif-pick" data-gif="${esc(id)}"><img src="${esc(KP?KP.gifUrl(id):'')}" alt="GIF" loading="lazy"></button>`).join('');
  }
  else{const t=EMOJI_TABS[pickerTab||0];g.className='pgrid';g.innerHTML=t[2].split(' ').map(e=>`<button type="button" class="em" data-em="${e}">${e}</button>`).join('')}
}
function openPicker(tab){
  const p=$('picker');
  if(!p.hidden&&(pickerTab===tab||(tab===0&&typeof pickerTab==='number'))){p.hidden=true;return}
  pickerTab=tab; p.hidden=false; renderPicker();
}
async function uploadGif(file){
  if(!KP||demo){toast('W podglądzie nie można dodawać GIF-ów.');return}
  if(file.size>20*1024*1024){toast('Plik jest za duży (max 20 MB).');return}
  toast('Wysyłam GIF…');
  try{
    const path=await KP.uploadGif(file);
    await sendMsg({kind:'gif',gif:path});
    $('picker').hidden=true;
  }catch(e){toast('Nie udało się wysłać GIF-a. Wybierz GIF, WebP, PNG, JPG lub MP4 do 20 MB.')}
}

// ---------- events ----------
document.addEventListener('click',async e=>{
  const close=e.target.closest('[data-close]'); if(close){$(close.dataset.close).hidden=true;return}
  const add=e.target.closest('[data-add]'); if(add){const i=$('betInput');if(!i)return;betAmt=Math.min(+i.dataset.max,betAmt+ +add.dataset.add);if(document.activeElement===i)i.blur();updateBetUI();SFX.chip(1);return}
  if(e.target.closest('[data-clear]')){betAmt=0;const i=$('betInput');if(i)i.value='';updateBetUI();return}
  const lv=e.target.closest('[data-level]'); if(lv){const [a,b]=lv.dataset.level.split(',').map(Number);
    await doIt('blinds',{sb:a,bb:b},s=>setBlinds(s,a,b));$('blindsBox').hidden=true;return}
  const pt=e.target.closest('[data-ptab]'); if(pt){const v=pt.dataset.ptab;pickerTab=isNaN(+v)?v:+v;renderPicker();return}
  const em=e.target.closest('[data-em]'); if(em){const i=$('chatInput');const pos=i.selectionStart??i.value.length;i.value=i.value.slice(0,pos)+em.dataset.em+i.value.slice(i.selectionEnd??pos);const np=pos+em.dataset.em.length;try{i.setSelectionRange(np,np)}catch(_){}return}
  const sk=e.target.closest('[data-stk]'); if(sk){if(await sendMsg({kind:'sticker',sticker:sk.dataset.stk}))$('picker').hidden=true;return}
  const gf=e.target.closest('[data-gif]'); if(gf){if(await sendMsg({kind:'gif',gif:gf.dataset.gif}))$('picker').hidden=true;return}
  if(e.target.closest('[data-gifadd]')){$('gifFile').click();return}
  if(e.target.closest('[data-photo]')){$('photoQuick').click();return}
  const b=e.target.closest('[data-a]'); if(!b) return;
  const a=b.dataset.a;
  if(a==='sit'){watching=false;render();return}
  if(a==='deal') return doIt('deal',{},(s,now)=>dealHand(s,now));
  if(a==='rebuy') return doIt('rebuy',{},s=>rebuy(s,me));
  if(a==='show') return doIt('show',{},s=>showCards(s,me));
  if(a==='skip') return doIt('timeout',{},(s,now)=>timeoutFold(s,now));
  if(a==='bet'){
    const s=viewState(),h=s.hand,p=P(s,me); if(!handActive(s)||h.toAct!==me||!p) return;
    const st=h.st[me], toCall=h.currentBet-st.bet, amt=Math.floor(betAmt||0);
    let type=null,to=0;
    if(amt<=0){ if(toCall<=0) type='check'; else {toast('Kliknij żetony albo wpisz kwotę.');return} }
    else if(amt>=p.chips) type='allin';
    else if(amt%UNIT){toast(`Kwota musi być wielokrotnością ${UNIT}.`);return}
    else if(amt<toCall){toast(`Za mało. Do sprawdzenia: ${toCall}.`);return}
    else if(amt===toCall) type='call';
    else { to=st.bet+amt; if(to<h.currentBet+h.minRaise){toast(`Za małe podbicie. Postaw ${toCall} (call) albo co najmniej ${h.currentBet+h.minRaise-st.bet}.`);return} type='raise'; }
    return doIt('act',{type,amount:to},(ns,now)=>act(ns,me,type,to,now));
  }
  if(['fold','check','call','allin'].includes(a)) return doIt('act',{type:a},(s,now)=>act(s,me,a,0,now));
});
document.addEventListener('input',e=>{if(e.target.id==='betInput'){betAmt=Math.max(0,Math.floor(+e.target.value||0));updateBetUI()}});
document.addEventListener('keydown',e=>{if(e.target.id==='betInput'&&e.key==='Enter'){e.preventDefault();const b=document.querySelector('[data-a="bet"]');if(b)b.click()}});
$('fab').onclick=()=>setChat(true);
$('btnMute').onclick=()=>{muted=!muted;try{localStorage.setItem('ns-mute',muted?'1':'0')}catch(_){}setMuteUI();if(!muted){ac();setTimeout(()=>SFX.chip(2),30)}};
setMuteUI();
document.addEventListener('pointerdown',()=>ac(),{passive:true});
setInterval(tickTimer,250);
$('chatClose').onclick=()=>setChat(false);
$('emojiBtn').onclick=()=>openPicker(typeof pickerTab==='number'?pickerTab:0);
$('gifBtn').onclick=()=>openPicker('gif');
$('gifFile').onchange=e=>{const f=e.target.files[0];if(f)uploadGif(f);e.target.value=''};
$('comp').onsubmit=async e=>{e.preventDefault();const i=$('chatInput');const t=i.value.trim();if(!t)return;i.value='';if(!await sendMsg({kind:'text',text:t.slice(0,500)}))i.value=t};
$('blindsPill').onclick=()=>{if(isOwner)$('blindsBox').hidden=false};
$('blindsMenuBtn').onclick=()=>{$('menuBox').hidden=true;$('blindsBox').hidden=false};
$('btnLog').onclick=()=>{$('logBox').hidden=false};
$('btnMenu').onclick=()=>{$('menuBox').hidden=false;$('resetConfirm').hidden=true;$('resetBtn').hidden=false};
$('rankMenu').onclick=()=>{$('menuBox').hidden=true;renderRanking(viewState());$('rankReset').hidden=false;$('rankResetOk').hidden=true;$('rankBox').hidden=false};
document.addEventListener('click',e=>{const b=e.target.closest('[data-rtab]');if(!b)return;rankTab=b.dataset.rtab;$('rankReset').hidden=false;$('rankResetOk').hidden=true;renderRanking(viewState())});
$('rankReset').onclick=()=>{$('rankReset').hidden=true;$('rankResetOk').hidden=false};
$('rankResetOk').onclick=async()=>{$('rankBox').hidden=true;await doIt('resetRanking',{},s=>resetRanking(s))};
$('photoChange').onclick=()=>{$('menuBox').hidden=true;$('photoQuick').click()};
$('leaveBtn').onclick=async()=>{$('menuBox').hidden=true;await doIt('leave',{},(s,now)=>leavePlayer(s,me,now))};
$('resetBtn').onclick=()=>{$('resetBtn').hidden=true;$('resetConfirm').hidden=false};
$('resetConfirm').onclick=async()=>{$('menuBox').hidden=true;await doIt('reset',{},s=>resetGame(s))};
$('watchBtn').onclick=async()=>{const code=$('codeInput').value.trim();if(!code){toast('Żeby oglądać, też wpisz kod stołu.');return}if(!KP||!serverOk)return;if(await enterTable(code)){watching=true;render()}};
$('photoInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{pendingPhoto=await resizeImage(f);$('photoPreview').innerHTML=`<img src="${pendingPhoto}" alt="">`}catch(_){toast('Nie udało się wczytać zdjęcia.')}};
$('photoQuick').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const d=await resizeImage(f);photos[me]=d;render();await savePhoto(d)}catch(_){toast('Nie udało się wczytać zdjęcia.')}e.target.value=''};
$('nameInput').oninput=e=>{if(!pendingPhoto)$('photoPreview').textContent=initials(e.target.value)};
async function enterTable(code){
  const r=await KP.send('enter',{code});
  if(!r.ok){toast(r.error||'Zły kod stołu.');return false}
  try{localStorage.setItem('ns-code',code)}catch(_){}
  isMember=true; startLive(); return true;
}
$('joinForm').onsubmit=async e=>{
  e.preventDefault();
  const name=$('nameInput').value.trim().replace(/\s+/g,' ');
  const code=$('codeInput').value.trim();
  if(!name){toast('Wpisz imię i nazwisko.');return}
  if(!code){toast('Wpisz kod stołu. Dostaniesz go od właściciela.');return}
  if(!KP||!serverOk){toast('Brak połączenia z serwerem. Odśwież stronę.');return}
  $('joinBtn').disabled=true;
  let ok=false;
  try{
    const r=await KP.send('join',{name,code});
    if(!r.ok) toast(r.error||'Nie udało się usiąść.');
    else{ok=true;try{localStorage.setItem('ns-code',code)}catch(_){} isMember=true; startLive();}
  }catch(_){toast('Brak połączenia z serwerem.')}
  if(ok&&pendingPhoto) await savePhoto(pendingPhoto);
  $('joinBtn').disabled=false;
  if(ok) try{localStorage.setItem('ns-name',name)}catch(_){}
  if(ok){let seen=false;try{seen=localStorage.getItem('ns-tut')==='1'}catch(_){}
    if(!seen){$('tutHello').textContent=`Witaj, ${name.split(' ')[0]}!`;$('tutInvite').hidden=false}}
};
window.addEventListener('resize',()=>{if(state)renderTable(viewState())});
setInterval(()=>{if(state&&handActive(state))renderBar(viewState())},3000);

// ---------- preview mode ----------
let demoTimer=0;
function demoTick(){
  clearTimeout(demoTimer);
  if(!demo||!state||tut) return;
  const s=viewState(), h=s.hand;
  if(!handActive(s)||h.toAct===me) return;
  demoTimer=setTimeout(()=>{
    if(!demo) return;
    mutate((ns,now)=>{
      const hh=ns.hand; if(!hh||hh.result) return false;
      const id=hh.toAct, st=hh.st[id], p=P(ns,id), toCall=hh.currentBet-st.bet, r=Math.random();
      if(toCall>0){
        if(r<.15) return act(ns,id,'fold',0,now);
        if(r<.85||p.chips<=toCall) return act(ns,id,'call',0,now);
        return act(ns,id,'raise',Math.ceil((hh.currentBet+hh.minRaise)/UNIT)*UNIT,now)||act(ns,id,'call',0,now);
      }
      if(r<.7) return act(ns,id,'check',0,now);
      const to=Math.max(hh.bbAmt*2,Math.floor(hh.pot/2/UNIT)*UNIT);
      return act(ns,id,'raise',to,now)||act(ns,id,'check',0,now);
    });
  },1700+Math.random()*1300);
}
function startDemo(){
  if(!demoSaved) demoSaved={me,isOwner,messages};
  demo=true; watching=false; me='demo-me'; isOwner=true;
  const names=[['demo-me',myChatName()!=='Widz'?myChatName():'Paweł Kulczyk',1000,1],['demo-kuba','Kuba Nowak',1460,1],['demo-marta','Marta Wiśniewska',725,1],['demo-tomek','Tomek Zieliński',1890,2],['demo-ania','Ania Lewandowska',940,1]];
  const s=newState(); s.sb=10; s.bb=20;
  names.forEach(([id,name,chips,buyins])=>s.players.push({id,name,chips,buyins}));
  s.dealerId='demo-marta';
  startHand(s,Date.now());
  // play preflop calls and a flop bet so the hand is in motion
  let guard=0;
  while(handActive(s)&&guard++<40){
    const h=s.hand, id=h.toAct, st=h.st[id], toCall=h.currentBet-st.bet;
    if(h.stage==='flop'&&id===me) break;
    if(h.stage==='flop'&&h.currentBet===0&&id==='demo-tomek'){act(s,id,'raise',60,Date.now());continue}
    if(h.stage==='preflop'&&id==='demo-ania'){act(s,id,'fold',0,Date.now());continue}
    act(s,id,toCall>0?'call':'check',0,Date.now());
  }
  if(s.hand) s.hand.turnAt=Date.now()-38000;
  state=s; lastBoardLen=s.hand?s.hand.board.length:0;
  const t0=Date.now()-6*60000;
  messages=[
    {uid:'demo-kuba',name:'Kuba Nowak',kind:'text',text:'No to gramy panowie 😎',at:t0},
    {uid:'demo-marta',name:'Marta Wiśniewska',kind:'text',text:'Dziś was ogram 🃏🔥',at:t0+40000},
    {uid:'demo-tomek',name:'Tomek Zieliński',kind:'sticker',sticker:'rak',at:t0+90000},
    {uid:'demo-me',name:'Ja',kind:'text',text:'Zobaczymy 😏',at:t0+120000},
    {uid:'demo-kuba',name:'Kuba Nowak',kind:'text',text:'😂😂😂',at:t0+150000}
  ];
  $('demoBar').hidden=false; $('menuBox').hidden=true; lastBarKey='';
  render(); updateBadge(); demoTick();
  try{if(location.hash!=='#podglad')history.replaceState(null,'','#podglad')}catch(_){}
}
function exitDemo(){
  clearTimeout(demoTimer); demo=false; $('demoBar').hidden=true;
  if(demoSaved){me=demoSaved.me;isOwner=demoSaved.isOwner;demoSaved=null}
  state=lastRealState; messages=lastRealMsgs; lastBarKey=''; lastBoardLen=0;
  try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}
  setOwnerUI(); render(); if(chatOpen) renderChat(); updateBadge();
}
$('demoBtn').onclick=startDemo;

// ---------- tutorial ----------
const RANKS_HTML=`<div class="ranks">${[
 ['Poker królewski','A K Q J 10 w jednym kolorze','A♠&#xFE0E; K♠&#xFE0E; Q♠&#xFE0E; J♠&#xFE0E; 10♠&#xFE0E;'],
 ['Poker','5 kart po kolei w jednym kolorze','9<span class="r">♥&#xFE0E;</span> 8<span class="r">♥&#xFE0E;</span> 7<span class="r">♥&#xFE0E;</span> 6<span class="r">♥&#xFE0E;</span> 5<span class="r">♥&#xFE0E;</span>'],
 ['Kareta','4 karty tej samej wartości','K K K K'],
 ['Full','trójka + para','Q Q Q 7 7'],
 ['Kolor','5 kart w jednym kolorze','<span class="r">♦&#xFE0E; ♦&#xFE0E; ♦&#xFE0E; ♦&#xFE0E; ♦&#xFE0E;</span>'],
 ['Strit','5 kart po kolei','5 6 7 8 9'],
 ['Trójka','3 karty tej samej wartości','7 7 7'],
 ['Dwie pary','dwie różne pary','J J 4 4'],
 ['Para','2 karty tej samej wartości','8 8'],
 ['Wysoka karta','nic z powyższych','A …']
].map((r,i)=>`<div><span>${i+1}.</span><span><b>${r[0]}</b><br><small style="color:var(--muted)">${r[1]}</small></span><em>${r[2]}</em></div>`).join('')}</div>`;
const TUT=[
 {t:'Witaj w KULAS POKER',p:'Gramy w <b>Texas Hold\'em</b> na żetony. Każdy zaczyna z <b>1000 żetonów, czyli 100 zł</b>. Pokażę Ci wszystko na przykładowym rozdaniu z wymyślonymi graczami.'},
 {s:'.felt',t:'Stół',p:'Gracze siedzą dookoła stołu. Przy każdym widać imię, liczbę żetonów i ostatni ruch. Znaczek <b>D</b> ma rozdający, który zmienia się co rozdanie.'},
 {s:'.board',t:'Karty wspólne',p:'Na środek trafiają karty wspólne dla wszystkich: najpierw <b>flop</b> (3 karty), potem <b>turn</b> (1) i <b>river</b> (1). Wygrywa najlepszy układ 5 kart złożony z Twoich 2 kart i 5 wspólnych.'},
 {s:'.mycards',t:'Twoje karty',p:'Te dwie karty widzisz <b>tylko Ty</b>. Inni zobaczą je dopiero na koniec rozdania.'},
 {s:'.pot',t:'Pula',p:'Tu zbierają się wszystkie postawione żetony. Zwycięzca rozdania zgarnia całą pulę.'},
 {s:'#seatClock',pad:10,t:'Zegar ruchu',p:'Gracz, który ma ruch, ma na decyzję <b>2 minuty</b>. Zegar widać przy jego zdjęciu. W ostatnich 15 sekundach robi się czerwony, a po upływie czasu gra sama robi <b>fold</b>.'},
 {s:'.rack',t:'Żetony',p:'Gdy masz ruch, klikaj żetony, żeby <b>dodawać je do stawki</b>. Każde kliknięcie dokłada nominał. Patrz, dokładam teraz 25 i 50.',demo:'chips'},
 {s:'.stake',t:'Kwota i Wyczyść',p:'Tu widzisz, ile chcesz postawić. Kwotę możesz też <b>wpisać ręcznie</b>. Jeśli zmienisz zdanie, <b>Wyczyść</b> zeruje stawkę.',demo:'clear'},
 {s:'.postaw',t:'Postaw',p:'Dopiero <b>POSTAW</b> zatwierdza ruch. Kwota równa sprawdzeniu to call, większa to podbicie, a cały stos to all-in. Jeśli kwota jest za mała, gra podpowie, ile trzeba.'},
 {s:'.big-acts',t:'Szybkie ruchy',p:'<b>FOLD</b> to pas i wypadasz z rozdania. <b>CHECK</b> to czekanie, gdy nikt nie postawił. <b>CALL</b> wyrównuje stawkę. <b>ALL-IN</b> stawia wszystkie Twoje żetony.'},
 {s:'.me-strip .money',pad:6,t:'Złotówki',p:'Twoje żetony przeliczone na złote (1000 żetonów = 100 zł) i bilans: <b style="color:var(--win)">zielony</b> na plusie, <b style="color:#ff8a80">czerwony</b> na minusie. To samo widać przy każdym graczu.'},
 {s:'#fab',pad:6,t:'Czat',p:'Zielony dymek otwiera czat jak w WhatsAppie, z emotkami, naklejkami i GIF-ami. Czat otwiera się obok stołu i nic nie zasłania.'},
 {s:'#btnLog',pad:6,t:'Historia',p:'Wszystkie ruchy, a po każdym rozdaniu <b>karty wszystkich graczy</b>. Każdy może sprawdzić, że karty były losowe.'},
 {s:'#blindsPill',pad:6,t:'Ciemne',p:'Obowiązkowe stawki na start rozdania: <b>mała i duża ciemna</b>. Płacą je dwaj gracze po lewej od rozdającego. Wysokość ciemnych zmienia właściciel stołu.'},
 {t:'Układy kart',p:'Od najsilniejszego do najsłabszego:'+RANKS_HTML},
 {t:'Gotowe!',p:'To wszystko. Samouczek możesz obejrzeć jeszcze raz w <b>Menu → Samouczek</b>. Powodzenia przy stole!',last:true}
];
function startTutorial(){
  try{localStorage.setItem('ns-tut','1')}catch(_){}
  $('tutInvite').hidden=true; $('menuBox').hidden=true;
  if(chatOpen) setChat(false);
  startDemo(); clearTimeout(demoTimer);
  tut={i:0,timers:[]};
  if(state&&state.hand){state=JSON.parse(JSON.stringify(state));state.hand.turnAt=Date.now()}
  $('demoBar').hidden=true; lastBarKey=''; render();
  const blk=document.createElement('div'); blk.className='tut-block'; blk.id='tutBlock';
  const spot=document.createElement('div'); spot.className='tut-spot'; spot.id='tutSpot';
  const tip=document.createElement('div'); tip.className='tut-tip'; tip.id='tutTip'; tip.setAttribute('role','dialog'); tip.setAttribute('aria-live','polite');
  document.body.append(blk,spot,tip);
  requestAnimationFrame(showStep);
}
function endTutorial(){
  if(!tut) return;
  tut.timers.forEach(clearTimeout); tut=null;
  ['tutBlock','tutSpot','tutTip'].forEach(id=>{const e=$(id);if(e)e.remove()});
  exitDemo();
}
function showStep(){
  if(!tut) return;
  tut.timers.forEach(clearTimeout); tut.timers=[];
  const st=TUT[tut.i], n=TUT.length;
  const tip=$('tutTip');
  tip.innerHTML=`<div class="tut-bar"><i style="width:${(tut.i+1)/n*100}%"></i></div>
    <div class="step">Krok ${tut.i+1} z ${n}</div><h3>${st.t}</h3><p>${st.p}</p>
    <div class="tut-nav">${st.last?'':'<button class="skip" type="button" data-tut="skip">Pomiń</button>'}
      ${tut.i>0?'<button class="btn" type="button" data-tut="back">Wstecz</button>':''}
      <button class="btn primary" type="button" data-tut="${st.last?'end':'next'}">${st.last?'Zagraj':'Dalej'}</button></div>`;
  if(st.demo==='chips'){betAmt=0;updateBetUI();[25,50].forEach((v,k)=>tut.timers.push(setTimeout(()=>{betAmt+=v;updateBetUI();SFX.chip(1);const b=document.querySelector(`.tok.d${v}`);if(b&&b.animate)b.animate([{transform:'scale(1)'},{transform:'scale(1.18) translateY(-4px)'},{transform:'scale(1)'}],{duration:350})},700+k*800)))}
  if(st.demo==='clear'){betAmt=75;updateBetUI();tut.timers.push(setTimeout(()=>{betAmt=0;const i=$('betInput');if(i)i.value='';updateBetUI()},1600))}
  placeStep();
  const f=tip.querySelector('[data-tut="next"],[data-tut="end"]'); if(f) f.focus({preventScroll:true});
}
function placeStep(){
  if(!tut) return;
  const st=TUT[tut.i], tip=$('tutTip'), spot=$('tutSpot'), blk=$('tutBlock');
  const el=st.s?document.querySelector(st.s):null;
  const vw=window.innerWidth, vh=window.innerHeight, tw=tip.offsetWidth, th=tip.offsetHeight;
  if(!el||!el.getClientRects().length){
    spot.hidden=true; blk.classList.add('dim');
    tip.style.left=Math.max(16,(vw-tw)/2)+'px'; tip.style.top=Math.max(16,(vh-th)/2)+'px'; return;
  }
  blk.classList.remove('dim'); spot.hidden=false;
  const r=el.getBoundingClientRect(), pad=st.pad??8;
  const L=Math.max(4,r.left-pad), T=Math.max(4,r.top-pad), W=Math.min(vw-8,r.width+pad*2), H=Math.min(vh-8,r.height+pad*2);
  Object.assign(spot.style,{left:L+'px',top:T+'px',width:W+'px',height:H+'px'});
  let top;
  if(T+H+12+th<=vh-12) top=T+H+12; else if(T-12-th>=12) top=T-12-th; else top=Math.max(12,vh-th-12);
  let left=r.left+r.width/2-tw/2; left=Math.max(16,Math.min(vw-tw-16,left));
  tip.style.left=left+'px'; tip.style.top=top+'px';
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-tut]'); if(!b||!tut) return;
  const a=b.dataset.tut;
  if(a==='next'){tut.i=Math.min(TUT.length-1,tut.i+1);showStep()}
  else if(a==='back'){tut.i=Math.max(0,tut.i-1);showStep()}
  else endTutorial();
});
document.addEventListener('keydown',e=>{if(!tut)return;if(e.key==='Escape')endTutorial();else if(e.key==='ArrowRight'){tut.i=Math.min(TUT.length-1,tut.i+1);showStep()}else if(e.key==='ArrowLeft'){tut.i=Math.max(0,tut.i-1);showStep()}});
window.addEventListener('resize',()=>{if(tut)requestAnimationFrame(placeStep)});
$('tutYes').onclick=startTutorial;
$('tutNo').onclick=()=>{try{localStorage.setItem('ns-tut','1')}catch(_){}$('tutInvite').hidden=true};
$('tutMenu').onclick=startTutorial;
$('ownerLoginBtn').onclick=async()=>{
  const pin=$('pinInput').value.trim(); if(!pin){toast('Wpisz PIN właściciela.');return}
  if(!KP){return}
  const ok=await KP.adminLogin(pin);
  if(ok){isOwner=true;$('pinInput').value='';setOwnerUI();render();toast('Jesteś zalogowany jako właściciel.')}else toast('Zły PIN.');
};
$('ownerLogout').onclick=()=>{KP&&KP.adminLogout();isOwner=false;setOwnerUI();render()};
$('demoExit').onclick=exitDemo;

function onServerState(st){
  lastRealState=st; if(demo) return;
  const prev=state?viewState():null; state=st;
  if(prev) {try{onStateChange(prev,viewState())}catch(_){}}
  render();
  if(st&&st.hand&&st.hand.st&&st.hand.st[me]&&(!myHole||myHole.hand_no!==st.hand.no)) loadMyCards(st.hand.no);
}
let cardsLoading=0;
async function loadMyCards(no){
  if(cardsLoading===no) return; cardsLoading=no;
  for(let i=0;i<5;i++){
    try{const c=await KP.myCards(); if(c&&c.hand_no===no){myHole=c;lastBarKey='';render();break}}catch(_){}
    await sleep(400*(i+1));
  }
  cardsLoading=0;
}
function onChat(list){
  const before=messages.length?messages[messages.length-1].at:0;
  lastRealMsgs=list; if(demo) return;
  messages=list;
  const newest=messages.length?messages[messages.length-1]:null;
  if(chatOpen){markSeen();renderChat()}
  else{updateBadge(); if(newest&&newest.at>before&&before&&newest.uid!==me){const f=$('fab');f.classList.remove('pop');void f.offsetWidth;f.classList.add('pop')}}
}
function startLive(){
  if(live) return; live=true;
  KP.subscribe({
    onState:onServerState,
    onChat,
    onPhotos:m=>{photos=m;if(state&&!demo)renderTable(viewState())},
    onGifs:l=>{gifLib=l;if(!$('picker').hidden&&pickerTab==='gif')renderPicker()},
    onStatus:okNow=>{if(!okNow)toast('Połączenie zerwane, łączę ponownie…')}
  });
  render();
}
function setOwnerUI(){
  $('ownerTools').hidden=!isOwner; $('ownerLogin').hidden=isOwner||demo; $('ownerLogout').hidden=!isOwner||demo;
}
async function boot(){
  try{const n=localStorage.getItem('ns-name');if(n){$('nameInput').value=n;$('photoPreview').textContent=initials(n)}}catch(_){}
  try{const c=localStorage.getItem('ns-code');if(c)$('codeInput').value=c}catch(_){}
  KP=await (window.KP_READY||Promise.resolve(null));
  if(!KP){render();toast('Nie udało się połączyć z serwerem gry. Sprawdź internet.');return}
  let uid;
  try{ uid=await KP.init(); serverOk=true; }
  catch(e){ console.error(e); toast('Nie udało się połączyć z serwerem gry.'); render(); return; }
  if(demo&&demoSaved) demoSaved.me=uid; else me=uid;
  const io=await KP.restoreAdmin().catch(()=>false);
  if(demo&&demoSaved) demoSaved.isOwner=io; else isOwner=io;
  setOwnerUI();
  isMember=await KP.isMember().catch(()=>false);
  if(isMember) startLive(); else render();
}
render();
if(location.hash==='#podglad') startDemo();
boot();
