/* ============ 主程序：圆盘 + 路由 + 全部视图 ============ */
'use strict';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

/* ---------- 路由 ---------- */
const RENDER = {};           // viewId -> render(param)
let currentView = 'disc';
let currentParam = null;

function go(id, param) {
  if (id === currentView) { RENDER[id] && RENDER[id](param); return; }
  const from = $('#view-' + currentView), to = $('#view-' + id);
  currentParam = param ?? null;
  if (RENDER[id]) RENDER[id](currentParam);
  from.classList.remove('active');
  to.classList.add('active');
  currentView = id;
}
function rerender() { RENDER[currentView] && RENDER[currentView](currentParam); }

/* ============================================================
 * 圆盘
 * ============================================================ */
const CX = 260, CY = 260;
const MENU_RINGS = [
  { inner: 64, outer: 126, dur: 170, dir: 'cw', size: 'lg', items: [
    { v: 'today', label: '日程', sub: '今日安排', color: '#C99B5B', tint: '#F7EFE1' },
    { v: 'add',   label: '添加', sub: '新建日程', color: '#5B7C99', tint: '#E9EFF4' },
  ]},
  { inner: 134, outer: 194, dur: 230, dir: 'ccw', size: 'md', items: [
    { v: 'month',    label: '月历',   sub: '月度视图', color: '#7A9B6E', tint: '#EDF3E9' },
    { v: 'year',     label: '日历',   sub: '任意日期', color: '#C97B84', tint: '#F8ECEE' },
    { v: 'timeline', label: '日程线', sub: '时间轴',   color: '#8E7CC3', tint: '#F0ECF8' },
    { v: 'stats',    label: '分析',   sub: '统计整理', color: '#5B9BA6', tint: '#E8F2F4' },
  ]},
  { inner: 202, outer: 242, dur: 300, dir: 'cw', size: 'sm', items: [
    { v: 'ai',       label: 'AI 助手', sub: '', color: '#B08CC0', tint: '#F4EDF7' },
    { v: 'settings', label: '设置',    sub: '', color: '#9A948A', tint: '#F1EFEA' },
  ]},
];
const LABEL_STYLE = {
  lg: { icoR: 14, icoY: -10, charY: -5.5, labY: 23, subY: 38 },
  md: { icoR: 12, icoY: -9,  charY: -4.5, labY: 21, subY: 35 },
  sm: { icoR: 8,  icoY: -6,  charY: -2.8, labY: 15, subY: null },
};

function polar(r, aDeg) {
  const a = (aDeg - 90) * Math.PI / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}
