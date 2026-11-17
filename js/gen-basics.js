/* =========================================================
   gen-basics.js — ตัวสร้างโจทย์อัตโนมัติ คอร์สพื้นฐานดนตรี (0 → เริ่มเรียน)
   ทุกโจทย์มีเฉลยละเอียดสองภาษา (q.ex) ในตัว · โหลดหลัง music.js
   ========================================================= */
(() => {
  const M = Music;
  const { pick, shuffle, parse, dIndex, fromDIndex, letterWalk, bare, LETTERS } = M;

  const SOL = { C: 'โด', D: 'เร', E: 'มี', F: 'ฟา', G: 'ซอล', A: 'ลา', B: 'ที' };
  const lab = (L) => `${L} (${SOL[L]})`;
  const ACC_NAME = { '#': ['ชาร์ป', 'sharp', '♯'], b: ['แฟลต', 'flat', '♭'], '': ['', 'natural', ''] };
  const BOTTOM = { treble: 'E4', bass: 'G2' };
  const REF = { treble: 'G4', bass: 'F3' };
  const W = (k) => ({ keys: [k], dur: 'w' });
  const N = (k, dur, dots) => ({ keys: [k || 'B4'], dur, dots });
  const R = (dur, dots) => ({ rest: true, dur, dots });
  const BAR = { bar: true };

  function pos(note, clef) {
    const p = dIndex(note) - dIndex(BOTTOM[clef]);
    if (p >= 0 && p <= 8) return p % 2 === 0 ? [`เส้นที่ ${p / 2 + 1}`, `line ${p / 2 + 1}`] : [`ช่องที่ ${(p + 1) / 2}`, `space ${(p + 1) / 2}`];
    if (p === -2) return ['เส้นน้อยใต้บรรทัด', 'the ledger line below'];
    if (p === -1) return ['ใต้เส้นที่ 1 (ชิดบรรทัด)', 'just below line 1'];
    if (p === 9) return ['เหนือเส้นที่ 5 (ชิดบรรทัด)', 'just above line 5'];
    if (p === 10) return ['เส้นน้อยเหนือบรรทัด', 'the ledger line above'];
    return p < 0 ? ['ใต้บรรทัด', 'below the stave'] : ['เหนือบรรทัด', 'above the stave'];
  }
  function nearest(note, L) {
    const d0 = dIndex(note); let best = null;
    for (let k = d0 - 6; k <= d0 + 6; k++) if (fromDIndex(k)[0] === L && (best === null || Math.abs(k - d0) < Math.abs(best - d0))) best = k;
    return best;
  }

  /* ---------- อ่านโน้ต (กุญแจซอล / กุญแจฟา) ---------- */
  const RANGE = {
    treble: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'],
    bass: ['E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'],
  };
  const CLEF = {
    treble: { th: 'กุญแจซอล', en: 'treble clef', refTh: 'ขดของกุญแจซอลพันรอบเส้นที่ 2 → เส้นที่ 2 คือ G (ซอล)', refEn: 'the curl of the treble clef wraps around line 2, so line 2 is G', tag: 'ชื่อโน้ตกุญแจซอล',
      tip: ['เส้น: E G B D F (มี ซอล ที เร ฟา) · ช่อง: F A C E (ฟา ลา โด มี)', 'Lines E G B D F · spaces F A C E'] },
    bass: { th: 'กุญแจฟา', en: 'bass clef', refTh: 'จุดสองจุดของกุญแจฟาคร่อมเส้นที่ 4 → เส้นที่ 4 คือ F (ฟา)', refEn: 'the two dots of the bass clef sit either side of line 4, so line 4 is F', tag: 'ชื่อโน้ตกุญแจฟา',
      tip: ['เส้น: G B D F A (ซอล ที เร ฟา ลา) · ช่อง: A C E G (ลา โด มี ซอล)', 'Lines G B D F A · spaces A C E G'] },
  };
  function readNote(clef) {
    const note = pick(RANGE[clef]), L = parse(note).letter, C = CLEF[clef], ref = REF[clef];
    const li = LETTERS.indexOf(L);
    const wrong = shuffle([LETTERS[(li + 1) % 7], LETTERS[(li + 6) % 7], LETTERS[(li + 2) % 7], LETTERS[(li + 5) % 7]]).slice(0, 3);
    const walk = letterWalk(ref, note).map(bare);
    const [pTh, pEn] = pos(note, clef);
    const why = wrong.map((w) => { const k = nearest(note, w), d = k - dIndex(note), [a, b] = pos(fromDIndex(k), clef); return [`${lab(w)} อยู่${d > 0 ? 'สูง' : 'ต่ำ'}กว่านี้ ${Math.abs(d)} ขั้น (${a})`, `${w} is ${Math.abs(d)} step${Math.abs(d) > 1 ? 's' : ''} ${d > 0 ? 'higher' : 'lower'} (${b})`]; });
    return {
      tag: C.tag,
      q: `โน้ตบน${C.th}ตัวนี้คือโน้ตอะไร`,
      c: [lab(L), ...wrong.map(lab)],
      notation: { clef, notes: [W(note)] },
      ex: {
        qAlt: `What is this note in the ${C.en}?`,
        th: `ขั้นที่ 1: ${C.refTh}\nขั้นที่ 2: โน้ตในโจทย์อยู่ที่${pTh} — ไล่ชื่อทีละเส้นและช่องจาก ${bare(ref)}: ${walk.join(' → ')}\nคำตอบ: ${lab(L)}${note === 'C4' ? ' — ตัวนี้คือ "โดกลาง" (Middle C)' : ''}`,
        en: `Step 1: ${C.refEn}.\nStep 2: the note is on ${pEn}. Count letter names from ${bare(ref)}: ${walk.join(' → ')}.\nAnswer: ${L}${note === 'C4' ? ' — middle C' : ''}`,
        why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
        tip: C.tip[0], tipEn: C.tip[1],
        img: note === ref ? undefined : [{ cap: `ตัวอ้างอิง ${bare(ref)} (ซ้าย) → โน้ตในโจทย์ (ขวา)`, capEn: `Reference ${bare(ref)} (left) → the note (right)`, n: { clef, notes: [W(ref), W(note)] } }],
      },
    };
  }
  M.GEN.bTreble = () => readNote('treble');
  M.GEN.bBass = () => readNote('bass');

  /* ---------- ค่าโน้ต / ตัวหยุด ---------- */
  const VALUES = [
    { dur: 'w', beats: '4', th: 'ตัวกลม', en: 'whole note (semibreve)', rth: 'ตัวหยุดตัวกลม', ren: 'whole rest', how: 'หัวโน้ตกลวง ไม่มีก้าน', howEn: 'hollow head, no stem', rhow: 'ก้อนดำ "ห้อย" ใต้เส้นที่ 4', rhowEn: 'a block hanging below line 4' },
    { dur: 'h', beats: '2', th: 'ตัวขาว', en: 'half note (minim)', rth: 'ตัวหยุดตัวขาว', ren: 'half rest', how: 'หัวโน้ตกลวง มีก้าน', howEn: 'hollow head with a stem', rhow: 'ก้อนดำ "วาง" บนเส้นที่ 3', rhowEn: 'a block sitting on line 3' },
    { dur: 'q', beats: '1', th: 'ตัวดำ', en: 'quarter note (crotchet)', rth: 'ตัวหยุดตัวดำ', ren: 'quarter rest', how: 'หัวโน้ตทึบ มีก้าน', howEn: 'filled head with a stem', rhow: 'รูปซิกแซกเหมือนสายฟ้า', rhowEn: 'a zigzag like lightning' },
    { dur: '8', beats: '½', th: 'เขบ็ต 1 ชั้น', en: 'eighth note (quaver)', rth: 'ตัวหยุดเขบ็ต 1 ชั้น', ren: 'eighth rest', how: 'หัวทึบ มีก้าน และมีหาง (ธง) 1 ชั้น', howEn: 'filled head, stem and one flag', rhow: 'คล้ายเลข 7 มีจุด 1 จุด', rhowEn: 'like a 7 with one blob' },
    { dur: '16', beats: '¼', th: 'เขบ็ต 2 ชั้น', en: 'sixteenth note (semiquaver)', rth: 'ตัวหยุดเขบ็ต 2 ชั้น', ren: 'sixteenth rest', how: 'หัวทึบ มีก้าน และมีหาง 2 ชั้น', howEn: 'filled head, stem and two flags', rhow: 'คล้ายเลข 7 มีจุด 2 จุด', rhowEn: 'like a 7 with two blobs' },
    { dur: 'h', dots: 1, beats: '3', th: 'ตัวขาวประจุด', en: 'dotted half note (dotted minim)', rth: 'ตัวหยุดตัวขาวประจุด', ren: 'dotted half rest', how: 'ตัวขาว (2) + จุดเพิ่มครึ่งหนึ่ง (1)', howEn: 'half note (2) + the dot adds half (1)', rhow: 'ตัวหยุดตัวขาว (2) + จุด (1)', rhowEn: 'half rest (2) + dot (1)' },
    { dur: 'q', dots: 1, beats: '1½', th: 'ตัวดำประจุด', en: 'dotted quarter note (dotted crotchet)', rth: 'ตัวหยุดตัวดำประจุด', ren: 'dotted quarter rest', how: 'ตัวดำ (1) + จุดเพิ่มครึ่งหนึ่ง (½)', howEn: 'quarter note (1) + the dot adds half (½)', rhow: 'ตัวหยุดตัวดำ (1) + จุด (½)', rhowEn: 'quarter rest (1) + dot (½)' },
  ];
  const BEAT_POOL = ['4', '3', '2', '1½', '1', '½', '¼'];
  function valueQ(rest) {
    const v = pick(rest ? VALUES.slice(0, 5) : VALUES);
    const wrong = shuffle(BEAT_POOL.filter((b) => b !== v.beats)).slice(0, 3);
    const name = (x) => (rest ? x.rth : x.th), nameEn = (x) => (rest ? x.ren : x.en);
    const why = wrong.map((b) => { const o = VALUES.find((x) => x.beats === b); return [`${b} จังหวะ คือ${name(o)}`, `${b} beat${b === '1' || b === '½' || b === '¼' ? '' : 's'} is a ${nameEn(o)}`]; });
    return {
      tag: 'ค่าโน้ตและตัวหยุด',
      q: `${rest ? 'ตัวหยุด' : 'โน้ต'}ตัวนี้มีค่ากี่จังหวะ (นับตัวดำ = 1 จังหวะ)`,
      c: [v.beats, ...wrong],
      notation: { clef: 'treble', notes: [rest ? R(v.dur, v.dots) : N('B4', v.dur, v.dots)] },
      ex: {
        qAlt: `How many beats is this ${rest ? 'rest' : 'note'} worth (quarter note = 1 beat)?`,
        th: `ตัวนี้คือ${name(v)} — สังเกต: ${rest ? v.rhow : v.how}\nค่าเท่ากับ ${v.beats} จังหวะ\n\nตารางค่าโน้ต: ตัวกลม 4 · ตัวขาว 2 · ตัวดำ 1 · เขบ็ต 1 ชั้น ½ · เขบ็ต 2 ชั้น ¼${rest ? '\nตัวหยุดมีค่าเท่ากับโน้ตชื่อเดียวกัน แต่หมายถึง "เงียบ"' : ''}`,
        en: `This is a ${nameEn(v)} — look for: ${rest ? v.rhowEn : v.howEn}.\nIt is worth ${v.beats} beat${['1', '½', '¼'].includes(v.beats) ? '' : 's'}.\n\nValues: whole 4 · half 2 · quarter 1 · eighth ½ · sixteenth ¼${rest ? '\nA rest lasts as long as the note of the same name, but means silence.' : ''}`,
        why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
        tip: 'ตัวกลม 1 = ขาว 2 = ดำ 4 = เขบ็ต 8 (แบ่งครึ่งทีละขั้น)', tipEn: '1 whole = 2 halves = 4 quarters = 8 eighths (halving each time)',
        img: [{ cap: 'ตัวกลม 4 · ตัวขาว 2 · ตัวดำ 1 · เขบ็ต 1 ชั้น ½ · เขบ็ต 2 ชั้น ¼', capEn: 'whole 4 · half 2 · quarter 1 · eighth ½ · sixteenth ¼', n: { clef: 'treble', notes: rest ? [R('w'), R('h'), R('q'), R('8'), R('16')] : [N('B4', 'w'), N('B4', 'h'), N('B4', 'q'), N('B4', '8'), N('B4', '16')] } }],
      },
    };
  }
  M.GEN.bNoteValue = () => valueQ(false);
  M.GEN.bRestValue = () => valueQ(true);

  /* ---------- ห้องเพลง: ขาดกี่จังหวะ / ใช้อัตราจังหวะใด ---------- */
  const PIECES = [
    { beats: 1, notes: () => [N(pick(['G4', 'A4', 'B4', 'C5']), 'q')], th: 'ตัวดำ = 1' },
    { beats: 1, notes: () => [N('A4', '8'), N('B4', '8')], th: 'เขบ็ต 2 ตัว = 1', beam: true },
    { beats: 2, notes: () => [N(pick(['G4', 'B4', 'D5']), 'h')], th: 'ตัวขาว = 2' },
    { beats: 3, notes: () => [N(pick(['G4', 'C5']), 'h', 1)], th: 'ตัวขาวประจุด = 3' },
    { beats: 1, notes: () => [R('q')], th: 'ตัวหยุดตัวดำ = 1' },
  ];
  function fillBar(total) {
    let left = total; const parts = [];
    while (left > 0) {
      const opts = PIECES.filter((p) => p.beats <= left);
      const p = pick(opts); parts.push(p); left -= p.beats;
    }
    return parts;
  }
  const beatWord = (n) => `${n} จังหวะ`;
  M.GEN.bBarMissing = () => {
    const total = pick([2, 3, 4, 4]);
    const missing = pick(total === 2 ? [1] : total === 3 ? [1, 2] : [1, 2, 3]);
    const parts = fillBar(total - missing);
    const notes = parts.flatMap((p) => p.notes());
    const ts = `${total}/4`;
    const pool = ['1 จังหวะ', '2 จังหวะ', '3 จังหวะ', '½ จังหวะ', 'ไม่ขาด ครบแล้ว'];
    const correct = beatWord(missing);
    const wrong = shuffle(pool.filter((x) => x !== correct)).slice(0, 3);
    const have = total - missing;
    const why = wrong.map((w) => (w === 'ไม่ขาด ครบแล้ว' ? [`ในห้องมีแค่ ${have} จังหวะ แต่ ${ts} ต้องมี ${total}`, `The bar has only ${have} beats; ${ts} needs ${total}`] : [`ถ้าขาด${w} แปลว่าในห้องมี ${total - (w.startsWith('½') ? 0.5 : +w[0])} จังหวะ แต่จริง ๆ มี ${have}`, `Missing ${w.replace(' จังหวะ', '')} would mean ${total - (w.startsWith('½') ? 0.5 : +w[0])} beats in the bar; there are ${have}`]));
    const fill = []; let m = missing; while (m > 0) { if (m >= 2) { fill.push(N('D5', 'h')); m -= 2; } else { fill.push(N('D5', 'q')); m -= 1; } }
    return {
      tag: 'อัตราจังหวะและห้องเพลง',
      q: `ห้องเพลงนี้ (อัตราจังหวะ ${ts}) ยังขาดอีกกี่จังหวะจึงจะครบห้อง`,
      c: [correct, ...wrong],
      notation: { clef: 'treble', time: ts, beam: true, notes, minW: 120 + total * 70 },
      ex: {
        qAlt: `This bar is in ${ts}. How many more beats are needed to complete it?`,
        th: `ขั้นที่ 1: ${ts} = ห้องละ ${total} จังหวะ (ตัวเลขบน)\nขั้นที่ 2: บวกค่าโน้ตในห้อง: ${parts.map((p) => p.th).join(' + ')}${parts.length > 1 ? ` → รวม ${have}` : ''} จังหวะ\nขั้นที่ 3: ${total} − ${have} = ${missing}\nคำตอบ: ขาดอีก ${missing} จังหวะ`,
        en: `Step 1: ${ts} = ${total} beats per bar (the top number).\nStep 2: add up the bar: ${parts.map((p) => ({ 'ตัวดำ = 1': 'quarter = 1', 'เขบ็ต 2 ตัว = 1': 'two eighths = 1', 'ตัวขาว = 2': 'half = 2', 'ตัวขาวประจุด = 3': 'dotted half = 3', 'ตัวหยุดตัวดำ = 1': 'quarter rest = 1' }[p.th])).join(' + ')} = ${have}.\nStep 3: ${total} − ${have} = ${missing}.\nAnswer: ${missing} more beat${missing > 1 ? 's' : ''}.`,
        why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
        tip: 'ตัวเลขบนของอัตราจังหวะ = จำนวนจังหวะที่ต้องมีในหนึ่งห้อง', tipEn: 'The top number = how many beats each bar must hold',
        img: [{ cap: `เติมโน้ตท้ายห้องอีก ${missing} จังหวะ จึงครบ ${total}`, capEn: `Add ${missing} more beat${missing > 1 ? 's' : ''} (the last note${fill.length > 1 ? 's' : ''}) to make ${total}`, n: { clef: 'treble', time: ts, beam: true, notes: [...notes.map((x) => ({ ...x })), ...fill] } }],
      },
    };
  };

  M.GEN.bTimeSig = () => {
    const total = pick([2, 3, 4]);
    const parts = fillBar(total);
    const ts = `${total}/4`;
    const pool = ['2/4', '3/4', '4/4'];
    // ห้อง 3 จังหวะมีเขบ็ตรวม 6 ตัวเท่ากับ 6/8 จึงไม่ใช้ 6/8 เป็นตัวลวง (กันโจทย์กำกวม)
    const wrong = [...pool.filter((x) => x !== ts), total === 3 ? '5/4' : '6/8'];
    const sum = parts.map((p) => p.th).join(' + ');
    const why = wrong.map((w) => (w === '6/8' ? ['6/8 นับเป็นกลุ่มเขบ็ต 3 ตัว เป็นเรื่องที่ยากขึ้น ห้องนี้ใช้ตัวดำเป็นหน่วย', '6/8 counts in groups of three eighths; this bar is counted in quarter notes'] : [`${w} ต้องมี ${w[0]} จังหวะ แต่ห้องนี้มี ${total}`, `${w} needs ${w[0]} beats; this bar has ${total}`]));
    return {
      tag: 'อัตราจังหวะและห้องเพลง',
      q: 'ห้องเพลงนี้ควรใช้อัตราจังหวะใด',
      c: [ts, ...wrong],
      notation: { clef: 'treble', beam: true, notes: parts.flatMap((p) => p.notes()) },
      ex: {
        qAlt: 'Which time signature fits this bar?',
        th: `บวกค่าโน้ตทั้งห้อง: ${sum} = ${total} จังหวะ\nใช้ตัวดำเป็นหน่วย (ตัวเลขล่าง = 4) → ${ts}`,
        en: `Add up the whole bar: ${total} beats, counted in quarter notes (bottom number 4) → ${ts}.`,
        why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
        tip: 'บน = กี่จังหวะ · ล่าง 4 = นับตัวดำเป็น 1 จังหวะ', tipEn: 'Top = how many beats · bottom 4 = count in quarter notes',
        img: [{ cap: `ใส่อัตราจังหวะ ${ts} แล้ว`, capEn: `With the ${ts} time signature`, n: { clef: 'treble', time: ts, beam: true, notes: parts.flatMap((p) => p.notes()) } }],
      },
    };
  };

  /* ---------- ชาร์ป / แฟลต ---------- */
  M.GEN.bAccidental = () => {
    const nat = pick(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5']);
    const acc = pick(['#', 'b']);
    const L = nat[0], note = L + acc + nat.slice(1);
    const nm = (l, a) => `${l}${ACC_NAME[a][2]} (${SOL[l]}${ACC_NAME[a][0]})`;
    const other = acc === '#' ? 'b' : '#';
    const li = LETTERS.indexOf(L);
    const correct = nm(L, acc);
    const wrong = [nm(L, other), lab(L), nm(LETTERS[(li + 1) % 7], acc)];
    return {
      tag: 'เครื่องหมายแปลงเสียง',
      q: 'โน้ตตัวนี้คือโน้ตอะไร (ดูเครื่องหมายหน้าโน้ตด้วย)',
      c: [correct, ...wrong],
      notation: { clef: 'treble', notes: [W(note)] },
      ex: {
        qAlt: 'Name this note (look at the sign in front of it).',
        th: `ขั้นที่ 1: อ่านตำแหน่งก่อน — โน้ตอยู่ที่${pos(nat, 'treble')[0]} คือ ${lab(L)}\nขั้นที่ 2: หน้าโน้ตมีเครื่องหมาย${ACC_NAME[acc][0]} (${ACC_NAME[acc][2]}) = ${acc === '#' ? 'ยกเสียงขึ้นครึ่งเสียง' : 'ลดเสียงลงครึ่งเสียง'}\nคำตอบ: ${correct}`,
        en: `Step 1: read the position first — it is on ${pos(nat, 'treble')[1]}, so the letter is ${L}.\nStep 2: the ${ACC_NAME[acc][1]} (${ACC_NAME[acc][2]}) ${acc === '#' ? 'raises it a semitone' : 'lowers it a semitone'}.\nAnswer: ${L}${ACC_NAME[acc][2]}`,
        why: [`${nm(L, other)} ใช้เครื่องหมาย${ACC_NAME[other][0]} แต่โจทย์เป็น${ACC_NAME[acc][0]}`, `${lab(L)} ไม่มีเครื่องหมาย แต่โจทย์มี${ACC_NAME[acc][0]}`, `${LETTERS[(li + 1) % 7]} อยู่สูงกว่าตำแหน่งนี้ 1 ขั้น`],
        whyEn: [`${L}${ACC_NAME[other][2]} uses a ${ACC_NAME[other][1]}, but this has a ${ACC_NAME[acc][1]}`, `${L} has no sign, but this note has a ${ACC_NAME[acc][1]}`, `${LETTERS[(li + 1) % 7]} is one step higher than this position`],
        tip: 'ชาร์ป ♯ = ขึ้นครึ่งเสียง · แฟลต ♭ = ลงครึ่งเสียง · เนเชอรัล ♮ = กลับเป็นเสียงปกติ', tipEn: 'Sharp ♯ = up a semitone · flat ♭ = down a semitone · natural ♮ = back to normal',
        img: [{ cap: `${lab(L)} (ซ้าย) → ${correct} (ขวา)`, capEn: `${L} (left) → ${L}${ACC_NAME[acc][2]} (right)`, n: { clef: 'treble', notes: [W(nat), W(note)] } }],
      },
    };
  };

  /* ---------- ขั้นคู่ (นับตัวเลขอย่างเดียว) ---------- */
  const NUM_TH = { 2: 'คู่ 2', 3: 'คู่ 3', 4: 'คู่ 4', 5: 'คู่ 5', 6: 'คู่ 6', 7: 'คู่ 7', 8: 'คู่ 8 (ออกเทฟ)' };
  const NUM_EN = { 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th', 8: 'octave' };
  M.GEN.bIntervalNumber = () => {
    const lower = pick(['C4', 'D4', 'E4', 'F4', 'G4', 'A4']);
    const num = pick([2, 3, 4, 5, 6, 7, 8]);
    const upper = fromDIndex(dIndex(lower) + num - 1);
    const walk = letterWalk(lower, upper).map((x) => x[0]);
    const wrong = shuffle([2, 3, 4, 5, 6, 7, 8].filter((n) => n !== num)).sort((a, b) => Math.abs(a - num) - Math.abs(b - num)).slice(0, 3);
    return {
      tag: 'บันไดเสียงและขั้นคู่',
      q: 'โน้ตสองตัวนี้ห่างกันเป็นขั้นคู่ที่เท่าไร',
      c: [NUM_TH[num], ...wrong.map((n) => NUM_TH[n])],
      notation: { clef: 'treble', notes: [W(lower), W(upper)] },
      ex: {
        qAlt: 'What is the interval number between these two notes?',
        th: `นับชื่อโน้ตจากตัวล่างไปตัวบน โดยนับตัวแรกด้วย: ${walk.join(' → ')} = ${num} ตัว\nคำตอบ: ${NUM_TH[num]}\n\nเคล็ดลับดูจากบรรทัด: ${num % 2 === 1 ? 'คู่เลขคี่ (3, 5, 7) โน้ตทั้งสองอยู่บนเส้นทั้งคู่ หรือช่องทั้งคู่' : 'คู่เลขคู่ (2, 4, 6, 8) โน้ตตัวหนึ่งอยู่บนเส้น อีกตัวอยู่ในช่อง'}`,
        en: `Count the letter names from the lower note up, including the first: ${walk.join(' → ')} = ${num}.\nAnswer: a ${NUM_EN[num]}.\n\nStave tip: ${num % 2 === 1 ? 'odd intervals (3rd, 5th, 7th) are line–line or space–space' : 'even intervals (2nd, 4th, 6th, octave) are line–space'}.`,
        why: wrong.map((n) => `${NUM_TH[n]} ต้องนับได้ ${n} ตัว แต่นับได้ ${num} ตัว`),
        whyEn: wrong.map((n) => `A ${NUM_EN[n]} needs ${n} letter names; this has ${num}`),
        tip: 'อย่าลืมนับโน้ตตัวแรกด้วย (C ถึง E = C D E = คู่ 3)', tipEn: 'Always count the first note too (C to E = C D E = a 3rd)',
        img: [{ cap: `ไล่ทีละขั้น: ${walk.join(' ')}`, capEn: `Step by step: ${walk.join(' ')}`, n: { clef: 'treble', notes: letterWalk(lower, upper).map((k) => ({ keys: [k], dur: 'q' })) } }],
      },
    };
  };
})();
