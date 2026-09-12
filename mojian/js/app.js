/* ============================================================
   墨笺 · Mojian — flomo 风格卡片笔记
   纯 vanilla JS，无依赖，数据存于 localStorage
   ============================================================ */
'use strict';

/* ---------------- utils ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const esc = s => String(s).replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const uid = () => (crypto.randomUUID
  ? crypto.randomUUID()
  : 'n-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8));

const pad2 = n => String(n).padStart(2, '0');
const dateKey = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const startOfDay = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

const fmtTime = ts => { const d = new Date(ts); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const fmtDateFull = ts => {
  const d = new Date(ts);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${fmtTime(ts)}`;
};
const relTime = ts => {
  const diff = Date.now() - ts;
  const m = 6e4, h = 36e5, d = 864e5;
  if (diff < m) return '刚刚';
  if (diff < h) return Math.floor(diff / m) + ' 分钟前';
  if (diff < d) return Math.floor(diff / h) + ' 小时前';
  if (diff < 30 * d) return Math.floor(diff / d) + ' 天前';
  if (diff < 365 * d) return Math.floor(diff / (30 * d)) + ' 个月前';
  return Math.floor(diff / (365 * d)) + ' 年前';
};

const autoGrow = t => { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 480) + 'px'; };

function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

/* ---------------- icons (lucide style) ---------------- */
const P = {
  feather: '<path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  pen: '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>',
  hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  shuffle: '<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  pin: '<path d="M12 17v5"/><path class="fillable" d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  menu: '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  quote: '<path fill="currentColor" stroke="none" d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path fill="currentColor" stroke="none" d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
};

