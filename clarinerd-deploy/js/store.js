/* =========================================================
   store.js — เก็บข้อมูล (ต้นแบบ: เก็บในเบราว์เซอร์เครื่องนี้)
   เวอร์ชันจริงจะเปลี่ยนไปใช้ฐานข้อมูลออนไลน์ (Supabase) โดยแก้ไฟล์นี้ไฟล์เดียว
   ========================================================= */
window.Store = (() => {
  const K = { codes: 'cn_codes', attempts: 'cn_attempts', session: 'cn_session', pw: 'cn_admin_pw', questions: 'cn_questions' };
  const DEFAULT_PW = 'clarinerd';

  const read = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { alert('บันทึกข้อมูลไม่สำเร็จ'); } };

  const today = () => new Date().toISOString().slice(0, 10);
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  function newCode() {
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const part = () => Array.from({ length: 4 }, () => A[Math.floor(Math.random() * A.length)]).join('');
    const existing = new Set(codes().map((c) => c.code));
    let c;
    do { c = `CN-${part()}-${part()}`; } while (existing.has(c));
    return c;
  }

  function codes() {
    let list = read(K.codes, null);
    if (!list) {
      list = [{ code: 'DEMO-2026', name: 'นักเรียนทดลอง', courses: ['tpat22', 'abrsm', 'uni'], expires: addDays(365), active: true, note: 'รหัสตัวอย่าง', created: today() }];
      write(K.codes, list);
    }
    return list;
  }
  const saveCodes = (list) => write(K.codes, list);
  const findCode = (code) => codes().find((c) => c.code.toUpperCase() === String(code).trim().toUpperCase());

  /** ตรวจรหัส → {ok, rec, reason} */
  function checkCode(code) {
    const rec = findCode(code);
    if (!rec) return { ok: false, reason: 'ไม่พบรหัสนี้ กรุณาตรวจสอบอีกครั้ง' };
    if (!rec.active) return { ok: false, reason: 'รหัสนี้ถูกปิดการใช้งาน กรุณาติดต่อครู' };
    if (rec.expires && rec.expires < today()) return { ok: false, reason: `รหัสนี้หมดอายุแล้ว (${rec.expires}) กรุณาติดต่อครูเพื่อต่ออายุ` };
    return { ok: true, rec };
  }

  function createCode({ name, courses, expires, note }) {
    const list = codes();
    const rec = { code: newCode(), name, courses, expires: expires || null, active: true, note: note || '', created: today() };
    list.unshift(rec);
    saveCodes(list);
    return rec;
  }
  function updateCode(code, patch) {
    const list = codes();
    const i = list.findIndex((c) => c.code === code);
    if (i >= 0) { list[i] = { ...list[i], ...patch }; saveCodes(list); }
  }
  function deleteCode(code) { saveCodes(codes().filter((c) => c.code !== code)); }

  const attempts = () => read(K.attempts, []);
  function addAttempt(a) {
    const list = attempts();
    const rec = { id: uid(), date: new Date().toISOString(), ...a };
    list.push(rec);
    write(K.attempts, list);
    return rec;
  }
  const attemptById = (id) => attempts().find((a) => a.id === id);
  const attemptsFor = (code) => attempts().filter((a) => a.code === code);

  /* ---- กล่องถามครู ---- */
  const allQuestions = () => read(K.questions, []);
  async function askQuestion(code, payload) {
    const rec = findCode(code); if (!rec) throw new Error('no_access');
    const msg = String(payload.message || '').trim().slice(0, 1000); if (!msg) throw new Error('empty_message');
    const q = { id: uid(), code: rec.code, name: rec.name, courseId: payload.courseId, setId: payload.setId, qId: payload.qId || null, snapshot: payload.snapshot || {}, message: msg, answer: null, answeredAt: null, seen: false, date: new Date().toISOString() };
    const list = allQuestions(); list.push(q); write(K.questions, list); return q;
  }
  const myQuestions = (code) => allQuestions().filter((q) => q.code === code).reverse();
  async function markAnswersSeen(code) { write(K.questions, allQuestions().map((q) => (q.code === code && q.answer ? { ...q, seen: true } : q))); }
  const adminQuestions = () => allQuestions().slice().reverse();
  async function answerQuestion(id, answer) { write(K.questions, allQuestions().map((q) => (q.id === id ? { ...q, answer: answer || null, answeredAt: answer ? new Date().toISOString() : null, seen: false } : q))); }
  async function deleteQuestion(id) { write(K.questions, allQuestions().filter((q) => q.id !== id)); }

  const session = () => read(K.session, null);
  const setSession = (s) => (s ? write(K.session, s) : localStorage.removeItem(K.session));

  const adminPw = () => read(K.pw, DEFAULT_PW);
  const setAdminPw = (pw) => write(K.pw, pw);

  function exportAll() { return JSON.stringify({ codes: codes(), attempts: attempts(), exported: new Date().toISOString() }, null, 1); }
  function importAll(json) {
    const d = JSON.parse(json);
    if (!Array.isArray(d.codes) || !Array.isArray(d.attempts)) throw new Error('ไฟล์ไม่ถูกต้อง');
    write(K.codes, d.codes); write(K.attempts, d.attempts);
  }
  function resetAll() { [K.codes, K.attempts, K.session, K.questions].forEach((k) => localStorage.removeItem(k)); }

  /* ---- ส่วนที่ทำให้ใช้แทนกันได้กับ store-remote.js (เวอร์ชันออนไลน์) ---- */
  const remote = false, canUpload = false;
  async function prepare() {}
  async function login(code) { const r = checkCode(code); if (r.ok) setSession({ type: 'student', code: r.rec.code }); return r; }
  async function adminLogin(email, pw) { if (pw !== adminPw()) return { ok: false, reason: 'รหัสผ่านไม่ถูกต้อง' }; setSession({ type: 'admin' }); return { ok: true }; }
  async function logout() { setSession(null); }

  return { remote, canUpload, prepare, login, adminLogin, logout, today, addDays, codes, findCode, checkCode, createCode, updateCode, deleteCode, attempts, addAttempt, attemptById, attemptsFor, session, setSession, adminPw, setAdminPw, exportAll, importAll, resetAll, askQuestion, myQuestions, markAnswersSeen, adminQuestions, answerQuestion, deleteQuestion };
})();
