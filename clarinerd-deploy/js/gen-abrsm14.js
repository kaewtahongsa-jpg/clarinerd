/* =========================================================
   gen-abrsm14.js — ตัวสร้างโจทย์อัตโนมัติ ABRSM Theory Grade 1–4
   โจทย์ภาษาอังกฤษแบบข้อสอบจริง · เฉลยละเอียดสองภาษา (q.ex) ในตัว
   ชื่อตัวสร้าง: a{เกรด}{หัวข้อ} เช่น a1Note, a3Interval, a4Triad
   ========================================================= */
(() => {
  const M = Music;
  const { pick, shuffle, parse, pc, pretty, addInterval, midi, dIndex, fromDIndex, letterWalk, bare, LETTERS, KEYS } = M;
  const W = (k) => ({ keys: [k], dur: 'w' });
  const Qn = (k) => ({ keys: [k], dur: 'q' });
  const ACC = { '#': ['ชาร์ป', 'sharp', '♯'], b: ['แฟลต', 'flat', '♭'], '##': ['ดับเบิลชาร์ป', 'double sharp', '𝄪'], bb: ['ดับเบิลแฟลต', 'double flat', '𝄫'] };
  const tagOf = (g, t) => `G${g} ${t}`;
  const PITCH = 'Pitch', KEYT = 'Keys & intervals', RHY = 'Rhythm';

  /* =========================================================
     1) อ่านโน้ต
     ========================================================= */
  const CLEFS = {
    treble: { bottom: 'E4', ref: 'G4', th: 'กุญแจซอล', en: 'treble clef', refTh: 'เส้นที่ 2 = G', refEn: 'line 2 = G' },
    bass: { bottom: 'G2', ref: 'F3', th: 'กุญแจฟา', en: 'bass clef', refTh: 'เส้นที่ 4 = F', refEn: 'line 4 = F' },
    alto: { bottom: 'F3', ref: 'C4', th: 'กุญแจอัลโต', en: 'alto clef', refTh: 'เส้นกลาง (เส้นที่ 3) = Middle C', refEn: 'the middle line = middle C' },
  };
  function posOf(note, clef) {
    const p = dIndex(note) - dIndex(CLEFS[clef].bottom);
    if (p >= 0 && p <= 8) return p % 2 === 0 ? [`เส้นที่ ${p / 2 + 1}`, `line ${p / 2 + 1}`] : [`ช่องที่ ${(p + 1) / 2}`, `space ${(p + 1) / 2}`];
    if (p < 0) { const l = Math.floor(-p / 2); return p % 2 === 0 ? [`เส้นน้อยเส้นที่ ${l} ใต้บรรทัด`, `ledger line ${l} below`] : [`ใต้บรรทัด${l ? ` (ใต้เส้นน้อยเส้นที่ ${l})` : ''}`, `below the stave${l ? ` (under ledger line ${l})` : ''}`]; }
    const q = p - 8, l = Math.floor(q / 2); return q % 2 === 0 ? [`เส้นน้อยเส้นที่ ${l} เหนือบรรทัด`, `ledger line ${l} above`] : [`เหนือบรรทัด${l ? ` (เหนือเส้นน้อยเส้นที่ ${l})` : ''}`, `above the stave${l ? ` (over ledger line ${l})` : ''}`];
  }
  // ช่วงโน้ตตามจำนวนเส้นน้อยที่หลักสูตรกำหนด (ไม่เกิน `ledger` เส้น)
  function range(clef, ledger) {
    const b = dIndex(CLEFS[clef].bottom), out = [];
    for (let k = b - 2 * ledger - 1; k <= b + 8 + 2 * ledger + 1; k++) { const off = k - b; if (off < -2 * ledger || off > 8 + 2 * ledger) continue; out.push(fromDIndex(k)); }
    return out;
  }
  function noteGen(g, opt) {
    return () => {
      const clef = pick(opt.clefs);
      const nat = pick(range(clef, opt.ledger));
      const r = Math.random();
      const acc = opt.dbl && r < 0.12 ? pick(['##', 'bb']) : r < opt.accP ? pick(['#', 'b']) : '';
      const note = nat[0] + acc + nat.slice(1), L = nat[0], C = CLEFS[clef];
      const name = pc(note), li = LETTERS.indexOf(L);
      const wrongs = [];
      if (acc) wrongs.push(pc(L + (acc.includes('#') ? 'b' : '#') + '4'), L);
      wrongs.push(pc(LETTERS[(li + 1) % 7] + acc + '4'), pc(LETTERS[(li + 6) % 7] + acc + '4'), pc(LETTERS[(li + 2) % 7] + acc + '4'));
      const wrong = [...new Set(wrongs.filter((w) => w !== name))].slice(0, 3);
      const walk = letterWalk(C.ref, nat).map(bare);
      const [pTh, pEn] = posOf(nat, clef);
      const why = wrong.map((w) => {
        if (w[0] === L) return [`${w}: ตัวอักษรถูก แต่เครื่องหมายไม่ตรงกับในโจทย์`, `${w}: right letter, wrong accidental`];
        const d = ((LETTERS.indexOf(w[0]) - li + 7) % 7), step = d > 3 ? d - 7 : d;
        return [`${w[0]} อยู่${step > 0 ? 'สูง' : 'ต่ำ'}กว่าตำแหน่งนี้ ${Math.abs(step)} ขั้น`, `${w[0]} is ${Math.abs(step)} step${Math.abs(step) > 1 ? 's' : ''} ${step > 0 ? 'higher' : 'lower'} than this position`];
      });
      return {
        tag: tagOf(g, PITCH),
        q: `Name this note (${C.en}).`,
        c: [name, ...wrong],
        notation: { clef, notes: [W(note)] },
        ex: {
          qAlt: `โน้ตตัวนี้ (${C.th}) คือโน้ตอะไร`,
          th: `ขั้นที่ 1: ${C.th} — ${C.refTh}\nขั้นที่ 2: โน้ตอยู่ที่${pTh} ไล่ชื่อจาก ${bare(C.ref)}: ${walk.join(' → ')}${acc ? `\nขั้นที่ 3: มีเครื่องหมาย${ACC[acc][0]} (${ACC[acc][2]}) → ${name}` : ''}\nคำตอบ: ${name}`,
          en: `Step 1: ${C.en} — ${C.refEn}.\nStep 2: the note is on ${pEn}; count from ${bare(C.ref)}: ${walk.join(' → ')}.${acc ? `\nStep 3: it has a ${ACC[acc][1]} (${ACC[acc][2]}) → ${name}.` : ''}\nAnswer: ${name}`,
          why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
          tip: { treble: 'เส้น E G B D F · ช่อง F A C E', bass: 'เส้น G B D F A · ช่อง A C E G', alto: 'อัลโต: เส้นกลาง = Middle C · เส้น F A C E G' }[clef],
          tipEn: { treble: 'Lines E G B D F · spaces F A C E', bass: 'Lines G B D F A · spaces A C E G', alto: 'Alto: middle line = middle C · lines F A C E G' }[clef],
          img: C.ref === nat ? undefined : [{ cap: `ตัวอ้างอิง ${bare(C.ref)} (ซ้าย) → โน้ตในโจทย์ (ขวา)`, capEn: `Reference ${bare(C.ref)} (left) → the note (right)`, n: { clef, notes: [W(C.ref), W(note)] } }],
        },
      };
    };
  }

  /* =========================================================
     2) กุญแจเสียง
     ========================================================= */
  const SH = ['F', 'C', 'G', 'D', 'A', 'E', 'B'], FL = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
  const kname = (k, minor) => `${pretty(minor ? k.minor : k.major)} ${minor ? 'minor' : 'major'}`;
  const sigTxt = (k) => (k.n === 0 ? ['ไม่มีเครื่องหมาย', 'no sharps or flats'] : [`${k.type === '#' ? 'ชาร์ป' : 'แฟลต'} ${k.n} ตัว`, `${k.n} ${k.type === '#' ? 'sharp' : 'flat'}${k.n > 1 ? 's' : ''}`]);
  function keyGen(g, majors, minors) {
    return () => {
      const asMinor = minors.length && Math.random() < 0.45;
      const pool = (asMinor ? minors : majors).map((t) => KEYS.find((x) => (asMinor ? x.minor : x.major) === t)).filter((k) => k && k.n > 0);
      const k = pick(pool);
      const all = (asMinor ? minors : majors).map((t) => KEYS.find((x) => (asMinor ? x.minor : x.major) === t));
      const twin = KEYS.find((x) => x.n === k.n && x.type !== k.type);
      let cand = shuffle(all.filter((x) => x !== k));
      if (twin && !cand.includes(twin)) cand.unshift(twin);
      if (cand.length < 3) cand = [...cand, ...shuffle(KEYS.filter((x) => x !== k && !cand.includes(x)))];
      const wrong = cand.slice(0, 3);
      const list = (k.type === '#' ? SH : FL).slice(0, k.n).map((x) => x + (k.type === '#' ? '♯' : '♭'));
      const last = list[list.length - 1];
      const stepTh = k.type === '#' ? `ชาร์ปตัวสุดท้าย (${last}) + ครึ่งเสียง = ${pretty(k.major)} major` : k.n === 1 ? 'แฟลต 1 ตัว = F major (จำไว้เลย)' : `แฟลตตัวรองสุดท้าย (${list[list.length - 2]}) = ${pretty(k.major)} major`;
      const stepEn = k.type === '#' ? `last sharp (${last}) + a semitone = ${pretty(k.major)} major` : k.n === 1 ? 'one flat = F major (learn it)' : `second-to-last flat (${list[list.length - 2]}) = ${pretty(k.major)} major`;
      const why = wrong.map((x) => { const t = sigTxt(x); return [`${kname(x, asMinor)} ${x.n ? 'มี' : ''}${t[0]}${x.n === k.n ? ' (จำนวนเท่ากันแต่คนละชนิด)' : ''}`, `${kname(x, asMinor)} has ${t[1]}`]; });
      const ton = asMinor ? k.minor : k.major;
      return {
        tag: tagOf(g, KEYT),
        q: `Which ${asMinor ? 'minor' : 'major'} key has this key signature?`,
        c: [kname(k, asMinor), ...wrong.map((x) => kname(x, asMinor))],
        notation: { clef: Math.random() < 0.6 ? 'treble' : 'bass', key: k.major },
        ex: {
          qAlt: `เครื่องหมายประจำกุญแจเสียงนี้เป็นของบันไดเสียง${asMinor ? 'ไมเนอร์' : 'เมเจอร์'}ใด`,
          th: `ขั้นที่ 1: มี${sigTxt(k)[0]}: ${list.join(' ')}\nขั้นที่ 2: วิธีลัด — ${stepTh}${asMinor ? `\nขั้นที่ 3: relative minor อยู่ต่ำกว่าเมเจอร์ 3 ครึ่งเสียง → ${pretty(k.minor)} minor` : ''}`,
          en: `Step 1: ${sigTxt(k)[1]}: ${list.join(' ')}.\nStep 2: shortcut — ${stepEn}.${asMinor ? `\nStep 3: the relative minor is 3 semitones lower → ${pretty(k.minor)} minor.` : ''}`,
          why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
          tip: 'ลำดับชาร์ป F C G D A E B · ลำดับแฟลต B E A D G C F', tipEn: 'Sharps F C G D A E B · flats B E A D G C F',
          img: [{ cap: `${kname(k, asMinor)}: โทนิก ${pretty(ton)}`, capEn: `${kname(k, asMinor)}: tonic ${pretty(ton)}`, n: { clef: 'treble', key: k.major, notes: [{ keys: [ton + ('CDEF'.includes(ton[0]) ? '5' : '4')], dur: 'w', accs: [''] }] } }],
        },
      };
    };
  }

  /* =========================================================
     3) ขั้นคู่เหนือโทนิก (G1–3) และขั้นคู่ทั่วไป (G4)
     ========================================================= */
  const SCALE = { major: [['P', 1], ['M', 2], ['M', 3], ['P', 4], ['P', 5], ['M', 6], ['M', 7], ['P', 8]], minor: [['P', 1], ['M', 2], ['m', 3], ['P', 4], ['P', 5], ['m', 6], ['M', 7], ['P', 8]] };
  const NUM = { 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th', 8: 'octave' };
  const QEN = { P: 'perfect', M: 'major', m: 'minor', A: 'augmented', d: 'diminished' };
  const QTH = { P: 'เพอร์เฟกต์', M: 'เมเจอร์', m: 'ไมเนอร์', A: 'ออกเมนเต็ด', d: 'ดิมินิชท์' };
  const lbl = (q, n, withQ) => (withQ ? `${QEN[q]} ${NUM[n]}` : NUM[n]);
  function tonicIntervalGen(g, keys, withQ) {
    return () => {
      const [ton, mode] = pick(keys);
      const tonic = ton + ('CDEF'.includes(ton[0]) ? '4' : '4').replace('4', ['A', 'B'].includes(ton[0]) ? '3' : '4');
      const deg = pick([2, 3, 4, 5, 6, 7, 8]);
      const [q] = SCALE[mode][deg - 1];
      const upper = addInterval(tonic, q, deg);
      const walk = letterWalk(tonic, upper).map((x) => x[0]);
      const correct = lbl(q, deg, withQ);
      let pool;
      if (withQ) pool = Object.keys(NUM).flatMap((n) => ([1, 4, 5, 8].includes(+n) ? ['P'] : ['M', 'm']).map((qq) => lbl(qq, +n, true)));
      else pool = Object.values(NUM);
      const near = pool.filter((x) => x !== correct).sort((a, b) => { const na = Object.values(NUM).findIndex((v) => a.endsWith(v)), nb = Object.values(NUM).findIndex((v) => b.endsWith(v)); return Math.abs(na - (deg - 2)) - Math.abs(nb - (deg - 2)); });
      const wrong = shuffle(near.slice(0, 5)).slice(0, 3);
      const keyName = `${pretty(ton)} ${mode}`;
      const semis = midi(upper) - midi(tonic);
      const why = wrong.map((w) => {
        const wn = +Object.keys(NUM).find((n) => w.endsWith(NUM[n]));
        if (wn !== deg) return [`${w} ต้องนับชื่อโน้ตได้ ${wn} ตัว แต่นับได้ ${deg} ตัว`, `A ${w} needs ${wn} letter names; this has ${deg}`];
        return [`ตัวเลขถูก แต่ ${w} ไม่ตรงกับระยะ ${semis} ครึ่งเสียง (โน้ตบนอยู่ในบันไดเสียง${mode === 'minor' ? 'ฮาร์โมนิกไมเนอร์' : 'เมเจอร์'})`, `Right number, but ${w} does not fit ${semis} semitones (the top note belongs to the ${mode === 'minor' ? 'harmonic minor' : 'major'} scale)`];
      });
      const scaleNotes = SCALE[mode].map(([a, b]) => addInterval(tonic, a, b));
      return {
        tag: tagOf(g, KEYT),
        q: `Name the interval${withQ ? ' (quality and number)' : ' (number only)'}. The lower note is the tonic of ${keyName}.`,
        c: [correct, ...wrong],
        notation: { clef: 'treble', notes: [W(tonic), W(upper)] },
        ex: {
          qAlt: `บอกชื่อขั้นคู่${withQ ? ' (ชนิดและตัวเลข)' : ' (เฉพาะตัวเลข)'} — โน้ตล่างคือโทนิกของ ${keyName}`,
          th: `ขั้นที่ 1: นับชื่อโน้ต (นับตัวแรกด้วย): ${walk.join(' → ')} = ${deg} ตัว → ${NUM[deg]}` +
            (withQ ? `\nขั้นที่ 2: โน้ตบน ${pc(upper)} คือขั้นที่ ${deg} ของบันไดเสียง ${keyName}${mode === 'minor' ? ' (ใช้ฮาร์โมนิกไมเนอร์)' : ''}\nกฎ: ขั้นคู่เหนือโทนิกในเมเจอร์ = major หรือ perfect เสมอ · ในไมเนอร์ ขั้น 3 และ 6 เป็น minor ขั้น 7 (ฮาร์โมนิก) เป็น major\nขั้นที่ 3: ห่าง ${semis} ครึ่งเสียง → ${correct}` : `\nคำตอบ: ${correct}`),
          en: `Step 1: count the letter names, including the first: ${walk.join(' → ')} = ${deg} → a ${NUM[deg]}.` +
            (withQ ? `\nStep 2: ${pc(upper)} is degree ${deg} of ${keyName}${mode === 'minor' ? ' (harmonic minor)' : ''}.\nRule: above the tonic of a major key every interval is major or perfect; in a minor key the 3rd and 6th are minor and the (harmonic) 7th is major.\nStep 3: ${semis} semitones → ${correct}.` : `\nAnswer: ${correct}.`),
          why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
          tip: withQ ? '1 4 5 8 = perfect · เมเจอร์สเกล: 2 3 6 7 = major' : 'อย่าลืมนับโน้ตตัวล่างด้วย', tipEn: withQ ? '1 4 5 8 = perfect · major scale: 2 3 6 7 = major' : 'Count the bottom note too',
          img: scaleNotes.every(Boolean) ? [{ cap: `บันไดเสียง ${keyName}: ขั้นที่ ${deg} คือ ${pc(upper)}`, capEn: `${keyName} scale: degree ${deg} is ${pc(upper)}`, n: { clef: 'treble', notes: scaleNotes.map(Qn) } }] : undefined,
        },
      };
    };
  }
  const IV4 = [['m', 2], ['M', 2], ['A', 2], ['m', 3], ['M', 3], ['d', 4], ['P', 4], ['A', 4], ['d', 5], ['P', 5], ['A', 5], ['m', 6], ['M', 6], ['d', 7], ['m', 7], ['M', 7], ['P', 8]];
  function anyIntervalGen(g) {
    return () => {
      let lower, upper, q, n;
      do { lower = pick(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B3', 'Bb3', 'Eb4', 'F#4', 'Ab4', 'C#4']); [q, n] = pick(IV4); upper = addInterval(lower, q, n); } while (!upper);
      const correct = lbl(q, n, true);
      const walk = letterWalk(lower, upper).map((x) => x[0]);
      const isP = [1, 4, 5, 8].includes(n), ref = addInterval(lower, isP ? 'P' : 'M', n);
      const diff = midi(upper) - midi(ref), semis = midi(upper) - midi(lower);
      const pool = IV4.filter(([a, b]) => Math.abs(b - n) <= 1).map(([a, b]) => lbl(a, b, true)).filter((x) => x !== correct);
      const wrong = shuffle(pool).slice(0, 3);
      const why = wrong.map((w) => { const [wq, ...rest] = w.split(' '); const wn = +Object.keys(NUM).find((k) => NUM[k] === rest.join(' ')); return wn !== n ? [`${w} ต้องนับชื่อโน้ตได้ ${wn} ตัว แต่นับได้ ${n} ตัว`, `A ${w} needs ${wn} letter names; this has ${n}`] : [`ตัวเลขถูก แต่ ${w} ไม่ตรงกับระยะ ${semis} ครึ่งเสียง`, `Right number, but ${w} does not fit ${semis} semitones`]; });
      return {
        tag: tagOf(g, KEYT),
        q: 'Name this interval (quality and number).',
        c: [correct, ...wrong],
        notation: { clef: 'treble', notes: [W(lower), W(upper)] },
        ex: {
          qAlt: 'บอกชื่อขั้นคู่นี้ (ชนิดและตัวเลข)',
          th: `ขั้นที่ 1: นับชื่อโน้ต: ${walk.join(' → ')} = ${n} ตัว\nขั้นที่ 2: ในบันไดเสียง ${pc(lower)} major ขั้นที่ ${n} คือ ${pc(ref)} → ${isP ? 'perfect' : 'major'} ${NUM[n]}\nขั้นที่ 3: โน้ตบน ${pc(upper)} ${diff === 0 ? 'ตรงกันพอดี' : `${diff < 0 ? 'ต่ำ' : 'สูง'}กว่า ${Math.abs(diff)} ครึ่งเสียง`}\nกฎ: ${isP ? 'perfect −1 = diminished · +1 = augmented' : 'major −1 = minor · −2 = diminished · +1 = augmented'}\nคำตอบ: ${correct}`,
          en: `Step 1: count letters: ${walk.join(' → ')} = ${n}.\nStep 2: in ${pc(lower)} major the ${NUM[n]} is ${pc(ref)} → ${isP ? 'perfect' : 'major'}.\nStep 3: ${pc(upper)} is ${diff === 0 ? 'exactly that' : `${Math.abs(diff)} semitone${Math.abs(diff) > 1 ? 's' : ''} ${diff < 0 ? 'lower' : 'higher'}`}.\nRule: ${isP ? 'perfect −1 = diminished · +1 = augmented' : 'major −1 = minor · −2 = diminished · +1 = augmented'}.\nAnswer: ${correct}`,
          why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
          tip: 'เทียบกับบันไดเสียงเมเจอร์ของโน้ตตัวล่างเสมอ', tipEn: 'Always compare with the lower note’s major scale',
          img: ref !== upper ? [{ cap: `เทียบ: ${pc(lower)} → ${pc(ref)} = ${isP ? 'perfect' : 'major'} ${NUM[n]}`, capEn: `Compare: ${pc(lower)} → ${pc(ref)} = ${isP ? 'perfect' : 'major'} ${NUM[n]}`, n: { clef: 'treble', notes: [W(lower), W(ref)] } }] : undefined,
        },
      };
    };
  }

  /* =========================================================
     4) ทรัยแอดโทนิก (G1–3) · คอร์ด I IV V (G4)
     ========================================================= */
  function tonicTriadGen(g, keys) {
    return () => {
      const [ton, mode] = pick(keys);
      const tonic = ton + (['A', 'B'].includes(ton[0]) ? '3' : '4');
      const notes = [tonic, addInterval(tonic, mode === 'major' ? 'M' : 'm', 3), addInterval(tonic, 'P', 5)];
      const keyEntry = KEYS.find((x) => (mode === 'major' ? x.major : x.minor) === ton);
      const correct = `${pretty(ton)} ${mode}`;
      const twin = keys.find(([t, m]) => t === ton && m !== mode);
      const others = shuffle(keys.filter(([t, m]) => !(t === ton))).map(([t, m]) => `${pretty(t)} ${m}`);
      const wrong = [...new Set([...(twin ? [`${pretty(twin[0])} ${twin[1]}`] : [`${pretty(ton)} ${mode === 'major' ? 'minor' : 'major'}`]), ...others])].slice(0, 3);
      const t3 = midi(notes[1]) - midi(notes[0]);
      const why = wrong.map((w) => { const [wt, wm] = w.split(' '); return wt === pretty(ton) ? [`${w} ใช้โน้ตตัวกลาง ${wm === 'major' ? 'สูง' : 'ต่ำ'}กว่านี้ครึ่งเสียง (คู่ 3 ${wm === 'major' ? 'major' : 'minor'})`, `${w} would have a ${wm === 'major' ? 'major' : 'minor'} 3rd in the middle`] : [`ทรัยแอดโทนิกของ ${w} ต้องมี ${wt} เป็นโน้ตล่างสุด`, `The tonic triad of ${w} has ${wt} at the bottom`]; });
      return {
        tag: tagOf(g, KEYT),
        q: 'This is a tonic triad. Name the key.',
        c: [correct, ...wrong],
        notation: { clef: 'treble', key: keyEntry ? keyEntry.major : undefined, notes: [{ keys: notes, dur: 'w', accs: notes.map(() => '') }] },
        ex: {
          qAlt: 'นี่คือทรัยแอดโทนิก (คอร์ดบนขั้นที่ 1) — เป็นของคีย์ใด',
          th: `ขั้นที่ 1: ทรัยแอดในตำแหน่งราก โน้ตล่างสุดคือโทนิก = ${pc(notes[0])}\nขั้นที่ 2: ดูคู่ 3 ล่าง ${pc(notes[0])}–${pc(notes[1])} = ${t3} ครึ่งเสียง → ${t3 === 4 ? 'major 3rd = คีย์เมเจอร์' : 'minor 3rd = คีย์ไมเนอร์'}\nขั้นที่ 3: ตรวจกับเครื่องหมายประจำกุญแจ (${keyEntry ? sigTxt(keyEntry)[0] : '-'})\nคำตอบ: ${correct}`,
          en: `Step 1: in root position the bottom note is the tonic: ${pc(notes[0])}.\nStep 2: the lower 3rd ${pc(notes[0])}–${pc(notes[1])} is ${t3} semitones → ${t3 === 4 ? 'major 3rd = major key' : 'minor 3rd = minor key'}.\nStep 3: check the key signature (${keyEntry ? sigTxt(keyEntry)[1] : '-'}).\nAnswer: ${correct}`,
          why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
          tip: 'โน้ตล่าง = ชื่อคีย์ · คู่ 3 ล่างบอกเมเจอร์/ไมเนอร์', tipEn: 'Bottom note = key name · the lower 3rd tells major or minor',
        },
      };
    };
  }
  const SC_MAJ = [['P', 1], ['M', 2], ['M', 3], ['P', 4], ['P', 5], ['M', 6], ['M', 7]], SC_MIN = [['P', 1], ['M', 2], ['m', 3], ['P', 4], ['P', 5], ['m', 6], ['M', 7]];
  function primaryTriadGen(g, keys) {
    return () => {
      const [ton, mode] = pick(keys);
      const tonic = ton + (['A', 'B'].includes(ton[0]) ? '3' : '4');
      const SC = mode === 'major' ? SC_MAJ : SC_MIN;
      const sn = (k) => { const [a, b] = SC[k % 7]; return addInterval(tonic, a, b).replace(/-?\d+$/, (o) => +o + Math.floor(k / 7)); };
      const deg = pick([0, 3, 4]), R = { 0: 'I', 3: 'IV', 4: 'V' };
      const notes = [sn(deg), sn(deg + 2), sn(deg + 4)];
      const keyEntry = KEYS.find((x) => (mode === 'major' ? x.major : x.minor) === ton);
      const chordOf = (d) => [sn(d), sn(d + 2), sn(d + 4)].map(pc).join('–');
      const wrong = [0, 3, 4].filter((d) => d !== deg).map((d) => R[d]);
      wrong.push(deg === 4 ? 'II' : 'VI');
      const why = wrong.map((w) => { const d = { I: 0, II: 1, IV: 3, V: 4, VI: 5 }[w]; return [`คอร์ด ${w} ของ ${pretty(ton)} ${mode} คือ ${chordOf(d)}`, `Chord ${w} in ${pretty(ton)} ${mode} is ${chordOf(d)}`]; });
      const DEG = { 0: ['โทนิก', 'tonic'], 3: ['ซับโดมิแนนต์', 'subdominant'], 4: ['โดมิแนนต์', 'dominant'] };
      return {
        tag: tagOf(g, KEYT),
        q: `The key is ${pretty(ton)} ${mode}. Is this triad I, IV or V?`,
        c: [R[deg], ...wrong],
        notation: { clef: 'treble', key: keyEntry ? keyEntry.major : undefined, notes: [{ keys: notes, dur: 'w', accs: notes.map((n) => { const p = parse(n); return mode === 'minor' && deg === 4 && n === notes[1] ? p.acc || 'n' : ''; }) }] },
        ex: {
          qAlt: `คีย์ ${pretty(ton)} ${mode} — ทรัยแอดนี้คือคอร์ด I, IV หรือ V`,
          th: `ขั้นที่ 1: โน้ตล่างสุด (ราก) คือ ${pc(notes[0])}\nขั้นที่ 2: ${pc(notes[0])} เป็นขั้นที่ ${deg + 1} (${DEG[deg][0]}) ของ ${pretty(ton)} ${mode}${mode === 'minor' && deg === 4 ? ' — ในไมเนอร์ คอร์ด V ยกขั้นที่ 7 ขึ้น (ฮาร์โมนิกไมเนอร์)' : ''}\nคำตอบ: ${R[deg]}`,
          en: `Step 1: the bottom note (root) is ${pc(notes[0])}.\nStep 2: ${pc(notes[0])} is degree ${deg + 1} (the ${DEG[deg][1]}) of ${pretty(ton)} ${mode}${mode === 'minor' && deg === 4 ? ' — in minor keys chord V uses the raised 7th (harmonic minor)' : ''}.\nAnswer: ${R[deg]}`,
          why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
          tip: 'I = ขั้น 1 · IV = ขั้น 4 · V = ขั้น 5 (ดูจากโน้ตล่างสุด)', tipEn: 'I = degree 1 · IV = degree 4 · V = degree 5 (look at the bottom note)',
        },
      };
    };
  }

  /* =========================================================
     5) อัตราจังหวะ (ดูการจัดกลุ่มโน้ตในห้อง)
     ========================================================= */
  const P8 = (k, d, dots) => ({ keys: [k || 'B4'], dur: d, dots });
  const PIECES = {
    q: [ // นับตัวดำ (หน่วย = เขบ็ต 1 ชั้น)
      { u: 2, n: () => [P8(pick(['G4', 'B4', 'D5']), 'q')], th: 'ตัวดำ (crotchet) = 1', en: 'crotchet = 1' },
      { u: 2, n: () => [P8('A4', '8'), P8('C5', '8')], th: 'เขบ็ต 2 ตัว = 1', en: 'two quavers = 1' },
      { u: 4, n: () => [P8('G4', 'h')], th: 'ตัวขาว (minim) = 2', en: 'minim = 2' },
      { u: 6, n: () => [P8('B4', 'h', 1)], th: 'ตัวขาวประจุด = 3', en: 'dotted minim = 3' },
      { u: 4, n: () => [P8('A4', 'q', 1), P8('B4', '8')], th: 'ตัวดำประจุด + เขบ็ต = 2', en: 'dotted crotchet + quaver = 2' },
    ],
    h: [ // นับตัวขาว
      { u: 4, n: () => [P8('G4', 'h')], th: 'ตัวขาว = 1 จังหวะ', en: 'minim = 1 beat' },
      { u: 4, n: () => [P8('A4', 'q'), P8('B4', 'q')], th: 'ตัวดำ 2 ตัว = 1 จังหวะ', en: 'two crotchets = 1 beat' },
      { u: 8, n: () => [P8('C5', 'w')], th: 'ตัวกลม = 2 จังหวะ', en: 'semibreve = 2 beats' },
    ],
    dq: [ // compound: นับตัวดำประจุด
      { u: 3, n: () => [P8('B4', 'q', 1)], th: 'ตัวดำประจุด = 1 จังหวะ', en: 'dotted crotchet = 1 beat' },
      { u: 3, n: () => [P8('G4', '8'), P8('A4', '8'), P8('B4', '8')], th: 'เขบ็ต 3 ตัว = 1 จังหวะ', en: 'three quavers = 1 beat' },
      { u: 3, n: () => [P8('C5', 'q'), P8('A4', '8')], th: 'ตัวดำ + เขบ็ต = 1 จังหวะ', en: 'crotchet + quaver = 1 beat' },
    ],
  };
  const TS = { '2/4': ['q', 2], '3/4': ['q', 3], '4/4': ['q', 4], '2/2': ['h', 2], '3/2': ['h', 3], '4/2': ['h', 4], '6/8': ['dq', 2], '9/8': ['dq', 3], '12/8': ['dq', 4] };
  const unitsOf = (ts) => { const [kind, n] = TS[ts]; return n * { q: 2, h: 4, dq: 3 }[kind]; };
  const KIND_TH = { q: ['ตัวดำ', 'crotchet', 'simple'], h: ['ตัวขาว', 'minim', 'simple'], dq: ['ตัวดำประจุด', 'dotted crotchet', 'compound'] };
  const BEAT_NAME = { 2: ['duple', 'สองจังหวะ'], 3: ['triple', 'สามจังหวะ'], 4: ['quadruple', 'สี่จังหวะ'] };
  function timeGen(g, sigs) {
    return () => {
      const ts = pick(sigs), [kind, beats] = TS[ts];
      const chosen = []; for (let b = 0; b < beats;) { const opts = PIECES[kind].filter((p) => p.u <= (beats - b) * { q: 2, h: 4, dq: 3 }[kind]); const p = pick(opts); chosen.push(p); b += p.u / { q: 2, h: 4, dq: 3 }[kind]; }
      const notes = chosen.flatMap((p) => p.n());
      const tot = unitsOf(ts);
      const pool = Object.keys(TS).filter((x) => x !== ts && unitsOf(x) !== tot && (sigs.includes(x) || sigs.length < 4));
      const extra = ['2/4', '3/4', '4/4', '6/8'].filter((x) => x !== ts && unitsOf(x) !== tot && !pool.includes(x));
      const wrong = shuffle([...pool.filter((x) => sigs.includes(x)), ...extra, ...pool]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
      const why = wrong.map((w) => { const [wk, wb] = TS[w]; return [`${w} = ${wb} จังหวะ จังหวะละ${KIND_TH[wk][0]} (รวมเท่ากับเขบ็ต ${unitsOf(w)} ตัว) แต่ห้องนี้รวมเท่ากับเขบ็ต ${tot} ตัว`, `${w} = ${wb} ${KIND_TH[wk][1]} beats (${unitsOf(w)} quavers); this bar holds ${tot} quavers`]; });
      return {
        tag: tagOf(g, RHY),
        q: 'Add the correct time signature to this bar.',
        c: [ts, ...wrong],
        notation: { clef: 'treble', beam: true, groups: [kind === 'dq' ? '3/8' : kind === 'h' ? '1/2' : '1/4'], notes },
        ex: {
          qAlt: 'ห้องเพลงนี้ควรใช้อัตราจังหวะใด',
          th: `ขั้นที่ 1: ดูการจัดกลุ่ม — ${kind === 'dq' ? 'เขบ็ตจับกลุ่มละ 3 ตัว แต่ละจังหวะเท่ากับตัวดำประจุด → compound (ผสม)' : kind === 'h' ? 'นับตัวขาวเป็น 1 จังหวะ (ตัวเลขล่าง 2) → simple' : 'นับตัวดำเป็น 1 จังหวะ (ตัวเลขล่าง 4) → simple'}\nขั้นที่ 2: รวมค่า: ${chosen.map((p) => p.th).join(' + ')} → ${beats} จังหวะ\nคำตอบ: ${ts} (${KIND_TH[kind][2]} ${BEAT_NAME[beats][0]})`,
          en: `Step 1: look at the grouping — ${kind === 'dq' ? 'quavers in groups of three, each beat a dotted crotchet → compound' : kind === 'h' ? 'minim beats (bottom number 2) → simple' : 'crotchet beats (bottom number 4) → simple'}.\nStep 2: add up: ${chosen.map((p) => p.en).join(' + ')} → ${beats} beats.\nAnswer: ${ts} (${KIND_TH[kind][2]} ${BEAT_NAME[beats][0]}).`,
          why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
          tip: 'ล่าง 4 = นับตัวดำ · ล่าง 2 = นับตัวขาว · ล่าง 8 (6, 9, 12 บน) = นับตัวดำประจุด', tipEn: 'Bottom 4 = crotchet beats · bottom 2 = minim beats · bottom 8 with 6/9/12 = dotted-crotchet beats',
          img: [{ cap: `ใส่ ${ts} แล้ว`, capEn: `With ${ts}`, n: { clef: 'treble', time: ts, beam: true, groups: [kind === 'dq' ? '3/8' : kind === 'h' ? '1/2' : '1/4'], notes: chosen.flatMap((p) => p.n()) } }],
        },
      };
    };
  }

  /* =========================================================
     6) ค่าโน้ต (ชื่อแบบอังกฤษ UK)
     ========================================================= */
  const VAL = [
    { d: 'w', b: 4, en: 'semibreve', th: 'ตัวกลม' }, { d: 'h', b: 2, en: 'minim', th: 'ตัวขาว' }, { d: 'q', b: 1, en: 'crotchet', th: 'ตัวดำ' },
    { d: '8', b: 0.5, en: 'quaver', th: 'เขบ็ต 1 ชั้น' }, { d: 'h', dots: 1, b: 3, en: 'dotted minim', th: 'ตัวขาวประจุด' }, { d: 'q', dots: 1, b: 1.5, en: 'dotted crotchet', th: 'ตัวดำประจุด' },
    { d: '16', b: 0.25, en: 'semiquaver', th: 'เขบ็ต 2 ชั้น', g: 2 }, { d: '8', dots: 1, b: 0.75, en: 'dotted quaver', th: 'เขบ็ต 1 ชั้นประจุด', g: 2 },
    { d: '32', b: 0.125, en: 'demisemiquaver', th: 'เขบ็ต 3 ชั้น', g: 3 }, { d: 'w', dots: 1, b: 6, en: 'dotted semibreve', th: 'ตัวกลมประจุด', g: 3 },
  ];
  const fr = (x) => ({ 0.125: '⅛', 0.25: '¼', 0.5: '½', 0.75: '¾', 1.5: '1½' }[x] || String(x));
  function valueGen(g) {
    return () => {
      const pool = VAL.filter((v) => !v.g || v.g <= g);
      const v = pick(pool), rest = Math.random() < 0.3 && !v.dots;
      const ans = fr(v.b);
      const wrong = shuffle([...new Set(pool.map((x) => fr(x.b)))].filter((x) => x !== ans)).slice(0, 3);
      const why = wrong.map((w) => { const o = pool.find((x) => fr(x.b) === w); return [`${w} จังหวะ = ${o.en} (${o.th})`, `${w} beat${w === '1' ? '' : 's'} = a ${o.en}`]; });
      return {
        tag: tagOf(g, RHY),
        q: `How many crotchet beats is this ${rest ? 'rest' : 'note'} worth?`,
        c: [ans, ...wrong],
        notation: { clef: 'treble', notes: [rest ? { rest: true, dur: v.d } : P8('B4', v.d, v.dots)] },
        ex: {
          qAlt: `${rest ? 'ตัวหยุด' : 'โน้ต'}ตัวนี้มีค่ากี่จังหวะตัวดำ`,
          th: `ตัวนี้คือ ${v.en} (${rest ? 'ตัวหยุด' : ''}${v.th}) = ${ans} จังหวะตัวดำ${v.dots ? `\nจุดเพิ่มครึ่งหนึ่งของค่าเดิม: ${fr(v.b / 1.5)} + ${fr(v.b / 3)} = ${ans}` : ''}\nชื่ออังกฤษแบบ ABRSM: semibreve 4 · minim 2 · crotchet 1 · quaver ½ · semiquaver ¼ · demisemiquaver ⅛`,
          en: `This is a ${v.en}${rest ? ' rest' : ''} = ${ans} crotchet beat${ans === '1' ? '' : 's'}.${v.dots ? `\nThe dot adds half: ${fr(v.b / 1.5)} + ${fr(v.b / 3)} = ${ans}.` : ''}\nsemibreve 4 · minim 2 · crotchet 1 · quaver ½ · semiquaver ¼ · demisemiquaver ⅛`,
          why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
          tip: 'semibreve → minim → crotchet → quaver → semiquaver (แบ่งครึ่งทีละขั้น)', tipEn: 'Each step halves: semibreve → minim → crotchet → quaver → semiquaver',
        },
      };
    };
  }

  /* =========================================================
     ลงทะเบียนตัวสร้างตามเกรด
     ========================================================= */
  const K1 = [['C', 'major'], ['G', 'major'], ['D', 'major'], ['F', 'major']];
  const K2 = [...K1, ['A', 'major'], ['Bb', 'major'], ['Eb', 'major'], ['A', 'minor'], ['E', 'minor'], ['D', 'minor']];
  const K3 = [...K2, ['E', 'major'], ['Ab', 'major'], ['B', 'minor'], ['F#', 'minor'], ['C#', 'minor'], ['G', 'minor'], ['C', 'minor'], ['F', 'minor']];
  const K4 = [...K3, ['B', 'major'], ['Db', 'major'], ['G#', 'minor'], ['Bb', 'minor']];
  const majs = (K) => K.filter(([, m]) => m === 'major').map(([t]) => t), mins = (K) => K.filter(([, m]) => m === 'minor').map(([t]) => t);
  // บางคีย์ต้องใช้ดับเบิลชาร์ป (เช่น G♯ minor) ที่ตัวช่วยคำนวณไม่รองรับ → สุ่มใหม่
  const retry = (fn) => () => { for (let i = 0; i < 20; i++) { try { const q = fn(); if (!/null|undefined/.test(JSON.stringify(q))) return q; } catch (e) { /* ลองใหม่ */ } } return fn(); };
  const G = new Proxy(M.GEN, { set: (t, k, v) => { t[k] = retry(v); return true; } });
  G.a1Note = noteGen(1, { clefs: ['treble', 'bass'], ledger: 1, accP: 0.25 });
  G.a2Note = noteGen(2, { clefs: ['treble', 'bass'], ledger: 2, accP: 0.3 });
  G.a3Note = noteGen(3, { clefs: ['treble', 'bass'], ledger: 2, accP: 0.3 });
  G.a4Note = noteGen(4, { clefs: ['treble', 'bass', 'alto', 'alto'], ledger: 2, accP: 0.3, dbl: true });
  G.a1Key = keyGen(1, majs(K1), []);
  G.a2Key = keyGen(2, majs(K2), mins(K2));
  G.a3Key = keyGen(3, majs(K3), mins(K3));
  G.a4Key = keyGen(4, majs(K4), mins(K4));
  G.a1Interval = tonicIntervalGen(1, K1, false);
  G.a2Interval = tonicIntervalGen(2, K2, false);
  G.a3Interval = tonicIntervalGen(3, K3, true);
  G.a4Interval = anyIntervalGen(4);
  G.a1Triad = tonicTriadGen(1, K1);
  G.a2Triad = tonicTriadGen(2, K2);
  G.a3Triad = tonicTriadGen(3, K3);
  G.a4Triad = primaryTriadGen(4, K4);
  G.a1Time = timeGen(1, ['2/4', '3/4', '4/4']);
  G.a2Time = timeGen(2, ['2/4', '3/4', '4/4']);
  G.a3Time = timeGen(3, ['2/4', '3/4', '4/4', '2/2', '3/2', '4/2', '6/8', '9/8', '12/8']);
  G.a4Time = timeGen(4, ['2/4', '3/4', '4/4', '2/2', '3/2', '4/2', '6/8', '9/8', '12/8']);
  G.a1Value = valueGen(1);
  G.a2Value = valueGen(2);
  G.a3Value = valueGen(3);
  G.a4Value = valueGen(4);
})();
