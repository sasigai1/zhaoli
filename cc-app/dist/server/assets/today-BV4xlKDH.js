import { n as useMounted, o as sortEvents, r as useNow, s as useScheduleStore } from "./router-Dzn3OfJZ.js";
import { a as EventCard, i as EmptyDay, n as blankDraft, r as eventToDraft, t as EventDialog } from "./event-dialog-DiC1aGo6.js";
import { a as Button } from "./field-DTONP9Vl.js";
import { t as PageShell } from "./page-shell-LKIFRGur.js";
import { t as briefTodayAi } from "./ai-D9NYhU2B.js";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
//#region src/routes/today.tsx?tsr-split=component
function TodayPage() {
	const mounted = useMounted();
	const now = useNow();
	const today = format(now, "yyyy-MM-dd");
	const events = useScheduleStore((s) => s.events);
	const toggleComplete = useScheduleStore((s) => s.toggleComplete);
	const updateEvent = useScheduleStore((s) => s.updateEvent);
	const deleteEvent = useScheduleStore((s) => s.deleteEvent);
	const addDrafts = useScheduleStore((s) => s.addDrafts);
	const list = useMemo(() => sortEvents(events.filter((e) => e.date === today)), [events, today]);
	const [editing, setEditing] = useState(null);
	const [creating, setCreating] = useState(false);
	const [brief, setBrief] = useState(null);
	const [briefing, setBriefing] = useState(false);
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
	if (!mounted) return /* @__PURE__ */ jsx("div", { className: "min-h-dvh bg-canvas" });
	return /* @__PURE__ */ jsxs(PageShell, {
		title: "今日",
		subtitle: format(now, "yyyy年 M月d日 EEEE", { locale: zhCN }),
		action: /* @__PURE__ */ jsx(Button, {
			variant: "ghost",
			size: "icon",
			"aria-label": "添加",
			onClick: () => setCreating(true),
			children: /* @__PURE__ */ jsx(Plus, {
				className: "size-5",
				strokeWidth: 1.7
			})
		}),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "mb-6 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ jsxs("p", {
					className: "text-sm text-muted",
					children: [
						list.length,
						" 件 · 完成 ",
						list.filter((e) => e.completed).length
					]
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: requestBrief,
					disabled: briefing,
					className: "text-xs tracking-wide text-subtle underline-offset-4 hover:text-ink hover:underline disabled:opacity-40",
					children: briefing ? "在写…" : "今日简报"
				})]
			}),
			brief ? /* @__PURE__ */ jsx("p", {
				className: "mb-6 rounded-lg bg-paper px-4 py-3 text-sm leading-relaxed text-ink shadow-card",
				children: brief
			}) : null,
			list.length === 0 ? /* @__PURE__ */ jsx(EmptyDay, {}) : /* @__PURE__ */ jsx("div", {
				className: "stagger-in flex flex-col gap-2.5",
				children: list.map((e) => /* @__PURE__ */ jsx(EventCard, {
					event: e,
					onToggle: () => toggleComplete(e.id),
					onOpen: () => setEditing(e),
					onDelete: () => {
						deleteEvent(e.id);
						toast("已删除");
					}
				}, e.id))
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-8 text-center",
				children: /* @__PURE__ */ jsx(Link, {
					to: "/compose",
					className: "text-sm text-muted underline-offset-4 hover:text-ink hover:underline",
					children: "用一句话添加多件"
				})
			}),
			/* @__PURE__ */ jsx(EventDialog, {
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
			/* @__PURE__ */ jsx(EventDialog, {
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