const icon = name =>
  `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;

/* ---------------- tags ---------------- */
const TAG_SRC = '#([\\p{L}\\p{N}/_-]+)';
const tagRe = () => new RegExp(TAG_SRC, 'gu');

function extractTags(s) {
  const set = new Set();
  for (const m of String(s).matchAll(tagRe())) set.add(m[1]);
  return [...set];
}

function allTags() {
  const map = new Map();
  for (const n of notes) for (const t of n.tags) map.set(t, (map.get(t) || 0) + 1);
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh'));
}

const matchesTag = (n, tag) => n.tags.some(t => t === tag || t.startsWith(tag + '/'));
const notesForTag = tag => notes.filter(n => matchesTag(n, tag));

/* ---------------- storage & seed ---------------- */
const NOTES_KEY = 'mojian.notes.v1';
const SETTINGS_KEY = 'mojian.settings.v1';

function loadNotes() {
  try {
    const raw = lsGet(NOTES_KEY);
    if (!raw) return null;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.length ? arr : null;
  } catch (e) { return null; }
}
const saveNotes = () => lsSet(NOTES_KEY, JSON.stringify(notes));
const sortNotes = () => notes.sort((a, b) => b.createdAt - a.createdAt);

/* 示例数据: [daysAgo, hour, minute, content, pinned] */
const SEED = [
  [0, 8, 2, "欢迎使用墨笺。这里有几条小贴士：\n· 输入 # 加文字即可添加标签，比如 #灵感，也支持 #工作/周报 这样的多级标签\n· 点击正文或侧栏里的标签，可以快速筛选\n· Ctrl + Enter 快速保存，按 / 快速搜索\n· 所有数据保存在浏览器本地，可在左下角设置中导出备份\n\n试着写下第一条想法吧。#小贴士", 1],
  [0, 9, 41, "把随手记的想法又积攒了一周，回看的时候居然能串成一条线。工具不是关键，「记下来」这个动作本身才是。#随想", 0],
  [0, 21, 40, "地铁上听播客，主播说：写作不是为了表达，是为了思考得更清楚。深有同感，写下来才知道自己想得有多模糊。#灵感", 0],
  [1, 18, 5, "周会复盘：这周最大的问题是需求评审太粗糙，返工率 30%。下周试行「评审前 24 小时先发文档」。#工作/周报", 0],
  [1, 12, 30, "午休出去走了 20 分钟，下午的专注度明显更好。以后把散步直接写进日历。#健康", 0],
  [2, 22, 15, "读完《纳瓦尔宝典》第三章。「把时间花在能产生复利的事情上」——代码、内容、人际关系，都是复利资产。#读书笔记/纳瓦尔宝典", 0],
  [3, 14, 8, "产品灵感：备忘类工具的护城河不是功能，是用户沉淀下来的数据和习惯。迁移成本就是最好的留存。#产品思考", 0],
  [4, 10, 26, "看到一句话：「焦虑的反面是具体」。把担心的事写下来、拆成步骤，焦虑值直接减半。#随想", 0],
  [5, 20, 53, "周末把书房收拾了一遍，扔掉三箱旧物。物理空间的留白，会带来心理空间的留白。#生活", 0],
  [7, 9, 15, "试用了一周双链笔记，最后还是回到卡片流。工具越简单，记录的成本越低，越容易坚持。#随想", 0],
  [9, 11, 20, "晨会要点：Q4 目标拆解到人，两周一个里程碑，风险提前暴露，不要攒到截止日。#工作/周报", 0],
  [10, 15, 44, "灵感：给爸妈做的相册页，按时间轴自动整理，比网盘文件夹直观太多。长辈需要的是「回忆的入口」，不是文件管理器。#产品思考", 0],
  [12, 8, 9, "今日份小确幸：楼下的桂花开了，一路都是甜的。#生活", 0],
  [14, 21, 12, "复盘 8 月：跑步 12 次，读书 2 本，加班偏多。9 月的目标只有一个：23 点前睡觉。#复盘", 0],
  [16, 13, 33, "《卡片笔记写作法》核心观点：笔记的价值在于连接，不在于收藏。收藏只是把信息换了个地方吃灰。#读书笔记", 0],
  [18, 17, 50, "面试了一个候选人，答得不算完美，但每个回答都有自己的框架。框架比答案更稀缺。#工作", 0],
  [21, 19, 5, "把手机主屏重排了一遍，只留第一屏 8 个 App，其余全部收进资源库。注意力果然是最值钱的资产。#随想", 0],
  [24, 10, 2, "灵感：记账 App 最大的问题不是记录麻烦，而是记完没有反馈。行为需要闭环，数据需要叙事。#产品思考", 0],
  [27, 7, 40, "晨跑 5 公里，配速 6'30，比上个月快了 20 秒。保持住。#健康", 0],
  [31, 21, 58, "和多年未见的老友视频了一个小时，聊各自近况。有些关系不常见面，但一直都在。#生活", 0],
  [35, 14, 27, "读书笔记：改变行为的最小单位不是意志力，是环境设计。想少刷手机，就把手机放到另一个房间。#读书笔记", 0],
  [40, 16, 45, "给团队定了一条协作原则：能文字就不要开会，能异步就不要同步。会议是最后的选择，不是默认选项。#工作", 0],
  [55, 8, 20, "重启跑步计划：从每次 2 公里开始，不追求距离，先追求「每天都出门」。#健康", 0],
  [70, 22, 10, "第一次用墨笺写 memo，感觉不错，就当是个树洞。#随想", 0],
  [85, 11, 11, "立个年度目标：写满 300 条 memo，读完 24 本书。年底回来看这条。#复盘", 0],
];

function seedNotes() {
  const now = Date.now();
  return SEED.map(([d, h, m, c, pinned]) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - d);
    dt.setHours(h, m, Math.floor(Math.random() * 60), 0);
    // 种子时间若落在未来(比如今天 21:40 但现在是下午), 回拨到不久前,
    // 保证用户新写的 memo 永远排在「今天」分组最前
    let ts = dt.getTime();
    if (ts > now) ts = now - (3 + Math.floor(Math.random() * 30)) * 6e4;
    return {
      id: uid(), content: c, tags: extractTags(c),
      createdAt: ts, updatedAt: null, pinned: !!pinned,
    };
  }).sort((a, b) => b.createdAt - a.createdAt);
}

let notes = loadNotes();
if (!notes) { notes = seedNotes(); saveNotes(); }

let settings = {};
try { settings = JSON.parse(lsGet(SETTINGS_KEY) || '{}') || {}; } catch (e) { settings = {}; }

/* ---------------- state ---------------- */
const state = { view: 'memo', tag: null, query: '', editingId: null, reviewId: null };
let activeSection = null;
let pendingAnimate = true;

const input = $('#composer-input');
let acState = { open: false, list: [], idx: 0, token: null };

/* ---------------- content rendering ---------------- */
function markText(html, q) {
  if (!q) return html;
  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  return html.replace(re, m => `<mark>${m}</mark>`);
}

function renderContent(n, opts = {}) {
  const q = opts.q || '';
  return String(n.content)
    .split(/(https?:\/\/[^\s，。；、！？）)」』"']+)/g)
    .map(part => {
      if (/^https?:\/\//.test(part)) {
        return `<a class="url-link" href="${esc(part)}" target="_blank" rel="noopener noreferrer">${esc(part)}</a>`;
      }
      let out = '', last = 0;
      for (const m of part.matchAll(tagRe())) {
        out += markText(esc(part.slice(last, m.index)), q);
        out += `<a class="tag-link" data-tag="${esc(m[1])}">#${esc(m[1])}</a>`;
        last = m.index + m[0].length;
      }
      out += markText(esc(part.slice(last)), q);
      return out;
    }).join('');
}

