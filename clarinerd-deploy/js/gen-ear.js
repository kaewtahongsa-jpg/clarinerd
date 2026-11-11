/* =========================================================
   gen-ear.js — โจทย์ฟังเสียงระดับเริ่มต้น (คอร์สโสตทักษะ)
   ทุกโจทย์มีเฉลยละเอียดสองภาษา (q.ex) · เสียงสร้างด้วย Web Audio (Music.play)
   ========================================================= */
(() => {
  const M = Music;
  const { pick, shuffle, rand } = M;
  const SH = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const nm = (m) => SH[m % 12] + (Math.floor(m / 12) - 1);
  const W = (k) => ({ keys: [k], dur: 'w' });
  const Qn = (k) => ({ keys: [k], dur: 'q' });
  const tone = (m, d) => ({ notes: [m], dur: d || 0.7 });
  const clefFor = (ms) => (Math.min(...ms) < 57 ? 'bass' : 'treble');

  /* ---------- 1) เสียงที่สองสูงขึ้น ต่ำลง หรือเท่าเดิม ---------- */
  M.GEN.eHighLow = () => {
    const a = 57 + rand(12);
    const kind = pick(['up', 'down', 'same', 'up', 'down']);
    const gap = pick([1, 2, 2, 3, 4, 5, 7]);
    const b = kind === 'up' ? a + gap : kind === 'down' ? a - gap : a;
    const L = { up: 'สูงขึ้น', down: 'ต่ำลง', same: 'เท่าเดิม' }, LE = { up: 'higher', down: 'lower', same: 'the same' };
    const others = Object.keys(L).filter((x) => x !== kind);
    return {
      tag: 'สูง–ต่ำของเสียง',
      q: 'ฟังเสียง 2 เสียง — เสียงที่สองสูงขึ้น ต่ำลง หรือเท่าเดิม',
      c: [L[kind], ...others.map((x) => L[x])],
      audio: [tone(a, 0.9), { rest: true, dur: 0.25 }, tone(b, 0.9)],
      ex: {
        qAlt: 'Listen to two notes — is the second one higher, lower or the same?',
        th: `เสียงที่สอง${L[kind]}${kind === 'same' ? '' : ` (ห่างกัน ${gap} ครึ่งเสียง)`}\n\nวิธีฟัง: ร้อง "อา" ตามเสียงแรกค้างไว้ในใจ แล้วเทียบกับเสียงที่สอง — ถ้าต้อง "เอื้อมขึ้น" คือสูงขึ้น ถ้าต้อง "ลดลง" คือต่ำลง${gap <= 2 && kind !== 'same' ? '\nข้อนี้ห่างกันน้อย ฟังยากกว่าปกติ ลองกดฟังซ้ำแล้วร้องตาม' : ''}`,
        en: `The second note is ${LE[kind]}${kind === 'same' ? '' : ` (${gap} semitone${gap > 1 ? 's' : ''} apart)`}.\n\nHow to hear it: hum the first note, then compare — if you have to reach up, it is higher; down, lower.`,
        why: others.map((x) => `ถ้า${L[x]} จะรู้สึก${x === 'up' ? 'ต้องเอื้อมขึ้น' : x === 'down' ? 'ต้องลดเสียงลง' : 'เสียงไม่ขยับเลย'}`),
        whyEn: others.map((x) => (x === 'up' ? 'Higher would feel like reaching up' : x === 'down' ? 'Lower would feel like dropping down' : 'The same would not move at all')),
        tip: 'ร้องตามเสียงแรกก่อนเสมอ', tipEn: 'Always sing the first note back',
        img: [{ cap: `บนบรรทัด: ${nm(a)} → ${nm(b)}`, capEn: `On the stave: ${nm(a)} → ${nm(b)}`, n: { clef: clefFor([a, b]), notes: [W(nm(a)), W(nm(b))] } }],
      },
    };
  };

  /* ---------- 2) นับจำนวนเสียง ---------- */
  M.GEN.eCount = () => {
    const n = pick([2, 3, 4, 5]);
    const start = 60 + rand(5), steps = [0, 2, 4, 5, 7, 9, 11, 12];
    const ms = Array.from({ length: n }, () => start + pick(steps));
    // ให้เสียงติดกันไม่ซ้ำ จะได้นับง่าย
    for (let i = 1; i < ms.length; i++) if (ms[i] === ms[i - 1]) ms[i] += 2;
    const others = [2, 3, 4, 5].filter((x) => x !== n);
    return {
      tag: 'สูง–ต่ำของเสียง',
      q: 'ฟังแล้วนับว่ามีกี่เสียง',
      c: [`${n} เสียง`, ...others.map((x) => `${x} เสียง`)],
      audio: ms.map((m) => tone(m, 0.55)),
      ex: {
        qAlt: 'Listen and count how many notes you hear.',
        th: `มีทั้งหมด ${n} เสียง\n\nวิธีฟัง: แตะนิ้วทีละนิ้วทุกครั้งที่ได้ยินเสียงใหม่ แล้วนับนิ้วตอนจบ`,
        en: `There are ${n} notes.\n\nHow to hear it: tap one finger for each new note, then count your fingers.`,
        why: others.map((x) => `${x} เสียง ${x > n ? 'มากกว่า' : 'น้อยกว่า'}ที่ได้ยิน`), whyEn: others.map((x) => `${x} is ${x > n ? 'more' : 'fewer'} than you heard`),
        tip: 'แตะนิ้วตามทุกเสียง', tipEn: 'Tap a finger for each note',
        img: [{ cap: 'เสียงที่ได้ยินบนบรรทัด', capEn: 'The notes on the stave', n: { clef: 'treble', notes: ms.map((m) => Qn(nm(m))) } }],
      },
    };
  };

  /* ---------- 3) ทิศทางทำนอง ---------- */
  const SHAPES = {
    up: ['ขึ้นตลอด', 'goes up all the way', [0, 2, 4, 7]],
    down: ['ลงตลอด', 'goes down all the way', [7, 4, 2, 0]],
    arch: ['ขึ้นแล้วลง', 'goes up, then down', [0, 4, 7, 2]],
    valley: ['ลงแล้วขึ้น', 'goes down, then up', [7, 2, 0, 5]],
  };
  M.GEN.eContour = () => {
    const key = pick(Object.keys(SHAPES)), base = 60 + rand(5);
    const S = SHAPES[key], ms = S[2].map((x) => base + x);
    const others = Object.keys(SHAPES).filter((x) => x !== key);
    return {
      tag: 'ทิศทางทำนอง',
      q: 'ฟังทำนอง 4 เสียง แล้วบอกทิศทางของทำนอง',
      c: [S[0], ...others.map((x) => SHAPES[x][0])],
      audio: ms.map((m) => tone(m, 0.55)),
      ex: {
        qAlt: 'Listen to the four-note melody. What is its shape?',
        th: `ทำนองนี้${S[0]}\n\nวิธีฟัง: ลากมือในอากาศตามเสียง — เสียงสูงขึ้นยกมือขึ้น เสียงต่ำลงลดมือลง แล้วดูรูปร่างที่มือวาด`,
        en: `This melody ${S[1]}.\n\nHow to hear it: trace the sound with your hand in the air — up for higher, down for lower — and look at the shape you draw.`,
        why: others.map((x) => `${SHAPES[x][0]}: เสียง${x === 'up' ? 'สูงขึ้นทุกตัว' : x === 'down' ? 'ต่ำลงทุกตัว' : x === 'arch' ? 'ขึ้นไปจุดสูงสุดตรงกลางแล้วลง' : 'ลงไปจุดต่ำสุดตรงกลางแล้วขึ้น'}`),
        whyEn: others.map((x) => `${SHAPES[x][1]}`),
        tip: 'ใช้มือวาดเส้นตามเสียง', tipEn: 'Draw the line with your hand',
        img: [{ cap: `รูปร่างทำนอง: ${S[0]}`, capEn: `Melody shape: ${S[1]}`, n: { clef: 'treble', notes: ms.map((m) => Qn(nm(m))) } }],
      },
    };
  };

  /* ---------- 4) ทีละขั้น หรือ กระโดด ---------- */
  M.GEN.eStepLeap = () => {
    const a = 60 + rand(7), step = Math.random() < 0.5;
    const gap = step ? pick([1, 2]) : pick([4, 5, 7, 8, 9, 12]);
    const dir = pick([1, -1]), b = a + dir * gap;
    return {
      tag: 'ทิศทางทำนอง',
      q: 'ฟังเสียง 2 เสียง — เคลื่อนที่ทีละขั้น (ใกล้กัน) หรือกระโดด (ห่างกัน)',
      c: step ? ['ทีละขั้น (step)', 'กระโดด (leap)'] : ['กระโดด (leap)', 'ทีละขั้น (step)'],
      audio: [tone(a, 0.8), tone(b, 0.8), { rest: true, dur: 0.3 }, tone(a, 0.5), tone(b, 0.9)],
      ex: {
        qAlt: 'Listen to two notes — do they move by step (close) or by leap (far)?',
        th: `${step ? 'ทีละขั้น' : 'กระโดด'}: ห่างกัน ${gap} ครึ่งเสียง ${dir > 0 ? 'ขึ้น' : 'ลง'}\n\nทีละขั้น (step) = เสียงติดกันเหมือนเดินขึ้นบันได 1 ขั้น เช่น โด–เร\nกระโดด (leap) = ข้ามขั้น เช่น โด–ซอล\nวิธีฟัง: ถ้าร้องต่อจากเสียงแรกได้ง่าย ๆ แทบไม่ต้องขยับเสียง = ทีละขั้น ถ้าต้องกระโดดเสียง = กระโดด`,
        en: `${step ? 'Step' : 'Leap'}: ${gap} semitone${gap > 1 ? 's' : ''} ${dir > 0 ? 'up' : 'down'}.\n\nA step moves to the next note (like do–re); a leap skips notes (like do–sol).`,
        why: [step ? 'กระโดดต้องห่างกันอย่างน้อยคู่ 3 แต่ข้อนี้ติดกัน' : 'ทีละขั้นต้องเป็นเสียงติดกัน แต่ข้อนี้ข้ามไปหลายขั้น'],
        whyEn: [step ? 'A leap is at least a 3rd; these notes are neighbours' : 'A step moves to the next note; this skips several'],
        tip: 'step = เดินบันได · leap = กระโดดข้าม', tipEn: 'Step = walk · leap = jump',
        img: [{ cap: `${nm(a)} → ${nm(b)}`, capEn: `${nm(a)} → ${nm(b)}`, n: { clef: clefFor([a, b]), notes: [W(nm(a)), W(nm(b))] } }],
      },
    };
  };

  /* ---------- 5) คอร์ดเมเจอร์หรือไมเนอร์ ---------- */
  M.GEN.eMajorMinor = () => {
    const root = 55 + rand(10), major = Math.random() < 0.5;
    const ns = [root, root + (major ? 4 : 3), root + 7];
    return {
      tag: 'เมเจอร์–ไมเนอร์',
      q: 'ฟังคอร์ด — เป็นคอร์ดเมเจอร์ (สว่าง) หรือไมเนอร์ (มืด/เศร้า)',
      c: major ? ['เมเจอร์ (Major)', 'ไมเนอร์ (Minor)'] : ['ไมเนอร์ (Minor)', 'เมเจอร์ (Major)'],
      audio: [{ notes: ns, dur: 1.4 }, { rest: true, dur: 0.3 }, ...ns.map((m) => tone(m, 0.5)), { notes: ns, dur: 1.2 }],
      ex: {
        qAlt: 'Listen to the chord — is it major (bright) or minor (dark/sad)?',
        th: `คอร์ดนี้เป็น${major ? 'เมเจอร์' : 'ไมเนอร์'} — ${major ? 'ฟังสว่าง สดใส มั่นคง' : 'ฟังมืด เศร้า หม่น'}\n\nความต่างอยู่ที่ "เสียงกลาง" ของคอร์ด: เมเจอร์เสียงกลางสูงกว่าไมเนอร์ครึ่งเสียง\nวิธีฟัง: ฟังเสียงไล่ขึ้น โด–มี–ซอล (เมเจอร์) กับ ลา–โด–มี (ไมเนอร์) แล้วถามตัวเองว่ารู้สึก "ยิ้ม" หรือ "เศร้า"`,
        en: `This is ${major ? 'major — bright and stable' : 'minor — dark and sad'}.\n\nThe difference is the middle note: in a major chord it is a semitone higher than in a minor chord.`,
        why: [major ? 'ไมเนอร์จะฟังมืดและเศร้ากว่านี้' : 'เมเจอร์จะฟังสว่างและสดใสกว่านี้'],
        whyEn: [major ? 'Minor would sound darker and sadder' : 'Major would sound brighter'],
        tip: 'เมเจอร์ = ยิ้ม 🙂 · ไมเนอร์ = เศร้า 🙁', tipEn: 'Major = smile · minor = sad',
        img: [{ cap: `${major ? 'เมเจอร์' : 'ไมเนอร์'}: ${ns.map(nm).join(' – ')}`, capEn: `${major ? 'Major' : 'Minor'}: ${ns.map(nm).join(' – ')}`, n: { clef: clefFor(ns), notes: [{ keys: ns.map(nm), dur: 'w' }] } }],
      },
    };
  };

  /* ---------- 6) ขั้นคู่พื้นฐาน (เพลงช่วยจำ) ---------- */
  const BASIC = [
    [2, 'M2', 'เมเจอร์ 2', 'Happy Birthday (แฮป-ปี้)', 'Happy Birthday ("Hap-py")'],
    [4, 'M3', 'เมเจอร์ 3', 'When the Saints (โอ-เวน)', 'When the Saints ("Oh when")'],
    [5, 'P4', 'เพอร์เฟกต์ 4', 'Here Comes the Bride', 'Here Comes the Bride'],
    [7, 'P5', 'เพอร์เฟกต์ 5', 'Twinkle Twinkle (ทวิง-เคิล ทวิง-เคิล)', 'Twinkle Twinkle'],
    [12, 'P8', 'ออกเทฟ', 'Somewhere Over the Rainbow (ซัม-แวร์)', 'Somewhere Over the Rainbow'],
  ];
  M.GEN.eIntervalBasic = () => {
    const [s, code, th, songTh, songEn] = pick(BASIC);
    const a = 57 + rand(10);
    const others = shuffle(BASIC.filter((x) => x[0] !== s)).slice(0, 3);
    return {
      tag: 'ขั้นคู่',
      q: 'ฟังขั้นคู่ขาขึ้น (เล่นทีละเสียง แล้วพร้อมกัน) — เป็นขั้นคู่อะไร',
      c: [`${th} (${code})`, ...others.map((x) => `${x[2]} (${x[1]})`)],
      audio: [tone(a, 0.8), tone(a + s, 0.8), { rest: true, dur: 0.3 }, { notes: [a, a + s], dur: 1.3 }],
      ex: {
        qAlt: 'Listen to the rising interval (played one note at a time, then together). What is it?',
        th: `ขั้นคู่นี้คือ ${th} (${code}) ห่างกัน ${s} ครึ่งเสียง\n\nเพลงช่วยจำ: ${songTh} — ร้อง 2 เสียงแรกของเพลงแล้วเทียบกับที่ได้ยิน`,
        en: `This is a ${code} (${s} semitones).\n\nSong to remember it: ${songEn} — sing the first two notes and compare.`,
        why: others.map((x) => `${x[2]} (${x[1]}) = ${x[0]} ครึ่งเสียง เหมือนต้นเพลง ${x[3]}`),
        whyEn: others.map((x) => `${x[1]} = ${x[0]} semitones, like ${x[4]}`),
        tip: 'จำ 1 ขั้นคู่ = 1 เพลง', tipEn: 'One interval = one song',
        img: [{ cap: `${nm(a)} → ${nm(a + s)}`, capEn: `${nm(a)} → ${nm(a + s)}`, n: { clef: clefFor([a]), notes: [W(nm(a)), W(nm(a + s))] } }],
      },
    };
  };

  /* ---------- 7) ทำนองสองท่อนเหมือนหรือต่างกัน ---------- */
  M.GEN.eSameDiff = () => {
    const base = 60 + rand(5), steps = [0, 2, 4, 5, 7, 9];
    const m1 = Array.from({ length: 4 }, () => base + pick(steps));
    const same = Math.random() < 0.5, m2 = m1.slice();
    let changed = -1;
    if (!same) { changed = 1 + rand(3); m2[changed] += pick([-2, 2, 3, -3]); }
    return {
      tag: 'ทิศทางทำนอง',
      q: 'ฟังทำนองสองรอบ — สองรอบนี้เหมือนกันหรือต่างกัน',
      c: same ? ['เหมือนกัน', 'ต่างกัน'] : ['ต่างกัน', 'เหมือนกัน'],
      audio: [...m1.map((m) => tone(m, 0.45)), { rest: true, dur: 0.8 }, ...m2.map((m) => tone(m, 0.45))],
      ex: {
        qAlt: 'Listen to the melody twice — are the two the same or different?',
        th: same ? 'สองรอบเหมือนกันทุกเสียง' : `ต่างกันที่เสียงที่ ${changed + 1} (รอบแรก ${nm(m1[changed])} · รอบสอง ${nm(m2[changed])})`,
        en: same ? 'Both are identical.' : `They differ at note ${changed + 1} (${nm(m1[changed])} vs ${nm(m2[changed])}).`,
        why: [same ? 'ไม่มีเสียงไหนเปลี่ยน' : `เสียงที่ ${changed + 1} เปลี่ยนไป จึงไม่เหมือนกัน`],
        whyEn: [same ? 'No note changes' : `Note ${changed + 1} changes`],
        tip: 'ร้องตามรอบแรกในใจ แล้วจับผิดรอบสอง', tipEn: 'Sing the first in your head, then spot the change',
        img: [{ cap: 'รอบแรก | รอบสอง', capEn: 'First | second', n: { clef: 'treble', notes: [...m1.map((m) => Qn(nm(m))), { bar: true }, ...m2.map((m) => Qn(nm(m)))] } }],
      },
    };
  };
})();
