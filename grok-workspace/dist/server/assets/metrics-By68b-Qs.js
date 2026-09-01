import { C as localIsoDate, O as unfiledGaps, T as padCount, a as useLedger, d as completeness, h as filledItems, i as parseImportedLedger, l as TAGS, m as fileId, p as enumerateDays, r as exportPayload, s as MOODS, v as formatDisplayDate, x as glyphCount } from "./router-C8liBYT1.js";
import { t as cn } from "./utils-C_uf36nf.js";
import { t as Button } from "./button-lc9gu-sZ.js";
import { useMemo, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { eachDayOfInterval, parseISO, startOfMonth, startOfWeek, startOfYear, subDays } from "date-fns";
//#region src/components/metrics-view.tsx
function streak(records, today) {
	let n = 0;
	let cursor = today;
	if (records[today]?.status !== "filed") cursor = localIsoDate(subDays(parseISO(today), 1));
	while (records[cursor]?.status === "filed") {
		n += 1;
		cursor = localIsoDate(subDays(parseISO(cursor), 1));
		if (n > 400) break;
	}
	return n;
}
function MetricsView() {
	const today = localIsoDate();
	const records = useLedger((s) => s.records);
	const replaceAll = useLedger((s) => s.replaceAll);
	const fileRef = useRef(null);
	const stats = useMemo(() => {
		const todayDate = parseISO(today);
		const monthFrom = localIsoDate(startOfMonth(todayDate));
		const yearFrom = localIsoDate(startOfYear(todayDate));
		const monthDays = enumerateDays(monthFrom, today);
		const yearDays = enumerateDays(yearFrom, today);
		const filed = Object.values(records).filter((r) => r.status === "filed");
		const monthFiled = monthDays.filter((id) => records[id]?.status === "filed").length;
		const yearFiled = yearDays.filter((id) => records[id]?.status === "filed").length;
		const gaps = unfiledGaps(records, monthFrom, today);
		const words = filed.reduce((n, r) => n + glyphCount(r.body), 0);
		const avgWords = filed.length ? Math.round(words / filed.length) : 0;
		const avgComplete = filed.length === 0 ? 0 : Math.round(filed.reduce((n, r) => n + completeness(r).done, 0) / (filed.length * 5) * 1e3) / 10;
		const avgItems = filed.length === 0 ? 0 : Math.round(filed.reduce((n, r) => n + filledItems(r.items).length, 0) / filed.length * 10) / 10;
		const moodDist = [
			1,
			2,
			3,
			4,
			5
		].map((v) => filed.filter((r) => r.mood === v).length);
		const tagDist = TAGS.map((tag) => ({
			tag,
			n: filed.filter((r) => r.tags.includes(tag)).length
		})).sort((a, b) => b.n - a.n);
		const heatStart = startOfWeek(subDays(todayDate, 111), { weekStartsOn: 1 });
		const heatDays = eachDayOfInterval({
			start: heatStart,
			end: todayDate
		});
		return {
			monthFiled,
			monthTotal: monthDays.length,
			yearFiled,
			yearTotal: yearDays.length,
			gaps,
			words,
			avgWords,
			avgComplete,
			avgItems,
			moodDist,
			tagDist,
			heatDays: heatDays.map((d) => localIsoDate(d)),
			consecutive: streak(records, today),
			filedTotal: filed.length,
			first: filed[0]?.id
		};
	}, [records, today]);
	const onExport = () => {
		const payload = exportPayload(records);
		const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `FOLIO-${today}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};
	const onImport = async (file) => {
		try {
			const text = await file.text();
			const json = JSON.parse(text);
			const next = parseImportedLedger(json);
			if (!next) return;
			replaceAll(next);
		} catch {}
	};
	const rate = stats.monthTotal === 0 ? 0 : stats.monthFiled / stats.monthTotal * 100;
	return /* @__PURE__ */ jsxs("div", {
		className: "px-5 pb-8 pt-4",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "font-mono text-[10px] tracking-[0.18em] text-faint",
				children: "METRICS"
			}),
			/* @__PURE__ */ jsx("h1", {
				className: "mt-1 text-2xl font-medium tracking-tight",
				children: "统计"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 font-mono text-xs tabular-nums text-muted",
				children: formatDisplayDate(today)
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-5 grid grid-cols-2 gap-px border border-rule bg-rule",
				children: [
					/* @__PURE__ */ jsx(Stat, {
						label: "连续归档",
						value: padCount(stats.consecutive, 2),
						unit: "日"
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "本月归档率",
						value: rate.toFixed(1),
						unit: "%"
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "本月已归档",
						value: `${padCount(stats.monthFiled, 2)}/${padCount(stats.monthTotal, 2)}`
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "本年已归档",
						value: `${padCount(stats.yearFiled, 3)}/${padCount(stats.yearTotal, 3)}`
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "累计字数",
						value: padCount(stats.words, 5),
						unit: "字"
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "日均字数",
						value: padCount(stats.avgWords),
						unit: "字"
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "平均完成度",
						value: stats.avgComplete.toFixed(1),
						unit: "%"
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "日均事项",
						value: stats.avgItems.toFixed(1)
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ jsx(Header, {
					no: "01",
					title: "十六周热力",
					en: "HEAT"
				}), /* @__PURE__ */ jsx(HeatStrip, {
					days: stats.heatDays,
					records,
					today
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ jsx(Header, {
					no: "02",
					title: "本月缺口",
					en: "GAP",
					meta: padCount(stats.gaps.length, 2)
				}), stats.gaps.length === 0 ? /* @__PURE__ */ jsx("p", {
					className: "mt-3 text-sm text-muted",
					children: "本月截至今日，无未归档日。"
				}) : /* @__PURE__ */ jsx("ul", {
					className: "mt-3 border-t border-rule",
					children: stats.gaps.map((id) => /* @__PURE__ */ jsxs("li", {
						className: "flex items-center justify-between border-b border-rule py-2.5",
						children: [/* @__PURE__ */ jsx(Link, {
							to: "/d/$date",
							params: { date: id },
							className: "font-mono text-sm tabular-nums",
							children: formatDisplayDate(id)
						}), /* @__PURE__ */ jsx("span", {
							className: "font-mono text-[10px] tracking-[0.14em] text-stamp",
							children: "UNFILED"
						})]
					}, id))
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ jsx(Header, {
					no: "03",
					title: "状态分布",
					en: "MOOD"
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-3 flex flex-col gap-2",
					children: MOODS.map((m, i) => {
						const n = stats.moodDist[i] ?? 0;
						const max = Math.max(1, ...stats.moodDist);
						return /* @__PURE__ */ jsx(BarRow, {
							label: `${m.value} ${m.label}`,
							n,
							max
						}, m.value);
					})
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ jsx(Header, {
					no: "04",
					title: "标记频次",
					en: "MARKS"
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-3 flex flex-col gap-2",
					children: stats.tagDist.map((t) => /* @__PURE__ */ jsx(BarRow, {
						label: t.tag,
						n: t.n,
						max: Math.max(1, stats.tagDist[0]?.n ?? 1)
					}, t.tag))
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-8",
				children: [
					/* @__PURE__ */ jsx(Header, {
						no: "05",
						title: "卷宗出入",
						en: "IO"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 text-sm leading-relaxed text-muted",
						children: "记录仅存本机。导出为 JSON 卷宗副本；导入将替换当前全部记录。"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-4 grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ jsx(Button, {
							variant: "outline",
							type: "button",
							onClick: onExport,
							children: "导出"
						}), /* @__PURE__ */ jsx(Button, {
							variant: "outline",
							type: "button",
							onClick: () => fileRef.current?.click(),
							children: "导入"
						})]
					}),
					/* @__PURE__ */ jsx("input", {
						ref: fileRef,
						type: "file",
						accept: "application/json,.json",
						className: "hidden",
						onChange: (e) => {
							const f = e.target.files?.[0];
							if (f) onImport(f);
							e.currentTarget.value = "";
						}
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mt-4 font-mono text-[10px] leading-relaxed tracking-wide text-faint",
						children: [
							"LEDGER ",
							fileId(today),
							/* @__PURE__ */ jsx("br", {}),
							"FILED ",
							padCount(stats.filedTotal, 3),
							/* @__PURE__ */ jsx("br", {}),
							"STORE LOCAL"
						]
					})
				]
			})
		]
	});
}
function Header({ no, title, en, meta }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-baseline justify-between border-b border-rule pb-2",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-baseline gap-2",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "font-mono text-xs text-faint",
					children: no
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "text-sm font-medium",
					children: title
				}),
				/* @__PURE__ */ jsx("span", {
					className: "font-mono text-[10px] tracking-[0.16em] text-faint",
					children: en
				})
			]
		}), meta ? /* @__PURE__ */ jsx("span", {
			className: "font-mono text-xs tabular-nums text-muted",
			children: meta
		}) : null]
	});
}
function Stat({ label, value, unit }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "bg-paper px-3 py-3",
		children: [/* @__PURE__ */ jsx("p", {
			className: "font-mono text-[9px] tracking-[0.16em] text-faint",
			children: label
		}), /* @__PURE__ */ jsxs("p", {
			className: "mt-1 font-mono text-lg tabular-nums tracking-tight",
			children: [value, unit ? /* @__PURE__ */ jsxs("span", {
				className: "ml-1 text-[11px] text-muted",
				children: [" ", unit]
			}) : null]
		})]
	});
}
function BarRow({ label, n, max }) {
	const w = max === 0 ? 0 : n / max * 100;
	return /* @__PURE__ */ jsxs("div", {
		className: "grid grid-cols-[auto_1fr_auto] items-center gap-2",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "truncate text-xs text-muted",
				children: label
			}),
			/* @__PURE__ */ jsx("div", {
				className: "h-2 bg-paper-2",
				children: /* @__PURE__ */ jsx("div", {
					className: "h-2 bg-ink",
					style: { width: `${w}%` }
				})
			}),
			/* @__PURE__ */ jsx("span", {
				className: "text-right font-mono text-[11px] tabular-nums",
				children: padCount(n, 2)
			})
		]
	});
}
function HeatStrip({ days, records, today }) {
	const cols = Math.ceil(days.length / 7);
	return /* @__PURE__ */ jsx("div", {
		className: "mt-3 overflow-x-auto",
		children: /* @__PURE__ */ jsx("div", {
			className: "grid w-full gap-0.5",
			style: {
				gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
				gridTemplateRows: "repeat(7, 10px)",
				gridAutoFlow: "column"
			},
			children: days.map((id) => {
				const rec = records[id];
				const filed = rec?.status === "filed";
				const draft = rec?.status === "draft" && completeness(rec).done > 0;
				const cls = cn("size-full min-h-2.5", filed ? "bg-ink" : draft ? "bg-stamp-soft" : "bg-paper-2");
				if (id > today) return /* @__PURE__ */ jsx("span", {
					className: cls,
					title: formatDisplayDate(id)
				}, id);
				return /* @__PURE__ */ jsx(Link, {
					to: "/d/$date",
					params: { date: id },
					title: `${formatDisplayDate(id)}${filed ? " 已归档" : draft ? " 草稿" : ""}`,
					className: cls
				}, id);
			})
		})
	});
}
//#endregion
//#region src/routes/_folio/metrics.tsx?tsr-split=component
function MetricsPage() {
	return /* @__PURE__ */ jsx(MetricsView, {});
}
//#endregion
export { MetricsPage as component };
