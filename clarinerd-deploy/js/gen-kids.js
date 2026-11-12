/* =========================================================
   gen-kids.js — โจทย์สำหรับเด็กเล็ก (คอร์ส "ดนตรีสำหรับเด็กเล็ก")
   ระดับ 1 (4–6 ปี): ฟังเสียงแล้วเลือกรูป แทบไม่ต้องอ่าน
   ระดับ 2 (6–9 ปี): เริ่มดูโน้ตบนบรรทัด
   ตัวเลือกขึ้นต้นด้วยรูป เพื่อให้เด็กที่ยังอ่านไม่คล่องเลือกได้
   ========================================================= */
(() => {
  const M = Music;
  const { pick, shuffle, rand } = M;
  const tone = (m, d, vol) => ({ notes: [m], dur: d || 0.7, ...(vol ? { vol } : {}) });
  const gap = (d) => ({ rest: true, dur: d || 0.25 });
  const N = (k, dur, dots) => ({ keys: [k], dur: dur || 'w', ...(dots ? { dots } : {}) });
  const others = (all, right) => all.filter((x) => x !== right);
  /** สร้างโจทย์ 2–4 ตัวเลือกจากตาราง { key: [ไทย, อังกฤษ, เหตุผลไทยถ้าเลือกผิด, เหตุผลอังกฤษ] } */
  const make = (tag, q, qAlt, table, right, extra) => {
    const wrong = shuffle(others(Object.keys(table), right)).slice(0, 3);
    return {
      tag, q, c: [table[right][0], ...wrong.map((k) => table[k][0])], ...extra.media,
      ex: { qAlt, th: extra.th, en: extra.en, why: wrong.map((k) => table[k][2]), whyEn: wrong.map((k) => table[k][3]), tip: extra.tip, tipEn: extra.tipEn, ...(extra.img ? { img: extra.img } : {}) },
    };
  };

  /* ================= ระดับ 1 · ฟังและเล่น ================= */

  M.GEN.kHighLow = () => {
    const right = pick(['high', 'low']);
    const m = right === 'high' ? 84 + rand(10) : 38 + rand(10);
    return make('เสียงสูง–เสียงต่ำ', 'ฟังเสียง แล้วบอกว่าเป็นเสียงของใคร', 'Listen. Whose sound is it: high or low?', {
      high: ['🐦 นกน้อย · เสียงสูง', 'bird · high', 'นกน้อยเสียงสูง แหลม เล็ก', 'The bird is high and tiny'],
      low: ['🐻 หมีใหญ่ · เสียงต่ำ', 'bear · low', 'หมีใหญ่เสียงต่ำ ทุ้ม ใหญ่', 'The bear is low and big'],
    }, right, { media: { audio: [tone(m, 1.1), gap(0.3), tone(m, 1.1)] },
      th: right === 'high' ? 'เสียงนี้สูง แหลม เหมือนนกน้อยร้อง\nลองชูมือขึ้นสูง ๆ ตอนได้ยินเสียงสูง' : 'เสียงนี้ต่ำ ทุ้ม เหมือนหมีใหญ่เดิน\nลองย่อตัวลงต่ำ ๆ ตอนได้ยินเสียงต่ำ',
      en: right === 'high' ? 'This sound is high, like a little bird.\nReach your hands up high when you hear a high sound.' : 'This sound is low, like a big bear.\nCrouch down low when you hear a low sound.',
      tip: 'สูง = ชูมือ · ต่ำ = ย่อตัว', tipEn: 'High = hands up · low = crouch down' });
  };

  M.GEN.kLoudSoft = () => {
    const right = pick(['loud', 'soft']);
    const m = 64 + rand(8), v = right === 'loud' ? 1.7 : 0.16;
    return make('ดัง–เบา', 'ฟังเสียง แล้วบอกว่าดังหรือเบา', 'Listen. Is it loud or soft?', {
      loud: ['🦁 ดัง เหมือนสิงโตคำราม', 'loud', 'สิงโตคำรามเสียงดัง', 'A lion roars loudly'],
      soft: ['🐭 เบา เหมือนหนูย่อง', 'soft', 'หนูย่องเสียงเบา', 'A mouse tiptoes softly'],
    }, right, { media: { audio: [tone(m, 0.6, v), tone(m + 4, 0.6, v), tone(m + 7, 0.9, v)] },
      th: right === 'loud' ? 'เสียงนี้ดัง เหมือนสิงโตคำราม\nในโน้ตเพลง เสียงดังใช้ตัว f (อ่านว่า ฟอร์เต้)' : 'เสียงนี้เบา เหมือนหนูย่อง\nในโน้ตเพลง เสียงเบาใช้ตัว p (อ่านว่า เปียโน)',
      en: right === 'loud' ? 'This is loud, like a lion.\nIn music, loud is written f (forte).' : 'This is soft, like a mouse.\nIn music, soft is written p (piano).',
      tip: 'f = ดัง · p = เบา', tipEn: 'f = loud · p = soft' });
  };

  M.GEN.kFastSlow = () => {
    const right = pick(['fast', 'slow']);
    const d = right === 'fast' ? 0.15 : 0.8, base = 60 + rand(5);
    const ms = [0, 2, 4, 5, 7, 5, 4, 2].slice(0, right === 'fast' ? 8 : 5);
    return make('เร็ว–ช้า', 'ฟังเพลง แล้วบอกว่าเร็วหรือช้า', 'Listen. Is the music fast or slow?', {
      fast: ['🐇 เร็ว เหมือนกระต่ายวิ่ง', 'fast', 'กระต่ายวิ่งเร็ว เสียงมาติด ๆ กัน', 'A rabbit runs fast; the notes come quickly'],
      slow: ['🐢 ช้า เหมือนเต่าเดิน', 'slow', 'เต่าเดินช้า เสียงมาทีละก้าว', 'A tortoise walks slowly; the notes come one step at a time'],
    }, right, { media: { audio: ms.map((s) => tone(base + s, d)) },
      th: right === 'fast' ? 'เพลงนี้เร็ว เสียงมาติด ๆ กัน เหมือนกระต่ายวิ่ง\nลองวิ่งอยู่กับที่ตามจังหวะ' : 'เพลงนี้ช้า เสียงมาทีละก้าว เหมือนเต่าเดิน\nลองเดินช้า ๆ ตามจังหวะ',
      en: right === 'fast' ? 'This music is fast, like a running rabbit.\nTry jogging on the spot in time.' : 'This music is slow, like a walking tortoise.\nTry walking slowly in time.',
      tip: 'เร็ว = วิ่ง · ช้า = เดิน', tipEn: 'Fast = run · slow = walk' });
  };

  M.GEN.kUpDown = () => {
    const right = pick(['up', 'down']);
    const base = 60 + rand(5), st = [0, 2, 4, 5, 7];
    const ms = (right === 'up' ? st : [...st].reverse()).map((s) => base + s);
    return make('เสียงขึ้น–เสียงลง', 'ฟังเสียง แล้วบอกว่าขึ้นบันไดหรือลงบันได', 'Listen. Does the tune go up or down the stairs?', {
      up: ['⬆️ ขึ้นบันได', 'up', 'ขึ้นบันได เสียงจะสูงขึ้นทีละขั้น', 'Going up, each note is higher'],
      down: ['⬇️ ลงบันได', 'down', 'ลงบันได เสียงจะต่ำลงทีละขั้น', 'Going down, each note is lower'],
    }, right, { media: { audio: ms.map((m) => tone(m, 0.5)) },
      th: right === 'up' ? 'เสียงสูงขึ้นทีละขั้น เหมือนเดินขึ้นบันได\nลองใช้มือไต่ขึ้นตามเสียง' : 'เสียงต่ำลงทีละขั้น เหมือนเดินลงบันได\nลองใช้มือไต่ลงตามเสียง',
      en: right === 'up' ? 'Each note is higher, like walking upstairs.\nLet your hand climb up with the sound.' : 'Each note is lower, like walking downstairs.\nLet your hand climb down with the sound.',
      tip: 'ใช้มือวาดตามเสียง', tipEn: 'Draw the tune with your hand' });
  };

  M.GEN.kLongShort = () => {
    const right = pick(['long', 'short']);
    const m = 62 + rand(8);
    return make('ยาว–สั้น', 'ฟังเสียง แล้วบอกว่ายาวหรือสั้น', 'Listen. Is the sound long or short?', {
      long: ['🐍 ยาว เหมือนงู', 'long', 'เสียงยาวจะลากไปนาน เหมือนงูตัวยาว', 'A long sound keeps going, like a long snake'],
      short: ['🐸 สั้น เหมือนกบกระโดด', 'short', 'เสียงสั้นจะดังแป๊บเดียว เหมือนกบกระโดด', 'A short sound is quick, like a frog hop'],
    }, right, { media: { audio: right === 'long' ? [tone(m, 2.4)] : [tone(m, 0.18), gap(0.5), tone(m, 0.18)] },
      th: right === 'long' ? 'เสียงนี้ลากยาว เหมือนงูตัวยาว\nลองลากนิ้วเป็นเส้นยาว ๆ ตามเสียง' : 'เสียงนี้สั้น ดังแป๊บเดียว เหมือนกบกระโดด\nลองแตะนิ้วสั้น ๆ ตามเสียง',
      en: right === 'long' ? 'This sound is long, like a snake.\nDraw a long line with your finger.' : 'This sound is short, like a frog hop.\nTap your finger quickly.',
      tip: 'ยาว = ลากเส้น · สั้น = แตะจุด', tipEn: 'Long = draw a line · short = tap a dot' });
  };

  M.GEN.kCount = () => {
    const n = 1 + rand(4), m = 67 + rand(5);
    const T = {};
    [1, 2, 3, 4].forEach((k) => { T[k] = [`${'🥁'.repeat(k)}  ${k} ครั้ง`, `${k}`, `${k} ครั้ง ${k > n ? 'มากเกินไป' : 'น้อยเกินไป'}`, `${k} is ${k > n ? 'too many' : 'too few'}`]; });
    const audio = []; for (let i = 0; i < n; i++) { audio.push(tone(m, 0.32)); audio.push(gap(0.38)); }
    return make('นับเสียง', 'ฟังเสียงกลอง แล้วนับว่าดังกี่ครั้ง', 'Listen to the drum. How many beats?', T, String(n), { media: { audio },
      th: `กลองดัง ${n} ครั้ง\nชูนิ้วขึ้นทีละนิ้วทุกครั้งที่ได้ยินเสียง แล้วนับนิ้ว`, en: `The drum plays ${n} time${n > 1 ? 's' : ''}.\nPut up one finger for each sound, then count your fingers.`,
      tip: 'ได้ยิน 1 เสียง ชู 1 นิ้ว', tipEn: 'One sound, one finger' });
  };

  M.GEN.kSameDiff = () => {
    const right = pick(['same', 'diff']);
    const a = 60 + rand(8), b = right === 'same' ? a : a + pick([7, 9, 12, -7, -9]);
    return make('เหมือน–ต่าง', 'ฟังเสียง 2 เสียง เหมือนกันหรือต่างกัน', 'Listen to two sounds. Are they the same or different?', {
      same: ['🍎🍎 เหมือนกัน', 'same', 'ถ้าเหมือนกัน เสียงที่สองจะไม่ขยับเลย', 'If they were the same, the second would not move'],
      diff: ['🍎🍌 ต่างกัน', 'different', 'ถ้าต่างกัน เสียงที่สองจะสูงขึ้นหรือต่ำลง', 'If they were different, the second would be higher or lower'],
    }, right, { media: { audio: [tone(a, 0.9), gap(0.35), tone(b, 0.9)] },
      th: right === 'same' ? 'สองเสียงนี้เหมือนกัน เสียงที่สองไม่ขยับเลย\nลองร้องตามทั้งสองเสียง จะร้องเสียงเดิม' : 'สองเสียงนี้ต่างกัน เสียงที่สองขยับไปจากเสียงแรก\nลองร้องตาม จะรู้สึกว่าต้องเปลี่ยนเสียง',
      en: right === 'same' ? 'The two sounds are the same.\nSing them back: you sing one note twice.' : 'The two sounds are different.\nSing them back: you have to change your note.',
      tip: 'ร้องตามทั้งสองเสียง', tipEn: 'Sing both sounds back' });
  };

  /* ================= ระดับ 2 · เริ่มอ่านโน้ต ================= */
  const LINES = ['E4', 'G4', 'B4', 'D5', 'F5'], SPACES = ['F4', 'A4', 'C5', 'E5'];
  const SOL = { C4: 'โด', D4: 'เร', E4: 'มี', F4: 'ฟา', G4: 'ซอล' }, SOLEN = { C4: 'do (C)', D4: 're (D)', E4: 'mi (E)', F4: 'fa (F)', G4: 'sol (G)' };
  const ORDER = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'];

  M.GEN.kLineSpace = () => {
    const right = pick(['line', 'space']);
    const k = pick(right === 'line' ? LINES : SPACES);
    return make('เส้นกับช่อง', 'โน้ตตัวนี้อยู่บนเส้น หรืออยู่ในช่อง', 'Is this note on a line or in a space?', {
      line: ['〰️ อยู่บนเส้น', 'on a line', 'โน้ตบนเส้นจะมีเส้นผ่ากลางหัวโน้ต', 'A line note has a line through its middle'],
      space: ['⬜ อยู่ในช่อง', 'in a space', 'โน้ตในช่องจะอยู่ระหว่างเส้นสองเส้น ไม่มีเส้นผ่า', 'A space note sits between two lines'],
    }, right, { media: { notation: { clef: 'treble', notes: [N(k)] } },
      th: right === 'line' ? 'โน้ตตัวนี้อยู่บนเส้น สังเกตว่ามีเส้นผ่ากลางหัวโน้ต เหมือนลูกชิ้นเสียบไม้' : 'โน้ตตัวนี้อยู่ในช่อง หัวโน้ตอยู่ระหว่างเส้นสองเส้นพอดี ไม่มีเส้นผ่ากลาง',
      en: right === 'line' ? 'This note is on a line: the line goes through the middle of the notehead, like a meatball on a stick.' : 'This note is in a space: it sits between two lines with no line through it.',
      tip: 'มีเส้นผ่ากลาง = บนเส้น', tipEn: 'A line through the middle = on a line' });
  };

  M.GEN.kSolfege = () => {
    const k = pick(Object.keys(SOL)), T = {};
    Object.keys(SOL).forEach((x) => { T[x] = [SOL[x], SOLEN[x], `${SOL[x]} อยู่${ORDER.indexOf(x) > ORDER.indexOf(k) ? 'สูง' : 'ต่ำ'}กว่าโน้ตตัวนี้`, `${SOLEN[x]} is ${ORDER.indexOf(x) > ORDER.indexOf(k) ? 'higher' : 'lower'} than this note`]; });
    const where = { C4: 'อยู่ใต้บรรทัด มีเส้นสั้น ๆ ผ่ากลาง', D4: 'เกาะอยู่ใต้เส้นล่างสุด', E4: 'อยู่บนเส้นล่างสุด (เส้นที่ 1)', F4: 'อยู่ในช่องล่างสุด (ช่องที่ 1)', G4: 'อยู่บนเส้นที่ 2' }[k];
    const whereEn = { C4: 'below the staff on its own little line', D4: 'hanging just under the bottom line', E4: 'on the bottom line', F4: 'in the bottom space', G4: 'on the second line' }[k];
    return make('โด เร มี ฟา ซอล', 'โน้ตตัวนี้ชื่ออะไร', 'What is this note called?', T, k, { media: { notation: { clef: 'treble', notes: [N(k)] } },
      th: `โน้ตตัวนี้คือ “${SOL[k]}” ${where}\nไล่จากล่างขึ้นบน: โด เร มี ฟา ซอล`, en: `This note is ${SOLEN[k]}: it is ${whereEn}.\nFrom the bottom up: do re mi fa sol.`,
      tip: 'โดมีเส้นของตัวเอง · ซอลอยู่เส้นที่ 2', tipEn: 'Do has its own little line · sol is on line 2',
      img: [{ cap: 'โด เร มี ฟา ซอล', capEn: 'do re mi fa sol', n: { clef: 'treble', notes: Object.keys(SOL).map((x) => N(x, 'q')) } }] });
  };

  M.GEN.kValue = () => {
    const k = pick(['w', 'h', 'q']);
    const T = {
      w: ['4 จังหวะ', '4 beats', 'ตัวที่นับ 4 คือตัวกลม (วงกลมโล่ง ไม่มีก้าน)', '4 beats is the whole note (an empty circle, no stem)'],
      h: ['2 จังหวะ', '2 beats', 'ตัวที่นับ 2 คือตัวขาว (วงกลมโล่ง มีก้าน)', '2 beats is the half note (an empty circle with a stem)'],
      q: ['1 จังหวะ', '1 beat', 'ตัวที่นับ 1 คือตัวดำ (วงกลมทึบ มีก้าน)', '1 beat is the quarter note (a filled circle with a stem)'],
    };
    const name = { w: 'ตัวกลม', h: 'ตัวขาว', q: 'ตัวดำ' }[k], nameEn = { w: 'whole note', h: 'half note', q: 'quarter note' }[k];
    return make('ตัวดำ ตัวขาว ตัวกลม', 'โน้ตตัวนี้ต้องนับกี่จังหวะ', 'How many beats does this note get?', T, k, { media: { notation: { clef: 'treble', notes: [N('B4', k)] } },
      th: `นี่คือ${name} นับ ${T[k][0]}\nตัวดำ = 1 · ตัวขาว = 2 · ตัวกลม = 4`, en: `This is a ${nameEn}: ${T[k][1]}.\nQuarter = 1 · half = 2 · whole = 4.`,
      tip: 'ดำ 1 · ขาว 2 · กลม 4', tipEn: 'Quarter 1 · half 2 · whole 4',
      img: [{ cap: 'ตัวดำ (1) · ตัวขาว (2) · ตัวกลม (4)', capEn: 'quarter (1) · half (2) · whole (4)', n: { clef: 'treble', notes: [N('B4', 'q'), N('B4', 'h'), N('B4', 'w')] } }] });
  };

  M.GEN.kClap = () => {
    // 4 จังหวะ แต่ละจังหวะเป็น "ตา" (ตัวดำ 1 ตัว) หรือ "ติติ" (เขบ็ต 2 ตัว)
    let beats; do { beats = Array.from({ length: 4 }, () => pick(['ta', 'ta', 'titi'])); } while (!beats.includes('titi'));
    const n = beats.reduce((s, b) => s + (b === 'ta' ? 1 : 2), 0);
    const notes = beats.flatMap((b) => (b === 'ta' ? [N('B4', 'q')] : [N('B4', '8'), N('B4', '8')]));
    const T = {};
    [n - 2, n - 1, n, n + 1, n + 2].filter((x) => x >= 3 && x <= 9).forEach((x) => { T[x] = [`${x} ครั้ง`, `${x}`, `${x} ครั้ง ${x > n ? 'มากเกินไป' : 'น้อยเกินไป'} ลองนับหัวโน้ตใหม่`, `${x} is ${x > n ? 'too many' : 'too few'}; count the noteheads again`]; });
    const say = beats.map((b) => (b === 'ta' ? 'ตา' : 'ติติ')).join(' · ');
    return make('ตบมือตามโน้ต', 'ถ้าตบมือตามโน้ตทุกตัว ต้องตบกี่ครั้ง', 'If you clap every note, how many claps?', T, String(n), { media: { notation: { clef: 'treble', time: '4/4', groups: ['1/4'], notes } },
      th: `ต้องตบ ${n} ครั้ง เพราะมีหัวโน้ต ${n} ตัว\nอ่านว่า: ${say}\nตัวดำอ่านว่า “ตา” ตบ 1 ครั้ง · เขบ็ตคู่ที่มีคานเชื่อมอ่านว่า “ติติ” ตบ 2 ครั้งเร็ว ๆ`,
      en: `${n} claps, because there are ${n} noteheads.\nA quarter note is “ta” (one clap). A beamed pair of eighth notes is “ti-ti” (two quick claps).`,
      tip: 'นับหัวโน้ต ไม่ใช่นับจังหวะ', tipEn: 'Count the noteheads, not the beats' });
  };

  M.GEN.kStepVisual = () => {
    const right = pick(['up', 'down', 'same']);
    const i = 2 + rand(6), j = right === 'up' ? i + 1 + rand(2) : right === 'down' ? i - 1 - rand(2) : i;
    const a = ORDER[i], b = ORDER[Math.max(0, Math.min(ORDER.length - 1, j))];
    return make('ขึ้น ลง เท่าเดิม', 'ดูโน้ต 2 ตัว ตัวที่สองเสียงขึ้น ลง หรือเท่าเดิม', 'Look at the two notes. Does the second go up, down or stay the same?', {
      up: ['⬆️ ขึ้น', 'up', 'ถ้าขึ้น ตัวที่สองต้องอยู่สูงกว่าตัวแรกบนบรรทัด', 'If it went up, the second note would sit higher'],
      down: ['⬇️ ลง', 'down', 'ถ้าลง ตัวที่สองต้องอยู่ต่ำกว่าตัวแรกบนบรรทัด', 'If it went down, the second note would sit lower'],
      same: ['➡️ เท่าเดิม', 'the same', 'ถ้าเท่าเดิม สองตัวต้องอยู่ตำแหน่งเดียวกันพอดี', 'If it stayed the same, both notes would be in the same place'],
    }, right, { media: { notation: { clef: 'treble', notes: [N(a), N(b)] }, audio: [tone(M.midi ? M.midi(a) : 60, 0.8), tone(M.midi ? M.midi(b) : 60, 0.8)] },
      th: right === 'same' ? 'โน้ตสองตัวอยู่ตำแหน่งเดียวกัน เสียงจึงเท่าเดิม' : `โน้ตตัวที่สองอยู่${right === 'up' ? 'สูง' : 'ต่ำ'}กว่าตัวแรกบนบรรทัด เสียงจึง${right === 'up' ? 'สูงขึ้น' : 'ต่ำลง'}\nโน้ตยิ่งอยู่สูงบนบรรทัด เสียงยิ่งสูง`,
      en: right === 'same' ? 'Both notes are in the same place, so the sound stays the same.' : `The second note sits ${right === 'up' ? 'higher' : 'lower'} on the staff, so it sounds ${right === 'up' ? 'higher' : 'lower'}.\nThe higher a note sits, the higher it sounds.`,
      tip: 'อยู่สูง = เสียงสูง', tipEn: 'Higher on the staff = higher sound' });
  };

  M.GEN.kHighest = () => {
    const idx = shuffle([0, 2, 4, 6, 8, 10]).slice(0, 3), top = idx.indexOf(Math.max(...idx));
    const T = {};
    [0, 1, 2].forEach((p) => { T[p] = [`ตัวที่ ${p + 1}`, `note ${p + 1}`, `ตัวที่ ${p + 1} อยู่ต่ำกว่าตัวที่ ${top + 1}`, `Note ${p + 1} sits lower than note ${top + 1}`]; });
    return make('ขึ้น ลง เท่าเดิม', 'โน้ตตัวไหนเสียงสูงที่สุด', 'Which note is the highest?', T, String(top), { media: { notation: { clef: 'treble', notes: idx.map((i) => N(ORDER[i], 'h')) } },
      th: `ตัวที่ ${top + 1} อยู่สูงที่สุดบนบรรทัด จึงมีเสียงสูงที่สุด\nนับจากซ้ายไปขวา: ตัวที่ 1, 2, 3`, en: `Note ${top + 1} sits highest on the staff, so it sounds highest.\nCount from left to right: 1, 2, 3.`,
      tip: 'หาตัวที่อยู่บนสุด', tipEn: 'Find the one at the top' });
  };
})();
