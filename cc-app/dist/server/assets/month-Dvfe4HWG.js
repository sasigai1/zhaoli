import { n as useMounted, o as sortEvents, r as useNow, s as useScheduleStore } from "./router-Dzn3OfJZ.js";
import { t as MonthGrid } from "./month-grid-CMbroHdA.js";
import { a as EventCard, i as EmptyDay, n as blankDraft, r as eventToDraft, t as EventDialog } from "./event-dialog-DiC1aGo6.js";
import { a as Button } from "./field-DTONP9Vl.js";
import { t as PageShell } from "./page-shell-LKIFRGur.js";
import { useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { addMonths, format } from "date-fns";
import { zhCN } from "date-fns/locale";
//#region src/routes/month.tsx?tsr-split=component
function MonthPage() {
	const mounted = useMounted();
	const now = useNow();
	const events = useScheduleStore((s) => s.events);
	const weekStartsOn = useScheduleStore((s) => s.settings.weekStartsOn);
	const toggleComplete = useScheduleStore((s) => s.toggleComplete);
	const updateEvent = useScheduleStore((s) => s.updateEvent);
	const deleteEvent = useScheduleStore((s) => s.deleteEvent);
	const addDrafts = useScheduleStore((s) => s.addDrafts);
	const [cursor, setCursor] = useState(() => /* @__PURE__ */ new Date());
	const [selected, setSelected] = useState(() => format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
	const [editing, setEditing] = useState(null);
	const [creating, setCreating] = useState(false);
	const dayEvents = useMemo(() => sortEvents(events.filter((e) => e.date === selected)), [events, selected]);
	if (!mounted) return /* @__PURE__ */ jsx("div", { className: "min-h-dvh bg-canvas" });
	return /* @__PURE__ */ jsxs(PageShell, {
		title: "月历",
		subtitle: "点一天，看这一天。",
		wide: true,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "mb-5 flex items-center justify-between",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "flex size-11 items-center justify-center rounded-full hover:bg-inset",
						onClick: () => setCursor((d) => addMonths(d, -1)),
						"aria-label": "上个月",
						children: /* @__PURE__ */ jsx(ChevronLeft, { className: "size-5" })
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "font-display text-xl tracking-wide",
						children: format(cursor, "yyyy年 M月", { locale: zhCN })
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "flex size-11 items-center justify-center rounded-full hover:bg-inset",
						onClick: () => setCursor((d) => addMonths(d, 1)),
						"aria-label": "下个月",
						children: /* @__PURE__ */ jsx(ChevronRight, { className: "size-5" })
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "rounded-xl bg-paper p-3 shadow-card sm:p-5",
				children: /* @__PURE__ */ jsx(MonthGrid, {
					month: cursor,
					events,
					selected,
					weekStartsOn,
					onSelect: (iso) => {
						setSelected(iso);
						setCursor(/* @__PURE__ */ new Date(`${iso}T12:00:00`));
					}
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-8 flex items-center justify-between",
				children: [/* @__PURE__ */ jsx("p", {
					className: "font-display text-lg",
					children: format(/* @__PURE__ */ new Date(`${selected}T12:00:00`), "M月d日 EEE", { locale: zhCN })
				}), /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "icon",
					"aria-label": "添加",
					onClick: () => setCreating(true),
					children: /* @__PURE__ */ jsx(Plus, { className: "size-5" })
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-3 flex flex-col gap-2.5",
				children: dayEvents.length === 0 ? /* @__PURE__ */ jsx(EmptyDay, { label: "这一天是空的。" }) : dayEvents.map((e) => /* @__PURE__ */ jsx(EventCard, {
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
				className: "mt-6 text-center",
				children: /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "text-xs text-subtle underline-offset-4 hover:text-ink hover:underline",
					onClick: () => {
						setCursor(now);
						setSelected(format(now, "yyyy-MM-dd"));
					},
					children: "回到本月"
				})
			}),
			/* @__PURE__ */ jsx(EventDialog, {
				open: creating,
				onOpenChange: setCreating,
				title: "新的一件",
				initial: blankDraft(selected),
				submitLabel: "加入",
				onSubmit: (d) => addDrafts([d])
			}),
			/* @__PURE__ */ jsx(EventDialog, {
				open: Boolean(editing),
				onOpenChange: (v) => !v && setEditing(null),
				title: "编辑",
				initial: editing ? eventToDraft(editing) : blankDraft(selected),
				submitLabel: "保存",
				onSubmit: (d) => editing && updateEvent(editing.id, d)
			})
		]
	});
}
//#endregion
export { MonthPage as component };
