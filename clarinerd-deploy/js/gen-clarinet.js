/* =========================================================
   gen-clarinet.js — โจทย์สุ่มคอร์สคลาริเน็ตและเครื่องลมไม้
   ช่วงเสียง (register) · นิ้ว 12th (register key) · ทรานสโพสโน้ต · ทรานสโพสคีย์
   ทุกโจทย์มีเฉลยสองภาษา (q.ex) · โน้ตทั้งหมดเป็น "โน้ตที่เขียน" (written pitch) เว้นแต่ระบุ
   ========================================================= */
(() => {
  const M = Music;
  const { pick, shuffle, parse, pc, pretty, addInterval, midi, dIndex, fromDIndex, KEYS } = M;
  const W = (k) => ({ keys: [k], dur: 'w' });
  const retry = (fn) => () => { for (let i = 0; i < 20; i++) { try { const q = fn(); if (!/null|undefined/.test(JSON.stringify(q))) return q; } catch (e) { /* สุ่มใหม่ */ } } return fn(); };

  /* ---------- ช่วงเสียง (register) ---------- */
  const REG = {
    chalumeau: { th: 'Chalumeau (ช่วงต่ำ)', en: 'chalumeau (low register)', notes: ['E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'F#4'], range: 'E3 – F♯4', desc: ['เสียงทุ้ม เข้ม อบอุ่น ใช้นิ้วปิดรูเกือบทั้งหมดตอนเสียงต่ำสุด', 'dark, rich and warm'] },
    throat: { th: 'Throat tones (ช่วงคอ)', en: 'throat tones', notes: ['G4', 'G#4', 'A4', 'Bb4'], range: 'G4 – B♭4', desc: ['เปิดรูเกือบหมด ใช้ปุ่ม A และ G♯ ด้านบน เสียงบางกว่าช่วงอื่น', 'very few holes covered; thinner, weaker tone'] },
    clarion: { th: 'Clarion (ช่วงกลาง–สูง)', en: 'clarion (upper register)', notes: ['B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'], range: 'B4 – C6', desc: ['ใช้นิ้วเดียวกับช่วง chalumeau + กดปุ่ม register key เสียงสดใส ชัด', 'chalumeau fingerings + register key; bright and clear'] },
    altissimo: { th: 'Altissimo (ช่วงสูงมาก)', en: 'altissimo (top register)', notes: ['C#6', 'D6', 'E6', 'F6', 'G6'], range: 'C♯6 ขึ้นไป', desc: ['เสียงสูงมาก ต้องใช้นิ้วพิเศษและคุมลมดี', 'very high; special fingerings and strong air support'] },
  };
  M.GEN.cRegister = () => {
    const key = pick(Object.keys(REG)), R = REG[key], note = pick(R.notes);
    const others = Object.keys(REG).filter((k) => k !== key);
    return {
      tag: 'ช่วงเสียงและนิ้ว',
      q: 'โน้ตคลาริเน็ตตัวนี้ (โน้ตที่เขียน) อยู่ในช่วงเสียง (register) ใด',
      c: [R.th, ...others.map((k) => REG[k].th)],
      notation: { clef: 'treble', notes: [W(note)] },
      ex: {
        qAlt: 'Which clarinet register is this (written) note in?',
        th: `${pc(note)} อยู่ในช่วง ${R.th} (${R.range}) — ${R.desc[0]}\n\nช่วงเสียงคลาริเน็ต (โน้ตที่เขียน): Chalumeau E3–F♯4 · Throat G4–B♭4 · Clarion B4–C6 · Altissimo C♯6 ขึ้นไป\nรอยต่อระหว่าง B♭4 กับ B4 เรียกว่า "the break" — ข้ามจากช่วงคอไปช่วง clarion ต้องปิดรูทุกรูพร้อมกัน`,
        en: `${pc(note)} is in the ${R.en} (${R.range}) — ${R.desc[1]}.\n\nRegisters (written): chalumeau E3–F♯4 · throat G4–B♭4 · clarion B4–C6 · altissimo C♯6 and up. Crossing from B♭4 to B4 is "the break".`,
        why: others.map((k) => `${REG[k].th} คือช่วง ${REG[k].range}`), whyEn: others.map((k) => `The ${REG[k].en} is ${REG[k].range}`),
        tip: 'ต่ำ → คอ → clarion → altissimo · the break อยู่ระหว่าง B♭4 กับ B4', tipEn: 'Low → throat → clarion → altissimo · the break lies between B♭4 and B4',
        img: [{ cap: 'จุดเริ่มแต่ละช่วง: E3 · G4 · B4 · C♯6', capEn: 'Start of each register: E3 · G4 · B4 · C♯6', n: { clef: 'treble', notes: ['E3', 'G4', 'B4', 'C#6'].map(W) } }],
      },
    };
  };

  /* ---------- นิ้ว 12th (register key) ---------- */
  const TWELFTH = [['B4', 'E3'], ['C5', 'F3'], ['D5', 'G3'], ['E5', 'A3'], ['F5', 'Bb3'], ['G5', 'C4'], ['A5', 'D4'], ['B5', 'E4'], ['C6', 'F4']];
  M.GEN.cTwelfth = () => {
    const pc = (x) => Music.pc(x) + x.slice(-1); // แสดงเลขออกเทฟด้วย เช่น F3
    const [hi, lo] = pick(TWELFTH);
    const octLow = fromDIndex(dIndex(hi) - 7).replace(/^([A-G])/, (m) => m + parse(hi).acc); // ต่ำลงแค่ 1 ออกเทฟ (กับดักแบบฟลูต/แซก)
    const fifthLow = addInterval(lo, 'P', 5) && fromDIndex(dIndex(lo) + 2);
    const neighbour = TWELFTH.find(([h]) => h !== hi && Math.abs(dIndex(h) - dIndex(hi)) === 1)[1];
    const wrong = [...new Set([octLow, fifthLow, neighbour].filter((x) => x && x !== lo))].slice(0, 3);
    while (wrong.length < 3) wrong.push(pick(TWELFTH.map((x) => x[1]).filter((x) => x !== lo && !wrong.includes(x))));
    const why = wrong.map((w) => (w === octLow ? [`${pc(w)} ต่ำกว่าแค่ 1 ออกเทฟ — คลาริเน็ตไม่ได้ขึ้นออกเทฟเหมือนฟลูตหรือแซกโซโฟน`, `${pc(w)} is only an octave lower — the clarinet does not overblow at the octave like the flute or saxophone`] : [`${pc(w)} + register key จะได้โน้ตอื่น (สูงขึ้น 12th จาก ${pc(w)})`, `${pc(w)} + register key gives a different note (a 12th above ${pc(w)})`]));
    return {
      tag: 'ช่วงเสียงและนิ้ว',
      q: `โน้ต ${pc(hi)} ในช่วง clarion ใช้นิ้วเดียวกับโน้ตต่ำตัวใด แล้วกด register key (นิ้วโป้งซ้าย)`,
      c: [pc(lo), ...wrong.map(pc)],
      notation: { clef: 'treble', notes: [W(hi)] },
      ex: {
        qAlt: `Clarion ${pc(hi)} uses the same fingering as which low note, plus the register key?`,
        th: `คลาริเน็ตมีท่อทรงกระบอกและปลายปิดที่ปากเป่า จึง "ขึ้นเสียงฮาร์มอนิก" (overblow) ที่ขั้นคู่ 12 (1 ออกเทฟ + คู่ 5 = 19 ครึ่งเสียง) ไม่ใช่ออกเทฟ\n\n${pc(hi)} ลงมา 12th = ${pc(lo)} → นิ้ว ${pc(lo)} + register key = ${pc(hi)}`,
        en: `The clarinet’s cylindrical bore, closed at the mouthpiece, overblows at the 12th (an octave + a 5th = 19 semitones), not the octave.\n\n${pc(hi)} down a 12th = ${pc(lo)} → finger ${pc(lo)} and add the register key to get ${pc(hi)}.`,
        why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
        tip: 'คลาริเน็ต = 12th · ฟลูต/แซก/โอโบ = ออกเทฟ', tipEn: 'Clarinet = 12th · flute/sax/oboe = octave',
        img: [{ cap: `${pc(lo)} (นิ้วเดิม) → ${pc(hi)} (+ register key)`, capEn: `${pc(lo)} (fingering) → ${pc(hi)} (+ register key)`, n: { clef: 'treble', notes: [W(lo), W(hi)] } }],
      },
    };
  };

  /* ---------- ทรานสโพสโน้ต ---------- */
  // dir: +1 = เสียงจริงต่ำกว่าที่เขียน (เขียนสูงขึ้น) · -1 = เสียงจริงสูงกว่าที่เขียน
  const INST = [
    { name: 'คลาริเน็ต B♭', en: 'B♭ clarinet', q: 'M', n: 2, dir: 1, th: 'เสียงจริงต่ำกว่าที่เขียน 1 เสียงเต็ม (major 2nd)', thEn: 'sounds a major 2nd lower than written' },
    { name: 'คลาริเน็ต A', en: 'A clarinet', q: 'm', n: 3, dir: 1, th: 'เสียงจริงต่ำกว่าที่เขียน minor 3rd', thEn: 'sounds a minor 3rd lower than written' },
    { name: 'คลาริเน็ต E♭', en: 'E♭ clarinet', q: 'm', n: 3, dir: -1, th: 'เสียงจริงสูงกว่าที่เขียน minor 3rd', thEn: 'sounds a minor 3rd higher than written' },
    { name: 'อัลโตแซกโซโฟน E♭', en: 'E♭ alto saxophone', q: 'M', n: 6, dir: 1, th: 'เสียงจริงต่ำกว่าที่เขียน major 6th', thEn: 'sounds a major 6th lower than written' },
  ];
  function down(note, q, n) { // หาโน้ต X ที่ X + ขั้นคู่ = note
    const li = dIndex(note) - (n - 1), base = fromDIndex(li);
    for (const a of ['', '#', 'b']) { const x = base[0] + a + base.slice(1); const u = addInterval(x, q, n); if (u && midi(u) === midi(note) && u[0] === note[0]) return x; }
    return null;
  }
  M.GEN.cTranspose = retry(() => {
    const I = pick(INST), toWritten = Math.random() < 0.6;
    const given = pick(['C5', 'D5', 'E5', 'F5', 'G5', 'A4', 'Bb4', 'G4', 'F4', 'E4', 'D4', 'Eb5']);
    // เขียน → จริง: ถ้า dir=+1 เสียงจริงต่ำกว่า (down) · จริง → เขียน: กลับทิศ
    const goUp = toWritten ? I.dir === 1 : I.dir === -1;
    const ans = goUp ? addInterval(given, I.q, I.n) : down(given, I.q, I.n);
    const wrongDir = goUp ? down(given, I.q, I.n) : addInterval(given, I.q, I.n);
    const otherI = INST.find((x) => x !== I && !(x.q === I.q && x.n === I.n));
    const other = goUp ? addInterval(given, otherI.q, otherI.n) : down(given, otherI.q, otherI.n);
    const wrongs = [wrongDir, given, other].filter((x) => x && pc(x) !== pc(ans));
    const uniq = [...new Set(wrongs.map(pc))].slice(0, 3);
    if (uniq.length < 3) throw new Error('dup');
    const whyMap = { [pc(wrongDir)]: ['ย้ายผิดทิศ (ขึ้น/ลงสลับกัน)', 'Moved in the wrong direction'], [pc(given)]: ['ยังไม่ได้ทรานสโพส — เครื่องทรานสโพสเสียงไม่ตรงกับโน้ตที่เขียน', 'Not transposed — a transposing instrument does not sound as written'], [pc(other)]: [`ใช้ระยะของ${otherI.name} (${otherI.th})`, `Used the ${otherI.en} interval`] };
    const label = toWritten ? ['เสียงจริง (concert pitch)', 'concert pitch', 'โน้ตที่ต้องเขียน', 'written note'] : ['โน้ตที่เขียน', 'written note', 'เสียงจริง', 'sounding (concert) pitch'];
    return {
      tag: 'การทรานสโพส',
      q: `${I.name}: โน้ตนี้คือ${label[0]} — ${label[2]}คือโน้ตอะไร`,
      c: [pc(ans), ...uniq],
      notation: { clef: 'treble', notes: [W(given)] },
      ex: {
        qAlt: `${I.en}: this is the ${label[1]}. What is the ${label[3]}?`,
        th: `${I.name} ${I.th}\n${toWritten ? 'จากเสียงจริง → โน้ตที่เขียน ต้องย้ายกลับทิศ' : 'จากโน้ตที่เขียน → เสียงจริง ย้ายตามทิศของเครื่อง'}: ${pc(given)} ${goUp ? 'ขึ้น' : 'ลง'} ${I.q === 'M' ? 'major' : 'minor'} ${I.n === 2 ? '2nd' : I.n === 3 ? '3rd' : '6th'} = ${pc(ans)}\n\nทำ 2 ขั้น: นับชื่อโน้ตก่อน แล้วนับครึ่งเสียงให้ตรงชนิดขั้นคู่`,
        en: `The ${I.en} ${I.thEn}.\n${toWritten ? 'Concert → written: move the opposite way' : 'Written → concert: move the instrument’s way'}: ${pc(given)} ${goUp ? 'up' : 'down'} a ${I.q === 'M' ? 'major' : 'minor'} ${I.n === 2 ? '2nd' : I.n === 3 ? '3rd' : '6th'} = ${pc(ans)}.`,
        why: uniq.map((w) => (whyMap[w] || ['ระยะไม่ถูกต้อง', 'Wrong interval'])[0]), whyEn: uniq.map((w) => (whyMap[w] || ['ระยะไม่ถูกต้อง', 'Wrong interval'])[1]),
        tip: 'ชื่อเครื่อง = เสียงที่ได้เมื่อเป่าโน้ต C ที่เขียน (B♭ clarinet: เขียน C ได้เสียง B♭)', tipEn: 'The instrument’s name = the sound of its written C',
        img: [{ cap: `${pc(given)} → ${pc(ans)}`, capEn: `${pc(given)} → ${pc(ans)}`, n: { clef: 'treble', notes: [W(given), W(ans)] } }],
      },
    };
  });

  /* ---------- ทรานสโพสคีย์ (คลาริเน็ต B♭) ---------- */
  const sig = (k) => (k.n === 0 ? 'ไม่มีเครื่องหมาย' : `${k.n}${k.type === '#' ? '♯' : '♭'}`);
  const sigEn = (k) => (k.n === 0 ? 'no sharps/flats' : `${k.n} ${k.type === '#' ? 'sharp' : 'flat'}${k.n > 1 ? 's' : ''}`);
  M.GEN.cKeyTranspose = retry(() => {
    const concert = pick(['C', 'F', 'Bb', 'Eb', 'Ab', 'G', 'D', 'A']);
    const kc = KEYS.find((x) => x.major === concert);
    const up = (t, q, n) => addInterval(t + '4', q, n).replace(/\d$/, '');
    const wTon = up(concert, 'M', 2), kw = KEYS.find((x) => x.major === wTon);
    const dTon = (() => { for (const k of KEYS) if (up(k.major, 'M', 2) === concert) return k.major; return null; })();
    const mTon = up(concert, 'm', 3);
    const cand = [dTon, concert, mTon].filter((t) => t && KEYS.find((x) => x.major === t) && t !== wTon);
    const wrong = [...new Set(cand)].slice(0, 3);
    if (!kw || wrong.length < 3) throw new Error('skip');
    const why = wrong.map((t) => { const k = KEYS.find((x) => x.major === t); return t === concert ? ['เป็นคีย์เสียงจริง ยังไม่ได้ทรานสโพส', 'That is the concert key, untransposed'] : t === dTon ? [`ย้ายผิดทิศ (ลง major 2nd) ได้ ${pretty(t)} major (${sig(k)})`, `Wrong direction (down a 2nd): ${pretty(t)} major`] : [`ย้ายขึ้น minor 3rd ซึ่งเป็นระยะของคลาริเน็ต A`, `Up a minor 3rd is the A clarinet’s interval`]; });
    return {
      tag: 'การทรานสโพส',
      q: `เพลงมีเสียงจริงในคีย์ ${pretty(concert)} major — ต้องเขียนโน้ตให้คลาริเน็ต B♭ ในคีย์ใด`,
      c: [`${pretty(wTon)} major`, ...wrong.map((t) => `${pretty(t)} major`)],
      notation: { clef: 'treble', key: concert },
      ex: {
        qAlt: `The piece sounds in ${pretty(concert)} major. In which key is the B♭ clarinet part written?`,
        th: `คลาริเน็ต B♭ มีเสียงจริงต่ำกว่าที่เขียน major 2nd จึงต้องเขียนให้ "สูงกว่า" เสียงจริง major 2nd\n${pretty(concert)} ขึ้น major 2nd = ${pretty(wTon)} → ${pretty(wTon)} major (${sig(kw)})\n\nวิธีลัด: คีย์ที่เขียน = คีย์เสียงจริง + ชาร์ป 2 ตัว (หรือแฟลตน้อยลง 2 ตัว) — ${pretty(concert)} (${sig(kc)}) → ${pretty(wTon)} (${sig(kw)})`,
        en: `The B♭ clarinet sounds a major 2nd lower than written, so its part is written a major 2nd higher.\n${pretty(concert)} up a major 2nd = ${pretty(wTon)} major (${sigEn(kw)}).\nShortcut: add two sharps (or remove two flats) — ${sigEn(kc)} → ${sigEn(kw)}.`,
        why: why.map((x) => x[0]), whyEn: why.map((x) => x[1]),
        tip: 'คลาริเน็ต B♭: คีย์ที่เขียน = เสียงจริง + 2♯', tipEn: 'B♭ clarinet: written key = concert key + 2 sharps',
        img: [{ cap: `เขียนให้คลาริเน็ต: ${pretty(wTon)} major`, capEn: `Written for clarinet: ${pretty(wTon)} major`, n: { clef: 'treble', key: wTon, notes: [] } }],
      },
    };
  });
})();
