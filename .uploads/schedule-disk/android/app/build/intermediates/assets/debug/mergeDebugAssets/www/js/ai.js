/* ============ AI 解析：Gemini API + 本地一句话拆分兜底 ============ */
'use strict';

/* ---------- Gemini ---------- */
async function geminiParse(text) {
  const { geminiKey, model } = store.data.settings;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.5-flash'}:generateContent?key=${encodeURIComponent(geminiKey)}`;
  const today = todayStr();
  const week = '周' + CN_WEEK[new Date().getDay()];
  const prompt =
    `你是日程解析助手。今天是 ${today} ${week}。请把用户输入解析为日程数组，只输出 JSON，不要输出任何其他文字。\n` +
    `每个对象字段：title(简短标题)、date(YYYY-MM-DD)、time(HH:mm，全天则空字符串)、` +
    `type(从 work/life/study/health/social/finance/other 中选一个)、notes(字符串，可空)。\n` +
    `用户输入：${text}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) throw new Error('Gemini 请求失败（HTTP ' + res.status + '）');
  const data = await res.json();
  let txt = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
  txt = txt.replace(/```json|```/g, '').trim();
  const arr = JSON.parse(txt);
  const list = Array.isArray(arr) ? arr : (arr.schedules || []);
  return list
    .map(o => ({
      title: String(o.title || '').slice(0, 60),
      date: /^\d{4}-\d{2}-\d{2}$/.test(o.date) ? o.date : today,
      time: /^\d{1,2}:\d{2}$/.test(o.time || '') ? o.time : '',
      type: TYPE_MAP[o.type] ? o.type : 'other',
      notes: String(o.notes || ''),
    }))
    .filter(o => o.title);
}

/* ---------- 本地解析兜底 ---------- */
const GUESS_RULES = [
  [/会议|开会|上班|汇报|报告|面试|工作|加班|出差|客户/, 'work'],
  [/学习|看书|读书|考试|课程|作业|复习|上课|背单词/, 'study'],
  [/健身|跑步|运动|医院|看病|牙医|体检|瑜伽|游泳|吃药/, 'health'],
  [/聚会|聚餐|约会|吃饭|生日|朋友|婚礼|饭局/, 'social'],
  [/还款|账单|工资|理财|转账|缴费|房租|报销/, 'finance'],
  [/买|购物|打扫|洗衣|超市|快递|家务|理发|取件/, 'life'],
];
function guessType(s) {
  for (const [re, t] of GUESS_RULES) if (re.test(s)) return t;
  return 'other';
}

/* 从片段中提取日期，返回 {date:Date|null, rest} */
function extractDate(s, fallback) {
  let date = null, m;
  const kw = [[/大后天/, 3], [/后天/, 2], [/明天|明日/, 1], [/今天|今日|今晚/, 0]];
  for (const [re, n] of kw) {
    if (re.test(s)) {
      date = new Date(); date.setDate(date.getDate() + n);
      s = s.replace(re, ' ');
      break;
    }
  }
  if (!date && (m = s.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*[日号]?/))) {
    date = new Date(); date.setMonth(+m[1] - 1, +m[2]);
    s = s.replace(m[0], ' ');
  }
  if (!date && (m = s.match(/(?:周|星期)\s*([一二三四五六日天])/))) {
    const map = { 日: 0, 天: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6 };
    const target = map[m[1]];
    date = new Date();
    date.setDate(date.getDate() + (target - date.getDay() + 7) % 7);
    s = s.replace(m[0], ' ');
  }
  return { date: date || fallback, rest: s };
}

/* 从片段中提取时间，返回 {time, rest} */
function extractTime(s) {
  let time = '', m;
  if ((m = s.match(/(凌晨|早上|早晨|上午|中午|下午|午后|傍晚|晚上|今晚|夜里)?\s*(\d{1,2})\s*(?:[点时:：]\s*(\d{1,2})\s*分?|点半)/))) {
    let h = +m[2], mi = m[3] ? +m[3] : 0;
    if (/点半/.test(m[0])) mi = 30;
    const ap = m[1] || '';
    if (/下午|午后|傍晚|晚上|今晚|夜里/.test(ap) && h < 12) h += 12;
    if (/凌晨/.test(ap) && h === 12) h = 0;
    if (/中午/.test(ap) && h < 6) h += 12;
    if (h < 24 && mi < 60) time = pad(h) + ':' + pad(mi);
    s = s.replace(m[0], ' ');
  } else if ((m = s.match(/(\d{1,2}):(\d{2})/))) {
    time = pad(+m[1]) + ':' + m[2];
    s = s.replace(m[0], ' ');
  }
  return { time, rest: s };
}

function localParse(text) {
  let rest = ' ' + text.trim() + ' ';
  // 全局默认日期（句首的“今天/明天…”）
  const g = extractDate(rest, null);
  const baseDate = g.date || new Date();
  rest = g.rest;

  // 拆分多个日程
  let segs;
  if (/分别?[是为]|：/.test(rest)) {
    segs = rest.split(/分别?[是为]|：/).slice(1).join('，')
      .split(/[、，,；;。]|\s+和\s+|\s*以及\s*/);
  } else {
    segs = rest.split(/[，,；;。]/);
  }

  return segs.map(seg => {
    let s = seg.replace(/^\s*\d+\s*个?日程/, '').trim();
    if (!s) return null;
    const d = extractDate(s, baseDate);   // 片段内日期可覆盖全局
    s = d.rest;
    const t = extractTime(s);
    s = t.rest;
    s = s.replace(/的日程|日程|安排一下|安排|记得|需要|要|有/g, ' ').replace(/\s+/g, ' ').trim();
    if (!s || /^\d+$/.test(s)) return null;
    return { title: s, date: fmtDate(d.date), time: t.time, type: guessType(s), notes: '' };
  }).filter(Boolean);
}

/* 统一入口：有 Key 走 Gemini，失败自动回退本地解析 */
async function smartParse(text) {
  if (store.data.settings.geminiKey) {
    try {
      const r = await geminiParse(text);
      if (r.length) return { list: r, engine: 'gemini' };
    } catch (e) {
      const list = localParse(text);
      if (list.length) return { list, engine: 'local', error: e.message };
      throw e;
    }
  }
  return { list: localParse(text), engine: 'local' };
}
