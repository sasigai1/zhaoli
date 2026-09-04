import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as startOfMonth, f as endOfMonth, g as startOfWeek, l as format, o as isToday, s as isSameMonth, t as zhCN, u as endOfWeek, v as addDays } from "../_libs/date-fns.mjs";
import { f as cn } from "./router-pw5uqWPz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/month-grid-CXRNYn0Q.js
var import_jsx_runtime = require_jsx_runtime();
var WEEKDAYS_MON = [
	"一",
	"二",
	"三",
	"四",
	"五",
	"六",
	"日"
];
var WEEKDAYS_SUN = [
	"日",
	"一",
	"二",
	"三",
	"四",
	"五",
	"六"
];
function MonthGrid({ month, events, selected, onSelect, weekStartsOn = 1, compact }) {
	const start = startOfWeek(startOfMonth(month), { weekStartsOn });
	const end = endOfWeek(endOfMonth(month), { weekStartsOn });
	const days = [];
	for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
	const byDate = /* @__PURE__ */ new Map();
	for (const e of events) {
		const list = byDate.get(e.date) ?? [];
		list.push(e);
		byDate.set(e.date, list);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mb-2 grid grid-cols-7 text-center text-[11px] tracking-[0.16em] text-subtle",
		children: (weekStartsOn === 1 ? WEEKDAYS_MON : WEEKDAYS_SUN).map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "py-1",
			children: w
		}, w))
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-7 gap-1",
		children: days.map((d) => {
			const iso = format(d, "yyyy-MM-dd");
			const inMonth = isSameMonth(d, month);
			const list = byDate.get(iso) ?? [];
			const today = isToday(d);
			const isSel = selected === iso;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onSelect?.(iso),
				className: cn("flex min-h-11 flex-col items-center rounded-md px-0.5 py-1.5 transition-[background-color,box-shadow] duration-150", compact ? "min-h-9 py-1" : "sm:min-h-16", !inMonth && "opacity-30", isSel ? "bg-ink text-paper" : today ? "bg-paper shadow-card" : "hover:bg-paper/80"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("font-display text-sm tabular leading-none", compact && "text-xs"),
					children: format(d, "d", { locale: zhCN })
				}), list.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1.5 flex items-center justify-center gap-0.5",
					children: list.slice(0, 3).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "size-1.5 rounded-full",
						style: { background: isSel ? "#FBF8F3" : e.color }
					}, e.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mt-1.5 size-1.5", compact && "hidden") })]
			}, iso);
		})
	})] });
}
//#endregion
export { MonthGrid as t };
