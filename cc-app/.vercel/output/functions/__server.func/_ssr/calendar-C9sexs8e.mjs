import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as ChevronRight, l as ChevronLeft } from "../_libs/lucide-react.mjs";
import { l as format, n as setMonth, p as addYears, t as zhCN } from "../_libs/date-fns.mjs";
import { n as useMounted, o as sortEvents, r as useNow, s as useScheduleStore } from "./router-pw5uqWPz.mjs";
import { t as MonthGrid } from "./month-grid-CXRNYn0Q.mjs";
import { a as eventToDraft, i as blankDraft, n as EventCard, r as EventDialog, t as EmptyDay } from "./event-dialog-CcfBClHb.mjs";
import { t as PageShell } from "./page-shell-D8j_c2-V.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calendar-C9sexs8e.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CalendarPage() {
	const mounted = useMounted();
	const now = useNow();
	const events = useScheduleStore((s) => s.events);
	const weekStartsOn = useScheduleStore((s) => s.settings.weekStartsOn);
	const toggleComplete = useScheduleStore((s) => s.toggleComplete);
	const updateEvent = useScheduleStore((s) => s.updateEvent);
	const deleteEvent = useScheduleStore((s) => s.deleteEvent);
	const addDrafts = useScheduleStore((s) => s.addDrafts);
	const [year, setYear] = (0, import_react.useState)(() => (/* @__PURE__ */ new Date()).getFullYear());
	const [openMonth, setOpenMonth] = (0, import_react.useState)(null);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const yearEvents = (0, import_react.useMemo)(() => events.filter((e) => e.date.startsWith(String(year))), [events, year]);
	const dayEvents = (0, import_react.useMemo)(() => selected ? sortEvents(events.filter((e) => e.date === selected)) : [], [events, selected]);
	if (!mounted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-canvas" });
	const yearDate = new Date(year, 0, 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "日历",
		subtitle: "任意一年。点开某个月，再点某一天。",
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center justify-between",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "flex size-11 items-center justify-center rounded-full hover:bg-inset",
						onClick: () => {
							setYear((y) => y - 1);
							setOpenMonth(null);
							setSelected(null);
						},
						"aria-label": "上一年",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl tabular tracking-wide",
						children: year
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "flex size-11 items-center justify-center rounded-full hover:bg-inset",
						onClick: () => {
							setYear((y) => addYears(yearDate, 1).getFullYear());
							setOpenMonth(null);
							setSelected(null);
						},
						"aria-label": "下一年",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
				children: Array.from({ length: 12 }, (_, m) => {
					const monthDate = setMonth(yearDate, m);
					const count = yearEvents.filter((e) => e.date.slice(5, 7) === String(m + 1).padStart(2, "0")).length;
					const active = openMonth === m;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setOpenMonth(m);
							setSelected(null);
						},
						className: `rounded-lg px-3 py-4 text-left shadow-card transition-[background-color,box-shadow] duration-150 ${active ? "bg-ink text-paper" : "bg-paper hover:shadow-lift"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg",
							children: format(monthDate, "M月", { locale: zhCN })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `mt-1 text-xs ${active ? "text-paper/70" : "text-subtle"}`,
							children: count ? `${count} 件` : "空"
						})]
					}, m);
				})
			}),
			openMonth !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 rounded-xl bg-paper p-3 shadow-card sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 font-display text-lg",
					children: format(setMonth(yearDate, openMonth), "yyyy年 M月", { locale: zhCN })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthGrid, {
					month: setMonth(yearDate, openMonth),
					events,
					selected: selected ?? void 0,
					weekStartsOn,
					compact: true,
					onSelect: (iso) => setSelected(iso)
				})]
			}) : null,
			selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg",
						children: format(/* @__PURE__ */ new Date(`${selected}T12:00:00`), "M月d日 EEE", { locale: zhCN })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-sm text-muted underline-offset-4 hover:underline",
						onClick: () => setCreating(true),
						children: "添加"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2.5",
					children: dayEvents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyDay, { label: "这一天是空的。" }) : dayEvents.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventCard, {
						event: e,
						onToggle: () => toggleComplete(e.id),
						onOpen: () => setEditing(e),
						onDelete: () => deleteEvent(e.id)
					}, e.id))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-xs text-subtle underline-offset-4 hover:text-ink hover:underline",
					onClick: () => {
						setYear(now.getFullYear());
						setOpenMonth(now.getMonth());
						setSelected(format(now, "yyyy-MM-dd"));
					},
					children: "跳到今天"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventDialog, {
				open: creating,
				onOpenChange: setCreating,
				title: "新的一件",
				initial: blankDraft(selected ?? format(now, "yyyy-MM-dd")),
				submitLabel: "加入",
				onSubmit: (d) => addDrafts([d])
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventDialog, {
				open: Boolean(editing),
				onOpenChange: (v) => !v && setEditing(null),
				title: "编辑",
				initial: editing ? eventToDraft(editing) : blankDraft(),
				submitLabel: "保存",
				onSubmit: (d) => editing && updateEvent(editing.id, d)
			})
		]
	});
}
//#endregion
export { CalendarPage as component };
