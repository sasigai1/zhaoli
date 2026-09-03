/* ============================================================
   api.js — API Stub 层
   形状即未来真实 API：签名/延迟/错误处理保持一致，
   接后端时只需把 TODO 处替换为真实 fetch。
   ============================================================ */

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// 模拟网络延迟，让 loading 状态真实可见
const LATENCY = 260;

const api = {
  // GET /api/events?date=YYYY-MM-DD → { code:0, data:Event[] }
  async fetchEvents(date) {
    await delay(LATENCY);
    return { code: 0, data: DB.events.filter(e => e.date === date) };
  },

  // GET /api/events?from=&to= → { code:0, data:Event[] }（周视图用）
  async fetchEventsRange(from, to) {
    await delay(LATENCY);
    return { code: 0, data: DB.events.filter(e => e.date >= from && e.date <= to) };
  },

  // POST /api/events  body:Event → { code:0, data:Event }
  async saveEvent(event) {
    await delay(LATENCY);
    const idx = DB.events.findIndex(e => e.id === event.id);
    if (idx >= 0) DB.events[idx] = event; else DB.events.push(event);
    return { code: 0, data: event };
  },

  // PATCH /api/events/:id/complete → { code:0 }
  async completeEvent(id, done) {
    await delay(120);
    const ev = DB.events.find(e => e.id === id);
    if (ev) ev.done = done;
    return { code: 0 };
  },

  // DELETE /api/events/:id → { code:0 }
  async deleteEvent(id) {
    await delay(120);
    DB.events = DB.events.filter(e => e.id !== id);
    return { code: 0 };
  },

  // GET /api/rhythm?days=7 → { code:0, data:{date,blankRate,done,focusMin}[] }
  async fetchRhythm(days = 7) {
    await delay(LATENCY);
    return { code: 0, data: DB.rhythm.slice(-days) };
  },

  // POST /api/focus/sessions  body:{label,min} → { code:0 }
  async saveFocusSession(label, min) {
    await delay(100);
    DB.focusSessions.unshift({ id:'f'+Date.now(), label, min, at: nowHM(), planned:true });
    return { code: 0 };
  },
};

function nowHM(){ const d=new Date(); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
