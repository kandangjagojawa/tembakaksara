import React, { useState, useEffect, useRef, useCallback } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";

const h = React.createElement;

// DATA & FUNGSI TRANSLITERASI (Eksplisit dari File Asli)
export const AKSARA_POKOK = {
  h: "ꦲ", n: "ꦤ", c: "ꦕ", r: "ꦫ", k: "ꦏ",
  d: "ꦢ", t: "ꦠ", s: "ꦱ", w: "ꦮ", l: "ꦭ",
  p: "ꦥ", dh: "ꦝ", j: "ꦗ", y: "ꦪ", m: "ꦩ",
  g: "ꦒ", b: "ꦧ", th: "ꦛ", ng: "ꦔ", ny: "ꦚ"
};

export const AKSARA_KHUSUS = { "rê": "ꦉ", "lê": "ꦊ" };
export const SANDHANGAN_SWARA = { a: "", i: "ꦶ", u: "ꦸ", "ê": "ꦼ", "é": "ꦺ", "è": "ꦺ", o: "ꦺꦴ" };
export const PANYIGEG_WANDA = { "": "", ng: "ꦁ", r: "ꦂ", h: "ꦃ" };
export const VOWEL_CAPITALS = { a: "A", i: "I", u: "U", "ê": "Ê", "é": "É", "è": "È", o: "O" };

export function toJavaneseScript(cons, vowel, suffix) {
  let base = AKSARA_KHUSUS[cons] ?? AKSARA_POKOK[cons] ?? "ꦏ";
  let sandhangan = SANDHANGAN_SWARA[vowel] ?? "";
  let panyigeg = PANYIGEG_WANDA[suffix] ?? "";
  return base + sandhangan + panyigeg;
}

export function toLatinText(cons, vowel, suffix) {
  let baseUpper;
  if (cons === "rê") baseUpper = "RÊ";
  else if (cons === "lê") baseUpper = "LÊ";
  else baseUpper = cons.toUpperCase();

  if (cons === "rê" || cons === "lê") {
    if (vowel === "a" || vowel === "ê") {
      return baseUpper + (suffix ? VOWEL_CAPITALS[suffix] ?? suffix.toUpperCase() : "").replace("NG", "").replace("R", "").replace("H", "") + (suffix ? (suffix === "ng" ? "NG" : suffix === "r" ? "R" : suffix === "h" ? "H" : "") : "");
    }
    let vowelPart = vowel === "a" ? "" : VOWEL_CAPITALS[vowel] ?? vowel.toUpperCase();
    let suffixPart = suffix ? (suffix === "ng" ? "NG" : suffix === "r" ? "R" : suffix === "h" ? "H" : suffix.toUpperCase()) : "";
    if (vowel === "ê") return baseUpper + suffixPart;
    return baseUpper + vowelPart + suffixPart;
  }

  let vowelPart = VOWEL_CAPITALS[vowel] ?? vowel.toUpperCase();
  let suffixPart = suffix ? (suffix === "ng" ? "NG" : suffix === "r" ? "R" : suffix === "h" ? "H" : "") : "";
  return baseUpper + vowelPart + suffixPart;
}

export function getQuestionElements(level) {
  let vowels = [], suffixes = [], consonants = Object.keys(AKSARA_POKOK);
  if (level === 1) { vowels = ["a", "i", "u"]; suffixes = [""]; }
  else if (level === 2) { vowels = ["a", "i", "u", "ê", "é", "o"]; suffixes = [""]; }
  else if (level === 3) { vowels = ["a", "i", "u", "ê", "é", "è", "o"]; suffixes = ["", "ng", "r", "h"]; }
  else { vowels = ["a", "i", "u", "ê", "é", "è", "o"]; suffixes = ["", "ng", "r", "h"]; consonants = [...consonants, "rê", "lê"]; }
  return { vowels, suffixes, cons: consonants };
}

export function getRandomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function shuffleArray(arr) {
  let result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = result[i]; result[i] = result[j]; result[j] = temp;
  }
  return result;
}

export function generateTargetPositions() {
  return [11, 31, 50, 69, 89].map((t) => {
    let offset = (Math.random() - 0.5) * 10;
    return Math.max(7, Math.min(93, t + offset));
  });
}

export function getRandomPosition() { return 10 + Math.random() * 80; }