function annular(r0, r1, a0, a1) {
  const [x0, y0] = polar(r1, a0), [x1, y1] = polar(r1, a1);
  const [x2, y2] = polar(r0, a1), [x3, y3] = polar(r0, a0);
  const large = (a1 - a0) > 180 ? 1 : 0;
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r1} ${r1} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}` +
         `L${x2.toFixed(2)} ${y2.toFixed(2)}A${r0} ${r0} 0 ${large} 0 ${x3.toFixed(2)} ${y3.toFixed(2)}Z`;
}

function renderDisc() {
  const t = new Date();
  $('#disc-date').textContent =
    `${t.getFullYear()} 年 ${t.getMonth() + 1} 月 ${t.getDate()} 日 · 周${CN_WEEK[t.getDay()]}`;

  let html = '';
  // 外圈刻度（静止）
  for (let i = 0; i < 60; i++) {
    const a = i * 6, major = i % 5 === 0;
    const [x0, y0] = polar(247, a), [x1, y1] = polar(major ? 254 : 251, a);
    html += `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}"` +
            ` stroke="${major ? '#D4CFC4' : '#E7E3DA'}" stroke-width="${major ? 1.6 : 1}"/>`;
  }

  // 三层圆环
  MENU_RINGS.forEach(ring => {
    const span = 360 / ring.items.length, gap = 1.2;
    const st = LABEL_STYLE[ring.size];
    html += `<g class="spin-${ring.dir}" style="--dur:${ring.dur}s">`;
    ring.items.forEach((it, idx) => {
      const a0 = idx * span + gap, a1 = (idx + 1) * span - gap;
      const mid = (a0 + a1) / 2, rMid = (ring.inner + ring.outer) / 2;
      const rev = ring.dir === 'cw' ? 'spin-cw-rev' : 'spin-ccw-rev';
      html += `<g class="sector size-${ring.size}" data-view="${it.v}">` +
        `<path d="${annular(ring.inner + 2, ring.outer - 2, a0, a1)}" style="--tint:${it.tint}"/>` +
        `<g transform="rotate(${mid} ${CX} ${CY})"><g transform="translate(${CX} ${CY - rMid})">` +
          `<g class="${rev}" style="--dur:${ring.dur}s"><g transform="rotate(${-mid})">` +
            `<circle cy="${st.icoY}" r="${st.icoR}" fill="${it.color}"/>` +
            `<text class="ico-char" y="${st.charY}">${it.label[0]}</text>` +
            `<text class="lab" y="${st.labY}">${it.label}</text>` +
            (st.subY ? `<text class="sub" y="${st.subY}">${it.sub}</text>` : '') +
          `</g></g>` +
        `</g></g></g>`;
    });
    html += '</g>';
  });

  // 中心轮毂（静止，点击进今日）
  const todayCount = store.byDate(todayStr()).length;
  html += `<circle class="hub-circle" cx="${CX}" cy="${CY}" r="56"/>` +
    `<circle class="hub-ring" cx="${CX}" cy="${CY}" r="48"/>` +
    `<text class="hub-title" x="${CX}" y="${CY - 8}">日程</text>` +
    `<text class="hub-date" x="${CX}" y="${CY + 12}">${t.getMonth() + 1}月${t.getDate()}日 周${CN_WEEK[t.getDay()]}</text>` +
    `<text class="hub-count" x="${CX}" y="${CY + 30}">今日 ${todayCount} 项</text>` +
    `<circle class="hub-hit" cx="${CX}" cy="${CY}" r="56" data-view="today"/>`;

  $('#disc-svg').innerHTML = html;
}
RENDER.disc = renderDisc;

/* ============================================================
 * 通用：日程条目 / 弹层 / 表单
 * ============================================================ */
function scheduleItemHTML(s, opts = {}) {
  const c = store.colorOf(s);
  const t = TYPE_MAP[s.type] || TYPE_MAP.other;
  const remind = s.reminderMin > 0 ? `提前${s.reminderMin}分钟提醒`
    : (s.reminderMin === 0 && s.time ? '准时提醒' : '');
  return `<div class="item ${s.done ? 'done' : ''}" data-id="${s.id}">
    <div class="time">${s.time || '全天'}</div>
    <div class="bar" style="background:${c}"></div>
    <div class="main">
      <div class="title">${esc(s.title)}</div>
      <div class="meta">
        <span class="chip" style="--c:${c};--tint:${c}1A">${t.name}</span>
        ${opts.showDate ? `<span>${s.date.slice(5).replace('-', '月')}日 周${weekdayCN(s.date)}</span>` : ''}
        ${remind ? `<span>${remind}</span>` : ''}
        ${s.notes ? `<span>${esc(s.notes)}</span>` : ''}
      </div>
    </div>
    <button class="check ${s.done ? 'on' : ''}" data-check style="--c:${c}">${s.done ? '✓' : ''}</button>
  </div>`;
}

function bindItemList(container) {
  container.addEventListener('click', e => {
    const item = e.target.closest('.item');
    if (!item) return;
    const id = item.dataset.id;
    if (e.target.closest('[data-check]')) {
      const s = store.get(id);
      store.update(id, { done: !s.done });
      rerender();
    } else {
      openEdit(id);
    }
  });
}

/* ---------- 弹层 ---------- */
function openModal(title, bodyHTML) {
  $('#modal-root').innerHTML = `<div class="overlay"><div class="modal">
    <div class="modal-head"><h3>${title}</h3><button class="x-btn" data-close>✕</button></div>
    ${bodyHTML}</div></div>`;
  const overlay = $('#modal-root .overlay');
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.closest('[data-close]')) closeModal();
  });
}
function closeModal() { $('#modal-root').innerHTML = ''; }

