/* =========================================================
   store-remote.js — เวอร์ชันออนไลน์ของ Store (Supabase)
   ทำงานเมื่อใส่ค่าใน config.js แล้วเท่านั้น
   หลักการ: โหลดข้อมูลที่หน้าใช้มาเก็บใน cache ก่อน render (Store.prepare) แล้วให้ app อ่านจาก cache แบบ sync
   ========================================================= */
(() => {
  const cfg = window.CLARINERD_CONFIG || {};
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return; // ยังไม่ได้ตั้งค่า → ใช้ store.js (ออฟไลน์)
  if (/[?&]offline=1/.test(location.search)) return; // ดูตัวอย่างแบบออฟไลน์ (ใช้เนื้อหาในเครื่อง)
  if (!window.supabase) { document.getElementById('app').innerHTML = '<p style="padding:24px">โหลดระบบไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่</p>'; return; }

  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  const SKEY = 'cn_session';
  const today = () => new Date().toISOString().slice(0, 10);
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

  // เนื้อหาในเครื่อง (มีเฉพาะตอนเปิดจากโฟลเดอร์ต้นฉบับ ใช้สำหรับปุ่มอัปโหลด)
  const LOCAL = window.COURSES && window.BANKS && Object.keys(window.BANKS).length
    ? { courses: JSON.parse(JSON.stringify(window.COURSES)), banks: window.BANKS } : null;
  window.BANKS = window.BANKS || {};

  const C = { booted: false, rec: null, reason: '', attempts: [], codes: [], allAttempts: [], loadedCourses: new Set(), isAdmin: false, myQ: [], adminQ: [], qReady: true, bankIndex: {}, role: 'owner', staff: null, invites: [], usage: [] };

  const session = () => { try { return JSON.parse(localStorage.getItem(SKEY)); } catch (e) { return null; } };
  const setSession = (s) => { try { s ? localStorage.setItem(SKEY, JSON.stringify(s)) : localStorage.removeItem(SKEY); } catch (e) {} };

  const rowToAttempt = (r) => ({ id: r.id, code: r.code, name: r.name, courseId: r.course_id, setId: r.set_id, setTitle: r.set_title, mode: r.mode, score: r.score, total: r.total, durSec: r.dur_sec, items: r.items || [], date: r.created_at });
  const rowToQ = (r) => ({ id: r.id, code: r.code, name: r.name, courseId: r.course_id, setId: r.set_id, qId: r.q_id, snapshot: r.snapshot || {}, message: r.message, answer: r.answer, answeredAt: r.answered_at, seen: r.seen, date: r.created_at });
  const rowToCode = (r) => ({ nick: r.nick || '', teacherId: r.teacher_id || null, code: r.code, name: r.name, courses: r.courses || [], expires: r.expires, active: r.active, note: r.note || '', created: (r.created_at || '').slice(0, 10) });
  const fail = (error, what) => { if (error) { console.error(what, error); throw new Error(what + ': ' + (error.message || error)); } };

  async function rpc(fn, args) { const { data, error } = await sb.rpc(fn, args); fail(error, fn); return data; }

  /* ---------- เริ่มต้น ---------- */
  async function boot() {
    if (C.booted) return;
    const cat = await rpc('get_catalog', {});
    if (cat && cat.courses) window.COURSES = cat.courses;
    else if (LOCAL) window.COURSES = JSON.parse(JSON.stringify(LOCAL.courses)); // ยังไม่เคยอัปโหลด — ใช้ของในเครื่องไปก่อน
    else window.COURSES = [];
    C.booted = true;
  }

  async function loadStudent(force) {
    const s = session();
    if (!s || s.type !== 'student') return;
    if (!C.rec || C.rec.code !== s.code || force) {
      const r = await rpc('student_login', { p_code: s.code });
      if (!r.ok) { C.rec = null; C.reason = r.reason; return; }
      C.rec = r.rec; C.reason = '';
    }
    C.attempts = (await rpc('my_attempts', { p_code: C.rec.code })).map(rowToAttempt);
  }
  async function loadBoard() {
    if (!C.rec) return;
    const { data, error } = await sb.rpc('leaderboard', { p_code: C.rec.code });
    C.board = error ? null : data; // null = ยังไม่ได้รัน leaderboard.sql
  }
  async function setBoardProfile(nick, show) {
    await rpc('set_board_profile', { p_code: C.rec.code, p_nick: nick, p_show: show });
    await loadBoard();
  }
  async function loadMyQuestions() {
    if (!C.rec) return;
    const { data, error } = await sb.rpc('my_questions', { p_code: C.rec.code });
    if (error) { C.qReady = false; C.myQ = []; return; } // ยังไม่ได้รัน questions.sql
    C.qReady = true; C.myQ = (data || []).map(rowToQ);
  }

  async function loadCourse(id) {
    if (!id || C.loadedCourses.has(id) || !C.rec) return;
    const course = (window.COURSES || []).find((c) => c.id === id);
    if (!course || !C.rec.courses.includes(id)) return;
    const d = await rpc('get_course_content', { p_code: C.rec.code, p_course: id });
    if (d.banks) Object.assign(window.BANKS, d.banks);              // v1: ได้ทั้งคลัง
    if (d.bankIndex) Object.assign(C.bankIndex, d.bankIndex);        // v2: ได้แค่สารบัญ ข้อสอบดึงทีละชุด
    (course.units || []).forEach((u) => { if (d.lessons && d.lessons[u.id]) u.lesson = d.lessons[u.id]; });
    if (d.examInfo) course.examInfo = d.examInfo;
    C.loadedCourses.add(id);
  }

  async function loadAdmin() {
    const { data: { session: auth } } = await sb.auth.getSession();
    if (!auth) { C.isAdmin = false; return; }
    C.isAdmin = !!(await rpc('is_admin', {}));
    if (!C.isAdmin) return;
    { const { data, error } = await sb.rpc('my_role'); C.role = !error && data ? data : 'owner'; C.v2Admin = !error; }
    const [codes, att, qs] = await Promise.all([
      sb.from('access_codes').select('*').order('created_at', { ascending: false }),
      sb.from('attempts').select('*').order('created_at', { ascending: true }).limit(5000),
      sb.from('questions').select('*').order('created_at', { ascending: false }).limit(1000),
    ]);
    fail(codes.error, 'access_codes'); fail(att.error, 'attempts');
    C.qReady = !qs.error; C.adminQ = qs.error ? [] : qs.data.map(rowToQ);
    C.staff = null; C.usage = [];
    if (C.v2Admin) {
      const since = new Date(Date.now() - 7 * 864e5).toISOString();
      const [st, inv, lg] = await Promise.all([
        sb.from('admins').select('user_id,email,role,name'),
        C.role === 'owner' ? sb.from('staff_invites').select('*') : Promise.resolve({ data: [] }),
        sb.from('access_log').select('code,kind,n,at').gte('at', since).order('at', { ascending: false }).limit(5000),
      ]);
      if (!st.error) C.staff = st.data;
      C.invites = inv.data || [];
      if (!lg.error) C.usage = lg.data;
    }
    C.codes = codes.data.map(rowToCode);
    C.allAttempts = att.data.map(rowToAttempt);
  }

  /** เรียกก่อน render ทุกหน้า */
  async function prepare(page, arg) {
    await boot();
    const s = session();
    if (s && s.type === 'student' && ['', 'courses', 'course', 'play', 'result', 'me', 'info', 'questions'].includes(page)) {
      await loadStudent(page === 'courses' || page === 'me');
      if (['courses', 'me', 'questions'].includes(page)) await loadMyQuestions();
      if (page === 'courses') await loadBoard();
      if (page === 'course' || page === 'info') await loadCourse(arg);
      if (page === 'result') { const a = C.attempts.find((x) => x.id === arg); if (a) await loadCourse(a.courseId); }
    }
    if (s && s.type === 'admin' && (page === 'admin' || page === '')) {
      await loadAdmin();
      if (!C.isAdmin) setSession(null);
    }
  }

  /* ---------- นักเรียน ---------- */
  async function login(code) {
    const r = await rpc('student_login', { p_code: code });
    if (!r.ok) return r;
    C.rec = r.rec; C.reason = '';
    setSession({ type: 'student', code: r.rec.code });
    C.attempts = (await rpc('my_attempts', { p_code: r.rec.code })).map(rowToAttempt);
    return r;
  }
  function checkCode(code) {
    if (C.rec && C.rec.code.toUpperCase() === String(code).trim().toUpperCase()) return { ok: true, rec: C.rec };
    return { ok: false, reason: C.reason || 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง' };
  }
  async function addAttempt(a) {
    const row = await rpc('submit_attempt', { p_code: a.code, p_attempt: a });
    const rec = rowToAttempt(row);
    C.attempts.push(rec);
    return rec;
  }

  /* ---------- ครู ---------- */
  async function adminLogin(email, pw) {
    const { error } = await sb.auth.signInWithPassword({ email, password: pw });
    if (error) return { ok: false, reason: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
    const ok = await rpc('is_admin', {});
    if (!ok) { await sb.auth.signOut(); return { ok: false, reason: 'บัญชีนี้ไม่ได้เป็นผู้ดูแลระบบ' }; }
    setSession({ type: 'admin' });
    return { ok: true };
  }
  async function logout() {
    const s = session();
    if (s && s.type === 'admin') await sb.auth.signOut();
    setSession(null); C.rec = null; C.attempts = []; C.codes = []; C.allAttempts = []; C.isAdmin = false;
  }
  function newCodeStr() {
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const part = () => Array.from({ length: 4 }, () => A[crypto.getRandomValues(new Uint32Array(1))[0] % A.length]).join('');
    return `CN-${part()}-${part()}`;
  }
  async function createCode({ name, courses, expires, note }) {
    for (let i = 0; i < 5; i++) {
      const row = { code: newCodeStr(), name, courses, expires: expires || null, note: note || '' };
      const { data, error } = await sb.from('access_codes').insert(row).select().single();
      if (!error) { const c = rowToCode(data); C.codes.unshift(c); return c; }
      if (error.code !== '23505') fail(error, 'createCode'); // 23505 = รหัสซ้ำ → สุ่มใหม่
    }
    throw new Error('สร้างรหัสไม่สำเร็จ ลองอีกครั้ง');
  }
  async function updateCode(code, patch) {
    const { error } = await sb.from('access_codes').update(patch).eq('code', code);
    fail(error, 'updateCode');
    const c = C.codes.find((x) => x.code === code); if (c) Object.assign(c, patch);
  }
  async function deleteCode(code) {
    const { error } = await sb.from('access_codes').delete().eq('code', code);
    fail(error, 'deleteCode');
    C.codes = C.codes.filter((x) => x.code !== code);
  }
  async function setAdminPw(pw) { const { error } = await sb.auth.updateUser({ password: pw }); fail(error, 'updatePassword'); }

  /** อัปโหลดเนื้อหาจากไฟล์ในเครื่อง (data/*.js) ขึ้นฐานข้อมูล */
  async function uploadContent() {
    if (!LOCAL) throw new Error('ไม่พบเนื้อหาในเครื่อง — ต้องเปิดเว็บจากโฟลเดอร์ต้นฉบับ (ที่มีโฟลเดอร์ data)');
    const examInfo = window.EXAM_INFO || {};
    const catalog = LOCAL.courses.map((c) => {
      const { examInfo: _x, units, ...rest } = c;
      return { ...rest, hasExamInfo: !!(examInfo[c.id] || c.examInfo), units: (units || []).map(({ lesson, ...u }) => ({ ...u, hasLesson: !!lesson })) };
    });
    const rows = LOCAL.courses.map((c) => {
      const banks = {};
      (c.units || []).forEach((u) => u.sets.forEach((s) => s.source.forEach((src) => { if (src.bank) banks[src.bank] = LOCAL.banks[src.bank] || []; })));
      const lessons = {};
      (c.units || []).forEach((u) => { if (u.lesson) lessons[u.id] = u.lesson; });
      return { course_id: c.id, lessons, exam_info: examInfo[c.id] || c.examInfo || null, banks, updated_at: new Date().toISOString() };
    });
    const r1 = await sb.from('catalog').upsert({ id: 'main', data: { courses: catalog, uploaded: new Date().toISOString() }, updated_at: new Date().toISOString() });
    fail(r1.error, 'catalog');
    const r2 = await sb.from('course_content').upsert(rows);
    fail(r2.error, 'course_content');
    const nQ = Object.values(LOCAL.banks).reduce((n, b) => n + b.length, 0);
    return { courses: rows.length, questions: nQ };
  }

  /* ---------- กล่องถามครู ---------- */
  async function askQuestion(code, payload) {
    const row = await rpc('ask_question', { p_code: code, p_payload: payload });
    const q = rowToQ(row); C.myQ.unshift(q); return q;
  }
  async function markAnswersSeen(code) {
    if (!C.myQ.some((q) => q.answer && !q.seen)) return;
    await rpc('mark_answers_seen', { p_code: code });
    C.myQ.forEach((q) => { if (q.answer) q.seen = true; });
  }
  async function answerQuestion(id, answer) {
    const patch = { answer: answer || null, answered_at: answer ? new Date().toISOString() : null, seen: false };
    const { error } = await sb.from('questions').update(patch).eq('id', id);
    fail(error, 'answerQuestion');
    const q = C.adminQ.find((x) => x.id === id); if (q) Object.assign(q, { answer: patch.answer, answeredAt: patch.answered_at, seen: false });
  }
  async function deleteQuestion(id) {
    const { error } = await sb.from('questions').delete().eq('id', id);
    fail(error, 'deleteQuestion');
    C.adminQ = C.adminQ.filter((x) => x.id !== id);
  }

  /* ---------- v2: ดึงข้อสอบทีละชุด (ไม่ส่งทั้งคลังให้เบราว์เซอร์) ---------- */
  const isV2 = () => Object.keys(C.bankIndex).length > 0;
  const bankCount = (bank, tags) => Object.entries(C.bankIndex[bank] || {}).filter(([t]) => !tags || tags.includes(t)).reduce((n, [, v]) => n + v, 0);
  const bankTags = (bank) => Object.keys(C.bankIndex[bank] || {});
  /** sources: [{bank, tags?, n?, part?}] → ใส่ข้อที่ได้ลง window.BANKS (สะสม ไม่ซ้ำ) */
  async function fetchQuestions(courseId, setId, sources) {
    const req = sources.filter((x) => x.bank).map((x) => ({ bank: x.bank, tags: x.tags || null, n: Math.min(60, x.n ?? bankCount(x.bank, x.tags)), part: x.part ?? null })).filter((x) => x.n > 0);
    if (!req.length || !C.rec) return;
    const out = await rpc('get_questions', { p_code: C.rec.code, p_course: courseId, p_set: setId, p_sources: req, p_exclude: [] });
    out.forEach((grp, i) => {
      const b = req[i].bank, cur = window.BANKS[b] || (window.BANKS[b] = []), have = new Set(cur.map((q) => q.id));
      (grp.qs || []).forEach((q) => { if (!have.has(q.id)) { cur.push(q); have.add(q.id); } });
    });
  }
  async function addStaff(email, name) { return rpc('add_staff', { p_email: email, p_name: name }); }
  async function removeStaff(email) { return rpc('remove_staff', { p_email: email }); }

  function exportAll() { return JSON.stringify({ codes: C.codes, attempts: C.allAttempts, exported: new Date().toISOString() }, null, 1); }

  window.Store = {
    remote: true,
    canUpload: !!LOCAL,
    prepare, login, adminLogin, logout, uploadContent, setAdminPw, exportAll,
    today, addDays, session, setSession, checkCode,
    codes: () => C.codes,
    findCode: (code) => C.codes.find((c) => c.code.toUpperCase() === String(code).trim().toUpperCase()),
    createCode, updateCode, deleteCode,
    attempts: () => C.allAttempts,
    attemptsFor: (code) => (C.rec && C.rec.code === code ? C.attempts : C.allAttempts.filter((a) => a.code === code)),
    attemptById: (id) => C.attempts.find((a) => a.id === id) || C.allAttempts.find((a) => a.id === id),
    addAttempt,
    askQuestion, markAnswersSeen, answerQuestion, deleteQuestion,
    myQuestions: () => C.myQ,
    adminQuestions: () => C.adminQ,
    questionsReady: () => C.qReady,
    board: () => C.board || null, setBoardProfile,
    isV2, bankCount, bankTags, fetchQuestions, addStaff, removeStaff,
    role: () => C.role,
    staff: () => C.staff,
    invites: () => C.invites,
    usage: () => C.usage,
  };
})();
