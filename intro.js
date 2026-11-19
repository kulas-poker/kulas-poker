// KULAS POKER — start animation. Pure canvas, deterministic: draw(t) paints the frame at time t (seconds).
// K falls from the top into the left half of a big chip stack, P flies up from the bottom into the right half,
// the chips burst and land in two piles, the gold KP chip pops up and the cards fan out over it like a rainbow.
(function(){
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const easeOut=t=>1-Math.pow(1-t,3);
const easeIn=t=>t*t*t;
const easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const easeBack=t=>{const c1=1.9,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

const COLORS=[['#c8372d','#8e231c'],['#2563c9','#173f86'],['#22804d','#145431'],['#2a2a2a','#111'],['#d4a72c','#94701a']];
const T={kStart:1.75,kHit:2.15,pStart:2.05,pHit:2.45,chipIn:2.9,chipDone:3.35,fan0:3.45,word:4.75,shine:4.95,end:6.4};

function KPIntro(canvas){
  const main=canvas.getContext('2d');let ctx=main;
  const buf=document.createElement('canvas'), acc=document.createElement('canvas'), blo=document.createElement('canvas');
  const bctx=buf.getContext('2d'), actx=acc.getContext('2d'), blctx=blo.getContext('2d');
  // film grain tile and felt texture, made once
  const grain=document.createElement('canvas');grain.width=grain.height=256;{const g=grain.getContext('2d'),im=g.createImageData(256,256),r=rng(7);for(let i=0;i<im.data.length;i+=4){const v=r()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}g.putImageData(im,0,0)}
  const felt=document.createElement('canvas');felt.width=felt.height=256;{const g=felt.getContext('2d'),im=g.createImageData(256,256),r=rng(11);for(let i=0;i<im.data.length;i+=4){const v=r()*30;im.data[i]=12+v*0.3;im.data[i+1]=52+v*0.8;im.data[i+2]=32+v*0.5;im.data[i+3]=255}g.putImageData(im,0,0)}
  let feltPat=null;
  // slow motion around the hits: anim time runs at 30% speed there
  const SLOW=[];   // no slow motion: the letters fall at full speed
  const speed=a=>{let v=1;for(const [x0,x1] of SLOW){const e=0.05;const w=clamp((a-(x0-e))/e)*clamp(((x1+e)-a)/e);v=Math.min(v,lerp(1,0.3,w))}return v};
  const MAP=[];{let real=0;for(let a=0;a<=T.end+1;a+=0.002){MAP.push([real,a]);real+=0.002/speed(a)}}
  const REAL_END=MAP.find(m=>m[1]>=T.end)[0];
  function warp(tr){if(tr<=0)return 0;let lo=0,hi=MAP.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(MAP[m][0]<=tr)lo=m;else hi=m}const [r0,a0]=MAP[lo],[r1,a1]=MAP[hi];return a0+(a1-a0)*clamp((tr-r0)/((r1-r0)||1))}
  let W=0,H=0,dpr=1,L=null;
  function layout(){
    dpr=Math.min(window.devicePixelRatio||1,2);
    W=canvas.clientWidth;H=canvas.clientHeight;for(const c of [canvas,buf,acc]){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr)}blo.width=Math.round(W/4);blo.height=Math.round(H/4);feltPat=null;
    const s=Math.min(W/390,H/700,1.35);           // scale for bigger screens
    const cx=W/2, gy=H*0.5;
    const r0=18*s, th0=r0*0.24;                   // chips of the big heap
    const base=gy+95*s;                            // floor under the big heap
    const R=66*s;                                  // gold chip
    const rp=12*s, thp=rp*0.26;                    // small chips after the burst
    const pileY=gy+R*0.66;
    const heapX=[cx-R-50*s,cx+R+50*s];
    const rand=rng(612);
    // one big heap poured from above: wide bottom rows, narrower towards the top
    const rows=[11,10,10,9,8,8,7,6,5,5,4,3,2,1];
    const chips=[]; let n=0;
    rows.forEach((cnt,lvl)=>{const span=(cnt-1)*r0*1.12;
      for(let q=0;q<cnt;q++,n++){
        const x=cx+(cnt===1?0:lerp(-span/2,span/2,q/(cnt-1)))+(rand()-.5)*8*s;
        const y=base-lvl*r0*0.78+(rand()-.5)*4*s;
        chips.push({lvl0:lvl,col:COLORS[Math.floor(rand()*COLORS.length)],x,y,
          hlean:(rand()-.5)*0.8,htilt:0.34+rand()*0.25,
          drop:0.08+n*0.0145+rand()*0.05, fromX:x+(rand()-.5)*60*s,
          spin:(8+rand()*12)*(rand()<.5?-1:1),rot:(rand()-.5)*1.2,rotV:(rand()-.5)*9,dur:0.7+rand()*0.45});
      }});
    const topY=base-(rows.length-1)*r0*0.78;
    const kX=cx-14*s, pX=cx+16*s;
    // K smashes the upper part from the top, P bursts the rest from below; the further from the hit, the later a chip goes
    for(const k of chips){
      const fromK=k.lvl0>=5;
      k.c=k.x<cx?0:1;
      k.launch=fromK?T.kHit+Math.hypot(k.x-kX,k.y-topY)/1400:T.pHit+Math.hypot(k.x-pX,k.y-base)/1400;
      k.launch+=rand()*0.03;
    }
    // land order decides the slot in each scattered heap, so they grow from the bottom
    for(let c=0;c<2;c++){
      const mine=chips.filter(k=>k.c===c).sort((a,b)=>(a.launch+a.dur)-(b.launch+b.dur));
      let j=0,lvl=0;
      while(j<mine.length){const cnt=Math.max(1,9-lvl*2);
        for(let q=0;q<cnt&&j<mine.length;q++,j++){const k=mine[j];const span=(96-lvl*22)*s;
          k.tx=heapX[c]+(cnt===1?0:lerp(-span/2,span/2,q/(cnt-1)))+(rand()-.5)*12*s;
          k.ty=pileY-lvl*thp*1.2+(rand()-.5)*8*s;
          if(lvl===0&&rand()<0.3){k.tx+=(rand()-.5)*50*s;k.ty+=rand()*14*s}   // a few strays further out
          k.lean=(rand()-.5)*(lvl?0.8:0.4); k.tilt=0.34+rand()*(lvl?0.24:0.12); k.lvl=lvl; k.slot=j}
        lvl++;}
    }
    const sparks=[];
    for(let n=0;n<26;n++)sparks.push({c:n%2,a:rand()*TAU,v:(220+rand()*420)*s,l:0.3+rand()*0.35});
    const cards=['2','3','4','5','6','7','8','9','10','J','Q','K','A'].map((r,i,a)=>({r,s:'♥',ang:lerp(-80,80,i/(a.length-1))*Math.PI/180,i}));
    L={s,cx,gy,r0,th0,base,R,rp,thp,pileY,heapX,chips,sparks,cards,kX,pX,topY,
       kTo:{x:cx-R*0.15,y:gy+R*0.22},pTo:{x:cx+R*0.2,y:gy+R*0.24},
       kHitY:topY-r0*0.4, pHitY:base+th0+r0*0.4};
  }

  // ---------- painters ----------
  function chipFace(x,y,r,col,sy,rot,alpha=1){ // flat chip seen from an angle: squashed vertically by sy
    ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.rotate(rot);ctx.scale(1,Math.max(0.06,sy));
    ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fillStyle=col[0];ctx.fill();
    ctx.fillStyle='#f6efdc';
    for(let i=0;i<6;i++){const a=i*TAU/6;ctx.beginPath();ctx.arc(0,0,r,a-0.2,a+0.2);ctx.arc(0,0,r*0.74,a+0.2,a-0.2,true);ctx.closePath();ctx.fill()}
    ctx.beginPath();ctx.arc(0,0,r*0.62,0,TAU);ctx.fillStyle=col[1];ctx.fill();
    ctx.setLineDash([r*0.12,r*0.09]);ctx.lineWidth=r*0.05;ctx.strokeStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.arc(0,0,r*0.52,0,TAU);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.lineWidth=r*0.04;ctx.strokeStyle='rgba(0,0,0,.35)';ctx.stroke();
    const sh=ctx.createLinearGradient(-r,-r,r,r);sh.addColorStop(0,'rgba(255,255,255,.38)');sh.addColorStop(.45,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.3)');
    ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fillStyle=sh;ctx.fill();
    ctx.restore();
  }
  function chipStacked(x,y,r,col,th,lean=0,k=0.34){ // chip lying flat (or a bit crooked): side band with stripes + top face
    ctx.save();
    if(lean){ctx.translate(x,y);ctx.rotate(lean);ctx.translate(-x,-y)}
    ctx.beginPath();ctx.ellipse(x,y+th,r,r*k,0,0,Math.PI);ctx.lineTo(x-r,y);ctx.ellipse(x,y,r,r*k,0,Math.PI,0,true);ctx.closePath();
    ctx.fillStyle=col[1];ctx.fill();ctx.save();ctx.clip();
    ctx.fillStyle='#efe6cf';
    for(let i=0;i<6;i++){const a=(i+0.5)*Math.PI/6;const sx=x-Math.cos(a)*r, w=Math.max(1,r*0.2*Math.sin(a));if(i%2===0)ctx.fillRect(sx-w/2,y-2,w,th+r*k+4)}
    const g=ctx.createLinearGradient(x-r,0,x+r,0);g.addColorStop(0,'rgba(0,0,0,.35)');g.addColorStop(.45,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(0,0,0,.4)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,th+2*r);
    ctx.restore();
    chipFace(x,y,r,col,k,0);
    ctx.restore();
  }
  // graffiti letters: pointed tips, leaning right, glossy gold with a dark 3D edge
  const GLYPH={
    K:[[[6,-14],[33,2],[33,40],[80,-14],[67,22],[47,50],[90,114],[59,105],[33,68],[33,98],[-2,116],[6,95],[6,8]]],
    P:'P'};
  function glyphPath(ch){
    const p=new Path2D();
    if(ch==='K'){GLYPH.K[0].forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));p.closePath()}
    else{p.moveTo(6,-14);p.lineTo(54,-5);p.bezierCurveTo(100,2,98,60,50,60);p.lineTo(35,60);p.lineTo(35,98);p.lineTo(-2,116);p.lineTo(6,95);p.lineTo(6,8);p.closePath();
      p.moveTo(35,16);p.lineTo(50,16);p.bezierCurveTo(66,18,66,42,50,44);p.lineTo(35,44);p.closePath()}
    return p;
  }
  const GP={K:glyphPath('K'),P:glyphPath('P')};
  function letterG(ch,x,y,h,alpha=1,rot=0,scale=1,shine=-1){
    const u=h/100;
    ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.rotate(rot);ctx.scale(scale*u,scale*u);
    ctx.transform(1,0,-0.24,1,0,0);ctx.translate(-44,-50);   // lean to the right, centre the glyph
    const P=GP[ch];
    ctx.lineJoin='miter';ctx.miterLimit=12;
    // 3D extrusion
    for(let d=9;d>=1;d--){ctx.save();ctx.translate(d*0.55,d*0.7);ctx.fillStyle=d>6?'#1b1102':'#5a3a06';ctx.fill(P,'evenodd');ctx.restore()}
    ctx.lineWidth=9;ctx.strokeStyle='#1b1102';ctx.stroke(P);
    const g=ctx.createLinearGradient(0,-14,0,116);
    g.addColorStop(0,'#fffbe6');g.addColorStop(.18,'#ffe58a');g.addColorStop(.42,'#f2b92c');g.addColorStop(.5,'#c98a12');g.addColorStop(.62,'#f6c94a');g.addColorStop(.85,'#b47710');g.addColorStop(1,'#7a4c06');
    ctx.fillStyle=g;ctx.fill(P,'evenodd');
    ctx.save();ctx.clip(P,'evenodd');
    // wet gloss band over the top half
    ctx.beginPath();ctx.ellipse(40,10,70,30,-0.25,0,TAU);ctx.fillStyle='rgba(255,255,255,.5)';ctx.fill();
    ctx.beginPath();ctx.ellipse(30,-4,40,9,-0.25,0,TAU);ctx.fillStyle='rgba(255,255,255,.75)';ctx.fill();
    if(shine>=0&&shine<=1){const sx=lerp(-60,150,shine);const sg=ctx.createLinearGradient(sx-18,0,sx+18,0);sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(.5,'rgba(255,255,255,.95)');sg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=sg;ctx.fillRect(-40,-30,200,170)}
    ctx.restore();
    ctx.lineWidth=2;ctx.strokeStyle='rgba(255,250,220,.85)';ctx.stroke(P);
    ctx.restore();
  }
  function glint(x,y,r,a){ // four-point sparkle
    if(a<=0)return;ctx.save();ctx.globalAlpha=a;ctx.translate(x,y);ctx.fillStyle='#fffbe6';ctx.shadowColor='#ffe58a';ctx.shadowBlur=r;
    ctx.beginPath();for(let i=0;i<8;i++){const rr=i%2?r*0.18:r,an=i*Math.PI/4;ctx.lineTo(Math.cos(an)*rr,Math.sin(an)*rr)}ctx.closePath();ctx.fill();ctx.restore();
  }
  function goldText(txt,x,y,size,alpha=1,rot=0,scale=1){
    ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.rotate(rot);ctx.scale(scale,scale);
    ctx.font=`900 ${size}px Georgia,"Times New Roman",serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    const g=ctx.createLinearGradient(0,-size*0.5,0,size*0.5);g.addColorStop(0,'#fff4c2');g.addColorStop(.45,'#f0c445');g.addColorStop(.55,'#d9a425');g.addColorStop(1,'#8a5d0c');
    ctx.lineJoin='round';ctx.lineWidth=size*0.07;ctx.strokeStyle='#2b1d03';ctx.strokeText(txt,0,0);
    ctx.fillStyle=g;ctx.fillText(txt,0,0);
    ctx.restore();
  }
  function goldChip(x,y,R,rot,shineT){
    ctx.save();ctx.translate(x,y);ctx.rotate(rot);
    ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=R*0.35;ctx.shadowOffsetY=R*0.12;
    ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.fillStyle='#151515';ctx.fill();ctx.shadowColor='transparent';
    ctx.beginPath();ctx.arc(0,0,R*0.96,0,TAU);ctx.fillStyle='#d6a92e';ctx.fill();
    ctx.fillStyle='#faf1d6';
    for(let i=0;i<8;i++){const a=i*TAU/8;ctx.beginPath();ctx.arc(0,0,R*0.96,a-0.17,a+0.17);ctx.arc(0,0,R*0.79,a+0.17,a-0.17,true);ctx.closePath();ctx.fill()}
    ctx.beginPath();ctx.arc(0,0,R*0.78,0,TAU);ctx.fillStyle='#faf1d6';ctx.fill();
    ctx.beginPath();ctx.arc(0,0,R*0.75,0,TAU);ctx.fillStyle='#f6dd8e';ctx.fill();
    ctx.fillStyle='#ad7f17';
    for(let i=0;i<44;i++){const a=i*TAU/44;ctx.beginPath();ctx.moveTo(Math.cos(a-0.035)*R*0.74,Math.sin(a-0.035)*R*0.74);ctx.lineTo(Math.cos(a+0.035)*R*0.74,Math.sin(a+0.035)*R*0.74);ctx.lineTo(Math.cos(a+0.02)*R*0.58,Math.sin(a+0.02)*R*0.58);ctx.lineTo(Math.cos(a-0.02)*R*0.58,Math.sin(a-0.02)*R*0.58);ctx.closePath();ctx.fill()}
    const cg=ctx.createRadialGradient(-R*0.15,-R*0.2,R*0.05,0,0,R*0.56);cg.addColorStop(0,'#3a3a3a');cg.addColorStop(1,'#050505');
    ctx.beginPath();ctx.arc(0,0,R*0.56,0,TAU);ctx.fillStyle=cg;ctx.fill();
    ctx.lineWidth=R*0.025;ctx.strokeStyle='#f6dd8e';ctx.stroke();
    ctx.font=`${R*0.22}px system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#f0c445';ctx.fillText('♠',0,-R*0.38);
    if(shineT>0&&shineT<1){ // light sweep
      ctx.save();ctx.beginPath();ctx.arc(0,0,R*0.96,0,TAU);ctx.clip();ctx.rotate(-rot+0.6);
      const sx=lerp(-R*1.6,R*1.6,easeInOut(shineT));const g=ctx.createLinearGradient(sx-R*0.35,0,sx+R*0.35,0);
      g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=g;ctx.fillRect(-R*2,-R*2,R*4,R*4);ctx.restore();
    }
    ctx.restore();
  }
  function card(c,x,y,w,h,rot,alpha){
    ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.rotate(rot);
    ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=w*0.25;ctx.shadowOffsetY=w*0.06;
    ctx.beginPath();ctx.roundRect(-w/2,-h/2,w,h,w*0.1);ctx.fillStyle='#fbfaf5';ctx.fill();ctx.shadowColor='transparent';
    ctx.lineWidth=1;ctx.strokeStyle='#5b5b5b';ctx.stroke();
    const red=c.s==='♥'||c.s==='♦';ctx.fillStyle=red?'#d0302a':'#161616';ctx.textAlign='center';ctx.textBaseline='middle';
    const corner=()=>{ctx.font=`800 ${w*0.3}px Georgia,serif`;ctx.fillText(c.r,-w*0.31,-h*0.36);ctx.font=`${w*0.24}px system-ui,sans-serif`;ctx.fillText(c.s,-w*0.31,-h*0.17)};
    corner();ctx.save();ctx.rotate(Math.PI);corner();ctx.restore();
    ctx.font=`${w*0.56}px system-ui,sans-serif`;ctx.fillText(c.s,0,h*0.02);
    ctx.restore();
  }

  // ---------- one frame ----------
  function camera(t){ // zoom + focus point over (anim) time: close on the heap, punch at the hits, pull back for the reveal, slow push-in
    const {cx,gy,base}=L;
    let z=lerp(1.3,1.12,easeInOut(clamp(t/1.8))), fy=lerp(base-70*L.s,base-60*L.s,clamp(t/1.8));
    for(const h of [T.kHit,T.pHit]){const d=t-h;if(d>0)z+=Math.exp(-d*9)*Math.sin(Math.min(d*14,Math.PI))*0.06}
    const back=easeInOut(clamp((t-2.7)/0.8));z=lerp(z,1.0,back);fy=lerp(fy,gy+10*L.s,back);
    z*=1+0.06*easeInOut(clamp((t-3.6)/(T.end-3.6)));
    return {z,fx:cx,fy};
  }
  function renderScene(t){
    const {s,cx,gy,r0,th0,R,rp,thp,chips,sparks,cards}=L;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    // dark room; green felt lit by one lamp from above
    ctx.fillStyle='#070a09';ctx.fillRect(0,0,W,H);
    const cam=camera(t);
    let sh=0;for(const h of [T.kHit,T.pHit]){const d=t-h;if(d>=0&&d<0.35)sh+=(1-d/0.35)*6*s}
    const shx=sh?Math.sin(t*95)*sh:0, shy=sh?Math.cos(t*120)*sh*0.7:0;
    ctx.translate(W/2+shx,H/2+shy);ctx.scale(cam.z,cam.z);ctx.translate(-cam.fx,-cam.fy);
    if(!feltPat)feltPat=ctx.createPattern(felt,'repeat');
    ctx.save();ctx.fillStyle=feltPat;ctx.fillRect(-W,-H,W*3,H*3);
    const lamp=ctx.createRadialGradient(cx,gy+40*s,10*s,cx,gy+40*s,330*s);
    lamp.addColorStop(0,'rgba(255,236,190,.16)');lamp.addColorStop(.3,'rgba(0,0,0,0)');lamp.addColorStop(.62,'rgba(0,0,0,.62)');lamp.addColorStop(1,'rgba(0,0,0,.94)');
    ctx.fillStyle=lamp;ctx.fillRect(-W,-H,W*3,H*3);ctx.restore();
    // light beam with dust
    ctx.save();ctx.globalCompositeOperation='screen';ctx.filter=`blur(${10*s}px)`;
    const beam=ctx.createLinearGradient(0,-H*0.2,0,gy+120*s);beam.addColorStop(0,'rgba(255,230,170,.07)');beam.addColorStop(1,'rgba(255,230,170,0)');
    ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(cx-40*s,-H*0.3);ctx.lineTo(cx+40*s,-H*0.3);ctx.lineTo(cx+230*s,gy+140*s);ctx.lineTo(cx-230*s,gy+140*s);ctx.closePath();ctx.fill();ctx.filter='none';
    const dr=rng(3);for(let i=0;i<46;i++){const px=cx+(dr()-.5)*300*s+Math.sin(t*0.6+i)*8*s, py=(dr()*1.1-0.1)*(gy+120*s)+((t*12*s*(0.4+dr()))%40)-20*s;const a=0.25+0.35*Math.sin(t*1.3+i*2.1);if(a>0){ctx.fillStyle=`rgba(255,240,200,${a*0.5})`;ctx.beginPath();ctx.arc(px,py,(0.6+dr()*1.2)*s,0,TAU);ctx.fill()}}
    ctx.restore();

    // floor shadow under the big stack, fading as it bursts
    const stackA=clamp(1-(t-T.pHit)/0.3);
    if(stackA>0){ctx.save();ctx.globalAlpha=0.5*stackA*clamp(t/0.3);ctx.beginPath();ctx.ellipse(cx,L.base+th0+r0*0.4,r0*7.5,r0*1.3,0,0,TAU);ctx.fillStyle='rgba(0,0,0,.6)';ctx.filter='blur(6px)';ctx.fill();ctx.restore()}

    // landed chips in the two piles (bottom first)
    const landed=chips.filter(k=>t>=k.launch+k.dur).sort((a,b)=>a.lvl-b.lvl||a.ty-b.ty);
    for(let c=0;c<2;c++){const n=landed.filter(k=>k.c===c).length;if(n){ctx.save();ctx.globalAlpha=.4*Math.min(1,n/5);ctx.beginPath();ctx.ellipse(L.heapX[c],L.pileY+thp+rp*0.5,40*s,9*s,0,0,TAU);ctx.fillStyle='rgba(0,0,0,.6)';ctx.filter='blur(3px)';ctx.fill();ctx.restore()}}
    for(const k of landed){
      const d=t-(k.launch+k.dur), bounce=d<0.12?Math.sin(d/0.12*Math.PI)*2.5*s:0;
      chipStacked(k.tx,k.ty-bounce,rp,k.col,thp,k.lean,k.tilt);
    }

    // the big stack, built chip by chip, until each chip is hit
    // chips pour down from the top and settle into one big heap
    const standing=chips.filter(k=>t<k.launch&&t>=k.drop).sort((a,b)=>a.lvl0-b.lvl0||a.y-b.y);
    const falling=[];
    for(const k of standing){
      const FALL=0.5, p=(t-k.drop)/FALL;
      if(p<1){falling.push([k,p]);continue}
      const d=t-k.drop-FALL, bump=d<0.1?Math.sin(d/0.1*Math.PI)*2*s:0;
      chipStacked(k.x,k.y-bump,r0,k.col,th0,k.hlean,k.htilt);
    }
    for(const [k,p] of falling){
      const e=p*p, x=lerp(k.fromX,k.x,p), y=lerp(-40*s,k.y,e), settle=clamp((p-0.8)/0.2);
      chipFace(x,y,r0,k.col,lerp(Math.abs(Math.cos(k.spin*p*0.5))*0.9+0.1,k.htilt,settle),lerp(k.rot+k.rotV*p*0.4,k.hlean,settle));
    }

    // cards: fan out like a rainbow from left to right
    if(t>=T.fan0){
      for(const c of cards){
        const st=T.fan0, p=clamp((t-st)/(0.35+c.i*0.065));
        const a0=cards[0].ang, ang=lerp(a0,c.ang,easeOut(p));
        const grow=easeOut(clamp((t-st)/0.3)), rad=lerp(R*0.4,R+ (64*s),grow);
        const w=40*s,h=57*s, x=cx+Math.sin(ang)*rad, y=gy-Math.cos(ang)*rad;
        card(c,x,y,w,h,ang,grow);
      }
    }

    // chips flying after the hits (soft shadows on the felt first)
    ctx.save();ctx.fillStyle='rgba(0,0,0,.35)';
    for(const k of chips){ if(t<k.launch||t>=k.launch+k.dur)continue;
      const u=t-k.launch, D=k.dur, x=lerp(k.x,k.tx,u/D), fl=lerp(k.y,k.ty,u/D)+rp*0.4;
      ctx.globalAlpha=0.25+0.5*(u/D);ctx.beginPath();ctx.ellipse(x,fl,rp*1.1,rp*0.35,0,0,TAU);ctx.fill()}
    ctx.restore();
    for(const k of chips){
      if(t<k.launch||t>=k.launch+k.dur)continue;
      const u=t-k.launch, D=k.dur, g=2600*s;
      const sx=k.x, sy=k.y, vx=(k.tx-sx)/D, vy=(k.ty-sy-0.5*g*D*D)/D;
      const x=sx+vx*u, y=sy+vy*u+0.5*g*u*u;
      const q=u/D, settle=clamp((q-0.78)/0.22);
      const r=lerp(r0,rp,easeOut(q));
      const sy2=lerp(Math.abs(Math.cos(k.spin*u))*0.9+0.1,k.tilt,settle);
      chipFace(x,y,r,k.col,sy2,lerp(k.rot+k.rotV*u,k.lean,settle));
    }

    // sparks and flash at each hit
    for(const [hT,hx,hy,dir] of [[T.kHit,L.kX,L.kHitY,1],[T.pHit,L.pX,L.pHitY,-1]]){
      const d=t-hT; if(d<0||d>0.7)continue;
      ctx.save();
      const fa=clamp(1-d/0.22);if(fa>0){const fg=ctx.createRadialGradient(hx,hy,0,hx,hy,120*s);fg.addColorStop(0,`rgba(255,240,190,${0.85*fa})`);fg.addColorStop(1,'rgba(255,240,190,0)');ctx.fillStyle=fg;ctx.fillRect(hx-130*s,hy-130*s,260*s,260*s)}
      ctx.lineCap='round';
      for(const sp of sparks){ if(sp.c!==(dir>0?0:1))continue; if(d>sp.l)continue;
        const a=sp.a, dd=sp.v*d, x1=hx+Math.cos(a)*dd, y1=hy+Math.sin(a)*dd*0.8+600*s*d*d, tail=Math.min(dd,22*s);
        ctx.strokeStyle=`rgba(255,215,110,${1-d/sp.l})`;ctx.lineWidth=2.4*s;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x1-Math.cos(a)*tail,y1-Math.sin(a)*tail*0.8);ctx.stroke();}
      ctx.restore();
    }

    // gold KP chip
    if(t>=T.chipIn){
      const p=clamp((t-T.chipIn)/(T.chipDone-T.chipIn)), sc=easeBack(p);
      // glow ring when it lands
      const gp=clamp((t-T.chipDone+0.05)/0.5);if(gp>0&&gp<1){ctx.save();ctx.globalAlpha=(1-gp)*0.7;ctx.lineWidth=6*s*(1-gp);ctx.strokeStyle='#ffe28a';ctx.beginPath();ctx.arc(cx,gy,R*(1+gp*0.7),0,TAU);ctx.stroke();ctx.restore()}
      goldChip(cx,gy,R*sc,lerp(-2.2,0,easeOut(p)),clamp((t-T.shine)/0.7));
    }

    // the letters K (from the top) and P (from the bottom)
    const big=135*s, small=R*0.6;
    const letter=(ch,start,hit,hitY,hx,to,dir)=>{
      if(t<start)return;
      if(t<hit){ // incoming, speeding up, with a motion trail
        const p=easeIn((t-start)/(hit-start));
        const from=dir>0?-big:H+big, y=lerp(from,hitY-dir*big*0.42,p);
        for(let n=3;n>=1;n--)letterG(ch,hx,y-dir*n*big*0.16*p,big,0.12*(4-n)/3);
        letterG(ch,hx,y,big,1);
        return;
      }
      // after the hit: small rebound, then a flip and fly onto the gold chip
      const end=T.chipDone+0.05, p=clamp((t-hit)/(end-hit)), e=easeInOut(p);
      const x0=hx,y0=hitY-dir*big*0.42;
      const cxp=lerp(x0,to.x,0.5), cyp=Math.min(y0,to.y)-160*s;
      const x=(1-e)*(1-e)*x0+2*(1-e)*e*cxp+e*e*to.x, y=(1-e)*(1-e)*y0+2*(1-e)*e*cyp+e*e*to.y;
      const sc=lerp(1,small/big,e), rot=(1-e)*(dir>0?-1:1)*TAU*0.5*Math.sin(e*Math.PI)*0.6;
      letterG(ch,x,y,big,1,rot,sc,clamp((t-T.shine-(ch==='P'?0.12:0))/0.55));
      if(t>T.chipDone){const gt=(t-T.chipDone)%1.6; glint(ch==='K'?x-small*0.25:x+small*0.42,ch==='K'?y-small*0.55:y+small*0.55,9*s,gt<0.4?Math.sin(gt/0.4*Math.PI):0)}
    };
    letter('K',T.kStart,T.kHit,L.kHitY,L.kX,L.kTo,1);
    letter('P',T.pStart,T.pHit,L.pHitY,L.pX,L.pTo,-1);

    // wordmark
    if(t>=T.word){
      const p=easeOut(clamp((t-T.word)/0.5));
      ctx.save();ctx.globalAlpha=p;ctx.translate(0,(1-p)*18*s);
      ctx.font=`800 ${36*s}px Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.letterSpacing=`${6*s}px`;
      const yy=gy+R+82*s;
      const g=ctx.createLinearGradient(0,yy-16*s,0,yy+16*s);g.addColorStop(0,'#fff1b8');g.addColorStop(.5,'#e9b93a');g.addColorStop(1,'#a8740f');
      ctx.fillStyle=g;ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=8*s;ctx.fillText('KULAS POKER',cx,yy);
      ctx.restore();
    }
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  // anamorphic lens streak at the hits and when the gold chip lands
  function flares(t){
    const {cx,gy,s}=L, cam=camera(t), sx=x=>W/2+(x-cam.fx)*cam.z, sy=y=>H/2+(y-cam.fy)*cam.z;
    for(const [h,x,y,str] of [[T.kHit,L.kX,L.kHitY,1],[T.pHit,L.pX,L.pHitY,1],[T.chipDone,cx,gy,0.7],[T.shine+0.3,cx,gy,0.45]]){
      const d=t-h;if(d<-0.03||d>0.6)continue;const a=str*(d<0?1+d/0.03:Math.exp(-d*6));
      const X=sx(x),Y=sy(y);
      ctx.save();ctx.globalCompositeOperation='screen';
      const g=ctx.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(80,150,255,0)');g.addColorStop(clamp(X/W-0.25),`rgba(80,150,255,0)`);g.addColorStop(clamp(X/W),`rgba(200,225,255,${0.9*a})`);g.addColorStop(clamp(X/W+0.25),'rgba(80,150,255,0)');g.addColorStop(1,'rgba(80,150,255,0)');
      ctx.fillStyle=g;ctx.fillRect(0,Y-1.6*s,W,3.2*s);ctx.globalAlpha=a*0.5;ctx.fillRect(0,Y-6*s,W,12*s);
      const rg=ctx.createRadialGradient(X,Y,0,X,Y,90*s);rg.addColorStop(0,`rgba(255,240,200,${0.7*a})`);rg.addColorStop(1,'rgba(255,240,200,0)');ctx.globalAlpha=1;ctx.fillStyle=rg;ctx.fillRect(X-90*s,Y-90*s,180*s,180*s);
      ctx.restore();
    }
  }
  // tr = real time in seconds; mb = motion-blur samples (1 = off)
  const FILTER_OK=(()=>{try{const c=document.createElement('canvas');c.width=12;c.height=1;const g=c.getContext('2d');const d=document.createElement('canvas');d.width=12;d.height=1;d.getContext('2d').fillRect(6,0,1,1);g.filter='blur(2px)';g.drawImage(d,0,0);return g.getImageData(3,0,1,1).data[3]>0}catch(_){return false}})();
  function draw(tr,mb=1){
    if(!L||canvas.clientWidth!==W||canvas.clientHeight!==H)layout();
    const n=Math.max(1,mb|0), shutter=1/60;
    for(let i=0;i<n;i++){
      ctx=bctx;renderScene(warp(tr-shutter*i/n));
      actx.setTransform(1,0,0,1,0,0);actx.globalAlpha=1/(i+1);actx.drawImage(buf,0,0);
    }
    ctx=main;const t=warp(tr);
    main.setTransform(1,0,0,1,0,0);main.globalAlpha=1;main.globalCompositeOperation='source-over';main.drawImage(acc,0,0);
    // bloom: bright parts glow
    blctx.setTransform(1,0,0,1,0,0);if(FILTER_OK)blctx.filter='brightness(0.9) contrast(2.2) blur(3px)';blctx.clearRect(0,0,blo.width,blo.height);blctx.drawImage(acc,0,0,blo.width,blo.height);blctx.filter='none';
    main.save();main.globalCompositeOperation='screen';main.globalAlpha=FILTER_OK?0.45:0.2;main.imageSmoothingQuality='high';main.drawImage(blo,0,0,canvas.width,canvas.height);main.restore();
    main.setTransform(dpr,0,0,dpr,0,0);
    flares(t);
    // grade: warm highlights, teal shadows
    main.save();main.globalCompositeOperation='soft-light';const gr=main.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba(255,170,90,.35)');gr.addColorStop(.55,'rgba(255,200,140,.12)');gr.addColorStop(1,'rgba(20,110,130,.35)');main.fillStyle=gr;main.fillRect(0,0,W,H);main.restore();
    // vignette
    const vg=main.createRadialGradient(W/2,H*0.48,Math.min(W,H)*0.3,W/2,H*0.48,Math.max(W,H)*0.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.75)');main.fillStyle=vg;main.fillRect(0,0,W,H);
    // grain
    main.save();main.globalCompositeOperation='overlay';main.globalAlpha=0.1;const ox=Math.floor(tr*997)%256, oy=Math.floor(tr*631)%256;main.translate(-ox,-oy);main.fillStyle=main.createPattern(grain,'repeat');main.fillRect(0,0,W+256,H+256);main.restore();
    // fade in from black and out at the end
    const fin=clamp(tr/0.4), fout=clamp((REAL_END+0.6-tr)/0.6);main.fillStyle=`rgba(0,0,0,${1-Math.min(fin,fout)})`;main.fillRect(0,0,W,H);
  }
  return {draw,duration:REAL_END+0.6,layout};
}
window.KPIntro=KPIntro;
})();

// ---------- plays once each time the app opens; a tap skips it ----------
(function autoplay(){
  const q=new URLSearchParams(location.search);
  if(q.has('nointro')||(navigator.webdriver&&!q.has('intro')))return;   // automated tests skip it unless asked
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const ov=document.createElement('div');ov.id='intro';ov.setAttribute('aria-hidden','true');
  ov.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#000;touch-action:none;transition:opacity .45s';
  ov.innerHTML='<canvas style="display:block;width:100%;height:100%"></canvas><div style="position:absolute;left:0;right:0;bottom:calc(18px + env(safe-area-inset-bottom));text-align:center;color:rgba(255,255,255,.45);font:500 12px system-ui,sans-serif;letter-spacing:.08em">dotknij, aby pominąć</div>';
  (document.body||document.documentElement).appendChild(ov);
  const I=window.KPIntro(ov.firstChild);
  const mb=matchMedia('(pointer:fine)').matches?2:1;
  let t0=null,done=false,raf=0;
  const finish=()=>{if(done)return;done=true;cancelAnimationFrame(raf);ov.style.opacity='0';setTimeout(()=>ov.remove(),480);window.dispatchEvent(new Event('kp-intro-done'))};
  window.KP_INTRO={skip:finish,get playing(){return !done}};
  ov.addEventListener('pointerdown',finish);addEventListener('keydown',finish,{once:true});
  const frame=now=>{if(done)return;if(t0===null)t0=now;const t=(now-t0)/1000;
    try{I.draw(t,mb)}catch(e){console.error(e);finish();return}
    if(t>=I.duration)finish();else raf=requestAnimationFrame(frame)};
  raf=requestAnimationFrame(frame);
})();
