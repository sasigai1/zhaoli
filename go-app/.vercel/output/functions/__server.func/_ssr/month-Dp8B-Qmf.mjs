import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { l as ChevronRight, u as ChevronLeft } from "../_libs/lucide-react.mjs";
import { _ as addMonths, a as isSameMonth, c as endOfWeek, d as endOfMonth, g as startOfWeek, i as parseISO, l as startOfMonth, p as isSameDay, s as format, t as zhCN, u as eachDayOfInterval } from "../_libs/date-fns.mjs";
import { E as useSchedule, a as KindDot, c as cn, d as eventsOnDay, h as formatRange, l as dateKey, t as AppShell, y as parseKey } from "./app-shell-w7DFgxfg.mjs";
import { t as useNow } from "./use-now-CAndyocM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/month-Dp8B-Qmf.js
var import_jsx_runtime = require_jsx_runtime();
function MonthView() {
	const now = useNow(3e4);
	const navigate = useNavigate();
	const events = useSchedule((s) => s.events);
	const selectedDate = useSchedule((s) => s.selectedDate);
	const setSelectedDate = useSchedule((s) => s.setSelectedDate);
	const selectEvent = useSchedule((s) => s.selectEvent);
	const monthAnchor = startOfMonth(parseKey(selectedDate));
	const grid = eachDayOfInterval({
		start: startOfWeek(startOfMonth(monthAnchor), { weekStartsOn: 1 }),
		end: endOfWeek(endOfMonth(monthAnchor), { weekStartsOn: 1 })
	});
	const selected = parseKey(selectedDate);
	const selectedEvents = eventsOnDay(events, selected);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between pt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "上个月",
						className: "flex size-11 items-center justify-center text-muted",
						onClick: () => setSelectedDate(dateKey(addMonths(monthAnchor, -1))),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-serif text-[28px] tracking-tight",
						children: format(monthAnchor, "yyyy年M月", { locale: zhCN })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "下个月",
						className: "flex size-11 items-center justify-center text-muted",
						onClick: () => setSelectedDate(dateKey(addMonths(monthAnchor, 1))),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid grid-cols-7 text-center text-[11px] tracking-[0.18em] text-muted",
				children: [
					"一",
					"二",
					"三",
					"四",
					"五",
					"六",
					"日"
				].map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "py-2",
					children: label
				}, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-7 gap-y-1",
				children: grid.map((day) => {
					const key = dateKey(day);
					const inMonth = isSameMonth(day, monthAnchor);
					const isToday = isSameDay(day, now);
					const isSelected = key === selectedDate;
					const has = eventsOnDay(events, day).length > 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSelectedDate(key),
						className: "flex min-h-11 flex-col items-center justify-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("flex size-9 items-center justify-center rounded-full font-serif text-lg tabular-nums transition-[background-color,color] duration-150", !inMonth && "text-faint", isSelected && "bg-ink text-sheet", isToday && !isSelected && "shadow-[inset_0_0_0_1px_var(--color-accent)]"),
							children: day.getDate()
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1 rounded-full", has ? "bg-accent" : "bg-transparent") })]
					}, key);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-serif text-xl",
						children: format(selected, "M月d日", { locale: zhCN })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-sm text-accent",
						onClick: () => navigate({ to: "/" }),
						children: "去这一天"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 space-y-2",
					children: selectedEvents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "py-6 text-sm text-muted",
						children: "这一天还是空白。"
					}) : selectedEvents.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => selectEvent(event.id),
						className: "flex w-full items-start gap-3 rounded-lg bg-paper px-3.5 py-3 text-left shadow-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindDot, {
							kind: event.kind,
							className: "mt-1.5"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate font-medium",
								children: event.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs tabular-nums text-muted",
								children: formatRange(parseISO(event.start), parseISO(event.end), event.allDay)
							})]
						})]
					}) }, event.id))
				})]
			})
		]
	});
}
function MonthPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		active: "month",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthView, {})
	});
}
//#endregion
export { MonthPage as component };