/* ---------------- note card ---------------- */
function noteCardHTML(n, idx = 0, q = '') {
  if (state.editingId === n.id) {
    return `<article class="note-card card editing" data-id="${n.id}">
      <div class="note-edit">
        <textarea class="edit-input" spellcheck="false">${esc(n.content)}</textarea>
        <div class="edit-bar">
          <span class="edit-hint">Ctrl + Enter 保存 · Esc 取消</span>
          <div class="edit-btns">
            <button class="btn-ghost btn-sm" data-act="cancelEdit" type="button">取消</button>
            <button class="btn-primary btn-sm" data-act="saveEdit" type="button">保存</button>
          </div>
        </div>
      </div>
    </article>`;
  }
  const delay = pendingAnimate ? ` style="animation-delay:${Math.min(idx, 12) * 28}ms"` : '';
  const anim = pendingAnimate ? ' anim' : '';
  const pinFlag = n.pinned && state.view !== 'memo' ? `<span class="pin-flag" title="已置顶">${icon('pin')}</span>` : '';
  return `<article class="note-card card${anim}"${delay} data-id="${n.id}">
    <div class="note-content">${renderContent(n, { q })}</div>
    <div class="note-meta">
      <div class="note-time">${fmtTime(n.createdAt)}${n.updatedAt ? '<span class="edited-flag">· 已编辑</span>' : ''}${pinFlag}</div>
      <div class="note-actions">
        <button class="note-act${n.pinned ? ' active' : ''}" data-act="pin" type="button" title="${n.pinned ? '取消置顶' : '置顶'}">${icon('pin')}</button>
        <button class="note-act" data-act="copy" type="button" title="复制全文">${icon('copy')}</button>
        <button class="note-act" data-act="edit" type="button" title="编辑">${icon('pen')}</button>
        <button class="note-act danger" data-act="delete" type="button" title="删除">${icon('trash')}</button>
      </div>
    </div>
  </article>`;
}

/* ---------------- date groups ---------------- */
function dateGroupLabel(d) {
  const now = new Date();
  if (dateKey(d) === dateKey(now)) return '今天';
  if (dateKey(d) === dateKey(new Date(Date.now() - 864e5))) return '昨天';
  if (d.getFullYear() !== now.getFullYear()) return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  return `${d.getMonth() + 1}月${d.getDate()}日 · 周${'日一二三四五六'[d.getDay()]}`;
}

function groupByDate(list) {
  const groups = [];
  const map = new Map();
  for (const n of list) {
    const key = dateKey(new Date(n.createdAt));
    if (!map.has(key)) { const g = { key, label: '', notes: [] }; map.set(key, g); groups.push(g); }
    map.get(key).notes.push(n);
  }
  for (const g of groups) g.label = dateGroupLabel(new Date(g.notes[0].createdAt));
  return groups;
}

function groupsHTML(list) {
  return groupByDate(list).map(g => `
    <section class="date-group">
      <h2 class="date-header">${esc(g.label)}<span class="date-count">${g.notes.length} 条</span></h2>
      ${g.notes.map((n, i) => noteCardHTML(n, i)).join('')}
    </section>`).join('');
}

/* ---------------- empty states ---------------- */
const EMPTY_SVG = `<svg class="empty-art" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="56" y="14" width="92" height="110" rx="10" fill="var(--card-2)" stroke="var(--border-2)" transform="rotate(-7 102 69)"/>
  <rect x="50" y="20" width="94" height="110" rx="10" fill="var(--card)" stroke="var(--border)" transform="rotate(3 97 75)"/>
  <g transform="rotate(-3 100 82)">
    <rect x="44" y="26" width="100" height="114" rx="10" fill="var(--card)" stroke="var(--border)"/>
    <rect x="58" y="44" width="46" height="9" rx="4.5" fill="var(--accent)" opacity=".75"/>
    <rect x="58" y="64" width="72" height="6" rx="3" fill="var(--border-2)"/>
    <rect x="58" y="78" width="58" height="6" rx="3" fill="var(--border-2)"/>
    <rect x="58" y="92" width="66" height="6" rx="3" fill="var(--border-2)"/>
    <rect x="58" y="106" width="38" height="6" rx="3" fill="var(--border-2)"/>
  </g>
  <circle cx="38" cy="30" r="3" fill="var(--accent)" opacity=".5"/>
  <circle cx="166" cy="120" r="4" fill="var(--accent)" opacity=".35"/>
  <circle cx="170" cy="36" r="2.5" fill="var(--accent)" opacity=".6"/>
  <path d="M28 96l3.5 7 7 3.5-7 3.5-3.5 7-3.5-7-7-3.5 7-3.5z" fill="var(--accent)" opacity=".4"/>
</svg>`;

const EMPTY_MAP = {
  'no-notes': { icon: null, title: '从这里开始', desc: '写下第一条 memo，记录此刻的想法。<br>支持 #标签、多级标签与全文搜索。', btn: '开始记录' },
  'tag-empty': { icon: 'hash', title: '这个标签下还没有 memo', desc: '写下一条带这个标签的记录吧。', btn: '去记录' },
  'search-empty': { icon: 'search', title: '没有找到相关内容', desc: '换个关键词，或者试试标签名。', btn: null },
  'review-empty': { icon: 'shuffle', title: '还没有可以回顾的记录', desc: '先写几条 memo，再回来偶遇过去的自己。', btn: '去记录' },
  'stats-empty': { icon: 'chart', title: '还没有统计数据', desc: '记录一些 memo 后，这里会呈现你的足迹。', btn: '去记录' },
};

function emptyStateHTML(kind) {
  const e = EMPTY_MAP[kind];
  const art = e.icon
    ? `<div class="empty-ic">${icon(e.icon)}</div>`
    : EMPTY_SVG;
  return `<div class="empty">${art}<h3>${e.title}</h3><p>${e.desc}</p>${e.btn ? `<button class="btn-outline" data-empty-btn type="button">${e.btn}</button>` : ''}</div>`;
}

