/* =========================================================
   gen-abrsm.js — ตัวสร้างโจทย์อัตโนมัติสำหรับ ABRSM Grade 5
   (โจทย์ภาษาอังกฤษแบบข้อสอบจริง + เฉลยภาษาไทยทีละขั้น)
   ========================================================= */
(() => {
  const M = Music;
  const { pick, parse, pc, pretty, addInterval, midi, distinctChoices, shuffle } = M;
  const ACC_TXT = { '#': 'ชาร์ป (♯) ยกขึ้นครึ่งเสียง', b: 'แฟลต (♭) ลดลงครึ่งเสียง' };

  /* ---------- อ่านโน้ต 4 กุญแจ (เน้นอัลโตและเทเนอร์) ---------- */
  const RANGES = {
    treble: ['B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'C6'],
    bass: ['E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4'],
    alto: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'],
    tenor: ['A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4'],
  };
  M.GEN.g5NoteClefs = () => {
    const clef = pick(['alto', 'alto', 'tenor', 'tenor', 'treble', 'bass']);
    const nat = pick(RANGES[clef]);
    const acc = Math.random() < 0.3 ? pick(['#', 'b']) : '';
    const note = nat[0] + acc + nat.slice(1);
    const name = pc(note);
    const L = M.LETTERS, li = L.indexOf(nat[0]);
    const pool = [L[(li + 1) % 7], L[(li + 6) % 7], L[(li + 2) % 7], L[(li + 5) % 7]].map((x) => pc(x + acc + '4'));
    if (acc) pool.push(nat[0]);
    return {
      tag: 'Clefs & pitch',
      q: `Name this note (${clef} clef).`,
      c: distinctChoices(name, pool),
      e: M.noteExplain(nat, clef) + (acc ? `\nมีเครื่องหมาย${ACC_TXT[acc]} → ${name}` : ''),
      notation: { clef, notes: [{ keys: [note] }] },
    };
  };

  /* ---------- กุญแจเสียง (major + minor ถึง 6 ชาร์ป/แฟลต) ---------- */
  M.GEN.g5KeySig = () => {
    const k = pick(M.KEYS.filter((x) => x.n > 0));
    const asMinor = Math.random() < 0.5;
    const nm = (x, minor) => pretty(minor ? x.minor : x.major) + (minor ? ' minor' : ' major');
    const correct = nm(k, asMinor);
    // ตัวลวงที่นักเรียนสับสนบ่อย: คีย์ที่มีจำนวนเท่ากันแต่เป็นอีกชนิด (3♯ vs 3♭)
    const twin = M.KEYS.find((x) => x.n === k.n && x.type !== k.type);
    const others = shuffle(M.KEYS.filter((x) => x !== k && x !== twin)).slice(0, 2).map((x) => nm(x, asMinor));
    return {
      tag: 'Keys & scales',
      q: `Which ${asMinor ? 'minor' : 'major'} key has this key signature?`,
      c: [correct, ...(twin ? [nm(twin, asMinor)] : []), ...others, nm(M.KEYS[0], asMinor)].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
      e: M.keySigExplain(k, asMinor),
      notation: { clef: Math.random() < 0.5 ? 'treble' : 'bass', key: k.major },
    };
  };

  /* ---------- ขั้นคู่ (simple + compound, รวม aug/dim) ---------- */
  const IV = [['m', 2], ['M', 2], ['A', 2], ['m', 3], ['M', 3], ['d', 4], ['P', 4], ['A', 4], ['d', 5], ['P', 5], ['A', 5], ['m', 6], ['M', 6], ['A', 6], ['d', 7], ['m', 7], ['M', 7], ['P', 8]];
  const label = (q, num, comp) => (comp ? `compound ${M.Q_EN[q]} ${M.NUM_EN[num]}` : `${M.Q_EN[q]} ${M.NUM_EN[num]}`);
  M.GEN.g5Interval = () => {
    let lower, upper, q, num, comp;
    do {
      lower = pick(['C4', 'D4', 'E4', 'F4', 'G4', 'A3', 'B3', 'Bb3', 'Eb4', 'F#4', 'Ab3', 'C#4', 'Db4', 'G#3']);
      [q, num] = pick(IV);
      comp = num < 8 && Math.random() < 0.35;
      upper = addInterval(lower, q, num);
      if (upper && comp) upper = upper.replace(/\d$/, (d) => +d + 1);
    } while (!upper);
    const correct = label(q, num, comp);
    const pool = IV.filter(([a, b]) => b === num || Math.abs(b - num) === 1).map(([a, b]) => label(a, b, comp));
    return {
      tag: 'Intervals',
      q: 'Name this interval (type and number).',
      c: distinctChoices(correct, [...new Set(pool)]),
      e: M.intervalExplain(lower, upper, q, comp ? num + 7 : num, correct),
      notation: { clef: 'treble', notes: [{ keys: [lower] }, { keys: [upper] }] },
    };
  };

  /* ---------- ชื่อคอร์ดในคีย์ (Ia Ib Ic IIa IIb IVa IVb IVc Va Vb Vc) ---------- */
  const SCALE = { major: [['P', 1], ['M', 2], ['M', 3], ['P', 4], ['P', 5], ['M', 6], ['M', 7]], minor: [['P', 1], ['M', 2], ['m', 3], ['P', 4], ['P', 5], ['m', 6], ['M', 7]] };
  const ROMAN = { 0: 'I', 1: 'II', 3: 'IV', 4: 'V' };
  const DEG_NAME = { 0: 'tonic', 1: 'supertonic', 3: 'subdominant', 4: 'dominant' };
  const INV = ['a', 'b', 'c'], INV_TH = { a: 'ตำแหน่งราก (root position) → a', b: 'โน้ตขั้น 3 ของคอร์ดอยู่ล่าง (first inversion) → b', c: 'โน้ตขั้น 5 ของคอร์ดอยู่ล่าง (second inversion) → c' };
  const KEYS_G5 = [
    ['C', 'major'], ['G', 'major'], ['D', 'major'], ['A', 'major'], ['E', 'major'], ['F', 'major'], ['Bb', 'major'], ['Eb', 'major'], ['Ab', 'major'],
    ['A', 'minor'], ['E', 'minor'], ['D', 'minor'], ['G', 'minor'], ['B', 'minor'], ['C', 'minor'],
  ];
  function sigMap(keyMajor) {
    const k = M.KEYS.find((x) => x.major === keyMajor);
    const order = k.type === '#' ? ['F', 'C', 'G', 'D', 'A', 'E', 'B'] : ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
    const m = {}; order.slice(0, k.n).forEach((l) => (m[l] = k.type)); return m;
  }
  M.GEN.g5ChordInKey = () => {
    const [ton, mode] = pick(KEYS_G5);
    const keyEntry = M.KEYS.find((x) => (mode === 'major' ? x.major === ton : x.minor === ton));
    const tonic = ton + ('CDEF'.includes(ton[0]) ? '4' : '3');
    const sn = (k) => { const [q, n] = SCALE[mode][k % 7]; const x = addInterval(tonic, q, n); return x.replace(/-?\d+$/, (o) => +o + Math.floor(k / 7)); };
    const deg = pick([0, 0, 1, 3, 3, 4, 4]);
    const inv = deg === 1 ? pick(['a', 'b']) : pick(INV);
    const idx = { a: [deg, deg + 2, deg + 4], b: [deg + 2, deg + 4, deg + 7], c: [deg + 4, deg + 7, deg + 9] }[inv];
    const notes = idx.map(sn);
    const sig = sigMap(keyEntry.major);
    const accs = notes.map((n) => { const p = parse(n); const s = sig[p.letter] || ''; return p.acc === s ? '' : (p.acc || 'n'); });
    const correct = ROMAN[deg] + inv;
    const pool = [...INV.map((i) => ROMAN[deg] + i), ...Object.values(ROMAN).map((r) => r + inv)];
    const keyName = `${pretty(ton)} ${mode}`;
    const root = sn(deg), third = sn(deg + 2), fifth = sn(deg + 4);
    const e = `ขั้นที่ 1 โน้ตในคอร์ด: ${notes.map(pc).join(', ')} (กุญแจเสียงของ ${keyName}${mode === 'minor' ? ' — ไมเนอร์ใช้ฮาร์โมนิกไมเนอร์ ขั้นที่ 7 ยกขึ้นครึ่งเสียง' : ''})\n` +
      `ขั้นที่ 2 เรียงโน้ตให้ซ้อนเป็นคู่ 3: ${pc(root)} – ${pc(third)} – ${pc(fifth)} → รากคือ ${pc(root)}\n` +
      `ขั้นที่ 3 ${pc(root)} เป็นขั้นที่ ${deg + 1} (${DEG_NAME[deg]}) ของ ${keyName} → คอร์ด ${ROMAN[deg]}\n` +
      `ขั้นที่ 4 โน้ตต่ำสุดคือ ${pc(notes[0])} = ${INV_TH[inv]}\nคำตอบ: ${correct}`;
    return {
      tag: 'Chords & cadences',
      q: `The key is ${keyName}. Name this chord (e.g. Ib, IVc, Va).`,
      c: distinctChoices(correct, [...new Set(pool)]),
      e,
      notation: { clef: 'treble', key: keyEntry.major, notes: [{ keys: notes, accs }] },
    };
  };
})();