export function createQuestion(level, consOverride = null) {
  let elements = getQuestionElements(level);
  let cons = consOverride ?? getRandomElement(elements.cons);
  let vowel = getRandomElement(elements.vowels);
  let suffix = getRandomElement(elements.suffixes);
  return {
    id: Math.random().toString(36).slice(2, 8),
    cons, vowel, suffix,
    jawa: toJavaneseScript(cons, vowel, suffix),
    latin: toLatinText(cons, vowel, suffix)
  };
}

export function generateTargets(question, level) {
  let elements = getQuestionElements(level);
  let list = [{ ...question, isCorrect: true, x: 0 }];
  let attempts = 0;

  while (list.length < 5 && attempts < 100) {
    attempts++;
    let c, v, s;
    if (Math.random() < 0.7) {
      c = question.cons;
      v = getRandomElement(elements.vowels);
      s = getRandomElement(elements.suffixes);
    } else {
      c = getRandomElement(elements.cons.filter((item) => item !== question.cons));
      v = getRandomElement(elements.vowels);
      s = getRandomElement(elements.suffixes);
    }

    let jawaScript = toJavaneseScript(c, v, s);
    if (jawaScript === question.jawa) continue;
    if (list.some((item) => item.jawa === jawaScript)) continue;

    let latinText = toLatinText(c, v, s);
    list.push({
      id: Math.random().toString(36).slice(2, 8),
      cons: c, vowel: v, suffix: s,
      jawa: jawaScript, latin: latinText,
      isCorrect: false, x: 0
    });
  }

  let shuffled = shuffleArray(list);
  let positions = generateTargetPositions();
  return shuffled.map((item, idx) => ({ ...item, x: positions[idx] }));
}