/* ---------------- sidebar ---------------- */
function renderSidebar() {
  $('#nav-count-memo').textContent = notes.length;
  const listEl = $('#tag-list');
  const tags = allTags();
  listEl.innerHTML = tags.length
    ? tags.map(({ tag, count }) => `
      <button class="tag-item${state.view === 'tag' && state.tag === tag ? ' active' : ''}" data-tag="${esc(tag)}" type="button" title="#${esc(tag)}">
        <span class="tag-hash">#</span><span class="tag-name">${esc(tag)}</span><span class="nav-count">${count}</span>
      </button>`).join('')
    : `<div class="tags-empty">还没有标签\n在 memo 里输入 #标签 试试</div>`;
  $$('.tag-item', listEl).forEach(b => {
    b.addEventListener('click', () => { openTag(b.dataset.tag); closeDrawer(); });
  });
  $$('#main-nav .nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.view === state.view || (b.dataset.view === 'memo' && state.view === 'tag'));
  });
}

/* ---------------- topbar ---------------- */
function todayLabel() {
  const d = new Date();
  return `${d.getMonth() + 1}月${d.getDate()}日 · 周${'日一二三四五六'[d.getDay()]}`;
}

function renderTopbar() {
  const q = state.query.trim();
  const map = {
    memo: ['我的记录', `${todayLabel()} · ${notes.length} 条 memo`],
    tag: [`# ${state.tag || ''}`, `${notesForTag(state.tag).length} 条 memo`],
    search: ['搜索', q ? `找到 ${searchResults().length} 条` : '输入关键词搜索'],
    review: ['随机回顾', notes.length ? `从 ${notes.length} 条记录里随机抽取` : ''],
    stats: ['统计', '记录的足迹'],
  };
  const [t, s] = map[state.view];
  $('#view-title').textContent = t;
  $('#view-sub').textContent = s;
  $('#btn-exit-tag').style.display = state.view === 'tag' ? 'inline-flex' : 'none';
}

/* ---------------- views ---------------- */
function syncSections() {
  const id = '#view-' + state.view;
  if (activeSection === id) return;
  $$('.view').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  activeSection = id;
  pendingAnimate = true;
}

function renderMemoView() {
  const pinned = notes.filter(n => n.pinned);
  const rest = notes.filter(n => !n.pinned);
  $('#pinned-section').innerHTML = pinned.length ? `
    <section class="date-group">
      <h2 class="date-header pinned-h"><span class="pin-mini">${icon('pin')}</span>置顶<span class="date-count">${pinned.length} 条</span></h2>
      ${pinned.map((n, i) => noteCardHTML(n, i)).join('')}
    </section>` : '';
  $('#timeline').innerHTML = rest.length
    ? groupsHTML(rest)
    : (pinned.length ? '' : emptyStateHTML('no-notes'));
}

function renderTagView() {
  const list = notesForTag(state.tag);
  $('#tag-timeline').innerHTML = list.length ? groupsHTML(list) : emptyStateHTML('tag-empty');
}

function searchResults() {
  const q = state.query.trim().toLowerCase();
  if (!q) return [];
  return notes.filter(n =>
    n.content.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q)));
}

function renderSearchView() {
  const q = state.query.trim();
  $('#btn-search-clear').style.display = q ? 'inline-flex' : 'none';
  const box = $('#search-timeline');
  if (!q) {
    box.innerHTML = `<div class="search-idle">${icon('search')}<div>输入关键词，搜索正文与标签</div><div class="idle-sub">试试「灵感」或「读书」</div></div>`;
    return;
  }
  const list = searchResults();
  box.innerHTML = list.length
    ? list.map((n, i) => noteCardHTML(n, i, q)).join('')
    : emptyStateHTML('search-empty');
}

