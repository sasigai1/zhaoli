import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { l as format, o as isToday, t as zhCN, v as addDays } from "../_libs/date-fns.mjs";
import { n as useMounted, o as sortEvents, r as useNow, s as useScheduleStore } from "./router-pw5uqWPz.mjs";
import { a as eventToDraft, i as blankDraft, n as EventCard, r as EventDialog } from "./event-dialog-CcfBClHb.mjs";
import { t as PageShell } from "./page-shell-D8j_c2-V.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/timeline-CRApxl19.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TimelinePage() {
	const mounted = useMounted();
	const now = useNow();
	const events = useScheduleStore((s) => s.events);
	const toggleComplete = useScheduleStore((s) => s.toggleComplete);
	const updateEvent = useScheduleStore((s) => s.updateEvent);
	const deleteEvent = useScheduleStore((s) => s.deleteEvent);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [range, setRange] = (0, import_react.useState)("near");
	const days = (0, import_react.useMemo)(() => {
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
	const grouped = (0, import_react.useMemo)(() => {
		return days.map((iso) => ({
			iso,
			items: sortEvents(events.filter((e) => e.date === iso))
		}));
	}, [days, events]);
	if (!mounted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-canvas" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "时间线",
		subtitle: "日子排成一条线。过去三天，往后看三周。",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setRange((r) => r === "near" ? "all" : "near"),
			className: "px-2 text-xs tracking-wide text-muted hover:text-ink",
			children: range === "near" ? "全部" : "近段"
		}),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "relative border-l border-line pl-6",
			children: grouped.map(({ iso, items }) => {
				const d = /* @__PURE__ */ new Date(`${iso}T12:00:00`);
				const today = isToday(d);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "relative mb-8 last:mb-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute top-1.5 -left-[31px] size-2.5 rounded-full ${today ? "bg-ink" : items.length ? "bg-bronze" : "bg-line"}` }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: `font-display text-sm ${today ? "text-ink" : "text-muted"}`,
							children: [format(d, "M月d日 EEE", { locale: zhCN }), today ? " · 今天" : ""]
						}),
						items.length === 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-col gap-2",
							children: items.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventCard, {
								event: e,
								onToggle: () => toggleComplete(e.id),
								onOpen: () => setEditing(e),
								onDelete: () => deleteEvent(e.id)
							}, e.id))
						})
					]
				}, iso);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventDialog, {
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