// KOMPONEN UTAMA GAME
export function BedhilAksaraJawaGame() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [targetMode, setTargetMode] = useState("jatuh");

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

  const gameAreaRef = useRef(null);
  const targetsRef = useRef(targets);
  const projectilesRef = useRef(projectiles);
  const animFrameRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => { targetsRef.current = targets; }, [targets]);
  useEffect(() => { projectilesRef.current = projectiles; }, [projectiles]);

  useEffect(() => {
    let q = createQuestion(level);
    setCurrentQuestion(q);
    setTargets(generateTargets(q, level));
  }, []);

  const hitCorrectRef = useRef(() => {});
  const hitWrongRef = useRef(() => {});

  const handleHitCorrect = useCallback((hitTarget) => {
    setScore((prevScore) => {
      let nextScore = prevScore + 10;
      if (nextScore >= 50 && level === 1) setLevel(2);
      else if (nextScore >= 120 && level === 2) setLevel(3);
      else if (nextScore >= 220 && level === 3) setLevel(4);
      return nextScore;
    });

    setHitEffect({ x: hitTarget.x, y: 22, text: "+10" });
    setTimeout(() => setHitEffect(null), 600);

    setIsShuffling(true);
    setTargets((prevTargets) =>
      prevTargets.map((item) =>
        item.id === hitTarget.id ? { ...item, falling: true } : { ...item, shuffling: true }
      )
    );

    setTimeout(() => {
      let activeLevel = level + (score > 50 ? 1 : 0) > 4 ? 4 : level;
      let nextQ = createQuestion(activeLevel);
      setCurrentQuestion(nextQ);

      if (targetMode === "ganti") {
        let newTargets = generateTargets(nextQ, activeLevel);
        let shuffledNew = shuffleArray(newTargets);
        let pos = generateTargetPositions();
        setTargets(shuffledNew.map((item, idx) => ({ ...item, x: pos[idx], falling: false })));
      } else {
        setTargets((prevTargets) => {
          let remaining = prevTargets
            .filter((item) => item.id !== hitTarget.id && !item.falling)
            .filter((item) => item.jawa !== nextQ.jawa);

          let dummyList = [];
          while (remaining.length + dummyList.length < 4) {
            let candidate = createQuestion(activeLevel);
            if (candidate.jawa === nextQ.jawa) continue;
            if (remaining.some((item) => item.jawa === candidate.jawa)) continue;
            if (dummyList.some((item) => item.jawa === candidate.jawa)) continue;
            dummyList.push({ ...candidate, isCorrect: false, x: 0 });
          }

          let combined = [
            ...[...remaining, ...dummyList].slice(0, 4),
            { ...nextQ, isCorrect: true, x: 0 }
          ];

          let shuffledCombined = shuffleArray(combined);
          let posCombined = generateTargetPositions();
          return shuffledCombined.map((item, idx) => ({ ...item, x: posCombined[idx], falling: false }));
        });
      }

      setCannonX(getRandomPosition());

      setTimeout(() => {
        setIsShuffling(false);
        setTargets((prevTargets) => prevTargets.map((item) => ({ ...item, shuffling: false })));
      }, 380);
    }, 300);
  }, [level, targetMode, score]);

  const handleHitWrong = useCallback((hitTarget) => {
    setTargets((prevTargets) =>
      prevTargets.map((item) => (item.id === hitTarget.id ? { ...item, shaking: true } : item))
    );

    setTimeout(() => {
      setTargets((prevTargets) =>
        prevTargets.map((item) => ({ ...item, shaking: false }))
      );
    }, 400);

    setScore((prevScore) => Math.max(0, prevScore - 5));
    setHearts((prevHearts) => {
      let nextHearts = prevHearts - 1;
      if (nextHearts <= 0) setGameOver(true);
      return nextHearts;
    });

    setWrongCounts((prev) => {
      let key = currentQuestion.latin + " → " + currentQuestion.jawa;
      return { ...prev, [key]: (prev[key] ?? 0) + 1 };
    });

    setHitEffect({ x: hitTarget.x, y: 26, text: "-5" });
    setTimeout(() => setHitEffect(null), 600);
  }, [currentQuestion]);

  useEffect(() => {
    hitCorrectRef.current = handleHitCorrect;
    hitWrongRef.current = handleHitWrong;
  }, [handleHitCorrect, handleHitWrong]);

  // OPTIMISASI RAM: Loop Peluru Fisika menggunakan cancelAnimationFrame bersih
  useEffect(() => {
    const updatePhysics = () => {
      setProjectiles((prevProjectiles) => {
        let moved = prevProjectiles.map((p) => ({ ...p, y: p.y + 3.4 }));
        let remaining = [];

        for (let p of moved) {
          if (p.y > 82) {
            let hitTarget = targetsRef.current.find(
              (t) => !t.falling && Math.abs(t.x - p.x) < 11
            );

            if (hitTarget) {
              if (hitTarget.isCorrect) hitCorrectRef.current(hitTarget);
              else hitWrongRef.current(hitTarget);
              continue; // Peluru hilang begitu menumbuk target
            }

            if (p.y > 96) continue; // Peluru hilang jika lewat batas atas
          }

          if (p.y <= 96) remaining.push(p);
        }

        return remaining;
      });

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const shoot = useCallback(() => {
    if (gameOver) return;
    let bulletId = Math.random().toString(36).slice(2, 8);
    setIsRecoil(true);
    setTimeout(() => setIsRecoil(false), 180);
    setProjectiles((prev) => [...prev, { id: bulletId, x: cannonX, y: 26 }]);
  }, [cannonX, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") { e.preventDefault(); shoot(); }
      if (e.code === "ArrowLeft") setCannonX((prev) => Math.max(5, prev - 6));
      if (e.code === "ArrowRight") setCannonX((prev) => Math.min(95, prev + 6));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shoot]);

  const updateCannonPosition = (clientX) => {
    if (!gameAreaRef.current) return;
    let rect = gameAreaRef.current.getBoundingClientRect();
    let percent = ((clientX - rect.left) / rect.width) * 100;
    setCannonX(Math.max(6, Math.min(94, percent)));
  };

  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    e.target.setPointerCapture(e.pointerId);
    updateCannonPosition(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    updateCannonPosition(e.clientX);
  };

  const handlePointerUp = () => { isDraggingRef.current = false; };

  const changeQuestion = () => {
    let q = createQuestion(level);
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
    let q = createQuestion(1);
    setCurrentQuestion(q);
    setTargets(generateTargets(q, 1));
    setProjectiles([]);
    setCannonX(50);
    setIsShuffling(false);
  };

  const topWrongList = Object.entries(wrongCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return h("div", { className: "app-root" }, [
    // HEADER BAR
    h("div", { className: "header", key: "hdr" }, [
      h("div", { className: "brand", key: "brd" }, [
        h("div", { className: "latin", key: "l" }, "BEDHIL AKSARA JAWA"),
        h("div", { className: "jawa", key: "j" }, "ꦧꦼꦝꦶꦭ꧀ ꦲꦏ꧀ꦱꦫ ꦗꦮ")
      ]),
      h("div", { className: "stats", key: "st" }, [
        h("div", { className: "stat-pill", key: "s" }, "⭐ ", score),
        h("div", { className: "stat-pill", key: "lv" }, "Lv ", level),
        h("div", { className: "stat-pill hearts", key: "h" }, "❤".repeat(hearts) + "♡".repeat(3 - hearts))
      ])
    ]),

    // GAME SHELL
    h("div", { className: "game-shell", key: "shl" }, [
      h("div", { className: "game-area", ref: gameAreaRef, key: "ga" }, [
        h("div", { className: "batik", key: "btk" }),
        h("div", { className: "field-top", key: "ft" }, [
          h("div", { style: { position: "absolute", bottom: 0, left: 0, right: 0, height: 90, background: "linear-gradient(180deg, transparent, rgba(93,64,55,0.18))", pointerEvents: "none" }, key: "bg" }),
          
          // TARGET ROW
          h("div", { className: "target-row", key: "tr" }, [
            targets.map((item) =>
              h("div", {
                key: item.id,
                className: `target-box ${item.falling ? "falling" : ""} ${item.shaking ? "shaking" : ""} ${item.shuffling || isShuffling ? "shuffling" : ""}`,
                style: { left: `${item.x}%`, animationDelay: `${(item.x % 7) * 0.2}s` }
              }, item.jawa)
            ),
            hitEffect && h("div", { className: "hit-effect", style: { left: `${hitEffect.x}%`, top: `${hitEffect.y}%` }, key: "he" }, hitEffect.text),
            h("div", { className: `shuffle-indicator ${isShuffling ? "show" : ""}`, key: "si" }, "🔀 ACAK POSISI...")
          ]),

          // LASER
          h("div", { className: "laser", style: { left: `${cannonX}%`, transition: isShuffling ? "left 0.38s cubic-bezier(.34,1.56,.64,1)" : "left 0.12s cubic-bezier(.2,.8,.2,1)" }, key: "lsr" }),

          // PROJECTILES
          projectiles.map((p) =>
            h("div", { className: "projectile", style: { left: `${p.x}%`, bottom: `${p.y}%` }, key: p.id }, currentQuestion.latin.slice(0, 2))
          ),

          // POSITION ARROW
          h("div", { className: "position-arrow", style: { left: `${cannonX}%`, transition: isShuffling ? "left 0.38s cubic-bezier(.34,1.56,.64,1)" : "left 0.12s cubic-bezier(.2,.8,.2,1)" }, key: "pa" })
        ]),

        // CANNON STAGE
        h("div", { className: "cannon-stage", key: "cs" }, [
          h("div", { className: "rail", key: "rl" },
            Array.from({ length: 20 }).map((_, idx) => h("div", { className: `rail-tick ${idx % 5 === 0 ? "big" : ""}`, key: idx }))
          ),
          h("div", {
            className: `cannon-wrap ${isRecoil ? "recoil" : ""} ${isShuffling ? "jump" : ""}`,
            style: { left: `${cannonX}%`, transition: isShuffling ? "left 0.38s cubic-bezier(.34,1.56,.64,1)" : "left 0.12s cubic-bezier(.2,.8,.2,1)" },
            key: "cw"
          }, [
            h("div", { className: "cannon-shadow", key: "sh" }),
            h("div", { className: "cannon-visual", key: "cv" }, [
              h("div", { className: "cannon-mouth", key: "cm" }, h("div", { className: "muzzle-flash" })),
              h("div", { className: "cannon-body", key: "cb" },
                h("div", { className: "plaque" },
                  h("div", { className: "plaque-latin" }, currentQuestion.latin)
                )
              ),
              h("div", { className: "cannon-wheels", key: "cw2" }, [
                h("div", { className: "wheel", key: "w1" }),
                h("div", { className: "wheel", key: "w2" })
              ])
            ])
          ])
        ]),

        // CONTROLS
        h("div", { className: "controls", key: "ctrls" }, [
          h("div", {
            className: "control-box",
            onPointerDown: handlePointerDown,
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerUp,
            onPointerLeave: handlePointerUp,
            key: "cb1"
          }, [
            h("div", { className: "control-label", key: "cl1" }, [
              h("span", { key: "s1" }, "GESER DI REL — ", Math.round(cannonX), "%"),
              h("span", { key: "s2" }, "◀▶ POSISI")
            ]),
            h("div", { className: "slider-track", key: "st" }, [
              h("div", { className: "slider-fill", style: { width: `${cannonX}%` }, key: "sf" }),
              h("div", { className: "slider-ticks", key: "stk" }, Array.from({ length: 9 }).map((_, idx) => h("span", { key: idx }))),
              h("div", { className: "slider-thumb", style: { left: `${cannonX}%` }, key: "sth" }, "↔")
            ])
          ]),

          h("div", { className: "control-box", key: "cb2" }, [
            h("div", { className: "control-label", key: "cl2" }, [
              h("span", { key: "s1" }, "TEMBAK! (Kanan)"),
              h("span", { key: "s2" }, "⎵ SPACE")
            ]),
            h("button", { className: "shoot-btn", onPointerDown: shoot, onClick: shoot, key: "sb" }, [
              h("span", { key: "b" }, "💥"), " TEMBAK ", currentQuestion.latin, "!"
            ])
          ])
        ]),

        // OVERLAY GAME OVER
        gameOver && h("div", { className: "overlay", key: "go" },
          h("div", { className: "modal" }, [
            h("div", { className: "jawa-title", key: "jt" }, "ꦒꦩꦺ ꦎꦮ꦳ꦼꦂ"),
            h("h2", { style: { margin: "8px 0 4px" }, key: "h2" }, "Game Over!"),
            h("div", { style: { fontSize: 32, fontWeight: 800 }, key: "sc" }, score, " poin"),
            h("div", { style: { fontSize: 13, color: "#8d6e63", marginTop: 6 }, key: "lv" }, "Level tercapai: ", level),
            topWrongList.length > 0 && h("div", { style: { textAlign: "left", marginTop: 14, background: "#fff3e0", borderRadius: 12, padding: 10, border: "1px solid #d7ccc8" }, key: "wl" }, [
              h("div", { style: { fontWeight: 800, fontSize: 12, marginBottom: 6 }, key: "wlt" }, "SERING SALAH:"),
              topWrongList.map(([k, val]) =>
                h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: "1px dashed #d7ccc8" }, key: k }, [
                  h("span", { style: { fontFamily: "Noto Sans Javanese" }, key: "s1" }, k),
                  h("span", { key: "s2" }, "×", val)
                ])
              )
            ]),
            h("button", { className: "btn-primary", onClick: restartGame, key: "again" }, "MAIN LAGI")
          ])
        )
      ]),

      // SIDE PANEL
      h("div", { className: "side-panel", key: "sp" }, [
        h("div", { className: "card", key: "c1" }, [
          h("h3", { key: "h3" }, "🎯 MODE GANTI KOTAK"),
          h("div", { className: "toggle-row", key: "tr" }, [
            h("button", { className: `toggle-btn ${targetMode === "jatuh" ? "active" : ""}`, onClick: () => setTargetMode("jatuh"), key: "b1" }, "JATUHKAN SAJA"),
            h("button", { className: `toggle-btn ${targetMode === "ganti" ? "active" : ""}`, onClick: () => setTargetMode("ganti"), key: "b2" }, "GANTI SEMUA")
          ]),
          h("div", { style: { fontSize: 11, color: "#8d6e63", marginTop: 8, lineHeight: 1.4 }, key: "desc" },
            targetMode === "jatuh"
              ? "Kotak benar jatuh, diganti baru, lalu SEMUA kotak di-shuffle Fisher-Yates + meriam loncat acak 10-90%. Wajib geser lagi!"
              : "5 kotak baru, diacak posisi pakai Fisher-Yates + jitter, meriam juga loncat acak. Jawaban bisa kiri/tengah/kanan."
          )
        ]),

        h("div", { className: "card", key: "c2" }, [
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, key: "hdr" }, [
            h("h3", { key: "h3" }, "📻 LEVEL"),
            h("button", { className: "btn-secondary", style: { width: "auto", marginTop: 0, padding: "6px 10px", fontSize: 11 }, onClick: changeQuestion, key: "chg" }, "GANTI SOAL")
          ]),
          h("div", { className: "level-dots", style: { marginTop: 8 }, key: "dots" },
            [1, 2, 3, 4].map((lvl) =>
              h("div", {
                className: `dot ${level === lvl ? "active" : ""}`,
                onClick: () => {
                  setLevel(lvl);
                  let q = createQuestion(lvl);
                  setCurrentQuestion(q);
                  setTargets(generateTargets(q, lvl));
                },
                key: lvl
              }, lvl)
            )
          ),
          h("div", { style: { fontSize: 11, marginTop: 8, lineHeight: 1.4, color: "#5d4037" }, key: "ldesc" }, [
            level === 1 && "Level 1: hanya A, I, U – tanpa cecak/layar.",
            level === 2 && "Level 2: tambah Ê pepet ꦼ, É taling ꦺ, O ꦺꦴ.",
            level === 3 && "Level 3: tambah NG ꦁ (cecak), R ꦂ (layar), H ꦃ (wignyan).",
            level === 4 && "Level 4: semua + RÊ ꦉ & LÊ ꦊ (pa cerek & nga lelet)."
          ]),
          h("div", { style: { marginTop: 10, background: "#efebe9", borderRadius: 10, padding: 8, fontSize: 12 }, key: "box" }, [
            h("div", { style: { fontWeight: 800, fontSize: 10, letterSpacing: "0.08em", marginBottom: 4 }, key: "lbl" }, "SAAT INI DITEMBAK:"),
            h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, key: "val" }, [
              h("span", { style: { fontWeight: 800, fontSize: 22 }, key: "lat" }, currentQuestion.latin),
              h("span", { style: { fontSize: 10, background: "#3e2723", color: "#ffecb3", padding: "4px 8px", borderRadius: 999, fontWeight: 700 }, key: "hint" }, "CARI DI ATAS!")
            ]),
            h("div", { style: { fontSize: 10, color: "#8d6e63", marginTop: 4 }, key: "formula" }, currentQuestion.cons, " + ", currentQuestion.vowel, " + ", currentQuestion.suffix || "∅", " → ?")
          ])
        ]),

        h("div", { className: "card", key: "c3" }, [
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, key: "hdr" }, [
            h("h3", { key: "h3" }, "📜 PAUGERAN"),
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
                ]),
                h("div", { style: { fontSize: 11, marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }, key: "examples" },
                  [
                    { l: "KA", j: "ꦏ" }, { l: "KI", j: "ꦏꦶ" }, { l: "KÊ", j: "ꦏꦼ" }, { l: "KÉ", j: "ꦏꦺ" }, { l: "KO", j: "ꦏꦺꦴ" },
                    { l: "KANG", j: "ꦏꦁ" }, { l: "KAR", j: "ꦏꦂ" }, { l: "KAH", j: "ꦏꦃ" }, { l: "NGO", j: "ꦔꦺꦴ" }, { l: "THONG", j: "ꦛꦺꦴꦁ" }
                  ].map((ex) =>
                    h("span", { style: { background: "#efebe9", padding: "3px 7px", borderRadius: 999, border: "1px solid #d7ccc8" }, key: ex.l }, [
                      ex.l, " = ", h("span", { style: { fontFamily: "Noto Sans Javanese" }, key: "j" }, ex.j)
                    ])
                  )
                )
              ])
        ]),

        h("div", { className: "card", style: { background: "#3e2723", color: "#ffecb3", borderColor: "#271c19" }, key: "c4" }, [
          h("h3", { style: { color: "#ffcc80" }, key: "h3" }, "🕹️ CARA MAIN"),
          h("div", { style: { fontSize: 12, lineHeight: 1.6 }, key: "desc" }, [
            "1. Lihat huruf di meriam (contoh ", h("b", { key: "b1" }, "NGÊNG = ꦔꦼꦁ"), ")", h("br", { key: "br1" }),
            "2. Geser meriam pakai tangan kiri (drag / slider).", h("br", { key: "br2" }),
            "3. Tembak dengan tombol kanan / Spacebar.", h("br", { key: "br3" }),
            "4. Tembak aksara Jawa yang tepat di atas. Salah = -5 & nyawa -1."
          ])
        ])
      ])
    ]),

    h("div", { style: { fontSize: 10, color: "#8d6e63", padding: "10px 0 24px", letterSpacing: "0.06em" }, key: "ftr" },
      "Dibuat dengan paugeran Mardikawi • Noto Sans Javanese • Bedhil Cetbang Jawa"
    )
  ]);
}

// RENDER KE DOM
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(h(React.StrictMode, null, h(BedhilAksaraJawaGame)));
}
