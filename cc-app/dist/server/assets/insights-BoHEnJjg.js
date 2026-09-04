import { i as TYPE_META, n as EVENT_TYPES } from "./types-DkEh41EK.js";
import { f as cn, n as useMounted, r as useNow, s as useScheduleStore } from "./router-Dzn3OfJZ.js";
import { t as PageShell } from "./page-shell-LKIFRGur.js";
import { useMemo } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { addDays, format, startOfWeek } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
//#region src/lib/schedule/stats.ts
function durationHours(e) {
	if (e.allDay || !e.startTime) return 1;
	if (!e.endTime) return 1;
	const [sh, sm] = e.startTime.split(":").map(Number);
	const [eh, em] = e.endTime.split(":").map(Number);
	const mins = eh * 60 + em - (sh * 60 + sm);
	return Math.max(mins, 30) / 60;
}
function computeStats(events, now = /* @__PURE__ */ new Date()) {
	const today = format(now, "yyyy-MM-dd");
	const weekStart = startOfWeek(now, { weekStartsOn: 1 });
	const weekDates = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), "yyyy-MM-dd"));
	const weekEvents = events.filter((e) => weekDates.includes(e.date));
	const done = weekEvents.filter((e) => e.completed).length;
	const byType = {
		work: {
			count: 0,
			hours: 0
		},
		personal: {
			count: 0,
			hours: 0
		},
		health: {
			count: 0,
			hours: 0
		},
		study: {
			count: 0,
			hours: 0
		},
		social: {
			count: 0,
			hours: 0
		},
		focus: {
			count: 0,
			hours: 0
		},
		rest: {
			count: 0,
			hours: 0
		},
		other: {
			count: 0,
			hours: 0
		}
	};
	for (const e of weekEvents) {
		byType[e.type].count += 1;
		byType[e.type].hours += durationHours(e);
	}
	const typeRows = EVENT_TYPES.map((t) => ({
		type: t,
		label: TYPE_META[t].label,
		color: TYPE_META[t].swatch,
		count: byType[t].count,
		hours: Math.round(byType[t].hours * 10) / 10
	})).filter((r) => r.count > 0);
	const weekdayBusy = Array.from({ length: 7 }, (_, i) => {
		const iso = weekDates[i];
		const count = events.filter((e) => e.date === iso).length;
		return {
			iso,
			label: [
				"一",
				"二",
				"三",
				"四",
				"五",
				"六",
				"日"
			][i],
			count
		};
	});
	const heatStart = addDays(now, -77 - (now.getDay() + 6) % 7);
	const heat = [];
	for (let i = 0; i < 84; i++) {
		const iso = format(addDays(heatStart, i), "yyyy-MM-dd");
		heat.push({
			iso,
			count: events.filter((e) => e.date === iso).length
		});
	}
	const upcoming = events.filter((e) => e.date >= today && !e.completed).sort((a, b) => `${a.date}${a.startTime ?? ""}`.localeCompare(`${b.date}${b.startTime ?? ""}`));
	const overdue = events.filter((e) => e.date < today && !e.completed).length;
	return {
		total: events.length,
		weekCount: weekEvents.length,
		weekDone: done,
		weekRate: weekEvents.length ? Math.round(done / weekEvents.length * 100) : 0,
		typeRows,
		weekdayBusy,
		heat,
		upcomingCount: upcoming.length,
		overdue,
		todayCount: events.filter((e) => e.date === today).length
	};
}
//#endregion
//#region src/routes/insights.tsx?tsr-split=component
function InsightsPage() {
	const mounted = useMounted();
	const now = useNow();
	const events = useScheduleStore((s) => s.events);
	const stats = useMemo(() => computeStats(events, now), [events, now]);
	if (!mounted) return /* @__PURE__ */ jsx("div", { className: "min-h-dvh bg-canvas" });
	const maxWeek = Math.max(1, ...stats.weekdayBusy.map((d) => d.count));
	const maxHeat = Math.max(1, ...stats.heat.map((d) => d.count));
	return /* @__PURE__ */ jsxs(PageShell, {
		title: "分析",
		subtitle: "只看这一周的节奏，和最近十二周的疏密。",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					{
						k: "本周",
						v: stats.weekCount,
						u: "件"
					},
					{
						k: "完成",
						v: `${stats.weekRate}`,
						u: "%"
					},
					{
						k: "今日",
						v: stats.todayCount,
						u: "件"
					}
				].map((s) => /* @__PURE__ */ jsxs("div", {
					className: "rounded-lg bg-paper px-3 py-4 text-center shadow-card",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[11px] tracking-[0.16em] text-subtle",
						children: s.k
					}), /* @__PURE__ */ jsxs("p", {
						className: "mt-1 font-display text-2xl tabular leading-none",
						children: [s.v, /* @__PURE__ */ jsx("span", {
							className: "ml-0.5 text-xs text-subtle",
							children: s.u
						})]
					})]
				}, s.k))
			}),
			stats.overdue > 0 ? /* @__PURE__ */ jsxs("p", {
				className: "mt-4 text-sm text-warn",
				children: [
					"有 ",
					stats.overdue,
					" 件已过期未完成。"
				]
			}) : null,
			/* @__PURE__ */ jsxs("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "mb-4 font-display text-lg",
					children: "类型"
				}), stats.typeRows.length === 0 ? /* @__PURE__ */ jsx("p", {
					className: "text-sm text-subtle",
					children: "本周还没有可统计的安排。"
				}) : /* @__PURE__ */ jsx("div", {
					className: "flex flex-col gap-3",
					children: stats.typeRows.map((row) => {
						const max = Math.max(1, ...stats.typeRows.map((r) => r.hours));
						return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
							className: "mb-1 flex items-baseline justify-between text-sm",
							children: [/* @__PURE__ */ jsx("span", { children: row.label }), /* @__PURE__ */ jsxs("span", {
								className: "tabular text-xs text-subtle",
								children: [
									row.count,
									" 件 · ",
									row.hours,
									"h"
								]
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "h-1.5 overflow-hidden rounded-full bg-inset",
							children: /* @__PURE__ */ jsx("div", {
								className: "h-full rounded-full",
								style: {
									width: `${row.hours / max * 100}%`,
									background: row.color
								}
							})
						})] }, row.type);
					})
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "mb-4 font-display text-lg",
					children: "一周疏密"
				}), /* @__PURE__ */ jsx("div", {
					className: "h-44 rounded-xl bg-paper p-3 shadow-card",
					children: /* @__PURE__ */ jsx(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ jsxs(BarChart, {
							data: stats.weekdayBusy,
							barCategoryGap: "28%",
							children: [
								/* @__PURE__ */ jsx(XAxis, {
									dataKey: "label",
									tickLine: false,
									axisLine: false,
									tick: {
										fill: "#9A958C",
										fontSize: 12
									}
								}),
								/* @__PURE__ */ jsx(YAxis, {
									hide: true,
									domain: [0, maxWeek]
								}),
								/* @__PURE__ */ jsx(Tooltip, {
									cursor: { fill: "rgba(28,27,24,0.04)" },
									contentStyle: {
										background: "#FBF8F3",
										border: "none",
										borderRadius: 12,
										boxShadow: "0 8px 24px -8px rgba(28,27,24,0.12)",
										fontSize: 12
									},
									formatter: (value) => [`${value} 件`, "安排"]
								}),
								/* @__PURE__ */ jsx(Bar, {
									dataKey: "count",
									fill: "#1C1B18",
									radius: [
										4,
										4,
										0,
										0
									],
									maxBarSize: 28
								})
							]
						})
					})
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-10",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "mb-1 font-display text-lg",
						children: "十二周"
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mb-4 text-xs text-subtle",
						children: [format(now, "M月d日", { locale: zhCN }), " 往前看。颜色越深，那天越满。"]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "flex gap-1 overflow-x-auto pb-1",
						children: Array.from({ length: 12 }, (_, w) => /* @__PURE__ */ jsx("div", {
							className: "flex flex-col gap-1",
							children: stats.heat.slice(w * 7, w * 7 + 7).map((cell) => /* @__PURE__ */ jsx("div", {
								title: `${cell.iso} · ${cell.count}`,
								className: cn("size-3 rounded-[3px]"),
								style: { background: cell.count === 0 ? "#E8E3DA" : `color-mix(in oklab, #1C1B18 ${Math.min(90, 22 + cell.count / maxHeat * 70)}%, #E8E3DA)` }
							}, cell.iso))
						}, w))
					})
				]
			})
		]
	});
}
//#endregion
export { InsightsPage as component };
