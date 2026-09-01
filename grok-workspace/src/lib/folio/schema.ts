import { z } from "zod";
import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  getDayOfYear,
  getDaysInYear,
  isAfter,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { zhCN } from "date-fns/locale";

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const MOODS = [
  { value: 1, label: "低迷", en: "LOW" },
  { value: 2, label: "平缓", en: "FLAT" },
  { value: 3, label: "稳定", en: "STEADY" },
  { value: 4, label: "积极", en: "UP" },
  { value: 5, label: "充沛", en: "FULL" },
] as const;

export const DENSITIES = [
  { value: 1, label: "空档", en: "VOID" },
  { value: 2, label: "稀薄", en: "THIN" },
  { value: 3, label: "正常", en: "NORM" },
  { value: 4, label: "饱满", en: "RICH" },
  { value: 5, label: "过载", en: "MAX" },
] as const;

export const TAGS = [
  "工作",
  "生活",
  "健康",
  "学习",
  "社交",
  "财务",
  "家庭",
  "出行",
  "创作",
  "其他",
] as const;

export type Tag = (typeof TAGS)[number];
export type Scale = 1 | 2 | 3 | 4 | 5;
export type RecordStatus = "draft" | "filed";

export const DayRecordSchema = z.object({
  id: z.string().regex(DATE_RE),
  status: z.enum(["draft", "filed"]),
  summary: z.string(),
  items: z.array(z.string()),
  body: z.string(),
  mood: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.null()]),
  density: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.null()]),
  tags: z.array(z.string()),
  updatedAt: z.string().nullable(),
  filedAt: z.string().nullable(),
});

export type DayRecord = z.infer<typeof DayRecordSchema>;

export const LedgerFileSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  records: z.array(DayRecordSchema),
});

export type LedgerFile = z.infer<typeof LedgerFileSchema>;

export const SUMMARY_MIN = 8;
export const SUMMARY_MAX = 48;
export const BODY_MIN = 40;
export const ITEMS_MAX = 5;

export const SECTIONS = [
  { key: "summary", no: "01", label: "摘要", en: "SUMMARY", required: true },
  { key: "agenda", no: "02", label: "事项", en: "AGENDA", required: true },
  { key: "body", no: "03", label: "正文", en: "LOG", required: true },
  { key: "assessment", no: "04", label: "评估", en: "ASSESSMENT", required: true },
  { key: "marks", no: "05", label: "标记", en: "MARKS", required: true },
] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];

export function emptyRecord(id: string): DayRecord {
  return {
    id,
    status: "draft",
    summary: "",
    items: [""],
    body: "",
    mood: null,
    density: null,
    tags: [],
    updatedAt: null,
    filedAt: null,
  };
}

export function localIsoDate(d = new Date()): string {
  return format(d, "yyyy-MM-dd");
}

export function parseDate(id: string): Date | null {
  if (!DATE_RE.test(id)) return null;
  const d = parseISO(id);
  return isValid(d) ? d : null;
}

export function isFutureDate(id: string, today: string): boolean {
  return id > today;
}

export function fileId(id: string): string {
  const d = parseDate(id);
  if (!d) return "F-————-———";
  return `F-${d.getFullYear()}-${String(getDayOfYear(d)).padStart(3, "0")}`;
}

export function dayOfYearLabel(id: string): string {
  const d = parseDate(id);
  if (!d) return "";
  const n = getDayOfYear(d);
  const total = getDaysInYear(d);
  return `DAY ${String(n).padStart(3, "0")} / ${total}`;
}

export function formatDisplayDate(id: string): string {
  return id.replaceAll("-", ".");
}

export function formatChineseDate(id: string): string {
  const d = parseDate(id);
  if (!d) return id;
  return format(d, "yyyy年M月d日 EEEE", { locale: zhCN });
}

export function formatWeekdayEn(id: string): string {
  const d = parseDate(id);
  if (!d) return "";
  return format(d, "EEE").toUpperCase();
}

export function formatClock(d: Date): string {
  return format(d, "HH:mm:ss");
}

