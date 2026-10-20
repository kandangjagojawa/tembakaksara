import React, { useState, useEffect, useRef, useCallback } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import {
  createQuestion,
  generateTargets,
  shuffleArray,
  generateTargetPositions,
  getRandomPosition
} from "./jawa-transliteration.js";

const h = React.createElement;

// Inisialisasi Soal Pertama Tunggal
const initialQuestion = createQuestion(1);

export function BedhilAksaraJawaGame() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [targetMode, setTargetMode] = useState("jatuh");

  // Soal & Target dijamin cocok 100% sejak pertama dimuat
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
  const [targets, setTargets] = useState(() => generateTargets(initialQuestion, 1));
  const [cannonX, setCannonX] = useState(50);
  const [projectiles, setProjectiles] = useState([]);

  const [gameOver, setGameOver] = useState(false);
  const [showPaugeran, setShowPaugeran] = useState(false);
  const [wrongCounts, setWrongCounts] = useState({});
  const [hitEffect, setHitEffect] = useState(null);

  const [isRecoil, setIsRecoil] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const gameAreaRef = useRef(null);
  const targetsRef = useRef(targets);
  const cannonXRef = useRef(50);
  const isDraggingRef = useRef(false);
  const hitCorrectRef = useRef(() => {});
  const hitWrongRef = useRef(() => {});

  const updateCannon = useCallback((val) => {
    setCannonX((prev) => {
      const nextVal = typeof val === "function" ? val(prev) : val;
      const clamped = Math.max(6, Math.min(94, nextVal));
      cannonXRef.current = clamped;
      return clamped;
    });
  }, []);

  useEffect(() => {
    targetsRef.current = targets;
  }, [targets]);

  const handleHitCorrect = useCallback((hitTarget) => {
    setScore((prevScore) => {
      const nextScore = prevScore + 10;
      if (nextScore >= 50 && level === 1) setLevel(2);
      else if (nextScore >= 120 && level === 2) setLevel(3);
      else if (nextScore >= 220 && level === 3) setLevel(4);
      return nextScore;
    });

    setHitEffect({ x: hitTarget.x, y: 22, text: "+10" });
    setTimeout(() => setHitEffect(null), 600);

    // 1. Tandai HANYA target ini yang jatuh (tanpa memicu class shuffling)
    setTargets((prev) =>
      prev.map((t) => (t.id === hitTarget.id ? { ...t, falling: true } : t))
    );

    // 2. Setelah animasi jatuh selesai (280ms), baru acak dan ganti soal
    setTimeout(() => {
      setIsShuffling(true);
      const activeLevel = level + (score >= 50 ? 1 : 0) > 4 ? 4 : level;
      const nextQ = createQuestion(activeLevel);
      setCurrentQuestion(nextQ);

      if (targetMode === "ganti") {
        const newTargets = generateTargets(nextQ, activeLevel);
        setTargets(newTargets);
      } else {
        setTargets((prevList) => {
          const remaining = prevList
            .filter((t) => t.id !== hitTarget.id && !t.falling)
            .filter((t) => t.jawa !== nextQ.jawa);

          const dummyList = [];
          let safety = 0;
          while (remaining.length + dummyList.length < 4 && safety < 100) {
            safety++;
            const candidate = createQuestion(activeLevel);
            if (candidate.jawa === nextQ.jawa) continue;
            if (remaining.some((item) => item.jawa === candidate.jawa)) continue;
            if (dummyList.some((item) => item.jawa === candidate.jawa)) continue;
            dummyList.push({ ...candidate, isCorrect: false, x: 0 });
          }

          const combined = [
            ...[...remaining, ...dummyList].slice(0, 4),
            { ...nextQ, isCorrect: true, x: 0 }
          ];

          const shuffled = shuffleArray(combined);
          const pos = generateTargetPositions();
          return shuffled.map((item, idx) => ({ ...item, x: pos[idx], falling: false }));
        });
      }

      updateCannon(getRandomPosition());

      setTimeout(() => {
        setIsShuffling(false);
      }, 350);
    }, 280);
  }, [level, targetMode, score, updateCannon]);

  const handleHitWrong = useCallback((hitTarget) => {
    setTargets((prev) =>
      prev.map((t) => (t.id === hitTarget.id ? { ...t, shaking: true } : t))
    );

    setTimeout(() => {
      setTargets((prev) => prev.map((t) => ({ ...t, shaking: false })));
    }, 400);

    setScore((prev) => Math.max(0, prev - 5));
    setHearts((prevHearts) => {
      const next = prevHearts - 1;
      if (next <= 0) setGameOver(true);
      return next;
    });

    setWrongCounts((prev) => {
      const key = `${currentQuestion.latin} → ${currentQuestion.jawa}`;
      return { ...prev, [key]: (prev[key] ?? 0) + 1 };
    });

    setHitEffect({ x: hitTarget.x, y: 26, text: "-5" });
    setTimeout(() => setHitEffect(null), 600);
  }, [currentQuestion]);

  useEffect(() => {
    hitCorrectRef.current = handleHitCorrect;
    hitWrongRef.current = handleHitWrong;
  }, [handleHitCorrect, handleHitWrong]);

  // Detector Tabrakan Vertikal & Horizontal Presisi
  useEffect(() => {
    if (projectiles.length === 0) return;

    let animId;
    const updatePhysics = () => {
      const hits = [];

      setProjectiles((prevProjectiles) => {
        const remaining = [];
        for (let proj of prevProjectiles) {
          const nextY = proj.y + 3.5;

          // Ketinggian vertikal kotak target berada pada y = 78% hingga 92%
          if (nextY >= 78 && nextY <= 92) {
            const candidates = targetsRef.current.filter(
              (t) => !t.falling && Math.abs(t.x - proj.x) <= 9.0
            );

            if (candidates.length > 0) {
              candidates.sort((a, b) => Math.abs(a.x - proj.x) - Math.abs(b.x - proj.x));
              hits.push(candidates[0]);
              continue;
            }
          }

          if (nextY <= 96) {
            remaining.push({ ...proj, y: nextY });
          }
        }
        return remaining;
      });

      if (hits.length > 0) {
        for (let target of hits) {
          if (target.isCorrect) hitCorrectRef.current(target);
          else hitWrongRef.current(target);
        }
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [projectiles.length]);

  const shoot = useCallback(() => {
    if (gameOver) return;
    const bulletId = Math.random().toString(36).slice(2, 8);
    setIsRecoil(true);
    setTimeout(() => setIsRecoil(false), 180);

    setProjectiles((prev) => [...prev, { id: bulletId, x: cannonXRef.current, y: 26 }]);
  }, [gameOver]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        shoot();
      }
      if (e.code === "ArrowLeft") {
        updateCannon((prev) => prev - 6);
      }
      if (e.code === "ArrowRight") {
        updateCannon((prev) => prev + 6);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shoot, updateCannon]);

  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    e.target.setPointerCapture(e.pointerId);
    updateCannonPosition(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    updateCannonPosition(e.clientX);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const updateCannonPosition = (clientX) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    updateCannon(percent);
  };

  const changeQuestion = () => {
    const q = createQuestion(level);
    setCurrentQuestion(q);
    setTargets(generateTargets(q, level));
    updateCannon(getRandomPosition());
    setIsShuffling(true);
    setTimeout(() => setIsShuffling(false), 350);
  };

  const restartGame = () => {
    setScore(0);
    setHearts(3);
    setLevel(1);
    setGameOver(false);
    setWrongCounts({});
    const q = createQuestion(1);
    setCurrentQuestion(q);
    setTargets(generateTargets(q, 1));
    setProjectiles([]);
    updateCannon(50);
    setIsShuffling(false);
  };

  const topWrongList = Object.entries(wrongCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return h("div", { className: "app-root" }, [
    h("style", { key: "css" }, `
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
        display: flex; flex-direction: column; align-items: center;
      }
      .batik {
        position: absolute; inset:0; opacity:0.07;
        background-image:
          repeating-linear-gradient(45deg, #5d4037 0 1px, transparent 1px 12px),
          repeating-linear-gradient(-45deg, #8d6e63 0 1px, transparent 1px 18px);
        pointer-events:none;
      }
      .header {
        width:100%; max-width:1100px; display:flex; justify-content:space-between; align-items:center;
        padding: 14px 18px; background: #3e2723; color:#ffecb3;
        position: sticky; top:0; z-index:10; box-shadow: 0 4px 18px rgba(62,39,35,0.3);
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
        position:relative; height: 600px;
        background: linear-gradient(180deg, #fff8e1 0%, #ffe0b2 32%, #f5d0a0 62%, #d7a76f 100%);
        border-radius: 18px; overflow:hidden; border: 3px solid #5d4037;
        box-shadow: inset 0 0 0 4px #ffecb3, 0 12px 30px rgba(62,39,35,0.18);
        display:flex; flex-direction:column;
      }
      @media (max-width: 600px) { .game-area { height: 620px; } }
      .field-top { position:relative; flex:1; min-height: 360px; }
      .target-row { position:absolute; top:18px; left:0; right:0; height:110px; }
      .target-box {
        position:absolute; top:0; width: 84px; height: 92px; transform: translateX(-50%);
        background: linear-gradient(180deg, #fff3e0 0%, #ffcc80 100%);
        border: 3px solid #5d4037; border-radius: 14px;
        box-shadow: 0 6px 0 #3e2723, 0 10px 18px rgba(0,0,0,0.18);
        display:flex; align-items:center; justify-content:center;
        font-family:'Noto Sans Javanese', serif; font-size: 38px; color:#3e2723;
        transition: left 0.45s cubic-bezier(.2,.8,.2,1), transform 0.28s cubic-bezier(.2,.8,.2,1), opacity 0.28s;
        animation: float 3s ease-in-out infinite; will-change: left, transform;
      }
      .target-box.falling {
        transform: translateX(-50%) translateY(350px) rotate(25deg) scale(0.5) !important;
        opacity: 0 !important;
        pointer-events: none;
        transition: transform 0.35s ease-in, opacity 0.3s ease-in;
      }
      .target-box.shaking { animation: shake 0.36s ease; }
      .target-box.shuffling { transition: left 0.42s cubic-bezier(.34,1.56,.64,1), transform 0.32s ease; z-index: 2; animation: shufflePop 0.42s ease; }
      @keyframes shufflePop { 0% { transform: translateX(-50%) scale(1); } 40% { transform: translateX(-50%) scale(1.08) translateY(-8px); } 100% { transform: translateX(-50%) scale(1); } }
      @keyframes float { 0%,100%{ transform:translateX(-50%) translateY(0)} 50%{ transform:translateX(-50%) translateY(-6px)} }
      @keyframes shake { 0%,100%{ transform:translateX(-50%) } 20%{ transform:translateX(calc(-50% - 8px)) } 40%{ transform:translateX(calc(-50% + 8px)) } 60%{ transform:translateX(calc(-50% - 6px)) } 80%{ transform:translateX(calc(-50% + 6px)) } }
      .shuffle-indicator {
        position:absolute; top:108px; left:50%; transform:translateX(-50%);
        background:#3e2723; color:#ffecb3; font-size:10px; font-weight:800; letter-spacing:0.08em;
        padding:4px 10px; border-radius:999px; border:1px solid #ffcc80; opacity:0; pointer-events:none; transition: opacity 0.2s;
      }
      .shuffle-indicator.show { opacity:1; animation: pulse 0.9s ease infinite; }
      @keyframes pulse { 0%,100%{ transform:translateX(-50%) scale(1)} 50%{ transform:translateX(-50%) scale(1.05)} }
      .cannon-stage { position: relative; height: 168px; width: 100%; z-index: 5; pointer-events:none; }
      .rail {
        position:absolute; left:2%; right:2%; bottom:22px; height:28px;
        background: linear-gradient(90deg, rgba(0,0,0,0.15) 0 2px, transparent 2px 18px), linear-gradient(180deg, #8d6e63 0%, #5d4037 55%, #3e2723 100%);
        border: 2px solid #3e2723; border-radius: 8px; box-shadow: inset 0 2px 0 rgba(255,255,255,0.25), 0 4px 0 #271c19;
        display:flex; align-items:center; justify-content:space-between; padding: 0 6px;
      }
      .rail-tick { width:3px; height:10px; background:#271c19; opacity:0.6; border-radius:2px }
      .rail-tick.big { height:16px; width:3px; background:#ffecb3; opacity:1 }
      .cannon-wrap {
        position:absolute; bottom:28px; width: 220px; height: 150px; transform: translateX(-50%);
        display:flex; flex-direction:column; align-items:center; justify-content:flex-end;
        z-index:6; pointer-events:none; filter: drop-shadow(0 12px 10px rgba(0,0,0,0.25));
      }
      .cannon-wrap.recoil { animation: recoil 0.18s ease; }
      .cannon-wrap.jump { transition: left 0.38s cubic-bezier(.34,1.56,.64,1); }
      @keyframes recoil { 0%{ transform:translateX(-50%) translateY(0) rotate(0)} 35%{ transform:translateX(-50%) translateY(6px) rotate(-1.2deg)} 100%{ transform:translateX(-50%) translateY(0) rotate(0)} }
      .cannon-shadow { position:absolute; bottom:14px; left:50%; transform:translateX(-50%); width:120px; height:18px; background: radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, transparent 70%); z-index:0; border-radius:50%; }
      .laser {
        position:absolute; bottom:130px; width:2px; top:90px; transform: translateX(-50%);
        background: repeating-linear-gradient(180deg, rgba(255,235,59,0.9) 0 10px, transparent 10px 18px);
        box-shadow: 0 0 8px rgba(255,235,59,0.8), 0 0 18px rgba(255,111,0,0.6); z-index:4; pointer-events:none;
      }
      .laser::after { content:""; position:absolute; top:-10px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-bottom:10px solid #ffeb3b; filter: drop-shadow(0 0 6px #ffeb3b); }
      .position-arrow { position:absolute; bottom:50px; width:0; height:0; border-left:10px solid transparent; border-right:10px solid transparent; border-bottom:12px solid #ff6f00; transform: translateX(-50%); filter: drop-shadow(0 2px 2px rgba(0,0,0,0.4)); z-index:7; }
      .cannon-visual { position:relative; width:100%; height:116px; display:flex; flex-direction:column; align-items:center; }
      .cannon-mouth { position:relative; width: 54px; height: 30px; background: radial-gradient(ellipse at center, #1a1a1a 0%, #000 65%); border: 3px solid #2b1a14; border-bottom:0; border-radius: 12px 12px 4px 4px; box-shadow: inset 0 4px 8px rgba(255,255,255,0.15), 0 -2px 0 #ffcc80; z-index:3; }
      .cannon-mouth::after { content:""; position:absolute; inset:5px; background: radial-gradient(ellipse at center, #3e2723 0%, #000 80%); border-radius: 8px 8px 2px 2px; }
      .muzzle-flash { position:absolute; top:-12px; left:50%; transform:translateX(-50%); width: 42px; height: 26px; background: radial-gradient(ellipse at center, #fffde7 0%, #ffeb3b 30%, #ff6f00 60%, transparent 75%); border-radius:50%; opacity:0; pointer-events:none; }
      .cannon-wrap.recoil .muzzle-flash { animation: flash 0.18s ease; }
      @keyframes flash { 0%{ opacity:0; transform:translateX(-50%) scale(0.3)} 30%{ opacity:1; transform:translateX(-50%) scale(1.3)} 100%{ opacity:0; transform:translateX(-50%) scale(1.8)} }
      .cannon-body {
        width: 188px; height: 82px; margin-top:-6px;
        background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 18%), linear-gradient(180deg, #6d4c41 0%, #4e342e 22%, #3e2723 55%, #271c19 100%);
        border: 4px solid #1c110f; border-radius: 22px; box-shadow: inset 0 3px 0 rgba(255,255,255,0.22), inset 0 -6px 10px rgba(0,0,0,0.45), 0 8px 0 #1c110f;
        display:flex; align-items:center; justify-content:center; position:relative; z-index:2;
      }
      .cannon-body::before, .cannon-body::after { content:""; position:absolute; top:14px; bottom:14px; width:14px; background: linear-gradient(180deg, #8d6e63, #4e342e); border-radius: 6px; border:1px solid #271c19; box-shadow: inset 0 1px 0 rgba(255,255,255,0.3); }
      .cannon-body::before { left:8px; }
      .cannon-body::after { right:8px; }
      .plaque { background: #fffdf5; border: 4px solid #1c110f; border-radius: 14px; padding: 10px 18px 12px; min-width: 116px; text-align:center; box-shadow: 0 3px 0 #1c110f, inset 0 1px 0 #fff, 0 6px 12px rgba(0,0,0,0.18); position:relative; z-index:3; transform: rotate(-1.2deg); }
      .plaque-latin { font-weight:900; font-size:30px; line-height:1; letter-spacing:0.07em; color:#1a1a1a; text-shadow: 0 1px 0 #fff; font-family: 'Plus Jakarta Sans', sans-serif; }
      .cannon-wheels { display:flex; gap:78px; margin-top:-12px; z-index:1; }
      .wheel { width:38px; height:38px; border-radius:50%; background: radial-gradient(circle at 30% 30%, #a1887f, #5d4037 55%, #3e2723); border:3px solid #1c110f; box-shadow: 0 4px 0 #1c110f, inset 0 2px 0 rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; position:relative; }
      .wheel::before { content:""; width:10px; height:10px; background:#ffecb3; border:2px solid #1c110f; border-radius:50%; }
      .wheel::after { content:""; position:absolute; inset:5px; border:2px dashed rgba(0,0,0,0.25); border-radius:50%; }
      .projectile {
        position:absolute; width:26px; height:26px; transform: translateX(-50%);
        background: radial-gradient(circle at 30% 30%, #fff8e1, #ffb300 55%, #ff6f00);
        border:2px solid #1c110f; border-radius:50%; box-shadow: 0 0 14px rgba(255,179,0,0.9), 0 0 26px rgba(255,111,0,0.6);
        display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; color:#3e2723; z-index:6;
      }
      .hit-effect { position:absolute; transform:translateX(-50%); font-weight:800; font-size:20px; color:#bf360c; text-shadow: 0 1px 0 #fff; animation: pop 0.6s ease forwards; pointer-events:none; z-index:8; }
      @keyframes pop { 0%{ transform:translateX(-50%) translateY(0) scale(0.6); opacity:0 } 20%{ opacity:1; transform:translateX(-50%) translateY(-8px) scale(1.2)} 100%{ opacity:0; transform:translateX(-50%) translateY(-36px) scale(1)} }
      .controls { display:grid; grid-template-columns: 1.3fr 0.9fr; gap:12px; padding:12px 12px 14px; background: linear-gradient(180deg, #fff8e1 0%, #ffecb3 100%); border-top:3px solid #5d4037; z-index:10; border-radius: 0 0 15px 15px; }
      @media (max-width: 600px) { .controls { grid-template-columns:1fr; } }
      .control-box { border:2px dashed #a1887f; border-radius:14px; padding:10px; background: #ffffffb8; backdrop-filter: blur(4px); touch-action:none; user-select:none; }
      .control-label { font-size:11px; font-weight:800; letter-spacing:0.08em; color:#6d4c41; margin-bottom:6px; display:flex; justify-content:space-between }
      .slider-track { height:52px; background: linear-gradient(90deg, #efebe9, #d7ccc8); border:2px solid #8d6e63; border-radius:999px; position:relative; overflow:hidden; cursor: ew-resize; touch-action:none; }
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
        width:100%; height:62px; background: linear-gradient(180deg, #ff6f00 0%, #e65100 100%);
        border:3px solid #1c110f; border-radius:14px; font-weight:900; font-size:17px; color:#fff8e1; letter-spacing:0.06em;
        box-shadow: 0 6px 0 #1c110f, 0 8px 16px rgba(0,0,0,0.22); cursor:pointer; touch-action: manipulation;
        display:flex; align-items:center; justify-content:center; gap:8px;
      }
      .shoot-btn:active { transform: translateY(4px); box-shadow: 0 2px 0 #3e2723; }
      .side-panel { display:flex; flex-direction:column; gap:12px; }
      .card { background:#fffdf5; border:2px solid #5d4037; border-radius:16px; padding:14px; box-shadow: 0 6px 0 #d7ccc8; }
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
      .overlay { position:absolute; inset:0; background:rgba(62,39,35,0.86); backdrop-filter: blur(6px); display:flex; align-items:center; justify-content:center; z-index:20; border-radius:18px; }
      .modal { background:#fffdf5; border:3px solid #ffb300; border-radius:20px; padding:20px; width:90%; max-width:360px; text-align:center; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
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
    `),

    // HEADER BAR
    h("div", { className: "header", key: "header" }, [
      h("div", { className: "brand", key: "brand" }, [
        h("div", { className: "latin", key: "l" }, "BEDHIL AKSARA JAWA"),
        h("div", { className: "jawa", key: "j" }, "ꦧꦼꦝꦶꦭ꧀ ꦲꦏ꧀ꦱꦫ ꦗꦮ")
      ]),
      h("div", { className: "stats", key: "stats" }, [
        h("div", { className: "stat-pill", key: "s" }, `⭐ ${score}`),
        h("div", { className: "stat-pill", key: "lv" }, `Lv ${level}`),
        h("div", { className: "stat-pill hearts", key: "h" }, "❤".repeat(hearts) + "♡".repeat(3 - hearts))
      ])
    ]),

    // GAME SHELL
    h("div", { className: "game-shell", key: "shell" }, [
      h("div", { className: "game-area", ref: gameAreaRef, key: "area" }, [
        h("div", { className: "batik", key: "batik" }),
        h("div", { className: "field-top", key: "top" }, [
          h("div", { key: "bg", style: { position: "absolute", bottom: 0, left: 0, right: 0, height: 90, background: "linear-gradient(180deg, transparent, rgba(93,64,55,0.18))", pointerEvents: "none" } }),
          
          // TARGET ROW
          h("div", { className: "target-row", key: "targets" }, [
            ...targets.map((t) =>
              h("div", {
                key: t.id,
                // Mencegah penambahan class shuffling jika target sedang falling
                className: `target-box ${t.falling ? "falling" : ""} ${t.shaking ? "shaking" : ""} ${!t.falling && (t.shuffling || isShuffling) ? "shuffling" : ""}`,
                style: { left: `${t.x}%`, animationDelay: `${(t.x % 7) * 0.2}s` }
              }, t.jawa)
            ),
            hitEffect && h("div", { key: "he", className: "hit-effect", style: { left: `${hitEffect.x}%`, top: `${hitEffect.y}%` } }, hitEffect.text),
            h("div", { key: "si", className: `shuffle-indicator ${isShuffling ? "show" : ""}` }, "🔀 ACAK POSISI...")
          ]),

          // LASER
          h("div", {
            key: "laser",
            className: "laser",
            style: { left: `${cannonX}%` }
          }),

          // PROJECTILES
          ...projectiles.map((p) =>
            h("div", { key: p.id, className: "projectile", style: { left: `${p.x}%`, bottom: `${p.y}%` } }, currentQuestion.latin.slice(0, 2))
          ),

          h("div", {
            key: "arrow",
            className: "position-arrow",
            style: { left: `${cannonX}%` }
          })
        ]),

        // CANNON STAGE
        h("div", { className: "cannon-stage", key: "stage" }, [
          h("div", { className: "rail", key: "rail" },
            Array.from({ length: 20 }).map((_, idx) =>
              h("div", { key: idx, className: `rail-tick ${idx % 5 === 0 ? "big" : ""}` })
            )
          ),
          h("div", {
            key: "cannon",
            className: `cannon-wrap ${isRecoil ? "recoil" : ""} ${isShuffling ? "jump" : ""}`,
            style: { left: `${cannonX}%` }
          }, [
            h("div", { className: "cannon-shadow", key: "cs" }),
            h("div", { className: "cannon-visual", key: "cv" }, [
              h("div", { className: "cannon-mouth", key: "cm" }, h("div", { className: "muzzle-flash" })),
              h("div", { className: "cannon-body", key: "cb" },
                h("div", { className: "plaque" },
                  h("div", { className: "plaque-latin" }, currentQuestion.latin)
                )
              ),
              h("div", { className: "cannon-wheels", key: "cw" }, [
                h("div", { className: "wheel", key: "w1" }),
                h("div", { className: "wheel", key: "w2" })
              ])
            ])
          ])
        ]),

        // CONTROLS
        h("div", { className: "controls", key: "ctrls" }, [
          h("div", {
            key: "c1",
            className: "control-box",
            onPointerDown: handlePointerDown,
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerUp,
            onPointerLeave: handlePointerUp
          }, [
            h("div", { className: "control-label", key: "cl1" }, [
              h("span", { key: "txt" }, `GESER DI REL — ${Math.round(cannonX)}%`),
              h("span", { key: "pos" }, "◀▶ POSISI")
            ]),
            h("div", { className: "slider-track", key: "st" }, [
              h("div", { className: "slider-fill", style: { width: `${cannonX}%` }, key: "sf" }),
              h("div", { className: "slider-ticks", key: "stick" },
                Array.from({ length: 9 }).map((_, i) => h("span", { key: i }))
              ),
              h("div", { className: "slider-thumb", style: { left: `${cannonX}%` }, key: "sth" }, "↔")
            ])
          ]),

          h("div", { className: "control-box", key: "c2" }, [
            h("div", { className: "control-label", key: "cl2" }, [
              h("span", { key: "s1" }, "TEMBAK! (Kanan)"),
              h("span", { key: "s2" }, "⎵ SPACE")
            ]),
            h("button", { className: "shoot-btn", onClick: shoot, key: "sbtn" }, [
              h("span", { key: "boom" }, "💥"),
              ` TEMBAK ${currentQuestion.latin}!`
            ])
          ])
        ]),

        // GAME OVER OVERLAY
        gameOver && h("div", { className: "overlay", key: "go" },
          h("div", { className: "modal" }, [
            h("div", { className: "jawa-title", key: "jt" }, "ꦒꦩꦺ ꦎꦮ꦳ꦼꦂ"),
            h("h2", { style: { margin: "8px 0 4px" }, key: "title" }, "Game Over!"),
            h("div", { style: { fontSize: 32, fontWeight: 800 }, key: "sc" }, `${score} poin`),
            h("div", { style: { fontSize: 13, color: "#8d6e63", marginTop: 6 }, key: "lv" }, `Level tercapai: ${level}`),
            topWrongList.length > 0 && h("div", { style: { textAlign: "left", marginTop: 14, background: "#fff3e0", borderRadius: 12, padding: 10, border: "1px solid #d7ccc8" }, key: "wr" }, [
              h("div", { style: { fontWeight: 800, fontSize: 12, marginBottom: 6 }, key: "lbl" }, "SERING SALAH:"),
              ...topWrongList.map(([key, count]) =>
                h("div", { key, style: { display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: "1px dashed #d7ccc8" } }, [
                  h("span", { style: { fontFamily: "Noto Sans Javanese" }, key: "k" }, key),
                  h("span", { key: "c" }, `×${count}`)
                ])
              )
            ]),
            h("button", { className: "btn-primary", onClick: restartGame, key: "again" }, "MAIN LAGI")
          ])
        )
      ]),

      // SIDE PANEL
      h("div", { className: "side-panel", key: "panel" }, [
        h("div", { className: "card", key: "card1" }, [
          h("h3", { key: "t1" }, "🎯 MODE GANTI KOTAK"),
          h("div", { className: "toggle-row", key: "trow" }, [
            h("button", { className: `toggle-btn ${targetMode === "jatuh" ? "active" : ""}`, onClick: () => setTargetMode("jatuh"), key: "b1" }, "JATUHKAN SAJA"),
            h("button", { className: `toggle-btn ${targetMode === "ganti" ? "active" : ""}`, onClick: () => setTargetMode("ganti"), key: "b2" }, "GANTI SEMUA")
          ]),
          h("div", { style: { fontSize: 11, color: "#8d6e63", marginTop: 8, lineHeight: 1.4 }, key: "desc" },
            targetMode === "jatuh"
              ? "Kotak benar jatuh, diganti baru, lalu SEMUA kotak di-shuffle Fisher-Yates + meriam loncat acak 10-90%. Wajib geser lagi!"
              : "5 kotak baru, diacak posisi pakai Fisher-Yates + jitter, meriam juga loncat acak. Jawaban bisa kiri/tengah/kanan."
          )
        ]),

        h("div", { className: "card", key: "card2" }, [
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, key: "hdr" }, [
            h("h3", { key: "title" }, "📻 LEVEL"),
            h("button", { className: "btn-secondary", style: { width: "auto", marginTop: 0, padding: "6px 10px", fontSize: 11 }, onClick: changeQuestion, key: "change" }, "GANTI SOAL")
          ]),
          h("div", { className: "level-dots", style: { marginTop: 8 }, key: "dots" },
            [1, 2, 3, 4].map((lvl) =>
              h("div", {
                key: lvl,
                className: `dot ${level === lvl ? "active" : ""}`,
                onClick: () => {
                  setLevel(lvl);
                  const q = createQuestion(lvl);
                  setCurrentQuestion(q);
                  setTargets(generateTargets(q, lvl));
                }
              }, lvl)
            )
          ),
          h("div", { style: { fontSize: 11, marginTop: 8, lineHeight: 1.4, color: "#5d4037" }, key: "ldesc" },
            level === 1 ? "Level 1: hanya A, I, U – tanpa cecak/layar." :
            level === 2 ? "Level 2: tambah Ê pepet ꦼ, É taling ꦺ, O ꦺꦴ." :
            level === 3 ? "Level 3: tambah NG ꦁ (cecak), R ꦂ (layar), H ꦃ (wignyan)." :
            "Level 4: semua + RÊ ꦉ & LÊ ꦊ (pa cerek & nga lelet)."
          ),
          h("div", { style: { marginTop: 10, background: "#efebe9", borderRadius: 10, padding: 8, fontSize: 12 }, key: "box" }, [
            h("div", { style: { fontWeight: 800, fontSize: 10, letterSpacing: "0.08em", marginBottom: 4 }, key: "lbl" }, "SAAT INI DITEMBAK:"),
            h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, key: "val" }, [
              h("span", { style: { fontWeight: 800, fontSize: 22 }, key: "lat" }, currentQuestion.latin),
              h("span", { style: { fontSize: 10, background: "#3e2723", color: "#ffecb3", padding: "4px 8px", borderRadius: 999, fontWeight: 700 }, key: "hint" }, "CARI DI ATAS!")
            ]),
            h("div", { style: { fontSize: 10, color: "#8d6e63", marginTop: 4 }, key: "formula" }, `${currentQuestion.cons} + ${currentQuestion.vowel} + ${currentQuestion.suffix || "∅"} → ?`)
          ])
        ]),

        h("div", { className: "card", key: "card3" }, [
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, key: "hdr" }, [
            h("h3", { key: "title" }, "📜 PAUGERAN"),
            h("button", { onClick: () => setShowPaugeran((prev) => !prev), style: { border: 0, background: "#3e2723", color: "#ffecb3", borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }, key: "btn" }, showPaugeran ? "TUTUP" : "BUKA")
          ]),
          !showPaugeran
            ? h("div", { style: { fontSize: 12, lineHeight: 1.5, color: "#5d4037" }, key: "short" }, [
                "Bedakan ", h("b", { key: "b1" }, "Ê pepet ꦼ"), " vs ", h("b", { key: "b2" }, "É taling ꦺ"), ". RÊ ꦉ dan LÊ ꦊ adalah aksara mandiri, bukan Ra/La + pepet."
              ])
            : h("div", { style: { marginTop: 10 }, key: "full" }, [
                h("div", { className: "paugeran-grid", key: "grid" }, [
                  h("div", { className: "paugeran-item", key: "i1" }, [h("span", { key: "s" }, "pepet Ê"), h("b", { key: "b" }, "ꦼ")]),
                  h("div", { className: "paugeran-item", key: "i2" }, [h("span", { key: "s" }, "taling É"), h("b", { key: "b" }, "ꦺ")]),
                  h("div", { className: "paugeran-item", key: "i3" }, [h("span", { key: "s" }, "taling-tarung O"), h("b", { key: "b" }, "ꦺꦴ")]),
                  h("div", { className: "paugeran-item", key: "i4" }, [h("span", { key: "s" }, "wulu I"), h("b", { key: "b" }, "ꦶ")]),
                  h("div", { className: "paugeran-item", key: "i5" }, [h("span", { key: "s" }, "suku U"), h("b", { key: "b" }, "ꦸ")]),
                  h("div", { className: "paugeran-item", key: "i6" }, [h("span", { key: "s" }, "cecak NG"), h("b", { key: "b" }, "ꦁ")]),
                  h("div", { className: "paugeran-item", key: "i7" }, [h("span", { key: "s" }, "layar R"), h("b", { key: "b" }, "ꦂ")]),
                  h("div", { className: "paugeran-item", key: "i8" }, [h("span", { key: "s" }, "wignyan H"), h("b", { key: "b" }, "ꦃ")]),
                  h("div", { className: "paugeran-item", style: { background: "#ffecb3" }, key: "i9" }, [h("span", { key: "s" }, "pa cerek RÊ"), h("b", { key: "b" }, "ꦉ")]),
                  h("div", { className: "paugeran-item", style: { background: "#ffecb3" }, key: "i10" }, [h("span", { key: "s" }, "nga lelet LÊ"), h("b", { key: "b" }, "ꦊ")])
                ]),
                h("div", { style: { fontSize: 11, marginTop: 10, lineHeight: 1.5, background: "#fff8e1", padding: 8, borderRadius: 10, border: "1px solid #ffe0b2" }, key: "rule" }, [
                  h("b", { key: "b" }, "Urutan:"), " Aksara pokok + sandhangan swara + panyigeg.", h("br", { key: "br1" }),
                  "Contoh: ", h("span", { style: { fontFamily: "Noto Sans Javanese" }, key: "ex1" }, "ꦏꦁ"), " = Ka + cecak = KANG, ", h("span", { style: { fontFamily: "Noto Sans Javanese" }, key: "ex2" }, "ꦏꦶꦁ"), " = Ki + cecak = KING, ", h("span", { style: { fontFamily: "Noto Sans Javanese" }, key: "ex3" }, "ꦧꦼ"), " = BÊ, ", h("span", { style: { fontFamily: "Noto Sans Javanese" }, key: "ex4" }, "ꦧꦺ"), " = BÉ.", h("br", { key: "br2" }),
                  "RÊ dan LÊ punya pasangan sandhangan: ", h("span", { style: { fontFamily: "Noto Sans Javanese" }, key: "ex5" }, "ꦉꦶ ꦊꦸ ꦉꦺꦴ"), " dll."
                ])
              ])
        ]),

        h("div", { className: "card", style: { background: "#3e2723", color: "#ffecb3", borderColor: "#271c19" }, key: "card4" }, [
          h("h3", { style: { color: "#ffcc80" }, key: "title" }, "🕹️ CARA MAIN"),
          h("div", { style: { fontSize: 12, lineHeight: 1.6 }, key: "body" }, [
            "1. Lihat huruf di meriam (contoh ", h("b", { key: "b1" }, "NGÊNG = ꦔꦼꦁ"), ")", h("br", { key: "br1" }),
            "2. Geser meriam pakai tangan kiri (drag / slider).", h("br", { key: "br2" }),
            "3. Tembak dengan tombol kanan / Spacebar.", h("br", { key: "br3" }),
            "4. Tembak aksara Jawa yang tepat di atas. Salah = -5 & nyawa -1."
          ])
        ])
      ])
    ]),

    h("div", { key: "footer", style: { fontSize: 10, color: "#8d6e63", padding: "10px 0 24px", letterSpacing: "0.06em" } },
      "Dibuat dengan paugeran Mardikawi • Noto Sans Javanese • Bedhil Cetbang Jawa"
    )
  ]);
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(h(BedhilAksaraJawaGame));
}
