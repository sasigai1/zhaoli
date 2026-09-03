import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as parseISO, p as isSameDay } from "../_libs/date-fns.mjs";
import { C as ribbonHours, D as weekDays, E as useSchedule, O as writeBrief, T as timedEvents, _ as minutesFromStart, a as KindDot, b as relativeLabel, c as cn, d as eventsOnDay, f as fingerprintEvents, g as formatWeekday, h as formatRange, i as KIND_LABEL, l as dateKey, m as formatDayTitle, p as formatClock, r as Button, s as allDayEvents, t as AppShell, u as eventMetrics, v as nextUp, w as sculptSchedule, x as remainingLabel, y as parseKey } from "./app-shell-w7DFgxfg.mjs";
import { t as useNow } from "./use-now-CAndyocM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BbWw2-s_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function overlaps(a, b) {
	return parseISO(a.start) < parseISO(b.end) && parseISO(b.start) < parseISO(a.end);
}
function layoutEvents(events) {
	const sorted = [...events].sort((a, b) => {
		const startDiff = +parseISO(a.start) - +parseISO(b.start);
		if (startDiff !== 0) return startDiff;
		return +parseISO(b.end) - +parseISO(a.end);
	});
	const clusters = [];
	for (const event of sorted) {
		const cluster = clusters.find((group) => group.some((other) => overlaps(event, other)));
		if (cluster) cluster.push(event);
		else clusters.push([event]);
	}
	const result = [];
	for (const cluster of clusters) {
		const colEnds = [];
		const assigned = [];
		for (const event of cluster) {
			const start = +parseISO(event.start);
			let col = colEnds.findIndex((end) => end <= start);
			if (col === -1) {
				col = colEnds.length;
				colEnds.push(+parseISO(event.end));
			} else colEnds[col] = +parseISO(event.end);
			assigned.push({
				...event,
				col
			});
		}
		const colCount = Math.max(colEnds.length, 1);
		for (const item of assigned) result.push({
			...item,
			colCount
		});
	}
	return result;
}
function Ribbon({ events, startHour, endHour, now, showNow, onSelect }) {
	const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
	const height = hours.length * 72;
	const laid = layoutEvents(timedEvents(events));
	const nowTop = minutesFromStart(now, startHour) / 60 * 72;
	const nowVisible = showNow && nowTop >= 0 && nowTop <= height;
	(0, import_react.useEffect)(() => {
		if (!nowVisible) return;
		const marker = document.getElementById("now-marker");
		if (!marker) return;
		marker.scrollIntoView({
			block: "center",
			behavior: "smooth"
		});
	}, [
		nowVisible,
		startHour,
		endHour
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative manuscript-rule",
			style: { height },
			children: [
				hours.map((hour, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute right-0 left-0",
					style: {
						top: index * 72,
						height: 72
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute top-0 left-0 w-10 -translate-y-1/2 font-serif text-xs tabular-nums text-faint",
						children: String(hour).padStart(2, "0")
					})
				}, hour)),
				laid.map((event) => {
					const { top, height: blockH } = eventMetrics(event, startHour);
					const width = `calc((100% - 52px) / ${event.colCount})`;
					const left = `calc(52px + ((100% - 52px) / ${event.colCount}) * ${event.col})`;
					const compact = blockH < 56;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onSelect(event.id),
						className: "absolute rounded-md bg-sheet px-3 py-2 text-left shadow-card transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.99]",
						style: {
							top,
							height: blockH,
							width,
							left,
							paddingRight: event.colCount > 1 ? 10 : 12
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-2 bottom-2 left-1.5 w-px bg-accent/80" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex items-start gap-2 pl-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("block truncate", compact ? "text-sm font-medium" : "font-serif text-[15px]"),
									children: event.title
								}), !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-0.5 flex items-center gap-1.5 text-xs text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindDot, { kind: event.kind }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "tabular-nums",
											children: formatRange(parseISO(event.start), parseISO(event.end), false)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-faint",
											children: KIND_LABEL[event.kind]
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] tabular-nums text-muted",
									children: formatClock(parseISO(event.start))
								})]
							})
						})]
					}, event.id);
				}),
				nowVisible ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					id: "now-marker",
					className: "pointer-events-none absolute right-0 left-0 z-10",
					style: { top: nowTop },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "now-dot relative z-10 ml-[38px] size-2 rounded-full bg-accent" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-accent" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "pl-2 font-serif text-[11px] tracking-wide text-accent",
								children: "此刻"
							})
						]
					})
				}) : null
			]
		})
	});
}
function TodayView() {
	const now = useNow(1e3);
	const events = useSchedule((s) => s.events);
	const selectedDate = useSchedule((s) => s.selectedDate);
	const setSelectedDate = useSchedule((s) => s.setSelectedDate);
	const selectEvent = useSchedule((s) => s.selectEvent);
	const openComposer = useSchedule((s) => s.openComposer);
	const briefs = useSchedule((s) => s.briefs);
	const saveBrief = useSchedule((s) => s.saveBrief);
	const updateEvent = useSchedule((s) => s.updateEvent);
	const day = parseKey(selectedDate);
	const viewingToday = isSameDay(day, now);
	const dayEvents = eventsOnDay(events, day);
	const allDay = allDayEvents(dayEvents);
	const { startHour, endHour } = ribbonHours(dayEvents, now, viewingToday);
	const upcoming = nextUp(dayEvents, now) ?? nextUp(events, now);
	const upcomingIsToday = upcoming ? dateKey(upcoming.event.start) === selectedDate : false;
	const brief = briefs[selectedDate];
	const fingerprint = fingerprintEvents(dayEvents);
	const briefStale = Boolean(brief && brief.fingerprint !== fingerprint);
	const [briefing, setBriefing] = (0, import_react.useState)(false);
	const [sculpting, setSculpting] = (0, import_react.useState)(false);
	const [sculpt, setSculpt] = (0, import_react.useState)(null);
	const week = weekDays(day);
	const requestBrief = async () => {
		setBriefing(true);
		try {
			const result = await writeBrief({ data: {
				nowIso: now.toISOString(),
				date: selectedDate,
				events: dayEvents.map((event) => ({
					title: event.title,
					start: event.start,
					end: event.end,
					allDay: event.allDay,
					kind: event.kind
				}))
			} });
			if (!result.ok) {
				toast(result.error);
				return;
			}
			saveBrief({
				date: selectedDate,
				headline: result.headline,
				body: result.body,
				energy: result.energy,
				fingerprint,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			});
		} catch {
			toast("日简没有写完，请稍后再试。");
		} finally {
			setBriefing(false);
		}
	};
	const requestSculpt = async () => {
		setSculpting(true);
		try {
			const result = await sculptSchedule({ data: {
				nowIso: now.toISOString(),
				date: selectedDate,
				events: dayEvents.map((event) => ({
					id: event.id,
					title: event.title,
					start: event.start,
					end: event.end,
					allDay: event.allDay,
					kind: event.kind
				}))
			} });
			if (!result.ok) {
				toast(result.error);
				return;
			}
			setSculpt({
				summary: result.summary,
				moves: result.moves
			});
		} catch {
			toast("疏时未能完成。");
		} finally {
			setSculpting(false);
		}
	};
	const applySculpt = () => {
		if (!sculpt) return;
		for (const move of sculpt.moves) updateEvent(move.id, {
			start: move.newStart,
			end: move.newEnd,
			reminderFired: false
		});
		toast("已按此调整");
		setSculpt(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rise-in flex gap-1 pt-1",
				children: week.map((item) => {
					const key = dateKey(item);
					const active = key === selectedDate;
					const isToday = isSameDay(item, now);
					const has = eventsOnDay(events, item).length > 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSelectedDate(key),
						className: cn("flex h-14 min-h-11 flex-1 flex-col items-center justify-center rounded-md transition-[background-color,color] duration-150 ease-out", active ? "bg-ink text-sheet" : "text-muted hover:text-ink"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] tracking-widest",
								children: [
									"一",
									"二",
									"三",
									"四",
									"五",
									"六",
									"日"
								][item.getDay() === 0 ? 6 : item.getDay() - 1]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-serif text-lg leading-none tabular-nums",
								children: item.getDate()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mt-1 size-1 rounded-full", has ? active ? "bg-sheet" : "bg-accent" : "bg-transparent", isToday && !has ? active ? "bg-sheet/70" : "bg-faint" : "") })
						]
					}, key);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise-in rise-in-1 mt-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm tracking-[0.2em] text-muted",
						children: formatWeekday(day)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-serif text-[40px] leading-none tracking-tight",
						children: formatDayTitle(day)
					}),
					viewingToday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 font-serif text-[56px] leading-none tabular-nums tracking-tight",
						children: formatClock(now)
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setSelectedDate(dateKey(now)),
						className: "mt-4 text-sm text-accent",
						children: "回到今天"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "rise-in rise-in-2 mt-6 min-h-16",
				children: upcoming ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => selectEvent(upcoming.event.id),
					className: "w-full rounded-lg bg-paper px-4 py-3.5 text-left shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] tracking-[0.22em] text-muted",
							children: upcoming.status === "now" ? "正在进行" : upcomingIsToday ? "接下来" : "下一件事"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 font-serif text-xl leading-snug",
							children: upcoming.event.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums",
									children: [
										upcomingIsToday ? "" : `${formatDayTitle(parseISO(upcoming.event.start))} `,
										formatClock(parseISO(upcoming.event.start)),
										" – ",
										formatClock(parseISO(upcoming.event.end))
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mx-1.5 text-faint",
									children: "·"
								}),
								upcoming.status === "now" ? remainingLabel(now, parseISO(upcoming.event.end)) : relativeLabel(now, parseISO(upcoming.event.start))
							]
						})
					]
				}) : dayEvents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-paper px-4 py-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-serif text-lg",
							children: "今天还是一张白纸"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "写下第一件事，纸面就有了秩序。"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4",
							size: "sm",
							onClick: openComposer,
							children: "写下"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: viewingToday ? "今晚无事，纸面留白。" : "这一天已经排完。"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise-in rise-in-3 mt-5 flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "soft",
						size: "pill",
						disabled: briefing,
						onClick: requestBrief,
						children: briefing ? "正在写日简" : brief ? "更新日简" : "写日简"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "pill",
						disabled: sculpting || dayEvents.length === 0,
						onClick: requestSculpt,
						children: sculpting ? "正在疏时" : "疏时"
					}),
					briefStale ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: "日程已改"
					}) : null
				]
			}),
			brief ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "mt-4 rounded-lg px-1 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-serif text-lg leading-snug",
					children: brief.headline
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5 text-sm leading-relaxed text-muted",
					children: brief.body
				})]
			}) : null,
			sculpt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "mt-4 rounded-lg bg-paper px-4 py-4 shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed",
						children: sculpt.summary
					}),
					sculpt.moves.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-2",
						children: sculpt.moves.map((move) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: move.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mx-1.5 text-faint",
									children: "·"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums text-muted",
									children: [
										formatClock(parseISO(move.newStart)),
										" – ",
										formatClock(parseISO(move.newEnd))
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: move.reason
								})
							]
						}, move.id))
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex gap-2",
						children: [sculpt.moves.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: applySculpt,
							children: "按此调整"
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => setSculpt(null),
							children: "收起"
						})]
					})
				]
			}) : null,
			allDay.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: allDay.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => selectEvent(event.id),
					className: "inline-flex items-center gap-2 rounded-full bg-paper px-3 py-2 text-sm shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindDot, { kind: event.kind }), event.title]
				}, event.id))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-baseline justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] tracking-[0.22em] text-muted",
						children: "一日之序"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs tabular-nums text-muted",
						children: [dayEvents.length, " 件事"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ribbon, {
					events: dayEvents,
					startHour,
					endHour,
					now,
					showNow: viewingToday,
					onSelect: selectEvent
				})]
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		active: "today",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TodayView, {})
	});
}
//#endregion
export { Home as component };
