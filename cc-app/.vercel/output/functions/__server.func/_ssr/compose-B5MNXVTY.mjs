import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as colorForType } from "./types-DkEh41EK.mjs";
import { i as Split, r as Trash2 } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as format, r as nextDay, t as zhCN, v as addDays } from "../_libs/date-fns.mjs";
import { c as formatTimeLabel, d as todayISO, l as friendlyDay, n as useMounted, r as useNow, s as useScheduleStore } from "./router-pw5uqWPz.mjs";
import { a as Textarea, r as Label, t as Button } from "./field-2BuY3MwR.mjs";
import { n as EventEditor, r as TypePills, t as ColorSwatches } from "./event-editor-B7dh7SAp.mjs";
import { t as PageShell } from "./page-shell-D8j_c2-V.mjs";
import { n as parseScheduleAi } from "./ai-By6XuCTp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/compose-B5MNXVTY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WEEKDAY_MAP = {
	日: 0,
	天: 0,
	一: 1,
	二: 2,
	三: 3,
	四: 4,
	五: 5,
	六: 6
};
var TYPE_KEYWORDS = [
	{
		type: "health",
		keys: [
			"跑",
			"健身",
			"瑜伽",
			"医",
			"牙",
			"锻炼",
			"游泳",
			"散步",
			"拉伸"
		]
	},
	{
		type: "study",
		keys: [
			"学",
			"课",
			"读",
			"书",
			"图书馆",
			"复习",
			"作业",
			"论文"
		]
	},
	{
		type: "social",
		keys: [
			"朋友",
			"聚",
			"饭",
			"约",
			"拜访",
			"约会",
			"晚饭"
		]
	},
	{
		type: "work",
		keys: [
			"会",
			"同步",
			"客户",
			"项目",
			"汇报",
			"面试",
			"工"
		]
	},
	{
		type: "focus",
		keys: [
			"写作",
			"专注",
			"复盘",
			"思考",
			"设计"
		]
	},
	{
		type: "rest",
		keys: [
			"休息",
			"睡",
			"电影",
			"闲"
		]
	},
	{
		type: "personal",
		keys: [
			"买",
			"家",
			"整理",
			"打扫",
			"取"
		]
	}
];
function guessType(title) {
	for (const row of TYPE_KEYWORDS) if (row.keys.some((k) => title.includes(k))) return row.type;
	return "other";
}
function parseWeekday(token, from) {
	const m = token.match(/(这|本|下)?(周|星期|礼拜)([一二三四五六日天])/);
	if (!m) return null;
	const day = WEEKDAY_MAP[m[3] ?? ""];
	if (day === void 0) return null;
	const target = nextDay(from, day);
	if (m[1] === "下") return nextDay(target, day);
	if (format(from, "i") === String(day === 0 ? 7 : day) && m[1] !== "下") return from;
	return target;
}
function parseRelativeDate(text, from) {
	const patterns = [
		{
			re: /大后天/,
			apply: () => addDays(from, 3)
		},
		{
			re: /后天/,
			apply: () => addDays(from, 2)
		},
		{
			re: /明天|明日/,
			apply: () => addDays(from, 1)
		},
		{
			re: /今天|今日/,
			apply: () => from
		}
	];
	for (const p of patterns) if (p.re.test(text)) return {
		date: p.apply(),
		rest: text.replace(p.re, " ")
	};
	const md = text.match(/(\d{1,2})月(\d{1,2})[日号]/);
	if (md) {
		const month = Number(md[1]);
		const day = Number(md[2]);
		const d = new Date(from.getFullYear(), month - 1, day);
		if (d < addDays(from, -1)) d.setFullYear(d.getFullYear() + 1);
		return {
			date: d,
			rest: text.replace(md[0], " ")
		};
	}
	const wd = parseWeekday(text, from);
	if (wd) return {
		date: wd,
		rest: text.replace(/(这|本|下)?(周|星期|礼拜)([一二三四五六日天])/, " ")
	};
	return {
		date: from,
		rest: text
	};
}
var PERIOD_DEFAULT = {
	凌晨: "05:00",
	清晨: "06:00",
	早上: "07:30",
	早晨: "07:30",
	上午: "09:00",
	中午: "12:00",
	下午: "14:00",
	傍晚: "18:00",
	晚上: "20:00",
	今晚: "20:00"
};
function parseClock(chunk) {
	const hm = chunk.match(/(凌晨|清晨|早上|早晨|上午|中午|下午|傍晚|晚上|今晚)?\s*(\d{1,2})(?:[:：点时](\d{1,2}|半)?)?/);
	if (hm && hm[2] !== void 0) {
		let hour = Number(hm[2]);
		let minute = 0;
		if (hm[3] === "半") minute = 30;
		else if (hm[3]) minute = Number(hm[3]);
		const period = hm[1] ?? "";
		if ((Boolean(hm[1]) || /[:：点时]/.test(hm[0])) && hour <= 23 && minute <= 59) {
			if ([
				"下午",
				"傍晚",
				"晚上",
				"今晚"
			].includes(period) && hour < 12) hour += 12;
			if (period === "中午" && hour < 12) hour = 12;
			if (["凌晨", "清晨"].includes(period) && hour === 12) hour = 0;
			if (hour === 24) hour = 0;
			return {
				start: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
				rest: chunk.replace(hm[0], " ")
			};
		}
	}
	const periodOnly = chunk.match(/(凌晨|清晨|早上|早晨|上午|中午|下午|傍晚|晚上|今晚)/);
	if (periodOnly) return {
		start: PERIOD_DEFAULT[periodOnly[1] ?? ""] ?? null,
		rest: chunk.replace(periodOnly[0], " ")
	};
	return {
		start: null,
		rest: chunk
	};
}
function splitItems(text) {
	const marked = text.match(/分别是(.+)$/);
	const parts = (marked ? marked[1] : text).split(/(?:；|;|。|，(?=\s*\d)|、|再(去|到|做)|然后|接着|还有|另外|以及|和(?=[\u4e00-\u9fff]{1,8}(?:，|。|$)))/g).map((s) => (s ?? "").replace(/^分别是/, "").trim()).filter((s) => s && s.length > 1 && !/^(去|到|做)$/.test(s));
	if (parts.length >= 2) return parts;
	const numbered = text.split(/第[一二三四五六七八九十123456789][、.．、]/).map((s) => s.trim()).filter(Boolean);
	if (numbered.length >= 2) return numbered.slice(1).length ? numbered.filter((s, i) => i === 0 ? s.length > 4 : true) : parts;
	return [text.trim()].filter(Boolean);
}
function cleanTitle(raw) {
	return raw.replace(/今天|今日|明天|明日|后天|大后天/g, "").replace(/(这|本|下)?(周|星期|礼拜)[一二三四五六日天]/g, "").replace(/\d{1,2}月\d{1,2}[日号]/g, "").replace(/(凌晨|清晨|早上|早晨|上午|中午|下午|傍晚|晚上|今晚)\s*/g, "").replace(/\d{1,2}(?:[:：点时]\d{0,2}|点半)?/g, "").replace(/有\s*\d+\s*个日程/g, "").replace(/分别是/g, "").replace(/[，,。.\s]+/g, " ").trim().replace(/^(去|到|做)/, "");
}
function parseLocal(text, now = /* @__PURE__ */ new Date()) {
	const trimmed = text.trim();
	if (!trimmed) return [];
	const { date: baseDate, rest } = parseRelativeDate(trimmed, now);
	const chunks = splitItems(rest);
	const used = chunks.length > 0 ? chunks : [rest];
	const events = [];
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
			reminderMinutes: clock.start ? 15 : null
		});
	}
	return events.length ? events : [];
}
function fallbackDraft(text, now = /* @__PURE__ */ new Date()) {
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
		reminderMinutes: null
	};
}
var EXAMPLES = [
	"今天有 3 个日程，分别是上午开会、下午健身、晚上读一小时书",
	"明天下午 3 点见客户，晚上 7 点和朋友吃饭",
	"周六去图书馆，周日上午整理房间"
];
function ComposePage() {
	const mounted = useMounted();
	const now = useNow();
	const navigate = useNavigate();
	const addDrafts = useScheduleStore((s) => s.addDrafts);
	const defaultReminder = useScheduleStore((s) => s.settings.defaultReminder);
	const [text, setText] = (0, import_react.useState)("");
	const [drafts, setDrafts] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [source, setSource] = (0, import_react.useState)(null);
	const [manual, setManual] = (0, import_react.useState)(false);
	async function split() {
		const raw = text.trim();
		if (!raw) return;
		const local = parseLocal(raw, now);
		try {
			const res = await parseScheduleAi({ data: {
				text: raw,
				todayISO: format(now, "yyyy-MM-dd"),
				weekday: format(now, "EEEE", { locale: zhCN })
			} });
			if (res.ok && res.events.length) {
				setDrafts(res.events.map((d) => ({
					...d,
					reminderMinutes: d.allDay ? null : d.reminderMinutes ?? defaultReminder
				})));
				setSource("ai");
				return;
			}
		} catch {}
		const fallback = local.length ? local : [fallbackDraft(raw, now)];
		setDrafts(fallback.map((d) => ({
			...d,
			reminderMinutes: d.allDay ? null : d.reminderMinutes ?? defaultReminder
		})));
		setSource("local");
		toast(local.length ? "已按语句拆分" : "智能拆分暂不可用，先记成一条");
	}
	async function onSplit() {
		setBusy(true);
		try {
			await split();
		} finally {
			setBusy(false);
		}
	}
	function commit() {
		if (!drafts.length) return;
		addDrafts(drafts);
		toast(`已加入 ${drafts.length} 件`);
		navigate({ to: "/today" });
	}
	function patch(i, next) {
		setDrafts((list) => list.map((d, idx) => idx === i ? {
			...d,
			...next
		} : d));
	}
	if (!mounted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-canvas" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "添加",
		subtitle: "说一句完整的话。逗号、顿号、「分别是」都会被拆开。",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-paper p-4 shadow-card sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "nl",
						children: "一句话"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "nl",
						value: text,
						onChange: (e) => setText(e.target.value),
						placeholder: EXAMPLES[0]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: EXAMPLES.slice(1).map((ex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setText(ex),
							className: "rounded-full bg-inset px-3 py-1.5 text-left text-xs text-muted transition-[color] duration-150 hover:text-ink",
							children: ex
						}, ex))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: onSplit,
							disabled: busy || !text.trim(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Split, {
								className: "size-4",
								strokeWidth: 1.75
							}), busy ? "正在拆分…" : "智能拆分"]
						})
					})
				]
			}),
			source ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-xs text-subtle",
				children: source === "ai" ? "已按语义拆成下面这些，可再改。" : "按语句规则拆分，可再改。"
			}) : null,
			drafts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-col gap-3",
				children: [drafts.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-paper p-4 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: d.title,
								onChange: (e) => patch(i, { title: e.target.value }),
								className: "min-w-0 flex-1 bg-transparent font-medium outline-none"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "去掉这条",
								onClick: () => setDrafts((list) => list.filter((_, idx) => idx !== i)),
								className: "flex size-9 items-center justify-center rounded-full text-subtle hover:bg-inset hover:text-danger",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex flex-wrap items-center gap-2 text-sm text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: friendlyDay(d.date, now) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatTimeLabel(d.startTime, d.allDay) })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								value: d.date,
								onChange: (e) => patch(i, { date: e.target.value }),
								className: "h-10 rounded-md bg-inset px-2 text-sm outline-none"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "time",
								value: d.startTime ?? "",
								disabled: d.allDay,
								onChange: (e) => patch(i, {
									startTime: e.target.value || null,
									allDay: !e.target.value
								}),
								className: "h-10 rounded-md bg-inset px-2 text-sm outline-none disabled:opacity-40"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-2 inline-flex items-center gap-2 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: d.allDay,
								onChange: (e) => patch(i, {
									allDay: e.target.checked,
									startTime: e.target.checked ? null : d.startTime ?? "09:00"
								}),
								className: "accent-ink"
							}), "全天"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypePills, {
								value: d.type,
								onChange: (type) => patch(i, {
									type,
									color: colorForType(type)
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorSwatches, {
								value: d.color,
								onChange: (hex) => patch(i, { color: hex })
							})
						})
					]
				}, `${d.title}-${i}`)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: commit,
					size: "lg",
					className: "mt-1 w-full",
					children: ["全部加入 · ", drafts.length]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setManual((v) => !v),
					className: "text-sm text-muted underline-offset-4 hover:text-ink hover:underline",
					children: manual ? "收起单条添加" : "改成一条一条填"
				}), manual ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 rounded-xl bg-paper p-4 shadow-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventEditor, {
						initial: {
							title: "",
							notes: "",
							date: format(now, "yyyy-MM-dd"),
							startTime: "09:00",
							endTime: null,
							allDay: false,
							type: "other",
							color: colorForType("other"),
							reminderMinutes: defaultReminder
						},
						submitLabel: "加入",
						onSubmit: (d) => {
							addDrafts([d]);
							toast("已加入");
							navigate({ to: "/today" });
						}
					})
				}) : null]
			})
		]
	});
}
//#endregion
export { ComposePage as component };
