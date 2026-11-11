/* =========================================================
   gen-uni.js — ตัวสร้างโจทย์อัตโนมัติ คอร์สเตรียมสอบตรงคณะดนตรี
   ทฤษฎีเชิงลึก (คอร์ด 7, โหมด, figured bass) + โสตทักษะ (dictation แบบเลือกตอบ)
   ========================================================= */
(() => {
  const M = Music;
  const { pick, rand, shuffle, parse, pc, pretty, addInterval, midi, distinctChoices } = M;

  /* ---------------- คอร์ดเซเวนท์ ---------------- */
  const SEVENTHS = {
    maj7: { name: 'Major 7th (Δ7)', parts: [['M', 3], ['P', 5], ['M', 7]], how: 'major triad + major 7th', semis: [0, 4, 7, 11] },
    dom7: { name: 'Dominant 7th (7)', parts: [['M', 3], ['P', 5], ['m', 7]], how: 'major triad + minor 7th', semis: [0, 4, 7, 10] },
    min7: { name: 'Minor 7th (m7)', parts: [['m', 3], ['P', 5], ['m', 7]], how: 'minor triad + minor 7th', semis: [0, 3, 7, 10] },
    hdim7: { name: 'Half-diminished 7th (ø7)', parts: [['m', 3], ['d', 5], ['m', 7]], how: 'diminished triad + minor 7th', semis: [0, 3, 6, 10] },
    dim7: { name: 'Diminished 7th (°7)', parts: [['m', 3], ['d', 5], ['d', 7]], how: 'diminished triad + diminished 7th', semis: [0, 3, 6, 9] },
  };
  const seventhExplain = (root, q, notes) => {
    const S = SEVENTHS[q];
    return `ขั้นที่ 1 รากของคอร์ดคือ ${pc(root)} — โน้ตในคอร์ด: ${notes.map(pc).join(' – ')}\n` +
      `ขั้นที่ 2 ดูทรัยแอดล่าง (${notes.slice(0, 3).map(pc).join('–')}): ${S.how.split(' + ')[0]}\n` +
      `ขั้นที่ 3 ดูคู่ 7 จากราก (${pc(root)} → ${pc(notes[3])}): ${S.how.split(' + ')[1]}\n` +
      `สูตร: maj7 = M triad + M7 · dom7 = M triad + m7 · m7 = m triad + m7 · ø7 = dim triad + m7 · °7 = dim triad + d7\nคำตอบ: ${S.name}`;
  };
  M.GEN.uSeventh = () => {
    let root, q, notes;
    do {
      root = pick(['C4', 'D4', 'E4', 'F4', 'G4', 'A3', 'B3', 'Bb3', 'Eb4', 'F#4']);
      q = pick(Object.keys(SEVENTHS));
      notes = [root, ...SEVENTHS[q].parts.map(([a, b]) => addInterval(root, a, b))];
    } while (notes.some((x) => !x));
    return {
      tag: 'คอร์ดและการดำเนินคอร์ด',
      q: 'คอร์ดเซเวนท์นี้เป็นชนิดใด',
      c: [SEVENTHS[q].name, ...Object.keys(SEVENTHS).filter((x) => x !== q).map((x) => SEVENTHS[x].name)].slice(0, 4),
      e: seventhExplain(root, q, notes),
      notation: { clef: 'treble', notes: [{ keys: notes }] },
    };
  };

  /* ---------------- โหมด (Church modes) ---------------- */
  const MODES = {
    Ionian: { iv: [['P', 1], ['M', 2], ['M', 3], ['P', 4], ['P', 5], ['M', 6], ['M', 7]], key: 'เหมือนบันไดเสียงเมเจอร์ทุกประการ', semis: [0, 2, 4, 5, 7, 9, 11, 12] },
    Dorian: { iv: [['P', 1], ['M', 2], ['m', 3], ['P', 4], ['P', 5], ['M', 6], ['m', 7]], key: 'คล้ายไมเนอร์ แต่ขั้นที่ 6 สูงขึ้น (M6)', semis: [0, 2, 3, 5, 7, 9, 10, 12] },
    Phrygian: { iv: [['P', 1], ['m', 2], ['m', 3], ['P', 4], ['P', 5], ['m', 6], ['m', 7]], key: 'คล้ายไมเนอร์ แต่ขั้นที่ 2 ต่ำลง (m2) ฟังสไตล์สเปน', semis: [0, 1, 3, 5, 7, 8, 10, 12] },
    Lydian: { iv: [['P', 1], ['M', 2], ['M', 3], ['A', 4], ['P', 5], ['M', 6], ['M', 7]], key: 'คล้ายเมเจอร์ แต่ขั้นที่ 4 สูงขึ้น (A4) ฟังลอย ๆ', semis: [0, 2, 4, 6, 7, 9, 11, 12] },
    Mixolydian: { iv: [['P', 1], ['M', 2], ['M', 3], ['P', 4], ['P', 5], ['M', 6], ['m', 7]], key: 'คล้ายเมเจอร์ แต่ขั้นที่ 7 ต่ำลง (m7) ฟังบลูส์/ร็อก', semis: [0, 2, 4, 5, 7, 9, 10, 12] },
    Aeolian: { iv: [['P', 1], ['M', 2], ['m', 3], ['P', 4], ['P', 5], ['m', 6], ['m', 7]], key: 'เหมือนเนเชอรัลไมเนอร์ทุกประการ', semis: [0, 2, 3, 5, 7, 8, 10, 12] },
    Locrian: { iv: [['P', 1], ['m', 2], ['m', 3], ['P', 4], ['d', 5], ['m', 6], ['m', 7]], key: 'ขั้นที่ 2 และ 5 ต่ำลง (m2, d5) ไม่มั่นคงที่สุด', semis: [0, 1, 3, 5, 6, 8, 10, 12] },
  };
  const WHITE = { Ionian: 'C', Dorian: 'D', Phrygian: 'E', Lydian: 'F', Mixolydian: 'G', Aeolian: 'A', Locrian: 'B' };
  M.GEN.uMode = () => {
    let mode, tonic, notes;
    do {
      mode = pick(Object.keys(MODES));
      tonic = Math.random() < 0.5 ? WHITE[mode] + '4' : pick(['C4', 'D4', 'E4', 'F4', 'G4', 'A3', 'Bb3']);
      notes = MODES[mode].iv.map(([q, n]) => addInterval(tonic, q, n));
      notes.push(tonic.replace(/\d$/, (d) => +d + 1));
    } while (notes.some((x) => !x));
    const white = tonic === WHITE[mode] + '4';
    return {
      tag: 'บันไดเสียงและโหมด',
      q: `บันไดเสียงที่เริ่มจาก ${pc(tonic)} นี้คือโหมดใด`,
      c: distinctChoices(`${pc(tonic)} ${mode}`, Object.keys(MODES).map((m) => `${pc(tonic)} ${m}`)),
      e: `ขั้นที่ 1 เทียบกับบันไดเสียง ${pc(tonic)} major (Ionian)\n` +
        `ขั้นที่ 2 โน้ตในโจทย์: ${notes.map(pc).join(' ')}\n` +
        `ขั้นที่ 3 จุดสังเกตของ ${mode}: ${MODES[mode].key}\n` +
        (white ? `ทางลัด: โหมดบนคีย์ขาวล้วน — เริ่ม C=Ionian, D=Dorian, E=Phrygian, F=Lydian, G=Mixolydian, A=Aeolian, B=Locrian\n` : '') +
        `คำตอบ: ${pc(tonic)} ${mode}`,
      notation: { clef: 'treble', notes: notes.map((k) => ({ keys: [k], dur: 'q' })) },
    };
  };

  /* ---------------- Figured bass: V7 และการพลิกกลับ ---------------- */
  const SCALE_MAJ = [['P', 1], ['M', 2], ['M', 3], ['P', 4], ['P', 5], ['M', 6], ['M', 7]];
  const FIG = [
    { label: 'V7', idx: [4, 6, 8, 10], bass: 'ราก (root)', fig: '7' },
    { label: 'V6/5', idx: [6, 8, 10, 11], bass: 'ขั้น 3 ของคอร์ด (leading note)', fig: '6/5' },
    { label: 'V4/3', idx: [8, 10, 11, 13], bass: 'ขั้น 5 ของคอร์ด (supertonic)', fig: '4/3' },
    { label: 'V4/2', idx: [10, 11, 13, 15], bass: 'ขั้น 7 ของคอร์ด (subdominant)', fig: '4/2' },
  ];
  M.GEN.uFiguredV7 = () => {
    const ton = pick(['C', 'G', 'D', 'F', 'Bb', 'A', 'Eb']);
    const tonic = ton + ('CDEF'.includes(ton[0]) ? '3' : '3');
    const sn = (k) => { const [q, n] = SCALE_MAJ[k % 7]; return addInterval(tonic, q, n).replace(/-?\d+$/, (o) => +o + Math.floor(k / 7)); };
    const f = pick(FIG);
    const notes = f.idx.map(sn);
    const key = M.KEYS.find((x) => x.major === ton);
    const order = key.type === '#' ? ['F', 'C', 'G', 'D', 'A', 'E', 'B'] : ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
    const sig = {}; order.slice(0, key.n).forEach((l) => (sig[l] = key.type));
    const accs = notes.map((n) => { const p = parse(n); return p.acc === (sig[p.letter] || '') ? '' : (p.acc || 'n'); });
    const dom = sn(4), lt = sn(6), sup = sn(8), sub = sn(10);
    const clef = midi(notes[0]) < 55 ? 'bass' : 'treble';
    return {
      tag: 'คอร์ดและการดำเนินคอร์ด',
      q: `ในคีย์ ${pretty(ton)} major คอร์ดนี้คือ V7 ในตำแหน่งใด (เขียนแบบ figured bass)`,
      c: [f.label, ...FIG.filter((x) => x !== f).map((x) => x.label)],
      e: `ขั้นที่ 1 V7 ของ ${pretty(ton)} major = ${pc(dom)} – ${pc(lt)} – ${pc(sup)} – ${pc(sub)} (ราก–3–5–7)\n` +
        `ขั้นที่ 2 โน้ตต่ำสุดในโจทย์คือ ${pc(notes[0])} = ${f.bass}\n` +
        `ขั้นที่ 3 จำ figured bass ของคอร์ด 7: ราก = 7 · ขั้น 3 = 6/5 · ขั้น 5 = 4/3 · ขั้น 7 = 4/2\n` +
        `(ของทรัยแอด: ราก = 5/3 · ขั้น 3 = 6 · ขั้น 5 = 6/4)\nคำตอบ: ${f.label}`,
      notation: { clef, key: ton, notes: [{ keys: notes, accs }] },
    };
  };

  /* =========================================================
     โสตทักษะ
     ========================================================= */
  M.GEN.uEarSeventh = () => {
    const q = pick(Object.keys(SEVENTHS));
    const root = 50 + rand(9);
    const ns = SEVENTHS[q].semis.map((s) => root + s);
    return {
      tag: 'ฟังคอร์ดเซเวนท์',
      q: 'ฟังคอร์ด 4 เสียงแล้วตอบว่าเป็นคอร์ดเซเวนท์ชนิดใด (เล่นไล่เสียง แล้วเล่นพร้อมกัน)',
      c: [SEVENTHS[q].name, ...Object.keys(SEVENTHS).filter((x) => x !== q).map((x) => SEVENTHS[x].name)].slice(0, 4),
      e: `คอร์ดนี้คือ ${SEVENTHS[q].name} = ${SEVENTHS[q].how}\nเทคนิคฟัง: maj7 = สว่างนุ่ม ฝัน ๆ · dom7 = อยากไปต่อ (ต้องคลี่คลาย) · m7 = เศร้านุ่ม แจ๊ส · ø7 = มืด ลึกลับ · °7 = ตึงมาก น่ากลัว ใช้ในหนังผี`,
      audio: [...ns.map((n) => ({ notes: [n], dur: 0.45 })), { rest: true, dur: 0.3 }, { notes: ns, dur: 1.8 }],
    };
  };

  M.GEN.uEarMode = () => {
    const mode = pick(Object.keys(MODES));
    const tonic = 57 + rand(6);
    return {
      tag: 'ฟังโหมด',
      q: 'ฟังบันไดเสียงขาขึ้น แล้วตอบว่าเป็นโหมดใด',
      c: distinctChoices(mode, Object.keys(MODES)),
      e: `โหมดนี้คือ ${mode}: ${MODES[mode].key}\nเทคนิค: ฟังขั้นที่ 3 ก่อน (สว่าง = กลุ่มเมเจอร์: Ionian/Lydian/Mixolydian · มืด = กลุ่มไมเนอร์: Dorian/Phrygian/Aeolian/Locrian) แล้วหาเสียงที่ต่างจากเมเจอร์/ไมเนอร์ปกติ`,
      audio: [{ notes: [tonic - 12, tonic], dur: 0.9 }, ...MODES[mode].semis.map((s) => ({ notes: [tonic + s], dur: 0.42 }))],
    };
  };

  /* ---------- Melodic dictation แบบเลือกตอบ ---------- */
  const SOL = ['โด', 'เร', 'มี', 'ฟา', 'ซอล', 'ลา', 'ที', 'โด(สูง)'];
  const MAJ_SEMI = [0, 2, 4, 5, 7, 9, 11, 12];
  const melodyText = (degs) => degs.map((d) => SOL[d]).join(' – ');
  function makeMelody(len) {
    const degs = [0];
    while (degs.length < len) {
      const last = degs[degs.length - 1];
      let step = pick([-2, -1, -1, 1, 1, 2, 2, 3, -3, 4]);
      const nxt = Math.min(7, Math.max(0, last + step));
      if (nxt !== last) degs.push(nxt);
    }
    return degs;
  }
  M.GEN.uEarMelody = () => {
    const len = pick([4, 5, 5, 6]);
    const degs = makeMelody(len);
    const tonic = 58 + rand(6);
    const distract = new Set([melodyText(degs)]);
    let guard = 0;
    while (distract.size < 4 && guard++ < 50) {
      const d = degs.slice(); const i = 1 + rand(d.length - 1);
      d[i] = Math.min(7, Math.max(0, d[i] + pick([-2, -1, 1, 2])));
      distract.add(melodyText(d));
    }
    const choices = [...distract];
    return {
      tag: 'ฟังทำนอง (Dictation)',
      q: `ฟังทำนอง ${len} เสียง (เริ่มที่ “โด” หลังคอร์ดโทนิก) แล้วเลือกโน้ตที่ตรงกับที่ได้ยิน`,
      c: choices,
      e: `ทำนองที่ถูกคือ ${melodyText(degs)}\nเทคนิค: (1) ร้องตามในใจทันทีหลังฟัง (2) ฟังทิศทางก่อน ขึ้น/ลง/ซ้ำ (3) ดูว่าเดินทีละขั้นหรือกระโดด (4) เทียบตัวเลือกทีละตัว ตัดข้อที่ทิศทางไม่ตรงออก`,
      audio: [{ notes: [tonic - 12, tonic + 4 - 12, tonic + 7 - 12], dur: 1.0 }, { rest: true, dur: 0.4 }, ...degs.map((d) => ({ notes: [tonic + MAJ_SEMI[d]], dur: 0.6 }))],
    };
  };

  /* ---------- Rhythmic dictation แบบเลือกตอบ (4/4 หนึ่งห้อง) ---------- */
  const BEATS = [
    { sym: '♩', on: [0] }, { sym: '♫', on: [0, 0.5] }, { sym: '♬♬', on: [0, 0.25, 0.5, 0.75] },
    { sym: '♪♬', on: [0, 0.5, 0.75] }, { sym: '♬♪', on: [0, 0.25, 0.5] }, { sym: '𝄽', on: [] },
  ];
  const rhythmText = (bs) => bs.map((b) => BEATS[b].sym).join('  |  ');
  M.GEN.uEarRhythm = () => {
    const bs = [0, 0, 0, 0].map(() => rand(BEATS.length));
    if (bs.every((b) => b === 0)) bs[1 + rand(3)] = 1;
    if (bs[0] === 5) bs[0] = 0;
    const set = new Set([rhythmText(bs)]);
    let g = 0;
    while (set.size < 4 && g++ < 50) { const d = bs.slice(); d[1 + rand(3)] = rand(BEATS.length); set.add(rhythmText(d)); }
    const beat = 0.55, ev = [];
    for (let i = 0; i < 4; i++) ev.push({ click: i === 0, dur: beat }); // นับนำ 1 ห้อง
    bs.forEach((b) => {
      const ons = BEATS[b].on; let t = 0;
      if (!ons.length) { ev.push({ rest: true, dur: beat }); return; }
      ons.forEach((o, k) => { const nx = k + 1 < ons.length ? ons[k + 1] : 1; if (o > t) ev.push({ rest: true, dur: (o - t) * beat }); ev.push({ notes: [67], dur: (nx - o) * beat }); t = nx; });
    });
    return {
      tag: 'ฟังจังหวะ (Dictation)',
      q: 'ฟังเสียงนับนำ 4 ครั้ง แล้วฟังจังหวะ 1 ห้อง (4/4) เลือกจังหวะที่ตรงกับที่ได้ยิน (♩ = ตัวดำ, ♫ = เขบ็ต 1 ชั้น 2 ตัว, ♬♬ = เขบ็ต 2 ชั้น 4 ตัว, 𝄽 = ตัวหยุด 1 จังหวะ)',
      c: [...set],
      e: `จังหวะที่ถูกคือ ${rhythmText(bs)} (แต่ละช่องคือ 1 จังหวะ)\nเทคนิค: เคาะเท้าตามจังหวะนับนำ แล้วนับในใจ “1-และ-2-และ” ฟังว่าแต่ละจังหวะมีเสียงกี่ครั้ง (1 = ตัวดำ, 2 = เขบ็ต 2 ตัว, 4 = เขบ็ต 2 ชั้น 4 ตัว, ไม่มีเสียง = ตัวหยุด)`,
      audio: ev,
    };
  };

  /* ---------- ทางเดินคอร์ด ---------- */
  const CH = { I: [48, 64, 67, 72], ii: [50, 65, 69, 74], IV: [53, 65, 69, 72], V: [43, 62, 67, 71], vi: [45, 64, 69, 72], V7: [43, 62, 65, 71] };
  const PROGS = ['I – IV – V – I', 'I – vi – IV – V', 'I – ii – V – I', 'I – V – vi – IV', 'I – IV – I – V', 'I – vi – ii – V7'];
  M.GEN.uEarProgression = () => {
    const prog = pick(PROGS);
    const tr = rand(5) - 2;
    return {
      tag: 'ฟังทางเดินคอร์ด',
      q: 'ฟังทางเดินคอร์ด 4 คอร์ด (คีย์เมเจอร์) แล้วเลือกทางเดินคอร์ดที่ถูกต้อง',
      c: distinctChoices(prog, PROGS),
      e: `ทางเดินคอร์ดนี้คือ ${prog}\nเทคนิค: ฟัง “เสียงเบส” เป็นหลัก — I (โด) · ii (เร) · IV (ฟา) · V (ซอล) · vi (ลา) และคอร์ดไมเนอร์ (ii, vi) จะฟังมืดกว่าคอร์ดเมเจอร์`,
      audio: prog.split(' – ').map((c) => ({ notes: CH[c].map((n) => n + tr), dur: 1.15 })),
    };
  };

  M.GEN.uEarIntervalDesc = () => {
    const list = [[1, 'm2'], [2, 'M2'], [3, 'm3'], [4, 'M3'], [5, 'P4'], [6, 'ไทรโทน'], [7, 'P5'], [8, 'm6'], [9, 'M6'], [10, 'm7'], [11, 'M7'], [12, 'P8']];
    const [s, l] = pick(list);
    const top = 64 + rand(10);
    const near = list.filter(([x]) => x !== s).sort((a, b) => Math.abs(a[0] - s) - Math.abs(b[0] - s)).slice(0, 5).map((x) => x[1] + ' ขาลง');
    return {
      tag: 'ฟังขั้นคู่ขาลง',
      q: 'ฟังขั้นคู่ “ขาลง” (เสียงสูงก่อน แล้วลงมา) แล้วตอบชื่อขั้นคู่',
      c: [l + ' ขาลง', ...shuffle(near).slice(0, 3)],
      e: `ขั้นคู่นี้คือ ${l} ขาลง (${s} ครึ่งเสียง)\nเทคนิคขาลง: m3 ขาลง = “Hey Jude” หรือเสียงเรียก “ซอล–มี” · M3 ขาลง = ต้นเพลง Swing Low, Sweet Chariot · P5 ขาลง = “Flint-stones” · P8 ขาลง = กระโดดลงไปที่เสียงเดิมแต่ต่ำกว่า\nฝึกโดยร้องขั้นคู่ขาขึ้นที่จำได้ แล้วกลับทิศทางในใจ`,
      audio: [{ notes: [top], dur: 0.8 }, { notes: [top - s], dur: 0.8 }, { rest: true, dur: 0.3 }, { notes: [top - s, top], dur: 1.3 }],
    };
  };
})();