/* ---------- 表单（添加 / 编辑共用） ---------- */
function formHTML(s = {}) {
  const type = s.type || 'work';
  const customColor = !!s.color;
  return `<div data-form ${customColor ? 'data-custom="1"' : ''}>
    <div class="field"><label>日程标题</label>
      <input class="input" name="title" placeholder="要做什么？" value="${esc(s.title || '')}" maxlength="60"></div>
    <div class="grid2">
      <div class="field"><label>日期</label>
        <input class="input" type="date" name="date" value="${s.date || todayStr()}"></div>
      <div class="field"><label>时间（留空为全天）</label>
        <input class="input" type="time" name="time" value="${s.time || ''}"></div>
    </div>
    <div class="field"><label>类型色卡</label>
      <div class="swatches">${TYPES.map(t =>
        `<div class="swatch ${t.id === type && !customColor ? 'on' : ''}" data-type="${t.id}" style="--c:${t.color}">
           <div class="dot"></div><span>${t.name}</span></div>`).join('')}
      </div></div>
    <div class="field"><label>自定义颜色（可选）</label>
      <div class="color-row">
        <input type="color" name="color" value="${s.color || '#5B7C99'}">
        <button type="button" class="btn ghost sm" data-clear-color ${customColor ? '' : 'hidden'}>清除自定义</button>
      </div></div>
    <div class="field"><label>系统提醒</label>
      <select class="input" name="reminderMin">
        ${[[-1, '不提醒'], [0, '准时提醒'], [5, '提前 5 分钟'], [15, '提前 15 分钟'], [30, '提前 30 分钟'], [60, '提前 1 小时']]
          .map(([v, l]) => `<option value="${v}" ${(s.reminderMin ?? 0) == v ? 'selected' : ''}>${l}</option>`).join('')}
      </select></div>
    <div class="field"><label>备注</label>
      <textarea class="input" name="notes" rows="2" placeholder="补充说明（可选）">${esc(s.notes || '')}</textarea></div>
    <button type="button" class="btn primary block" data-save>${s.id ? '保存修改' : '添加到日程'}</button>
    ${s.id ? '<button type="button" class="btn danger block" data-del style="margin-top:10px">删除此日程</button>' : ''}
  </div>`;
}

function bindForm(root, { onSave, onDelete }) {
  root.querySelectorAll('.swatch').forEach(sw => sw.addEventListener('click', () => {
    root.querySelectorAll('.swatch').forEach(x => x.classList.remove('on'));
    sw.classList.add('on');
    root.dataset.custom = '';
    root.querySelector('[data-clear-color]').hidden = true;
  }));
  const colorInput = root.querySelector('[name=color]');
  colorInput.addEventListener('input', () => {
    root.dataset.custom = '1';
    root.querySelector('[data-clear-color]').hidden = false;
    root.querySelectorAll('.swatch').forEach(x => x.classList.remove('on'));
  });
  root.querySelector('[data-clear-color]').addEventListener('click', () => {
    root.dataset.custom = '';
    root.querySelector('[data-clear-color]').hidden = true;
    (root.querySelector('.swatch') || {}).classList?.add('on');
  });
  root.querySelector('[data-save]').addEventListener('click', () => {
    const g = n => root.querySelector(`[name=${n}]`);
    const title = g('title').value.trim();
    if (!title) { toast('请填写日程标题'); return; }
    onSave({
      title,
      date: g('date').value || todayStr(),
      time: g('time').value,
      type: root.querySelector('.swatch.on')?.dataset.type || 'other',
      color: root.dataset.custom ? colorInput.value : '',
      reminderMin: +g('reminderMin').value,
      notes: g('notes').value.trim(),
    });
  });
  const delBtn = root.querySelector('[data-del]');
  if (delBtn) delBtn.addEventListener('click', onDelete);
}

