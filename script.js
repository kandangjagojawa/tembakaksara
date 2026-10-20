/* === PASTE/TEMPELKAN SISA KODE DARI SINI SAMPAI BAWAH === */
var hf={h:"ꦲ",n:"ꦤ",c:"ꦕ",r:"ꦫ",k:"ꦏ",d:"ꦢ",t:"ꦠ",s:"ꦱ",w:"ꦮ",l:"ꦭ",p:"ꦥ",dh:"ꦝ",j:"ꦗ",y:"ꦪ",m:"ꦩ",g:"ꦒ",b:"ꦧ",th:"ꦛ",ng:"ꦔ",ny:"ꦚ"},lm={"rê":"ꦉ","lê":"ꦊ"},um={a:"",i:"ꦶ",u:"ꦸ","ê":"ꦼ","é":"ꦺ","è":"ꦺ",o:"ꦺꦴ"},om={"":"",ng:"ꦁ",r:"ꦂ",h:"ꦃ"},yi={a:"A",i:"I",u:"U","ê":"Ê","é":"É","è":"È",o:"O"};
function yf(e,n,t){let r=lm[e]??hf[e]??"ꦏ",l=um[n]??"",u=om[t]??"";return r+l+u}
function vf(e,n,t){let r;if(e==="rê")r="RÊ";else if(e==="lê")r="LÊ";else r=e.toUpperCase();if(e==="rê"||e==="lê"){if(n==="a"||n==="ê")return r+(t?yi[t]??t.toUpperCase():"").replace("NG","").replace("R","").replace("H","")+(t?t==="ng"?"NG":t==="r"?"R":t==="h"?"H":"":"");let o=n==="a"?"":yi[n]??n.toUpperCase(),i=t?t==="ng"?"NG":t==="r"?"R":t==="h"?"H":t.toUpperCase():"";if(n==="ê")return r+i;return r+o+i}let l=yi[n]??n.toUpperCase(),u=t?t==="ng"?"NG":t==="r"?"R":t==="h"?"H":"":"";return r+l+u}
function gf(e){let n=[],t=[],r=Object.keys(hf);if(e===1)n=["a","i","u"],t=[""];else if(e===2)n=["a","i","u","ê","é","o"],t=[""];else if(e===3)n=["a","i","u","ê","é","è","o"],t=["","ng","r","h"];else n=["a","i","u","ê","é","è","o"],t=["","ng","r","h"],r=[...r,"rê","lê"];return{vowels:n,suffixes:t,cons:r}}
function Nn(e){return e[Math.floor(Math.random()*e.length)]}
function Wl(e){let n=[...e];for(let t=n.length-1;t>0;t--){let r=Math.floor(Math.random()*(t+1)),l=n[t];n[t]=n[r],n[r]=l}return n}
function vi(){let n=[11,31,50,69,89].map((t)=>{let r=(Math.random()-0.5)*10,l=t+r;return Math.max(7,Math.min(93,l))});return Wl(n)}
function mf(){return 10+Math.random()*80}
function Cn(e,n){let t=gf(e),r=n??Nn(t.cons),l=Nn(t.vowels),u=Nn(t.suffixes),o=yf(r,l,u),i=vf(r,l,u);return{id:Math.random().toString(36).slice(2,8),cons:r,vowel:l,suffix:u,jawa:o,latin:i}}
function St(e,n){let t=gf(n),r=[{...e,isCorrect:!0,x:0}],l=0;while(r.length<5&&l<100){l++;let i,s,c;if(Math.random()<0.7)i=e.cons,s=Nn(t.vowels),c=Nn(t.suffixes);else i=Nn(t.cons.filter((p)=>p!==e.cons)),s=Nn(t.vowels),c=Nn(t.suffixes);let m=yf(i,s,c);if(m===e.jawa)continue;if(r.some((p)=>p.jawa===m))continue;let h=vf(i,s,c);r.push({id:Math.random().toString(36).slice(2,8),cons:i,vowel:s,suffix:c,jawa:m,latin:h,isCorrect:!1,x:0})}let u=Wl(r),o=vi();return u.map((i,s)=>({...i,x:o[s]}))}
function gi(){let[e,n]=M.useState(1),[t,r]=M.useState(0),[l,u]=M.useState(3),[o,i]=M.useState("jatuh"),[s,c]=M.useState(()=>Cn(1)),[m,h]=M.useState(()=>St(Cn(1),1)),[p,w]=M.useState(50),[S,k]=M.useState([]),[O,f]=M.useState(!1),[a,d]=M.useState(!1),[v,C]=M.useState({}),[z,P]=M.useState(null),[T,K]=M.useState(!1),[I,ce]=M.useState(!1),kt=M.useRef(null),wi=M.useRef(m),kf=M.useRef([]),Ql=M.useRef(0),Kl=M.useRef(!1);M.useEffect(()=>{wi.current=m},[m]),M.useEffect(()=>{kf.current=S},[S]),M.useEffect(()=>{let _=Cn(e);c(_),h(St(_,e))},[]);let Si=M.useRef(()=>{}),ki=M.useRef(()=>{}),Ei=M.useCallback((_)=>{r((L)=>{let R=L+10;if(R>=50&&e===1)n(2);else if(R>=120&&e===2)n(3);else if(R>=220&&e===3)n(4);return R}),P({x:_.x,y:22,text:"+10"}),setTimeout(()=>P(null),600),ce(!0),h((L)=>L.map((R)=>R.id===_.id?{...R,falling:!0}:{...R,shuffling:!0})),setTimeout(()=>{let L=e+(t>50?1:0)>4?4:e,R=Cn(L);if(c(R),o==="ganti"){let nn=St(R,L),ye=Wl(nn),Ue=vi(),Qe=ye.map((Pi,Yl)=>({...Pi,x:Ue[Yl],falling:!1}));h(Qe)}else h((nn)=>{let Ue=nn.filter((Te)=>Te.id!==_.id&&!Te.falling).filter((Te)=>Te.jawa!==R.jawa),Qe=[];
        let _loopLimit=0; // SOLUSI 2: Batas infinite loop agar thread tidak beku 
        while(Ue.length+Qe.length<4 && _loopLimit<100){
          _loopLimit++;
          let Te=Cn(L);if(Te.jawa===R.jawa)continue;if(Ue.some((Et)=>Et.jawa===Te.jawa))continue;if(Qe.some((Et)=>Et.jawa===Te.jawa))continue;Qe.push({...Te,isCorrect:!1,x:0})}let Yl=[...[...Ue,...Qe].slice(0,4),{...R,isCorrect:!0,x:0}],zf=Wl(Yl),Pf=vi();return zf.map((Te,Et)=>({...Te,x:Pf[Et],falling:!1}))});w(mf()),setTimeout(()=>{ce(!1),h((nn)=>nn.map((ye)=>({...ye,shuffling:!1})))},380)},300)},[e,o,t]),_i=M.useCallback((_)=>{h((L)=>L.map((R)=>R.id===_.id?{...R,shaking:!0}:R)),setTimeout(()=>h((L)=>L.map((R)=>({...R,shaking:!1}))),400),r((L)=>Math.max(0,L-5)),u((L)=>{let R=L-1;if(R<=0)f(!0);return R}),C((L)=>{let R=s.latin+" → "+s.jawa;return{...L,[R]:(L[R]??0)+1}}),P({x:_.x,y:26,text:"-5"}),setTimeout(()=>P(null),600)},[s]);M.useEffect(()=>{Si.current=Ei,ki.current=_i},[Ei,_i]),M.useEffect(()=>{let _=()=>{k((L)=>{
        if(L.length===0)return L; // SOLUSI 1: Cegah React re-render 60fps tanpa alasan yang memicu GC Thrashing
        let R=L.map((ye)=>({...ye,y:ye.y+3.4})),nn=[];for(let ye of R){if(ye.y>82){let Ue=wi.current.find((Qe)=>!Qe.falling&&Math.abs(Qe.x-ye.x)<11);if(Ue){if(Ue.isCorrect)Si.current(Ue);else ki.current(Ue);continue}if(ye.y>96)continue}if(ye.y<=96)nn.push(ye)}return nn}),Ql.current=requestAnimationFrame(_)};return Ql.current=requestAnimationFrame(_),()=>cancelAnimationFrame(Ql.current)},[]);let Sr=M.useCallback(()=>{if(O)return;let _=Math.random().toString(36).slice(2,8);K(!0),setTimeout(()=>K(!1),180),k((L)=>[...L,{id:_,x:p,y:26}])},[p,O]);M.useEffect(()=>{let _=(L)=>{if(L.code==="Space")L.preventDefault(),Sr();if(L.code==="ArrowLeft")w((R)=>Math.max(5,R-6));if(L.code==="ArrowRight")w((R)=>Math.min(95,R+6))};return window.addEventListener("keydown",_),()=>window.removeEventListener("keydown",_)},[Sr]);let Ef=(_)=>{Kl.current=!0,_.target.setPointerCapture(_.pointerId),Ni(_.clientX)},_f=(_)=>{if(!Kl.current)return;Ni(_.clientX)},Ci=(_)=>{Kl.current=!1},Ni=(_)=>{if(!kt.current)return;let L=kt.current.getBoundingClientRect(),R=(_-L.left)/L.width*100;w(Math.max(6,Math.min(94,R)))},Cf=()=>{let _=Cn(e);c(_),h(St(_,e)),w(mf()),ce(!0),setTimeout(()=>ce(!1),350)},Nf=()=>{r(0),u(3),n(1),f(!1),C({});let _=Cn(1);c(_),h(St(_,1)),k([]),w(50),ce(!1)},zi=Object.entries(v).sort((_,L)=>L[1]-_[1]).slice(0,6);return N("div",{className:"app-root",children:[g("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Javanese&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin:0; }
        .app-root {
          min-height: 100vh;
          background:
            radial-gradient(1200px 600px at 20% -10%, #fff7e6 0%, transparent 60%),
            radial-gradient(900px 500px at 90% 0%, #ffe0b2 0%, transparent 50%),
            linear-gradient(180deg, #fdf6e3 0%, #efebe9 55%, #d7ccc8 100%);
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          color: #3e2723;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .batik {
          position: absolute; inset:0;
          opacity:0.07;
          background-image:
            repeating-linear-gradient(45deg, #5d4037 0 1px, transparent 1px 12px),
            repeating-linear-gradient(-45deg, #8d6e63 0 1px, transparent 1px 18px);
          pointer-events:none;
        }
        .header {
          width:100%; max-width:1100px;
          display:flex; justify-content:space-between; align-items:center;
          padding: 14px 18px;
          background: #3e2723;
          color:#ffecb3;
          position: sticky; top:0; z-index:10;
          box-shadow: 0 4px 18px rgba(62,39,35,0.3);
        }
        .brand { display:flex; flex-direction:column; line-height:1.1 }
        .brand .latin { font-weight:800; letter-spacing:0.04em; font-size: 16px; }
        .brand .jawa { font-family:'Noto Sans Javanese', serif; font-size:20px; color:#ffcc80; margin-top:2px }
        .stats { display:flex; gap:12px; align-items:center }
        .stat-pill { background:#4e342e; border:1px solid #6d4c41; padding:6px 12px; border-radius:999px; font-size:13px; display:flex; gap:6px; align-items:center }
        .hearts { letter-spacing:2px }
        .game-shell { width:100%; max-width:1100px; display:grid; grid-template-columns: 1fr 300px; gap:16px; padding:16px; }
        @media (max-width: 860px) { .game-shell { grid-template-columns:1fr; } }
        .game-area {
          position:relative;
          height: 600px;
          background: linear-gradient(180deg, #fff8e1 0%, #ffe0b2 32%, #f5d0a0 62%, #d7a76f 100%);
          border-radius: 18px;
          overflow:hidden;
          border: 3px solid #5d4037;
          box-shadow: inset 0 0 0 4px #ffecb3, 0 12px 30px rgba(62,39,35,0.18);
          display:flex; flex-direction:column;
        }
        @media (max-width: 600px) { .game-area { height: 620px; } }
        .field-top {
          position:relative;
          flex:1;
          min-height: 360px;
        }
        .target-row {
          position:absolute; top:18px; left:0; right:0; height:110px;
        }
        .target-box {
          position:absolute; top:0;
          width: 84px; height: 92px;
          transform: translateX(-50%);
          background: linear-gradient(180deg, #fff3e0 0%, #ffcc80 100%);
          border: 3px solid #5d4037;
          border-radius: 14px;
          box-shadow: 0 6px 0 #3e2723, 0 10px 18px rgba(0,0,0,0.18);
          display:flex; align-items:center; justify-content:center;
          font-family:'Noto Sans Javanese', serif;
          font-size: 38px;
          color:#3e2723;
          transition: left 0.45s cubic-bezier(.2,.8,.2,1), transform 0.28s cubic-bezier(.2,.8,.2,1), opacity 0.28s;
          animation: float 3s ease-in-out infinite;
          will-change: left, transform;
        }
        .target-box.falling { transform: translateX(-50%) translateY(380px) rotate(22deg) scale(0.7); opacity:0; }
        .target-box.shaking { animation: shake 0.36s ease; }
        .target-box.shuffling {
          transition: left 0.42s cubic-bezier(.34,1.56,.64,1), transform 0.32s ease;
          z-index: 2;
          animation: shufflePop 0.42s ease;
        }
        @keyframes shufflePop {
          0% { transform: translateX(-50%) scale(1); }
          40% { transform: translateX(-50%) scale(1.08) translateY(-8px); }
          100% { transform: translateX(-50%) scale(1); }
        }
        @keyframes float { 0%,100%{ transform:translateX(-50%) translateY(0)} 50%{ transform:translateX(-50%) translateY(-6px)} }
        @keyframes shake { 0%,100%{ transform:translateX(-50%) } 20%{ transform:translateX(calc(-50% - 8px)) } 40%{ transform:translateX(calc(-50% + 8px)) } 60%{ transform:translateX(calc(-50% - 6px)) } 80%{ transform:translateX(calc(-50% + 6px)) } }
        .shuffle-indicator {
          position:absolute; top:108px; left:50%; transform:translateX(-50%);
          background:#3e2723; color:#ffecb3; font-size:10px; font-weight:800; letter-spacing:0.08em;
          padding:4px 10px; border-radius:999px; border:1px solid #ffcc80;
          opacity:0; pointer-events:none; transition: opacity 0.2s;
        }
        .shuffle-indicator.show { opacity:1; animation: pulse 0.9s ease infinite; }
        @keyframes pulse { 0%,100%{ transform:translateX(-50%) scale(1)} 50%{ transform:translateX(-50%) scale(1.05)} }
        /* ===== CETBANG CANNON - BIG FOCUS ===== */
        .cannon-stage {
          position: relative;
          height: 168px;
          width: 100%;
          z-index: 5;
          pointer-events:none;
        }
        .rail {
          position:absolute; left:2%; right:2%; bottom:22px; height:28px;
          background:
            linear-gradient(90deg, rgba(0,0,0,0.15) 0 2px, transparent 2px 18px),
            linear-gradient(180deg, #8d6e63 0%, #5d4037 55%, #3e2723 100%);
          border: 2px solid #3e2723;
          border-radius: 8px;
          box-shadow: inset 0 2px 0 rgba(255,255,255,0.25), 0 4px 0 #271c19;
          display:flex; align-items:center; justify-content:space-between;
          padding: 0 6px;
        }
        .rail-tick { width:3px; height:10px; background:#271c19; opacity:0.6; border-radius:2px }
        .rail-tick.big { height:16px; width:3px; background:#ffecb3; opacity:1 }
        .cannon-wrap {
          position:absolute; bottom:28px;
          width: 220px;
          height: 150px;
          transform: translateX(-50%);
          display:flex; flex-direction:column; align-items:center; justify-content:flex-end;
          transition: left 0.12s cubic-bezier(.2,.8,.2,1);
          z-index:6;
          pointer-events:none;
          filter: drop-shadow(0 12px 10px rgba(0,0,0,0.25));
        }
        .cannon-wrap.recoil { animation: recoil 0.18s ease; }
        .cannon-wrap.jump { transition: left 0.38s cubic-bezier(.34,1.56,.64,1); }
        @keyframes recoil { 0%{ transform:translateX(-50%) translateY(0) rotate(0)} 35%{ transform:translateX(-50%) translateY(6px) rotate(-1.2deg)} 100%{ transform:translateX(-50%) translateY(0) rotate(0)} }
        .cannon-shadow {
          position:absolute; bottom:14px; left:50%; transform:translateX(-50%);
          width:120px; height:18px; background: radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, transparent 70%);
          z-index:0; border-radius:50%;
        }
        .laser {
          position:absolute; bottom:130px; width:2px; top:90px;
          transform: translateX(-50%);
          background: repeating-linear-gradient(180deg, rgba(255,235,59,0.9) 0 10px, transparent 10px 18px);
          box-shadow: 0 0 8px rgba(255,235,59,0.8), 0 0 18px rgba(255,111,0,0.6);
          z-index:4; pointer-events:none;
          transition: left 0.12s cubic-bezier(.2,.8,.2,1);
        }
        .laser::after {
          content:""; position:absolute; top:-10px; left:50%; transform:translateX(-50%);
          width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-bottom:10px solid #ffeb3b;
          filter: drop-shadow(0 0 6px #ffeb3b);
        }
        .position-arrow {
          position:absolute; bottom:50px; width:0; height:0;
          border-left:10px solid transparent; border-right:10px solid transparent; border-bottom:12px solid #ff6f00;
          transform: translateX(-50%);
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.4));
          transition: left 0.12s cubic-bezier(.2,.8,.2,1);
          z-index:7;
        }
        .cannon-visual {
          position:relative; width:100%; height:116px; display:flex; flex-direction:column; align-items:center;
        }
        .cannon-mouth {
          width: 54px; height: 30px;
          background: radial-gradient(ellipse at center, #1a1a1a 0%, #000 65%);
          border: 3px solid #2b1a14;
          border-bottom:0;
          border-radius: 12px 12px 4px 4px;
          box-shadow: inset 0 4px 8px rgba(255,255,255,0.15), 0 -2px 0 #ffcc80;
          z-index:3;
          position:relative;
        }
        .cannon-mouth::after {
          content:""; position:absolute; inset:5px;
          background: radial-gradient(ellipse at center, #3e2723 0%, #000 80%);
          border-radius: 8px 8px 2px 2px;
        }
        .muzzle-flash {
          position:absolute; top:-12px; left:50%; transform:translateX(-50%);
          width: 42px; height: 26px;
          background: radial-gradient(ellipse at center, #fffde7 0%, #ffeb3b 30%, #ff6f00 60%, transparent 75%);
          border-radius:50%;
          opacity:0;
          pointer-events:none;
        }
        .cannon-wrap.recoil .muzzle-flash { animation: flash 0.18s ease; }
        @keyframes flash { 0%{ opacity:0; transform:translateX(-50%) scale(0.3)} 30%{ opacity:1; transform:translateX(-50%) scale(1.3)} 100%{ opacity:0; transform:translateX(-50%) scale(1.8)} }
        .cannon-body {
          width: 188px; height: 82px; margin-top:-6px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 18%),
            linear-gradient(180deg, #6d4c41 0%, #4e342e 22%, #3e2723 55%, #271c19 100%);
          border: 4px solid #1c110f;
          border-radius: 22px;
          box-shadow: inset 0 3px 0 rgba(255,255,255,0.22), inset 0 -6px 10px rgba(0,0,0,0.45), 0 8px 0 #1c110f;
          display:flex; align-items:center; justify-content:center;
          position:relative;
          z-index:2;
        }
        .cannon-body::before {
          content:""; position:absolute; left:8px; top:14px; bottom:14px; width:14px;
          background: linear-gradient(180deg, #8d6e63, #4e342e);
          border-radius: 6px; border:1px solid #271c19; box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .cannon-body::after {
          content:""; position:absolute; right:8px; top:14px; bottom:14px; width:14px;
          background: linear-gradient(180deg, #8d6e63, #4e342e);
          border-radius: 6px; border:1px solid #271c19; box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .plaque {
          background: #fffdf5;
          border: 4px solid #1c110f;
          border-radius: 14px;
          padding: 10px 18px 12px;
          min-width: 116px;
          text-align:center;
          box-shadow: 0 3px 0 #1c110f, inset 0 1px 0 #fff, 0 6px 12px rgba(0,0,0,0.18);
          position:relative;
          z-index:3;
          transform: rotate(-1.2deg);
        }
        .plaque-latin {
          font-weight:900; font-size:30px; line-height:1; letter-spacing:0.07em;
          color:#1a1a1a;
          text-shadow: 0 1px 0 #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .cannon-wheels {
          display:flex; gap:78px; margin-top:-12px; z-index:1;
        }
        .wheel {
          width:38px; height:38px; border-radius:50%;
          background: radial-gradient(circle at 30% 30%, #a1887f, #5d4037 55%, #3e2723);
          border:3px solid #1c110f;
          box-shadow: 0 4px 0 #1c110f, inset 0 2px 0 rgba(255,255,255,0.2);
          display:flex; align-items:center; justify-content:center;
          position:relative;
        }
        .wheel::before { content:""; width:10px; height:10px; background:#ffecb3; border:2px solid #1c110f; border-radius:50%; }
        .wheel::after {
          content:""; position:absolute; inset:5px; border:2px dashed rgba(0,0,0,0.25); border-radius:50%;
        }
        .projectile {
          position:absolute;
          width:26px; height:26px;
          transform: translateX(-50%);
          background: radial-gradient(circle at 30% 30%, #fff8e1, #ffb300 55%, #ff6f00);
          border:2px solid #1c110f;
          border-radius:50%;
          box-shadow: 0 0 14px rgba(255,179,0,0.9), 0 0 26px rgba(255,111,0,0.6);
          display:flex; align-items:center; justify-content:center;
          font-size:10px; font-weight:800; color:#3e2723;
          z-index:6;
        }
        .hit-effect {
          position:absolute; transform:translateX(-50%);
          font-weight:800; font-size:20px; color:#bf360c;
          text-shadow: 0 1px 0 #fff;
          animation: pop 0.6s ease forwards;
          pointer-events:none;
          z-index:8;
        }
        @keyframes pop { 0%{ transform:translateX(-50%) translateY(0) scale(0.6); opacity:0 } 20%{ opacity:1; transform:translateX(-50%) translateY(-8px) scale(1.2)} 100%{ opacity:0; transform:translateX(-50%) translateY(-36px) scale(1)} }
        .controls {
          display:grid; grid-template-columns: 1.3fr 0.9fr; gap:12px; padding:12px 12px 14px;
          background: linear-gradient(180deg, #fff8e1 0%, #ffecb3 100%);
          border-top:3px solid #5d4037;
          z-index:10;
          border-radius: 0 0 15px 15px;
        }
        @media (max-width: 600px) { .controls { grid-template-columns:1fr; } }
        .control-box {
          border:2px dashed #a1887f; border-radius:14px; padding:10px;
          background: #ffffffb8; backdrop-filter: blur(4px);
          touch-action:none; user-select:none;
        }
        .control-label { font-size:11px; font-weight:800; letter-spacing:0.08em; color:#6d4c41; margin-bottom:6px; display:flex; justify-content:space-between }
        .slider-track {
          height:52px; background: linear-gradient(90deg, #efebe9, #d7ccc8); border:2px solid #8d6e63; border-radius:999px;
          position:relative; overflow:hidden; cursor: ew-resize; touch-action:none;
        }
        .slider-fill { position:absolute; left:0; top:0; bottom:0; background: linear-gradient(90deg, rgba(255,179,0,0.25), rgba(255,111,0,0.15)); border-right:2px solid #ff6f00; }
        .slider-thumb {
          position:absolute; top:50%; width:52px; height:42px; transform:translate(-50%,-50%);
          background: linear-gradient(180deg, #5d4037, #3e2723); border-radius:999px; border:3px solid #ffecb3;
          display:flex; align-items:center; justify-content:center; color:#ffecb3; font-size:18px; font-family:'Plus Jakarta Sans', sans-serif; font-weight:800;
          box-shadow: 0 4px 0 #3e2723; z-index:2;
        }
        .slider-ticks { position:absolute; inset:0; display:flex; align-items:center; justify-content:space-between; padding:0 12px; opacity:0.35 }
        .slider-ticks span { width:2px; height:14px; background:#5d4037; border-radius:2px }
        .shoot-btn {
          width:100%; height:62px;
          background: linear-gradient(180deg, #ff6f00 0%, #e65100 100%);
          border:3px solid #1c110f; border-radius:14px;
          font-weight:900; font-size:17px; color:#fff8e1;
          letter-spacing:0.06em;
          box-shadow: 0 6px 0 #1c110f, 0 8px 16px rgba(0,0,0,0.22);
          cursor:pointer;
          touch-action: manipulation;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .shoot-btn:active { transform: translateY(4px); box-shadow: 0 2px 0 #3e2723; }
        .side-panel {
          display:flex; flex-direction:column; gap:12px;
        }
        .card {
          background:#fffdf5; border:2px solid #5d4037; border-radius:16px; padding:14px;
          box-shadow: 0 6px 0 #d7ccc8;
        }
        .card h3 { margin:0 0 8px 0; font-size:14px; letter-spacing:0.04em }
        .toggle-row { display:flex; gap:8px; background:#efebe9; padding:4px; border-radius:999px; border:1px solid #bcaaa4 }
        .toggle-btn { flex:1; padding:8px 10px; border-radius:999px; border:0; font-weight:700; font-size:12px; cursor:pointer }
        .toggle-btn.active { background:#3e2723; color:#ffecb3; box-shadow:0 2px 6px rgba(0,0,0,0.2) }
        .toggle-btn:not(.active) { background:transparent; color:#6d4c41 }
        .level-dots { display:flex; gap:6px }
        .dot { width:28px; height:28px; border-radius:50%; border:2px solid #5d4037; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:12px; cursor:pointer }
        .dot.active { background:#ffb300; }
        .paugeran-grid { display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:12px }
        .paugeran-item { background:#fff3e0; border:1px solid #d7ccc8; border-radius:10px; padding:8px; display:flex; justify-content:space-between; align-items:center }
        .paugeran-item b { font-family:'Noto Sans Javanese'; font-size:18px }
        .overlay {
          position:absolute; inset:0; background:rgba(62,39,35,0.86); backdrop-filter: blur(6px);
          display:flex; align-items:center; justify-content:center; z-index:20; border-radius:18px;
        }
        .modal {
          background:#fffdf5; border:3px solid #ffb300; border-radius:20px; padding:20px; width:90%; max-width:360px;
          text-align:center; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .btn-primary { background:#3e2723; color:#ffecb3; border:0; padding:12px 18px; border-radius:999px; font-weight:800; cursor:pointer; width:100%; margin-top:12px }
        .btn-secondary { background:#efebe9; color:#5d4037; border:2px solid #bcaaa4; padding:10px 14px; border-radius:999px; font-weight:700; cursor:pointer; width:100%; margin-top:8px }
        .jawa-title { font-family:'Noto Sans Javanese'; font-size:28px; color:#3e2723; line-height:1 }
        @media (max-width: 600px){
          .header { padding:10px 14px }
          .brand .latin { font-size:14px }
          .brand .jawa { font-size:16px }
          .target-box { width:64px; height:72px; font-size:28px }
          .cannon-wrap { width:190px; height:132px }
          .cannon-body { width:160px; height:74px }
          .plaque-latin { font-size:22px }
          .cannon-wheels { gap:58px }
          .wheel { width:32px; height:32px }
        }
      `}),N("div",{className:"header",children:[N("div",{className:"brand",children:[g("div",{className:"latin",children:"BEDHIL AKSARA JAWA"}),g("div",{className:"jawa",children:"ꦧꦼꦝꦶꦭ꧀ ꦲꦏ꧀ꦱꦫ ꦗꦮ"})]}),N("div",{className:"stats",children:[N("div",{className:"stat-pill",children:["⭐ ",t]}),N("div",{className:"stat-pill",children:["Lv ",e]}),N("div",{className:"stat-pill hearts",children:["❤".repeat(l),"♡".repeat(3-l)]})]})]}),N("div",{className:"game-shell",children:[N("div",{className:"game-area",ref:kt,children:[g("div",{className:"batik"}),N("div",{className:"field-top",children:[g("div",{style:{position:"absolute",bottom:0,left:0,right:0,height:90,background:"linear-gradient(180deg, transparent, rgba(93,64,55,0.18))",pointerEvents:"none"}}),N("div",{className:"target-row",children:[m.map((_)=>g("div",{className:`target-box ${_.falling?"falling":""} ${_.shaking?"shaking":""} ${_.shuffling||I?"shuffling":""}`,style:{left:`${_.x}%`,animationDelay:`${_.x%7*0.2}s`},children:_.jawa},_.id)),z&&g("div",{className:"hit-effect",style:{left:`${z.x}%`,top:`${z.y}%`},children:z.text}),g("div",{className:`shuffle-indicator ${I?"show":""}`,children:"\uD83D\uDD00 ACAK POSISI..."})]}),g("div",{className:"laser",style:{left:`${p}%`,transition:I?"left 0.38s cubic-bezier(.34,1.56,.64,1)":"left 0.12s cubic-bezier(.2,.8,.2,1)"}}),S.map((_)=>g("div",{className:"projectile",style:{left:`${_.x}%`,bottom:`${_.y}%`},children:s.latin.slice(0,2)},_.id)),g("div",{className:"position-arrow",style:{left:`${p}%`,transition:I?"left 0.38s cubic-bezier(.34,1.56,.64,1)":"left 0.12s cubic-bezier(.2,.8,.2,1)"}})]}),N("div",{className:"cannon-stage",children:[g("div",{className:"rail",children:Array.from({length:20}).map((_,L)=>g("div",{className:`rail-tick ${L%5===0?"big":""}`},L))}),N("div",{className:`cannon-wrap ${T?"recoil":""} ${I?"jump":""}`,style:{left:`${p}%`,transition:I?"left 0.38s cubic-bezier(.34,1.56,.64,1)":"left 0.12s cubic-bezier(.2,.8,.2,1)"},children:[g("div",{className:"cannon-shadow"}),N("div",{className:"cannon-visual",children:[g("div",{className:"cannon-mouth",children:g("div",{className:"muzzle-flash"})}),g("div",{className:"cannon-body",children:g("div",{className:"plaque",children:g("div",{className:"plaque-latin",children:s.latin})})}),N("div",{className:"cannon-wheels",children:[g("div",{className:"wheel"}),g("div",{className:"wheel"})]})]})]})]}),N("div",{className:"controls",children:[N("div",{className:"control-box",onPointerDown:Ef,onPointerMove:_f,onPointerUp:Ci,onPointerLeave:Ci,children:[N("div",{className:"control-label",children:[N("span",{children:["GESER DI REL — ",Math.round(p),"%"]}),g("span",{children:"◀▶ POSISI"})]}),N("div",{className:"slider-track",children:[g("div",{className:"slider-fill",style:{width:`${p}%`}}),g("div",{className:"slider-ticks",children:Array.from({length:9}).map((_,L)=>g("span",{},L))}),g("div",{className:"slider-thumb",style:{left:`${p}%`},children:"↔"})]})]}),N("div",{className:"control-box",children:[N("div",{className:"control-label",children:[g("span",{children:"TEMBAK! (Kanan)"}),g("span",{children:"⎵ SPACE"})]}),N("button",{className:"shoot-btn",onPointerDown:Sr,onClick:Sr,children:[g("span",{children:"\uD83D\uDCA5"})," TEMBAK ",s.latin,"!"]})]})]}),O&&g("div",{className:"overlay",children:N("div",{className:"modal",children:[g("div",{className:"jawa-title",children:"ꦒꦩꦺ ꦎꦮ꦳ꦼꦂ"}),g("h2",{style:{margin:"8px 0 4px"},children:"Game Over!"}),N("div",{style:{fontSize:32,fontWeight:800},children:[t," poin"]}),N("div",{style:{fontSize:13,color:"#8d6e63",marginTop:6},children:["Level tercapai: ",e]}),zi.length>0&&N("div",{style:{textAlign:"left",marginTop:14,background:"#fff3e0",borderRadius:12,padding:10,border:"1px solid #d7ccc8"},children:[g("div",{style:{fontWeight:800,fontSize:12,marginBottom:6},children:"SERING SALAH:"}),zi.map(([_,L])=>N("div",{style:{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderBottom:"1px dashed #d7ccc8"},children:[g("span",{style:{fontFamily:"Noto Sans Javanese"},children:_}),N("span",{children:["×",L]})]},_))]}),g("button",{className:"btn-primary",onClick:Nf,children:"MAIN LAGI"})]})})]}),N("div",{className:"side-panel",children:[N("div",{className:"card",children:[g("h3",{children:"\uD83C\uDFAF MODE GANTI KOTAK"}),N("div",{className:"toggle-row",children:[g("button",{className:`toggle-btn ${o==="jatuh"?"active":""}`,onClick:()=>i("jatuh"),children:"JATUHKAN SAJA"}),g("button",{className:`toggle-btn ${o==="ganti"?"active":""}`,onClick:()=>i("ganti"),children:"GANTI SEMUA"})]}),g("div",{style:{fontSize:11,color:"#8d6e63",marginTop:8,lineHeight:1.4},children:o==="jatuh"?"Kotak benar jatuh, diganti baru, lalu SEMUA kotak di-shuffle Fisher-Yates + meriam loncat acak 10-90%. Wajib geser lagi!":"5 kotak baru, diacak posisi pakai Fisher-Yates + jitter, meriam juga loncat acak. Jawaban bisa kiri/tengah/kanan."})]}),N("div",{className:"card",children:[N("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[g("h3",{children:"\uD83D\uDCF6 LEVEL"}),g("button",{className:"btn-secondary",style:{width:"auto",marginTop:0,padding:"6px 10px",fontSize:11},onClick:Cf,children:"GANTI SOAL"})]}),g("div",{className:"level-dots",style:{marginTop:8},children:[1,2,3,4].map((_)=>g("div",{className:`dot ${e===_?"active":""}`,onClick:()=>{n(_);let L=Cn(_);c(L),h(St(L,_))},children:_},_))}),N("div",{style:{fontSize:11,marginTop:8,lineHeight:1.4,color:"#5d4037"},children:[e===1&&"Level 1: hanya A, I, U – tanpa cecak/layar.",e===2&&"Level 2: tambah Ê pepet ꦼ, É taling ꦺ, O ꦺꦴ.",e===3&&"Level 3: tambah NG ꦁ (cecak), R ꦂ (layar), H ꦃ (wignyan).",e===4&&"Level 4: semua + RÊ ꦉ & LÊ ꦊ (pa cerek & nga lelet)."]}),N("div",{style:{marginTop:10,background:"#efebe9",borderRadius:10,padding:8,fontSize:12},children:[g("div",{style:{fontWeight:800,fontSize:10,letterSpacing:"0.08em",marginBottom:4},children:"SAAT INI DITEMBAK:"}),N("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[g("span",{style:{fontWeight:800,fontSize:22},children:s.latin}),g("span",{style:{fontSize:10,background:"#3e2723",color:"#ffecb3",padding:"4px 8px",borderRadius:999,fontWeight:700},children:"CARI DI ATAS!"})]}),N("div",{style:{fontSize:10,color:"#8d6e63",marginTop:4},children:[s.cons," + ",s.vowel," + ",s.suffix||"∅"," → ?"]})]})]}),N("div",{className:"card",children:[N("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[g("h3",{children:"\uD83D\uDCDC PAUGERAN"}),g("button",{onClick:()=>d((_)=>!_),style:{border:0,background:"#3e2723",color:"#ffecb3",borderRadius:999,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"},children:a?"TUTUP":"BUKA"})]}),!a?N("div",{style:{fontSize:12,lineHeight:1.5,color:"#5d4037"},children:["Bedakan ",g("b",{children:"Ê pepet ꦼ"})," vs ",g("b",{children:"É taling ꦺ"}),". RÊ ꦉ dan LÊ ꦊ adalah aksara mandiri, bukan Ra/La + pepet."]}):N("div",{style:{marginTop:10},children:[N("div",{className:"paugeran-grid",children:[N("div",{className:"paugeran-item",children:[g("span",{children:"pepet Ê"}),g("b",{children:"ꦼ"})]}),N("div",{className:"paugeran-item",children:[g("span",{children:"taling É"}),g("b",{children:"ꦺ"})]}),N("div",{className:"paugeran-item",children:[g("span",{children:"taling-tarung O"}),g("b",{children:"ꦺꦴ"})]}),N("div",{className:"paugeran-item",children:[g("span",{children:"wulu I"}),g("b",{children:"ꦶ"})]}),N("div",{className:"paugeran-item",children:[g("span",{children:"suku U"}),g("b",{children:"ꦸ"})]}),N("div",{className:"paugeran-item",children:[g("span",{children:"cecak NG"}),g("b",{children:"ꦁ"})]}),N("div",{className:"paugeran-item",children:[g("span",{children:"layar R"}),g("b",{children:"ꦂ"})]}),N("div",{className:"paugeran-item",children:[g("span",{children:"wignyan H"}),g("b",{children:"ꦃ"})]}),N("div",{className:"paugeran-item",style:{background:"#ffecb3"},children:[g("span",{children:"pa cerek RÊ"}),g("b",{children:"ꦉ"})]}),N("div",{className:"paugeran-item",style:{background:"#ffecb3"},children:[g("span",{children:"nga lelet LÊ"}),g("b",{children:"ꦊ"})]})]}),N("div",{style:{fontSize:11,marginTop:10,lineHeight:1.5,background:"#fff8e1",padding:8,borderRadius:10,border:"1px solid #ffe0b2"},children:[g("b",{children:"Urutan:"})," Aksara pokok + sandhangan swara + panyigeg.",g("br",{}),"Contoh: ",g("span",{style:{fontFamily:"Noto Sans Javanese"},children:"ꦏꦁ"})," = Ka + cecak = KANG, ",g("span",{style:{fontFamily:"Noto Sans Javanese"},children:"ꦏꦶꦁ"})," = Ki + cecak = KING, ",g("span",{style:{fontFamily:"Noto Sans Javanese"},children:"ꦧꦼ"}),"= BÊ, ",g("span",{style:{fontFamily:"Noto Sans Javanese"},children:"ꦧꦺ"}),"= BÉ.",g("br",{}),"RÊ dan LÊ punya pasangan sandhangan: ",g("span",{style:{fontFamily:"Noto Sans Javanese"},children:"ꦉꦶ ꦊꦸ ꦉꦺꦴ"})," dll."]}),g("div",{style:{fontSize:11,marginTop:8,display:"flex",gap:6,flexWrap:"wrap"},children:[{l:"KA",j:"ꦏ"},{l:"KI",j:"ꦏꦶ"},{l:"KÊ",j:"ꦏꦼ"},{l:"KÉ",j:"ꦏꦺ"},{l:"KO",j:"ꦏꦺꦴ"},{l:"KANG",j:"ꦏꦁ"},{l:"KAR",j:"ꦏꦂ"},{l:"KAH",j:"ꦏꦃ"},{l:"NGO",j:"ꦔꦺꦴ"},{l:"THONG",j:"ꦛꦺꦴꦁ"}].map((_)=>N("span",{style:{background:"#efebe9",padding:"3px 7px",borderRadius:999,border:"1px solid #d7ccc8"},children:[_.l," = ",g("span",{style:{fontFamily:"Noto Sans Javanese"},children:_.j})]},_.l))})]})]}),N("div",{className:"card",style:{background:"#3e2723",color:"#ffecb3",borderColor:"#271c19"},children:[g("h3",{style:{color:"#ffcc80"},children:"\uD83D\uDD79️ CARA MAIN"}),N("div",{style:{fontSize:12,lineHeight:1.6},children:["1. Lihat huruf di meriam (contoh ",g("b",{children:"NGÊNG = ꦔꦼꦁ"}),")",g("br",{}),"2. Geser meriam pakai tangan kiri (drag / slider).",g("br",{}),"3. Tembak dengan tombol kanan / Spacebar.",g("br",{}),"4. Tembak aksara Jawa yang tepat di atas. Salah = -5 & nyawa -1."]})]})]})]}),g("div",{style:{fontSize:10,color:"#8d6e63",padding:"10px 0 24px",letterSpacing:"0.06em"},children:"Dibuat dengan paugeran Mardikawi • Noto Sans Javanese • Bedhil Cetbang Jawa"})]})}Sf.createRoot(document.getElementById("root")).render(g(wf.default.StrictMode,{children:g(gi,{})}));
