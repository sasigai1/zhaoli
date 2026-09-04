import { n as useMounted, o as sortEvents, r as useNow, s as useScheduleStore } from "./router-Dzn3OfJZ.js";
import { a as EventCard, n as blankDraft, r as eventToDraft, t as EventDialog } from "./event-dialog-DiC1aGo6.js";
import { t as PageShell } from "./page-shell-LKIFRGur.js";
import { useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { addDays, format, isToday } from "date-fns";
import { zhCN } from "date-fns/locale";
//#region src/routes/timeline.tsx?tsr-split=component
function TimelinePage() {
	const mounted = useMounted();
	const now = useNow();
	const events = useScheduleStore((s) => s.events);
	const toggleComplete = useScheduleStore((s) => s.toggleComplete);
	const updateEvent = useScheduleStore((s) => s.updateEvent);
	const deleteEvent = useScheduleStore((s) => s.deleteEvent);
	const [editing, setEditing] = useState(null);
	const [range, setRange] = useState("near");
	const days = useMemo(() => {
		if (range === "all") {
			const dates = [...new Set(events.map((e) => e.date))].sort();
			if (dates.length === 0) return Array.from({ length: 14 }, (_, i) => format(addDays(now, i - 3), "yyyy-MM-dd"));
			return dates;
		}
		return Array.from({ length: 21 }, (_, i) => format(addDays(now, i - 3), "yyyy-MM-dd"));
	}, [
		events,
		now,
		range
	]);
	const grouped = useMemo(() => {
		return days.map((iso) => ({
			iso,
			items: sortEvents(events.filter((e) => e.date === iso))
		}));
	}, [days, events]);
	if (!mounted) return /* @__PURE__ */ jsx("div", { className: "min-h-dvh bg-canvas" });
	return /* @__PURE__ */ jsxs(PageShell, {
		title: "时间线",
		subtitle: "日子排成一条线。过去三天，往后看三周。",
		action: /* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: () => setRange((r) => r === "near" ? "all" : "near"),
			className: "px-2 text-xs tracking-wide text-muted hover:text-ink",
			children: range === "near" ? "全部" : "近段"
		}),
		children: [/* @__PURE__ */ jsx("ol", {
			className: "relative border-l border-line pl-6",
			children: grouped.map(({ iso, items }) => {
				const d = /* @__PURE__ */ new Date(`${iso}T12:00:00`);
				const today = isToday(d);
				return /* @__PURE__ */ jsxs("li", {
					className: "relative mb-8 last:mb-0",
					children: [
						/* @__PURE__ */ jsx("span", { className: `absolute top-1.5 -left-[31px] size-2.5 rounded-full ${today ? "bg-ink" : items.length ? "bg-bronze" : "bg-line"}` }),
						/* @__PURE__ */ jsxs("p", {
							className: `font-display text-sm ${today ? "text-ink" : "text-muted"}`,
							children: [format(d, "M月d日 EEE", { locale: zhCN }), today ? " · 今天" : ""]
						}),
						items.length === 0 ? null : /* @__PURE__ */ jsx("div", {
							className: "mt-3 flex flex-col gap-2",
							children: items.map((e) => /* @__PURE__ */ jsx(EventCard, {
								event: e,
								onToggle: () => toggleComplete(e.id),
								onOpen: () => setEditing(e),
								onDelete: () => deleteEvent(e.id)
							}, e.id))
						})
					]
				}, iso);
			})
		}), /* @__PURE__ */ jsx(EventDialog, {
			open: Boolean(editing),
			onOpenChange: (v) => !v && setEditing(null),
			title: "编辑",
			initial: editing ? eventToDraft(editing) : blankDraft(),
			submitLabel: "保存",
			onSubmit: (d) => editing && updateEvent(editing.id, d)
		})]
	});
}
//#endregion
export { TimelinePage as component };