function renderReviewView() {
  const body = $('#review-body');
  if (!notes.length) { body.innerHTML = emptyStateHTML('review-empty'); return; }
  if (!notes.some(n => n.id === state.reviewId)) {
    state.reviewId = notes[Math.floor(Math.random() * notes.length)].id;
  }
  const n = notes.find(x => x.id === state.reviewId);
  body.innerHTML = `
    <div class="review-quote">${icon('quote')}</div>
    <article class="note-card card review-card" data-id="${n.id}">
      <div class="note-content">${renderContent(n)}</div>
      <div class="review-meta">
        <span>${fmtDateFull(n.createdAt)} · ${relTime(n.createdAt)}</span>
        <span class="review-tags">${n.tags.map(t => `<a class="tag-link" data-tag="${esc(t)}">#${esc(t)}</a>`).join('')}</span>
      </div>
    </article>
    <div class="review-actions">
      <button class="btn-outline" id="btn-next-review" type="button">${icon('shuffle')}换一条</button>
    </div>
    <div class="review-hint">按 <span class="kbd">R</span> 或 <span class="kbd">空格</span> 换一条</div>`;
  $('#btn-next-review').addEventListener('click', nextReview);
}

function nextReview() {
  if (notes.length < 2) { toast('只有一条记录，再多写几条吧'); return; }
  let i;
  do { i = Math.floor(Math.random() * notes.length); } while (notes[i].id === state.reviewId);
  state.reviewId = notes[i].id;
  renderReviewView();
}

/* stats */
function calcStreak(counts, todayK) {
  let s = 0;
  const d = new Date();
  if (!counts.get(todayK)) d.setDate(d.getDate() - 1);
  while (counts.get(dateKey(d))) { s++; d.setDate(d.getDate() - 1); }
  return s;
}

function heatmapHTML(counts, todayK) {
  const weeks = 26;
  const today = startOfDay(new Date());
  const dow = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(start.getDate() - dow - (weeks - 1) * 7);
  let cells = '', labels = '', lastM = -1;
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d > today) break;
    const col = Math.floor(i / 7), row = (d.getDay() + 6) % 7;
    if (d.getMonth() !== lastM) {
      labels += `<span style="grid-column:${col + 1}">${d.getMonth() + 1}月</span>`;
      lastM = d.getMonth();
    }
    const k = dateKey(d), c = counts.get(k) || 0;
    const lv = c === 0 ? 0 : c === 1 ? 1 : c <= 3 ? 2 : c <= 6 ? 3 : 4;
    cells += `<div class="hm-cell lv${lv}${k === todayK ? ' today' : ''}" style="grid-row:${row + 1};grid-column:${col + 1}" data-tip="${d.getMonth() + 1}月${d.getDate()}日 · ${c ? c + ' 条记录' : '无记录'}"></div>`;
  }
  return `<div class="hm"><div class="hm-inner">
    <div class="hm-months" style="grid-template-columns:repeat(${weeks},var(--hm-cell))">${labels}</div>
    <div class="hm-row">
      <div class="hm-weekdays"><span style="grid-row:1">一</span><span style="grid-row:3">三</span><span style="grid-row:5">五</span></div>
      <div class="hm-grid">${cells}</div>
    </div>
  </div></div>`;
}

function renderStatsView() {
  const body = $('#stats-body');
  if (!notes.length) { body.innerHTML = emptyStateHTML('stats-empty'); return; }

  const counts = new Map();
  notes.forEach(n => {
    const k = dateKey(new Date(n.createdAt));
    counts.set(k, (counts.get(k) || 0) + 1);
  });
  const todayK = dateKey(new Date());
  const streak = calcStreak(counts, todayK);
  const tags = allTags();
  const max = tags.length ? tags[0].count : 1;

  const tile = (ic, num, label) => `
    <div class="stat-tile">
      <div class="tile-icon">${icon(ic)}</div>
      <div class="tile-num">${num}</div>
      <div class="tile-label">${label}</div>
    </div>`;

  body.innerHTML = `<div class="stats-col">
    <div class="stat-grid">
      ${tile('feather', notes.length, 'MEMO 总数')}
      ${tile('hash', tags.length, '标签')}
      ${tile('flame', streak, '连续天数')}
      ${tile('calendar', counts.get(todayK) || 0, '今日新增')}
    </div>
    <div class="panel card">
      <div class="panel-head"><span class="panel-title">记录热力图</span><span class="panel-sub">最近 26 周</span></div>
      <div class="hm-scroll">${heatmapHTML(counts, todayK)}</div>
      <div class="hm-legend">
        <span class="lg-text">少</span>
        <span class="hm-cell lv0"></span><span class="hm-cell lv1"></span><span class="hm-cell lv2"></span><span class="hm-cell lv3"></span><span class="hm-cell lv4"></span>
        <span class="lg-text">多</span>
      </div>
    </div>
    <div class="panel card">
      <div class="panel-head"><span class="panel-title">热门标签</span><span class="panel-sub">TOP ${Math.min(8, tags.length)}</span></div>
      ${tags.slice(0, 8).map(t => `
        <div class="tagstat-row">
          <span class="tagstat-name"><span class="hash">#</span>${esc(t.tag)}</span>
          <div class="tagstat-track"><div class="tagstat-fill" style="width:${Math.max(4, Math.round(t.count / max * 100))}%"></div></div>
          <span class="tagstat-count">${t.count}</span>
        </div>`).join('')}
    </div>
  </div>`;
}

/* ---------------- master render ---------------- */
function render() {
  renderSidebar();
  renderTopbar();
  syncSections();
  if (state.view === 'memo') renderMemoView();
  else if (state.view === 'tag') renderTagView();
  else if (state.view === 'search') renderSearchView();
  else if (state.view === 'review') renderReviewView();
  else if (state.view === 'stats') renderStatsView();
  pendingAnimate = false;
  afterRender();
}

function afterRender() {
  $$('[data-empty-btn]').forEach(b => {
    b.addEventListener('click', () => { go('memo'); focusComposer(); });
  });
  const ea = $('.edit-input');
  if (ea) {
    autoGrow(ea);
    ea.focus();
    ea.setSelectionRange(ea.value.length, ea.value.length);
    ea.addEventListener('input', () => autoGrow(ea));
  }
}

/* ---------------- actions ---------------- */
function go(view) {
  const changed = state.view !== view;
  state.view = view;
  render();
  if (changed) window.scrollTo({ top: 0 });
  if (view === 'search') requestAnimationFrame(() => $('#search-input').focus());
}

function openTag(tag) {
  state.tag = tag;
  state.view = 'tag';
  render();
  window.scrollTo({ top: 0 });
}

const focusComposer = () => { input.focus(); input.setSelectionRange(input.value.length, input.value.length); };
const closeDrawer = () => document.body.classList.remove('drawer-open');

function submitNote() {
  const v = input.value.trim();
  if (!v) return;
  notes.unshift({
    id: uid(), content: v, tags: extractTags(v),
    createdAt: Date.now(), updatedAt: null, pinned: false,
  });
  sortNotes();
  saveNotes();
  input.value = '';
  settings.draft = '';
  lsSet(SETTINGS_KEY, JSON.stringify(settings));
  updateComposerState();
  autoGrow(input);
  hideAC();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteNote(id) {
  const idx = notes.findIndex(n => n.id === id);
  if (idx < 0) return;
  const [note] = notes.splice(idx, 1);
  if (state.editingId === id) state.editingId = null;
  saveNotes();
  render();
  toast('已删除', {
    action: '撤销',
    onAction() {
      notes.splice(Math.min(idx, notes.length), 0, note);
      sortNotes(); saveNotes(); render();
    },
  });
}

function saveEdit(note) {
  const card = $(`.note-card[data-id="${note.id}"]`);
  if (!card) return;
  const v = $('.edit-input', card).value.trim();
  if (!v) { toast('内容不能为空'); return; }
  note.content = v;
  note.tags = extractTags(v);
  note.updatedAt = Date.now();
  state.editingId = null;
  saveNotes();
  render();
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('已复制到剪贴板');
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('已复制到剪贴板'); }
    catch (e2) { toast('复制失败'); }
    ta.remove();
  }
}

/* ---------------- toast & modal ---------------- */
function toast(msg, opts = {}) {
  const stack = $('#toast-stack');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>${esc(msg)}</span>${opts.action ? `<button class="toast-action" type="button">${esc(opts.action)}</button>` : ''}`;
  stack.appendChild(t);
  if (stack.children.length > 3) stack.firstElementChild.remove();
  const timer = setTimeout(remove, 3800);
  function remove() {
    clearTimeout(timer);
    t.classList.add('out');
    setTimeout(() => t.remove(), 220);
  }
  if (opts.action) {
    $('.toast-action', t).addEventListener('click', () => { opts.onAction && opts.onAction(); remove(); });
  }
}

