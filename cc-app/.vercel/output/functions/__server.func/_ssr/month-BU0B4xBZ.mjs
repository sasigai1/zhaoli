import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as ChevronRight, l as ChevronLeft, o as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as addMonths, l as format, t as zhCN } from "../_libs/date-fns.mjs";
import { n as useMounted, o as sortEvents, r as useNow, s as useScheduleStore } from "./router-pw5uqWPz.mjs";
import { t as MonthGrid } from "./month-grid-CXRNYn0Q.mjs";
import { t as Button } from "./field-2BuY3MwR.mjs";
import { a as eventToDraft, i as blankDraft, n as EventCard, r as EventDialog, t as EmptyDay } from "./event-dialog-CcfBClHb.mjs";
import { t as PageShell } from "./page-shell-D8j_c2-V.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/month-BU0B4xBZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MonthPage() {
	const mounted = useMounted();
	const now = useNow();
	const events = useScheduleStore((s) => s.events);
	const weekStartsOn = useScheduleStore((s) => s.settings.weekStartsOn);
	const toggleComplete = useScheduleStore((s) => s.toggleComplete);
	const updateEvent = useScheduleStore((s) => s.updateEvent);
	const deleteEvent = useScheduleStore((s) => s.deleteEvent);
	const addDrafts = useScheduleStore((s) => s.addDrafts);
	const [cursor, setCursor] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	const [selected, setSelected] = (0, import_react.useState)(() => format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const dayEvents = (0, import_react.useMemo)(() => sortEvents(events.filter((e) => e.date === selected)), [events, selected]);
	if (!mounted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-canvas" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "月历",
		subtitle: "点一天，看这一天。",
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex items-center justify-between",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "flex size-11 items-center justify-center rounded-full hover:bg-inset",
						onClick: () => setCursor((d) => addMonths(d, -1)),
						"aria-label": "上个月",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl tracking-wide",
						children: format(cursor, "yyyy年 M月", { locale: zhCN })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "flex size-11 items-center justify-center rounded-full hover:bg-inset",
						onClick: () => setCursor((d) => addMonths(d, 1)),
						"aria-label": "下个月",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl bg-paper p-3 shadow-card sm:p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthGrid, {
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg",
					children: format(/* @__PURE__ */ new Date(`${selected}T12:00:00`), "M月d日 EEE", { locale: zhCN })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					"aria-label": "添加",
					onClick: () => setCreating(true),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-col gap-2.5",
				children: dayEvents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyDay, { label: "这一天是空的。" }) : dayEvents.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventCard, {
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
				className: "mt-6 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-xs text-subtle underline-offset-4 hover:text-ink hover:underline",
					onClick: () => {
						setCursor(now);
						setSelected(format(now, "yyyy-MM-dd"));
					},
					children: "回到本月"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventDialog, {
				open: creating,
				onOpenChange: setCreating,
				title: "新的一件",
				initial: blankDraft(selected),
				submitLabel: "加入",
				onSubmit: (d) => addDrafts([d])
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventDialog, {
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
