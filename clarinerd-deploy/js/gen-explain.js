/* =========================================================
   gen-explain.js — เฉลยละเอียดสองภาษาสำหรับ "โจทย์สุ่ม" ทุกตัว
   ห่อ (wrap) ตัวสร้างโจทย์ใน Music.GEN แล้วเติม q.ex จากข้อมูลของโจทย์ที่สุ่มได้
   q.ex = { qAlt, th?, en, why[], whyEn[], tip, tipEn, img[] }  (th ไม่ใส่ = ใช้ q.e เดิม)
   why[] เรียงตามตัวเลือกผิด c[1], c[2], c[3] ของโจทย์นั้น
   ต้องโหลดหลัง music.js, gen-abrsm.js, gen-uni.js
   ========================================================= */
(() => {
  const M = Music;
  const { parse, pc, pretty, addInterval, midi, triad, LETTERS, dIndex, fromDIndex, letterWalk, bare, KEYS } = M;

  /* ---------------- ตัวช่วยทั่วไป ---------------- */
  const PERFECT = [1, 4, 5, 8];
  const BASE = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11, 8: 12 };
  const qOff = (q, n) => (PERFECT.includes(n) ? { P: 0, A: 1, d: -1 }[q] : { M: 0, m: -1, A: 1, d: -2 }[q]);
  const semisOf = (q, n) => { const s = n > 8 ? n - 7 : n; return BASE[s] + qOff(q, s) + (n > 8 ? 12 : 0); };
  const Q_EN = { P: 'perfect', M: 'major', m: 'minor', A: 'augmented', d: 'diminished' };
  const Q_TH = { P: 'เพอร์เฟกต์', M: 'เมเจอร์', m: 'ไมเนอร์', A: 'ออกเมนเต็ด', d: 'ดิมินิชท์' };
  const NUM_EN = { 1: 'unison', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th', 8: 'octave' };
  const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const nameOf = (m) => SHARPS[m % 12] + (Math.floor(m / 12) - 1);
  const W = (k) => ({ keys: [k], dur: 'w' });
  const Q = (k, a) => ({ keys: [k], dur: 'q', ...(a !== undefined ? { accs: [a] } : {}) });
  const CH = (keys) => ({ keys, dur: 'w' });
  const BAR = { bar: true };
  const safe = (fn) => { try { return fn(); } catch (e) { return undefined; } };

  // ตำแหน่งบนบรรทัด (ไทย / อังกฤษ)
  const BOTTOM = { treble: 'E4', bass: 'G2', alto: 'F3', tenor: 'D3' };
  const REF = { treble: 'G4', bass: 'F3', alto: 'C4', tenor: 'C4' };
  const CLEF_EN = { treble: 'treble clef', bass: 'bass clef', alto: 'alto clef', tenor: 'tenor clef' };
  const REF_EN = { treble: 'line 2 as G', bass: 'line 4 as F', alto: 'the middle line as middle C', tenor: 'line 4 as middle C' };
  function posTh(note, clef) {
    const p = dIndex(note) - dIndex(BOTTOM[clef]);
    if (p >= 0 && p <= 8) return p % 2 === 0 ? `เส้นที่ ${p / 2 + 1}` : `ช่องที่ ${(p + 1) / 2}`;
    return p < 0 ? 'ใต้บรรทัด' : 'เหนือบรรทัด';
  }
  function posEn(note, clef) {
    const p = dIndex(note) - dIndex(BOTTOM[clef]);
    if (p >= 0 && p <= 8) return p % 2 === 0 ? `line ${p / 2 + 1}` : `space ${(p + 1) / 2}`;
    return p < 0 ? 'below the stave' : 'above the stave';
  }
  const CLEF_TIP = {
    treble: ['เส้นจากล่าง E G B D F · ช่อง F A C E', 'Lines from the bottom E G B D F · spaces F A C E'],
    bass: ['เส้นจากล่าง G B D F A · ช่อง A C E G', 'Lines from the bottom G B D F A · spaces A C E G'],
    alto: ['Alto: เส้นกลาง = middle C · เส้นจากล่าง F A C E G', 'Alto: middle line = middle C · lines F A C E G'],
    tenor: ['Tenor: เส้นที่ 4 = middle C · เส้นจากล่าง D F A C E', 'Tenor: line 4 = middle C · lines D F A C E'],
  };

  // หาตำแหน่งของตัวอักษรผิดที่ใกล้โน้ตจริงที่สุด แล้วบอกว่าห่างกี่ขั้น
  function nearestLetter(note, letter) {
    const d0 = dIndex(note);
    let best = null;
    for (let k = d0 - 6; k <= d0 + 6; k++) if (fromDIndex(k)[0] === letter && (best === null || Math.abs(k - d0) < Math.abs(best - d0))) best = k;
    return best;
  }
  function wrongNoteWhy(note, clef, wrongName) {
    const L = wrongName[0], acc = wrongName.slice(1);
    if (L === parse(note).letter) {
      return [`${wrongName} ใช้ตัวอักษรเดียวกันแต่${acc ? 'มีเครื่องหมาย' : 'ไม่มีเครื่องหมาย'} — ดูเครื่องหมายหน้าโน้ตอีกครั้ง`,
        `${wrongName} has the right letter but the wrong accidental — check the sign before the note`];
    }
    const k = nearestLetter(note, L), diff = k - dIndex(note), n = fromDIndex(k);
    return [`${L} จะอยู่${diff > 0 ? 'สูง' : 'ต่ำ'}กว่านี้ ${Math.abs(diff)} ขั้น (${posTh(n, clef)})`,
      `${L} would be ${Math.abs(diff)} step${Math.abs(diff) > 1 ? 's' : ''} ${diff > 0 ? 'higher' : 'lower'} (${posEn(n, clef)})`];
  }

  // ข้อมูลขั้นคู่จากโน้ตจริง
  function intervalInfo(lower, upper) {
    const num = dIndex(upper) - dIndex(lower) + 1;
    const simple = num > 8 ? num - 7 : num;
    const semis = midi(upper) - midi(lower);
    const ref = addInterval(lower, PERFECT.includes(simple) ? 'P' : 'M', simple);
    return { num, simple, semis, ref, walk: letterWalk(lower, upper).map((x) => x[0]) };
  }
  // แปลงชื่อขั้นคู่ (ไทยหรืออังกฤษ) → {q, num, comp}
  function parseIntervalLabel(s) {
    let m = /\((A|d|m|M|P)(\d)\)/.exec(s);
    if (m) return { q: m[1], num: +m[2], comp: false };
    m = /(compound )?(perfect|major|minor|augmented|diminished) (unison|2nd|3rd|4th|5th|6th|7th|octave)/.exec(s);
    if (m) {
      const q = { perfect: 'P', major: 'M', minor: 'm', augmented: 'A', diminished: 'd' }[m[2]];
      const num = +Object.keys(NUM_EN).find((k) => NUM_EN[k] === m[3]);
      return { q, num, comp: !!m[1] };
    }
    return null;
  }
  function intervalWhy(info, label, comp) {
    const w = parseIntervalLabel(label);
    if (!w) return ['ไม่ตรงกับการนับชื่อโน้ตและครึ่งเสียงของโจทย์', 'Does not match the letter count and semitones'];
    const wnum = w.num + (w.comp ? 7 : 0), realNum = info.num;
    const ws = semisOf(w.q, w.num) + (w.comp ? 12 : 0);
    if (wnum !== realNum) {
      const nm = label.replace(/ \(.*\)/, '');
      return [`${nm} ต้องนับชื่อโน้ตได้ ${wnum} ตัว แต่โจทย์นับได้ ${realNum} ตัว${w.comp !== comp ? (comp ? ' (โจทย์กว้างเกิน 1 ออกเทฟ จึงเป็น compound)' : ' (โจทย์ไม่เกิน 1 ออกเทฟ จึงไม่ใช่ compound)') : ''}`,
        `${w.comp ? 'compound ' : ''}${Q_EN[w.q]} ${NUM_EN[w.num]} needs ${wnum} letter names; this one has ${realNum}${w.comp !== comp ? (comp ? ' (wider than an octave, so compound)' : ' (within an octave, so not compound)') : ''}`];
    }
    return [`ตัวเลขขั้นคู่ถูก แต่ ${label.replace(/ \(.*\)/, '')} ต้องห่าง ${ws} ครึ่งเสียง ส่วนโจทย์ห่าง ${info.semis} ครึ่งเสียง`,
      `The number is right, but it would need ${ws} semitones; this one has ${info.semis}`];
  }

  function wrap(name, build) {
    const orig = M.GEN[name];
    if (!orig) return;
    M.GEN[name] = (...args) => {
      const q = orig(...args);
      const ex = safe(() => build(q));
      if (ex) {
        const n = q.c.length - 1;
        ex.why = (ex.why || []).slice(0, n); ex.whyEn = (ex.whyEn || []).slice(0, n);
        if (ex.why.length === n && ex.whyEn.length === n) q.ex = ex;
      }
      return q;
    };
  }

  /* =========================================================
     อ่านโน้ต
     ========================================================= */
  function noteBuild(q, qAltFn) {
    const clef = q.notation.clef, note = q.notation.notes[0].keys[0];
    const p = parse(note), nat = p.letter + p.oct, ref = REF[clef];
    const walk = letterWalk(ref, nat).map(bare);
    const accEn = p.acc === '#' ? ' The sharp raises it a semitone.' : p.acc === 'b' ? ' The flat lowers it a semitone.' : '';
    const why = q.c.slice(1).map((w) => wrongNoteWhy(note, clef, w));
    return {
      qAlt: qAltFn(clef),
      en: `Step 1: the ${CLEF_EN[clef]} fixes ${REF_EN[clef]}.\nStep 2: the note is on ${posEn(nat, clef)}. Count letter names from ${bare(ref)}: ${walk.join(' → ')}.${accEn}\nAnswer: ${q.c[0]}${p.letter === 'C' && p.oct === 4 ? ' (middle C)' : ''}`,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: CLEF_TIP[clef][0], tipEn: CLEF_TIP[clef][1],
      img: ref === nat ? undefined : [{ cap: `ตัวอ้างอิง ${bare(ref)} (ซ้าย) → โน้ตในโจทย์ (ขวา)`, capEn: `Reference ${bare(ref)} (left) → the note (right)`, n: { clef, notes: [W(ref), { keys: [note], dur: 'w' }] } }],
    };
  }
  wrap('noteReading', (q) => noteBuild(q, (clef) => `What is this note in the ${CLEF_EN[clef]}?`));
  wrap('g5NoteClefs', (q) => noteBuild(q, (clef) => `โน้ตตัวนี้ (กุญแจ${{ treble: 'ซอล', bass: 'ฟา', alto: 'อัลโต', tenor: 'เทเนอร์' }[clef]}) คือโน้ตอะไร`));

  /* =========================================================
     กุญแจเสียง
     ========================================================= */
  const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'], FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
  const findKey = (label) => {
    const minor = / minor$/.test(label), t = label.replace(/ (major|minor)$/, '').replace('♯', '#').replace('♭', 'b');
    return { k: KEYS.find((x) => (minor ? x.minor : x.major) === t), minor };
  };
  const sigText = (k) => (k.n === 0 ? ['ไม่มีชาร์ปหรือแฟลต', 'no sharps or flats'] : [`${k.type === '#' ? 'ชาร์ป' : 'แฟลต'} ${k.n} ตัว`, `${k.n} ${k.type === '#' ? 'sharp' : 'flat'}${k.n > 1 ? 's' : ''}`]);
  function keyBuild(q, qAlt) {
    const { k, minor } = findKey(q.c[0]);
    const list = (k.type === '#' ? SHARP_ORDER : FLAT_ORDER).slice(0, k.n).map((x) => x + (k.type === '#' ? '♯' : '♭'));
    const last = list[list.length - 1];
    let en = `Step 1: ${k.n} ${k.type === '#' ? 'sharps' : 'flats'}: ${list.join(' ')}.\n`;
    en += k.type === '#' ? `Step 2: shortcut — the last sharp (${last}) is the leading note; a semitone above it is the major key: ${pretty(k.major)} major.`
      : k.n === 1 ? 'Step 2: one flat is always F major.' : `Step 2: shortcut — the second-to-last flat (${list[list.length - 2]}) names the major key: ${pretty(k.major)} major.`;
    if (minor) en += `\nStep 3: the relative minor is a minor 3rd (3 semitones) below: ${pretty(k.minor)} minor.`;
    const why = q.c.slice(1).map((w) => {
      const r = findKey(w);
      if (!r.k) return ['ไม่ตรงกับกุญแจเสียงนี้', 'Does not match this key signature'];
      const t = sigText(r.k);
      const same = r.k.n === k.n;
      return [`${w} มี${t[0]}${same ? ' (จำนวนเท่ากันแต่คนละชนิด — ระวังสับสน)' : ''}`, `${w} has ${t[1]}${same ? ' (same number, opposite type — a common trap)' : ''}`];
    });
    const ton = minor ? k.minor : k.major;
    const tonNote = ton + ('CDEF'.includes(ton[0]) ? '5' : '4');
    return {
      qAlt, en,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: 'ชาร์ป: ชาร์ปตัวสุดท้าย + ครึ่งเสียง · แฟลต: แฟลตตัวรองสุดท้าย · ไมเนอร์: ลงจากเมเจอร์ 3 ครึ่งเสียง',
      tipEn: 'Sharps: last sharp + a semitone · flats: second-to-last flat · minor: 3 semitones below the major',
      img: [{ cap: `${q.c[0]}: โทนิก ${pretty(ton)}`, capEn: `${q.c[0]}: tonic ${pretty(ton)}`, n: { clef: 'treble', key: k.major, notes: [{ keys: [tonNote], dur: 'w', accs: [''] }] } }],
    };
  }
  wrap('keySignature', (q) => keyBuild(q, `Which ${/minor/.test(q.c[0]) ? 'minor' : 'major'} key has this key signature?`));
  wrap('g5KeySig', (q) => keyBuild(q, `เครื่องหมายประจำกุญแจเสียงนี้เป็นของบันไดเสียง${/minor/.test(q.c[0]) ? 'ไมเนอร์' : 'เมเจอร์'}ใด`));

  /* =========================================================
     ขั้นคู่ (ดูจากโน้ต)
     ========================================================= */
  function intervalBuild(q, qAlt) {
    const [lower, upper] = q.notation.notes.map((x) => x.keys[0]);
    const info = intervalInfo(lower, upper), comp = info.num > 8;
    const w = parseIntervalLabel(q.c[0]);
    const isP = PERFECT.includes(info.simple);
    let en = `Step 1: count letter names (include the first): ${info.walk.join(' → ')} = ${info.num} → a ${info.num > 8 ? `compound ${NUM_EN[info.simple]}` : NUM_EN[info.simple]}.\n`;
    let refUp = null;
    if (info.ref) {
      refUp = comp ? info.ref.replace(/\d$/, (d) => +d + 1) : info.ref;
      const diff = midi(upper) - midi(refUp);
      en += `Step 2: in ${pc(lower)} major the ${NUM_EN[info.simple]} note is ${pc(info.ref)} → ${isP ? 'perfect' : 'major'}.\n`;
      en += `Step 3: the top note ${pc(upper)} is ${diff === 0 ? 'exactly that' : `${Math.abs(diff)} semitone${Math.abs(diff) > 1 ? 's' : ''} ${diff < 0 ? 'lower' : 'higher'}`}.\n`;
      en += isP ? 'Rule: perfect −1 = diminished · +1 = augmented.\n' : 'Rule: major −1 = minor · −2 = diminished · +1 = augmented.\n';
    }
    en += `Answer: ${w ? `${comp ? 'compound ' : ''}${Q_EN[w.q]} ${NUM_EN[w.num]}` : q.c[0]} (${info.semis} semitones).`;
    const why = q.c.slice(1).map((l) => intervalWhy(info, l, comp));
    const img = [{ cap: `${pc(lower)} → ${pc(upper)}: ${info.semis} ครึ่งเสียง`, capEn: `${pc(lower)} → ${pc(upper)}: ${info.semis} semitones`, n: { clef: 'treble', notes: [W(lower), W(upper)] } }];
    if (refUp && refUp !== upper) img.push({ cap: `เทียบ: ${pc(lower)} → ${pc(refUp)} = ${isP ? 'perfect' : 'major'} ${NUM_EN[info.simple]}`, capEn: `Compare: ${pc(lower)} → ${pc(refUp)} = ${isP ? 'perfect' : 'major'} ${NUM_EN[info.simple]}`, n: { clef: 'treble', notes: [W(lower), W(refUp)] } });
    return {
      qAlt, en, why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: 'นับชื่อโน้ตก่อน (ได้ตัวเลข) แล้วเทียบกับบันไดเสียงเมเจอร์ของโน้ตล่าง (ได้ชนิด)',
      tipEn: 'Count letters first (the number), then compare with the lower note’s major scale (the quality)',
      img,
    };
  }
  wrap('intervalVisual', (q) => intervalBuild(q, 'What interval is formed by these two notes?'));
  wrap('g5Interval', (q) => intervalBuild(q, 'บอกชื่อขั้นคู่นี้ (ชนิดและตัวเลข)'));

  /* =========================================================
     คอร์ด (ทรัยแอด และคอร์ดเซเวนท์)
     ========================================================= */
  const TRI_QUAL = { major: ['M3 + m3', 'major'], minor: ['m3 + M3', 'minor'], diminished: ['m3 + m3', 'diminished'], augmented: ['M3 + M3', 'augmented'] };
  const TRI_KEY = { major: 'major', minor: 'minor', diminished: 'dim', augmented: 'aug' };
  const third = (a, b) => (midi(b) - midi(a) === 4 ? 'M3' : midi(b) - midi(a) === 3 ? 'm3' : `${midi(b) - midi(a)} st`);
  wrap('chordVisual', (q) => {
    const notes = q.notation.notes[0].keys;
    const t1 = third(notes[0], notes[1]), t2 = third(notes[1], notes[2]);
    const why = q.c.slice(1).map((w) => {
      const qual = w.split(' ').pop(), tn = safe(() => triad(notes[0], TRI_KEY[qual]));
      return [`${w} = ${TRI_QUAL[qual][0]}${tn ? ` (${tn.map(pc).join('–')})` : ''} แต่คอร์ดนี้เป็น ${t1} + ${t2}`, `${w} = ${TRI_QUAL[qual][0]}${tn ? ` (${tn.map(pc).join('–')})` : ''}, but this chord is ${t1} + ${t2}`];
    });
    return {
      qAlt: 'What is this triad?',
      en: `Step 1: the lowest note of a chord stacked in 3rds is the root: ${pc(notes[0])}.\nStep 2: ${pc(notes[0])} → ${pc(notes[1])} = ${t1}; ${pc(notes[1])} → ${pc(notes[2])} = ${t2}.\nRule: M3+m3 = major · m3+M3 = minor · m3+m3 = diminished · M3+M3 = augmented.\nAnswer: ${q.c[0]}`,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: 'ดูคู่ 3 ตัว "ล่าง": M3 = major/aug · m3 = minor/dim แล้วค่อยดูตัวบน', tipEn: 'Check the bottom 3rd first: M3 = major/aug · m3 = minor/dim, then the top one',
      img: [{ cap: `แยกเสียง: ${pc(notes[0])}–${pc(notes[1])} (${t1}) · ${pc(notes[1])}–${pc(notes[2])} (${t2})`, capEn: `Broken up: ${pc(notes[0])}–${pc(notes[1])} (${t1}) · ${pc(notes[1])}–${pc(notes[2])} (${t2})`, n: { clef: 'treble', notes: [...notes.map((k) => Q(k)), CH(notes)] } }],
    };
  });

  const SEV = {
    'Major 7th (Δ7)': ['major triad + major 7th', [['M', 3], ['P', 5], ['M', 7]], 'major triad + M7'],
    'Dominant 7th (7)': ['major triad + minor 7th', [['M', 3], ['P', 5], ['m', 7]], 'major triad + m7'],
    'Minor 7th (m7)': ['minor triad + minor 7th', [['m', 3], ['P', 5], ['m', 7]], 'minor triad + m7'],
    'Half-diminished 7th (ø7)': ['diminished triad + minor 7th', [['m', 3], ['d', 5], ['m', 7]], 'dim triad + m7'],
    'Diminished 7th (°7)': ['diminished triad + diminished 7th', [['m', 3], ['d', 5], ['d', 7]], 'dim triad + d7'],
  };
  const triName = (ns) => { const a = midi(ns[1]) - midi(ns[0]), b = midi(ns[2]) - midi(ns[1]); return a === 4 && b === 3 ? 'major' : a === 3 && b === 4 ? 'minor' : a === 3 && b === 3 ? 'diminished' : 'augmented'; };
  wrap('uSeventh', (q) => {
    const notes = q.notation.notes[0].keys, root = notes[0];
    const tri = triName(notes), s7 = midi(notes[3]) - midi(root), sev = s7 === 11 ? 'major 7th' : s7 === 10 ? 'minor 7th' : 'diminished 7th';
    const why = q.c.slice(1).map((w) => {
      const S = SEV[w]; if (!S) return ['ไม่ตรงกับโครงสร้างคอร์ดนี้', 'Does not match this chord'];
      const ns = safe(() => [root, ...S[1].map(([a, b]) => addInterval(root, a, b))]);
      return [`${w} = ${S[2]}${ns && ns.every(Boolean) ? ` (${ns.map(pc).join('–')})` : ''}`, `${w} = ${S[2]}${ns && ns.every(Boolean) ? ` (${ns.map(pc).join('–')})` : ''}`];
    });
    return {
      qAlt: 'What type of seventh chord is this?',
      en: `Step 1: root ${pc(root)}; notes ${notes.map(pc).join(' – ')}.\nStep 2: the lower triad ${notes.slice(0, 3).map(pc).join('–')} is ${tri}.\nStep 3: root to 7th (${pc(root)} → ${pc(notes[3])}) is a ${sev}.\nFormulas: maj7 = M triad + M7 · dom7 = M triad + m7 · m7 = m triad + m7 · ø7 = dim triad + m7 · °7 = dim triad + d7.\nAnswer: ${q.c[0]}`,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: 'แยกเป็น 2 ส่วน: ทรัยแอดล่าง + คู่ 7 จากราก', tipEn: 'Split it in two: the lower triad + the 7th above the root',
      img: [{ cap: `ทรัยแอดล่าง (${tri}) + คู่ 7 (${sev})`, capEn: `Lower triad (${tri}) + 7th (${sev})`, n: { clef: 'treble', notes: [CH(notes.slice(0, 3)), CH(notes)] } }],
    };
  });

  /* =========================================================
     คอร์ดในคีย์ (ABRSM Ia, IVb, Vc …)
     ========================================================= */
  const SCALE = { major: [['P', 1], ['M', 2], ['M', 3], ['P', 4], ['P', 5], ['M', 6], ['M', 7]], minor: [['P', 1], ['M', 2], ['m', 3], ['P', 4], ['P', 5], ['m', 6], ['M', 7]] };
  const ROMAN_DEG = { I: 0, II: 1, IV: 3, V: 4 };
  const INV_EN = { a: 'root position (root in the bass)', b: 'first inversion (3rd in the bass)', c: 'second inversion (5th in the bass)' };
  wrap('g5ChordInKey', (q) => {
    const m = /The key is (.+) (major|minor)\./.exec(q.q);
    const ton = m[1].replace('♭', 'b').replace('♯', '#'), mode = m[2];
    const tonic = ton + ('CDEF'.includes(ton[0]) ? '4' : '3');
    const sn = (k) => { const [qq, n] = SCALE[mode][k % 7]; return addInterval(tonic, qq, n).replace(/-?\d+$/, (o) => +o + Math.floor(k / 7)); };
    const chordOf = (R) => { const d = ROMAN_DEG[R]; return [sn(d), sn(d + 2), sn(d + 4)]; };
    const cm = /^(I|II|IV|V)([abc])$/.exec(q.c[0]);
    const [R, inv] = [cm[1], cm[2]];
    const [r, t, f] = chordOf(R);
    const bassOf = (i, ch) => ({ a: ch[0], b: ch[1], c: ch[2] }[i]);
    const why = q.c.slice(1).map((w) => {
      const x = /^(I|II|IV|V)([abc])$/.exec(w); if (!x) return ['ไม่ตรงกับคอร์ดนี้', 'Does not match'];
      if (x[1] === R) return [`${w} ต้องมี ${pc(bassOf(x[2], [r, t, f]))} เป็นโน้ตต่ำสุด แต่โจทย์มี ${pc(bassOf(inv, [r, t, f]))}`, `${w} would have ${pc(bassOf(x[2], [r, t, f]))} in the bass, but here it is ${pc(bassOf(inv, [r, t, f]))}`];
      const ch = chordOf(x[1]);
      return [`คอร์ด ${x[1]} ของ ${m[1]} ${mode} คือ ${ch.map(pc).join('–')} ไม่ใช่ ${pc(r)}–${pc(t)}–${pc(f)}`, `Chord ${x[1]} in ${m[1]} ${mode} is ${ch.map(pc).join('–')}, not ${pc(r)}–${pc(t)}–${pc(f)}`];
    });
    return {
      qAlt: `คีย์ ${m[1]} ${mode} — คอร์ดนี้คือคอร์ดอะไร (เช่น Ib, IVc, Va)`,
      en: `Step 1: stack the notes in 3rds: ${pc(r)} – ${pc(t)} – ${pc(f)} → the root is ${pc(r)}${mode === 'minor' ? ' (minor keys use the harmonic minor: raised 7th)' : ''}.\nStep 2: ${pc(r)} is degree ${ROMAN_DEG[R] + 1} of ${m[1]} ${mode} → chord ${R}.\nStep 3: the lowest note is ${pc(q.notation.notes[0].keys[0])} = ${INV_EN[inv]} → ${inv}.\nAnswer: ${q.c[0]}`,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: 'หารากก่อน (เลขโรมัน) แล้วดูโน้ตต่ำสุด (a = ราก · b = ขั้น 3 · c = ขั้น 5)', tipEn: 'Find the root first (numeral), then the bass (a = root · b = 3rd · c = 5th)',
      img: [{ cap: `เรียงเป็นคู่ 3 (root position): ${pc(r)}–${pc(t)}–${pc(f)}`, capEn: `Stacked in 3rds (root position): ${pc(r)}–${pc(t)}–${pc(f)}`, n: { clef: 'treble', key: q.notation.key, notes: [{ keys: [r, t, f], dur: 'w', accs: q.notation.notes[0].accs ? [r, t, f].map((n) => { const i = q.notation.notes[0].keys.findIndex((k) => k[0] === n[0] && parse(k).acc === parse(n).acc); return i >= 0 ? q.notation.notes[0].accs[i] : ''; }) : undefined }] } }],
    };
  });

  /* =========================================================
     โหมด
     ========================================================= */
  const MODE_INFO = {
    Ionian: ['เหมือนเมเจอร์ทุกประการ', 'identical to the major scale', [0, 2, 4, 5, 7, 9, 11]],
    Dorian: ['ไมเนอร์ที่ขั้น 6 สูงขึ้น (M6)', 'minor with a raised 6th (M6)', [0, 2, 3, 5, 7, 9, 10]],
    Phrygian: ['ไมเนอร์ที่ขั้น 2 ต่ำลง (m2)', 'minor with a flat 2nd (m2)', [0, 1, 3, 5, 7, 8, 10]],
    Lydian: ['เมเจอร์ที่ขั้น 4 สูงขึ้น (A4)', 'major with a raised 4th (A4)', [0, 2, 4, 6, 7, 9, 11]],
    Mixolydian: ['เมเจอร์ที่ขั้น 7 ต่ำลง (m7)', 'major with a flat 7th (m7)', [0, 2, 4, 5, 7, 9, 10]],
    Aeolian: ['เหมือนเนเชอรัลไมเนอร์', 'identical to the natural minor', [0, 2, 3, 5, 7, 8, 10]],
    Locrian: ['ขั้น 2 และ 5 ต่ำลง (m2, d5)', 'flat 2nd and flat 5th (m2, d5)', [0, 1, 3, 5, 6, 8, 10]],
  };
  const MAJ = [0, 2, 4, 5, 7, 9, 11];
  const diffDegs = (mode) => MODE_INFO[mode][2].map((s, i) => (s !== MAJ[i] ? `${s < MAJ[i] ? '♭' : '♯'}${i + 1}` : null)).filter(Boolean);
  wrap('uMode', (q) => {
    const notes = q.notation.notes.map((x) => x.keys[0]);
    const tonic = notes[0], mode = q.c[0].split(' ').pop();
    const majNotes = [['P', 1], ['M', 2], ['M', 3], ['P', 4], ['P', 5], ['M', 6], ['M', 7]].map(([a, b]) => addInterval(tonic, a, b));
    const d = diffDegs(mode);
    const why = q.c.slice(1).map((w) => { const mm = w.split(' ').pop(), dd = diffDegs(mm); return [`${mm} = ${MODE_INFO[mm][0]}${dd.length ? ` → ต้องมี ${dd.join(', ')}` : ''}`, `${mm} = ${MODE_INFO[mm][1]}${dd.length ? ` → would have ${dd.join(', ')}` : ''}`]; });
    return {
      qAlt: `Which mode is this scale starting on ${pc(tonic)}?`,
      en: `Step 1: compare with ${pc(tonic)} major (Ionian): ${majNotes.map(pc).join(' ')}.\nStep 2: the scale given: ${notes.map(pc).join(' ')}.\nStep 3: ${d.length ? `it differs at ${d.join(', ')}` : 'no differences'} — the fingerprint of ${mode}: ${MODE_INFO[mode][1]}.\nAnswer: ${q.c[0]}`,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: 'ปุ่มขาว: C Ionian · D Dorian · E Phrygian · F Lydian · G Mixolydian · A Aeolian · B Locrian', tipEn: 'White keys: C Ionian · D Dorian · E Phrygian · F Lydian · G Mixolydian · A Aeolian · B Locrian',
      img: majNotes.every(Boolean) ? [{ cap: `เทียบ ${pc(tonic)} major — เสียงที่ต่างคือ ${d.join(', ') || 'ไม่มี'}`, capEn: `Compare ${pc(tonic)} major — differences: ${d.join(', ') || 'none'}`, n: { clef: 'treble', notes: [...majNotes, tonic.replace(/\d$/, (x) => +x + 1)].map((k) => Q(k)) } }] : undefined,
    };
  });

  /* =========================================================
     Figured bass V7
     ========================================================= */
  const FIG = { V7: ['ราก', 'root', 0], 'V6/5': ['ขั้น 3', '3rd', 1], 'V4/3': ['ขั้น 5', '5th', 2], 'V4/2': ['ขั้น 7', '7th', 3] };
  wrap('uFiguredV7', (q) => {
    const ton = /ในคีย์ (\S+) major/.exec(q.q)[1].replace('♭', 'b').replace('♯', '#');
    const tonic = ton + '3';
    const sn = (k) => { const [a, b] = SCALE.major[k % 7]; return addInterval(tonic, a, b).replace(/-?\d+$/, (o) => +o + Math.floor(k / 7)); };
    const v7 = [sn(4), sn(6), sn(8), sn(10)];
    const f = FIG[q.c[0]];
    const why = q.c.slice(1).map((w) => { const x = FIG[w]; return [`${w} = ${x[0]}ของคอร์ด (${pc(v7[x[2]])}) อยู่ล่างสุด`, `${w} = the ${x[1]} (${pc(v7[x[2]])}) in the bass`]; });
    return {
      qAlt: `In ${pretty(ton)} major, which position of V7 is this (figured bass)?`,
      en: `Step 1: V7 in ${pretty(ton)} major = ${v7.map(pc).join(' – ')} (root–3–5–7).\nStep 2: the lowest note is ${pc(q.notation.notes[0].keys[0])} = the ${f[1]}.\nStep 3: seventh-chord figures: root = 7 · 3rd = 6/5 · 5th = 4/3 · 7th = 4/2.\nAnswer: ${q.c[0]}`,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: '7 → 6/5 → 4/3 → 4/2 (ราก → 3 → 5 → 7 อยู่ล่าง)', tipEn: '7 → 6/5 → 4/3 → 4/2 (root → 3rd → 5th → 7th in the bass)',
      img: [{ cap: `V7 ตำแหน่งราก: ${v7.map(pc).join('–')}`, capEn: `V7 in root position: ${v7.map(pc).join('–')}`, n: { clef: 'bass', key: ton, notes: [{ keys: v7.map((k) => k.replace(/\d$/, (o) => +o - (midi(v7[0]) > 57 ? 1 : 0))), dur: 'w', accs: ['', '', '', ''] }] } }],
    };
  });

  /* =========================================================
     โสตทักษะ — ขั้นคู่
     ========================================================= */
  const EAR_SONG = {
    1: ['ธีมหนัง Jaws (ดึ่ง-ดึ่ง)', 'Jaws theme'], 2: ['Happy Birthday (แฮป-ปี้)', 'Happy Birthday ("Hap-py")'], 3: ['Greensleeves (2 โน้ตแรก)', 'Greensleeves (first two notes)'],
    4: ['When the Saints (โอ-เวน)', 'When the Saints ("Oh when")'], 5: ['Here Comes the Bride', 'Here Comes the Bride'], 6: ['The Simpsons (เดอะ-ซิม)', 'The Simpsons ("The Simp-")'],
    7: ['Twinkle Twinkle (ทวิง-เคิล ทวิง-เคิล)', 'Twinkle Twinkle'], 8: ['Love Story (Where do I…)', 'Love Story theme'], 9: ['My Bonnie (มาย-บอน)', 'My Bonnie'],
    10: ['Somewhere (West Side Story)', 'Somewhere (West Side Story)'], 11: ['Take On Me (ท่อนฮุก)', 'Take On Me (chorus)'], 12: ['Somewhere Over the Rainbow (ซัม-แวร์)', 'Somewhere Over the Rainbow'],
  };
  const EAR_LABEL = { 'm2': 1, 'M2': 2, 'm3': 3, 'M3': 4, 'P4': 5, 'A4/d5': 6, 'ไทรโทน': 6, 'P5': 7, 'm6': 8, 'M6': 9, 'm7': 10, 'M7': 11, 'P8': 12 };
  const enLabel = (l) => { const m = /\(([^)]+)\)/.exec(l); const core = m ? m[1] : l.replace(' ขาลง', ''); return (core === 'ไทรโทน' ? 'tritone' : core) + (/ขาลง/.test(l) ? ' descending' : ''); };
  const labelSemis = (l) => { const m = /\(([^)]+)\)/.exec(l); const key = m ? m[1] : l.replace(' ขาลง', ''); return EAR_LABEL[key]; };
  function earIntervalBuild(q, desc) {
    const notesEv = q.audio.filter((e) => e.notes && e.notes.length === 1);
    const a = notesEv[0].notes[0], b = notesEv[1].notes[0];
    const lo = Math.min(a, b), s = Math.abs(a - b);
    const why = q.c.slice(1).map((w) => { const ws = labelSemis(w); const d = ws - s; return [`${w.replace(' ขาลง', '')} = ${ws} ครึ่งเสียง (${d > 0 ? 'กว้าง' : 'แคบ'}กว่าที่ได้ยิน ${Math.abs(d)} ครึ่งเสียง)`, `${enLabel(w).replace(' descending', '')} = ${ws} semitones (${Math.abs(d)} ${d > 0 ? 'wider' : 'narrower'} than what you heard)`]; });
    const song = EAR_SONG[s];
    const up = nameOf(lo + s), low = nameOf(lo);
    return {
      qAlt: desc ? 'Listen to the descending interval (high note first) and name it.' : 'Listen and name the interval (played one note at a time, then together).',
      th: `ขั้นคู่นี้คือ ${q.c[0]} ห่างกัน ${s} ครึ่งเสียง\n\nวิธีฟัง: ร้องตามเสียงแรกแล้วไล่ขึ้น${desc ? 'ลง' : ''}ทีละครึ่งเสียงในใจ หรือเทียบกับเพลงที่จำได้ — ${s} ครึ่งเสียง${desc ? ' (กลับทิศเป็นขาขึ้นในใจ)' : ''} คือช่วงต้นเพลง ${song[0]}`,
      en: `This is ${enLabel(q.c[0])}: ${s} semitones.\n\nHow to hear it: sing the first note and compare with a tune you know — ${s} semitones${desc ? ' (turn it upward in your head)' : ''} is the opening of ${song[1]}.`,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: 'ผูกขั้นคู่กับเพลงที่จำได้ 1 เพลงต่อ 1 ขั้นคู่', tipEn: 'Link each interval to one tune you know',
      img: [{ cap: `ตัวอย่างบนโน้ต: ${pretty(bare(desc ? up : low))} → ${pretty(bare(desc ? low : up))}`, capEn: `On the stave: ${pretty(bare(desc ? up : low))} → ${pretty(bare(desc ? low : up))}`, n: { clef: lo < 57 ? 'bass' : 'treble', notes: desc ? [W(up), W(low)] : [W(low), W(up)] } }],
    };
  }
  wrap('earInterval', (q) => earIntervalBuild(q, false));
  wrap('uEarIntervalDesc', (q) => earIntervalBuild(q, true));

  /* ---------- ฟังคอร์ด ---------- */
  const CHORD_SOUND = {
    'เมเจอร์ (Major)': ['สว่าง มั่นคง', 'bright and stable', 'major', 'M3 + m3'],
    'ไมเนอร์ (Minor)': ['มืด เศร้า', 'dark, sad', 'minor', 'm3 + M3'],
    'ดิมินิชท์ (Diminished)': ['ตึง แคบ ไม่มั่นคง', 'tense, narrow, unstable', 'dim', 'm3 + m3'],
    'ออกเมนเต็ด (Augmented)': ['ลอย ๆ แปลก เหมือนฝัน', 'floating, eerie, dreamlike', 'aug', 'M3 + M3'],
  };
  wrap('earChord', (q) => {
    const S = CHORD_SOUND[q.c[0]];
    const ns = safe(() => triad('C4', S[2]));
    const why = q.c.slice(1).map((w) => { const x = CHORD_SOUND[w]; return [`${w} = ${x[3]} ฟัง${x[0]}`, `${{ dim: 'diminished', aug: 'augmented' }[x[2]] || x[2]} = ${x[3]}, sounds ${x[1]}`]; });
    return {
      qAlt: 'Listen to the triad and name its quality (played broken, then together).',
      th: `คอร์ดนี้คือ ${q.c[0]} = ${S[3]} ฟัง${S[0]}\n\nวิธีฟัง: ฟังคู่ 3 ล่างก่อน (เสียงที่ 1 → 2) ถ้าสว่างเป็น M3 (major/augmented) ถ้ามืดเป็น m3 (minor/diminished) แล้วฟังเสียงบนสุดว่ามั่นคง (P5) หรือตึง/ลอย`,
      en: `This is ${S[2] === 'dim' ? 'diminished' : S[2] === 'aug' ? 'augmented' : S[2]} = ${S[3]}, sounding ${S[1]}.\n\nHow to hear it: listen to the bottom 3rd first (bright = M3: major/augmented; dark = m3: minor/diminished), then whether the top sounds stable (P5) or tense/floating.`,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: 'Major สว่าง · Minor เศร้า · Dim ตึง · Aug ลอย', tipEn: 'Major bright · minor sad · dim tense · aug floating',
      img: ns ? [{ cap: `ตัวอย่างบน C: ${ns.map(pc).join('–')}`, capEn: `Example on C: ${ns.map(pc).join('–')}`, n: { clef: 'treble', notes: [CH(ns)] } }] : undefined,
    };
  });

  /* ---------- ฟังบันไดเสียง ---------- */
  const SCALE_TYPES = {
    'เมเจอร์ (Major)': ['ขั้น 3 สูง (M3) สว่าง', 'raised 3rd (M3), bright', ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], [], 'major'],
    'เนเชอรัลไมเนอร์ (Natural minor)': ['ขั้น 3, 6, 7 ต่ำ ไม่มี leading note', 'flat 3rd, 6th and 7th; no leading note', ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'], [], 'natural minor'],
    'ฮาร์โมนิกไมเนอร์ (Harmonic minor)': ['ยกขั้น 7 ช่วง 6–7 กว้าง 1½ เสียง ฟังแขก ๆ', 'raised 7th; the wide 6–7 step sounds "exotic"', ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G#5', 'A5'], [6], 'harmonic minor'],
    'เมโลดิกไมเนอร์ขาขึ้น (Melodic minor)': ['ยกขั้น 6 และ 7 ช่วงบนเหมือนเมเจอร์', 'raised 6th and 7th; the top half sounds major', ['A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G#5', 'A5'], [5, 6], 'melodic minor'],
  };
  wrap('earScale', (q) => {
    const S = SCALE_TYPES[q.c[0]];
    const why = q.c.slice(1).map((w) => { const x = SCALE_TYPES[w]; return [`${w}: ${x[0]}`, `${x[4]}: ${x[1]}`]; });
    return {
      qAlt: 'Listen to the ascending scale and name its type.',
      th: `บันไดเสียงนี้คือ ${q.c[0]} — ${S[0]}\n\nวิธีฟัง: (1) ฟังขั้นที่ 3 ว่าสว่าง (เมเจอร์) หรือมืด (ไมเนอร์) (2) ถ้าเป็นไมเนอร์ ฟังช่วงท้าย: ไม่มีแรงดึงเข้าโทนิก = natural · ช่วงกว้างแปลก ๆ ก่อนถึงโทนิก = harmonic · ช่วงบนสว่างเหมือนเมเจอร์ = melodic`,
      en: `This is the ${S[4]} scale — ${S[1]}.\n\nHow to hear it: (1) is the 3rd bright (major) or dark (minor)? (2) If minor, listen to the top: no pull to the tonic = natural · a wide, exotic step before the tonic = harmonic · a bright, major-sounding top = melodic.`,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: 'ฟังขั้น 3 ก่อน แล้วฟังขั้น 6–7', tipEn: 'Listen to the 3rd first, then to degrees 6–7',
      img: [{ cap: `ตัวอย่าง: ${S[2].map((k) => pretty(bare(k))).join(' ')}`, capEn: `Example: ${S[2].map((k) => pretty(bare(k))).join(' ')}`, n: { clef: 'treble', notes: S[2].map((k, i) => Q(k, S[3].includes(i) ? '#' : '')) } }],
    };
  });

  /* ---------- ฟังอัตราจังหวะ ---------- */
  const METER = { 'สองจังหวะ (2/4)': [2, '2/4'], 'สามจังหวะ (3/4)': [3, '3/4'], 'สี่จังหวะ (4/4)': [4, '4/4'] };
  wrap('earMeter', (q) => {
    const [n, ts] = METER[q.c[0]];
    const why = q.c.slice(1).map((w) => { const [m] = METER[w]; return [`${w}: เสียงหนักจะมาทุก ${m} ครั้ง`, `${METER[w][1]}: the accent would come every ${m} beats`]; });
    const bar = Array.from({ length: n }, (_, i) => Q(i === 0 ? 'C5' : 'G4'));
    return {
      qAlt: 'Listen and count: how many beats are in each bar? (The loud click is beat 1.)',
      th: `เสียงหนักมาทุก ๆ ${n} จังหวะ จึงเป็น${q.c[0]}\n\nวิธีฟัง: เคาะเท้าตามทุกเสียง แล้วนับ "1" ทุกครั้งที่ได้ยินเสียงหนัก นับต่อไปจนกว่าจะเจอเสียงหนักครั้งถัดไป ตัวเลขสุดท้ายคือจำนวนจังหวะต่อห้อง`,
      en: `The accent comes every ${n} beats, so it is ${ts}.\n\nHow to hear it: tap along, say "1" on every loud beat and keep counting until the next one; the last number is the beats per bar.`,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: '2 = มาร์ช · 3 = วอลซ์ · 4 = เพลงป๊อปทั่วไป', tipEn: '2 = march · 3 = waltz · 4 = most pop songs',
      img: [{ cap: `${ts}: โน้ตตัวแรกของแต่ละห้องคือจังหวะหนัก`, capEn: `${ts}: the first note of each bar is the strong beat`, n: { clef: 'treble', time: ts, notes: [...bar, BAR, ...bar.map((x) => ({ ...x }))] } }],
    };
  });

  /* ---------- ฟังเคเดนซ์ ---------- */
  const CAD = {
    'เพอร์เฟกต์ (V–I)': ['จบสมบูรณ์ เหมือนจุดฟูลสต็อป', 'a firm full stop', 'perfect', [['G3', 'B3', 'D4', 'G4'], ['C4', 'E4', 'G4', 'C5']]],
    'เพลกัล (IV–I)': ['จบนุ่ม ๆ แบบ "อา-เมน"', 'a soft "A-men" ending', 'plagal', [['F3', 'A3', 'C4', 'F4'], ['C4', 'E4', 'G4', 'C5']]],
    'อิมเพอร์เฟกต์ (จบที่ V)': ['ค้าง เหมือนประโยคคำถาม', 'left hanging, like a question', 'imperfect', [['C4', 'E4', 'G4', 'C5'], ['G3', 'B3', 'D4', 'G4']]],
    'อินเทอร์รัปเต็ด (V–vi)': ['หลอกว่าจะจบ แต่ไปคอร์ดไมเนอร์', 'expected to end, but turns to a minor chord', 'interrupted', [['G3', 'B3', 'D4', 'G4'], ['A3', 'C4', 'E4', 'A4']]],
  };
  wrap('earCadence', (q) => {
    const S = CAD[q.c[0]];
    const why = q.c.slice(1).map((w) => { const x = CAD[w]; return [`${w}: ${x[0]}`, `${x[2]}: ${x[1]}`]; });
    return {
      qAlt: 'Listen to the four chords and name the cadence at the end.',
      th: `ทางเดินคอร์ดนี้จบแบบ ${q.c[0]} — ${S[0]}\n\nวิธีฟัง: ฟังคอร์ดสุดท้ายก่อน ถ้ารู้สึก "จบ" = perfect หรือ plagal (perfect หนักแน่นกว่า plagal นุ่มกว่า) ถ้ารู้สึก "ค้าง" = imperfect ถ้ารู้สึก "ผิดคาด เศร้าลง" = interrupted`,
      en: `This progression ends with a ${S[2]} cadence — ${S[1]}.\n\nHow to hear it: focus on the last chord. Finished = perfect or plagal (perfect firmer, plagal softer). Hanging = imperfect. A surprising, darker turn = interrupted.`,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: 'จบ (perfect/plagal) · ค้าง (imperfect) · หลอก (interrupted)', tipEn: 'Finished (perfect/plagal) · hanging (imperfect) · surprise (interrupted)',
      img: [{ cap: `ตัวอย่างใน C major: ${q.c[0]}`, capEn: `Example in C major: ${S[2]} cadence`, n: { clef: 'treble', notes: [CH(S[3][0]), BAR, CH(S[3][1])] } }],
    };
  });

  /* ---------- ฟังคอร์ดเซเวนท์ ---------- */
  const SEV_EAR = {
    'Major 7th (Δ7)': ['สว่าง นุ่ม ฝัน ๆ', 'bright, soft, dreamy', ['C4', 'E4', 'G4', 'B4']],
    'Dominant 7th (7)': ['อยากไปต่อ ต้องคลี่คลาย', 'restless, wants to resolve', ['C4', 'E4', 'G4', 'Bb4']],
    'Minor 7th (m7)': ['เศร้านุ่ม ๆ แบบแจ๊ส', 'soft, mellow, jazzy', ['C4', 'Eb4', 'G4', 'Bb4']],
    'Half-diminished 7th (ø7)': ['มืด ลึกลับ', 'dark, mysterious', ['C4', 'Eb4', 'Gb4', 'Bb4']],
    'Diminished 7th (°7)': ['ตึงมาก น่ากลัว (ดนตรีหนังผี)', 'very tense, spooky', ['C4', 'Eb4', 'Gb4', 'Bbb4']],
  };
  wrap('uEarSeventh', (q) => {
    const S = SEV_EAR[q.c[0]];
    const why = q.c.slice(1).map((w) => { const x = SEV_EAR[w]; return [`${w}: ${x[0]}`, `${w}: ${x[1]}`]; });
    return {
      qAlt: 'Listen to the four-note chord and name the type of seventh chord.',
      en: `This is a ${q.c[0]} — it sounds ${S[1]}.\n\nHow to hear it: first decide if the lower triad is major (bright) or minor/diminished (dark), then listen to the top note: a major 7th sits a semitone below the octave (very close, shimmering), a minor 7th a tone below.`,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: 'แยกฟัง: ทรัยแอดล่างสว่างหรือมืด + เสียงบนสุดชิดออกเทฟแค่ไหน', tipEn: 'Listen in two parts: bright or dark triad + how close the top is to the octave',
      img: [{ cap: `ตัวอย่างบน C: ${S[2].map((k) => pretty(bare(k))).join('–')}`, capEn: `Example on C: ${S[2].map((k) => pretty(bare(k))).join('–')}`, n: { clef: 'treble', notes: [CH(S[2])] } }],
    };
  });

  /* ---------- ฟังโหมด ---------- */
  const WHITE_MODE = { Ionian: 'C4', Dorian: 'D4', Phrygian: 'E4', Lydian: 'F4', Mixolydian: 'G4', Aeolian: 'A4', Locrian: 'B4' };
  wrap('uEarMode', (q) => {
    const mode = q.c[0], start = WHITE_MODE[mode];
    const scale = Array.from({ length: 8 }, (_, i) => fromDIndex(dIndex(start) + i));
    const why = q.c.slice(1).map((w) => [`${w} = ${MODE_INFO[w][0]}`, `${w} = ${MODE_INFO[w][1]}`]);
    return {
      qAlt: 'Listen to the ascending scale and name the mode.',
      en: `This is ${mode}: ${MODE_INFO[mode][1]}.\n\nHow to hear it: listen to the 3rd first (bright = major family: Ionian, Lydian, Mixolydian; dark = minor family: Dorian, Phrygian, Aeolian, Locrian), then find the one note that differs from the ordinary major or minor scale.`,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: 'Lydian = ♯4 · Mixolydian = ♭7 · Dorian = ♮6 · Phrygian = ♭2 · Locrian = ♭2 + ♭5', tipEn: 'Lydian = ♯4 · Mixolydian = ♭7 · Dorian = ♮6 · Phrygian = ♭2 · Locrian = ♭2 + ♭5',
      img: [{ cap: `${mode} บนปุ่มขาว: เริ่มที่ ${bare(start)}`, capEn: `${mode} on white keys: starting on ${bare(start)}`, n: { clef: 'treble', notes: scale.map((k) => Q(k)) } }],
    };
  });

  /* ---------- Dictation ทำนอง ---------- */
  const SOL = ['โด', 'เร', 'มี', 'ฟา', 'ซอล', 'ลา', 'ที', 'โด(สูง)'];
  const SOL_EN = ['do', 're', 'mi', 'fa', 'sol', 'la', 'ti', 'do′'];
  const C_MAJ = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
  const degsOf = (s) => s.split(' – ').map((x) => SOL.indexOf(x));
  wrap('uEarMelody', (q) => {
    const d = degsOf(q.c[0]);
    const why = q.c.slice(1).map((w) => {
      const x = degsOf(w); const i = x.findIndex((v, k) => v !== d[k]);
      const dir = (arr) => (arr[i] > arr[i - 1] ? 'ขึ้น' : arr[i] < arr[i - 1] ? 'ลง' : 'ซ้ำ');
      return [`เสียงที่ ${i + 1} ต้องเป็น "${SOL[d[i]]}" (${dir(d)}จาก ${SOL[d[i - 1]]}) ไม่ใช่ "${SOL[x[i]]}"`, `Note ${i + 1} should be "${SOL_EN[d[i]]}", not "${SOL_EN[x[i]]}"`];
    });
    return {
      qAlt: 'Listen to the melody (starting on "do" after the tonic chord) and choose the matching notes.',
      en: `The melody is ${d.map((x) => SOL_EN[x]).join(' – ')}.\n\nTechnique: (1) sing it back in your head straight away (2) follow the direction first — up, down or repeated (3) notice steps versus leaps (4) compare the choices one note at a time and eliminate those with the wrong direction.`,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: 'ฟังทิศทางก่อน แล้วค่อยฟังระยะ (ทีละขั้น / กระโดด)', tipEn: 'Direction first, then distance (step / leap)',
      img: [{ cap: `ทำนองในคีย์ C: ${d.map((x) => SOL[x]).join(' ')}`, capEn: `The melody in C: ${d.map((x) => SOL_EN[x]).join(' ')}`, n: { clef: 'treble', notes: d.map((x) => Q(C_MAJ[x])) } }],
    };
  });

  /* ---------- Dictation จังหวะ ---------- */
  const R_SYM = {
    '♩': [['q'], 'ตัวดำ 1 ตัว (1 เสียง)', 'one crotchet (1 sound)'],
    '♫': [['8', '8'], 'เขบ็ต 1 ชั้น 2 ตัว (2 เสียง)', 'two quavers (2 sounds)'],
    '♬♬': [['16', '16', '16', '16'], 'เขบ็ต 2 ชั้น 4 ตัว (4 เสียง)', 'four semiquavers (4 sounds)'],
    '♪♬': [['8', '16', '16'], 'เขบ็ต 1 ชั้น + 2 ชั้น 2 ตัว (ยาว-สั้น-สั้น)', 'quaver + two semiquavers (long-short-short)'],
    '♬♪': [['16', '16', '8'], 'เขบ็ต 2 ชั้น 2 ตัว + 1 ชั้น (สั้น-สั้น-ยาว)', 'two semiquavers + quaver (short-short-long)'],
    '𝄽': [['qr'], 'ตัวหยุด 1 จังหวะ (เงียบ)', 'crotchet rest (silence)'],
  };
  const beatsOf = (s) => s.split('  |  ');
  wrap('uEarRhythm', (q) => {
    const b = beatsOf(q.c[0]);
    const why = q.c.slice(1).map((w) => {
      const x = beatsOf(w); const i = x.findIndex((v, k) => v !== b[k]);
      return [`จังหวะที่ ${i + 1} ได้ยิน ${R_SYM[b[i]][1]} ไม่ใช่ ${R_SYM[x[i]][1]}`, `Beat ${i + 1} is ${R_SYM[b[i]][2]}, not ${R_SYM[x[i]][2]}`];
    });
    const notes = b.flatMap((sym) => R_SYM[sym][0].map((d) => (d === 'qr' ? { rest: true, dur: 'q' } : { keys: ['B4'], dur: d })));
    return {
      qAlt: 'After the four count-in clicks, listen to one bar of 4/4 and choose the matching rhythm.',
      en: `The rhythm is ${b.join(' | ')} (one symbol per beat): ${b.map((s) => R_SYM[s][2]).join(', ')}.\n\nTechnique: tap your foot with the count-in, count "1-and-2-and" and listen to how many sounds fall in each beat (1 = crotchet, 2 = quavers, 4 = semiquavers, none = rest).`,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: 'นับว่าแต่ละจังหวะมีกี่เสียง: 1 / 2 / 3 / 4 / เงียบ', tipEn: 'Count the sounds in each beat: 1 / 2 / 3 / 4 / none',
      img: [{ cap: `จังหวะที่ถูก (4/4)`, capEn: `The correct rhythm (4/4)`, n: { clef: 'treble', time: '4/4', beam: true, groups: ['1/4'], notes } }],
    };
  });

  /* ---------- ทางเดินคอร์ด ---------- */
  const PROG_CH = { I: ['C4', 'E4', 'G4'], ii: ['D4', 'F4', 'A4'], IV: ['F4', 'A4', 'C5'], V: ['G3', 'B3', 'D4'], vi: ['A3', 'C4', 'E4'], V7: ['G3', 'B3', 'D4', 'F4'] };
  const BASS_SOL = { I: 'โด', ii: 'เร', IV: 'ฟา', V: 'ซอล', vi: 'ลา', V7: 'ซอล' };
  const BASS_EN = { I: 'do', ii: 're', IV: 'fa', V: 'sol', vi: 'la', V7: 'sol' };
  wrap('uEarProgression', (q) => {
    const p = q.c[0].split(' – ');
    const why = q.c.slice(1).map((w) => {
      const x = w.split(' – '); const i = x.findIndex((v, k) => v !== p[k]);
      return [`คอร์ดที่ ${i + 1} คือ ${p[i]} (เบส "${BASS_SOL[p[i]]}") ไม่ใช่ ${x[i]} (เบส "${BASS_SOL[x[i]]}")`, `Chord ${i + 1} is ${p[i]} (bass "${BASS_EN[p[i]]}"), not ${x[i]} (bass "${BASS_EN[x[i]]}")`];
    });
    const notes = []; p.forEach((c, i) => { if (i) notes.push(BAR); notes.push(CH(PROG_CH[c])); });
    return {
      qAlt: 'Listen to the four-chord progression (major key) and choose the correct one.',
      en: `The progression is ${q.c[0]}.\n\nTechnique: follow the bass line — I (do) · ii (re) · IV (fa) · V (sol) · vi (la). Minor chords (ii, vi) sound darker than major chords.`,
      why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
      tip: 'ฟังเสียงเบส แล้วแปลงเป็นโด เร มี', tipEn: 'Follow the bass and turn it into do-re-mi',
      img: [{ cap: `ตัวอย่างใน C major: ${q.c[0]}`, capEn: `Example in C major: ${q.c[0]}`, n: { clef: 'treble', notes } }],
    };
  });
})();