function confirmModal({ title, desc, confirmText = '确定', danger = true }) {
  return new Promise(resolve => {
    const root = $('#modal-root');
    root.innerHTML = `
      <div class="modal-overlay">
        <div class="modal" role="dialog" aria-modal="true">
          <h3>${esc(title)}</h3>
          <p>${esc(desc)}</p>
          <div class="modal-actions">
            <button class="btn-ghost" data-x="0" type="button">取消</button>
            <button class="${danger ? 'btn-danger' : 'btn-primary'}" data-x="1" type="button">${esc(confirmText)}</button>
          </div>
        </div>
      </div>`;
    const done = v => { root.innerHTML = ''; resolve(v); };
    $('.modal-overlay', root).addEventListener('click', e => { if (e.target === e.currentTarget) done(false); });
    $$('[data-x]', root).forEach(b => b.addEventListener('click', () => done(b.dataset.x === '1')));
  });
}

/* ---------------- composer & autocomplete ---------------- */
function updateComposerState() {
  const v = input.value;
  $('#char-count').textContent = v.length ? `${v.length} 字` : '';
  $('#btn-submit').disabled = !v.trim();
}

function persistDraft() {
  settings.draft = input.value;
  lsSet(SETTINGS_KEY, JSON.stringify(settings));
}