/* ---------- 编辑弹窗 ---------- */
let editReturn = null;   // 编辑完成后要回到的日期面板
function openEdit(id, returnTo = null) {
  const s = store.get(id);
  if (!s) return;
  editReturn = returnTo;
  openModal('编辑日程', formHTML(s));
  const root = $('#modal-root [data-form]');
  bindForm(root, {
    onSave(vals) {
      store.update(id, vals);
      closeModal();
      toast('已保存');
      afterEdit(s.date);
    },
    onDelete() {
      if (!confirm('确定删除这条日程吗？')) return;
      store.remove(id);
      closeModal();
      toast('已删除');
      afterEdit(s.date);
    },
  });
}
function afterEdit(dateStr) {
  rerender();
  if (editReturn) openDaySheet(editReturn);
  editReturn = null;
}

/* ---------- 某日弹层 ---------- */
let sheetDate = null;
function openDaySheet(ds) {
  sheetDate = ds;
  const list = store.byDate(ds);
  const d = new Date(ds + 'T00:00:00');
  openModal(`${d.getMonth() + 1} 月 ${d.getDate()} 日 · 周${CN_WEEK[d.getDay()]}`, `
    <div id="sheet-list">${list.length
      ? list.map(s => scheduleItemHTML(s)).join('')
      : '<div class="empty">这一天还没有日程</div>'}</div>
    <button class="btn primary block" id="sheet-add" style="margin-top:6px">＋ 在这一天添加</button>`);
  $('#sheet-list').addEventListener('click', e => {
    const item = e.target.closest('.item');
    if (!item) return;
    const id = item.dataset.id;
    if (e.target.closest('[data-check]')) {
      const s = store.get(id);
      store.update(id, { done: !s.done });
      rerender();
      openDaySheet(ds);
    } else {
      openEdit(id, ds);
    }
  });
  $('#sheet-add').addEventListener('click', () => {
    closeModal();
    go('add', { date: ds });
  });
}

/* ============================================================
 * 视图：日程（单日）
 * ============================================================ */
