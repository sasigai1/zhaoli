import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as ChevronRight, l as ChevronLeft, r as Search } from "../_libs/lucide-react.mjs";
import { m as addMonths, n as parseISO, o as format } from "../_libs/date-fns.mjs";
import { C as localIsoDate, T as padCount, a as useLedger, d as completeness, h as filledItems, k as weekStarts, m as fileId, u as cellKind, v as formatDisplayDate, w as monthCells, x as glyphCount } from "./router-CaGjStSs.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as Input, t as FieldBox } from "./field-DEx_PKEc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/archive-CIU-8QAL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KIND_LABEL = {
	empty: "未填",
	draft: "草稿",
	filed: "已归档",
	future: "未开始"
};
function ArchiveView() {
	const today = localIsoDate();
	const records = useLedger((s) => s.records);
	const todayDate = parseISO(today);
	const [cursor, setCursor] = (0, import_react.useState)(() => new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
	const [query, setQuery] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const year = cursor.getFullYear();
	const month = cursor.getMonth();
	const cells = (0, import_react.useMemo)(() => monthCells(year, month), [year, month]);
	const canNext = year < todayDate.getFullYear() || month < todayDate.getMonth();
	const monthIds = cells.filter((c) => c !== null && c <= today);
	const filedCount = monthIds.filter((id) => records[id]?.status === "filed").length;
	const list = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return Object.values(records).filter((r) => {
			if (filter === "filed") return r.status === "filed";
			if (filter === "draft") return r.status === "draft" && completeness(r).done > 0;
			if (filter === "gap") return r.status !== "filed";
			return completeness(r).done > 0 || r.status === "filed";
		}).filter((r) => {
			if (!q) return true;
			return `${r.summary} ${r.body} ${r.items.join(" ")} ${r.tags.join(" ")} ${r.id}`.toLowerCase().includes(q);
		}).sort((a, b) => b.id.localeCompare(a.id));
	}, [
		records,
		query,
		filter
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pb-8 pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "flex size-11 items-center justify-center",
						onClick: () => setCursor((d) => addMonths(d, -1)),
						"aria-label": "上月",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[10px] tracking-[0.18em] text-faint",
							children: "INDEX"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-mono text-xl font-medium tabular-nums tracking-tight",
							children: format(cursor, "yyyy.MM")
						})]
					}),
					canNext ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "flex size-11 items-center justify-center",
						onClick: () => setCursor((d) => addMonths(d, 1)),
						"aria-label": "下月",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-11 items-center justify-center text-rule",
						"aria-hidden": true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-baseline justify-between border-b border-rule pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "本月归档"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-sm tabular-nums",
					children: [
						padCount(filedCount, 2),
						" / ",
						padCount(monthIds.length, 2)
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-7 gap-1",
				children: [weekStarts().map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pb-1 text-center font-mono text-[10px] tracking-widest text-faint",
					children: d
				}, d)), cells.map((id, i) => {
					if (!id) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-square" }, `e-${i}`);
					const kind = cellKind(id, records, today);
					const className = cn("relative flex aspect-square items-center justify-center font-mono text-xs tabular-nums", kind === "filed" && "bg-ink text-paper", kind === "draft" && "bg-stamp-soft text-ink", kind === "empty" && "text-ink shadow-border", kind === "future" && "text-rule", id === today && kind !== "filed" && "shadow-[0_0_0_1px_var(--color-ink)]");
					if (kind === "future") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className,
						"aria-label": `${formatDisplayDate(id)} 未开始`,
						children: Number(id.slice(8))
					}, id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/d/$date",
						params: { date: id },
						"aria-label": `${formatDisplayDate(id)} ${KIND_LABEL[kind]}`,
						className,
						children: Number(id.slice(8))
					}, id);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center gap-3 font-mono text-[10px] tracking-wide text-faint",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "inline-block size-2 bg-ink" }), " 已归档"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "inline-block size-2 bg-stamp-soft" }), " 草稿"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "inline-block size-2 shadow-border" }), " 未填"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldBox, {
				className: "mt-6 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
					className: "size-4 shrink-0 text-faint",
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "检索摘要、正文、标记",
					"aria-label": "检索",
					className: "w-auto min-w-0 flex-1"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex gap-1",
				children: [
					["all", "全部"],
					["filed", "已归档"],
					["draft", "草稿"],
					["gap", "缺口"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFilter(id),
					className: cn("h-10 px-3 text-xs transition-[background-color,color] duration-150 ease-out", filter === id ? "bg-ink text-paper" : "text-muted shadow-border"),
					children: label
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 border-t border-rule",
				children: list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "py-10 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tracking-[0.18em] text-faint",
						children: "EMPTY"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "索引中没有符合条件的记录。"
					})]
				}) : list.map((r) => {
					const words = glyphCount(r.body);
					const items = filledItems(r.items).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "border-b border-rule",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/d/$date",
							params: { date: r.id },
							className: "block py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-[11px] tabular-nums tracking-wide text-faint",
										children: fileId(r.id)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("font-mono text-[10px] tracking-[0.14em]", r.status === "filed" ? "text-stamp" : "text-muted"),
										children: r.status === "filed" ? "FILED" : "DRAFT"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm font-medium leading-snug",
									children: r.summary || "（无摘要）"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-mono text-[11px] tabular-nums text-faint",
									children: [
										formatDisplayDate(r.id),
										" · ",
										padCount(words),
										" 字 · ",
										items,
										" 事项",
										r.tags.length ? ` · ${r.tags.join(" / ")}` : ""
									]
								})
							]
						})
					}, r.id);
				})
			})
		]
	});
}
function ArchivePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchiveView, {});
}
//#endregion
export { ArchivePage as component };
