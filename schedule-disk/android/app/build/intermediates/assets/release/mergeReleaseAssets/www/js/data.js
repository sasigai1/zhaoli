/* ============ 数据层：localStorage 存储 + 类型色卡 ============ */
'use strict';

const DB_KEY = 'orbit-schedule-v1';

/* 高级色卡：按日程类型匹配色调 */
const TYPES = [
  { id: 'work',    name: '工作', color: '#5B7C99' },
  { id: 'life',    name: '生活', color: '#7A9B6E' },
  { id: 'study',   name: '学习', color: '#C99B5B' },
  { id: 'health',  name: '健康', color: '#C97B84' },
  { id: 'social',  name: '社交', color: '#8E7CC3' },
  { id: 'finance', name: '财务', color: '#5B9BA6' },
  { id: 'other',   name: '其他', color: '#9A948A' },
];
const TYPE_MAP = Object.fromEntries(TYPES.map(t => [t.id, t]));

/* ---------- 工具 ---------- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => fmtDate(new Date());
const CN_WEEK = ['日', '一', '二', '三', '四', '五', '六'];
function weekdayCN(ds) { return CN_WEEK[new Date(ds + 'T00:00:00').getDay()]; }
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------- 存储 ---------- */
const store = {
  data: {
    schedules: [],
    settings: { geminiKey: '', model: 'gemini-2.5-flash', notify: true, sound: true },
  },
  load() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        this.data = {
          schedules: Array.isArray(d.schedules) ? d.schedules : [],
          settings: { ...this.data.settings, ...(d.settings || {}) },
        };
      }
    } catch (e) { /* 数据损坏时从空开始 */ }
  },
  save() { localStorage.setItem(DB_KEY, JSON.stringify(this.data)); },

  add(s) {
    const it = {
      id: uid(), title: '', date: todayStr(), time: '', type: 'other',
      color: '', notes: '', done: false, reminderMin: 0, notified: false,
      createdAt: Date.now(), ...s,
    };
    this.data.schedules.push(it);
    this.save();
    return it;
  },
  update(id, patch) {
    const s = this.get(id);
    if (!s) return;
    if ('date' in patch || 'time' in patch || 'reminderMin' in patch) patch.notified = false;
    Object.assign(s, patch);
    this.save();
  },
  remove(id) {
    this.data.schedules = this.data.schedules.filter(s => s.id !== id);
    this.save();
  },
  get(id) { return this.data.schedules.find(s => s.id === id); },
  byDate(d) {
    return this.data.schedules
      .filter(s => s.date === d)
      .sort((a, b) => (a.time || '99') < (b.time || '99') ? -1 : 1);
  },
  all() {
    return [...this.data.schedules].sort((a, b) =>
      (a.date + (a.time || '')) < (b.date + (b.time || '')) ? -1 : 1);
  },
  colorOf(s) { return s.color || (TYPE_MAP[s.type] || TYPE_MAP.other).color; },
};