function detectTagToken(t) {
  const pos = t.selectionStart;
  if (pos == null) return null;
  const before = t.value.slice(0, pos);
  const m = before.match(/(?:^|\s)#([^\s#]*)$/);
  if (!m) return null;
  return { start: pos - m[1].length - 1, query: m[1] };
}

function handleAC() {
  const token = detectTagToken(input);
  if (!token) { hideAC(); return; }
  const q = token.query.toLowerCase();
  const all = allTags();
  const list = (q ? all.filter(t => t.tag.toLowerCase().includes(q)) : all)
    .slice(0, 6).map(t => t.tag);
  if (!list.length) { hideAC(); return; }
  acState = { open: true, list, idx: 0, token };
  paintAC();
  positionAC();
}

function paintAC() {
  const box = $('#tag-autocomplete');
  const counts = new Map(allTags().map(t => [t.tag, t.count]));
  box.innerHTML = acState.list.map((t, i) => `
    <div class="ac-item${i === acState.idx ? ' active' : ''}" data-i="${i}">
      <span class="ac-hash">#</span><span class="ac-name">${esc(t)}</span>
      <span class="ac-count">${counts.get(t) || ''}</span>
    </div>`).join('');
  box.classList.add('open');
  $$('.ac-item', box).forEach(el => {
    el.addEventListener('mousedown', e => {
      e.preventDefault();
      applyAC(acState.list[+el.dataset.i]);
    });
  });
}

function applyAC(tag) {
  const end = input.selectionStart;
  input.value = input.value.slice(0, acState.token.start) + '#' + tag + ' ' + input.value.slice(end);
  const pos = acState.token.start + tag.length + 2;
  input.setSelectionRange(pos, pos);
  hideAC();
  updateComposerState();
  autoGrow(input);
  persistDraft();
  input.focus();
}

function hideAC() {
  acState.open = false;
  $('#tag-autocomplete').classList.remove('open');
}

function getCaretCoords(ta, pos) {
  const cs = getComputedStyle(ta);
  const div = document.createElement('div');
  const props = ['boxSizing', 'width', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight', 'textIndent',
    'whiteSpace', 'wordSpacing', 'overflowWrap', 'wordWrap', 'tabSize'];
  for (const p of props) div.style[p] = cs[p];
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.left = '-9999px';
  div.style.top = '0';
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordWrap = 'break-word';
  div.textContent = ta.value.slice(0, pos);
  const span = document.createElement('span');
  span.textContent = ta.value.slice(pos) || '.';
  div.appendChild(span);
  document.body.appendChild(div);
  const coords = { top: span.offsetTop, left: span.offsetLeft };
  div.remove();
  return coords;
}

function positionAC() {
  const box = $('#tag-autocomplete');
  const comp = input.closest('.composer');
  box.style.visibility = 'hidden';
  const coords = getCaretCoords(input, input.selectionStart);
  const lh = parseFloat(getComputedStyle(input).lineHeight) || 26;
  let left = input.offsetLeft + coords.left + 2;
  const maxLeft = comp.clientWidth - box.offsetWidth - 8;
  left = Math.max(8, Math.min(left, maxLeft));
  box.style.left = left + 'px';
  box.style.top = (input.offsetTop + coords.top - input.scrollTop + lh + 6) + 'px';
  box.style.visibility = '';
}

function onComposerKeydown(e) {
  if (acState.open && acState.list.length) {
    if (e.key === 'ArrowDown') { e.preventDefault(); acState.idx = (acState.idx + 1) % acState.list.length; paintAC(); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); acState.idx = (acState.idx - 1 + acState.list.length) % acState.list.length; paintAC(); return; }
    if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); applyAC(acState.list[acState.idx]); return; }
    if (e.key === 'Escape') { e.preventDefault(); hideAC(); return; }
  } else if (e.key === 'Escape') { input.blur(); return; }
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    submitNote();
  }
}

/* ---------------- list delegation ---------------- */
function onListClick(e) {
  const tg = e.target.closest('.tag-link');
  if (tg) { openTag(tg.dataset.tag); return; }
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const card = btn.closest('.note-card');
  if (!card) return;
  const id = card.dataset.id;
  const note = notes.find(n => n.id === id);
  if (!note) return;
  const act = btn.dataset.act;
  if (act === 'pin') { note.pinned = !note.pinned; saveNotes(); render(); }
  else if (act === 'copy') copyText(note.content);
  else if (act === 'edit') { state.editingId = id; render(); }
  else if (act === 'delete') deleteNote(id);
  else if (act === 'saveEdit') saveEdit(note);
  else if (act === 'cancelEdit') { state.editingId = null; render(); }
}

function onListKeydown(e) {
  if (!e.target.matches('.edit-input')) return;
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    const card = e.target.closest('.note-card');
    const n = notes.find(x => x.id === card.dataset.id);
    if (n) saveEdit(n);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    state.editingId = null;
    render();
  }
}

