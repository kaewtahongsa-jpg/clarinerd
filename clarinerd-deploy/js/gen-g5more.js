/* =========================================================
   gen-g5more.js — โจทย์สุ่มเพิ่มเติมของ ABRSM Grade 5
   g5KeyTranspose: ย้ายกุญแจเสียงขึ้นหรือลง major 2nd · minor 3rd · perfect 5th (ตามหลักสูตร 2020)
   ========================================================= */
(() => {
  const M = Music;
  const { pick, shuffle } = M;
  const LET = 'CDEFGAB', PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const MAJ = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'F', 'B♭', 'E♭', 'A♭', 'D♭', 'G♭'];
  const MIN = ['A', 'E', 'B', 'F♯', 'C♯', 'G♯', 'D♯', 'D', 'G', 'C', 'F', 'B♭', 'E♭'];
  const IVL = [
    { en: 'a major 2nd', th: 'คู่ 2 เมเจอร์', l: 1, s: 2 },
    { en: 'a minor 3rd', th: 'คู่ 3 ไมเนอร์', l: 2, s: 3 },
    { en: 'a perfect 5th', th: 'คู่ 5 เพอร์เฟกต์', l: 4, s: 7 },
  ];
  const parse = (k) => ({ l: k[0], a: k.includes('♯') ? 1 : k.includes('♭') ? -1 : 0 });
  const nm = (l, a) => l + (a === 1 ? '♯' : a === -1 ? '♭' : a === 2 ? '𝄪' : a === -2 ? '𝄫' : '');
  /** ย้ายชื่อโน้ต: ขยับตัวอักษร l ตัว และ s ครึ่งเสียง (dir = +1 ขึ้น, -1 ลง) */
  function move(k, iv, dir) {
    const p = parse(k), li = LET.indexOf(p.l);
    const nl = LET[(li + dir * iv.l + 70) % 7];
    const target = (PC[p.l] + p.a + dir * iv.s + 120) % 12;
    let a = target - PC[nl]; if (a > 6) a -= 12; if (a < -6) a += 12;
    return { name: nm(nl, a), a };
  }
  const steps = (k, iv, dir) => {
    const li = LET.indexOf(k[0]), out = [];
    for (let i = 0; i <= iv.l; i++) out.push(LET[(li + dir * i + 70) % 7]);
    return out.join(' – ');
  };

  M.GEN.g5KeyTranspose = () => {
    for (let tries = 0; tries < 60; tries++) {
      const minor = Math.random() < 0.4, list = minor ? MIN : MAJ, mode = minor ? 'minor' : 'major';
      const k = pick(list), iv = pick(IVL), dir = Math.random() < 0.5 ? 1 : -1;
      const r = move(k, iv, dir);
      if (Math.abs(r.a) > 1 || !list.includes(r.name)) continue;
      const ans = `${r.name} ${mode}`;
      const pool = [];
      IVL.forEach((v) => [1, -1].forEach((d) => {
        if (v === iv && d === dir) return;
        const x = move(k, v, d);
        if (Math.abs(x.a) <= 1) pool.push({ c: `${x.name} ${mode}`, why: `${x.name} ${mode} ได้จากการย้าย${d === 1 ? 'ขึ้น' : 'ลง'} ${v.th}`, whyEn: `${x.name} ${mode} would be ${d === 1 ? 'up' : 'down'} ${v.en}` });
      }));
      // ตัวลวงอีกแบบ: ตัวอักษรถูกแต่เครื่องหมายผิด
      const alt = nm(r.name[0], r.a === 0 ? (Math.random() < 0.5 ? 1 : -1) : 0);
      pool.push({ c: `${alt} ${mode}`, why: `ตัวอักษร ${r.name[0]} ถูก แต่เครื่องหมายผิด ต้องนับครึ่งเสียงให้ครบ ${iv.s} ครึ่งเสียง`, whyEn: `Right letter, wrong accidental: count all ${iv.s} semitones` });
      const seen = new Set([ans]);
      const wrong = shuffle(pool).filter((w) => !seen.has(w.c) && seen.add(w.c)).slice(0, 3);
      if (wrong.length < 3) continue;
      const dirTh = dir === 1 ? 'ขึ้น' : 'ลง', dirEn = dir === 1 ? 'up' : 'down';
      return {
        tag: 'Transposition',
        q: `The key of ${k} ${mode} is transposed ${dirEn} ${iv.en}. What is the new key?`,
        c: [ans, ...wrong.map((w) => w.c)],
        ex: {
          qAlt: `กุญแจเสียง ${k} ${mode} เมื่อย้าย${dirTh} ${iv.th} จะได้กุญแจเสียงใด`,
          th: `ย้ายโทนิก ${k} ${dirTh} ${iv.th}\n1) นับตัวอักษร: ${steps(k, iv, dir)} ได้ตัว ${r.name[0]}\n2) นับครึ่งเสียงให้ครบ ${iv.s} ครึ่งเสียง ได้ ${r.name}\nชนิดของคีย์ไม่เปลี่ยน คีย์ ${mode} ย้ายแล้วยังเป็น ${mode} จึงได้ ${ans}`,
          en: `Move the tonic ${k} ${dirEn} ${iv.en}.\n1) Count letter names: ${steps(k, iv, dir)} → ${r.name[0]}\n2) Count ${iv.s} semitones → ${r.name}\nThe tonality stays the same, so the new key is ${ans}.`,
          why: wrong.map((w) => w.why), whyEn: wrong.map((w) => w.whyEn),
          tip: 'นับตัวอักษรก่อนเสมอ แล้วค่อยนับครึ่งเสียง · major ยังเป็น major และ minor ยังเป็น minor', tipEn: 'Letters first, then semitones · major stays major, minor stays minor',
        },
      };
    }
    return M.GEN.g5KeySig();
  };
})();