export function formatStampTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!isValid(d)) return "—";
  return format(d, "yyyy.MM.dd HH:mm");
}

export function glyphCount(text: string): number {
  return Array.from(text.replace(/\s+/g, "")).length;
}

export function padCount(n: number, width = 4): string {
  return String(n).padStart(width, "0");
}

export function filledItems(items: string[]): string[] {
  return items.map((s) => s.trim()).filter(Boolean);
}

export type SectionState = Record<SectionKey, boolean>;

export function sectionState(rec: DayRecord): SectionState {
  const summary = glyphCount(rec.summary);
  return {
    summary: summary >= SUMMARY_MIN && summary <= SUMMARY_MAX,
    agenda: filledItems(rec.items).length >= 1,
    body: glyphCount(rec.body) >= BODY_MIN,
    assessment: rec.mood !== null && rec.density !== null,
    marks: rec.tags.length >= 1,
  };
}

export function completeness(rec: DayRecord): { done: number; total: number; ready: boolean } {
  const state = sectionState(rec);
  const done = SECTIONS.filter((s) => state[s.key]).length;
  return { done, total: SECTIONS.length, ready: done === SECTIONS.length };
}

export function normalizeRecord(rec: DayRecord): DayRecord {
  return {
    ...rec,
    summary: rec.summary.trim(),
    items: filledItems(rec.items).slice(0, ITEMS_MAX),
    body: rec.body.trim(),
    tags: rec.tags.filter((t, i, a) => TAGS.includes(t as Tag) && a.indexOf(t) === i),
  };
}

