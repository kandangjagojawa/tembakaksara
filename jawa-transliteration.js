/**
 * Modul Transliterasi dan Generator Soal Aksara Jawa
 */

export const AKSARA_POKOK = {
  h: "ꦲ", n: "ꦤ", c: "ꦕ", r: "ꦫ", k: "ꦏ",
  d: "ꦢ", t: "ꦠ", s: "ꦱ", w: "ꦮ", l: "ꦭ",
  p: "ꦥ", dh: "ꦝ", j: "ꦗ", y: "ꦪ", m: "ꦩ",
  g: "ꦒ", b: "ꦧ", th: "ꦛ", ng: "ꦔ", ny: "ꦚ"
};

export const AKSARA_KHUSUS = {
  "rê": "ꦉ",
  "lê": "ꦊ"
};

export const SANDHANGAN_SWARA = {
  a: "",
  i: "ꦶ",
  u: "ꦸ",
  "ê": "ꦼ",
  "é": "ꦺ",
  "è": "ꦺ",
  o: "ꦺꦴ"
};

export const PANYIGEG_WANDA = {
  "": "",
  ng: "ꦁ",
  r: "ꦂ",
  h: "ꦃ"
};

export const VOWEL_CAPITALS = {
  a: "A", i: "I", u: "U",
  "ê": "Ê", "é": "É", "è": "È", o: "O"
};

export function toJavaneseScript(cons, vowel, suffix) {
  const base = AKSARA_KHUSUS[cons] ?? AKSARA_POKOK[cons] ?? "ꦏ";
  const sandhangan = SANDHANGAN_SWARA[vowel] ?? "";
  const panyigeg = PANYIGEG_WANDA[suffix] ?? "";
  return base + sandhangan + panyigeg;
}

export function toLatinText(cons, vowel, suffix) {
  let baseUpper;
  if (cons === "rê") baseUpper = "RÊ";
  else if (cons === "lê") baseUpper = "LÊ";
  else baseUpper = cons.toUpperCase();

  if (cons === "rê" || cons === "lê") {
    if (vowel === "a" || vowel === "ê") {
      const suffixPart = suffix ? (suffix === "ng" ? "NG" : suffix === "r" ? "R" : suffix === "h" ? "H" : suffix.toUpperCase()) : "";
      return baseUpper + suffixPart;
    }
    const vowelPart = vowel === "a" ? "" : (VOWEL_CAPITALS[vowel] ?? vowel.toUpperCase());
    const suffixPart = suffix ? (suffix === "ng" ? "NG" : suffix === "r" ? "R" : suffix === "h" ? "H" : suffix.toUpperCase()) : "";
    return baseUpper + vowelPart + suffixPart;
  }

  const vowelPart = VOWEL_CAPITALS[vowel] ?? vowel.toUpperCase();
  const suffixPart = suffix ? (suffix === "ng" ? "NG" : suffix === "r" ? "R" : suffix === "h" ? "H" : suffix.toUpperCase()) : "";
  return baseUpper + vowelPart + suffixPart;
}

export function getQuestionElements(level) {
  let vowels = [];
  let suffixes = [];
  let consonants = Object.keys(AKSARA_POKOK);

  if (level === 1) {
    vowels = ["a", "i", "u"];
    suffixes = [""];
  } else if (level === 2) {
    vowels = ["a", "i", "u", "ê", "é", "o"];
    suffixes = [""];
  } else if (level === 3) {
    vowels = ["a", "i", "u", "ê", "é", "è", "o"];
    suffixes = ["", "ng", "r", "h"];
  } else {
    vowels = ["a", "i", "u", "ê", "é", "è", "o"];
    suffixes = ["", "ng", "r", "h"];
    consonants = [...consonants, "rê", "lê"];
  }

  return { vowels, suffixes, cons: consonants };
}

export function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// PERBAIKAN: Gunakan kisi posisi tetap tanpa jitter agar kotak tidak pernah bertumpuk
export function generateTargetPositions() {
  const positions = [10, 29, 48, 67, 86];
  return shuffleArray(positions);
}

export function getRandomPosition() {
  return 10 + Math.random() * 80;
}

export function createQuestion(level, consOverride = null) {
  const elements = getQuestionElements(level);
  const cons = consOverride ?? getRandomElement(elements.cons);
  const vowel = getRandomElement(elements.vowels);
  const suffix = getRandomElement(elements.suffixes);

  const jawa = toJavaneseScript(cons, vowel, suffix);
  const latin = toLatinText(cons, vowel, suffix);

  return {
    id: Math.random().toString(36).slice(2, 8),
    cons,
    vowel,
    suffix,
    jawa,
    latin
  };
}

export function generateTargets(question, level) {
  const elements = getQuestionElements(level);
  const list = [{ ...question, isCorrect: true, x: 0 }];
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

    const jawaScript = toJavaneseScript(c, v, s);
    if (jawaScript === question.jawa) continue;
    if (list.some((item) => item.jawa === jawaScript)) continue;

    const latinText = toLatinText(c, v, s);
    list.push({
      id: Math.random().toString(36).slice(2, 8),
      cons: c,
      vowel: v,
      suffix: s,
      jawa: jawaScript,
      latin: latinText,
      isCorrect: false,
      x: 0
    });
  }

  const shuffledList = shuffleArray(list);
  const positions = generateTargetPositions();

  return shuffledList.map((target, idx) => ({
    ...target,
    x: positions[idx]
  }));
}
