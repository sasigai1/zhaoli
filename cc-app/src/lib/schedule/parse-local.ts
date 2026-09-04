import { addDays, format, nextDay, type Day } from "date-fns";
import { colorForType } from "./colors";
import { todayISO } from "./dates";
import type { DraftEvent, EventType } from "./types";

const WEEKDAY_MAP: Record<string, Day> = {
  日: 0,
  天: 0,
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
};

const TYPE_KEYWORDS: Array<{ type: EventType; keys: string[] }> = [
  { type: "health", keys: ["跑", "健身", "瑜伽", "医", "牙", "锻炼", "游泳", "散步", "拉伸"] },
  { type: "study", keys: ["学", "课", "读", "书", "图书馆", "复习", "作业", "论文"] },
  { type: "social", keys: ["朋友", "聚", "饭", "约", "拜访", "约会", "晚饭"] },
  { type: "work", keys: ["会", "同步", "客户", "项目", "汇报", "面试", "工"] },
  { type: "focus", keys: ["写作", "专注", "复盘", "思考", "设计"] },
  { type: "rest", keys: ["休息", "睡", "电影", "闲"] },
  { type: "personal", keys: ["买", "家", "整理", "打扫", "取"] },
];

function guessType(title: string): EventType {
  for (const row of TYPE_KEYWORDS) {
    if (row.keys.some((k) => title.includes(k))) return row.type;
  }
  return "other";
}

function parseWeekday(token: string, from: Date): Date | null {
  const m = token.match(/(这|本|下)?(周|星期|礼拜)([一二三四五六日天])/);
  if (!m) return null;
  const day = WEEKDAY_MAP[m[3] ?? ""];
  if (day === undefined) return null;
  const target = nextDay(from, day);
  if (m[1] === "下") return nextDay(target, day);
  if (format(from, "i") === String(day === 0 ? 7 : day) && m[1] !== "下") {
    return from;
  }
  return target;
}

function parseRelativeDate(text: string, from: Date): { date: Date; rest: string } {
  const patterns: Array<{ re: RegExp; apply: () => Date }> = [
    { re: /大后天/, apply: () => addDays(from, 3) },
    { re: /后天/, apply: () => addDays(from, 2) },
    { re: /明天|明日/, apply: () => addDays(from, 1) },
    { re: /今天|今日/, apply: () => from },
  ];
  for (const p of patterns) {
    if (p.re.test(text)) {
      return { date: p.apply(), rest: text.replace(p.re, " ") };
    }
  }
  const md = text.match(/(\d{1,2})月(\d{1,2})[日号]/);
  if (md) {
    const month = Number(md[1]);
    const day = Number(md[2]);
    const d = new Date(from.getFullYear(), month - 1, day);
    if (d < addDays(from, -1)) d.setFullYear(d.getFullYear() + 1);
    return { date: d, rest: text.replace(md[0], " ") };
  }
  const wd = parseWeekday(text, from);
  if (wd) {
    return {
      date: wd,
      rest: text.replace(/(这|本|下)?(周|星期|礼拜)([一二三四五六日天])/, " "),
    };
  }
  return { date: from, rest: text };
}

const PERIOD_DEFAULT: Record<string, string> = {
  凌晨: "05:00",
  清晨: "06:00",
  早上: "07:30",
  早晨: "07:30",
  上午: "09:00",
  中午: "12:00",
  下午: "14:00",
  傍晚: "18:00",
  晚上: "20:00",
  今晚: "20:00",
};

