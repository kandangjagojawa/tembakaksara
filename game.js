import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  createQuestion,
  generateTargets,
  shuffleArray,
  generateTargetPositions,
  getRandomPosition
} from "./jawa-transliteration.js";

export function BedhilAksaraJawaGame() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [targetMode, setTargetMode] = useState("jatuh"); // 'jatuh' | 'ganti'
  
  const [currentQuestion, setCurrentQuestion] = useState(() => createQuestion(1));
  const [targets, setTargets] = useState(() => generateTargets(createQuestion(1), 1));
  const [cannonX, setCannonX] = useState(50);
  const [projectiles, setProjectiles] = useState([]);
  
  const [gameOver, setGameOver] = useState(false);
  const [showPaugeran, setShowPaugeran] = useState(false);
  const [wrongCounts, setWrongCounts] = useState({});
  const [hitEffect, setHitEffect] = useState(null);
  
  const [isRecoil, setIsRecoil] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  // Refs untuk mencegah Re-render loop dan Re-binding listener
  const gameAreaRef = useRef(null);
  const targetsRef = useRef(targets);
  const cannonXRef = useRef(cannonX);
  const isDraggingRef = useRef(false);
  const hitCorrectRef = useRef(() => {});
  const hitWrongRef = useRef(() => {});

  useEffect(() => {
    targetsRef.current = targets;
  }, [targets]);

  useEffect(() => {
    cannonXRef.current = cannonX;
  }, [cannonX]);

  // Inisialisasi Soal Pertama
  useEffect(() => {
    const q = createQuestion(level);
    setCurrentQuestion(q);
    setTargets(generateTargets(q, level));
  }, []);

  // Handler jika tembakan BENAR
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

    setIsShuffling(true);

    // Tandai target yang kena jatuh
    setTargets((prev) =>
      prev.map((t) => (t.id === hitTarget.id ? { ...t, falling: true } : { ...t, shuffling: true }))
    );

    setTimeout(() => {
      const activeLevel = level + (score > 50 ? 1 : 0) > 4 ? 4 : level;
      const nextQ = createQuestion(activeLevel);
      setCurrentQuestion(nextQ);

      if (targetMode === "ganti") {
        const newTargets = generateTargets(nextQ, activeLevel);
        const shuffled = shuffleArray(newTargets);
        const pos = generateTargetPositions();
        setTargets(shuffled.map((item, i) => ({ ...item, x: pos[i], falling: false })));
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

      setCannonX(getRandomPosition());

      setTimeout(() => {
        setIsShuffling(false);
        setTargets((prev) => prev.map((item) => ({ ...item, shuffling: false })));
      }, 380);
    }, 300);
  }, [level, targetMode, score]);

  // Handler jika tembakan SALAH
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

  // OPTIMISASI GAME LOOP (Mencegah Kebocoran Memori & Re-render 60 FPS saat diam)
  useEffect(() => {
    if (projectiles.length === 0) return; // Dormant/Mati jika tidak ada peluru

    let animId;
    const updatePhysics = () => {
      const hits = [];

      setProjectiles((prevProjectiles) => {
        const remaining = [];
        for (let proj of prevProjectiles) {
          const nextY = proj.y + 3.4;
          if (nextY > 82) {
            const targetHit = targetsRef.current.find(
              (t) => !t.falling && Math.abs(t.x - proj.x) < 11
            );
            if (targetHit) {
              hits.push(targetHit);
              continue; // Hapus peluru yang kena target
            }
            if (nextY > 96) continue; // Hapus peluru lewat batas atas
          }
          if (nextY <= 96) {
            remaining.push({ ...proj, y: nextY });
          }
        }
        return remaining;
      });

      // Proses efek tabrakan di luar updater state
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

  // Aksi Menembak Peluru
  const shoot = useCallback(() => {
    if (gameOver) return;
    const bulletId = Math.random().toString(36).slice(2, 8);
    setIsRecoil(true);
    setTimeout(() => setIsRecoil(false), 180);

    setProjectiles((prev) => [...prev, { id: bulletId, x: cannonXRef.current, y: 26 }]);
  }, [gameOver]);

  // Listener Keyboard (Hanya dipasang sekali)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        shoot();
      }
      if (e.code === "ArrowLeft") {
        setCannonX((prev) => Math.max(5, prev - 6));
      }
      if (e.code === "ArrowRight") {
        setCannonX((prev) => Math.min(95, prev + 6));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shoot]);

  // Pointer / Drag Slider Handlers
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
    setCannonX(Math.max(6, Math.min(94, percent)));
  };

  const changeQuestion = () => {
    const q = createQuestion(level);
    setCurrentQuestion(q);
    setTargets(generateTargets(q, level));
    setCannonX(getRandomPosition());
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
    setCannonX(50);
    setIsShuffling(false);
  };

  const topWrongList = Object.entries(wrongCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="app-root">
      <style>{`
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
          position: absolute; inset:0; opacity:0.07;
          background-image:
            repeating-linear-gradient(45deg, #5d4037 0 1px, transparent 1px 12px),
            repeating-linear-gradient(-45deg, #8d6e63 0 1px, transparent 1px 18px);
          pointer-events:none;
        }
        .header {
          width:100%; max-width:1100px;
          display:flex; justify-space-between; align-items:center;
          padding: 14px 18px; background: #3e2723; color:#ffecb3;
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
        .target-box.falling { transform: translateX(-50%) translateY(380px) rotate(22deg) scale(0.7); opacity:0; }
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
          transition: left 0.12s cubic-bezier(.2,.8,.2,1); z-index:6; pointer-events:none; filter: drop-shadow(0 12px 10px rgba(0,0,0,0.25));
        }
        .cannon-wrap.recoil { animation: recoil 0.18s ease; }
        .cannon-wrap.jump { transition: left 0.38s cubic-bezier(.34,1.56,.64,1); }
        @keyframes recoil { 0%{ transform:translateX(-50%) translateY(0) rotate(0)} 35%{ transform:translateX(-50%) translateY(6px) rotate(-1.2deg)} 100%{ transform:translateX(-50%) translateY(0) rotate(0)} }
        .cannon-shadow { position:absolute; bottom:14px; left:50%; transform:translateX(-50%); width:120px; height:18px; background: radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, transparent 70%); z-index:0; border-radius:50%; }
        .laser {
          position:absolute; bottom:130px; width:2px; top:90px; transform: translateX(-50%);
          background: repeating-linear-gradient(180deg, rgba(255,235,59,0.9) 0 10px, transparent 10px 18px);
          box-shadow: 0 0 8px rgba(255,235,59,0.8), 0 0 18px rgba(255,111,0,0.6); z-index:4; pointer-events:none; transition: left 0.12s cubic-bezier(.2,.8,.2,1);
        }
        .laser::after { content:""; position:absolute; top:-10px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-bottom:10px solid #ffeb3b; filter: drop-shadow(0 0 6px #ffeb3b); }
        .position-arrow { position:absolute; bottom:50px; width:0; height:0; border-left:10px solid transparent; border-right:10px solid transparent; border-bottom:12px solid #ff6f00; transform: translateX(-50%); filter: drop-shadow(0 2px 2px rgba(0,0,0,0.4)); transition: left 0.12s cubic-bezier(.2,.8,.2,1); z-index:7; }
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
      `}</style>

      {/* HEADER BAR */}
      <div className="header">
        <div className="brand">
          <div className="latin">BEDHIL AKSARA JAWA</div>
          <div className="jawa">ꦧꦼꦝꦶꦭ꧀ ꦲꦏ꧀ꦱꦫ ꦗꦮ</div>
        </div>
        <div className="stats">
          <div className="stat-pill">⭐ {score}</div>
          <div className="stat-pill">Lv {level}</div>
          <div className="stat-pill hearts">
            {"❤".repeat(hearts) + "♡".repeat(3 - hearts)}
          </div>
        </div>
      </div>

      {/* MAIN GAME SHELL */}
      <div className="game-shell">
        <div className="game-area" ref={gameAreaRef}>
          <div className="batik" />
          <div className="field-top">
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 90, background: "linear-gradient(180deg, transparent, rgba(93,64,55,0.18))", pointerEvents: "none" }} />
            
            {/* TARGET ROW */}
            <div className="target-row">
              {targets.map((t) => (
                <div
                  key={t.id}
                  className={`target-box ${t.falling ? "falling" : ""} ${t.shaking ? "shaking" : ""} ${t.shuffling || isShuffling ? "shuffling" : ""}`}
                  style={{ left: `${t.x}%`, animationDelay: `${(t.x % 7) * 0.2}s` }}
                >
                  {t.jawa}
                </div>
              ))}
              {hitEffect && (
                <div className="hit-effect" style={{ left: `${hitEffect.x}%`, top: `${hitEffect.y}%` }}>
                  {hitEffect.text}
                </div>
              )}
              <div className={`shuffle-indicator ${isShuffling ? "show" : ""}`}>
                🔀 ACAK POSISI...
              </div>
            </div>

            {/* LASER GUIDELINE */}
            <div
              className="laser"
              style={{
                left: `${cannonX}%`,
                transition: isShuffling ? "left 0.38s cubic-bezier(.34,1.56,.64,1)" : "left 0.12s cubic-bezier(.2,.8,.2,1)"
              }}
            />

            {/* PROJECTILES */}
            {projectiles.map((p) => (
              <div key={p.id} className="projectile" style={{ left: `${p.x}%`, bottom: `${p.y}%` }}>
                {currentQuestion.latin.slice(0, 2)}
              </div>
            ))}

            <div
              className="position-arrow"
              style={{
                left: `${cannonX}%`,
                transition: isShuffling ? "left 0.38s cubic-bezier(.34,1.56,.64,1)" : "left 0.12s cubic-bezier(.2,.8,.2,1)"
              }}
            />
          </div>

          {/* CANNON STAGE */}
          <div className="cannon-stage">
            <div className="rail">
              {Array.from({ length: 20 }).map((_, idx) => (
                <div key={idx} className={`rail-tick ${idx % 5 === 0 ? "big" : ""}`} />
              ))}
            </div>
            <div
              className={`cannon-wrap ${isRecoil ? "recoil" : ""} ${isShuffling ? "jump" : ""}`}
              style={{
                left: `${cannonX}%`,
                transition: isShuffling ? "left 0.38s cubic-bezier(.34,1.56,.64,1)" : "left 0.12s cubic-bezier(.2,.8,.2,1)"
              }}
            >
              <div className="cannon-shadow" />
              <div className="cannon-visual">
                <div className="cannon-mouth">
                  <div className="muzzle-flash" />
                </div>
                <div className="cannon-body">
                  <div className="plaque">
                    <div className="plaque-latin">{currentQuestion.latin}</div>
                  </div>
                </div>
                <div className="cannon-wheels">
                  <div className="wheel" />
                  <div className="wheel" />
                </div>
              </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="controls">
            <div
              className="control-box"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <div className="control-label">
                <span>GESER DI REL — {Math.round(cannonX)}%</span>
                <span>◀▶ POSISI</span>
              </div>
              <div className="slider-track">
                <div className="slider-fill" style={{ width: `${cannonX}%` }} />
                <div className="slider-ticks">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <span key={i} />
                  ))}
                </div>
                <div className="slider-thumb" style={{ left: `${cannonX}%` }}>
                  ↔
                </div>
              </div>
            </div>

            <div className="control-box">
              <div className="control-label">
                <span>TEMBAK! (Kanan)</span>
                <span>⎵ SPACE</span>
              </div>
              <button className="shoot-btn" onPointerDown={shoot} onClick={shoot}>
                <span>💥</span> TEMBAK {currentQuestion.latin}!
              </button>
            </div>
          </div>

          {/* OVERLAY GAME OVER */}
          {gameOver && (
            <div className="overlay">
              <div className="modal">
                <div className="jawa-title">ꦒꦩꦺ ꦎꦮ꦳ꦼꦂ</div>
                <h2 style={{ margin: "8px 0 4px" }}>Game Over!</h2>
                <div style={{ fontSize: 32, fontWeight: 800 }}>{score} poin</div>
                <div style={{ fontSize: 13, color: "#8d6e63", marginTop: 6 }}>
                  Level tercapai: {level}
                </div>
                {topWrongList.length > 0 && (
                  <div style={{ textAlign: "left", marginTop: 14, background: "#fff3e0", borderRadius: 12, padding: 10, border: "1px solid #d7ccc8" }}>
                    <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 6 }}>SERING SALAH:</div>
                    {topWrongList.map(([key, count]) => (
                      <div key={key} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: "1px dashed #d7ccc8" }}>
                        <span style={{ fontFamily: "Noto Sans Javanese" }}>{key}</span>
                        <span>×{count}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button className="btn-primary" onClick={restartGame}>
                  MAIN LAGI
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SIDE PANEL */}
        <div className="side-panel">
          <div className="card">
            <h3>🎯 MODE GANTI KOTAK</h3>
            <div className="toggle-row">
              <button
                className={`toggle-btn ${targetMode === "jatuh" ? "active" : ""}`}
                onClick={() => setTargetMode("jatuh")}
              >
                JATUHKAN SAJA
              </button>
              <button
                className={`toggle-btn ${targetMode === "ganti" ? "active" : ""}`}
                onClick={() => setTargetMode("ganti")}
              >
                GANTI SEMUA
              </button>
            </div>
            <div style={{ fontSize: 11, color: "#8d6e63", marginTop: 8, lineHeight: 1.4 }}>
              {targetMode === "jatuh"
                ? "Kotak benar jatuh, diganti baru, lalu SEMUA kotak di-shuffle Fisher-Yates + meriam loncat acak 10-90%. Wajib geser lagi!"
                : "5 kotak baru, diacak posisi pakai Fisher-Yates + jitter, meriam juga loncat acak. Jawaban bisa kiri/tengah/kanan."}
            </div>
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>📻 LEVEL</h3>
              <button
                className="btn-secondary"
                style={{ width: "auto", marginTop: 0, padding: "6px 10px", fontSize: 11 }}
                onClick={changeQuestion}
              >
                GANTI SOAL
              </button>
            </div>
            <div className="level-dots" style={{ marginTop: 8 }}>
              {[1, 2, 3, 4].map((lvl) => (
                <div
                  key={lvl}
                  className={`dot ${level === lvl ? "active" : ""}`}
                  onClick={() => {
                    setLevel(lvl);
                    const q = createQuestion(lvl);
                    setCurrentQuestion(q);
                    setTargets(generateTargets(q, lvl));
                  }}
                >
                  {lvl}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, marginTop: 8, lineHeight: 1.4, color: "#5d4037" }}>
              {level === 1 && "Level 1: hanya A, I, U – tanpa cecak/layar."}
              {level === 2 && "Level 2: tambah Ê pepet ꦼ, É taling ꦺ, O ꦺꦴ."}
              {level === 3 && "Level 3: tambah NG ꦁ (cecak), R ꦂ (layar), H ꦃ (wignyan)."}
              {level === 4 && "Level 4: semua + RÊ ꦉ & LÊ ꦊ (pa cerek & nga lelet)."}
            </div>
            <div style={{ marginTop: 10, background: "#efebe9", borderRadius: 10, padding: 8, fontSize: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 10, letterSpacing: "0.08em", marginBottom: 4 }}>
                SAAT INI DITEMBAK:
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: 22 }}>{currentQuestion.latin}</span>
                <span style={{ fontSize: 10, background: "#3e2723", color: "#ffecb3", padding: "4px 8px", borderRadius: 999, fontWeight: 700 }}>
                  CARI DI ATAS!
                </span>
              </div>
              <div style={{ fontSize: 10, color: "#8d6e63", marginTop: 4 }}>
                {currentQuestion.cons} + {currentQuestion.vowel} + {currentQuestion.suffix || "∅"} → ?
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>📜 PAUGERAN</h3>
              <button
                onClick={() => setShowPaugeran((prev) => !prev)}
                style={{ border: 0, background: "#3e2723", color: "#ffecb3", borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >
                {showPaugeran ? "TUTUP" : "BUKA"}
              </button>
            </div>
            {!showPaugeran ? (
              <div style={{ fontSize: 12, lineHeight: 1.5, color: "#5d4037" }}>
                Bedakan <b>Ê pepet ꦼ</b> vs <b>É taling ꦺ</b>. RÊ ꦉ dan LÊ ꦊ adalah aksara mandiri, bukan Ra/La + pepet.
              </div>
            ) : (
              <div style={{ marginTop: 10 }}>
                <div className="paugeran-grid">
                  <div className="paugeran-item"><span>pepet Ê</span><b>ꦼ</b></div>
                  <div className="paugeran-item"><span>taling É</span><b>ꦺ</b></div>
                  <div className="paugeran-item"><span>taling-tarung O</span><b>ꦺꦴ</b></div>
                  <div className="paugeran-item"><span>wulu I</span><b>ꦶ</b></div>
                  <div className="paugeran-item"><span>suku U</span><b>ꦸ</b></div>
                  <div className="paugeran-item"><span>cecak NG</span><b>ꦁ</b></div>
                  <div className="paugeran-item"><span>layar R</span><b>ꦂ</b></div>
                  <div className="paugeran-item"><span>wignyan H</span><b>ꦃ</b></div>
                  <div className="paugeran-item" style={{ background: "#ffecb3" }}><span>pa cerek RÊ</span><b>ꦉ</b></div>
                  <div className="paugeran-item" style={{ background: "#ffecb3" }}><span>nga lelet LÊ</span><b>ꦊ</b></div>
                </div>
                <div style={{ fontSize: 11, marginTop: 10, lineHeight: 1.5, background: "#fff8e1", padding: 8, borderRadius: 10, border: "1px solid #ffe0b2" }}>
                  <b>Urutan:</b> Aksara pokok + sandhangan swara + panyigeg.<br />
                  Contoh: <span style={{ fontFamily: "Noto Sans Javanese" }}>ꦏꦁ</span> = Ka + cecak = KANG, <span style={{ fontFamily: "Noto Sans Javanese" }}>ꦏꦶꦁ</span> = Ki + cecak = KING, <span style={{ fontFamily: "Noto Sans Javanese" }}>ꦧꦼ</span> = BÊ, <span style={{ fontFamily: "Noto Sans Javanese" }}>ꦧꦺ</span> = BÉ.<br />
                  RÊ dan LÊ punya pasangan sandhangan: <span style={{ fontFamily: "Noto Sans Javanese" }}>ꦉꦶ ꦊꦸ ꦉꦺꦴ</span> dll.
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ background: "#3e2723", color: "#ffecb3", borderColor: "#271c19" }}>
            <h3 style={{ color: "#ffcc80" }}>🕹️ CARA MAIN</h3>
            <div style={{ fontSize: 12, lineHeight: 1.6 }}>
              1. Lihat huruf di meriam (contoh <b>NGÊNG = ꦔꦼꦁ</b>)<br />
              2. Geser meriam pakai tangan kiri (drag / slider).<br />
              3. Tembak dengan tombol kanan / Spacebar.<br />
              4. Tembak aksara Jawa yang tepat di atas. Salah = -5 & nyawa -1.
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 10, color: "#8d6e63", padding: "10px 0 24px", letterSpacing: "0.06em" }}>
        Dibuat dengan paugeran Mardikawi • Noto Sans Javanese • Bedhil Cetbang Jawa
      </div>
    </div>
  );
}

// Render Aplikasi ke DOM
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<BedhilAksaraJawaGame />);
}
