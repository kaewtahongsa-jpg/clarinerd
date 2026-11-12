/* =========================================================
   glossary.js — คลังศัพท์ดนตรี (กดจากคำในเฉลยเพื่ออ่านต่อได้)
   id · cat หมวด · t ชื่อไทย · e ชื่ออังกฤษ · k คำที่ใช้จับในเฉลย (ไทย/อังกฤษ)
   th / en คำอธิบาย · n ภาพโน้ต (ไม่บังคับ) · rel ศัพท์ที่ควรอ่านต่อ
   เป็นความรู้พื้นฐานทั่วไป จึงอยู่ในไฟล์เว็บได้ (ไม่ใช่คลังข้อสอบ)
   ========================================================= */
(() => {
  const N = (k, dur, dots) => ({ keys: Array.isArray(k) ? k : [k], dur: dur || 'w', dots });
  const R = (dur) => ({ rest: true, dur });
  const BAR = { bar: true };
  const seq = (ks, dur) => ks.map((k) => N(k, dur || 'q'));
  const G = [];
  const add = (cat, id, t, e, k, th, en, rel, n) => G.push({ cat, id, t, e, k, th, en, rel: rel || [], n });

  /* ---------- 1. บรรทัดและระดับเสียง ---------- */
  let c = 'บรรทัดและระดับเสียง';
  add(c, 'staff', 'บรรทัด 5 เส้น', 'Staff / Stave', ['บรรทัด 5 เส้น', 'บรรทัดห้าเส้น', 'staff', 'stave'],
    'เส้นนอน 5 เส้น กับช่องระหว่างเส้น 4 ช่อง ใช้บอกว่าโน้ตสูงหรือต่ำ โน้ตยิ่งอยู่สูงบนบรรทัด เสียงยิ่งสูง\nนับเส้นและช่องจากล่างขึ้นบนเสมอ จะอ่านเป็นชื่อโน้ตอะไรต้องดูกุญแจที่ต้นบรรทัด',
    'Five horizontal lines with four spaces between them. The higher a note sits, the higher it sounds.\nLines and spaces are counted from the bottom up. Which letter each one stands for depends on the clef.',
    ['clef-treble', 'clef-bass', 'ledger'], { clef: 'treble', notes: seq(['E4', 'G4', 'B4', 'D5', 'F5']) });
  add(c, 'clef-treble', 'กุญแจซอล', 'Treble clef (G clef)', ['กุญแจซอล', 'treble clef', 'G clef'],
    'กุญแจที่ม้วนรอบเส้นที่ 2 แล้วกำหนดให้เส้นนั้นเป็นโน้ต G (ซอล) เหนือโดกลาง ใช้กับเครื่องเสียงสูง เช่น คลาริเน็ต ฟลูต ไวโอลิน และมือขวาของเปียโน\nโน้ตบนเส้นจากล่างขึ้นบนคือ E G B D F ส่วนในช่องคือ F A C E',
    'The clef that curls around line 2 and fixes it as the G above middle C. Used by high instruments such as clarinet, flute, violin and the pianist’s right hand.\nLines from the bottom: E G B D F. Spaces: F A C E.',
    ['staff', 'clef-bass', 'middle-c'], { clef: 'treble', notes: seq(['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5']) });
  add(c, 'clef-bass', 'กุญแจฟา', 'Bass clef (F clef)', ['กุญแจฟา', 'bass clef', 'F clef'],
    'กุญแจที่มีจุดสองจุดคร่อมเส้นที่ 4 แล้วกำหนดให้เส้นนั้นเป็นโน้ต F (ฟา) ใต้โดกลาง ใช้กับเครื่องเสียงต่ำ เช่น เชลโล บาสซูน ทรอมโบน และมือซ้ายของเปียโน\nโน้ตบนเส้นคือ G B D F A ส่วนในช่องคือ A C E G',
    'The clef whose two dots sit either side of line 4, fixing it as the F below middle C. Used by low instruments such as cello, bassoon, trombone and the pianist’s left hand.\nLines: G B D F A. Spaces: A C E G.',
    ['staff', 'clef-treble', 'middle-c'], { clef: 'bass', notes: seq(['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3']) });
  add(c, 'clef-c', 'กุญแจโด (อัลโต / เทเนอร์)', 'C clefs (alto / tenor)', ['กุญแจอัลโต', 'กุญแจเทเนอร์', 'กุญแจโด', 'alto clef', 'tenor clef', 'C clef'],
    'กุญแจที่จุดกึ่งกลางของมันชี้ว่าเส้นไหนเป็นโดกลาง\nกุญแจอัลโต: โดกลางอยู่เส้นที่ 3 (เส้นกลาง) ใช้กับวิโอลา\nกุญแจเทเนอร์: โดกลางอยู่เส้นที่ 4 ใช้กับเชลโล บาสซูน และทรอมโบนในช่วงเสียงสูง',
    'A clef whose centre points at middle C.\nAlto clef: middle C on line 3, used by the viola.\nTenor clef: middle C on line 4, used by cello, bassoon and trombone in their high register.',
    ['middle-c', 'clef-treble', 'clef-bass'], { clef: 'alto', notes: [N('C4')] });
  add(c, 'ledger', 'เส้นน้อย', 'Ledger line', ['เส้นน้อย', 'ledger line', 'leger line'],
    'เส้นสั้น ๆ ที่ขีดเพิ่มเหนือหรือใต้บรรทัด 5 เส้น สำหรับโน้ตที่สูงหรือต่ำเกินบรรทัด ตัวอย่างที่เจอบ่อยที่สุดคือโดกลางในกุญแจซอล ซึ่งอยู่บนเส้นน้อย 1 เส้นใต้บรรทัด',
    'A short extra line above or below the staff for notes that go beyond it. The commonest example is middle C in the treble clef, on one ledger line below the staff.',
    ['staff', 'middle-c'], { clef: 'treble', notes: seq(['C4', 'A5', 'C6']) });
  add(c, 'middle-c', 'โดกลาง', 'Middle C (C4)', ['โดกลาง', 'middle C'],
    'โน้ต C ที่อยู่กลางเปียโน เรียกอีกชื่อว่า C4 เป็นจุดเชื่อมของกุญแจซอลกับกุญแจฟา\nในกุญแจซอลอยู่บนเส้นน้อย 1 เส้นใต้บรรทัด ในกุญแจฟาอยู่บนเส้นน้อย 1 เส้นเหนือบรรทัด',
    'The C in the middle of the piano, also called C4. It joins the treble and bass clefs.\nIn the treble clef it is on one ledger line below the staff; in the bass clef, one ledger line above.',
    ['ledger', 'clef-treble', 'clef-bass', 'octave'], { clef: 'treble', notes: [N('C4')] });
  add(c, 'octave', 'คู่แปด', 'Octave', ['คู่แปด', 'คู่ 8', 'ออกเทฟ', 'octave'],
    'ระยะจากโน้ตตัวหนึ่งไปถึงโน้ตชื่อเดียวกันตัวถัดไป เช่น C ถึง C ที่สูงกว่า นับได้ 8 ชื่อโน้ต\nเสียงสองเสียงนี้ฟังกลมกลืนกันมาก เพราะตัวบนสั่นเร็วเป็น 2 เท่าของตัวล่างพอดี ตัวเลขหลังชื่อโน้ต เช่น C4, C5 บอกว่าอยู่ช่วงคู่แปดไหน',
    'The distance from a note to the next note with the same name, e.g. C up to the next C: eight letter names.\nThe two blend closely because the upper one vibrates exactly twice as fast. The number after a note name (C4, C5) tells you which octave it is in.',
    ['interval', 'middle-c'], { clef: 'treble', notes: seq(['C4', 'C5'], 'h') });

  /* ---------- 2. จังหวะ ---------- */
  c = 'ค่าโน้ตและจังหวะ';
  add(c, 'note-values', 'ค่าโน้ต', 'Note values', ['ค่าโน้ต', 'ตัวกลม', 'ตัวขาว', 'ตัวดำ', 'note value', 'whole note', 'half note', 'quarter note', 'semibreve', 'minim', 'crotchet'],
    'รูปร่างของโน้ตบอกความยาวเสียง แต่ละขั้นยาวเป็นครึ่งหนึ่งของขั้นก่อนหน้า\nตัวกลม = 4 จังหวะ · ตัวขาว = 2 · ตัวดำ = 1 · เขบ็ต 1 ชั้น = ½ · เขบ็ต 2 ชั้น = ¼ (นับเมื่อตัวดำเป็น 1 จังหวะ)\nชื่ออังกฤษมี 2 แบบ: อเมริกัน (whole, half, quarter, eighth) กับอังกฤษ (semibreve, minim, crotchet, quaver) ข้อสอบ ABRSM ใช้แบบอังกฤษ',
    'A note’s shape shows how long it lasts. Each value is half the one before.\nWhole note = 4 beats · half = 2 · quarter = 1 · eighth = ½ · sixteenth = ¼ (when a quarter note is one beat).\nThere are two sets of names: American (whole, half, quarter, eighth) and British (semibreve, minim, crotchet, quaver). ABRSM uses the British ones.',
    ['eighth', 'rest', 'dot', 'time-sig'], { clef: 'treble', time: '4/4', notes: [N('B4', 'w'), BAR, N('B4', 'h'), N('B4', 'h'), BAR, ...seq(['B4', 'B4', 'B4', 'B4'])] });
  add(c, 'eighth', 'เขบ็ต', 'Eighth & sixteenth notes', ['เขบ็ต 1 ชั้น', 'เขบ็ต 2 ชั้น', 'เขบ็ต', 'eighth note', 'sixteenth note', 'quaver', 'semiquaver'],
    'โน้ตที่มีหาง (หรือเส้นคานเมื่อเขียนติดกัน) เขบ็ต 1 ชั้นมีหาง 1 เส้น ยาวครึ่งหนึ่งของตัวดำ เขบ็ต 2 ชั้นมี 2 เส้น ยาวหนึ่งในสี่ของตัวดำ\nเวลาเขียนหลายตัวติดกัน จะรวบหางเป็นเส้นคานตามกลุ่มจังหวะ เพื่อให้เห็นจังหวะตกชัด',
    'Notes with a flag (or a beam when joined). An eighth note (quaver) has one flag and lasts half a quarter note; a sixteenth (semiquaver) has two and lasts a quarter of it.\nSeveral in a row are beamed together by beat so the pulse is easy to see.',
    ['note-values', 'compound-time', 'triplet'], { clef: 'treble', time: '2/4', notes: [...seq(['B4', 'B4'], '8'), ...seq(['B4', 'B4', 'B4', 'B4'], '16')], groups: ['1/4'] });
  add(c, 'rest', 'ตัวหยุด', 'Rest', ['ตัวหยุด', 'rest'],
    'สัญลักษณ์บอกให้เงียบตามความยาวที่กำหนด มีค่าเท่ากับโน้ตชนิดเดียวกันทุกอย่าง\nตัวหยุดตัวกลม "ห้อย" ใต้เส้นที่ 4 ส่วนตัวหยุดตัวขาว "นั่ง" บนเส้นที่ 3 ตัวหยุดตัวดำหน้าตาเหมือนสายฟ้า',
    'A sign for silence of a set length. Each rest equals the note of the same name.\nThe whole rest hangs below line 4; the half rest sits on line 3; the quarter rest looks like a zigzag.',
    ['note-values', 'bar'], { clef: 'treble', time: '4/4', notes: [R('w'), BAR, R('h'), R('q'), R('8'), R('8')] });
  add(c, 'dot', 'โน้ตประจุด', 'Dotted note', ['โน้ตประจุด', 'ประจุด', 'dotted'],
    'จุดหลังหัวโน้ตเพิ่มความยาวอีกครึ่งหนึ่งของตัวมันเอง\nตัวขาวประจุด = 2 + 1 = 3 จังหวะ · ตัวดำประจุด = 1 + ½ = 1½ จังหวะ\nถ้ามีจุด 2 จุด จุดที่สองเพิ่มอีกครึ่งหนึ่งของจุดแรก เช่น ตัวขาว 2 จุด = 2 + 1 + ½ = 3½ จังหวะ',
    'A dot after a note adds half of its own value.\nDotted half = 2 + 1 = 3 beats · dotted quarter = 1 + ½ = 1½ beats.\nA second dot adds half of the first dot: a double-dotted half note = 2 + 1 + ½ = 3½ beats.',
    ['note-values', 'tie', 'compound-time'], { clef: 'treble', time: '3/4', notes: [N('B4', 'h', 1), BAR, N('B4', 'q', 1), N('B4', '8'), N('B4', 'q')] });
  add(c, 'tie', 'เส้นโยงเสียง', 'Tie', ['เส้นโยงเสียง', 'เส้นโยง', 'tie', 'tied'],
    'เส้นโค้งที่เชื่อมโน้ต "ระดับเสียงเดียวกัน" สองตัว ให้เล่นตัวแรกแล้วลากเสียงยาวรวมค่าของตัวที่สอง โดยไม่เล่นซ้ำ\nใช้เมื่อเสียงยาวข้ามเส้นกั้นห้อง หรือเขียนเป็นโน้ตตัวเดียวไม่ได้\nอย่าสับสนกับเส้นสเลอร์ ซึ่งเชื่อมโน้ต "ต่างระดับเสียง"',
    'A curved line joining two notes of the same pitch: play the first and hold it for the value of both, without re-striking.\nUsed when a sound lasts across a barline or cannot be written as one note.\nDo not confuse it with a slur, which joins notes of different pitch.',
    ['slur', 'dot', 'bar'], { clef: 'treble', time: '4/4', notes: [N('A4', 'h'), N('A4', 'h'), BAR, N('A4', 'w')], ties: [[1, 3]] });
  add(c, 'time-sig', 'อัตราจังหวะ', 'Time signature', ['อัตราจังหวะ', 'เครื่องหมายกำหนดจังหวะ', 'time signature'],
    'ตัวเลข 2 ตัวที่ต้นเพลง\nตัวบนบอกว่าห้องหนึ่งมีกี่จังหวะ ตัวล่างบอกว่าโน้ตชนิดไหนนับเป็น 1 จังหวะ (2 = ตัวขาว, 4 = ตัวดำ, 8 = เขบ็ต 1 ชั้น)\nเช่น 3/4 = ห้องละ 3 จังหวะ ตัวดำเป็นตัวนับ',
    'The two numbers at the start of a piece.\nThe top number says how many beats are in each bar; the bottom says which note value counts as one (2 = half, 4 = quarter, 8 = eighth).\nFor example 3/4 = three quarter-note beats per bar.',
    ['simple-time', 'compound-time', 'bar', 'beat'], { clef: 'treble', time: '3/4', notes: [...seq(['G4', 'A4', 'B4']), BAR, N('C5', 'h', 1)] });
  add(c, 'simple-time', 'อัตราจังหวะธรรมดา', 'Simple time', ['อัตราจังหวะธรรมดา', 'simple time', 'simple duple', 'simple triple', 'simple quadruple'],
    'อัตราจังหวะที่จังหวะหลักแต่ละจังหวะ "แบ่งย่อยเป็น 2" ตัวเลขบนมักเป็น 2, 3, 4 เช่น 2/4, 3/4, 4/4\nเรียกตามจำนวนจังหวะในห้อง: duple = 2 จังหวะ · triple = 3 · quadruple = 4',
    'A metre in which each main beat divides into two. The top number is usually 2, 3 or 4, e.g. 2/4, 3/4, 4/4.\nNamed by beats per bar: duple = 2 · triple = 3 · quadruple = 4.',
    ['compound-time', 'time-sig'], { clef: 'treble', time: '2/4', notes: seq(['B4', 'B4', 'B4', 'B4'], '8'), groups: ['1/4'] });
  add(c, 'compound-time', 'อัตราจังหวะผสม', 'Compound time', ['อัตราจังหวะผสม', 'compound time', 'compound duple', 'compound triple', 'compound quadruple'],
    'อัตราจังหวะที่จังหวะหลักเป็น "โน้ตประจุด" และแบ่งย่อยเป็น 3 ตัวเลขบนเป็น 6, 9, 12\nหาจำนวนจังหวะหลักโดยเอาตัวเลขบนหาร 3: 6/8 = 2 จังหวะ · 9/8 = 3 · 12/8 = 4\n6/8 กับ 3/4 มีเขบ็ต 6 ตัวเท่ากัน แต่ 6/8 จัดกลุ่ม 3+3 ส่วน 3/4 จัด 2+2+2',
    'A metre whose main beat is a dotted note that divides into three. The top number is 6, 9 or 12.\nDivide the top number by 3 to find the beats: 6/8 = 2 · 9/8 = 3 · 12/8 = 4.\n6/8 and 3/4 both hold six quavers, but 6/8 groups them 3+3 and 3/4 groups them 2+2+2.',
    ['simple-time', 'dot', 'eighth'], { clef: 'treble', time: '6/8', notes: seq(['B4', 'B4', 'B4', 'B4', 'B4', 'B4'], '8'), groups: ['3/8'] });
  add(c, 'bar', 'ห้องเพลง', 'Bar / Measure', ['ห้องเพลง', 'เส้นกั้นห้อง', 'barline', 'bar line', 'measure'],
    'ช่วงของโน้ตที่ถูกแบ่งด้วยเส้นกั้นห้อง (เส้นตั้ง) ทุกห้องต้องมีค่าโน้ตรวมเท่ากับที่อัตราจังหวะกำหนด\nจังหวะแรกของห้องเป็นจังหวะหนักที่สุด เส้นคู่ปิดท้าย (บาง + หนา) บอกว่าจบเพลง',
    'The stretch of music between two barlines. Every bar must add up to what the time signature says.\nThe first beat of a bar is the strongest. A final double barline (thin + thick) marks the end.',
    ['time-sig', 'beat', 'upbeat']);
  add(c, 'beat', 'จังหวะเคาะ', 'Beat / Pulse', ['จังหวะเคาะ', 'จังหวะตก', 'pulse'],
    'ชีพจรสม่ำเสมอของเพลง คือสิ่งที่เราเคาะเท้าตาม ความเร็วของจังหวะเคาะเรียกว่าเทมโป\nในแต่ละห้อง จังหวะที่ 1 หนักที่สุด จังหวะอื่นเบากว่า',
    'The steady pulse of the music: what you tap your foot to. Its speed is the tempo.\nBeat 1 of each bar is the strongest; the others are weaker.',
    ['bar', 'tempo', 'syncopation']);
  add(c, 'triplet', 'โน้ตสามพยางค์', 'Triplet', ['โน้ตสามพยางค์', 'สามพยางค์', 'triplet'],
    'โน้ต 3 ตัวที่เล่นในเวลาของโน้ตชนิดเดียวกัน 2 ตัว เขียนเลข 3 กำกับไว้\nเช่น เขบ็ต 1 ชั้นสามพยางค์ 3 ตัว = เวลาของเขบ็ต 1 ชั้น 2 ตัว = ตัวดำ 1 ตัว\nกลับกัน ดูเพล็ต (duplet) คือโน้ต 2 ตัวในเวลาของ 3 ตัว พบในอัตราจังหวะผสม',
    'Three notes played in the time of two of the same kind, marked with a 3.\nA quaver triplet = two quavers = one crotchet.\nThe opposite, a duplet, is two notes in the time of three, found in compound time.',
    ['eighth', 'compound-time'], { clef: 'treble', time: '2/4', notes: [...seq(['B4', 'B4', 'B4'], '8'), N('B4', 'q')], tuplets: [{ start: 0, count: 3 }], groups: ['1/4'] });
  add(c, 'upbeat', 'ห้องเปิดไม่เต็ม', 'Anacrusis (upbeat)', ['อะนาครูซิส', 'โน้ตนำ', 'anacrusis', 'upbeat', 'pick-up'],
    'โน้ตที่ขึ้นก่อนจังหวะที่ 1 ของห้องเต็มห้องแรก ทำให้ห้องแรกไม่ครบจังหวะ\nห้องสุดท้ายของเพลงจะสั้นลงเท่ากับที่ขาดไป เพื่อให้สองห้องรวมกันครบ 1 ห้องพอดี',
    'Notes that come before the first full bar, leaving the opening bar incomplete.\nThe last bar is shortened by the same amount so the two together make one full bar.',
    ['bar', 'beat']);
  add(c, 'syncopation', 'จังหวะขัด', 'Syncopation', ['จังหวะขัด', 'ซิงโคเปชัน', 'syncopation'],
    'การเน้นเสียงที่จังหวะอ่อนหรือระหว่างจังหวะ แทนที่จะเน้นจังหวะหนักตามปกติ ทำให้เพลงรู้สึกสะดุดและมีแรงขับ พบมากในแจ๊สและดนตรีป๊อป',
    'Stressing a weak beat or the gap between beats instead of the normal strong beat. It gives the music a jolt and drive, common in jazz and pop.',
    ['beat', 'tie']);

  /* ---------- 3. เครื่องหมายแปลงเสียง ---------- */
  c = 'เครื่องหมายแปลงเสียง';
  add(c, 'accidental', 'เครื่องหมายแปลงเสียง', 'Accidental', ['เครื่องหมายแปลงเสียงจร', 'เครื่องหมายแปลงเสียง', 'accidental'],
    'เครื่องหมายหน้าโน้ตที่เปลี่ยนระดับเสียง ได้แก่ ชาร์ป (♯) แฟลต (♭) เนเชอรัล (♮) ดับเบิลชาร์ป (𝄪) และดับเบิลแฟลต (𝄫)\nเมื่อเขียนหน้าโน้ตกลางเพลง จะมีผลกับโน้ตตำแหน่งเดียวกันไปจนสุดห้องนั้น แล้วยกเลิกเองที่เส้นกั้นห้อง',
    'A sign in front of a note that changes its pitch: sharp (♯), flat (♭), natural (♮), double sharp (𝄪) and double flat (𝄫).\nWritten in the middle of a piece, it lasts for that pitch until the end of the bar, then cancels itself at the barline.',
    ['sharp', 'flat', 'natural', 'key-sig'], { clef: 'treble', notes: seq(['F#4', 'Bb4', 'F4'], 'h') });
  add(c, 'sharp', 'ชาร์ป (♯)', 'Sharp', ['ดับเบิลชาร์ป', 'ชาร์ป', 'double sharp', 'sharp'],
    'ทำให้โน้ตสูงขึ้นครึ่งเสียง บนเปียโนคือขยับไปคีย์ถัดไปทางขวา (ส่วนใหญ่เป็นปุ่มดำ)\nดับเบิลชาร์ป (𝄪) ทำให้สูงขึ้น 2 ครึ่งเสียง เช่น F𝄪 เสียงเดียวกับ G',
    'Raises a note by a semitone: the very next key to the right on the piano (usually a black key).\nA double sharp (𝄪) raises it by two semitones, so F𝄪 sounds the same as G.',
    ['flat', 'natural', 'semitone', 'enharmonic'], { clef: 'treble', notes: seq(['F4', 'F#4'], 'h') });
  add(c, 'flat', 'แฟลต (♭)', 'Flat', ['ดับเบิลแฟลต', 'แฟลต', 'double flat', 'flat'],
    'ทำให้โน้ตต่ำลงครึ่งเสียง บนเปียโนคือขยับไปคีย์ถัดไปทางซ้าย\nดับเบิลแฟลต (𝄫) ทำให้ต่ำลง 2 ครึ่งเสียง เช่น B𝄫 เสียงเดียวกับ A',
    'Lowers a note by a semitone: the very next key to the left on the piano.\nA double flat (𝄫) lowers it by two semitones, so B𝄫 sounds the same as A.',
    ['sharp', 'natural', 'semitone', 'enharmonic'], { clef: 'treble', notes: seq(['B4', 'Bb4'], 'h') });
  add(c, 'natural', 'เนเชอรัล (♮)', 'Natural', ['เนเชอรัล', 'natural sign'],
    'ยกเลิกชาร์ปหรือแฟลตที่มีอยู่ ให้โน้ตกลับเป็นเสียงปกติ (ปุ่มขาว) ไม่ว่าชาร์ปหรือแฟลตนั้นจะมาจากเครื่องหมายประจำกุญแจเสียง หรือมาจากเครื่องหมายแปลงเสียงก่อนหน้าในห้องเดียวกัน',
    'Cancels a sharp or flat and returns the note to its plain (white-key) pitch, whether that sharp or flat came from the key signature or from an earlier accidental in the bar.',
    ['sharp', 'flat', 'accidental'], { clef: 'treble', notes: seq(['F#4', 'Fn4'], 'h') });
  add(c, 'semitone', 'ครึ่งเสียง / หนึ่งเสียงเต็ม', 'Semitone / Tone', ['ครึ่งเสียง', 'หนึ่งเสียงเต็ม', 'เสียงเต็ม', 'semitone', 'half step', 'whole step', 'whole tone'],
    'ครึ่งเสียง (semitone) คือระยะที่ใกล้ที่สุดในดนตรีตะวันตก บนเปียโนคือคีย์ที่ติดกัน เช่น E–F, B–C, C–C♯\nหนึ่งเสียงเต็ม (tone) = 2 ครึ่งเสียง เช่น C–D\nบนปุ่มขาว มีแค่ E–F กับ B–C ที่ห่างกันครึ่งเสียง เพราะไม่มีปุ่มดำคั่น',
    'A semitone is the smallest step in Western music: neighbouring keys on the piano, such as E–F, B–C, C–C♯.\nA tone = two semitones, e.g. C–D.\nAmong the white keys only E–F and B–C are a semitone apart, because there is no black key between them.',
    ['major-scale', 'sharp', 'interval', 'chromatic']);
  add(c, 'enharmonic', 'เอ็นฮาร์โมนิก', 'Enharmonic equivalent', ['เอ็นฮาร์โมนิก', 'enharmonic'],
    'โน้ตสองตัวที่ "เสียงเดียวกันแต่เขียนต่างกัน" เช่น C♯ = D♭, E♯ = F, C♭ = B\nจะเขียนแบบไหนขึ้นกับกุญแจเสียงและหน้าที่ของโน้ตในเพลง เช่น ในบันไดเสียง F♯ เมเจอร์ ต้องเขียน E♯ ไม่ใช่ F เพราะแต่ละชื่อโน้ตต้องใช้ครบและไม่ซ้ำ',
    'Two notes that sound the same but are spelt differently, e.g. C♯ = D♭, E♯ = F, C♭ = B.\nThe spelling depends on the key and the note’s job: in F♯ major you must write E♯, not F, because every letter name is used once.',
    ['sharp', 'flat', 'key-sig'], { clef: 'treble', notes: seq(['C#5', 'Db5'], 'h') });

  /* ---------- 4. บันไดเสียงและกุญแจเสียง ---------- */
  c = 'บันไดเสียงและกุญแจเสียง';
  add(c, 'major-scale', 'บันไดเสียงเมเจอร์', 'Major scale', ['บันไดเสียงเมเจอร์', 'major scale'],
    'บันไดเสียง 7 เสียงที่มีระยะห่างตายตัว: เต็ม–เต็ม–ครึ่ง–เต็ม–เต็ม–เต็ม–ครึ่ง (ครึ่งเสียงอยู่ระหว่างขั้น 3–4 และ 7–8)\nเริ่มจากโน้ตไหนก็ได้ ขอแค่รักษาสูตรนี้ไว้ ซึ่งเป็นเหตุผลที่บางคีย์ต้องมีชาร์ปหรือแฟลต ฟังแล้วสว่าง สดใส',
    'A seven-note scale with a fixed pattern: tone–tone–semitone–tone–tone–tone–semitone (semitones between degrees 3–4 and 7–8).\nIt can start on any note as long as the pattern is kept, which is why some keys need sharps or flats. It sounds bright.',
    ['minor-scale', 'key-sig', 'semitone', 'degrees'], { clef: 'treble', notes: seq(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']) });
  add(c, 'minor-scale', 'บันไดเสียงไมเนอร์', 'Minor scales', ['บันไดเสียงไมเนอร์', 'ฮาร์โมนิกไมเนอร์', 'เมโลดิกไมเนอร์', 'เนเชอรัลไมเนอร์', 'minor scale', 'harmonic minor', 'melodic minor', 'natural minor'],
    'บันไดเสียงที่ฟังหม่นกว่าเมเจอร์ เพราะขั้นที่ 3 ต่ำลงครึ่งเสียง มี 3 แบบ\nNatural: ใช้โน้ตตามเครื่องหมายประจำกุญแจเสียง ไม่เปลี่ยนอะไร\nHarmonic: ยกขั้นที่ 7 ขึ้นครึ่งเสียง ทั้งขาขึ้นและขาลง\nMelodic: ขาขึ้นยกขั้นที่ 6 และ 7 ขาลงกลับเป็น natural',
    'Scales that sound darker than major because the 3rd degree is a semitone lower. There are three forms.\nNatural: only the notes of the key signature.\nHarmonic: the 7th degree is raised a semitone, up and down.\nMelodic: the 6th and 7th are raised going up, and restored (natural minor) coming down.',
    ['major-scale', 'relative', 'leading-note', 'key-sig'], { clef: 'treble', notes: seq(['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G#5', 'A5']) });
  add(c, 'key-sig', 'เครื่องหมายประจำกุญแจเสียง', 'Key signature', ['เครื่องหมายประจำกุญแจเสียง', 'กุญแจเสียง', 'key signature'],
    'ชาร์ปหรือแฟลตที่เขียนไว้ต้นบรรทัดถัดจากกุญแจ มีผลกับโน้ตชื่อนั้นทุกตัวตลอดเพลง ทุกช่วงคู่แปด\nลำดับชาร์ป: F C G D A E B · ลำดับแฟลตกลับกัน: B E A D G C F\nหาคีย์เมเจอร์: ถ้าเป็นชาร์ป ให้ขึ้นครึ่งเสียงจากชาร์ปตัวสุดท้าย ถ้าเป็นแฟลต ให้ดูแฟลตตัวรองสุดท้าย',
    'The sharps or flats written after the clef. They apply to every note of that name, in every octave, throughout.\nOrder of sharps: F C G D A E B · flats are the reverse: B E A D G C F.\nTo find the major key: with sharps, go a semitone above the last sharp; with flats, take the second-to-last flat.',
    ['circle-fifths', 'relative', 'accidental', 'major-scale'], { clef: 'treble', key: 'D', notes: seq(['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5']) });
  add(c, 'circle-fifths', 'วงจรคู่ห้า', 'Circle of fifths', ['วงจรคู่ห้า', 'วงจรคู่ 5', 'circle of fifths'],
    'แผนผังที่เรียงคีย์ห่างกันทีละคู่ 5 เพอร์เฟกต์ ขึ้นคู่ 5 หนึ่งครั้งได้ชาร์ปเพิ่ม 1 ตัว (C → G → D → A → E → B → F♯) ลงคู่ 5 หนึ่งครั้งได้แฟลตเพิ่ม 1 ตัว (C → F → B♭ → E♭ → A♭ → D♭ → G♭)\nคีย์ที่อยู่ติดกันในวงจรต่างกันแค่โน้ตเดียว จึงเป็นคีย์ใกล้ชิดกัน',
    'A chart of keys a perfect 5th apart. Each step up a 5th adds one sharp (C → G → D → A → E → B → F♯); each step down a 5th adds one flat (C → F → B♭ → E♭ → A♭ → D♭ → G♭).\nNeighbours on the circle differ by only one note, so they are closely related keys.',
    ['key-sig', 'relative', 'perfect']);
  add(c, 'relative', 'คีย์คู่ขนาน (Relative) และ Parallel', 'Relative & parallel keys', ['คู่ขนาน', 'relative minor', 'relative major', 'parallel minor', 'parallel major'],
    'Relative: คีย์เมเจอร์กับไมเนอร์ที่ใช้เครื่องหมายประจำกุญแจเสียงเดียวกัน ไมเนอร์อยู่ต่ำกว่าเมเจอร์ลงมาคู่ 3 ไมเนอร์ (3 ครึ่งเสียง) เช่น C เมเจอร์ ↔ A ไมเนอร์\nParallel: คีย์เมเจอร์กับไมเนอร์ที่เริ่มโน้ตเดียวกัน เช่น C เมเจอร์ ↔ C ไมเนอร์ (เครื่องหมายต่างกัน 3 ตัว)',
    'Relative: a major and a minor key sharing one key signature. The minor lies a minor 3rd (3 semitones) below the major, e.g. C major ↔ A minor.\nParallel: a major and a minor key on the same tonic, e.g. C major ↔ C minor (their signatures differ by three accidentals).',
    ['key-sig', 'minor-scale', 'circle-fifths']);
  add(c, 'degrees', 'ชื่อขั้นของบันไดเสียง', 'Scale degrees', ['โทนิก', 'โดมิแนนต์', 'ซับโดมิแนนต์', 'tonic', 'dominant', 'subdominant', 'supertonic', 'mediant', 'submediant'],
    'โน้ตแต่ละขั้นของบันไดเสียงมีชื่อเรียก\n1 Tonic (โน้ตหลักของคีย์) · 2 Supertonic · 3 Mediant · 4 Subdominant · 5 Dominant · 6 Submediant · 7 Leading note\nสามตัวที่สำคัญที่สุดคือ Tonic (I), Subdominant (IV) และ Dominant (V) เพราะคอร์ดบนสามขั้นนี้เป็นแกนของเสียงประสาน',
    'Each degree of a scale has a name.\n1 Tonic (the home note) · 2 Supertonic · 3 Mediant · 4 Subdominant · 5 Dominant · 6 Submediant · 7 Leading note.\nThe three most important are the tonic (I), subdominant (IV) and dominant (V): the chords on them are the backbone of harmony.',
    ['leading-note', 'major-scale', 'cadence', 'triad'], { clef: 'treble', notes: seq(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']) });
  add(c, 'leading-note', 'ลีดดิงโน้ต', 'Leading note', ['ลีดดิงโน้ต', 'leading note', 'leading tone'],
    'โน้ตขั้นที่ 7 ของบันไดเสียง อยู่ต่ำกว่าโทนิกครึ่งเสียง จึงมีแรงดึงให้ขยับขึ้นไปหาโทนิก\nในไมเนอร์ต้อง "ยกขั้นที่ 7" ขึ้นครึ่งเสียงเพื่อให้ได้ลีดดิงโน้ต นี่คือที่มาของฮาร์โมนิกไมเนอร์',
    'The 7th degree of the scale, a semitone below the tonic, so it pulls upward to it.\nIn minor keys the 7th must be raised a semitone to make a leading note: that is where the harmonic minor comes from.',
    ['degrees', 'minor-scale', 'dom7']);
  add(c, 'chromatic', 'บันไดเสียงโครมาติก เพนทาโทนิก และโหมด', 'Chromatic, pentatonic & modes', ['โครมาติก', 'เพนทาโทนิก', 'โฮลโทน', 'chromatic', 'pentatonic', 'whole-tone', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian'],
    'Chromatic: ไล่ทีละครึ่งเสียงครบ 12 เสียง\nPentatonic: มี 5 เสียง เช่น C D E G A พบมากในเพลงพื้นบ้านและดนตรีเอเชีย\nWhole-tone: ห่างกันทีละเสียงเต็มทั้งหมด มี 6 เสียง\nโหมด (Mode): บันไดเสียงที่ได้จากการเริ่มบันไดเสียงเมเจอร์ที่ขั้นต่าง ๆ เช่น Dorian (เริ่มขั้น 2), Mixolydian (ขั้น 5), Aeolian (ขั้น 6 = เนเชอรัลไมเนอร์)',
    'Chromatic: all 12 notes, moving by semitone.\nPentatonic: five notes, e.g. C D E G A, common in folk and Asian music.\nWhole-tone: six notes, all a tone apart.\nModes: scales made by starting a major scale on another degree, e.g. Dorian (on 2), Mixolydian (on 5), Aeolian (on 6 = natural minor).',
    ['semitone', 'major-scale', 'minor-scale']);

  /* ---------- 5. ขั้นคู่ ---------- */
  c = 'ขั้นคู่';
  add(c, 'interval', 'ขั้นคู่', 'Interval', ['ขั้นคู่เสียง', 'ขั้นคู่', 'interval'],
    'ระยะห่างระหว่างโน้ตสองตัว บอกด้วย 2 ส่วน คือ "ตัวเลข" กับ "ชนิด"\nตัวเลข: นับชื่อโน้ตโดยรวมตัวแรกและตัวสุดท้าย เช่น C ถึง E นับ C-D-E = คู่ 3\nชนิด: เพอร์เฟกต์ เมเจอร์ ไมเนอร์ ออกเมนเต็ด ดิมินิชด์ ดูจากจำนวนครึ่งเสียง\nวิธีที่เร็ว: เทียบกับบันไดเสียงเมเจอร์ของโน้ตตัวล่าง',
    'The distance between two notes, described by a number and a quality.\nNumber: count the letter names including both ends, e.g. C to E is C-D-E = a 3rd.\nQuality: perfect, major, minor, augmented or diminished, decided by the number of semitones.\nQuick method: compare with the major scale of the lower note.',
    ['perfect', 'maj-min', 'aug-dim', 'inv-interval'], { clef: 'treble', notes: [N(['C4', 'E4'], 'h'), N(['C4', 'G4'], 'h')] });
  add(c, 'perfect', 'ขั้นคู่เพอร์เฟกต์', 'Perfect intervals', ['เพอร์เฟกต์', 'perfect 4th', 'perfect 5th', 'perfect interval'],
    'คู่ 1, 4, 5 และ 8 เป็นได้แค่เพอร์เฟกต์ ออกเมนเต็ด หรือดิมินิชด์ (ไม่มีเมเจอร์หรือไมเนอร์)\nเพอร์เฟกต์ 4 = 5 ครึ่งเสียง · เพอร์เฟกต์ 5 = 7 ครึ่งเสียง · เพอร์เฟกต์ 8 = 12 ครึ่งเสียง\nจากโทนิกในบันไดเสียงเมเจอร์ขึ้นไปขั้นที่ 4, 5, 8 จะได้คู่เพอร์เฟกต์เสมอ',
    'The 1st, 4th, 5th and 8th can only be perfect, augmented or diminished (never major or minor).\nPerfect 4th = 5 semitones · perfect 5th = 7 · perfect octave = 12.\nFrom the tonic of a major scale up to degrees 4, 5 and 8 is always perfect.',
    ['interval', 'maj-min', 'aug-dim', 'circle-fifths'], { clef: 'treble', notes: [N(['C4', 'F4'], 'h'), N(['C4', 'G4'], 'h'), N(['C4', 'C5'], 'h')] });
  add(c, 'maj-min', 'ขั้นคู่เมเจอร์และไมเนอร์', 'Major & minor intervals', ['คู่ 3 เมเจอร์', 'คู่ 3 ไมเนอร์', 'major 3rd', 'minor 3rd', 'major 2nd', 'minor 2nd', 'major 6th', 'minor 6th', 'major 7th', 'minor 7th'],
    'คู่ 2, 3, 6 และ 7 เป็นเมเจอร์หรือไมเนอร์ได้ ไมเนอร์แคบกว่าเมเจอร์ครึ่งเสียง\nคู่ 2: ไมเนอร์ 1 ครึ่งเสียง · เมเจอร์ 2\nคู่ 3: ไมเนอร์ 3 · เมเจอร์ 4\nคู่ 6: ไมเนอร์ 8 · เมเจอร์ 9\nคู่ 7: ไมเนอร์ 10 · เมเจอร์ 11',
    'The 2nd, 3rd, 6th and 7th can be major or minor. Minor is a semitone smaller than major.\n2nds: minor 1 semitone · major 2\n3rds: minor 3 · major 4\n6ths: minor 8 · major 9\n7ths: minor 10 · major 11',
    ['interval', 'perfect', 'aug-dim', 'triad'], { clef: 'treble', notes: [N(['C4', 'E4'], 'h'), N(['C4', 'Eb4'], 'h')] });
  add(c, 'aug-dim', 'ออกเมนเต็ดและดิมินิชด์', 'Augmented & diminished', ['ออกเมนเต็ด', 'ดิมินิชด์', 'ไทรโทน', 'augmented', 'diminished', 'tritone'],
    'ออกเมนเต็ด: กว้างกว่าเพอร์เฟกต์หรือเมเจอร์ครึ่งเสียง\nดิมินิชด์: แคบกว่าเพอร์เฟกต์หรือไมเนอร์ครึ่งเสียง\nไทรโทน (Tritone) คือระยะ 6 ครึ่งเสียง (3 เสียงเต็ม) เขียนได้เป็นออกเมนเต็ด 4 (F–B) หรือดิมินิชด์ 5 (B–F)\nสำคัญ: ต้องนับตัวเลขจากชื่อโน้ตก่อนเสมอ E♭–C♯ นับ E ถึง C ได้คู่ 6 จึงเป็นออกเมนเต็ด 6 ไม่ใช่ไมเนอร์ 7',
    'Augmented: a semitone wider than perfect or major.\nDiminished: a semitone narrower than perfect or minor.\nA tritone is 6 semitones (three tones), written as an augmented 4th (F–B) or a diminished 5th (B–F).\nAlways count the number from the letter names first: E♭–C♯ counts E to C = a 6th, so it is an augmented 6th, not a minor 7th.',
    ['interval', 'perfect', 'maj-min', 'enharmonic'], { clef: 'treble', notes: [N(['F4', 'B4'], 'h'), N(['B4', 'F5'], 'h')] });
  add(c, 'inv-interval', 'การพลิกกลับขั้นคู่', 'Inversion of intervals', ['การพลิกกลับของขั้นคู่', 'การพลิกกลับขั้นคู่', 'inversion of an interval', 'inverted interval'],
    'ย้ายโน้ตตัวล่างขึ้นไป 1 คู่แปด (หรือย้ายตัวบนลงมา) จะได้ขั้นคู่ใหม่\nกฎ: ตัวเลขสองตัวรวมกันได้ 9 (3 ↔ 6, 4 ↔ 5, 2 ↔ 7) · เมเจอร์ ↔ ไมเนอร์ · ออกเมนเต็ด ↔ ดิมินิชด์ · เพอร์เฟกต์ยังเป็นเพอร์เฟกต์\nเช่น เมเจอร์ 3 พลิกกลับเป็นไมเนอร์ 6',
    'Move the lower note up an octave (or the upper one down) to get a new interval.\nRules: the two numbers add up to 9 (3 ↔ 6, 4 ↔ 5, 2 ↔ 7) · major ↔ minor · augmented ↔ diminished · perfect stays perfect.\nFor example a major 3rd inverts to a minor 6th.',
    ['interval', 'chord-inv'], { clef: 'treble', notes: [N(['C4', 'E4'], 'h'), N(['E4', 'C5'], 'h')] });

  /* ---------- 6. คอร์ดและเสียงประสาน ---------- */
  c = 'คอร์ดและเสียงประสาน';
  add(c, 'triad', 'ทรัยแอด', 'Triad', ['ทรัยแอด', 'ไทรแอด', 'triad'],
    'คอร์ด 3 เสียงที่ซ้อนกันเป็นคู่ 3 ได้แก่ โน้ตพื้นต้น (root) ตัวที่ 3 และตัวที่ 5 มี 4 ชนิด\nเมเจอร์: คู่ 3 เมเจอร์ + คู่ 3 ไมเนอร์ (C–E–G)\nไมเนอร์: คู่ 3 ไมเนอร์ + คู่ 3 เมเจอร์ (C–E♭–G)\nดิมินิชด์: ไมเนอร์ + ไมเนอร์ (B–D–F)\nออกเมนเต็ด: เมเจอร์ + เมเจอร์ (C–E–G♯)',
    'A three-note chord built in 3rds: root, 3rd and 5th. There are four kinds.\nMajor: major 3rd + minor 3rd (C–E–G)\nMinor: minor 3rd + major 3rd (C–E♭–G)\nDiminished: minor + minor (B–D–F)\nAugmented: major + major (C–E–G♯)',
    ['chord-inv', 'dom7', 'maj-min', 'degrees'], { clef: 'treble', notes: [N(['C4', 'E4', 'G4'], 'h'), N(['C4', 'Eb4', 'G4'], 'h')] });
  add(c, 'chord-inv', 'การพลิกกลับของคอร์ด', 'Chord inversions', ['การพลิกกลับ', 'พลิกกลับครั้งที่ 1', 'พลิกกลับครั้งที่ 2', 'first inversion', 'second inversion', 'root position', 'inversion'],
    'ดูว่าโน้ตตัวไหนของคอร์ดอยู่ที่เสียงเบส (ต่ำสุด)\nRoot position (a หรือ 5/3): root อยู่เบส\nFirst inversion (b หรือ 6/3): ตัวที่ 3 อยู่เบส\nSecond inversion (c หรือ 6/4): ตัวที่ 5 อยู่เบส\nเช่น C เมเจอร์ที่มี E อยู่เบส คือ Ib หรือ C/E',
    'Named by which chord note is in the bass.\nRoot position (a, or 5/3): the root is in the bass.\nFirst inversion (b, or 6/3): the 3rd is in the bass.\nSecond inversion (c, or 6/4): the 5th is in the bass.\nSo C major with E in the bass is Ib, or C/E.',
    ['triad', 'figured-bass', 'cadence'], { clef: 'treble', notes: [N(['C4', 'E4', 'G4'], 'h'), N(['E4', 'G4', 'C5'], 'h'), N(['G4', 'C5', 'E5'], 'h')] });
  add(c, 'dom7', 'คอร์ดโดมิแนนต์เซเวนท์ (V7)', 'Dominant seventh', ['โดมิแนนต์เซเวนท์', 'dominant seventh', 'dominant 7th', 'V7'],
    'คอร์ด 4 เสียงที่สร้างบนขั้นที่ 5 ของคีย์: เมเจอร์ทรัยแอด + คู่ 7 ไมเนอร์จาก root เช่น ในคีย์ C คือ G–B–D–F\nข้างในมีไทรโทน (B–F) ซึ่งอยากเกลาเข้าหาคอร์ด I: ลีดดิงโน้ต (B) ขึ้นหา C และตัวที่ 7 ของคอร์ด (F) ลงหา E',
    'A four-note chord on the 5th degree: a major triad plus a minor 7th above the root. In C major it is G–B–D–F.\nIt contains a tritone (B–F) that wants to resolve to chord I: the leading note (B) rises to C and the chord’s 7th (F) falls to E.',
    ['triad', 'cadence', 'leading-note', 'sec-dom'], { clef: 'treble', notes: [N(['G4', 'B4', 'D5', 'F5'], 'h'), N(['C5', 'E5', 'G5'], 'h')] });
  add(c, 'cadence', 'เคเดนซ์', 'Cadence', ['เคเดนซ์', 'การจบประโยค', 'perfect cadence', 'plagal cadence', 'imperfect cadence', 'interrupted cadence', 'half cadence', 'deceptive cadence', 'cadence'],
    'คอร์ด 2 คอร์ดท้ายประโยคเพลง ทำหน้าที่เหมือนเครื่องหมายวรรคตอน\nPerfect (V–I): จบสมบูรณ์ เหมือนจุดจบประโยค\nPlagal (IV–I): จบแบบ "อาเมน"\nImperfect / Half (จบที่ V): ยังไม่จบ เหมือนจุลภาค\nInterrupted / Deceptive (V–VI): หลอกว่าจะจบแต่ไปที่อื่น',
    'The two chords that end a phrase, working like punctuation.\nPerfect (V–I): a full stop.\nPlagal (IV–I): the “Amen” ending.\nImperfect / half (ends on V): unfinished, like a comma.\nInterrupted / deceptive (V–VI): you expect an ending but it goes elsewhere.',
    ['degrees', 'dom7', 'triad', 'chord-inv']);
  add(c, 'nct', 'โน้ตนอกคอร์ด', 'Non-chord tones', ['โน้ตนอกคอร์ด', 'โน้ตผ่าน', 'โน้ตเคียง', 'non-chord tone', 'passing note', 'passing tone', 'neighbour note', 'neighbor tone', 'auxiliary note', 'suspension', 'appoggiatura', 'pedal point'],
    'โน้ตในทำนองที่ไม่ได้อยู่ในคอร์ดขณะนั้น แบ่งตามวิธีเข้าและออก\nPassing note: เดินทีละขั้นผ่านระหว่างโน้ตในคอร์ดสองตัว\nNeighbour / Auxiliary: ขยับไป 1 ขั้นแล้วกลับที่เดิม\nSuspension: ค้างโน้ตจากคอร์ดก่อน แล้วเกลาลง 1 ขั้น (เตรียม – ค้าง – เกลา)\nAppoggiatura: กระโดดเข้าบนจังหวะหนัก แล้วเกลาทีละขั้น\nPedal: โน้ตเบสค้างยาวขณะคอร์ดข้างบนเปลี่ยน',
    'Melody notes that do not belong to the chord of the moment, classed by how they arrive and leave.\nPassing note: steps between two chord notes.\nNeighbour / auxiliary: steps away and back.\nSuspension: held over from the previous chord, then resolves down a step (preparation – suspension – resolution).\nAppoggiatura: leapt to on a strong beat, resolved by step.\nPedal: a held bass note while the chords change above.',
    ['triad', 'cadence']);
  add(c, 'sec-dom', 'คอร์ดโครมาติก (V/V, N6, Aug 6)', 'Chromatic chords', ['Secondary dominant', 'Neapolitan', 'Augmented sixth', 'V/V', 'N6'],
    'คอร์ดที่ยืมโน้ตนอกคีย์มาใช้เพื่อเพิ่มสีสัน\nSecondary dominant (V/x): คอร์ดโดมิแนนต์ของคอร์ดอื่นที่ไม่ใช่ I เช่น ในคีย์ C, V/V = D–F♯–A (โดมิแนนต์ของ G)\nNeapolitan sixth (N6): เมเจอร์ทรัยแอดบนขั้นที่ 2 ที่ลดลงครึ่งเสียง ใช้ในพลิกกลับครั้งที่ 1 เช่น ในคีย์ C ไมเนอร์ คือ D♭–F–A♭ โดยมี F อยู่เบส\nAugmented sixth: มีคู่ 6 ออกเมนเต็ดที่กางออกไปหาโดมิแนนต์ มี 3 แบบ คือ Italian, French, German',
    'Chords that borrow notes from outside the key for colour.\nSecondary dominant (V/x): the dominant of a chord other than I. In C, V/V = D–F♯–A (the dominant of G).\nNeapolitan sixth (N6): a major triad on the flattened 2nd degree, used in first inversion. In C minor: D♭–F–A♭ with F in the bass.\nAugmented sixth: contains an augmented 6th that opens outward to the dominant. Three kinds: Italian, French, German.',
    ['dom7', 'aug-dim', 'chord-inv', 'cadence']);
  add(c, 'figured-bass', 'ฟิกเกอร์เบส', 'Figured bass', ['ฟิกเกอร์เบส', 'figured bass'],
    'ตัวเลขใต้โน้ตเบสที่บอกว่าโน้ตข้างบนอยู่ห่างจากเบสเป็นคู่อะไร ใช้มากในยุคบาโรก\n5/3 (มักไม่เขียน) = root position · 6 หรือ 6/3 = พลิกกลับครั้งที่ 1 · 6/4 = พลิกกลับครั้งที่ 2\nสำหรับคอร์ด 7: 7, 6/5, 4/3, 4/2',
    'Numbers under a bass note giving the intervals of the notes above it. Widely used in the Baroque.\n5/3 (usually not written) = root position · 6 or 6/3 = first inversion · 6/4 = second inversion.\nFor seventh chords: 7, 6/5, 4/3, 4/2.',
    ['chord-inv', 'triad']);

  /* ---------- 7. การทดเสียงและคลาริเน็ต ---------- */
  c = 'การทดเสียงและคลาริเน็ต';
  add(c, 'transposition', 'การทดเสียง', 'Transposition', ['การทดเสียง', 'ทดเสียง', 'เครื่องทดเสียง', 'transposition', 'transposing instrument', 'transpose'],
    'การย้ายทำนองทั้งท่อนขึ้นหรือลงเป็นระยะเท่ากันทุกตัว\n"เครื่องทดเสียง" คือเครื่องที่โน้ตที่อ่านกับเสียงที่ออกจริงไม่ตรงกัน ชื่อเครื่องบอกเสียงที่ออกเมื่อเล่นโน้ต C เช่น คลาริเน็ต B♭ เล่น C ได้เสียง B♭\nหลักจำ: จะหาเสียงจริง ให้ย้ายตามทิศของชื่อเครื่อง จะเขียนโน้ตให้เครื่อง ให้ย้ายกลับทิศตรงข้าม และอย่าลืมย้ายเครื่องหมายประจำกุญแจเสียงด้วย',
    'Moving a whole melody up or down by the same interval.\nA transposing instrument is one whose written notes differ from what sounds. Its name tells you what you hear when it plays a written C: a B♭ clarinet playing C sounds B♭.\nRule: to find the sound, move in the direction of the instrument’s name; to write the part, move the opposite way. Remember to move the key signature too.',
    ['concert-pitch', 'bb-clarinet', 'key-sig', 'interval']);
  add(c, 'concert-pitch', 'เสียงจริง (Concert pitch)', 'Concert pitch', ['เสียงคอนเสิร์ต', 'เสียงจริง', 'concert pitch'],
    'ระดับเสียงที่ออกมาจริง ตรงกับเปียโน เครื่องที่ไม่ทดเสียง (ฟลูต โอโบ ไวโอลิน เปียโน) อ่านโน้ตตรงกับเสียงจริง\nเมื่อวาทยกรบอกว่า "concert B♭" หมายถึงเสียง B♭ จริง คลาริเน็ต B♭ ต้องเล่นโน้ต C',
    'The pitch that actually sounds, matching the piano. Non-transposing instruments (flute, oboe, violin, piano) read at concert pitch.\nWhen a conductor asks for “concert B♭”, a B♭ clarinet must play a written C.',
    ['transposition', 'bb-clarinet']);
  add(c, 'bb-clarinet', 'คลาริเน็ต B♭ / A / E♭', 'Clarinets in B♭, A and E♭', ['คลาริเน็ต B♭', 'คลาริเน็ตในบันไดเสียง B♭', 'คลาริเน็ต A', 'คลาริเน็ต E♭', 'clarinet in B♭', 'clarinet in A', 'B♭ clarinet'],
    'คลาริเน็ต B♭: เสียงจริงต่ำกว่าโน้ตที่อ่าน 1 เสียงเต็ม (คู่ 2 เมเจอร์) จะเขียนโน้ตให้ ต้องเขียนสูงกว่าเสียงจริง 1 เสียงเต็ม กุญแจเสียงเพิ่ม 2 ชาร์ป (หรือลด 2 แฟลต)\nคลาริเน็ต A: เสียงจริงต่ำกว่าคู่ 3 ไมเนอร์ เขียนสูงกว่าคู่ 3 ไมเนอร์ กุญแจเสียงเพิ่ม 3 แฟลต\nคลาริเน็ต E♭: เสียงจริงสูงกว่าคู่ 3 ไมเนอร์ เขียนต่ำกว่าคู่ 3 ไมเนอร์ กุญแจเสียงเพิ่ม 3 ชาร์ป',
    'Clarinet in B♭: sounds a tone (major 2nd) lower than written. Write the part a tone higher than concert pitch; the key signature gains 2 sharps (or loses 2 flats).\nClarinet in A: sounds a minor 3rd lower; write a minor 3rd higher; the key gains 3 flats.\nClarinet in E♭: sounds a minor 3rd higher; write a minor 3rd lower; the key gains 3 sharps.',
    ['transposition', 'concert-pitch', 'registers'], { clef: 'treble', notes: [N('C5', 'h'), N('Bb4', 'h')] });
  add(c, 'registers', 'ช่วงเสียงของคลาริเน็ต', 'Clarinet registers', ['ชาลูโม', 'คลาริออน', 'อัลติสซิโม', 'chalumeau', 'clarion', 'altissimo', 'throat tones', 'register key'],
    'คลาริเน็ตแบ่งช่วงเสียง (โน้ตที่อ่าน) เป็น\nChalumeau: E3 ถึงประมาณ F♯4 เสียงทุ้ม อุ่น\nThroat tones: G4 ถึง B♭4 ช่วงรอยต่อ เสียงบางกว่า\nClarion: B4 ถึง C6 เสียงใส สว่าง (เปิดคีย์รีจิสเตอร์)\nAltissimo: สูงกว่า C6 ขึ้นไป\nจุดข้ามจาก B♭4 ไป B4 เรียกว่า "the break" เป็นจุดที่ต้องฝึกนิ้วมากที่สุด',
    'The clarinet’s written range is divided into\nChalumeau: E3 to about F♯4, dark and warm.\nThroat tones: G4 to B♭4, the link notes, thinner in tone.\nClarion: B4 to C6, clear and bright (register key open).\nAltissimo: above C6.\nCrossing from B♭4 to B4 is “the break”, the spot that needs the most finger practice.',
    ['twelfth', 'bb-clarinet'], { clef: 'treble', notes: seq(['E3', 'Bb4', 'B4', 'C6'], 'h') });
  add(c, 'twelfth', 'คู่ 12 ของคลาริเน็ต', 'The clarinet’s twelfth', ['คู่ 12', 'คู่สิบสอง', 'twelfth', '12th'],
    'เมื่อกดคีย์รีจิสเตอร์ คลาริเน็ตจะกระโดดขึ้น "คู่ 12" (คู่แปด + คู่ 5) ไม่ใช่คู่แปดเหมือนฟลูตหรือแซกโซโฟน\nเพราะท่อทรงกระบอกปลายปิดข้างหนึ่งให้เฉพาะฮาร์โมนิกเลขคี่ นิ้วเดียวกันจึงได้โน้ตคนละชื่อ เช่น นิ้ว E3 + คีย์รีจิสเตอร์ = B4 และนิ้ว C4 = G5',
    'With the register key the clarinet jumps a twelfth (an octave plus a 5th), not an octave like the flute or saxophone.\nA cylindrical tube closed at one end gives only odd-numbered harmonics, so the same fingering gives a note of a different name: low E3 + register key = B4, and C4 becomes G5.',
    ['registers', 'octave', 'perfect'], { clef: 'treble', notes: [N('C4', 'h'), N('G5', 'h')] });

  /* ---------- 8. เครื่องหมายและศัพท์ ---------- */
  c = 'เครื่องหมายและศัพท์';
  add(c, 'dynamics', 'ความดัง–เบา', 'Dynamics', ['ความดังเบา', 'ความดัง–เบา', 'ความดัง-เบา', 'เครสเชนโด', 'dynamics', 'crescendo', 'diminuendo', 'decrescendo', 'sforzando'],
    'เครื่องหมายบอกความดัง เรียงจากเบาไปดัง: pp (pianissimo) · p (piano) · mp (mezzo piano) · mf (mezzo forte) · f (forte) · ff (fortissimo)\nCrescendo (cresc. หรือ <) = ค่อย ๆ ดังขึ้น · Diminuendo / Decrescendo (dim. หรือ >) = ค่อย ๆ เบาลง\nsfz (sforzando) = เน้นดังทันทีเฉพาะโน้ตนั้น',
    'Signs for loudness, from soft to loud: pp (pianissimo) · p (piano) · mp (mezzo piano) · mf (mezzo forte) · f (forte) · ff (fortissimo).\nCrescendo (cresc. or <) = gradually louder · diminuendo / decrescendo (dim. or >) = gradually softer.\nsfz (sforzando) = a sudden strong accent on one note.',
    ['articulation', 'tempo']);
  add(c, 'tempo', 'ความเร็ว (Tempo)', 'Tempo', ['เทมโป', 'ศัพท์ความเร็ว', 'tempo', 'Allegro', 'Adagio', 'Andante', 'Moderato', 'Presto', 'Largo', 'ritardando', 'accelerando'],
    'ความเร็วของจังหวะเคาะ เรียงจากช้าไปเร็ว: Largo / Lento (ช้ามาก) · Adagio (ช้า) · Andante (ความเร็วเดิน) · Moderato (ปานกลาง) · Allegro (เร็ว) · Vivace (เร็ว มีชีวิตชีวา) · Presto (เร็วมาก)\nrit. / rall. = ค่อย ๆ ช้าลง · accel. = ค่อย ๆ เร็วขึ้น · a tempo = กลับความเร็วเดิม\nตัวเลขเมโทรนอม เช่น ♩ = 120 หมายถึงตัวดำ 120 ครั้งต่อนาที',
    'The speed of the beat, from slow to fast: Largo / Lento (very slow) · Adagio (slow) · Andante (walking pace) · Moderato (moderate) · Allegro (fast) · Vivace (lively) · Presto (very fast).\nrit. / rall. = gradually slower · accel. = gradually faster · a tempo = back to the original speed.\nA metronome mark such as ♩ = 120 means 120 crotchet beats per minute.',
    ['beat', 'dynamics']);
  add(c, 'articulation', 'การบังคับเสียง', 'Articulation', ['สตัคคาโต', 'เลกาโต', 'articulation', 'staccato', 'legato', 'tenuto', 'accent'],
    'วิธีเล่นโน้ตแต่ละตัว\nStaccato (จุดเหนือหรือใต้หัวโน้ต): สั้น ขาดจากกัน\nLegato: ต่อเนื่อง ลื่นไหล มักเขียนด้วยเส้นสเลอร์\nTenuto (ขีด –): เล่นเต็มค่าโน้ต เน้นเล็กน้อย\nAccent (>): เน้นหนัก\nบนคลาริเน็ต การบังคับเสียงทำด้วยลิ้นแตะลิ้นปี่ ไม่ใช่การหยุดลม',
    'How each note is played.\nStaccato (a dot above or below the notehead): short and detached.\nLegato: smooth and joined, usually shown by a slur.\nTenuto (a line –): held for its full value, slightly stressed.\nAccent (>): strongly stressed.\nOn the clarinet, articulation is made by the tongue touching the reed, not by stopping the air.',
    ['slur', 'dynamics']);
  add(c, 'slur', 'เส้นสเลอร์', 'Slur', ['เส้นสเลอร์', 'สเลอร์', 'เส้นโค้งเชื่อมเสียง', 'slur'],
    'เส้นโค้งที่คร่อมโน้ต "ต่างระดับเสียง" ตั้งแต่ 2 ตัวขึ้นไป ให้เล่นต่อเนื่องกันแบบเลกาโต\nบนเครื่องเป่า ใช้ลิ้นเฉพาะโน้ตตัวแรกใต้เส้น ตัวที่เหลือเปลี่ยนนิ้วโดยไม่ตัดลม\nต่างจากเส้นโยงเสียง (tie) ที่เชื่อมโน้ตระดับเสียงเดียวกัน',
    'A curved line over two or more notes of different pitch, played smoothly (legato).\nOn wind instruments, tongue only the first note under the slur and change fingers on the same breath.\nUnlike a tie, which joins notes of the same pitch.',
    ['tie', 'articulation'], { clef: 'treble', time: '4/4', notes: seq(['C5', 'D5', 'E5', 'F5']) });
  add(c, 'texture', 'รูปพรรณ (Texture)', 'Texture', ['รูปพรรณ', 'monophonic', 'homophonic', 'polyphonic', 'heterophonic', 'monophony', 'homophony', 'polyphony', 'heterophony', 'texture'],
    'ลักษณะการซ้อนกันของแนวเสียง\nMonophony: ทำนองเดียว ไม่มีประสาน\nHomophony: ทำนองหลัก 1 แนว มีคอร์ดประกอบ\nPolyphony: หลายทำนองอิสระซ้อนกัน เช่น ฟิวก์ หรือเพลง Round\nHeterophony: ทุกเครื่องเล่นทำนองเดียวกันแต่แปรทางต่างกัน พบในดนตรีไทย',
    'How the musical lines are layered.\nMonophony: a single melody with no harmony.\nHomophony: one main melody with chords.\nPolyphony: several independent melodies together, as in a fugue or a round.\nHeterophony: everyone plays the same melody in their own varied way, as in Thai music.',
    ['triad']);
  add(c, 'form', 'สังคีตลักษณ์ (Form)', 'Musical form', ['สังคีตลักษณ์', 'sonata form', 'ternary form', 'binary form', 'rondo', 'theme and variations', 'strophic'],
    'โครงสร้างของบทเพลง ใช้ตัวอักษรแทนแต่ละท่อน\nBinary: A B\nTernary: A B A\nRondo: A B A C A (ท่อน A กลับมาเรื่อย ๆ)\nTheme and variations: ทำนองหลักแล้วแปรไปหลายแบบ\nSonata form: Exposition (เสนอ 2 ทำนอง) – Development (พัฒนา) – Recapitulation (กลับมา โดยทำนองที่ 2 ย้ายมาคีย์หลัก)',
    'The plan of a piece, with letters for sections.\nBinary: A B\nTernary: A B A\nRondo: A B A C A (A keeps returning)\nTheme and variations: a tune followed by altered versions.\nSonata form: exposition (two themes) – development – recapitulation (both themes return, the second now in the home key).',
    ['cadence', 'relative']);

  window.GLOSSARY = G;
})();
