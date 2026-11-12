/* =========================================================
   music.js — ทฤษฎีดนตรี + เสียง + บรรทัดห้าเส้น + ตัวสร้างโจทย์อัตโนมัติ
   ========================================================= */
const Music = (() => {
  const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const NAT = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const ACC_VAL = { '': 0, n: 0, '#': 1, '##': 2, b: -1, bb: -2 };
  const ACC_SYM = { '': '', n: '♮', '#': '♯', '##': '𝄪', b: '♭', bb: '𝄫' };

  const rand = (n) => Math.floor(Math.random() * n);
  const pick = (arr) => arr[rand(arr.length)];
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  function parse(s) {
    const m = /^([A-G])(##|#|bb|b|n)?(-?\d)$/.exec(s);
    if (!m) throw new Error('bad note ' + s);
    const acc = m[2] || '';
    return { letter: m[1], acc, accVal: ACC_VAL[acc], oct: +m[3] };
  }
  const midi = (s) => { const p = parse(s); return 12 * (p.oct + 1) + NAT[p.letter] + p.accVal; };
  const vexKey = (s) => { const p = parse(s); return p.letter.toLowerCase() + (p.acc === 'n' ? '' : p.acc) + '/' + p.oct; };
  const pc = (s) => { const p = parse(s); return p.letter + ACC_SYM[p.acc === 'n' ? '' : p.acc]; };
  const pretty = (name) => name.replace(/#/g, '♯').replace(/(?<=[A-G])b/g, '♭');

  /* ---------- ขั้นคู่ ---------- */
  const PERFECT = [1, 4, 5, 8];
  const BASE = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11, 8: 12 };
  const Q_TH = { P: 'เพอร์เฟกต์', M: 'เมเจอร์', m: 'ไมเนอร์', A: 'ออกเมนเต็ด', d: 'ดิมินิชท์' };
  const qOffset = (q, num) => PERFECT.includes(num) ? { P: 0, A: 1, d: -1 }[q] : { M: 0, m: -1, A: 1, d: -2 }[q];
  const intervalLabel = (q, num) => `${Q_TH[q]} ${num === 8 ? '8 (ออกเทฟ)' : num} (${q}${num})`;

  function addInterval(lower, q, num) {
    const p = parse(lower);
    const li = LETTERS.indexOf(p.letter) + num - 1;
    const letter = LETTERS[li % 7];
    const oct = p.oct + Math.floor(li / 7);
    const target = midi(lower) + BASE[num] + qOffset(q, num);
    const accVal = target - (12 * (oct + 1) + NAT[letter]);
    if (Math.abs(accVal) > 1) return null;
    return letter + { 0: '', 1: '#', '-1': 'b' }[accVal] + oct;
  }

  const TRIADS = {
    major: { th: 'major', parts: [['M', 3], ['P', 5]] },
    minor: { th: 'minor', parts: [['m', 3], ['P', 5]] },
    dim: { th: 'diminished', parts: [['m', 3], ['d', 5]] },
    aug: { th: 'augmented', parts: [['M', 3], ['A', 5]] },
  };
  function triad(root, quality) {
    const notes = [root];
    for (const [q, n] of TRIADS[quality].parts) {
      const x = addInterval(root, q, n);
      if (!x) return null;
      notes.push(x);
    }
    return notes;
  }

  /* ---------- กุญแจเสียง ---------- */
  const KEYS = [
    { major: 'C', minor: 'A', n: 0, type: '' },
    { major: 'G', minor: 'E', n: 1, type: '#' }, { major: 'D', minor: 'B', n: 2, type: '#' },
    { major: 'A', minor: 'F#', n: 3, type: '#' }, { major: 'E', minor: 'C#', n: 4, type: '#' },
    { major: 'B', minor: 'G#', n: 5, type: '#' }, { major: 'F#', minor: 'D#', n: 6, type: '#' },
    { major: 'F', minor: 'D', n: 1, type: 'b' }, { major: 'Bb', minor: 'G', n: 2, type: 'b' },
    { major: 'Eb', minor: 'C', n: 3, type: 'b' }, { major: 'Ab', minor: 'F', n: 4, type: 'b' },
    { major: 'Db', minor: 'Bb', n: 5, type: 'b' }, { major: 'Gb', minor: 'Eb', n: 6, type: 'b' },
  ];

  /* =========================================================
     เสียง (Web Audio) — ไม่ต้องใช้ไฟล์เสียง
     ========================================================= */
  let ctx = null, bus = null;
  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function tone(m, t, dur, vel) {
    const c = ctx, g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.012);
    g.gain.exponentialRampToValueAtTime(vel * 0.45, t + 0.3);
    g.gain.setValueAtTime(vel * 0.45, t + Math.max(0.3, dur - 0.05));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.35);
    g.connect(bus);
    [['triangle', 1, 1], ['sine', 2, 0.35], ['sine', 3, 0.12], ['sine', 4, 0.05]].forEach(([type, mult, amp]) => {
      const o = c.createOscillator(), og = c.createGain();
      o.type = type; o.frequency.value = freq(m) * mult; og.gain.value = amp;
      o.connect(og); og.connect(g); o.start(t); o.stop(t + dur + 0.4);
    });
  }
  function click(t, accent) {
    const c = ctx, o = c.createOscillator(), g = c.createGain();
    o.type = 'square'; o.frequency.value = accent ? 1760 : 1100;
    g.gain.setValueAtTime(accent ? 0.35 : 0.13, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.08);
  }
  /** events: [{notes:[midi], dur:sec} | {click:true/false, dur} | {rest:true, dur}] */
  function play(events) {
    const c = ac();
    stop();
    bus = c.createGain(); bus.gain.value = 0.9; bus.connect(c.destination);
    let t = c.currentTime + 0.06;
    for (const e of events) {
      if (e.click !== undefined) click(t, e.click);
      else if (e.notes) e.notes.forEach((n) => tone(n, t, e.dur * 0.95, (0.28 * (e.vol || 1)) / Math.sqrt(e.notes.length))); // vol = ดัง–เบา (คอร์สเด็กเล็ก)
      t += e.dur;
    }
  }
  function stop() {
    if (bus) { try { bus.gain.setValueAtTime(0, ctx.currentTime); bus.disconnect(); } catch (e) {} bus = null; }
  }

  /* =========================================================
     บรรทัดห้าเส้น (VexFlow)
     notation: {clef, key, time, notes:[{keys:['C4'], dur:'w', dots:0, rest:false}]}
     ========================================================= */
  function renderStaff(el, n) {
    el.innerHTML = '';
    if (!window.Vex) { el.textContent = '(โหลดตัวแสดงโน้ตไม่สำเร็จ — ตรวจสอบอินเทอร์เน็ต)'; return; }
    const VF = Vex.Flow;
    const clef = n.clef || 'treble';
    const count = (n.notes || []).length;
    const want = Math.max(n.minW || 0, 90 + (n.key ? 70 : 0) + (n.time ? 30 : 0) + Math.max(count, 1) * (count > 4 ? 44 : 70));
    const availPx = Math.max((el.clientWidth || 320) - 12, 240);
    // ขยายโน้ตให้อ่านง่ายบนมือถือ (1.5 เท่า) แต่ถ้าโน้ตเยอะจนล้นจอ ให้ย่อลงพอดีความกว้าง
    const S = want * 1.5 > availPx ? Math.max(0.85, availPx / want) : 1.5;
    const avail = availPx / S;
    const width = Math.min(avail, Math.max(want, 170));
    const renderer = new VF.Renderer(el, VF.Renderer.Backends.SVG);
    renderer.resize(width * S, 125 * S);
    const c = renderer.getContext();
    c.scale(S, S);
    const stave = new VF.Stave(4, 8, width - 10);
    stave.addClef(clef);
    if (n.key) stave.addKeySignature(n.key);
    if (n.time) stave.addTimeSignature(n.time);
    stave.setContext(c).draw();
    if (!count) return;
    const notes = n.notes.map((x) => {
      if (x.bar) return new VF.BarNote(); // เส้นกั้นห้อง
      const dur = (x.dur || 'w');
      if (x.rest) {
        return new VF.StaveNote({ clef, keys: [clef === 'bass' ? 'd/3' : 'b/4'], duration: dur + 'r', dots: x.dots || 0 });
      }
      const sn = new VF.StaveNote({ clef, keys: x.keys.map(vexKey), duration: dur, dots: x.dots || 0, auto_stem: true });
      x.keys.forEach((k, i) => {
        const a = x.accs ? x.accs[i] : parse(k).acc; // accs = เครื่องหมายที่ต้องเขียนจริง (หลังหักกุญแจเสียงแล้ว)
        if (a && !x.hideAcc) sn.addModifier(new VF.Accidental(a), i);
      });
      if (x.art && VF.Articulation) sn.addModifier(new VF.Articulation(x.art).setPosition(VF.Modifier.Position.ABOVE), 0); // เช่น 'a.' = staccato, 'a>' = accent, 'a-' = tenuto, 'a@a' = fermata
      return sn;
    });
    notes.forEach((sn, i) => { for (let d = 0; d < (n.notes[i].dots || 0); d++) if (VF.Dot && VF.Dot.buildAndAttach) VF.Dot.buildAndAttach([sn], { all: true }); });
    // จัดกลุ่มเขบ็ต เช่น groups:['3/8'] (6/8 = 3+3) หรือ ['3/8','2/8'] (5/8 = 3+2)
    const bopt = n.groups ? { groups: n.groups.map((g) => { const [a, b] = g.split('/'); return new VF.Fraction(+a, +b); }) } : undefined;
    // โน้ตสามพยางค์ tuplets:[{start, count, occupied}] ต้องสร้างก่อนจัดระยะ
    const tuplets = (n.tuplets || []).map((t) => new VF.Tuplet(notes.slice(t.start, t.start + t.count), { num_notes: t.count, notes_occupied: t.occupied || 2 }));
    const beams = n.beam ? VF.Beam.generateBeams(notes, bopt) : [];
    VF.Formatter.FormatAndDraw(c, stave, notes);
    beams.forEach((b) => b.setContext(c).draw());
    tuplets.forEach((t) => t.setContext(c).draw());
    (n.ties || []).forEach(([a, b]) => new VF.StaveTie({ first_note: notes[a], last_note: notes[b], first_indices: [0], last_indices: [0] }).setContext(c).draw());
  }

  /* =========================================================
     ตัวสร้างโจทย์อัตโนมัติ — ทุกครั้งได้โจทย์ใหม่
     คืนค่า {tag, q, c:[ถูก, ผิด, ผิด, ผิด], e, notation?, audio?}
     ========================================================= */
  function distinctChoices(correct, pool, k = 3) {
    return [correct, ...shuffle(pool.filter((x) => x !== correct)).slice(0, k)];
  }

  const TREBLE_RANGE = ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6', 'D6'];
  const BASS_RANGE = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4'];
  const CLEF_TH = { treble: 'กุญแจซอล (Treble clef)', bass: 'กุญแจฟา (Bass clef)' };

  const INTERVAL_SET = [['m', 2], ['M', 2], ['m', 3], ['M', 3], ['P', 4], ['A', 4], ['d', 5], ['P', 5], ['m', 6], ['M', 6], ['m', 7], ['M', 7], ['P', 8]];
  const EAR_INTERVALS = [
    [1, 'ไมเนอร์ 2 (m2)'], [2, 'เมเจอร์ 2 (M2)'], [3, 'ไมเนอร์ 3 (m3)'], [4, 'เมเจอร์ 3 (M3)'],
    [5, 'เพอร์เฟกต์ 4 (P4)'], [6, 'ไทรโทน (A4/d5)'], [7, 'เพอร์เฟกต์ 5 (P5)'], [8, 'ไมเนอร์ 6 (m6)'],
    [9, 'เมเจอร์ 6 (M6)'], [10, 'ไมเนอร์ 7 (m7)'], [11, 'เมเจอร์ 7 (M7)'], [12, 'เพอร์เฟกต์ 8 (P8)'],
  ];
  const QUAL_TH = { major: 'เมเจอร์ (Major)', minor: 'ไมเนอร์ (Minor)', dim: 'ดิมินิชท์ (Diminished)', aug: 'ออกเมนเต็ด (Augmented)' };

  /* =========================================================
     คำอธิบายเฉลยแบบทีละขั้น (ใช้ร่วมกันทุกคอร์ส)
     ========================================================= */
  const dIndex = (s) => { const p = parse(s); return LETTERS.indexOf(p.letter) + 7 * p.oct; };
  const fromDIndex = (i) => LETTERS[((i % 7) + 7) % 7] + Math.floor(i / 7);
  const bare = (s) => s.replace(/-?\d+$/, '');
  function letterWalk(a, b) {
    const s = dIndex(a), e = dIndex(b), st = e >= s ? 1 : -1, out = [];
    for (let i = s; ; i += st) { out.push(fromDIndex(i)); if (i === e) break; }
    return out;
  }
  const CLEF_INFO = {
    treble: { name: 'กุญแจซอล (Treble clef)', ref: 'G4', where: 'เส้นที่ 2 (เส้นที่ขดของกุญแจพันอยู่) เป็นโน้ต G', bottom: 'E4' },
    bass: { name: 'กุญแจฟา (Bass clef)', ref: 'F3', where: 'เส้นที่ 4 (เส้นระหว่างจุดสองจุด) เป็นโน้ต F', bottom: 'G2' },
    alto: { name: 'กุญแจอัลโต (Alto clef)', ref: 'C4', where: 'เส้นที่ 3 (เส้นกลาง) เป็น Middle C', bottom: 'F3' },
    tenor: { name: 'กุญแจเทเนอร์ (Tenor clef)', ref: 'C4', where: 'เส้นที่ 4 เป็น Middle C', bottom: 'D3' },
  };
  function staffPos(note, clef) {
    const pos = dIndex(note) - dIndex(CLEF_INFO[clef].bottom);
    if (pos >= 0 && pos <= 8) return pos % 2 === 0 ? `เส้นที่ ${pos / 2 + 1}` : `ช่องที่ ${(pos + 1) / 2}`;
    return pos < 0 ? 'ใต้บรรทัด (เส้นน้อย)' : 'เหนือบรรทัด (เส้นน้อย)';
  }
  function noteExplain(note, clef) {
    const I = CLEF_INFO[clef], p = parse(note);
    const walk = letterWalk(I.ref, p.letter + p.oct).map(bare);
    return `ขั้นที่ 1: ${I.name} กำหนดให้${I.where}\n` +
      `ขั้นที่ 2: โน้ตในโจทย์อยู่ที่${staffPos(note, clef)} ไล่ชื่อโน้ตทีละเส้นและช่องจาก ${bare(I.ref)}: ${walk.join(' → ')}\n` +
      `คำตอบ: ${p.letter} (ตำแหน่ง ${note}${p.oct === 4 && p.letter === 'C' ? ' = Middle C' : ''})`;
  }
  const NUM_EN = { 1: 'unison', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th', 8: 'octave' };
  const Q_EN = { P: 'perfect', M: 'major', m: 'minor', A: 'augmented', d: 'diminished' };
  function intervalExplain(lower, upper, q, num, label) {
    const simple = num > 8 ? num - 7 : num;
    const upSimple = num > 8 ? fromDIndex(dIndex(upper) - 7).replace(/^([A-G])/, (m) => m + parse(upper).acc) : upper;
    const walk = letterWalk(lower, upper).map((x) => x[0]);
    const isP = PERFECT.includes(simple);
    const ref = addInterval(lower, isP ? 'P' : 'M', simple);
    let lines = `ขั้นที่ 1 นับชื่อตัวโน้ต (นับตัวแรกด้วย): ${walk.join(' → ')} = ${num} ตัว → ขั้นคู่ที่ ${num}${num > 8 ? ` (= ขั้นคู่ที่ ${simple} + 1 ออกเทฟ เรียกว่า compound ${NUM_EN[simple]})` : ''}\n`;
    if (ref) {
      const diff = midi(upSimple) - midi(ref);
      const how = diff === 0 ? 'ตรงกันพอดี' : diff < 0 ? `ต่ำกว่า ${-diff} ครึ่งเสียง` : `สูงกว่า ${diff} ครึ่งเสียง`;
      lines += `ขั้นที่ 2 เทียบกับบันไดเสียง ${pc(lower)} major: ขั้นที่ ${simple} คือ ${pc(ref)} → ถ้าเป็นโน้ตนี้จะได้ ${isP ? 'perfect' : 'major'} ${NUM_EN[simple]}\n`;
      lines += `ขั้นที่ 3 โน้ตบนคือ ${pc(upper)} ซึ่ง${how}เมื่อเทียบกับ ${pc(ref)}\n`;
      lines += isP ? 'กฎ: perfect ลดครึ่งเสียง = diminished · เพิ่มครึ่งเสียง = augmented\n' : 'กฎ: major ลดครึ่งเสียง = minor · ลดอีกครึ่งเสียง = diminished · major เพิ่มครึ่งเสียง = augmented\n';
    }
    lines += `คำตอบ: ${label} (ห่างกัน ${midi(upper) - midi(lower)} ครึ่งเสียง)`;
    return lines;
  }
  const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'], FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
  function keySigExplain(k, asMinor) {
    let s;
    if (k.type === '#') {
      const list = SHARP_ORDER.slice(0, k.n);
      s = `ขั้นที่ 1 มีชาร์ป ${k.n} ตัว: ${list.map((x) => x + '♯').join(' ')}\nขั้นที่ 2 วิธีลัด: ชาร์ปตัวสุดท้ายคือ ${list[list.length - 1]}♯ → ขึ้นไปอีกครึ่งเสียงคือชื่อคีย์เมเจอร์ = ${pretty(k.major)} major`;
    } else {
      const list = FLAT_ORDER.slice(0, k.n);
      s = `ขั้นที่ 1 มีแฟลต ${k.n} ตัว: ${list.map((x) => x + '♭').join(' ')}\nขั้นที่ 2 วิธีลัด: ${k.n === 1 ? '1 แฟลต ให้จำว่าเป็น F major' : `แฟลตตัวรองสุดท้าย (${list[list.length - 2]}♭) คือชื่อคีย์เมเจอร์`} = ${pretty(k.major)} major`;
    }
    if (asMinor) s += `\nขั้นที่ 3 ไมเนอร์คู่ขนาน (relative minor) อยู่ต่ำกว่าคีย์เมเจอร์ 3 ครึ่งเสียง (ขั้นที่ 6 ของบันไดเสียงเมเจอร์) → ${pretty(k.minor)} minor`;
    return s;
  }
  function triadExplain(notes, quality, name) {
    const i1 = midi(notes[1]) - midi(notes[0]), i2 = midi(notes[2]) - midi(notes[1]);
    const t = (s) => (s === 4 ? 'major 3rd (4 ครึ่งเสียง)' : 'minor 3rd (3 ครึ่งเสียง)');
    return `ขั้นที่ 1 โน้ตล่างสุดของคอร์ดที่ซ้อนเป็นคู่ 3 คือราก (root) = ${pc(notes[0])}\n` +
      `ขั้นที่ 2 ${pc(notes[0])} → ${pc(notes[1])} = ${t(i1)} และ ${pc(notes[1])} → ${pc(notes[2])} = ${t(i2)}\n` +
      `กฎ: M3+m3 = major · m3+M3 = minor · m3+m3 = diminished · M3+M3 = augmented\nคำตอบ: ${name}`;
  }

  const GEN = {
    noteReading() {
      const clef = Math.random() < 0.6 ? 'treble' : 'bass';
      const note = pick(clef === 'treble' ? TREBLE_RANGE : BASS_RANGE);
      const letter = parse(note).letter;
      return {
        tag: 'ทำนอง',
        q: `โน้ตบน${CLEF_TH[clef]}ตัวนี้คือโน้ตอะไร`,
        c: distinctChoices(letter, LETTERS),
        e: noteExplain(note, clef),
        notation: { clef, notes: [{ keys: [note] }] },
      };
    },

    keySignature() {
      const k = pick(KEYS.filter((x) => x.n > 0));
      const asMinor = Math.random() < 0.4;
      const name = (x) => pretty(asMinor ? x.minor : x.major) + (asMinor ? ' minor' : ' major');
      const pool = KEYS.map(name);
      return {
        tag: 'ทำนอง',
        q: `เครื่องหมายประจำกุญแจเสียงนี้ ตรงกับบันไดเสียง${asMinor ? 'ไมเนอร์' : 'เมเจอร์'}ใด`,
        c: distinctChoices(name(k), pool),
        e: keySigExplain(k, asMinor),
        notation: { clef: 'treble', key: k.major },
      };
    },

    intervalVisual() {
      let lower, upper, q, num;
      do {
        lower = pick(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B3', 'Bb3', 'Eb4', 'F#4', 'Ab4', 'C#4']);
        [q, num] = pick(INTERVAL_SET);
        upper = addInterval(lower, q, num);
      } while (!upper);
      const correct = intervalLabel(q, num);
      return {
        tag: 'ทำนอง',
        q: 'โน้ตสองตัวนี้ห่างกันเป็นขั้นคู่อะไร',
        c: distinctChoices(correct, INTERVAL_SET.map(([a, b]) => intervalLabel(a, b))),
        e: intervalExplain(lower, upper, q, num, correct),
        notation: { clef: 'treble', notes: [{ keys: [lower] }, { keys: [upper] }] },
      };
    },

    chordVisual() {
      let root, quality, notes;
      do {
        root = pick(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'Bb3', 'Eb4', 'F#4', 'Ab4']);
        quality = pick(Object.keys(TRIADS));
        notes = triad(root, quality);
      } while (!notes);
      const nm = (qq) => `${pc(root)} ${TRIADS[qq].th}`;
      return {
        tag: 'เสียงประสาน',
        q: 'ทรัยแอด (คอร์ด 3 เสียง) นี้คือคอร์ดอะไร',
        c: [nm(quality), ...Object.keys(TRIADS).filter((x) => x !== quality).map(nm)],
        e: triadExplain(notes, quality, nm(quality)),
        notation: { clef: 'treble', notes: [{ keys: notes }] },
      };
    },

    /* ---------- โสตทักษะ ---------- */
    earInterval() {
      const [semi, label] = pick(EAR_INTERVALS);
      const low = 53 + rand(12);
      const near = EAR_INTERVALS.filter(([s]) => s !== semi).sort((a, b) => Math.abs(a[0] - semi) - Math.abs(b[0] - semi)).slice(0, 5).map((x) => x[1]);
      return {
        tag: 'ฟังขั้นคู่',
        q: 'ฟังเสียงแล้วตอบว่าเป็นขั้นคู่อะไร (เล่นแยกเสียงทีละตัว แล้วเล่นพร้อมกัน)',
        c: [label, ...shuffle(near).slice(0, 3)],
        e: `ขั้นคู่นี้คือ ${label} ห่างกัน ${semi} ครึ่งเสียง`,
        audio: [{ notes: [low], dur: 0.8 }, { notes: [low + semi], dur: 0.8 }, { rest: true, dur: 0.35 }, { notes: [low, low + semi], dur: 1.4 }],
      };
    },

    earChord() {
      const quality = pick(Object.keys(TRIADS));
      const st = { major: [0, 4, 7], minor: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8] }[quality];
      const root = 52 + rand(10);
      const ns = st.map((s) => root + s);
      return {
        tag: 'ฟังคอร์ด',
        q: 'ฟังทรัยแอดแล้วตอบว่าเป็นคอร์ดชนิดใด (เล่นไล่เสียง แล้วเล่นพร้อมกัน)',
        c: [QUAL_TH[quality], ...Object.keys(QUAL_TH).filter((x) => x !== quality).map((x) => QUAL_TH[x])],
        e: `คอร์ดนี้คือ ${QUAL_TH[quality]}`,
        audio: [...ns.map((n) => ({ notes: [n], dur: 0.55 })), { rest: true, dur: 0.3 }, { notes: ns, dur: 1.6 }],
      };
    },

    earScale() {
      const types = {
        'เมเจอร์ (Major)': [0, 2, 4, 5, 7, 9, 11, 12],
        'เนเชอรัลไมเนอร์ (Natural minor)': [0, 2, 3, 5, 7, 8, 10, 12],
        'ฮาร์โมนิกไมเนอร์ (Harmonic minor)': [0, 2, 3, 5, 7, 8, 11, 12],
        'เมโลดิกไมเนอร์ขาขึ้น (Melodic minor)': [0, 2, 3, 5, 7, 9, 11, 12],
      };
      const name = pick(Object.keys(types));
      const tonic = 57 + rand(7);
      return {
        tag: 'ฟังบันไดเสียง',
        q: 'ฟังบันไดเสียงขาขึ้นแล้วตอบว่าเป็นบันไดเสียงชนิดใด',
        c: [name, ...Object.keys(types).filter((x) => x !== name)],
        e: `บันไดเสียงนี้คือ ${name}`,
        audio: types[name].map((s) => ({ notes: [tonic + s], dur: 0.42 })),
      };
    },

    earMeter() {
      const beats = pick([2, 3, 4]);
      const label = { 2: 'สองจังหวะ (2/4)', 3: 'สามจังหวะ (3/4)', 4: 'สี่จังหวะ (4/4)' };
      const root = 48 + rand(5);
      const ev = [];
      for (let bar = 0; bar < 4; bar++) {
        for (let b = 0; b < beats; b++) {
          ev.push({ notes: b === 0 ? [root, root + 12, root + 16] : [root + 19], dur: 0.001 });
          ev.push({ click: b === 0, dur: 0.5 });
        }
      }
      return {
        tag: 'ฟังจังหวะ',
        q: 'ฟังแล้วนับจังหวะ: เพลงนี้มีกี่จังหวะในหนึ่งห้อง (เสียงหนักคือจังหวะที่ 1)',
        c: [label[beats], ...[2, 3, 4].filter((x) => x !== beats).map((x) => label[x])],
        e: `จังหวะหนักมาทุก ๆ ${beats} จังหวะ จึงเป็น${label[beats]}`,
        audio: ev,
      };
    },

    earCadence() {
      const I = [48, 64, 67, 72], IV = [53, 65, 69, 72], V = [43, 62, 67, 71], vi = [45, 64, 69, 72];
      const types = {
        'เพอร์เฟกต์ (V–I)': [I, IV, V, I],
        'เพลกัล (IV–I)': [I, V, IV, I],
        'อิมเพอร์เฟกต์ (จบที่ V)': [I, IV, I, V],
        'อินเทอร์รัปเต็ด (V–vi)': [I, IV, V, vi],
      };
      const name = pick(Object.keys(types));
      const tr = rand(7) - 3;
      return {
        tag: 'ฟังเคเดนซ์',
        q: 'ฟังทางเดินคอร์ด 4 คอร์ดแล้วตอบว่าจบด้วยเคเดนซ์ (การจบประโยค) แบบใด',
        c: [name, ...Object.keys(types).filter((x) => x !== name)],
        e: `ทางเดินคอร์ดนี้จบแบบ ${name}`,
        audio: types[name].map((ch) => ({ notes: ch.map((n) => n + tr), dur: 1.1 })),
      };
    },
  };

  return { parse, midi, vexKey, pc, pretty, addInterval, triad, intervalLabel, play, stop, renderStaff, GEN, shuffle, pick, rand, distinctChoices,
    KEYS, TRIADS, PERFECT, NUM_EN, Q_EN, CLEF_INFO, LETTERS, dIndex, fromDIndex, bare, letterWalk, noteExplain, intervalExplain, keySigExplain, triadExplain };
})();
