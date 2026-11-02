// KULAS POKER: game rules. Runs on the server (Supabase Edge Function) and in the offline preview.

const ZL_PER_CHIP=0.1, START=1000, UNIT=5, MAXP=9, SKIP_MS=120000, VERSION=2;
const DENOMS=[200,100,50,25,10,5];
const LEVELS=[[5,10],[10,20],[25,50],[50,100],[100,200],[200,400]];
const RANKS='23456789TJQKA', SUITS='shdc';
const CAT=['Wysoka karta','Para','Dwie pary','Trójka','Strit','Kolor','Full','Kareta','Poker'];
function freshDeck(){const d=[];for(const r of RANKS)for(const s of SUITS)d.push(r+s);return d}
// unbiased secure random integer in [0,n): rejection sampling removes modulo bias
function rnd(n){
  const a=new Uint32Array(1), lim=Math.floor(0x100000000/n)*n;
  do{crypto.getRandomValues(a)}while(a[0]>=lim);
  return a[0]%n;
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function rv(c){return RANKS.indexOf(c[0])+2}
function eval5(cs){
  const r=cs.map(rv).sort((a,b)=>b-a), flush=cs.every(c=>c[1]===cs[0][1]);
  let top=0; if(new Set(r).size===5){ if(r[0]-r[4]===4) top=r[0]; else if(r[0]===14&&r[1]===5) top=5; }
  const cnt={}; r.forEach(x=>cnt[x]=(cnt[x]||0)+1);
  const gr=Object.entries(cnt).map(([k,v])=>[+k,v]).sort((a,b)=>b[1]-a[1]||b[0]-a[0]);
  const g=gr.map(x=>x[0]), c=gr.map(x=>x[1]);
  let cat,tb;
  if(top&&flush){cat=8;tb=[top]} else if(c[0]===4){cat=7;tb=g} else if(c[0]===3&&c[1]===2){cat=6;tb=g}
  else if(flush){cat=5;tb=r} else if(top){cat=4;tb=[top]} else if(c[0]===3){cat=3;tb=g}
  else if(c[0]===2&&c[1]===2){cat=2;tb=g} else if(c[0]===2){cat=1;tb=g} else {cat=0;tb=r}
  let score=cat; for(let i=0;i<5;i++) score=score*15+(tb[i]||0);
  return {score,cat,top};
}
function best7(cards){
  let best=null; const n=cards.length;
  for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)for(let c=b+1;c<n;c++)for(let d=c+1;d<n;d++)for(let e=d+1;e<n;e++){
    const five=[cards[a],cards[b],cards[c],cards[d],cards[e]], r=eval5(five); if(!best||r.score>best.score){best=r;best.cards=five}
  }
  best.name = best.cat===8&&best.top===14 ? 'Poker królewski' : CAT[best.cat];
  return best;
}
function newState(){return {v:VERSION,sb:5,bb:10,players:[],hand:null,dealerId:null,handNo:0,log:[]}}
function migrate(s){
  if(!Array.isArray(s.players)) Object.assign(s,newState());
  if(s.v!==VERSION){ s.v=VERSION; s.sb=5; s.bb=10; s.hand=null; s.players.forEach(p=>p.chips=START); s.log=(s.log||[]).concat('Nowa gra: każdy ma 1000 żetonów.').slice(-40); }
}
function P(s,id){return s.players.find(p=>p.id===id)}
function nm(s,id){const p=P(s,id);return p?p.name.split(' ')[0]:'Gracz'}
function addLog(s,t){s.log=(s.log||[]).concat(t).slice(-80)}
function nextIn(list,fromId,order){const n=order.length,i=order.indexOf(fromId);for(let k=1;k<=n;k++){const id=order[((i+k)%n+n)%n];if(list.includes(id))return id}return null}
function commit(s,id,amt){const h=s.hand,p=P(s,id),st=h.st[id];amt=Math.max(0,Math.min(amt,p?p.chips:0));if(p)p.chips-=amt;st.bet+=amt;st.total+=amt;h.pot+=amt;if(p&&p.chips===0)st.allIn=true;return amt}
function handActive(s){return !!(s.hand&&!s.hand.result)}
function breakdown(a){const out=[];for(const d of DENOMS){const c=Math.floor(a/d);if(c){out.push([d,c]);a-=c*d}}return out}

