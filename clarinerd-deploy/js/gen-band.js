/* =========================================================
   gen-band.js — โจทย์เตรียมสอบดุริยางค์ทหาร
   บันไดเสียงที่ใช้สอบปฏิบัติ: เมเจอร์และฮาร์โมนิกไมเนอร์ ไม่เกิน 4 ชาร์ป / 4 แฟลต
   (ตามประกาศรับสมัครนักเรียนดุริยางค์ทหารเรือ ปีการศึกษา 2570 ข้อ 6.1.1.3)
   ========================================================= */
(() => {
  const M = Music;
  const { pick, shuffle } = M;
  const MAJ = {
    C: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], G: ['G', 'A', 'B', 'C', 'D', 'E', 'F♯'], D: ['D', 'E', 'F♯', 'G', 'A', 'B', 'C♯'],
    A: ['A', 'B', 'C♯', 'D', 'E', 'F♯', 'G♯'], E: ['E', 'F♯', 'G♯', 'A', 'B', 'C♯', 'D♯'], F: ['F', 'G', 'A', 'B♭', 'C', 'D', 'E'],
    'B♭': ['B♭', 'C', 'D', 'E♭', 'F', 'G', 'A'], 'E♭': ['E♭', 'F', 'G', 'A♭', 'B♭', 'C', 'D'], 'A♭': ['A♭', 'B♭', 'C', 'D♭', 'E♭', 'F', 'G'],
  };
  const SIG = { C: 'ไม่มีชาร์ปและไม่มีแฟลต', G: '1 ชาร์ป (F♯)', D: '2 ชาร์ป (F♯ C♯)', A: '3 ชาร์ป (F♯ C♯ G♯)', E: '4 ชาร์ป (F♯ C♯ G♯ D♯)',
    F: '1 แฟลต (B♭)', 'B♭': '2 แฟลต (B♭ E♭)', 'E♭': '3 แฟลต (B♭ E♭ A♭)', 'A♭': '4 แฟลต (B♭ E♭ A♭ D♭)' };
  const SIGEN = { C: 'no sharps or flats', G: '1 sharp (F♯)', D: '2 sharps (F♯ C♯)', A: '3 sharps (F♯ C♯ G♯)', E: '4 sharps (F♯ C♯ G♯ D♯)',
    F: '1 flat (B♭)', 'B♭': '2 flats (B♭ E♭)', 'E♭': '3 flats (B♭ E♭ A♭)', 'A♭': '4 flats (B♭ E♭ A♭ D♭)' };
  const REL = { C: 'A', G: 'E', D: 'B', A: 'F♯', E: 'C♯', F: 'D', 'B♭': 'G', 'E♭': 'C', 'A♭': 'F' };       // major → relative minor
  const SEVENTH = { A: 'G♯', E: 'D♯', B: 'A♯', 'F♯': 'E♯', 'C♯': 'B♯', D: 'C♯', G: 'F♯', C: 'B♮', F: 'E♮' }; // harmonic minor → raised 7th
  const NAT7 = { A: 'G', E: 'D', B: 'A', 'F♯': 'E', 'C♯': 'B', D: 'C', G: 'F', C: 'B♭', F: 'E♭' };
  const vex = (k) => k.replace('♭', 'b').replace('♯', '#');
  const KEYS = Object.keys(MAJ);
  const sigImg = (maj, cap, capEn) => [{ cap, capEn, n: { clef: 'treble', key: vex(maj), notes: [], minW: 170 } }];

  /* 1) บันไดเสียงนี้มีเครื่องหมายประจำกุญแจเสียงอะไร */
  M.GEN.mScaleSig = () => {
    const minor = Math.random() < 0.45, maj = pick(KEYS), name = minor ? `${REL[maj]} minor` : `${maj} major`;
    const wrong = shuffle(KEYS.filter((k) => k !== maj)).slice(0, 3);
    return {
      tag: 'บันไดเสียงที่ใช้สอบ', q: `บันไดเสียง ${name} มีเครื่องหมายประจำกุญแจเสียงตามข้อใด`,
      c: [SIG[maj], ...wrong.map((k) => SIG[k])],
      ex: {
        qAlt: `What is the key signature of ${name}?`,
        th: minor ? `${name} เป็นไมเนอร์คู่ขนาน (relative minor) ของ ${maj} major จึงใช้เครื่องหมายประจำกุญแจเสียงเดียวกัน คือ ${SIG[maj]}\nวิธีหา: ขึ้นจากโทนิกของไมเนอร์ไป 3 ครึ่งเสียง จะได้เมเจอร์คู่ขนาน (${REL[maj]} → ${maj})`
          : `${name} มี ${SIG[maj]}\nลำดับชาร์ป: F C G D · ลำดับแฟลต: B E A D`,
        en: minor ? `${name} is the relative minor of ${maj} major, so it shares its key signature: ${SIGEN[maj]}.\nGo up 3 semitones from the minor tonic to find the relative major.` : `${name} has ${SIGEN[maj]}.\nOrder of sharps: F C G D · order of flats: B E A D.`,
        why: wrong.map((k) => `${SIG[k]} เป็นของ ${k} major และ ${REL[k]} minor`), whyEn: wrong.map((k) => `${SIGEN[k]} belongs to ${k} major and ${REL[k]} minor`),
        tip: 'ชาร์ป: ขึ้นคู่ 5 ทีละคีย์ C G D A E · แฟลต: ลงคู่ 5 ทีละคีย์ C F B♭ E♭ A♭', tipEn: 'Sharps: up a 5th each time C G D A E · flats: down a 5th C F B♭ E♭ A♭',
        img: sigImg(maj, `เครื่องหมายประจำกุญแจเสียงของ ${name}`, `Key signature of ${name}`),
      },
    };
  };

  /* 2) ฮาร์โมนิกไมเนอร์: ขั้นที่ 7 ที่ต้องยก */
  M.GEN.mRaised7 = () => {
    const maj = pick(KEYS), mn = REL[maj], right = SEVENTH[mn];
    const pool = shuffle(Object.values(SEVENTH).filter((x) => x !== right && x[0] !== right[0]));
    const wrong = [NAT7[mn] === right.replace(/[♯♮]/, '') ? NAT7[mn] : NAT7[mn], ...pool].filter((x, i, a) => x !== right && a.indexOf(x) === i).slice(0, 3);
    return {
      tag: 'บันไดเสียงที่ใช้สอบ', q: `ในบันไดเสียง ${mn} harmonic minor โน้ตขั้นที่ 7 ที่ถูกยกขึ้นคือโน้ตใด`,
      c: [right, ...wrong],
      ex: {
        qAlt: `In ${mn} harmonic minor, which note is the raised 7th degree?`,
        th: `${mn} minor ใช้เครื่องหมายประจำกุญแจเสียงของ ${maj} major (${SIG[maj]}) ขั้นที่ 7 ตามกุญแจเสียงคือ ${NAT7[mn]}\nฮาร์โมนิกไมเนอร์ยกขั้นที่ 7 ขึ้นครึ่งเสียง จึงเป็น ${right}${right.endsWith('♮') ? ' (ใช้เครื่องหมายเนเชอรัล เพราะในกุญแจเสียงเป็นแฟลตอยู่)' : ''}\nต้องเล่นโน้ตนี้ทั้งขาขึ้นและขาลง`,
        en: `${mn} minor uses the key signature of ${maj} major (${SIGEN[maj]}), where the 7th degree is ${NAT7[mn]}.\nThe harmonic minor raises it a semitone to ${right}, both ascending and descending.`,
        why: wrong.map((w) => (w === NAT7[mn] ? `${w} คือขั้นที่ 7 ที่ยังไม่ได้ยก (เนเชอรัลไมเนอร์)` : `${w} ไม่ใช่ขั้นที่ 7 ของ ${mn} minor`)),
        whyEn: wrong.map((w) => (w === NAT7[mn] ? `${w} is the unraised 7th (natural minor)` : `${w} is not the 7th degree of ${mn} minor`)),
        tip: 'ขั้นที่ 7 ของฮาร์โมนิกไมเนอร์อยู่ต่ำกว่าโทนิกครึ่งเสียงเสมอ', tipEn: 'The 7th of a harmonic minor is always a semitone below the tonic',
        img: sigImg(maj, `กุญแจเสียงของ ${mn} minor แล้วเติม ${right} เอง`, `Key signature of ${mn} minor; add ${right} yourself`),
      },
    };
  };

  /* 3) โน้ตขั้นที่ n ของบันไดเสียงเมเจอร์ */
  M.GEN.mScaleDegree = () => {
    const maj = pick(KEYS), d = pick([2, 3, 4, 5, 6, 7]), sc = MAJ[maj], right = sc[d - 1];
    const NAME = { 2: 'Supertonic', 3: 'Mediant', 4: 'Subdominant', 5: 'Dominant', 6: 'Submediant', 7: 'Leading note' };
    const near = [sc[d - 2], sc[d % 7], right.includes('♯') || right.includes('♭') ? right[0] : right + (SIG[maj].includes('แฟลต') ? '♭' : '♯')];
    const wrong = [...new Set(near)].filter((x) => x !== right).slice(0, 3);
    return {
      tag: 'บันไดเสียงที่ใช้สอบ', q: `โน้ตขั้นที่ ${d} (${NAME[d]}) ของบันไดเสียง ${maj} major คือโน้ตใด`,
      c: [right, ...wrong],
      ex: {
        qAlt: `Which note is degree ${d} (${NAME[d].toLowerCase()}) of ${maj} major?`,
        th: `ไล่บันไดเสียง ${maj} major: ${sc.join(' – ')}\nขั้นที่ ${d} คือ ${right}\nอย่าลืมเครื่องหมายประจำกุญแจเสียง: ${SIG[maj]}`,
        en: `${maj} major: ${sc.join(' – ')}.\nDegree ${d} is ${right}. Remember the key signature: ${SIGEN[maj]}.`,
        why: wrong.map((w) => (sc.includes(w) ? `${w} คือขั้นที่ ${sc.indexOf(w) + 1}` : `${w} ไม่อยู่ในบันไดเสียง ${maj} major (ลืมเครื่องหมายประจำกุญแจเสียง)`)),
        whyEn: wrong.map((w) => (sc.includes(w) ? `${w} is degree ${sc.indexOf(w) + 1}` : `${w} is not in ${maj} major (check the key signature)`)),
        tip: 'ไล่ชื่อโน้ตให้ครบ 7 ตัวก่อน แล้วค่อยเติมชาร์ปหรือแฟลตตามกุญแจเสียง', tipEn: 'Write all seven letter names first, then add the sharps or flats',
        img: sigImg(maj, `กุญแจเสียงของ ${maj} major`, `Key signature of ${maj} major`),
      },
    };
  };
})();
