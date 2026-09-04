import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { o as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as format, t as zhCN } from "../_libs/date-fns.mjs";
import { n as useMounted, o as sortEvents, r as useNow, s as useScheduleStore } from "./router-pw5uqWPz.mjs";
import { t as Button } from "./field-2BuY3MwR.mjs";
import { a as eventToDraft, i as blankDraft, n as EventCard, r as EventDialog, t as EmptyDay } from "./event-dialog-CcfBClHb.mjs";
import { t as PageShell } from "./page-shell-D8j_c2-V.mjs";
import { t as briefTodayAi } from "./ai-By6XuCTp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/today-CDgK1RsF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TodayPage() {
	const mounted = useMounted();
	const now = useNow();
	const today = format(now, "yyyy-MM-dd");
	const events = useScheduleStore((s) => s.events);
	const toggleComplete = useScheduleStore((s) => s.toggleComplete);
	const updateEvent = useScheduleStore((s) => s.updateEvent);
	const deleteEvent = useScheduleStore((s) => s.deleteEvent);
	const addDrafts = useScheduleStore((s) => s.addDrafts);
	const list = (0, import_react.useMemo)(() => sortEvents(events.filter((e) => e.date === today)), [events, today]);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [brief, setBrief] = (0, import_react.useState)(null);
	const [briefing, setBriefing] = (0, import_react.useState)(false);
	async function requestBrief() {
		setBriefing(true);
		try {
			const res = await briefTodayAi({ data: {
				todayISO: today,
				events: list.map((e) => ({
					title: e.title,
					startTime: e.startTime,
					allDay: e.allDay,
					type: e.type
				}))
			} });
			if (res.ok) setBrief(res.text);
			else toast("简报暂时不可用");
		} catch {
			toast("简报暂时不可用");
		} finally {
			setBriefing(false);
		}
	}
	if (!mounted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-canvas" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "今日",
		subtitle: format(now, "yyyy年 M月d日 EEEE", { locale: zhCN }),
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			"aria-label": "添加",
			onClick: () => setCreating(true),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
				className: "size-5",
				strokeWidth: 1.7
			})
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						list.length,
						" 件 · 完成 ",
						list.filter((e) => e.completed).length
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: requestBrief,
					disabled: briefing,
					className: "text-xs tracking-wide text-subtle underline-offset-4 hover:text-ink hover:underline disabled:opacity-40",
					children: briefing ? "在写…" : "今日简报"
				})]
			}),
			brief ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-6 rounded-lg bg-paper px-4 py-3 text-sm leading-relaxed text-ink shadow-card",
				children: brief
			}) : null,
			list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyDay, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "stagger-in flex flex-col gap-2.5",
				children: list.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventCard, {
					event: e,
					onToggle: () => toggleComplete(e.id),
					onOpen: () => setEditing(e),
					onDelete: () => {
						deleteEvent(e.id);
						toast("已删除");
					}
				}, e.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/compose",
					className: "text-sm text-muted underline-offset-4 hover:text-ink hover:underline",
					children: "用一句话添加多件"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventDialog, {
				open: creating,
				onOpenChange: setCreating,
				title: "新的一件",
				initial: blankDraft(today),
				submitLabel: "加入",
				onSubmit: (d) => {
					addDrafts([d]);
					toast("已加入今日");
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventDialog, {
				open: Boolean(editing),
				onOpenChange: (v) => {
					if (!v) setEditing(null);
				},
				title: "编辑",
				initial: editing ? eventToDraft(editing) : blankDraft(today),
				submitLabel: "保存",
				onSubmit: (d) => {
					if (!editing) return;
					updateEvent(editing.id, d);
				}
			})
		]
	});
}
//#endregion
export { TodayPage as component };