export function monthCells(year: number, monthIndex: number): Array<string | null> {
  const start = startOfMonth(new Date(year, monthIndex, 1));
  const end = new Date(year, monthIndex + 1, 0);
  const gridStart = startOfWeek(start, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(end, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((d) =>
    d.getMonth() === monthIndex ? localIsoDate(d) : null,
  );
}

export function enumerateDays(from: string, to: string): string[] {
  const a = parseDate(from);
  const b = parseDate(to);
  if (!a || !b || isAfter(a, b)) return [];
  return eachDayOfInterval({ start: a, end: b }).map((d) => localIsoDate(d));
}

export function unfiledGaps(
  records: Record<string, DayRecord>,
  from: string,
  to: string,
): string[] {
  return enumerateDays(from, to).filter((id) => records[id]?.status !== "filed");
}

export type CellKind = "empty" | "draft" | "filed" | "future";

export function cellKind(
  id: string,
  records: Record<string, DayRecord>,
  today: string,
): CellKind {
  if (id > today) return "future";
  const rec = records[id];
  if (!rec) return "empty";
  if (rec.status === "filed") return "filed";
  const { done } = completeness(rec);
  return done > 0 ? "draft" : "empty";
}

type SeedSpec = {
  offset: number;
  summary: string;
  items: string[];
  body: string;
  mood: Scale;
  density: Scale;
  tags: Tag[];
};

const SEED: SeedSpec[] = [
  {
    offset: 12,
    summary: "对齐预算口径，夜间整理书桌与待办",
    items: ["与财务核对 Q3 口径", "清理桌面至空档", "阅读行业周报"],
    body: "上午把预算表第三列的口径与财务对齐，避免月底合并时再返工。下午会议纪要已写入共享盘。晚上把书桌清到只留当期文件夹，这种秩序会让明天的开始更干净。",
    mood: 4,
    density: 4,
    tags: ["工作", "生活"],
  },
  {
    offset: 11,
    summary: "客户评审延期，补读两份行业报告",
    items: ["调整评审日程", "摘录报告要点"],
    body: "评审被临时推迟到下周。空出的下午用来补读两份报告，把关键数字抄进索引卡。延期不是损失，只要把空档填成准备。",
    mood: 3,
    density: 3,
    tags: ["工作", "学习"],
  },
  {
    offset: 10,
    summary: "完成接口文档第二稿并提交评审",
    items: ["修订错误码一节", "补时序图", "提交评审单"],
    body: "接口文档第二稿在下午四点提交。错误码表按责任域重新分组，时序图只保留主路径。评审单编号已登记。剩余边角明天处理。",
    mood: 4,
    density: 4,
    tags: ["工作"],
  },
  {
    offset: 8,
    summary: "周末检修个人工作流，清空收件箱",
    items: ["归档上周邮件", "更新模板", "备份本地记录"],
    body: "把收件箱清到零。模板库里过期的三份已废止。本地记录做了一次完整导出。周末适合做这种不产生新事项、只恢复秩序的工作。",
    mood: 3,
    density: 3,
    tags: ["生活", "财务"],
  },
  {
    offset: 7,
    summary: "家人聚餐，邮件一律留待次日",
    items: ["晚餐", "未处理工作邮件"],
    body: "今晚不处理工作。聚餐从六点到九点，话题很碎，但该在场。邮件标为次日首项。把生活和工作隔开，本身也是一种归档。",
    mood: 5,
    density: 2,
    tags: ["家庭", "生活"],
  },
  {
    offset: 6,
    summary: "重构登录模块，测试覆盖率升至八成",
    items: ["拆分会话逻辑", "补齐失败路径测试", "记录变更说明"],
    body: "登录路径拆成会话、凭证、风控三块。失败路径的测试补了十一例，覆盖率到百分之八十二。变更说明写在仓库的 PROTOCOL 目录，方便后人检索。",
    mood: 4,
    density: 5,
    tags: ["工作", "学习"],
  },
  {
    offset: 4,
    summary: "往返出差，车上完成两份会议纪要",
    items: ["早班出发", "客户现场对齐", "返程写纪要"],
    body: "车上是适合写纪要的地方。现场只记事实，车上补结论和待办。两份纪要在到站前写完，发送前又核对了一遍数字。出行的密度很高，但没有漏项。",
    mood: 3,
    density: 5,
    tags: ["出行", "工作"],
  },
  {
    offset: 3,
    summary: "例会纪要归档，晚间运动三十分钟",
    items: ["整理例会待办", "更新看板", "跑步三十分钟"],
    body: "例会待办全部落到看板上，每条都有责任人和日期。晚上跑步三十分钟，配速不重要，完成即可。白天的密度用身体结算一次。",
    mood: 4,
    density: 3,
    tags: ["工作", "健康"],
  },
  {
    offset: 2,
    summary: "处理两起线上问题并复盘根因",
    items: ["定位故障窗口", "发布热修", "写复盘"],
    body: "上午两起告警，根因都在同一处超时配置。热修在十一点前发布。复盘只写事实、影响、动作，不写情绪。同类问题不该出现第三次。",
    mood: 2,
    density: 4,
    tags: ["工作"],
  },
  {
    offset: 1,
    summary: "月末结账，核对发票与报销单",
    items: ["核对发票十二张", "提交报销", "关闭本月清单"],
    body: "把本月发票按日期摊开，缺号的两张已经补齐。报销单提交后，本月清单全部勾完。月末最适合做一次闭合，而不是再开新项。",
    mood: 3,
    density: 4,
    tags: ["财务", "工作"],
  },
];

export function buildSeed(today: Date): Record<string, DayRecord> {
  const todayIso = localIsoDate(today);
  const out: Record<string, DayRecord> = {};
  for (const spec of SEED) {
    const id = localIsoDate(subDays(today, spec.offset));
    if (id >= todayIso) continue;
    const filedAt = addDays(parseISO(id), 0);
    filedAt.setHours(21, 14, 0, 0);
    out[id] = {
      id,
      status: "filed",
      summary: spec.summary,
      items: spec.items,
      body: spec.body,
      mood: spec.mood,
      density: spec.density,
      tags: [...spec.tags],
      updatedAt: filedAt.toISOString(),
      filedAt: filedAt.toISOString(),
    };
  }
  return out;
}

export function weekStarts(): string[] {
  return ["一", "二", "三", "四", "五", "六", "日"];
}