/* ---------------- settings: import / export / clear ---------------- */
function exportData() {
  if (!notes.length) { toast('没有可导出的记录'); return; }
  const data = { app: 'mojian', version: 1, exportedAt: new Date().toISOString(), notes };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `mojian-${dateKey(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast(`已导出 ${notes.length} 条记录`);
}

function importData(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  const r = new FileReader();
  r.onload = async () => {
    try {
      const data = JSON.parse(r.result);
      const arr = Array.isArray(data) ? data : data.notes;
      if (!Array.isArray(arr)) throw new Error('bad format');
      const clean = arr
        .filter(n => n && typeof n.content === 'string' && n.content.trim())
        .map(n => ({
          id: String(n.id || uid()),
          content: String(n.content),
          tags: Array.isArray(n.tags) && n.tags.length ? n.tags.map(String) : extractTags(n.content),
          createdAt: +n.createdAt || Date.now(),
          updatedAt: +n.updatedAt || null,
          pinned: !!n.pinned,
        }));
      if (!clean.length) throw new Error('empty');
      const ok = await confirmModal({
        title: '导入数据',
        desc: `将导入 ${clean.length} 条记录，并覆盖当前的 ${notes.length} 条。`,
        confirmText: '导入',
      });
      if (ok) {
        notes = clean;
        sortNotes();
        saveNotes();
        state.editingId = null;
        render();
        toast(`已导入 ${clean.length} 条记录`);
      }
    } catch (err) {
      toast('导入失败：文件格式不正确');
    }
  };
  r.readAsText(file);
}

/* ---------------- theme ---------------- */
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  $('#btn-theme-top').innerHTML = icon(t === 'dark' ? 'sun' : 'moon');
}
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  settings.theme = next;
  lsSet(SETTINGS_KEY, JSON.stringify(settings));
  applyTheme(next);
}

/* ---------------- events ---------------- */
function bindEvents() {
  // static icons
  $$('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });

  // sidebar
  $('#btn-new').addEventListener('click', () => { go('memo'); focusComposer(); closeDrawer(); });
  $$('#main-nav .nav-item').forEach(b => b.addEventListener('click', () => { go(b.dataset.view); closeDrawer(); }));

  // topbar
  $('#btn-menu').addEventListener('click', () => document.body.classList.toggle('drawer-open'));
  $('#drawer-overlay').addEventListener('click', closeDrawer);
  $('#btn-search-top').addEventListener('click', () => go('search'));
  $('#btn-theme-top').addEventListener('click', toggleTheme);
  $('#btn-exit-tag').addEventListener('click', () => { state.view = 'memo'; render(); });

  // composer
  input.addEventListener('input', () => {
    autoGrow(input);
    updateComposerState();
    persistDraft();
    handleAC();
  });
  input.addEventListener('keydown', onComposerKeydown);
  input.addEventListener('blur', () => setTimeout(hideAC, 130));
  input.addEventListener('click', handleAC);
  input.addEventListener('keyup', e => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) handleAC();
  });
  $('#btn-submit').addEventListener('click', submitNote);
  $('#btn-tag').addEventListener('click', () => {
    const s = input.selectionStart, epos = input.selectionEnd;
    input.value = input.value.slice(0, s) + '#' + input.value.slice(epos);
    input.setSelectionRange(s + 1, s + 1);
    input.focus();
    updateComposerState();
    persistDraft();
    handleAC();
  });

  // lists
  ['#timeline', '#tag-timeline', '#search-timeline', '#review-body'].forEach(sel => {
    const el = $(sel);
    el.addEventListener('click', onListClick);
    el.addEventListener('keydown', onListKeydown);
  });

  // search
  const sInput = $('#search-input');
  sInput.addEventListener('input', () => {
    state.query = sInput.value;
    renderSearchView();
    renderTopbar();
  });
  sInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (sInput.value) { sInput.value = ''; state.query = ''; renderSearchView(); renderTopbar(); }
      else go('memo');
    }
  });
  $('#btn-search-clear').addEventListener('click', () => {
    sInput.value = '';
    state.query = '';
    renderSearchView();
    renderTopbar();
    sInput.focus();
  });

  // settings popover
  $('#btn-settings').addEventListener('click', e => {
    e.stopPropagation();
    $('#settings-popover').classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('#settings-popover') && !e.target.closest('#btn-settings')) {
      $('#settings-popover').classList.remove('open');
    }
  });
  $('#btn-export').addEventListener('click', () => $('#settings-popover').classList.remove('open'));
  $('#btn-export').addEventListener('click', exportData);
  $('#btn-import').addEventListener('click', () => {
    $('#settings-popover').classList.remove('open');
    $('#file-import').click();
  });
  $('#file-import').addEventListener('change', importData);
  $('#btn-clear').addEventListener('click', async () => {
    $('#settings-popover').classList.remove('open');
    if (!notes.length) { toast('已经是空的了'); return; }
    const ok = await confirmModal({
      title: '清空所有记录',
      desc: `将删除全部 ${notes.length} 条 memo，此操作不可恢复。建议先导出备份。`,
      confirmText: '清空',
    });
    if (ok) {
      notes = [];
      state.editingId = null;
      saveNotes();
      render();
      toast('已清空所有记录');
    }
  });

  // heatmap tooltip
  const statsBody = $('#stats-body');
  statsBody.addEventListener('mouseover', e => {
    const c = e.target.closest('.hm-cell');
    if (!c) return;
    const tip = $('#hm-tooltip');
    tip.textContent = c.dataset.tip;
    tip.classList.add('show');
    const r = c.getBoundingClientRect();
    const x = Math.min(Math.max(r.left + r.width / 2 - tip.offsetWidth / 2, 8), window.innerWidth - tip.offsetWidth - 8);
    tip.style.left = x + 'px';
    tip.style.top = (r.top - tip.offsetHeight - 8) + 'px';
  });
  statsBody.addEventListener('mouseout', e => {
    if (e.target.closest('.hm-cell')) $('#hm-tooltip').classList.remove('show');
  });

  // global shortcuts
  document.addEventListener('keydown', e => {
    const t = e.target;
    const inField = t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable;
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      go('search');
      return;
    }
    if (inField) return;
    if (e.key === '/') { e.preventDefault(); go('search'); return; }
    if (e.key === 'n' || e.key === 'N') { go('memo'); focusComposer(); return; }
    if (state.view === 'review' && (e.key === ' ' || e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      nextReview();
      return;
    }
    if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) closeDrawer();
  });

  window.addEventListener('resize', hideAC);
}

/* ---------------- init ---------------- */
function init() {
  applyTheme(settings.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  bindEvents();
  if (settings.draft) input.value = settings.draft;
  updateComposerState();
  autoGrow(input);
  render();
  if (window.innerWidth > 760) input.focus();
}

init();