function startHand(s,now){
  const elig=s.players.filter(p=>p.chips>0).map(p=>p.id);
  if(elig.length<2||handActive(s)) return false;
  const dealer=nextIn(elig,s.dealerId,s.players.map(p=>p.id));
  s.dealerId=dealer;
  const deck=shuffle(freshDeck()), order=elig, SB=s.sb||5, BB=s.bb||10;
  // only hole cards are dealt now; the rest of the deck is never stored
  const h={no:++s.handNo,order,dealer,hole:{},board:[],pot:0,stage:'preflop',st:{},sbAmt:SB,bbAmt:BB,currentBet:BB,minRaise:BB,toAct:null,turnAt:now,result:null,last:{}};
  order.forEach(id=>{h.hole[id]=[deck.pop(),deck.pop()];h.st[id]={bet:0,total:0,folded:false,allIn:false,acted:false}});
  s.hand=h;
  const sbId= order.length===2 ? dealer : nextIn(order,dealer,order);
  const bbId= nextIn(order,sbId,order);
  h.sbId=sbId; h.bbId=bbId;
  commit(s,sbId,SB); commit(s,bbId,BB);
  addLog(s,`— Rozdanie #${h.no}. Rozdaje ${nm(s,dealer)}, ciemne: ${nm(s,sbId)} ${SB}, ${nm(s,bbId)} ${BB}.`);
  proceed(s,bbId,now);
  return true;
}
// board cards are drawn at the moment they are revealed, from cards not yet dealt
function drawCard(h){
  const used=new Set(h.board.concat(...Object.values(h.hole)));
  const rem=freshDeck().filter(c=>!used.has(c));
  return rem[rnd(rem.length)];
}
function dealStreet(h){
  delete h.deck;
  if(h.stage==='preflop'){for(let i=0;i<3;i++)h.board.push(drawCard(h));h.stage='flop'}
  else if(h.stage==='flop'){h.board.push(drawCard(h));h.stage='turn'}
  else if(h.stage==='turn'){h.board.push(drawCard(h));h.stage='river'}
}
function cardTxt(c){return (c[0]==='T'?'10':c[0])+{s:'♠',h:'♥',d:'♦',c:'♣'}[c[1]]}
// stats rows: s.ranking = all time, s.game = since the last "Nowa gra"
function statRow(map,s,id){
  const r=map[id]||(map[id]={name:'',won:0,lost:0,hands:0,wins:0,best:0,rebuys:0});
  const p=P(s,id); if(p) r.name=p.name;
  return r;
}
function recordHand(s,h,winAmt){
  s.ranking=s.ranking||{}; s.game=s.game||{};
  h.order.forEach(id=>{
    const delta=(winAmt[id]||0)-h.st[id].total;
    [s.ranking,s.game].forEach(map=>{
      const r=statRow(map,s,id); r.hands++;
      if(delta>0) r.won+=delta; else r.lost+=-delta;
      if(winAmt[id]){r.wins++;r.best=Math.max(r.best,winAmt[id])}
    });
  });
}
function revealAll(s){
  const h=s.hand, won=new Set(h.result.winners.map(w=>w.id));
  addLog(s,'Karty: '+h.order.map(id=>`${nm(s,id)} ${h.hole[id].map(cardTxt).join(' ')}${h.st[id].folded?' (pas)':''}${won.has(id)?' ★':''}`).join(' · '));
  addLog(s,`Rozdanie #${h.no} · stół: ${h.board.length?h.board.map(cardTxt).join(' '):'(nie odkryto)'}`);
  // full summary of the last hand for the history panel
  const winAmt={}; h.result.winners.forEach(w=>winAmt[w.id]=(winAmt[w.id]||0)+w.amount);
  recordHand(s,h,winAmt);
  s.lastHand={no:h.no,board:h.board.slice(),showdown:!!h.result.showdown,best:h.result.best||{},
    players:h.order.map(id=>{
      let hand=h.result.hands&&h.result.hands[id]||null;
      if(!hand&&h.board.length===5) hand=best7(h.hole[id].concat(h.board)).name;
      return {id,name:(P(s,id)||{name:'Gracz'}).name,cards:h.hole[id].slice(),folded:!!h.st[id].folded,hand,won:winAmt[id]||0,bet:h.st[id].total};
    })};
}
function proceed(s,lastId,now){
  const h=s.hand, live=h.order.filter(id=>!h.st[id].folded);
  if(live.length===1){winAll(s,live[0]);return}
  const can=live.filter(id=>!h.st[id].allIn);
  const pending=can.filter(id=>!h.st[id].acted||h.st[id].bet<h.currentBet);
  const done = pending.length===0 || (can.length===1 && h.st[can[0]].bet>=h.currentBet);
  if(!done){h.toAct=nextIn(pending,lastId,h.order);h.turnAt=now;return}
  h.order.forEach(id=>{h.st[id].bet=0;h.st[id].acted=false});
  h.currentBet=0; h.minRaise=h.bbAmt; h.last={};
  if(h.stage==='river'){showdown(s);return}
  dealStreet(h);
  if(can.length<=1){while(h.stage!=='river')dealStreet(h);showdown(s);return}
  h.toAct=nextIn(can,h.dealer,h.order); h.turnAt=now;
}
function act(s,id,type,amount,now){
  const h=s.hand; if(!h||h.result||h.toAct!==id) return false;
  const st=h.st[id], p=P(s,id); if(!p) return false;
  const toCall=h.currentBet-st.bet; let label;
  if(type==='allin'){ type = st.bet+p.chips>h.currentBet ? 'raise' : 'call'; amount=st.bet+p.chips; }
  if(type==='fold'){st.folded=true;label='pas'}
  else if(type==='check'){if(toCall>0)return false;label='czeka'}
  else if(type==='call'){if(toCall<=0)return false;const a=commit(s,id,toCall);label=st.allIn?`all-in ${a}`:`sprawdza ${a}`}
  else if(type==='raise'){
    const max=st.bet+p.chips;
    let to=Math.min(Math.floor(amount),max);
    if(to<max) to=Math.floor(to/UNIT)*UNIT;
    if(to<=h.currentBet) return false;
    if(to<h.currentBet+h.minRaise && to<max) return false;
    const inc=to-h.currentBet; if(inc>=h.minRaise) h.minRaise=inc;
    const wasBet=h.currentBet===0;
    h.currentBet=to; commit(s,id,to-st.bet);
    h.order.forEach(o=>{if(o!==id&&!h.st[o].folded&&!h.st[o].allIn)h.st[o].acted=false});
    label=st.allIn?`all-in ${to}`:(wasBet?`stawia ${to}`:`podbija do ${to}`);
  } else return false;
  st.acted=true; h.last[id]=label; h.clock=now;
  addLog(s,`${nm(s,id)}: ${label}`);
  proceed(s,id,now);
  return true;
}
function winAll(s,id){
  const h=s.hand,p=P(s,id),amt=h.pot; if(p)p.chips+=amt;
  h.result={showdown:false,winners:[{id,amount:amt,hand:null}],at:h.clock||Date.now()}; h.stage='done'; h.toAct=null;
  addLog(s,`${nm(s,id)} zgarnia ${amt} (reszta spasowała).`);
  revealAll(s);
}
function showdown(s){
  const h=s.hand, live=h.order.filter(id=>!h.st[id].folded), sc={}, names={};
  const five={};
  live.forEach(id=>{const r=best7(h.hole[id].concat(h.board));sc[id]=r.score;names[id]=r.name;five[id]=r.cards});
  const n=h.order.length, di=h.order.indexOf(h.dealer);
  const pos=id=>((h.order.indexOf(id)-di-1)%n+n)%n;
  const levels=[...new Set(h.order.map(id=>h.st[id].total).filter(t=>t>0))].sort((a,b)=>a-b);
  let prev=0,carry=0; const won={};
  for(const L of levels){
    let amount=carry; h.order.forEach(id=>{const t=h.st[id].total;amount+=Math.max(0,Math.min(t,L)-prev)});
    prev=L; const elig=live.filter(id=>h.st[id].total>=L);
    if(!elig.length){carry=amount;continue} carry=0;
    const top=Math.max(...elig.map(id=>sc[id])); const ws=elig.filter(id=>sc[id]===top).sort((a,b)=>pos(a)-pos(b));
    const share=Math.floor(amount/ws.length/UNIT)*UNIT; let rem=amount-share*ws.length;
    ws.forEach(id=>{won[id]=(won[id]||0)+share});
    for(let i=0;rem>0;i=(i+1)%ws.length){const x=Math.min(UNIT,rem);won[ws[i]]+=x;rem-=x}
  }
  if(carry){const top=Math.max(...live.map(id=>sc[id]));const w=live.find(id=>sc[id]===top);won[w]=(won[w]||0)+carry}
  const winners=Object.entries(won).map(([id,amount])=>{const p=P(s,id);if(p)p.chips+=amount;return {id,amount,hand:names[id]}});
  const best={}; winners.forEach(w=>best[w.id]=five[w.id]);
  h.result={showdown:true,winners,hands:names,best,at:h.clock||Date.now()}; h.stage='showdown'; h.toAct=null;
  winners.forEach(w=>addLog(s,`${nm(s,w.id)} wygrywa ${w.amount} · ${w.hand}`));
  revealAll(s);
}
function foldOut(s,id,now){
  const h=s.hand; if(!handActive(s)||!h.st[id]||h.st[id].folded) return;
  if(h.toAct===id){act(s,id,'fold',0,now);return}
  h.clock=now; h.st[id].folded=true; h.st[id].acted=true; h.last[id]='pas'; addLog(s,`${nm(s,id)}: pas`);
  const live=h.order.filter(o=>!h.st[o].folded); if(live.length===1) winAll(s,live[0]);
}