let todayCursor = todayStr();
function renderToday() {
  const d = new Date(todayCursor + 'T00:00:00');
  $('#today-date').textContent = `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  $('#today-week').textContent =
    `${d.getFullYear()} 年 · 周${CN_WEEK[d.getDay()]}` + (todayCursor === todayStr() ? ' · 今天' : '');
  const list = store.byDate(todayCursor);
  const done = list.filter(s => s.done).length;
  $('#today-progress').style.width = list.length ? (done / list.length * 100) + '%' : '0%';
  $('#today-list').innerHTML = list.length
    ? list.map(s => scheduleItemHTML(s)).join('')
    : '<div class="empty">这一天还没有日程<br>点击右下角 ＋ 添加一条吧</div>';
}
RENDER.today = renderToday;

/* ============================================================
 * 视图：添加
 * ============================================================ */
function renderAdd(param) {
  const host = $('#add-form-host');
  host.innerHTML = formHTML({ date: param?.date || todayStr() });
  bindForm(host.querySelector('[data-form]'), {
    onSave(vals) {
      store.add(vals);
      toast('已添加日程');
      renderAdd({ date: vals.date });   // 清空表单，保留日期便于连续添加
    },
  });
}
RENDER.add = renderAdd;

/* ============================================================
 * 视图：月历
 * ============================================================ */
let monthCursor = { y: new Date().getFullYear(), m: new Date().getMonth() };
function renderMonth() {
  const { y, m } = monthCursor;
  $('#month-title').textContent = `${y} 年 ${m + 1} 月`;
  const firstWeek = (new Date(y, m, 1).getDay() + 6) % 7;   // 周一为 0
  const days = new Date(y, m + 1, 0).getDate();
  const today = todayStr();
  let html = '';
  for (let i = 0; i < firstWeek; i++) html += '<div class="mcell blank"></div>';
  for (let d = 1; d <= days; d++) {
    const ds = `${y}-${pad(m + 1)}-${pad(d)}`;
    const items = store.byDate(ds);
    const dots = items.slice(0, 4).map(s =>
      `<i style="--c:${store.colorOf(s)}"></i>`).join('');
    html += `<div class="mcell ${ds === today ? 'today' : ''} ${items.length ? 'has' : ''}" data-date="${ds}">
      <span>${d}</span><span class="dots">${dots}</span></div>`;
  }
  $('#month-grid').innerHTML = html;
}
RENDER.month = renderMonth;

/* ============================================================
 * 视图：日历（年视图）
 * ============================================================ */
let yearCursor = new Date().getFullYear();
function renderYear() {
  $('#year-title').textContent = `${yearCursor} 年`;
  const today = todayStr();
  let html = '';
  for (let m = 0; m < 12; m++) {
    const firstWeek = (new Date(yearCursor, m, 1).getDay() + 6) % 7;
    const days = new Date(yearCursor, m + 1, 0).getDate();
    let cells = '';
    for (let i = 0; i < firstWeek; i++) cells += '<i></i>';
    for (let d = 1; d <= days; d++) {
      const ds = `${yearCursor}-${pad(m + 1)}-${pad(d)}`;
      const has = store.data.schedules.some(s => s.date === ds);
      cells += `<b class="${has ? 'has' : ''} ${ds === today ? 'today' : ''}" data-date="${ds}">${d}</b>`;
    }
    html += `<div class="ymonth"><h4 data-month="${m}">${m + 1} 月</h4><div class="mini">${cells}</div></div>`;
  }
  $('#year-grid').innerHTML = html;
}
RENDER.year = renderYear;

/* ============================================================
 * 视图：日程线
 * ============================================================ */
function relLabel(ds) {
  const diff = Math.round((new Date(ds + 'T00:00:00') - new Date(todayStr() + 'T00:00:00')) / 86400000);
  if (diff === 0) return '今天';
  if (diff === 1) return '明天';
  if (diff === -1) return '昨天';
  if (diff > 1) return `${diff} 天后`;
  return `${-diff} 天前`;
}
function renderTimeline() {
  const all = store.all();
  const body = $('#timeline-body');
  if (!all.length) {
    body.innerHTML = '<div class="empty">还没有任何日程</div>';
    return;
  }
  const today = todayStr();
  const groups = {};
  all.forEach(s => (groups[s.date] = groups[s.date] || []).push(s));
  body.innerHTML = Object.keys(groups).sort().map(ds => {
    const d = new Date(ds + 'T00:00:00');
    const past = ds < today;
    return `<div class="tl-group" data-date="${ds}">
      <div class="tl-date">${d.getMonth() + 1}月${d.getDate()}日 周${CN_WEEK[d.getDay()]}
        <span class="rel">${relLabel(ds)}</span></div>
      <div class="tl-items">${groups[ds].map(s => {
        const c = store.colorOf(s);
        return `<div class="tl-item ${past ? 'past' : ''} ${s.done ? 'done' : ''}" data-id="${s.id}" style="--c:${c}">
          <div class="t-head"><span class="t-time">${s.time || '全天'}</span>
            <span class="t-title">${esc(s.title)}</span>
            <span class="chip" style="--c:${c};--tint:${c}1A">${(TYPE_MAP[s.type] || TYPE_MAP.other).name}</span></div>
          ${s.notes ? `<div class="t-note">${esc(s.notes)}</div>` : ''}
        </div>`;
      }).join('')}</div></div>`;
  }).join('');
  // 滚动到今天（或最近的未来）
  requestAnimationFrame(() => {
    const el = body.querySelector(`[data-date="${today}"]`) ||
      [...body.querySelectorAll('.tl-group')].find(g => g.dataset.date >= today);
    if (el) el.scrollIntoView({ block: 'start' });
  });
}
RENDER.timeline = renderTimeline;

/* ============================================================
 * 视图：分析
 * ============================================================ */
function renderStats() {
  const all = store.data.schedules;
  const body = $('#stats-body');
  if (!all.length) {
    body.innerHTML = '<div class="empty">还没有数据可以分析<br>先去添加几条日程吧</div>';
    return;
  }
  const done = all.filter(s => s.done).length;
  const rate = Math.round(done / all.length * 100);
  const todayCount = store.byDate(todayStr()).length;

  // 类型分布
  const byType = {};
  all.forEach(s => byType[s.type] = (byType[s.type] || 0) + 1);
  const entries = TYPES.filter(t => byType[t.id]).map(t => ({ ...t, n: byType[t.id] }));
  let offset = 0;
  const donutSegs = entries.map(e => {
    const pct = e.n / all.length * 100;
    const seg = `<circle cx="21" cy="21" r="15.9155" stroke="${e.color}"
      stroke-dasharray="${pct.toFixed(2)} ${(100 - pct).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}"/>`;
    offset += pct;
    return seg;
  }).join('');

  // 最近 7 天
  const days7 = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    return { ds: fmtDate(d), n: store.byDate(fmtDate(d)).length, w: CN_WEEK[d.getDay()] };
  });
  const max7 = Math.max(...days7.map(d => d.n), 1);

  // 最繁忙的一天
  const byDateCnt = {};
  all.forEach(s => byDateCnt[s.date] = (byDateCnt[s.date] || 0) + 1);
  const busiest = Object.entries(byDateCnt).sort((a, b) => b[1] - a[1])[0];
  const bd = new Date(busiest[0] + 'T00:00:00');

  body.innerHTML = `
    <div class="stat-cards">
      <div class="stat-card"><b>${all.length}</b><span>总日程</span></div>
      <div class="stat-card"><b>${done}</b><span>已完成</span></div>
      <div class="stat-card"><b>${rate}%</b><span>完成率</span></div>
      <div class="stat-card"><b>${todayCount}</b><span>今日安排</span></div>
    </div>
    <div class="panel"><h3>类型分布</h3>
      <div class="donut-wrap">
        <svg class="donut" viewBox="0 0 42 42">
          <circle cx="21" cy="21" r="15.9155" stroke="#F0EDE6"/>
          ${donutSegs}
        </svg>
        <div class="legend">${entries.map(e =>
          `<div class="lrow"><i style="--c:${e.color}"></i>${e.name}
            <span class="pct">${e.n} 项 · ${Math.round(e.n / all.length * 100)}%</span></div>`).join('')}
        </div>
      </div></div>
    <div class="panel"><h3>最近 7 天</h3>
      <div class="bars">${days7.map(d =>
        `<div class="col ${d.ds === todayStr() ? 'today' : ''}">
           <span class="n">${d.n || ''}</span>
           <div class="bar" style="height:${d.n / max7 * 78 + (d.n ? 10 : 2)}px"></div>
           <span class="d">${d.ds === todayStr() ? '今' : d.w}</span></div>`).join('')}
      </div></div>
    <div class="panel"><h3>最繁忙的一天</h3>
      <p style="font-size:14px">${bd.getMonth() + 1}月${bd.getDate()}日（周${CN_WEEK[bd.getDay()]}），共 ${busiest[1]} 项日程</p></div>`;
}
RENDER.stats = renderStats;

/* ============================================================
 * 视图：AI 助手
 * ============================================================ */
let aiResults = [];
function renderAI() {
  const st = store.data.settings;
  $('#ai-status').innerHTML = st.geminiKey
    ? `已连接 Gemini（模型：${esc(st.model || 'gemini-2.5-flash')}），将使用 AI 智能解析。`
    : `未配置 Gemini Key，当前使用内置本地解析。<br>在「圆盘 → 设置」中填入 Key 可获得更智能的解析。`;
}
function renderAIResults() {
  const host = $('#ai-results');
  if (!aiResults.length) { host.innerHTML = ''; return; }
  host.innerHTML = aiResults.map((r, i) => `
    <div class="ai-item" data-i="${i}">
      <div class="row1">
        <input class="mini-input" name="title" value="${esc(r.title)}" placeholder="标题">
        <button class="ai-del" data-del="${i}">删</button>
      </div>
      <div class="row2">
        <input class="mini-input" type="date" name="date" value="${r.date}">
        <input class="mini-input" type="time" name="time" value="${r.time}">
        <select class="mini-input" name="type">${TYPES.map(t =>
          `<option value="${t.id}" ${t.id === r.type ? 'selected' : ''}>${t.name}</option>`).join('')}
        </select>
      </div>
    </div>`).join('') +
    `<button class="btn primary block" id="ai-save-all">全部保存（${aiResults.length} 项）</button>`;
}
RENDER.ai = renderAI;

/* ============================================================
 * 视图：设置
 * ============================================================ */
function renderSettings() {
  const st = store.data.settings;
  $('#set-key').value = st.geminiKey;
  $('#set-model').value = st.model;
  $('#set-notify').checked = st.notify;
  $('#set-sound').checked = st.sound;
}
RENDER.settings = renderSettings;

function doExport() {
  const json = JSON.stringify(store.data, null, 2);
  // APK 环境：WebView 不支持 blob 下载，走原生桥写入「下载」目录
  if (window.AndroidBridge && AndroidBridge.saveFile) {
    AndroidBridge.saveFile(`日程备份-${todayStr()}.json`,
      btoa(unescape(encodeURIComponent(json))));
    toast('已导出到系统「下载」目录');
    return;
  }
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `日程备份-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('已导出备份文件');
}
function doImport(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const d = JSON.parse(reader.result);
      const list = Array.isArray(d) ? d : d.schedules;
      if (!Array.isArray(list)) throw 0;
      const ids = new Set(store.data.schedules.map(s => s.id));
      let n = 0;
      list.forEach(s => {
        if (!s || !s.title) return;
        const it = { ...s, id: ids.has(s.id) ? uid() : (s.id || uid()) };
        delete it.notified;
        store.data.schedules.push({ notified: false, ...it });
        n++;
      });
      if (d.settings) store.data.settings = { ...store.data.settings, ...d.settings };
      store.save();
      toast(`已导入 ${n} 条日程`);
      renderSettings();
    } catch (e) { toast('文件格式不正确，导入失败'); }
  };
  reader.readAsText(file);
}

