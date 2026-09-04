import { c as formatTimeLabel, f as cn, n as useMounted, o as sortEvents, r as useNow, s as useScheduleStore } from "./router-Dzn3OfJZ.js";
import { t as SundialMark } from "./sundial-mark-yY198ndL.js";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Settings } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
//#region src/components/disc/orbit-disc.tsx
var DISC_RINGS = [
	{
		id: "today",
		to: "/today",
		label: "今日",
		hint: "当天的安排",
		r: 172
	},
	{
		id: "compose",
		to: "/compose",
		label: "添加",
		hint: "一句话记下多件",
		r: 144
	},
	{
		id: "month",
		to: "/month",
		label: "月历",
		hint: "按月翻看",
		r: 116
	},
	{
		id: "calendar",
		to: "/calendar",
		label: "日历",
		hint: "任意年月",
		r: 88
	},
	{
		id: "timeline",
		to: "/timeline",
		label: "时间线",
		hint: "日子连成一条",
		r: 60
	},
	{
		id: "insights",
		to: "/insights",
		label: "分析",
		hint: "回看节奏",
		r: 36
	}
];
var GROOVES = [
	184,
	156,
	128,
	100,
	72,
	48
];
function OrbitDisc({ now, todayCount }) {
	const navigate = useNavigate();
	const [hover, setHover] = useState(null);
	const sunRad = ((now.getHours() * 60 + now.getMinutes()) / 1440 * 360 - 90) * Math.PI / 180;
	const sunR = 184;
	const sunX = 200 + Math.cos(sunRad) * sunR;
	const sunY = 200 + Math.sin(sunRad) * sunR;
	return /* @__PURE__ */ jsxs("div", {
		className: "flex w-full flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-center lg:gap-14",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "relative aspect-square w-full max-w-[min(520px,88vw)]",
			children: [/* @__PURE__ */ jsxs("svg", {
				viewBox: "0 0 400 400",
				className: "h-full w-full overflow-visible",
				role: "img",
				"aria-label": "日晷导航圆盘",
				children: [
					/* @__PURE__ */ jsxs("defs", { children: [/* @__PURE__ */ jsxs("radialGradient", {
						id: "plate",
						cx: "50%",
						cy: "46%",
						r: "54%",
						children: [
							/* @__PURE__ */ jsx("stop", {
								offset: "0%",
								stopColor: "var(--color-paper)"
							}),
							/* @__PURE__ */ jsx("stop", {
								offset: "72%",
								stopColor: "var(--color-canvas)"
							}),
							/* @__PURE__ */ jsx("stop", {
								offset: "100%",
								stopColor: "var(--color-inset)"
							})
						]
					}), /* @__PURE__ */ jsx("filter", {
						id: "soft",
						x: "-20%",
						y: "-20%",
						width: "140%",
						height: "140%",
						children: /* @__PURE__ */ jsx("feDropShadow", {
							dx: "0",
							dy: "10",
							stdDeviation: "12",
							floodColor: "#1c1b18",
							floodOpacity: "0.08"
						})
					})] }),
					/* @__PURE__ */ jsx("circle", {
						cx: "200",
						cy: "200",
						r: "196",
						fill: "url(#plate)",
						filter: "url(#soft)"
					}),
					/* @__PURE__ */ jsx("circle", {
						cx: "200",
						cy: "200",
						r: "196",
						fill: "none",
						stroke: "var(--color-line)",
						strokeWidth: "1"
					}),
					/* @__PURE__ */ jsx("g", {
						className: "sundial-spin",
						children: Array.from({ length: 72 }, (_, i) => {
							const a = i / 72 * Math.PI * 2;
							const long = i % 6 === 0;
							const r1 = long ? 188 : 192;
							const r2 = 196;
							return /* @__PURE__ */ jsx("line", {
								x1: 200 + Math.cos(a) * r1,
								y1: 200 + Math.sin(a) * r1,
								x2: 200 + Math.cos(a) * r2,
								y2: 200 + Math.sin(a) * r2,
								stroke: "currentColor",
								strokeOpacity: long ? .32 : .12,
								strokeWidth: long ? 1.2 : .8
							}, i);
						})
					}),
					GROOVES.map((r) => /* @__PURE__ */ jsx("circle", {
						cx: "200",
						cy: "200",
						r,
						fill: "none",
						stroke: "currentColor",
						strokeOpacity: "0.16",
						strokeWidth: "1"
					}, r)),
					DISC_RINGS.map((ring) => {
						const active = hover === ring.id;
						return /* @__PURE__ */ jsx("circle", {
							cx: "200",
							cy: "200",
							r: ring.r,
							fill: "none",
							stroke: "currentColor",
							strokeOpacity: active ? .28 : .08,
							strokeWidth: ring.id === "insights" ? 18 : 24,
							className: "cursor-pointer",
							style: {
								transitionProperty: "stroke-opacity",
								transitionDuration: "200ms"
							},
							onMouseEnter: () => setHover(ring.id),
							onMouseLeave: () => setHover((h) => h === ring.id ? null : h),
							onClick: () => navigate({ to: ring.to }),
							onKeyDown: (e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									navigate({ to: ring.to });
								}
							},
							tabIndex: 0,
							role: "link",
							"aria-label": ring.label
						}, ring.id);
					}),
					/* @__PURE__ */ jsx("line", {
						x1: "200",
						y1: "200",
						x2: sunX,
						y2: sunY,
						stroke: "var(--color-bronze)",
						strokeWidth: "1.25",
						strokeLinecap: "round",
						opacity: "0.75"
					}),
					/* @__PURE__ */ jsx("circle", {
						cx: sunX,
						cy: sunY,
						r: "4.2",
						fill: "var(--color-bronze)"
					}),
					/* @__PURE__ */ jsx("circle", {
						cx: "200",
						cy: "200",
						r: "27",
						fill: "var(--color-paper)",
						stroke: "var(--color-line)",
						strokeWidth: "1"
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-1",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "font-display text-[11px] tracking-[0.22em] text-muted",
						children: format(now, "M月", { locale: zhCN })
					}),
					/* @__PURE__ */ jsx("p", {
						className: "font-display text-[42px] leading-none tracking-tight text-ink tabular",
						children: format(now, "d")
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mt-1 text-[11px] tracking-[0.18em] text-subtle",
						children: [format(now, "EEE", { locale: zhCN }), todayCount > 0 ? ` · ${todayCount}` : ""]
					})
				]
			})]
		}), /* @__PURE__ */ jsx("nav", {
			"aria-label": "圆盘分层",
			className: "grid w-full max-w-sm grid-cols-2 gap-2 sm:gap-3 lg:w-56 lg:grid-cols-1",
			children: DISC_RINGS.map((ring, i) => {
				const active = hover === ring.id;
				return /* @__PURE__ */ jsxs("button", {
					type: "button",
					onMouseEnter: () => setHover(ring.id),
					onMouseLeave: () => setHover((h) => h === ring.id ? null : h),
					onClick: () => navigate({ to: ring.to }),
					className: cn("flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-[background-color,box-shadow] duration-150", active ? "bg-paper shadow-card" : "hover:bg-paper/70"),
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-display text-xs tabular text-subtle",
						"aria-hidden": "true",
						children: String(i + 1).padStart(2, "0")
					}), /* @__PURE__ */ jsxs("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ jsx("span", {
							className: "block text-sm font-medium tracking-wide",
							children: ring.label
						}), /* @__PURE__ */ jsx("span", {
							className: "hidden text-xs text-subtle lg:block",
							children: ring.hint
						})]
					})]
				}, ring.id);
			})
		})]
	});
}
//#endregion
//#region src/routes/index.tsx?tsr-split=component
function Home() {
	const mounted = useMounted();
	const now = useNow(3e4);
	const events = useScheduleStore((s) => s.events);
	const today = format(now, "yyyy-MM-dd");
	const todays = sortEvents(events.filter((e) => e.date === today));
	const next = todays.find((e) => {
		if (e.completed) return false;
		if (e.allDay || !e.startTime) return true;
		return e.startTime >= format(now, "HH:mm");
	}) ?? todays.find((e) => !e.completed);
	if (!mounted) return /* @__PURE__ */ jsx("div", {
		className: "min-h-dvh bg-canvas text-ink",
		children: /* @__PURE__ */ jsx("header", {
			className: "flex items-center justify-between px-5 pt-5 sm:px-8",
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ jsx(SundialMark, { size: 22 }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "font-display text-lg leading-none tracking-[0.08em]",
					children: "日晷"
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-1 text-[10px] tracking-[0.28em] text-subtle uppercase",
					children: "Sundial"
				})] })]
			})
		})
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "relative min-h-dvh overflow-x-hidden bg-canvas text-ink",
		children: [/* @__PURE__ */ jsxs("header", {
			className: "flex items-center justify-between px-5 pt-5 sm:px-8",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ jsx(SundialMark, { size: 22 }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "font-display text-lg leading-none tracking-[0.08em]",
					children: "日晷"
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-1 text-[10px] tracking-[0.28em] text-subtle uppercase",
					children: "Sundial"
				})] })]
			}), /* @__PURE__ */ jsx(Link, {
				to: "/settings",
				"aria-label": "设置",
				className: "flex size-11 items-center justify-center rounded-full text-muted transition-[background-color,color] duration-150 hover:bg-inset hover:text-ink",
				children: /* @__PURE__ */ jsx(Settings, {
					className: "size-5",
					strokeWidth: 1.6
				})
			})]
		}), /* @__PURE__ */ jsxs("main", {
			className: "flex flex-col items-center px-4 pb-10 pt-6 sm:pt-10",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "mb-6 text-center text-sm tracking-[0.18em] text-subtle",
					children: format(now, "yyyy年 M月d日", { locale: zhCN })
				}),
				/* @__PURE__ */ jsx(OrbitDisc, {
					now,
					todayCount: todays.length
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-10 w-full max-w-md",
					children: next ? /* @__PURE__ */ jsxs(Link, {
						to: "/today",
						className: "flex items-center gap-4 rounded-xl bg-paper px-4 py-4 shadow-card transition-[box-shadow] duration-150 hover:shadow-lift",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "size-2.5 shrink-0 rounded-full",
								style: { background: next.color }
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ jsx("span", {
									className: "block text-[11px] tracking-[0.18em] text-subtle",
									children: "下一件"
								}), /* @__PURE__ */ jsx("span", {
									className: "mt-0.5 block truncate text-[15px] font-medium",
									children: next.title
								})]
							}),
							/* @__PURE__ */ jsx("span", {
								className: "shrink-0 font-display text-sm tabular text-muted",
								children: formatTimeLabel(next.startTime, next.allDay)
							})
						]
					}) : /* @__PURE__ */ jsx("p", {
						className: "text-center text-sm text-subtle",
						children: "今天没有未完成的安排。"
					})
				})
			]
		})]
	});
}
//#endregion
export { Home as component };