function parseClock(chunk: string): { start: string | null; rest: string } {
  const hm = chunk.match(
    /(凌晨|清晨|早上|早晨|上午|中午|下午|傍晚|晚上|今晚)?\s*(\d{1,2})(?:[:：点时](\d{1,2}|半)?)?/,
  );
  if (hm && hm[2] !== undefined) {
    let hour = Number(hm[2]);
    let minute = 0;
    if (hm[3] === "半") minute = 30;
    else if (hm[3]) minute = Number(hm[3]);

    const period = hm[1] ?? "";
    const looksLikeClock = Boolean(hm[1]) || /[:：点时]/.test(hm[0]);
    if (looksLikeClock && hour <= 23 && minute <= 59) {
      if (["下午", "傍晚", "晚上", "今晚"].includes(period) && hour < 12) hour += 12;
      if (period === "中午" && hour < 12) hour = 12;
      if (["凌晨", "清晨"].includes(period) && hour === 12) hour = 0;
      if (hour === 24) hour = 0;
      const start = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      return { start, rest: chunk.replace(hm[0], " ") };
    }
  }

  const periodOnly = chunk.match(/(凌晨|清晨|早上|早晨|上午|中午|下午|傍晚|晚上|今晚)/);
  if (periodOnly) {
    const start = PERIOD_DEFAULT[periodOnly[1] ?? ""] ?? null;
    return { start, rest: chunk.replace(periodOnly[0], " ") };
  }
  return { start: null, rest: chunk };
}

function splitItems(text: string): string[] {
  const marked = text.match(/分别是(.+)$/);
  const body = marked ? marked[1] : text;
  const parts = body
    .split(/(?:；|;|。|，(?=\s*\d)|、|再(去|到|做)|然后|接着|还有|另外|以及|和(?=[\u4e00-\u9fff]{1,8}(?:，|。|$)))/g)
    .map((s) => (s ?? "").replace(/^分别是/, "").trim())
    .filter((s) => s && s.length > 1 && !/^(去|到|做)$/.test(s));

  if (parts.length >= 2) return parts;

  const numbered = text
    .split(/第[一二三四五六七八九十123456789][、.．、]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (numbered.length >= 2) return numbered.slice(1).length ? numbered.filter((s, i) => i === 0 ? s.length > 4 : true) : parts;

  return [text.trim()].filter(Boolean);
}

function cleanTitle(raw: string) {
  return raw
    .replace(/今天|今日|明天|明日|后天|大后天/g, "")
    .replace(/(这|本|下)?(周|星期|礼拜)[一二三四五六日天]/g, "")
    .replace(/\d{1,2}月\d{1,2}[日号]/g, "")
    .replace(/(凌晨|清晨|早上|早晨|上午|中午|下午|傍晚|晚上|今晚)\s*/g, "")
    .replace(/\d{1,2}(?:[:：点时]\d{0,2}|点半)?/g, "")
    .replace(/有\s*\d+\s*个日程/g, "")
    .replace(/分别是/g, "")
    .replace(/[，,。.\s]+/g, " ")
    .trim()
    .replace(/^(去|到|做)/, "");
}

export function parseLocal(text: string, now = new Date()): DraftEvent[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const { date: baseDate, rest } = parseRelativeDate(trimmed, now);
  const chunks = splitItems(rest);
  const used = chunks.length > 0 ? chunks : [rest];

  const events: DraftEvent[] = [];
  let inheritedDate = baseDate;

  for (const chunk of used) {
    if (!chunk.trim()) continue;
    const rel = parseRelativeDate(chunk, inheritedDate);
    inheritedDate = rel.date;
    const clock = parseClock(rel.rest);
    const title = cleanTitle(clock.rest) || cleanTitle(chunk) || chunk.trim();
    if (!title) continue;
    const type = guessType(title);
    events.push({
      title,
      notes: "",
      date: format(inheritedDate, "yyyy-MM-dd"),
      startTime: clock.start,
      endTime: null,
      allDay: !clock.start,
      type,
      color: colorForType(type),
      reminderMinutes: clock.start ? 15 : null,
    });
  }

  return events.length ? events : [];
}

export function fallbackDraft(text: string, now = new Date()): DraftEvent {
  const type = guessType(text);
  return {
    title: text.trim().slice(0, 40) || "未命名",
    notes: "",
    date: todayISO(now),
    startTime: null,
    endTime: null,
    allDay: true,
    type,
    color: colorForType(type),
    reminderMinutes: null,
  };
}