// ---------- table actions (used by the server and by the offline preview) ----------
const HL_MS=5000;
function joinPlayer(s,id,name){
  name=String(name||'').trim().replace(/\s+/g,' ').slice(0,40);
  if(!name) return false;
  const p=P(s,id); if(p){p.name=name;return true}
  if(s.players.length>=MAXP) return false;
  s.players.push({id,name,chips:START,buyins:1}); addLog(s,`${name} siada przy stole.`);
  return true;
}
function leavePlayer(s,id,now){
  foldOut(s,id,now);
  const p=P(s,id); if(!p) return false;
  addLog(s,`${p.name.split(' ')[0]} wstaje od stołu.`);
  s.players=s.players.filter(x=>x.id!==id);
  return true;
}
function rebuy(s,id){
  const p=P(s,id); if(!p||p.chips>0) return false;
  if(handActive(s)&&s.hand.st[id]&&!s.hand.st[id].folded) return false;
  p.chips=START; p.buyins=(p.buyins||1)+1;
  s.ranking=s.ranking||{}; s.game=s.game||{};
  [s.ranking,s.game].forEach(m=>{const r=statRow(m,s,id); r.rebuys=(r.rebuys||0)+1});
  addLog(s,`${nm(s,id)} dokupuje ${START} żetonów (100 zł).`);
  return true;
}
function showCards(s,id){
  const h=s.hand; if(!h||!h.result||!h.st[id]) return false;
  h.shown=Object.assign({},h.shown,{[id]:true});
  addLog(s,`${nm(s,id)} pokazuje karty: ${h.hole[id].map(cardTxt).join(' ')}`);
  return true;
}
function dealHand(s,now){
  if(s.hand&&s.hand.result&&s.hand.result.at&&now-s.hand.result.at<HL_MS-500) return false;
  return startHand(s,now);
}
function timeoutFold(s,now){
  const h=s.hand; if(!handActive(s)||now-(h.turnAt||0)<SKIP_MS) return false;
  const id=h.toAct; addLog(s,`${nm(s,id)}: czas minął.`);
  return act(s,id,'fold',0,now);
}
function setBlinds(s,a,b){
  if(!LEVELS.some(([x,y])=>x===a&&y===b)) return false;
  if(s.sb===a&&s.bb===b) return false;
  s.sb=a; s.bb=b; addLog(s,`Ciemne od następnego rozdania: ${a}/${b}.`); return true;
}
function resetGame(s){
  s.players.forEach(p=>{p.chips=START;p.buyins=1}); s.game={}; s.hand=null; s.log=[];
  addLog(s,`Nowa gra. Wszyscy mają po ${START} żetonów.`); return true;
}
function resetRanking(s){ s.ranking={}; addLog(s,'Ranking wszechczasów został wyzerowany.'); return true; }

export {ZL_PER_CHIP,START,UNIT,MAXP,SKIP_MS,VERSION,DENOMS,LEVELS,RANKS,SUITS,CAT,HL_MS,
  freshDeck,rnd,shuffle,eval5,best7,newState,migrate,P,nm,addLog,nextIn,commit,handActive,breakdown,
  startHand,drawCard,dealStreet,cardTxt,statRow,recordHand,revealAll,proceed,act,winAll,showdown,foldOut,
  joinPlayer,leavePlayer,rebuy,showCards,dealHand,timeoutFold,setBlinds,resetGame,resetRanking};
