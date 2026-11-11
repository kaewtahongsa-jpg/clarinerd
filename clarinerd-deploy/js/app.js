/* =========================================================
   app.js — หน้าเว็บทั้งหมดของ Clarinerd (ฝั่งนักเรียน + ฝั่งครู)
   ========================================================= */
(() => {
  const $app = document.getElementById('app');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const go = (h) => { if (location.hash === h) route(); else location.hash = h; };
  const pct = (s, t) => (t ? Math.round((s / t) * 100) : 0);
  const fmtDate = (iso) => { if (!iso) return '—'; const d = new Date(iso); return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }); };
  const fmtDateTime = (iso) => { const d = new Date(iso); return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }); };
  const fmtDur = (sec) => { const m = Math.floor(sec / 60), s = sec % 60; return `${m}:${String(s).padStart(2, '0')}`; };
  const courseById = (id) => COURSES.find((c) => c.id === id);
  const scoreClass = (p) => (p >= 80 ? 'good' : p >= 50 ? 'mid' : 'low');
  const getLang = () => { try { return localStorage.getItem('cn_lang') || 'th'; } catch (e) { return 'th'; } };
  const nl = (t) => esc(t).replace(/\n/g, '<br>');
  /** เฉลยแบบละเอียด (q.ex) — คำแปลโจทย์ · ไทย/English · ทำไมข้ออื่นผิด · จำง่าย · ภาพโน้ต */
  function explainHTML(q, withImages) {
    const x = q.ex;
    if (!x) return q.e ? `<p class="explain">${nl(q.e)}</p>` : '';
    const lang = getLang(), en = lang === 'en' && x.en;
    return `<div class="ex">
      ${x.qAlt ? `<p class="ex-alt">${esc(x.qAlt)}</p>` : ''}
      <div class="ex-lang"><button class="${!en ? 'on' : ''}" data-lang="th">ไทย</button><button class="${en ? 'on' : ''}" data-lang="en">English</button></div>
      <p class="explain">${nl(en ? x.en : (x.th || q.e || ''))}</p>
      ${withImages && x.img ? x.img.map((im, i) => `<figure class="ex-fig"><div class="staff ex-img" data-img="${i}"></div><figcaption>${esc(en && im.capEn ? im.capEn : im.cap || '')}</figcaption></figure>`).join('') : ''}
      ${x.why && x.why.length && !en ? `<p class="ex-h">ทำไมตัวเลือกอื่นผิด</p><ul class="ex-why">${x.why.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>` : ''}
      ${x.whyEn && x.whyEn.length && en ? `<p class="ex-h">Why the other choices are wrong</p><ul class="ex-why">${x.whyEn.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>` : ''}
      ${x.tip ? `<p class="ex-tip"><b>${en ? 'Tip' : 'จำง่าย'}</b> ${esc(en && x.tipEn ? x.tipEn : x.tip)}</p>` : ''}
    </div>`;
  }
  /* ---------- กล่องถามครู ---------- */
  const ASK = {};            // key → ข้อมูลโจทย์ที่จะส่งไปพร้อมคำถาม
  const ASKED = new Set();   // ข้อที่ส่งคำถามไปแล้วในรอบนี้
  function askBoxHTML(key, payload) {
    if (Store.questionsReady && !Store.questionsReady()) return ''; // ยังไม่ได้เปิดระบบในฐานข้อมูล
    ASK[key] = payload;
    const sig = payload.courseId + '|' + (payload.qId || payload.snapshot.q);
    if (ASKED.has(sig)) return `<div class="ask sent">ส่งคำถามถึงครูแล้ว · <a href="#/questions">ดูคำตอบที่หน้า “ถามครู”</a></div>`;
    return `<div class="ask" data-ask="${key}">
      <button class="ask-open" data-act="ask-open">ยังสงสัยข้อนี้? ถามครู</button>
      <form class="ask-form" hidden>
        <textarea maxlength="1000" rows="3" placeholder="พิมพ์คำถามถึงครู เช่น ยังไม่เข้าใจขั้นที่ 2 ว่าทำไม…" required></textarea>
        <div class="row between"><span class="small muted">ครูจะเห็นโจทย์ข้อนี้พร้อมคำถาม และตอบกลับในหน้า “ถามครู”</span>
        <span class="row"><button type="button" class="link" data-act="ask-close">ยกเลิก</button><button class="btn primary">ส่งถึงครู</button></span></div>
        <p class="error"></p>
      </form></div>`;
  }
  function playAskPayload(P, q) {
    const chosen = P.resp[P.idx] === null ? null : q.choices[P.resp[P.idx]];
    return { courseId: P.courseId, setId: P.setId, qId: q.id || null, snapshot: {
      course: P.course.short, set: P.set.title, tag: q.tag, q: q.q, choices: q.choices, correct: q.choices[q.answer], chosen,
      notation: q.notation || null, audio: !!q.audio, explain: q.ex ? (q.ex.th || q.e || '') : (q.e || '') } };
  }
  document.addEventListener('submit', async (e) => {
    const box = e.target.closest('.ask'); if (!box) return;
    e.preventDefault();
    const rec = requireStudent(); if (!rec) return;
    const payload = ASK[box.dataset.ask], ta = box.querySelector('textarea'), btn = box.querySelector('.btn'), err = box.querySelector('.error');
    if (!payload || !ta.value.trim()) return;
    btn.disabled = true; btn.textContent = 'กำลังส่ง…';
    try {
      await Store.askQuestion(rec.code, { ...payload, message: ta.value.trim() });
      ASKED.add(payload.courseId + '|' + (payload.qId || payload.snapshot.q));
      box.outerHTML = `<div class="ask sent">ส่งคำถามถึงครูแล้ว · <a href="#/questions">ดูคำตอบที่หน้า “ถามครู”</a></div>`;
    } catch (x) {
      err.textContent = /rate_limited/.test(x.message) ? 'วันนี้ส่งคำถามครบ 30 ข้อแล้ว ลองใหม่พรุ่งนี้นะ' : 'ส่งไม่สำเร็จ ลองใหม่อีกครั้ง';
      btn.disabled = false; btn.textContent = 'ส่งถึงครู';
    }
  });

  /* ---------- ลายน้ำชื่อ·รหัส (กันการแคปหน้าจอไปเผยแพร่) ---------- */
  function watermark(rec) {
    if (!rec) return '';
    const t = esc(`${rec.name} · ${rec.code}`);
    return `<div class="wm" aria-hidden="true">${Array.from({ length: 24 }, () => `<span>${t}</span>`).join('')}</div>`;
  }

  function renderExImages(q) {
    if (!q.ex || !q.ex.img) return;
    document.querySelectorAll('.ex-img').forEach((el) => { const im = q.ex.img[+el.dataset.img]; if (im) Music.renderStaff(el, im.n); });
  }

  let timerId = null;
  let PLAY = null;

  /* ---------------- ส่วนหัว ---------------- */
  const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="13" y="3" width="6" height="22" rx="2" fill="currentColor"/><path d="M10 25h12l-2 5h-8z" fill="currentColor"/><circle cx="16" cy="9" r="1.6" fill="var(--paper)"/><circle cx="16" cy="14" r="1.6" fill="var(--paper)"/><circle cx="16" cy="19" r="1.6" fill="var(--paper)"/></svg>`;

  const YT = 'https://www.youtube.com/@Clarinerdth', LINE = 'https://line.me/ti/p/~k.kaewta19';
  function header(right = '') {
    return `<header class="top"><a class="brand" href="#/"><span class="dot"></span><b>Clarinerd</b><i>by Dream</i></a><nav>${right}</nav></header>`;
  }
  function footer() {
    return `<footer class="foot"><span>© ${new Date().getFullYear() + 543} Clarinerd · ครูดรีม (Kaewta Hongsa)</span>
      <span class="links"><a href="${YT}" target="_blank" rel="noopener">YouTube</a><a href="${LINE}" target="_blank" rel="noopener">LINE: k.kaewta19</a></span></footer>`;
  }
  function studentNav(rec) {
    const unread = Store.myQuestions ? Store.myQuestions(rec.code).filter((q) => q.answer && !q.seen).length : 0;
    return header(`<a href="#/courses">คอร์ส</a><a href="#/me">ผลของฉัน</a><a href="#/questions">ถามครู${unread ? `<span class="badge">${unread}</span>` : ''}</a><span class="who">${esc(rec.name)}</span><button class="link" data-act="logout">ออก</button>`);
  }
  function adminNav(active) {
    const t = (id, label) => `<a href="#/admin/${id}" class="${active === id ? 'on' : ''}">${label}</a>`;
    const open = Store.adminQuestions ? Store.adminQuestions().filter((q) => !q.answer).length : 0;
    const owner = Store.role ? Store.role() === 'owner' && Store.staff && Store.staff() : false;
    return header(`${t('codes', 'รหัสนักเรียน')}${t('results', 'ผลคะแนน')}${t('questions', 'คำถาม' + (open ? `<span class="badge">${open}</span>` : ''))}${owner ? t('staff', 'ครู') + t('usage', 'การใช้งาน') : ''}${t('settings', 'ตั้งค่า')}<button class="link" data-act="logout">ออก</button>`);
  }

  /* ---------------- ตรวจสิทธิ์ ---------------- */
  function requireStudent() {
    const s = Store.session();
    if (!s || s.type !== 'student') { go('#/'); return null; }
    const chk = Store.checkCode(s.code);
    if (!chk.ok) { Store.setSession(null); flash = chk.reason; go('#/'); return null; }
    return chk.rec;
  }
  function requireAdmin() {
    const s = Store.session();
    if (!s || s.type !== 'admin') { go('#/teacher'); return false; }
    return true;
  }
  let flash = '';

  /* =========================================================
     หน้าเข้าสู่ระบบ
     ========================================================= */
  function pageLogin() {
    const s = Store.session();
    if (s && s.type === 'student' && Store.checkCode(s.code).ok) return go('#/courses');
    if (s && s.type === 'admin') return go('#/admin/codes');
    const msg = flash; flash = '';
    $app.innerHTML = `
      ${header('<a href="' + YT + '" target="_blank" rel="noopener">YouTube</a><a href="#/teacher">สำหรับครู</a>')}
      <div class="landing">
        <section class="hero">
          <div>
            <p class="eyebrow">ห้องฝึกซ้อมออนไลน์ · โดยครูดรีม</p>
            <h1>ที่ฝึกทำข้อสอบดนตรี<br>ด้วยตัวเอง <em>ทุกวัน</em></h1>
            <p class="lead">ดรีมทำเว็บนี้ให้น้อง ๆ มีที่ฝึกทำข้อสอบ และทบทวนเนื้อหาเองได้ระหว่างรอเรียน ทุกข้อมีเฉลยอธิบายเป็นขั้นตอน ตอบผิดตรงไหนจะได้ฝึกเรื่องนั้นซ้ำ และดรีมเห็นคะแนนของทุกคน เลยช่วยดูได้ว่าควรฝึกอะไรต่อ</p>
            <p class="chips"><span>เฉลยละเอียดทุกข้อ</span><span>ไทย | English</span><span>มีภาพโน้ตประกอบ</span><span>ฝึกซ้ำเรื่องที่ผิด</span></p>
            <p class="trial"><b>ทดลองใช้ฟรี 7 วัน</b> — ทัก LINE <a href="${LINE}" target="_blank" rel="noopener">k.kaewta19</a> บอกคอร์สที่อยากลอง แล้วดรีมจะส่งรหัสให้</p>
          </div>
          <div class="side">
            <div class="teacher"><img src="img/dream.jpg" alt="ครูดรีม Kaewta Hongsa"><div><b>Kaewta Hongsa (Dream)</b><span>ครูคลาริเน็ต · ABRSM · Audition prep</span></div></div>
            <form class="card login-card" id="loginForm" autocomplete="off">
              <h2>เข้าห้องเรียน</h2>
              <p class="muted small">ใส่รหัสที่ได้รับจากครู</p>
              <input id="code" class="code-input" placeholder="CN-XXXX-XXXX" required autocapitalize="characters" spellcheck="false">
              ${msg ? `<p class="error">${esc(msg)}</p>` : '<p class="error" id="err"></p>'}
              <button class="btn primary block" type="submit">เข้าเรียน</button>
            </form>
          </div>
        </section>
        <section class="shelf">
          <h2>คอร์สที่เปิดสอน</h2>
          <div class="posters">
            <div class="poster" style="--c:#ff7a1a"><span>Start here</span><b>พื้นฐาน<br>ดนตรี</b><i>เริ่มจากศูนย์ อ่านโน้ต จังหวะ ชาร์ป–แฟลต</i></div>
            <div class="poster" style="--c:#e8115b"><span>TCAS</span><b>TPAT22<br>ดนตรี</b><i>ตามโครงสร้างข้อสอบล่าสุด ทั้งสากลและไทย</i></div>
            <div class="poster" style="--c:#2d6cf6"><span>Theory</span><b>ABRSM<br>Grade 5</b><i>โจทย์ภาษาอังกฤษ เฉลยสองภาษา</i></div>
            <div class="poster" style="--c:#8b5cf6"><span>Audition</span><b>สอบตรง<br>คณะดนตรี</b><i>ทฤษฎี โสตทักษะ และเตรียมสอบปฏิบัติ</i></div>
          </div>
        </section>
        <section class="yt">
          <div><h2>ดูคลิปสอนคลาริเน็ตบน YouTube</h2><p>เทคนิคการเป่า สเกล และเรื่องการเตรียมสอบ — ช่อง Clarinerd (@Clarinerdth)</p></div>
          <a class="btn" href="${YT}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12c0 1.6.2 3.2.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.3-1.6.5-3.2.5-4.8s-.2-3.2-.5-4.8zM9.8 15.2V8.8l5.7 3.2-5.7 3.2z"/></svg>ไปที่ช่อง</a>
        </section>
      </div>
      ${footer()}`;
    document.getElementById('loginForm').onsubmit = async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button'), el = document.querySelector('.login-card .error');
      btn.disabled = true; btn.textContent = 'กำลังตรวจสอบ…';
      try {
        const chk = await Store.login(document.getElementById('code').value);
        if (!chk.ok) { el.textContent = chk.reason; return; }
        go('#/courses');
      } catch (err) { el.textContent = 'เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง'; }
      finally { btn.disabled = false; btn.textContent = 'เข้าเรียน'; }
    };
  }

  function pageTeacherLogin() {
    $app.innerHTML = `
      ${header('<a href="#/">หน้านักเรียน</a>')}
      <main class="narrow">
        <form class="card" id="tForm">
          <h2>เข้าสู่ระบบครู</h2>
          ${Store.remote ? '<label>อีเมล<input type="email" id="em" required autocomplete="username"></label>' : ''}
          <label>รหัสผ่านครู<input type="password" id="pw" required autocomplete="current-password"></label>
          <p class="error" id="err"></p>
          <button class="btn primary block">เข้าสู่ระบบ</button>
          ${Store.remote ? '' : '<p class="small muted">โหมดออฟไลน์ใช้รหัสผ่านเริ่มต้น <code>clarinerd</code> เปลี่ยนได้ในหน้าตั้งค่า</p>'}
        </form>
      </main>`;
    document.getElementById('tForm').onsubmit = async (e) => {
      e.preventDefault();
      const err = document.getElementById('err');
      try {
        const r = await Store.adminLogin(document.getElementById('em')?.value || '', document.getElementById('pw').value);
        if (!r.ok) { err.textContent = r.reason; return; }
        go('#/admin/codes');
      } catch (x) { err.textContent = 'เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง'; }
    };
  }

  /* =========================================================
     หน้าเลือกคอร์ส
     ========================================================= */
  function bestScores(code) {
    const best = {};
    Store.attemptsFor(code).forEach((a) => {
      const k = a.courseId + '/' + a.setId;
      const p = pct(a.score, a.total);
      if (!(k in best) || p > best[k]) best[k] = p;
    });
    return best;
  }
  const allSets = (course) => course.units.flatMap((u) => u.sets);

  function pageCourses() {
    const rec = requireStudent(); if (!rec) return;
    const best = bestScores(rec.code);
    const cards = COURSES.map((c) => {
      const open = rec.courses.includes(c.id);
      const sets = allSets(c);
      const done = sets.filter((s) => (c.id + '/' + s.id) in best).length;
      const status = !open ? '<span class="tag lock">ยังไม่ได้ลงทะเบียน</span>' : c.comingSoon ? '<span class="tag soon">เนื้อหากำลังมาเร็ว ๆ นี้</span>' : `<span class="tag">${done}/${sets.length} ชุดที่ทำแล้ว</span>`;
      const inner = `<div class="cc-bar"></div><span class="cc-kicker">คอร์ส</span><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p>${status}
        ${open && !c.comingSoon ? `<div class="progress"><i style="width:${pct(done, sets.length)}%"></i></div>` : ''}`;
      return open && !c.comingSoon
        ? `<a class="card course-card" style="--c:${c.color}" href="#/course/${c.id}">${inner}</a>`
        : `<div class="card course-card disabled" style="--c:${c.color}">${inner}${!open ? '<p class="small muted">ติดต่อครูเพื่อเปิดคอร์สนี้</p>' : ''}</div>`;
    }).join('');
    $app.innerHTML = `${studentNav(rec)}
      <main>
        <div class="page-head"><p class="eyebrow">ห้องเรียนของฉัน</p><h1>สวัสดี ${esc(rec.name)}</h1>
        <p class="muted">เลือกคอร์สที่ต้องการเรียน ${rec.expires ? `· รหัสใช้ได้ถึง ${fmtDate(rec.expires)}` : ''}</p></div>
        <div class="grid courses">${cards}</div>
      </main>${footer()}`;
  }

  /* =========================================================
     หน้าคอร์ส (บทเรียน + ชุดแบบฝึกหัด)
     ========================================================= */
  function pageCourse(id) {
    const rec = requireStudent(); if (!rec) return;
    const c = courseById(id);
    if (!c || !rec.courses.includes(id) || c.comingSoon) return go('#/courses');
    const best = bestScores(rec.code);
    const units = c.units.map((u, i) => `
      <section class="card unit">
        <div class="unit-head"><span class="num" style="background:${c.color}">${i + 1}</span>
          <div><h2>${esc(u.title)}</h2><p class="muted">${esc(u.desc || '')}</p></div></div>
        ${u.lesson ? `<details class="lesson" ${u.sets.length ? '' : 'open'}><summary>สรุปบทเรียน</summary><div class="lesson-body">${u.lesson}</div></details>` : ''}
        <ul class="sets">${u.sets.map((s) => {
          const b = best[c.id + '/' + s.id];
          const n = countQuestions(s);
          return `<li><div><b>${esc(s.title)}</b><span class="small muted"> · ${n} ข้อ${s.timeLimitMin ? ` · ${s.timeLimitMin} นาที` : ''}${s.desc ? ' · ' + esc(s.desc) : ''}</span>
            ${b !== undefined ? `<span class="score-pill ${scoreClass(b)}">ดีที่สุด ${b}%</span>` : ''}</div>
            <div class="set-btns">${s.exam ? '' : `<button class="btn" data-play="${c.id}|${s.id}|practice">ฝึก</button>`}
            <button class="btn ${s.exam ? 'primary' : 'ghost'}" data-play="${c.id}|${s.id}|exam">${s.exam ? 'เริ่มสอบ' : 'สอบ'}</button></div></li>`;
        }).join('')}</ul>
      </section>`).join('');
    $app.innerHTML = `${studentNav(rec)}
      <main>
        <a class="back" href="#/courses">← คอร์สทั้งหมด</a>
        <div class="page-head" style="--c:${c.color}"><h1 class="accent-title">${esc(c.title)}</h1><p class="muted">${esc(c.desc)}</p>
        <p class="small muted"><b>ฝึก</b> = ตอบแล้วเห็นเฉลยทันที ตอบผิดจะได้โจทย์หัวข้อเดิมเพิ่มให้ฝึกซ้ำ · <b>สอบ</b> = ทำครบแล้วส่ง ดูคะแนนตอนจบ (ครูเห็นผลทั้งสองแบบ)</p></div>
        ${c.examInfo ? `<a class="card info-card" href="#/info/${c.id}" style="--c:${c.color}"><div><h2>ข้อมูลการสอบ ${esc(c.short)}</h2><p class="muted small">รูปแบบข้อสอบ การสมัคร วันสอบ สิ่งที่ต้องเตรียม กฎในห้องสอบ และเคล็ดลับ</p></div><span class="go">→</span></a>` : ''}
        ${(() => {
          const w = weakTags(rec.code, c.id);
          return `<section class="card weak-card"><div><h2>ฝึกจุดอ่อน</h2><p class="small muted">${w.length
            ? `จากผลที่ทำมา หัวข้อที่ควรฝึกเพิ่ม: ${w.map(([t, v]) => `<b>${esc(t)}</b> (ถูก ${pct(v.ok, v.n)}%)`).join(' · ')}`
            : 'ระบบจะเลือกหัวข้อที่ทำผิดบ่อยมาให้ฝึกซ้ำโดยอัตโนมัติ ทำแบบฝึกหัดสัก 1–2 ชุดก่อนแล้วปุ่มนี้จะใช้ได้'}</p></div>
            <button class="btn primary" data-play="${c.id}|weak|practice" ${w.length ? '' : 'disabled'}>เริ่มฝึก 15 ข้อ</button></section>`;
        })()}
        ${units}
      </main>${watermark(rec)}`;
    // ภาพโน้ตในสรุปบทเรียน — วาดตอนเปิดบทเรียน (ขนาดพอดีความกว้างจริง)
    const drawLesson = (root) => root.querySelectorAll('.lesson-staff:not([data-done])').forEach((el) => {
      try { Music.renderStaff(el, JSON.parse(el.dataset.n)); el.dataset.done = '1'; } catch (e) { el.remove(); }
    });
    $app.querySelectorAll('details.lesson').forEach((d) => { if (d.open) drawLesson(d); d.addEventListener('toggle', () => { if (d.open) drawLesson(d); }); });
  }

  /* =========================================================
     สร้างชุดคำถาม
     ========================================================= */
  const v2 = () => !!(Store.isV2 && Store.isV2());
  function countQuestions(set) {
    return set.source.reduce((n, src) => n + (src.n ?? (v2() ? Store.bankCount(src.bank, src.tags) : (BANKS[src.bank] || []).filter((q) => !src.tags || src.tags.includes(q.tag)).length)), 0);
  }
  function buildQuestions(set) {
    const out = [];
    set.source.forEach((src) => {
      if (src.bank) {
        const pool = (BANKS[src.bank] || []).filter((q) => !src.tags || src.tags.includes(q.tag));
        Music.shuffle(pool).slice(0, src.n ?? pool.length).forEach((q) => out.push({ ...q, part: src.part }));
      } else if (src.gen) {
        const seen = new Set();
        for (let i = 0, tries = 0; i < src.n && tries < src.n * 20; tries++) {
          const q = Music.GEN[Music.pick(src.gen)]();
          const key = q.q + JSON.stringify(q.notation || q.audio) + q.c[0];
          if (seen.has(key)) continue;
          seen.add(key); out.push({ ...q, part: src.part }); i++;
        }
      }
    });
    // ข้อสอบรวมให้สลับลำดับ แต่ข้อฟังเสียงไว้ท้าย (เหมือนสอบจริงที่แยกตอนฟัง)
    // set.ordered = แบ่งเป็นตอน (part 1, 2, …) เหมือนสนามจริง สลับเฉพาะข้อภายในตอนเดียวกัน
    const ordered = set.ordered
      ? [...new Set(out.map((q) => q.part))].sort().flatMap((pt) => Music.shuffle(out.filter((q) => q.part === pt)))
      : set.exam ? [...Music.shuffle(out.filter((q) => !q.audio)), ...Music.shuffle(out.filter((q) => q.audio))] : Music.shuffle(out);
    return ordered.map(prepare);
  }
  /** สลับลำดับตัวเลือก (c[0] = ข้อถูก) */
  function prepare(q) {
    const order = Music.shuffle(q.c.map((_, i) => i));
    return { ...q, choices: order.map((i) => q.c[i]), answer: order.indexOf(0) };
  }
  const qKey = (q) => q.id || q.q + JSON.stringify(q.notation || q.audio) + q.c[0];

  /* ---------- ระบบฝึกซ้ำ: หาโจทย์ “หัวข้อเดียวกัน” จากคลังและตัวสร้างของคอร์สนั้น ---------- */
  let GEN_TAG = null;
  function genTag(name) {
    if (!GEN_TAG) GEN_TAG = {};
    if (!(name in GEN_TAG)) { try { GEN_TAG[name] = Music.GEN[name]().tag; } catch (e) { GEN_TAG[name] = null; } }
    return GEN_TAG[name];
  }
  function courseSources(course) {
    const banks = new Set(), gens = new Set();
    allSets(course).forEach((s) => s.source.forEach((src) => { if (src.bank) banks.add(src.bank); if (src.gen) src.gen.forEach((g) => gens.add(g)); }));
    return { banks: [...banks], gens: [...gens] };
  }
  function similarQuestion(course, tag, used) {
    const { banks, gens } = courseSources(course);
    const pool = banks.flatMap((b) => BANKS[b] || []).filter((q) => q.tag === tag && !used.has(q.id));
    const g = gens.filter((n) => genTag(n) === tag);
    // ถ้ามีตัวสร้างโจทย์ ให้สุ่มสลับกับคลัง เพื่อไม่ให้คลังหมดเร็ว
    if (g.length && (!pool.length || Math.random() < 0.5)) {
      for (let t = 0; t < 15; t++) { const q = Music.GEN[Music.pick(g)](); if (q.tag === tag && !used.has(qKey(q))) return q; }
    }
    if (pool.length) return { ...Music.pick(pool) };
    return null;
  }
  /** สถิติรายหัวข้อของนักเรียนในคอร์สนี้ → หัวข้อที่อ่อน (ถูกน้อยกว่า 80%) */
  function weakTags(code, courseId) {
    const course = courseById(courseId);
    if (!course) return [];
    // เฉพาะหัวข้อที่ยังมีโจทย์อยู่ในคอร์ส (กันกรณีครูเปลี่ยนชื่อหัวข้อ แล้วผลเก่ายังใช้ชื่อเดิม)
    const { banks, gens } = courseSources(course);
    const live = new Set([...banks.flatMap((b) => (v2() ? Store.bankTags(b) : (BANKS[b] || []).map((q) => q.tag))), ...gens.map(genTag)]);
    const items = Store.attemptsFor(code).filter((a) => a.courseId === courseId).flatMap((a) => a.items).filter((x) => live.has(x.tag));
    return tagBreakdown(items).filter(([, v]) => v.n >= 2 && v.ok / v.n < 0.8).slice(0, 3);
  }
  function buildWeakSet(code, course) {
    const weak = weakTags(code, course.id);
    if (!weak.length) return null;
    const used = new Set(), qs = [];
    for (let i = 0, miss = 0; qs.length < 15 && miss < 30; i++) {
      const tag = weak[i % weak.length][0];
      const q = similarQuestion(course, tag, used);
      if (!q) { miss++; continue; }
      used.add(qKey(q)); qs.push(prepare(q));
    }
    return { set: { id: 'weak', title: 'ฝึกจุดอ่อน: ' + weak.map(([t]) => t).join(', ') }, qs };
  }

  function findSet(courseId, setId) {
    const c = courseById(courseId);
    for (const u of c?.units || []) for (const s of u.sets) if (s.id === setId) return { course: c, unit: u, set: s };
    return null;
  }

  let starting = false;
  async function startPlay(courseId, setId, mode) {
    if (starting) return;
    // v2: ดึงข้อสอบของชุดนี้จากเซิร์ฟเวอร์ก่อน (เซิร์ฟเวอร์ไม่ส่งทั้งคลังให้เบราว์เซอร์)
    if (v2()) {
      const course = courseById(courseId);
      let sources;
      if (setId === 'weak') {
        const rec = requireStudent(); if (!rec) return;
        const tags = weakTags(rec.code, courseId).map(([t]) => t);
        sources = courseSources(course).banks.filter((b) => Store.bankTags(b).some((t) => tags.includes(t))).map((b) => ({ bank: b, tags, n: 30 }));
      } else {
        const f0 = findSet(courseId, setId); if (!f0) return;
        sources = f0.set.source.filter((x) => x.bank).map((x) => ({ ...x, n: mode === 'exam' && x.n ? x.n : undefined }));
      }
      if (sources.length) {
        starting = true;
        $app.insertAdjacentHTML('beforeend', '<div class="loading-veil"><div class="loading"><span></span>กำลังเตรียมข้อสอบ…</div></div>');
        try { await Store.fetchQuestions(courseId, setId, sources); }
        catch (err) {
          document.querySelector('.loading-veil')?.remove(); starting = false;
          return alert(/rate_limited/.test(err.message) ? 'วันนี้ทำแบบฝึกหัดครบจำนวนที่กำหนดแล้ว พักก่อนแล้วกลับมาพรุ่งนี้นะ' : 'โหลดข้อสอบไม่สำเร็จ ลองใหม่อีกครั้ง');
        }
        document.querySelector('.loading-veil')?.remove(); starting = false;
      }
    }
    let f, qs;
    if (setId === 'weak') {
      const rec = requireStudent(); if (!rec) return;
      const course = courseById(courseId);
      const w = buildWeakSet(rec.code, course);
      if (!w) return alert('ยังไม่พบหัวข้อที่อ่อน ลองทำแบบฝึกหัดชุดอื่นก่อนสัก 1–2 ชุดนะ');
      f = { course, set: w.set }; qs = w.qs; mode = 'practice';
    } else {
      f = findSet(courseId, setId); if (!f) return;
      qs = buildQuestions(f.set);
    }
    PLAY = {
      courseId, setId, mode, course: f.course, set: f.set, qs, idx: 0, extra: 0,
      used: new Set(qs.map(qKey)),
      resp: Array(qs.length).fill(null), start: Date.now(),
      limit: mode === 'exam' ? (f.set.timeLimitMin || Math.max(5, Math.ceil(qs.length * 1.2))) * 60 : null,
    };
    go('#/play');
  }

  /* =========================================================
     หน้าทำแบบฝึกหัด
     ========================================================= */
  function pagePlay() {
    const rec = requireStudent(); if (!rec) return;
    if (!PLAY) return go('#/courses');
    const P = PLAY, q = P.qs[P.idx], exam = P.mode === 'exam';
    const answered = P.resp[P.idx] !== null;
    const reveal = !exam && answered;
    const nDone = P.resp.filter((r) => r !== null).length;

    const choices = q.choices.map((ch, i) => {
      let cls = '';
      if (reveal) cls = i === q.answer ? 'right' : i === P.resp[P.idx] ? 'wrong' : 'dim';
      else if (P.resp[P.idx] === i) cls = 'picked';
      return `<button class="choice ${cls}" data-choice="${i}" ${reveal ? 'disabled' : ''}><span class="letter">${'กขคง'[i] || i + 1}</span><span>${esc(ch)}</span></button>`;
    }).join('');

    const last = P.idx === P.qs.length - 1;
    let nav;
    if (exam) {
      nav = `<div class="play-nav">
        <button class="btn ghost" data-act="prev" ${P.idx === 0 ? 'disabled' : ''}>← ก่อนหน้า</button>
        ${last ? '<button class="btn primary" data-act="submit">ส่งคำตอบ</button>' : '<button class="btn primary" data-act="next">ถัดไป →</button>'}
      </div>
      <div class="qgrid">${P.qs.map((_, i) => `<button class="${i === P.idx ? 'cur' : ''} ${P.resp[i] !== null ? 'done' : ''}" data-jump="${i}">${i + 1}</button>`).join('')}</div>
      <p class="center"><button class="link" data-act="submit">ส่งคำตอบ (ทำแล้ว ${nDone}/${P.qs.length} ข้อ)</button></p>`;
    } else {
      nav = reveal ? `<div class="feedback ${P.resp[P.idx] === q.answer ? 'ok' : 'no'}">
          <b>${P.resp[P.idx] === q.answer ? '✓ ถูกต้อง!' : '✗ ยังไม่ถูก คำตอบคือ “' + esc(q.choices[q.answer]) + '”'}</b>
          ${explainHTML(q, true)}
          ${P.added && P.added[P.idx] ? '<p class="retry-note">+ เพิ่มโจทย์เรื่องนี้ให้ฝึกซ้ำอีก 1 ข้อ</p>' : ''}
          ${askBoxHTML('p' + P.idx, playAskPayload(P, q))}</div>
        <div class="play-nav"><span></span><button class="btn primary" data-act="${last ? 'submit' : 'next'}">${last ? 'ดูผลคะแนน' : 'ข้อต่อไป →'}</button></div>` : '';
    }

    $app.innerHTML = `${header(`<button class="link" data-act="quit">✕ ออกจากแบบฝึกหัด</button>`)}
      <main class="play">
        <div class="play-top">
          <div><p class="small muted">${esc(P.course.short)} · ${esc(P.set.title)} · ${exam ? 'โหมดสอบ' : 'โหมดฝึก'}</p>
          <p class="qcount">ข้อ ${P.idx + 1} / ${P.qs.length}</p></div>
          ${P.limit ? `<div class="timer" id="timer">--:--</div>` : ''}
        </div>
        <div class="progress"><i style="width:${pct(exam ? nDone : P.idx + (answered ? 1 : 0), P.qs.length)}%;background:${P.course.color}"></i></div>
        <article class="card question">
          ${q.part ? `<span class="tag part">ตอนที่ ${q.part}</span> ` : ''}<span class="tag">${esc(q.tag)}</span>${q.retry ? ' <span class="tag retry">ฝึกซ้ำ</span>' : ''}
          <h2>${esc(q.q)}</h2>
          ${q.notation ? '<div class="staff" id="staff"></div>' : ''}
          ${q.audio ? '<div class="audio-box"><button class="btn audio" data-act="listen">▶ ฟังเสียง</button><span class="small muted">กดฟังซ้ำได้</span></div>' : ''}
          <div class="choices">${choices}</div>
        </article>
        ${nav}
      </main>${watermark(rec)}`;
    if (q.notation) Music.renderStaff(document.getElementById('staff'), q.notation);
    if (reveal) renderExImages(q);
    if (P.limit) startTimer();
  }

  function startTimer() {
    clearInterval(timerId);
    const tick = () => {
      if (!PLAY) return clearInterval(timerId);
      const left = PLAY.limit - Math.floor((Date.now() - PLAY.start) / 1000);
      const el = document.getElementById('timer');
      if (el) { el.textContent = '⏱ ' + fmtDur(Math.max(0, left)); el.classList.toggle('warn', left < 120); }
      if (left <= 0) { clearInterval(timerId); alert('หมดเวลา! ระบบจะส่งคำตอบให้อัตโนมัติ'); finishPlay(); }
    };
    tick(); timerId = setInterval(tick, 1000);
  }

  async function finishPlay() {
    const rec = requireStudent(); if (!rec || !PLAY) return;
    clearInterval(timerId); Music.stop();
    const P = PLAY;
    const items = P.qs.map((q, i) => ({
      tag: q.tag, q: q.q, e: q.e || '', ex: q.ex ? { qAlt: q.ex.qAlt, th: q.ex.th, en: q.ex.en, why: q.ex.why, whyEn: q.ex.whyEn, tip: q.ex.tip, tipEn: q.ex.tipEn } : undefined,
      chosen: P.resp[i] === null ? null : q.choices[P.resp[i]],
      correct: q.choices[q.answer], ok: P.resp[i] === q.answer,
    }));
    let a;
    try {
      a = await Store.addAttempt({
        code: rec.code, name: rec.name, courseId: P.courseId, setId: P.setId, setTitle: P.set.title, mode: P.mode,
        score: items.filter((x) => x.ok).length, total: items.length, durSec: Math.round((Date.now() - P.start) / 1000), items,
      });
    } catch (err) {
      alert('ส่งคำตอบไม่สำเร็จ (อินเทอร์เน็ตอาจหลุด) กรุณากด “ส่งคำตอบ” อีกครั้ง คำตอบยังอยู่ครบ');
      return;
    }
    PLAY = null;
    go('#/result/' + a.id);
  }

  /* =========================================================
     หน้าผลคะแนน
     ========================================================= */
  function tagBreakdown(items) {
    const t = {};
    items.forEach((x) => { t[x.tag] = t[x.tag] || { ok: 0, n: 0 }; t[x.tag].n++; if (x.ok) t[x.tag].ok++; });
    return Object.entries(t).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n);
  }
  function breakdownHTML(items) {
    return `<div class="breakdown">${tagBreakdown(items).map(([tag, v]) => {
      const p = pct(v.ok, v.n);
      return `<div class="brow"><span>${esc(tag)}</span><div class="bar"><i class="${scoreClass(p)}" style="width:${Math.max(p, 3)}%"></i></div><b>${v.ok}/${v.n}</b></div>`;
    }).join('')}</div>`;
  }
  let REVIEW_CTX = null;
  function reviewHTML(items, onlyWrong) {
    return `<ol class="review">${items.map((x, i) => (onlyWrong && x.ok) ? '' : `
      <li class="${x.ok ? 'ok' : 'no'}" value="${i + 1}"><p><span class="tag">${esc(x.tag)}</span> ${esc(x.q)}</p>
      <p class="small">${x.ok ? '✓' : '✗'} ตอบ: <b>${x.chosen === null ? '(ไม่ได้ตอบ)' : esc(x.chosen)}</b>${x.ok ? '' : ` · เฉลย: <b>${esc(x.correct)}</b>`}</p>
      ${x.e || x.ex ? `<details class="small"><summary>ดูคำอธิบาย</summary>${explainHTML(x, false)}</details>` : ''}
      ${REVIEW_CTX ? askBoxHTML('r' + i, { courseId: REVIEW_CTX.courseId, setId: REVIEW_CTX.setId, qId: null, snapshot: { course: REVIEW_CTX.course, set: REVIEW_CTX.set, tag: x.tag, q: x.q, correct: x.correct, chosen: x.chosen, explain: x.ex ? (x.ex.th || x.e || '') : (x.e || '') } }) : ''}</li>`).join('')}</ol>`;
  }

  function pageResult(id) {
    const rec = requireStudent(); if (!rec) return;
    const a = Store.attemptById(id);
    if (!a || a.code !== rec.code) return go('#/me');
    const p = pct(a.score, a.total), c = courseById(a.courseId);
    REVIEW_CTX = { courseId: a.courseId, setId: a.setId, course: c?.short || '', set: a.setTitle };
    const msg = p >= 80 ? 'เยี่ยมมาก เก็บความแม่นนี้ไว้นะ' : p >= 50 ? 'ดีแล้ว ฝึกจุดที่พลาดอีกนิด' : 'ไม่เป็นไร อ่านสรุปบทเรียนแล้วลองใหม่อีกรอบ';
    $app.innerHTML = `${studentNav(rec)}
      <main>
        <a class="back" href="#/course/${a.courseId}">← กลับไปที่คอร์ส</a>
        <section class="card result-hero">
          <div class="ring ${scoreClass(p)}" style="--p:${p}"><span>${p}%</span></div>
          <div><p class="small muted">${esc(c?.short || '')} · ${esc(a.setTitle)} · ${a.mode === 'exam' ? 'โหมดสอบ' : 'โหมดฝึก'}</p>
          <h1>${a.score} / ${a.total} คะแนน</h1><p>${msg}</p><p class="small muted">ใช้เวลา ${fmtDur(a.durSec)} นาที</p>
          <div class="row"><button class="btn primary" data-play="${a.courseId}|${a.setId}|${a.mode}">ทำอีกครั้ง</button>${weakTags(rec.code, a.courseId).length ? `<button class="btn" data-play="${a.courseId}|weak|practice">ฝึกจุดอ่อน</button>` : ''}<a class="btn ghost" href="#/course/${a.courseId}">เลือกชุดอื่น</a></div></div>
        </section>
        <section class="card"><h2>คะแนนแยกตามหัวข้อ</h2>${breakdownHTML(a.items)}</section>
        <section class="card"><h2>ทบทวนคำตอบ</h2>
          <label class="toggle"><input type="checkbox" id="onlyWrong"> แสดงเฉพาะข้อที่ผิด</label>
          <div id="rev">${reviewHTML(a.items, false)}</div></section>
      </main>`;
    document.getElementById('onlyWrong').onchange = (e) => { document.getElementById('rev').innerHTML = reviewHTML(a.items, e.target.checked); };
  }

  function pageMe() {
    const rec = requireStudent(); if (!rec) return;
    const list = Store.attemptsFor(rec.code).slice().reverse();
    $app.innerHTML = `${studentNav(rec)}
      <main><div class="page-head"><h1>ผลของฉัน</h1><p class="muted">ทำไปแล้ว ${list.length} ครั้ง</p></div>
      ${list.length ? `<section class="card"><table class="tbl"><thead><tr><th>วันที่</th><th>ชุด</th><th>โหมด</th><th>คะแนน</th></tr></thead><tbody>
        ${list.map((a) => `<tr class="click" data-href="#/result/${a.id}"><td>${fmtDateTime(a.date)}</td><td>${esc(courseById(a.courseId)?.short || '')} · ${esc(a.setTitle)}</td><td>${a.mode === 'exam' ? 'สอบ' : 'ฝึก'}</td><td><span class="score-pill ${scoreClass(pct(a.score, a.total))}">${a.score}/${a.total}</span></td></tr>`).join('')}
      </tbody></table></section>` : '<section class="card empty">ยังไม่มีผล ลองเริ่มทำแบบฝึกหัดชุดแรกได้เลย <a href="#/courses">ไปที่คอร์ส →</a></section>'}
      </main>`;
  }

  /* =========================================================
     หน้าถามครู (นักเรียน)
     ========================================================= */
  function qSnapshotHTML(s, id) {
    if (!s || !s.q) return '';
    return `<div class="qa-q">
      <p class="small muted">${esc([s.course, s.set, s.tag].filter(Boolean).join(' · '))}</p>
      <p><b>${esc(s.q)}</b></p>
      ${s.notation ? `<div class="staff qa-staff" id="${id}"></div>` : ''}${s.audio ? '<p class="small muted">(โจทย์ฟังเสียง)</p>' : ''}
      ${s.correct ? `<p class="small">ตอบ: <b>${s.chosen == null ? '(ไม่ได้ตอบ)' : esc(s.chosen)}</b> · เฉลย: <b>${esc(s.correct)}</b></p>` : ''}
    </div>`;
  }
  function renderSnapshots(list) {
    list.forEach((q, i) => { const el = document.getElementById('qs' + i); if (el && q.snapshot && q.snapshot.notation) Music.renderStaff(el, q.snapshot.notation); });
  }
  function pageQuestions() {
    const rec = requireStudent(); if (!rec) return;
    const ready = Store.questionsReady ? Store.questionsReady() : true;
    const list = Store.myQuestions(rec.code);
    const courses = COURSES.filter((c) => rec.courses.includes(c.id));
    ASK.g = null;
    $app.innerHTML = `${studentNav(rec)}
      <main>
        <div class="page-head"><p class="eyebrow">กล่องถามครู</p><h1>ถามครูดรีม</h1>
        <p class="muted">สงสัยข้อไหน กด “ถามครู” ใต้เฉลยได้เลย หรือพิมพ์ถามเรื่องอื่นด้านล่าง ครูจะตอบกลับในหน้านี้</p></div>
        ${!ready ? '<section class="card"><p>ระบบถามครูยังไม่เปิดใช้งาน กรุณาแจ้งครู</p></section>' : `
        <section class="card">
          <h2>ถามเรื่องอื่น</h2>
          <form id="gForm">
            <select id="gCourse">${courses.map((c) => `<option value="${c.id}">${esc(c.short || c.title)}</option>`).join('')}</select>
            <textarea id="gMsg" rows="3" maxlength="1000" placeholder="เช่น ควรเริ่มอ่านเรื่องไหนก่อน หรือเรื่องที่ยังไม่เข้าใจในบทเรียน" required style="margin-top:10px"></textarea>
            <p class="error" id="gErr"></p>
            <button class="btn primary">ส่งถึงครู</button>
          </form>
        </section>
        <h2 style="margin-top:28px">คำถามของฉัน <span class="muted small">(${list.length})</span></h2>
        ${list.length ? list.map((q, i) => `
          <article class="card qa-card ${q.answer ? (q.seen ? 'done' : 'new') : 'wait'}">
            <div class="row between"><span class="status ${q.answer ? 'on' : 'off'}">${q.answer ? (q.seen ? 'ครูตอบแล้ว' : 'คำตอบใหม่') : 'รอครูตอบ'}</span><span class="small muted">${fmtDateTime(q.date)}</span></div>
            ${qSnapshotHTML(q.snapshot, 'qs' + i)}
            <p class="qa-msg"><span class="small muted">คำถามของฉัน</span><br>${nl(q.message)}</p>
            ${q.answer ? `<div class="qa-answer"><span class="small">ครูดรีมตอบ · ${fmtDateTime(q.answeredAt)}</span><p>${nl(q.answer)}</p></div>` : ''}
          </article>`).join('') : '<section class="card empty">ยังไม่มีคำถาม ลองกด “ถามครู” ใต้เฉลยของข้อที่สงสัยดูนะ</section>'}`}
      </main>${footer()}`;
    renderSnapshots(list);
    const f = document.getElementById('gForm');
    if (f) f.onsubmit = async (e) => {
      e.preventDefault();
      const btn = f.querySelector('.btn'), msg = document.getElementById('gMsg').value.trim();
      if (!msg) return;
      btn.disabled = true; btn.textContent = 'กำลังส่ง…';
      try {
        const cid = document.getElementById('gCourse').value, c = courseById(cid);
        await Store.askQuestion(rec.code, { courseId: cid, setId: null, qId: null, snapshot: { course: c?.short || '', set: 'คำถามทั่วไป' }, message: msg });
        pageQuestions();
      } catch (x) {
        document.getElementById('gErr').textContent = /rate_limited/.test(x.message) ? 'วันนี้ส่งคำถามครบ 30 ข้อแล้ว ลองใหม่พรุ่งนี้นะ' : 'ส่งไม่สำเร็จ ลองใหม่อีกครั้ง';
        btn.disabled = false; btn.textContent = 'ส่งถึงครู';
      }
    };
    if (list.some((q) => q.answer && !q.seen)) Store.markAnswersSeen(rec.code).catch(() => {});
  }

  /* =========================================================
     หน้าข้อมูลการสอบ
     ========================================================= */
  function pageInfo(id) {
    const rec = requireStudent(); if (!rec) return;
    const c = courseById(id);
    if (!c || !c.examInfo || !rec.courses.includes(id)) return go('#/courses');
    $app.innerHTML = `${studentNav(rec)}
      <main>
        <a class="back" href="#/course/${c.id}">← กลับไปที่คอร์ส</a>
        <div class="page-head" style="--c:${c.color}"><p class="eyebrow">ข้อมูลการสอบ</p><h1 class="accent-title">${esc(c.title)}</h1>
        <p class="muted">ทุกอย่างที่ต้องรู้นอกจากเนื้อหา อ่านให้ครบก่อนวันสอบ · ข้อมูลตรวจสอบล่าสุด ${esc(c.examInfo.checked)}</p></div>
        <article class="card info-body" style="--c:${c.color}">${c.examInfo.html}</article>
      </main>`;
    $app.querySelectorAll('.toc a').forEach((a) => a.onclick = (e) => { e.preventDefault(); document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' }); });
  }

  /* =========================================================
     ฝั่งครู: รหัสนักเรียน
     ========================================================= */
  function codeStatus(c) {
    if (!c.active) return '<span class="status off">ปิดใช้งาน</span>';
    if (c.expires && c.expires < Store.today()) return '<span class="status off">หมดอายุ</span>';
    return '<span class="status on">ใช้งานได้</span>';
  }
  function shareText(c) {
    return `รหัสเข้าเรียน Clarinerd ของ ${c.name}\nรหัส: ${c.code}\nคอร์ส: ${c.courses.map((id) => courseById(id)?.short).join(', ')}\nใช้ได้ถึง: ${c.expires ? fmtDate(c.expires) : 'ไม่มีวันหมดอายุ'}\nเข้าเรียนที่: ${location.origin + location.pathname}`;
  }

  const staffName = (id) => { const s = (Store.staff && Store.staff()) || []; const x = s.find((a) => a.user_id === id); return x ? x.name || x.email : '—'; };
  function pageAdminCodes() {
    if (!requireAdmin()) return;
    const tCol = Store.role && Store.role() === 'owner' && Store.staff && Store.staff() && Store.staff().length > 1;
    const list = Store.codes();
    const att = Store.attempts();
    $app.innerHTML = `${adminNav('codes')}
      <main>
        <div class="page-head"><h1>รหัสนักเรียน</h1><p class="muted">สร้างรหัสให้นักเรียนหลังจากชำระเงินแล้ว แล้วส่งรหัสให้นักเรียนทาง LINE</p></div>
        <section class="card">
          <h2>สร้างรหัสใหม่</h2>
          <form id="newCode" class="form-grid">
            <label>ชื่อนักเรียน<input id="nName" required placeholder="เช่น น้องมิว ม.6"></label>
            <label>ใช้ได้ถึงวันที่<input id="nExp" type="date" value="${Store.addDays(7)}"><span class="small muted"><button type="button" class="link" data-exp="7">ทดลอง 7 วัน</button> · <button type="button" class="link" data-exp="30">+1 เดือน</button> · <button type="button" class="link" data-exp="90">+3 เดือน</button> · <button type="button" class="link" data-exp="180">+6 เดือน</button> · <button type="button" class="link" data-exp="365">+1 ปี</button> · <button type="button" class="link" data-exp="0">ไม่หมดอายุ</button></span></label>
            <fieldset><legend>เปิดคอร์ส</legend>${COURSES.map((c) => `<label class="check"><input type="checkbox" name="nc" value="${c.id}" ${c.id === 'tpat22' ? 'checked' : ''}> ${esc(c.title)}</label>`).join('')}</fieldset>
            <label>หมายเหตุ (นักเรียนไม่เห็น)<input id="nNote" placeholder="เช่น โอนแล้ว 5 พ.ย."></label>
            <button class="btn primary">สร้างรหัส</button>
          </form>
          <div id="newOut"></div>
        </section>
        <section class="card">
          <div class="row between"><h2>รายชื่อทั้งหมด (${list.length})</h2><input id="q" class="search" placeholder="ค้นหาชื่อหรือรหัส"></div>
          <div class="tbl-wrap"><table class="tbl" id="codeTbl"><thead><tr><th>ชื่อ</th>${tCol ? '<th>ครู</th>' : ''}<th>รหัส</th><th>คอร์ส</th><th>ใช้ได้ถึง</th><th>สถานะ</th><th>ทำแล้ว</th><th></th></tr></thead><tbody>
          ${list.map((c) => `<tr data-row="${esc((c.name + ' ' + c.code).toLowerCase())}">
            <td><b>${esc(c.name)}</b>${c.note ? `<br><span class="small muted">${esc(c.note)}</span>` : ''}</td>
            ${tCol ? `<td class="small">${esc(staffName(c.teacherId))}</td>` : ''}
            <td><code>${esc(c.code)}</code></td>
            <td>${COURSES.map((x) => `<label class="mini"><input type="checkbox" data-course="${esc(c.code)}|${x.id}" ${c.courses.includes(x.id) ? 'checked' : ''}>${esc(x.short)}</label>`).join('')}</td>
            <td><input type="date" class="mini-date" data-exp-of="${esc(c.code)}" value="${c.expires || ''}"></td>
            <td>${codeStatus(c)}</td>
            <td><a href="#/admin/student/${encodeURIComponent(c.code)}">${att.filter((a) => a.code === c.code).length} ครั้ง</a></td>
            <td class="actions"><button class="link" data-copy="${esc(c.code)}">คัดลอกข้อความ</button>
              <button class="link" data-toggle="${esc(c.code)}">${c.active ? 'ปิด' : 'เปิด'}</button>
              <button class="link danger" data-del="${esc(c.code)}">ลบ</button></td></tr>`).join('')}
          </tbody></table></div>
        </section>
      </main>`;

    const exp = document.getElementById('nExp');
    document.querySelectorAll('[data-exp]').forEach((b) => b.onclick = () => { const n = +b.dataset.exp; exp.value = n ? Store.addDays(n) : ''; });
    document.getElementById('newCode').onsubmit = async (e) => {
      e.preventDefault();
      const courses = [...document.querySelectorAll('input[name=nc]:checked')].map((x) => x.value);
      if (!courses.length) return alert('เลือกอย่างน้อย 1 คอร์ส');
      let c;
      try { c = await Store.createCode({ name: document.getElementById('nName').value.trim(), courses, expires: exp.value || null, note: document.getElementById('nNote').value.trim() }); }
      catch (err) { return alert('สร้างรหัสไม่สำเร็จ: ' + err.message); }
      pageAdminCodes();
      document.getElementById('newOut').innerHTML = `<div class="new-code"><p>สร้างรหัสให้ <b>${esc(c.name)}</b> แล้ว</p><p class="big-code">${esc(c.code)}</p>
        <textarea readonly rows="5">${esc(shareText(c))}</textarea><button class="btn" data-copy="${esc(c.code)}">คัดลอกข้อความส่งนักเรียน</button></div>`;
      bindCopy();
    };
    document.getElementById('q').oninput = (e) => {
      const v = e.target.value.toLowerCase();
      document.querySelectorAll('#codeTbl tbody tr').forEach((tr) => tr.style.display = tr.dataset.row.includes(v) ? '' : 'none');
    };
    const safe = (fn) => async (...args) => { try { await fn(...args); } catch (err) { alert('บันทึกไม่สำเร็จ: ' + err.message); pageAdminCodes(); } };
    document.querySelectorAll('[data-course]').forEach((cb) => cb.onchange = safe(async () => {
      const [code, cid] = cb.dataset.course.split('|');
      const c = Store.findCode(code);
      const courses = cb.checked ? [...new Set([...c.courses, cid])] : c.courses.filter((x) => x !== cid);
      await Store.updateCode(code, { courses });
    }));
    document.querySelectorAll('[data-exp-of]').forEach((inp) => inp.onchange = safe(async () => { await Store.updateCode(inp.dataset.expOf, { expires: inp.value || null }); pageAdminCodes(); }));
    document.querySelectorAll('[data-toggle]').forEach((b) => b.onclick = safe(async () => { const c = Store.findCode(b.dataset.toggle); await Store.updateCode(c.code, { active: !c.active }); pageAdminCodes(); }));
    document.querySelectorAll('[data-del]').forEach((b) => b.onclick = safe(async () => {
      const c = Store.findCode(b.dataset.del);
      if (confirm(`ลบรหัสของ “${c.name}” ใช่ไหม?\n(ผลคะแนนเดิมยังเก็บไว้ แต่นักเรียนจะเข้าใช้ไม่ได้อีก)`)) { await Store.deleteCode(c.code); pageAdminCodes(); }
    }));
    bindCopy();
  }
  function bindCopy() {
    document.querySelectorAll('[data-copy]').forEach((b) => b.onclick = async () => {
      const t = shareText(Store.findCode(b.dataset.copy));
      try { await navigator.clipboard.writeText(t); b.textContent = 'คัดลอกแล้ว ✓'; } catch (e) { prompt('คัดลอกข้อความนี้', t); }
    });
  }

  /* =========================================================
     ฝั่งครู: ผลคะแนน
     ========================================================= */
  function pageAdminResults() {
    if (!requireAdmin()) return;
    const att = Store.attempts();
    const codes = Store.codes();
    const rows = codes.map((c) => {
      const mine = att.filter((a) => a.code === c.code);
      const sc = mine.reduce((s, a) => s + a.score, 0), tot = mine.reduce((s, a) => s + a.total, 0);
      const items = mine.flatMap((a) => a.items);
      const weak = tagBreakdown(items).filter(([, v]) => v.n >= 3 && v.ok / v.n < 0.6).slice(0, 2).map(([t]) => t);
      const last = mine.length ? mine[mine.length - 1].date : null;
      return { c, n: mine.length, p: tot ? pct(sc, tot) : null, weak, last };
    }).sort((a, b) => (b.last || '').localeCompare(a.last || ''));
    const recent = att.slice(-15).reverse();
    $app.innerHTML = `${adminNav('results')}
      <main>
        <div class="page-head"><h1>ผลคะแนนนักเรียน</h1><p class="muted">ทั้งหมด ${att.length} ครั้ง จากนักเรียน ${codes.length} คน</p></div>
        <section class="card"><h2>ภาพรวมรายคน</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>ชื่อ</th><th>ทำแล้ว</th><th>คะแนนเฉลี่ย</th><th>หัวข้อที่ควรทบทวน</th><th>ล่าสุด</th></tr></thead><tbody>
          ${rows.map((r) => `<tr class="click" data-href="#/admin/student/${encodeURIComponent(r.c.code)}"><td><b>${esc(r.c.name)}</b><br><code class="small">${esc(r.c.code)}</code></td><td>${r.n} ครั้ง</td>
            <td>${r.p === null ? '—' : `<span class="score-pill ${scoreClass(r.p)}">${r.p}%</span>`}</td><td>${r.weak.map((w) => `<span class="tag warn">${esc(w)}</span>`).join(' ') || '<span class="muted">—</span>'}</td><td>${r.last ? fmtDateTime(r.last) : '—'}</td></tr>`).join('')}
        </tbody></table></div></section>
        <section class="card"><h2>ทำล่าสุด</h2>${recent.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>เวลา</th><th>นักเรียน</th><th>ชุด</th><th>โหมด</th><th>คะแนน</th></tr></thead><tbody>
          ${recent.map((a) => `<tr class="click" data-href="#/admin/attempt/${a.id}"><td>${fmtDateTime(a.date)}</td><td>${esc(a.name)}</td><td>${esc(courseById(a.courseId)?.short || '')} · ${esc(a.setTitle)}</td><td>${a.mode === 'exam' ? 'สอบ' : 'ฝึก'}</td><td><span class="score-pill ${scoreClass(pct(a.score, a.total))}">${a.score}/${a.total}</span></td></tr>`).join('')}
        </tbody></table></div>` : '<p class="muted">ยังไม่มีนักเรียนทำแบบฝึกหัด</p>'}</section>
      </main>`;
  }

  function pageAdminStudent(code) {
    if (!requireAdmin()) return;
    code = decodeURIComponent(code);
    const c = Store.findCode(code);
    const mine = Store.attemptsFor(code);
    const items = mine.flatMap((a) => a.items);
    const name = c?.name || mine[0]?.name || code;
    $app.innerHTML = `${adminNav('results')}
      <main>
        <a class="back" href="#/admin/results">← ผลคะแนนทั้งหมด</a>
        <div class="page-head"><h1>${esc(name)}</h1><p class="muted"><code>${esc(code)}</code> ${c ? `· ${c.courses.map((x) => courseById(x)?.short).join(', ')} · ใช้ได้ถึง ${c.expires ? fmtDate(c.expires) : 'ไม่หมดอายุ'}` : '· (รหัสถูกลบแล้ว)'}</p></div>
        ${mine.length ? `
        <section class="card"><h2>ความแม่นยำแยกตามหัวข้อ (รวมทุกครั้ง)</h2><p class="small muted">เรียงจากหัวข้อที่อ่อนที่สุดขึ้นก่อน</p>${breakdownHTML(items)}</section>
        <section class="card"><h2>ประวัติการทำ (${mine.length} ครั้ง)</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>เวลา</th><th>ชุด</th><th>โหมด</th><th>เวลาที่ใช้</th><th>คะแนน</th></tr></thead><tbody>
          ${mine.slice().reverse().map((a) => `<tr class="click" data-href="#/admin/attempt/${a.id}"><td>${fmtDateTime(a.date)}</td><td>${esc(courseById(a.courseId)?.short || '')} · ${esc(a.setTitle)}</td><td>${a.mode === 'exam' ? 'สอบ' : 'ฝึก'}</td><td>${fmtDur(a.durSec)}</td><td><span class="score-pill ${scoreClass(pct(a.score, a.total))}">${a.score}/${a.total}</span></td></tr>`).join('')}
        </tbody></table></div></section>` : '<section class="card empty">นักเรียนคนนี้ยังไม่ได้ทำแบบฝึกหัด</section>'}
      </main>`;
  }

  function pageAdminAttempt(id) {
    if (!requireAdmin()) return;
    const a = Store.attemptById(id); if (!a) return go('#/admin/results');
    const p = pct(a.score, a.total);
    $app.innerHTML = `${adminNav('results')}
      <main>
        <a class="back" href="#/admin/student/${encodeURIComponent(a.code)}">← ${esc(a.name)}</a>
        <section class="card result-hero"><div class="ring ${scoreClass(p)}" style="--p:${p}"><span>${p}%</span></div>
          <div><p class="small muted">${esc(courseById(a.courseId)?.short || '')} · ${esc(a.setTitle)} · ${a.mode === 'exam' ? 'โหมดสอบ' : 'โหมดฝึก'}</p><h1>${esc(a.name)} · ${a.score}/${a.total}</h1>
          <p class="small muted">${fmtDateTime(a.date)} · ใช้เวลา ${fmtDur(a.durSec)} นาที</p></div></section>
        <section class="card"><h2>แยกตามหัวข้อ</h2>${breakdownHTML(a.items)}</section>
        <section class="card"><h2>คำตอบทุกข้อ</h2>${(REVIEW_CTX = null, reviewHTML(a.items, false))}</section>
      </main>`;
  }

  /* =========================================================
     ฝั่งครู: ตั้งค่า
     ========================================================= */
  /* ---------- หน้าคำถามจากนักเรียน (ครู) ---------- */
  let qFilter = 'open';
  function pageAdminQuestions() {
    if (!requireAdmin()) return;
    const ready = Store.questionsReady ? Store.questionsReady() : true;
    const all = Store.adminQuestions();
    const list = all.filter((q) => (qFilter === 'open' ? !q.answer : qFilter === 'done' ? !!q.answer : true));
    const nOpen = all.filter((q) => !q.answer).length;
    const tab = (id, label) => `<button class="btn ${qFilter === id ? 'primary' : 'ghost'}" data-qf="${id}">${label}</button>`;
    $app.innerHTML = `${adminNav('questions')}
      <main>
        <div class="page-head"><h1>คำถามจากนักเรียน</h1><p class="muted">รอตอบ ${nOpen} ข้อ · ทั้งหมด ${all.length} ข้อ</p></div>
        ${!ready ? `<section class="card"><h2>ต้องเปิดใช้ระบบถามครูก่อน</h2><p>เปิด Supabase → SQL Editor → New query → วางไฟล์ <code>supabase/questions.sql</code> ทั้งไฟล์ → กด Run (ทำครั้งเดียว)</p></section>` : `
        <div class="row" style="margin-bottom:16px">${tab('open', 'รอตอบ')}${tab('done', 'ตอบแล้ว')}${tab('all', 'ทั้งหมด')}</div>
        ${list.length ? list.map((q, i) => `
          <article class="card qa-card ${q.answer ? 'done' : 'wait'}">
            <div class="row between"><span><b>${esc(q.name || '')}</b> <code>${esc(q.code)}</code></span><span class="small muted">${fmtDateTime(q.date)}</span></div>
            ${qSnapshotHTML(q.snapshot, 'qs' + i)}
            ${q.snapshot && q.snapshot.explain ? `<details class="small"><summary>ดูเฉลยที่นักเรียนเห็น</summary><p class="explain muted">${nl(q.snapshot.explain)}</p></details>` : ''}
            <p class="qa-msg"><span class="small muted">คำถาม</span><br>${nl(q.message)}</p>
            <form class="qa-reply" data-qid="${esc(q.id)}">
              <textarea rows="3" maxlength="4000" placeholder="พิมพ์คำตอบถึงนักเรียน…">${esc(q.answer || '')}</textarea>
              <div class="row between"><span class="small muted">${q.answer ? `ตอบแล้ว ${fmtDateTime(q.answeredAt)}${q.seen ? ' · นักเรียนอ่านแล้ว' : ''}` : ''}</span>
              <span class="row"><button type="button" class="link danger" data-qdel="${esc(q.id)}">ลบ</button><button class="btn primary">${q.answer ? 'บันทึกการแก้ไข' : 'ส่งคำตอบ'}</button></span></div>
            </form>
          </article>`).join('') : `<section class="card empty">${qFilter === 'open' ? 'ไม่มีคำถามที่รอตอบ' : 'ยังไม่มีคำถาม'}</section>`}`}
      </main>`;
    renderSnapshots(list);
    $app.querySelectorAll('[data-qf]').forEach((b) => (b.onclick = () => { qFilter = b.dataset.qf; pageAdminQuestions(); }));
    $app.querySelectorAll('.qa-reply').forEach((f) => (f.onsubmit = async (e) => {
      e.preventDefault();
      const btn = f.querySelector('.btn'), txt = f.querySelector('textarea').value.trim();
      if (!txt) return;
      btn.disabled = true; btn.textContent = 'กำลังบันทึก…';
      try { await Store.answerQuestion(f.dataset.qid, txt); pageAdminQuestions(); }
      catch (x) { alert('บันทึกไม่สำเร็จ: ' + x.message); btn.disabled = false; btn.textContent = 'ส่งคำตอบ'; }
    }));
    $app.querySelectorAll('[data-qdel]').forEach((b) => (b.onclick = async () => {
      if (!confirm('ลบคำถามนี้? (ย้อนกลับไม่ได้)')) return;
      try { await Store.deleteQuestion(b.dataset.qdel); pageAdminQuestions(); } catch (x) { alert('ลบไม่สำเร็จ: ' + x.message); }
    }));
  }

  /* ---------- ครูในสังกัด (เจ้าของเท่านั้น) ---------- */
  function pageAdminStaff() {
    if (!requireAdmin()) return;
    if (!(Store.role && Store.role() === 'owner' && Store.staff && Store.staff())) return go('#/admin/codes');
    const staff = Store.staff(), inv = Store.invites();
    const codes = Store.codes();
    const rows = [...staff.map((a) => ({ email: a.email, name: a.name, role: a.role, id: a.user_id, account: true })),
      ...inv.filter((i) => !staff.some((a) => (a.email || '').toLowerCase() === i.email)).map((i) => ({ email: i.email, name: i.name, role: i.role, account: false }))];
    $app.innerHTML = `${adminNav('staff')}
      <main>
        <div class="page-head"><h1>ครูในสังกัด</h1><p class="muted">ครูแต่ละคนเห็นและจัดการเฉพาะรหัสนักเรียน คะแนน และคำถามของนักเรียนตัวเอง · อัปโหลดเนื้อหาได้เฉพาะเจ้าของ</p></div>
        <section class="card">
          <h2>เพิ่มครู</h2>
          <form id="stForm" class="form-grid">
            <label>ชื่อครู<input id="stName" required placeholder="เช่น ครูแพร"></label>
            <label>อีเมล (ใช้เข้าสู่ระบบ)<input id="stEmail" type="email" required placeholder="name@example.com"></label>
            <button class="btn primary">เพิ่มครู</button>
          </form>
          <div class="callout small" style="margin-top:14px"><b>ขั้นต่อไปหลังกดเพิ่ม</b> (ทำครั้งเดียวต่อครู 1 คน): เปิด Supabase → Authentication → Users → <b>Add user</b> → <b>Send invitation</b> ใส่อีเมลเดียวกัน — ครูจะได้อีเมลให้ตั้งรหัสผ่าน แล้วเข้าสู่ระบบที่หน้า “สำหรับครู” ได้ทันที (ระบบให้สิทธิ์ครูอัตโนมัติ)</div>
          <p class="error" id="stErr"></p>
        </section>
        <section class="card">
          <h2>รายชื่อ (${rows.length})</h2>
          <div class="tbl-wrap"><table class="tbl"><thead><tr><th>ชื่อ</th><th>อีเมล</th><th>บทบาท</th><th>บัญชี</th><th>นักเรียน</th><th></th></tr></thead><tbody>
          ${rows.map((r) => `<tr><td><b>${esc(r.name || '—')}</b></td><td>${esc(r.email || '')}</td><td>${r.role === 'owner' ? 'เจ้าของ' : 'ครู'}</td>
            <td>${r.account ? '<span class="status on">พร้อมใช้</span>' : '<span class="status off">รอสร้างบัญชีใน Supabase</span>'}</td>
            <td>${r.id ? codes.filter((c) => c.teacherId === r.id).length : 0} คน</td>
            <td class="actions">${r.role === 'owner' ? '' : `<button class="link danger" data-rmst="${esc(r.email)}">เอาออก</button>`}</td></tr>`).join('')}
          </tbody></table></div>
          <p class="small muted">เอาครูออก = ครูคนนั้นเข้าหน้าครูไม่ได้อีก (รหัสนักเรียนที่เขาสร้างยังใช้ได้ตามปกติ และเจ้าของยังเห็นทั้งหมด)</p>
        </section>
      </main>`;
    document.getElementById('stForm').onsubmit = async (e) => {
      e.preventDefault();
      const err = document.getElementById('stErr');
      try {
        const r = await Store.addStaff(document.getElementById('stEmail').value.trim(), document.getElementById('stName').value.trim());
        await Store.prepare('admin'); pageAdminStaff();
        alert(r && r.hasAccount ? 'เพิ่มแล้ว — ครูคนนี้มีบัญชีอยู่แล้ว เข้าสู่ระบบได้เลย' : 'เพิ่มแล้ว — อย่าลืมสร้างบัญชีใน Supabase (Authentication → Add user → Send invitation) ด้วยอีเมลเดียวกัน');
      } catch (x) { err.textContent = 'เพิ่มไม่สำเร็จ: ' + x.message; }
    };
    $app.querySelectorAll('[data-rmst]').forEach((b) => (b.onclick = async () => {
      if (!confirm(`เอา ${b.dataset.rmst} ออกจากครูในสังกัด?`)) return;
      try { await Store.removeStaff(b.dataset.rmst); await Store.prepare('admin'); pageAdminStaff(); } catch (x) { alert('ไม่สำเร็จ: ' + x.message); }
    }));
  }

  /* ---------- การใช้งาน (เจ้าของเท่านั้น) — ดูการดึงข้อสอบผิดปกติ ---------- */
  function pageAdminUsage() {
    if (!requireAdmin()) return;
    if (!(Store.role && Store.role() === 'owner' && Store.staff && Store.staff())) return go('#/admin/codes');
    const log = Store.usage(), codes = Store.codes(), now = Date.now();
    const by = {};
    log.forEach((r) => {
      const x = by[r.code] || (by[r.code] = { sets24: 0, sets7: 0, q7: 0, last: r.at });
      if (r.kind === 'set') { x.sets7++; x.q7 += r.n || 0; if (now - new Date(r.at) < 864e5) x.sets24++; }
      if (r.at > x.last) x.last = r.at;
    });
    const rows = Object.entries(by).map(([code, v]) => ({ code, ...v, c: codes.find((k) => k.code === code) })).sort((a, b) => b.q7 - a.q7);
    const flag = (r) => r.sets24 >= 80 || r.q7 >= 1500;
    $app.innerHTML = `${adminNav('usage')}
      <main>
        <div class="page-head"><h1>การใช้งาน 7 วันล่าสุด</h1><p class="muted">นับจากการเปิดชุดแบบฝึกหัด (ระบบจำกัดไม่เกิน 200 ชุดต่อวันต่อรหัส) · แถวสีแดง = ใช้มากผิดปกติ อาจมีการดึงข้อสอบไปเผยแพร่ ควรตรวจสอบ</p></div>
        <section class="card">${rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>ชื่อ</th><th>รหัส</th><th>ครู</th><th>ชุด (24 ชม.)</th><th>ชุด (7 วัน)</th><th>ข้อที่ได้ (7 วัน)</th><th>ล่าสุด</th></tr></thead><tbody>
          ${rows.map((r) => `<tr class="${flag(r) ? 'flag' : ''}"><td>${esc(r.c?.name || '—')}</td><td><code>${esc(r.code)}</code></td><td class="small">${esc(staffName(r.c?.teacherId))}</td><td>${r.sets24}</td><td>${r.sets7}</td><td>${r.q7}</td><td class="small">${fmtDateTime(r.last)}</td></tr>`).join('')}
          </tbody></table></div>` : '<p class="muted">ยังไม่มีข้อมูลการใช้งาน (เริ่มบันทึกหลังเปิดระบบครูหลายคน)</p>'}</section>
      </main>`;
  }

  function pageAdminSettings() {
    if (!requireAdmin()) return;
    const R = Store.remote;
    $app.innerHTML = `${adminNav('settings')}
      <main>
        <div class="page-head"><h1>ตั้งค่า</h1><p class="muted">${R ? '🟢 โหมดออนไลน์ — ข้อมูลเก็บบนเซิร์ฟเวอร์ (Supabase)' : '⚪ โหมดออฟไลน์ — ข้อมูลเก็บในเบราว์เซอร์เครื่องนี้'}</p></div>
        ${R && Store.canUpload && (!Store.role || Store.role() === 'owner') ? `<section class="card"><h2>อัปโหลดเนื้อหาขึ้นเซิร์ฟเวอร์</h2>
          <p class="small muted">ส่งบทเรียน ข้อมูลการสอบ และคลังข้อสอบจากไฟล์ในเครื่อง (โฟลเดอร์ data) ขึ้นฐานข้อมูล — กดทุกครั้งหลังแก้ไขเนื้อหา นักเรียนจะเห็นของใหม่ทันที (รหัสและคะแนนไม่ได้รับผลกระทบ)</p>
          <button class="btn primary" id="upload">อัปโหลดเนื้อหา</button><p id="upMsg" class="small"></p></section>` : ''}
        <section class="card"><h2>เปลี่ยนรหัสผ่านครู</h2>
          <form id="pwForm" class="row"><input type="password" id="np" placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)" minlength="8" required autocomplete="new-password"><button class="btn primary">บันทึก</button></form><p id="pwMsg" class="small"></p></section>
        <section class="card"><h2>สำรองข้อมูล</h2>
          <p class="small muted">ดาวน์โหลดรายชื่อรหัสและคะแนนทั้งหมดเป็นไฟล์ .json เก็บไว้</p>
          <div class="row"><button class="btn" id="exp">ดาวน์โหลดไฟล์สำรอง (.json)</button>${R ? '' : '<label class="btn ghost">นำเข้าไฟล์สำรอง<input type="file" id="imp" accept=".json" hidden></label>'}</div></section>
        ${R ? '' : `<section class="card"><h2>เกี่ยวกับโหมดออฟไลน์</h2>
          <ul class="small"><li>รหัสและคะแนนเก็บในเครื่องที่เปิดเว็บเท่านั้น</li><li>รหัสทดลอง <code>DEMO-2026</code> เปิดครบทุกคอร์ส</li></ul>
          <button class="btn danger" id="reset">ล้างข้อมูลทั้งหมด</button></section>`}
      </main>`;
    document.getElementById('pwForm').onsubmit = async (e) => {
      e.preventDefault(); const m = document.getElementById('pwMsg');
      try { await Store.setAdminPw(document.getElementById('np').value); m.textContent = 'เปลี่ยนรหัสผ่านแล้ว ✓'; } catch (err) { m.textContent = 'ไม่สำเร็จ: ' + err.message; }
    };
    document.getElementById('exp').onclick = () => {
      const blob = new Blob([Store.exportAll()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `clarinerd-backup-${Store.today()}.json`; a.click();
    };
    const up = document.getElementById('upload');
    if (up) up.onclick = async () => {
      const m = document.getElementById('upMsg'); up.disabled = true; m.textContent = 'กำลังอัปโหลด…';
      try { const r = await Store.uploadContent(); m.textContent = `อัปโหลดแล้ว ✓ ${r.courses} คอร์ส · ข้อสอบในคลัง ${r.questions} ข้อ`; } catch (err) { m.textContent = 'ไม่สำเร็จ: ' + err.message; }
      up.disabled = false;
    };
    const imp = document.getElementById('imp');
    if (imp) imp.onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      if (!confirm('นำเข้าไฟล์นี้จะแทนที่ข้อมูลปัจจุบันทั้งหมด ดำเนินการต่อไหม?')) return;
      try { Store.importAll(await f.text()); Store.setSession({ type: 'admin' }); alert('นำเข้าข้อมูลแล้ว'); go('#/admin/codes'); } catch (err) { alert('นำเข้าไม่สำเร็จ: ' + err.message); }
    };
    const rs = document.getElementById('reset');
    if (rs) rs.onclick = () => { if (confirm('ล้างรหัสนักเรียนและคะแนนทั้งหมด? (ย้อนกลับไม่ได้)')) { Store.resetAll(); go('#/'); } };
  }

  /* =========================================================
     การคลิก (ใช้ร่วมทุกหน้า)
     ========================================================= */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act],[data-play],[data-choice],[data-jump],[data-href],[data-lang]');
    if (!t) return;
    if (t.dataset.href) return go(t.dataset.href);
    if (t.dataset.lang) { try { localStorage.setItem('cn_lang', t.dataset.lang); } catch (x) {} const y = window.scrollY; const r = PLAY ? pagePlay() : route(); Promise.resolve(r).then(() => window.scrollTo(0, y)); return; }
    if (t.dataset.play) { const [c, s, m] = t.dataset.play.split('|'); return startPlay(c, s, m); }
    if (t.dataset.choice !== undefined && PLAY) {
      const i = +t.dataset.choice;
      if (PLAY.mode === 'practice' && PLAY.resp[PLAY.idx] !== null) return;
      PLAY.resp[PLAY.idx] = i;
      // ตอบผิดในโหมดฝึก → เพิ่มโจทย์หัวข้อเดียวกันให้ทำซ้ำ (สูงสุด 10 ข้อต่อชุด)
      if (PLAY.mode === 'practice' && i !== PLAY.qs[PLAY.idx].answer && PLAY.extra < 10) {
        const q2 = similarQuestion(PLAY.course, PLAY.qs[PLAY.idx].tag, PLAY.used);
        if (q2) {
          const at = Math.min(PLAY.idx + 3, PLAY.qs.length);
          PLAY.used.add(qKey(q2)); PLAY.extra++;
          PLAY.qs.splice(at, 0, { ...prepare(q2), retry: true });
          PLAY.resp.splice(at, 0, null);
          PLAY.added = PLAY.added || {}; PLAY.added[PLAY.idx] = true;
        }
      }
      if (PLAY.mode === 'exam' && PLAY.idx < PLAY.qs.length - 1) {
        const P = PLAY, at = P.idx;
        setTimeout(() => { if (PLAY === P && P.idx === at) { P.idx++; Music.stop(); pagePlay(); } }, 220);
        pagePlay(); return;
      }
      return pagePlay();
    }
    if (t.dataset.jump !== undefined && PLAY) { PLAY.idx = +t.dataset.jump; Music.stop(); return pagePlay(); }
    const act = t.dataset.act;
    if (act === 'ask-open' || act === 'ask-close') {
      const box = t.closest('.ask'), form = box.querySelector('.ask-form'), open = act === 'ask-open';
      form.hidden = !open; box.querySelector('.ask-open').hidden = open;
      if (open) form.querySelector('textarea').focus();
      return;
    }
    if (act === 'logout') { PLAY = null; Store.logout().finally(() => go('#/')); return; }
    if (act === 'listen' && PLAY) { Music.play(PLAY.qs[PLAY.idx].audio); t.textContent = '↻ ฟังอีกครั้ง'; return; }
    if (act === 'next' && PLAY) { PLAY.idx = Math.min(PLAY.idx + 1, PLAY.qs.length - 1); Music.stop(); window.scrollTo(0, 0); return pagePlay(); }
    if (act === 'prev' && PLAY) { PLAY.idx = Math.max(PLAY.idx - 1, 0); Music.stop(); return pagePlay(); }
    if (act === 'submit' && PLAY) {
      const left = PLAY.resp.filter((r) => r === null).length;
      if (PLAY.mode === 'exam' && left && !confirm(`ยังไม่ได้ตอบอีก ${left} ข้อ ต้องการส่งคำตอบเลยไหม?`)) return;
      return finishPlay();
    }
    if (act === 'quit' && PLAY) {
      if (confirm('ออกจากแบบฝึกหัด? คำตอบที่ทำไว้จะไม่ถูกบันทึก')) { const c = PLAY.courseId; PLAY = null; clearInterval(timerId); Music.stop(); go('#/course/' + c); }
    }
  });

  /* =========================================================
     เส้นทางหน้า
     ========================================================= */
  let routeSeq = 0;
  async function route() {
    clearInterval(timerId);
    const [page, arg] = location.hash.replace(/^#\/?/, '').split('/');
    if (page !== 'play') Music.stop();
    window.scrollTo(0, 0);
    const my = ++routeSeq;
    const slow = setTimeout(() => { if (my === routeSeq) $app.innerHTML = '<div class="loading"><span></span>กำลังโหลด…</div>'; }, 250);
    try { await Store.prepare(page, arg); }
    catch (err) {
      clearTimeout(slow);
      $app.innerHTML = `${header()}<main class="narrow"><section class="card"><h2>เชื่อมต่อไม่สำเร็จ</h2><p class="muted">ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง</p><p class="small muted">${esc(err.message)}</p><button class="btn primary" onclick="location.reload()">ลองใหม่</button></section></main>`;
      return;
    }
    clearTimeout(slow);
    if (my !== routeSeq) return;
    switch (page) {
      case '': return pageLogin();
      case 'teacher': return pageTeacherLogin();
      case 'courses': return pageCourses();
      case 'course': return pageCourse(arg);
      case 'play': return pagePlay();
      case 'result': return pageResult(arg);
      case 'me': return pageMe();
      case 'info': return pageInfo(arg);
      case 'questions': return pageQuestions();
      case 'admin':
        if (arg === 'results') return pageAdminResults();
        if (arg === 'student') return pageAdminStudent(location.hash.split('/').slice(3).join('/'));
        if (arg === 'attempt') return pageAdminAttempt(location.hash.split('/')[3]);
        if (arg === 'settings') return pageAdminSettings();
        if (arg === 'questions') return pageAdminQuestions();
        if (arg === 'staff') return pageAdminStaff();
        if (arg === 'usage') return pageAdminUsage();
        return pageAdminCodes();
      default: return go('#/');
    }
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', (e) => { if (PLAY) { e.preventDefault(); e.returnValue = ''; } });
  route();
})();