/* ============================================================
 * 事件绑定 + 初始化
 * ============================================================ */
function bindAll() {
  // 圆盘点击
  $('#disc-svg').addEventListener('click', e => {
    const g = e.target.closest('[data-view]');
    if (g) go(g.dataset.view);
  });
  // 返回圆盘
  $$('[data-back]').forEach(b => b.addEventListener('click', () => go('disc')));

  // 日程页
  $('#today-prev').addEventListener('click', () => {
    const d = new Date(todayCursor + 'T00:00:00'); d.setDate(d.getDate() - 1);
    todayCursor = fmtDate(d); renderToday();
  });
  $('#today-next').addEventListener('click', () => {
    const d = new Date(todayCursor + 'T00:00:00'); d.setDate(d.getDate() + 1);
    todayCursor = fmtDate(d); renderToday();
  });
  $('#today-jump').addEventListener('click', () => { todayCursor = todayStr(); renderToday(); });
  $('#today-add').addEventListener('click', () => go('add', { date: todayCursor }));
  bindItemList($('#today-list'));

  // 添加页
  $('#add-goto-ai').addEventListener('click', () => go('ai'));

  // 月历
  $('#month-prev').addEventListener('click', () => {
    monthCursor.m--; if (monthCursor.m < 0) { monthCursor.m = 11; monthCursor.y--; } renderMonth();
  });
  $('#month-next').addEventListener('click', () => {
    monthCursor.m++; if (monthCursor.m > 11) { monthCursor.m = 0; monthCursor.y++; } renderMonth();
  });
  $('#month-today').addEventListener('click', () => {
    monthCursor = { y: new Date().getFullYear(), m: new Date().getMonth() }; renderMonth();
  });
  $('#month-grid').addEventListener('click', e => {
    const cell = e.target.closest('.mcell[data-date]');
    if (cell) openDaySheet(cell.dataset.date);
  });

  // 年历
  $('#year-prev').addEventListener('click', () => { yearCursor--; renderYear(); });
  $('#year-next').addEventListener('click', () => { yearCursor++; renderYear(); });
  $('#year-grid').addEventListener('click', e => {
    const b = e.target.closest('b[data-date]');
    if (b) { openDaySheet(b.dataset.date); return; }
    const h = e.target.closest('h4[data-month]');
    if (h) { monthCursor = { y: yearCursor, m: +h.dataset.month }; go('month'); }
  });
  $('#year-jump-btn').addEventListener('click', () => {
    const v = $('#year-jump').value;
    if (v) openDaySheet(v);
  });

  // 日程线
  $('#timeline-body').addEventListener('click', e => {
    const it = e.target.closest('.tl-item');
    if (it) openEdit(it.dataset.id);
  });

  // AI
  $('#ai-example').addEventListener('click', () => {
    $('#ai-input').value = '今天有 3 个日程，分别是下午 3 点开产品会、晚上 7 点健身、明天上午 10 点看牙医';
  });
  $('#ai-parse').addEventListener('click', async () => {
    const text = $('#ai-input').value.trim();
    if (!text) { toast('请先输入一句话'); return; }
    const btn = $('#ai-parse');
    btn.disabled = true; btn.textContent = '解析中…';
    try {
      const { list, engine, error } = await smartParse(text);
      if (error) toast(`Gemini 不可用，已改用本地解析（${error}）`);
      if (!list.length) { toast('没有解析出日程，换个说法试试'); return; }
      aiResults = list;
      renderAIResults();
      toast(`解析出 ${list.length} 条日程（${engine === 'gemini' ? 'Gemini' : '本地'}）`);
    } catch (e) {
      toast('解析失败：' + e.message);
    } finally {
      btn.disabled = false; btn.textContent = '智能解析';
    }
  });
  $('#ai-results').addEventListener('input', e => {
    const item = e.target.closest('.ai-item');
    if (!item) return;
    const i = +item.dataset.i, name = e.target.name;
    if (name && aiResults[i]) aiResults[i][name] = e.target.value;
  });
  $('#ai-results').addEventListener('click', e => {
    const del = e.target.closest('[data-del]');
    if (del) {
      aiResults.splice(+del.dataset.del, 1);
      renderAIResults();
      return;
    }
    if (e.target.id === 'ai-save-all') {
      const valid = aiResults.filter(r => r.title.trim());
      valid.forEach(r => store.add({ ...r, title: r.title.trim() }));
      toast(`已保存 ${valid.length} 条日程`);
      aiResults = [];
      renderAIResults();
      $('#ai-input').value = '';
    }
  });

  // 设置
  $('#set-save-ai').addEventListener('click', () => {
    store.data.settings.geminiKey = $('#set-key').value.trim();
    store.data.settings.model = $('#set-model').value.trim() || 'gemini-2.5-flash';
    store.save();
    toast('AI 设置已保存');
  });
  $('#set-notify').addEventListener('change', async e => {
    if (e.target.checked) {
      const ok = await Reminder.ensurePermission();
      if (!ok) toast('未获得通知权限，将仅在页面内提醒');
    }
    store.data.settings.notify = e.target.checked;
    store.save();
  });
  $('#set-sound').addEventListener('change', e => {
    store.data.settings.sound = e.target.checked;
    store.save();
  });
  $('#set-test').addEventListener('click', async () => {
    Reminder.chime();
    toast('提醒：这是一条测试提醒');
    if (store.data.settings.notify && await Reminder.ensurePermission()) {
      try { new Notification('日程提醒', { body: '这是一条测试提醒' }); } catch (e) {}
    }
  });
  $('#btn-export').addEventListener('click', doExport);
  $('#btn-import').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', e => {
    if (e.target.files[0]) doImport(e.target.files[0]);
    e.target.value = '';
  });
  $('#btn-clear').addEventListener('click', () => {
    if (!confirm('确定清空全部日程吗？此操作不可恢复。')) return;
    if (!confirm('请再次确认：清空后只能通过备份文件恢复。')) return;
    store.data.schedules = [];
    store.save();
    toast('已清空全部日程');
  });
}

/* ---------- 启动 ---------- */
store.load();
renderDisc();
bindAll();
Reminder.init();
