import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Lock, c as ChevronRight, i as Plus, l as ChevronLeft, t as X } from "../_libs/lucide-react.mjs";
import { h as addDays } from "../_libs/date-fns.mjs";
import { C as localIsoDate, D as sectionState, E as parseDate, O as unfiledGaps, S as isFutureDate, T as padCount, a as useLedger, b as formatWeekdayEn, c as SECTIONS, d as completeness, f as dayOfYearLabel, g as formatChineseDate, h as filledItems, l as TAGS, m as fileId, o as DENSITIES, s as MOODS, v as formatDisplayDate, x as glyphCount, y as formatStampTime } from "./router-CaGjStSs.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-lc9gu-sZ.mjs";
import { n as Input, r as Textarea, t as FieldBox } from "./field-DEx_PKEc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/day-editor-CZj2smUU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel = "取消", tone = "ink", onConfirm, onCancel }) {
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-50 flex items-center justify-center bg-ink/40 p-6",
		role: "presentation",
		onClick: onCancel,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "folio-confirm-title",
			className: "w-full max-w-sm rounded-md bg-surface p-5 shadow-device",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-[0.18em] text-faint",
					children: "CONFIRM"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "folio-confirm-title",
					className: "mt-2 text-lg font-medium tracking-tight",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: description
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						type: "button",
						onClick: onCancel,
						children: cancelLabel
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: tone === "stamp" ? "stamp" : "primary",
						type: "button",
						onClick: onConfirm,
						children: confirmLabel
					})]
				})
			]
		})
	});
}
function useComposing() {
	const composing = (0, import_react.useRef)(false);
	return {
		composing,
		onCompositionStart: () => {
			composing.current = true;
		},
		onCompositionEnd: () => {
			composing.current = false;
		}
	};
}
function SectionHead({ no, label, en, done, meta }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-end justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-xs tabular-nums text-faint",
					children: no
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[10px] tracking-[0.16em] text-faint",
					children: en
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [meta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[11px] tabular-nums text-muted",
				children: meta
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("size-1.5 rounded-full", done ? "bg-ink" : "bg-rule"),
				"aria-hidden": true
			})]
		})]
	});
}
function ScaleRow({ name, value, options, disabled, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mb-2 font-mono text-[10px] tracking-[0.16em] text-faint",
		children: name
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-5 gap-1.5",
		children: options.map((opt) => {
			const active = value === opt.value;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled,
				onClick: () => onChange(opt.value),
				className: cn("flex h-14 flex-col items-center justify-center rounded-sm transition-[background-color,color,box-shadow] duration-150 ease-out", active ? "bg-ink text-paper" : "text-ink shadow-border", disabled && "opacity-60"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-sm tabular-nums",
					children: opt.value
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-0.5 text-[10px]",
					children: opt.label
				})]
			}, opt.value);
		})
	})] });
}
function DayEditor({ date }) {
	const today = localIsoDate();
	const records = useLedger((s) => s.records);
	const rec = records[date] ?? {
		id: date,
		status: "draft",
		summary: "",
		items: [""],
		body: "",
		mood: null,
		density: null,
		tags: [],
		updatedAt: null,
		filedAt: null
	};
	const patch = useLedger((s) => s.patch);
	const file = useLedger((s) => s.file);
	const reopen = useLedger((s) => s.reopen);
	const voidDay = useLedger((s) => s.voidDay);
	const locked = rec.status === "filed";
	const future = isFutureDate(date, today);
	const parsed = parseDate(date);
	const invalid = !parsed;
	const state = sectionState(rec);
	const complete = completeness(rec);
	const glyphSummary = glyphCount(rec.summary);
	const glyphBody = glyphCount(rec.body);
	const itemCount = filledItems(rec.items).length;
	const composing = useComposing();
	const [confirm, setConfirm] = (0, import_react.useState)(null);
	const [filedFlash, setFiledFlash] = (0, import_react.useState)(false);
	const prev = parsed ? localIsoDate(addDays(parsed, -1)) : null;
	const next = parsed ? localIsoDate(addDays(parsed, 1)) : null;
	const nextDisabled = !next || next > today;
	const monthStart = date.slice(0, 8) + "01";
	const gaps = (0, import_react.useMemo)(() => date === today ? unfiledGaps(records, monthStart, today).filter((d) => d !== today) : [], [
		records,
		date,
		today,
		monthStart
	]);
	(0, import_react.useEffect)(() => {
		if (!locked) setFiledFlash(false);
	}, [locked]);
	if (invalid) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs tracking-[0.18em] text-faint",
				children: "ERROR"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-xl font-medium",
				children: "日期无法识别"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "卷宗编号必须为 YYYY-MM-DD。"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-6 inline-flex h-11 items-center text-sm font-medium underline-offset-4",
				children: "返回本日"
			})
		]
	});
	const applySummary = (value) => {
		if (composing.composing.current) {
			patch(date, { summary: value });
			return;
		}
		patch(date, { summary: Array.from(value).slice(0, 48).join("") });
	};
	const setItem = (index, value) => {
		const items = [...rec.items];
		items[index] = value;
		patch(date, { items });
	};
	const addItem = () => {
		if (rec.items.length >= 5) return;
		patch(date, { items: [...rec.items, ""] });
	};
	const removeItem = (index) => {
		const items = rec.items.filter((_, i) => i !== index);
		patch(date, { items: items.length ? items : [""] });
	};
	const toggleTag = (tag) => {
		const tags = rec.tags.includes(tag) ? rec.tags.filter((t) => t !== tag) : [...rec.tags, tag];
		patch(date, { tags });
	};
	const onFile = () => {
		if (file(date)) {
			setFiledFlash(true);
			setConfirm(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pb-8 pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/d/$date",
						params: { date: prev ?? date },
						className: "flex size-11 items-center justify-center text-ink",
						"aria-label": "前一日",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-[11px] tabular-nums tracking-[0.14em] text-faint",
								children: fileId(date)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-0.5 font-mono text-xl font-medium tabular-nums tracking-tight",
								children: formatDisplayDate(date)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-0.5 text-xs text-muted",
								children: [
									formatWeekdayEn(date),
									" · ",
									formatChineseDate(date)
								]
							})
						]
					}),
					nextDisabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-11 items-center justify-center text-rule",
						"aria-hidden": true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/d/$date",
						params: { date: next ?? date },
						className: "flex size-11 items-center justify-center text-ink",
						"aria-label": "后一日",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-3 gap-px border border-rule bg-rule text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaCell, {
						label: "STATUS",
						value: locked ? "FILED" : future ? "LOCKED" : "DRAFT"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaCell, {
						label: "COMPLETE",
						value: `${padCount(complete.done, 2)} / ${padCount(complete.total, 2)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaCell, {
						label: "CYCLE",
						value: dayOfYearLabel(date)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex gap-1",
				"aria-hidden": true,
				children: SECTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("h-1 flex-1", state[s.key] ? "bg-ink" : "bg-rule"),
					title: `${s.no} ${s.label}`
				}, s.key))
			}),
			gaps.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 border border-dashed border-rule px-3 py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[10px] tracking-[0.16em] text-faint",
						children: "GAP · 本月缺口"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[11px] tabular-nums text-muted",
						children: padCount(gaps.length, 2)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-x-3 gap-y-1",
					children: [gaps.slice(0, 6).map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/d/$date",
						params: { date: g },
						className: "font-mono text-xs tabular-nums text-stamp",
						children: formatDisplayDate(g)
					}, g)), gaps.length > 6 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/archive",
						className: "font-mono text-xs text-muted",
						children: ["其余 ", gaps.length - 6]
					}) : null]
				})]
			}) : null,
			future ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 border border-rule px-4 py-8 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-[0.18em] text-faint",
					children: "NOT OPEN"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "该日尚未开始，不可预填。"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 flex flex-col gap-7",
				onSubmit: (e) => {
					e.preventDefault();
					if (complete.ready && !locked) setConfirm("file");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
							no: "01",
							label: "摘要",
							en: "SUMMARY",
							done: state.summary,
							meta: `${padCount(glyphSummary, 2)} / 48`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldBox, {
							className: "mt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: rec.summary,
								disabled: locked,
								placeholder: "本日一句话，八至四十八字",
								maxLength: 96,
								onCompositionStart: composing.onCompositionStart,
								onCompositionEnd: (e) => {
									composing.onCompositionEnd();
									applySummary(e.currentTarget.value);
								},
								onChange: (e) => applySummary(e.target.value),
								"aria-label": "摘要"
							})
						}),
						rec.summary && glyphSummary < 8 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1.5 font-mono text-[10px] text-stamp",
							children: [
								"尚欠 ",
								8 - glyphSummary,
								" 字"
							]
						}) : null
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
							no: "02",
							label: "事项",
							en: "AGENDA",
							done: state.agenda,
							meta: `${padCount(itemCount, 1)} / 5`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 flex flex-col gap-2",
							children: rec.items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-6 font-mono text-xs tabular-nums text-faint",
										children: padCount(i + 1, 2)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldBox, {
										className: "flex-1 py-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: item,
											disabled: locked,
											placeholder: "一项即可，一句一事",
											onChange: (e) => setItem(i, e.target.value),
											"aria-label": `事项 ${i + 1}`
										})
									}),
									!locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "relative flex size-11 items-center justify-center text-faint",
										onClick: () => removeItem(i),
										"aria-label": "删除事项",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-11" })
								]
							}, i))
						}),
						!locked && rec.items.length < 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: addItem,
							className: "mt-2 flex h-11 items-center gap-2 pl-8 text-sm text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "添加事项"]
						}) : null
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
							no: "03",
							label: "正文",
							en: "LOG",
							done: state.body,
							meta: `${padCount(glyphBody)} 字`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldBox, {
							className: "mt-2 px-0 py-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: rec.body,
								disabled: locked,
								placeholder: "写下今天。事实优先，不写给别人看。",
								rows: 8,
								className: "folio-ruled min-h-52 px-3 py-2",
								onChange: (e) => patch(date, { body: e.target.value }),
								"aria-label": "正文"
							})
						}),
						rec.body && glyphBody < 40 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1.5 font-mono text-[10px] text-stamp",
							children: [
								"尚欠 ",
								40 - glyphBody,
								" 字"
							]
						}) : null
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
						no: "04",
						label: "评估",
						en: "ASSESSMENT",
						done: state.assessment
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-col gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScaleRow, {
							name: "状态 MOOD",
							value: rec.mood,
							options: MOODS,
							disabled: locked,
							onChange: (mood) => patch(date, { mood })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScaleRow, {
							name: "充实 DENSITY",
							value: rec.density,
							options: DENSITIES,
							disabled: locked,
							onChange: (density) => patch(date, { density })
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
						no: "05",
						label: "标记",
						en: "MARKS",
						done: state.marks,
						meta: `${padCount(rec.tags.length, 1)}`
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-1.5",
						children: TAGS.map((tag) => {
							const active = rec.tags.includes(tag);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: locked,
								onClick: () => toggleTag(tag),
								className: cn("h-10 px-3 text-xs transition-[background-color,color] duration-150 ease-out", active ? "bg-ink text-paper" : "text-ink shadow-border"),
								children: tag
							}, tag);
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
						className: "border-t border-rule pt-5",
						children: locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative overflow-hidden border border-stamp/40 px-4 py-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn("pointer-events-none absolute right-4 top-2 font-mono text-[11px] font-medium tracking-[0.28em] text-stamp", filedFlash ? "folio-stamp" : "folio-stamp"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "border-2 border-stamp px-2 py-1",
										children: "已归档 FILED"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-2 text-sm font-medium",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5" }), "本卷已锁定"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-mono text-[11px] tabular-nums text-muted",
									children: formatStampTime(rec.filedAt)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										type: "button",
										onClick: () => setConfirm("reopen"),
										children: "重开"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										type: "button",
										onClick: () => setConfirm("void"),
										children: "作废"
									})]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: complete.ready ? "stamp" : "primary",
								className: "w-full",
								size: "lg",
								type: "submit",
								disabled: !complete.ready,
								children: [
									"归档 FILE · ",
									padCount(complete.done, 2),
									"/",
									padCount(complete.total, 2)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-center font-mono text-[10px] tabular-nums tracking-wide text-faint",
								children: rec.updatedAt ? `已写入 ${formatStampTime(rec.updatedAt)}` : "尚未写入"
							}),
							hasContent(rec) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mt-3 flex h-11 w-full items-center justify-center text-xs text-faint",
								onClick: () => setConfirm("void"),
								children: "作废本日草稿"
							}) : null
						] })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: confirm === "file",
				title: "确认归档本日？",
				description: "五栏齐备。归档后记录锁定，改写需先重开。",
				confirmLabel: "归档",
				tone: "stamp",
				onCancel: () => setConfirm(null),
				onConfirm: onFile
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: confirm === "reopen",
				title: "重开本卷？",
				description: "记录将回到草稿状态，已归档印章撤销。",
				confirmLabel: "重开",
				onCancel: () => setConfirm(null),
				onConfirm: () => {
					reopen(date);
					setConfirm(null);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: confirm === "void",
				title: "作废本日记录？",
				description: "草稿或归档将被删除，此操作不可恢复。",
				confirmLabel: "作废",
				tone: "stamp",
				onCancel: () => setConfirm(null),
				onConfirm: () => {
					voidDay(date);
					setConfirm(null);
				}
			})
		]
	});
}
function MetaCell({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-paper px-2 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-[9px] tracking-[0.16em] text-faint",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-mono text-[11px] tabular-nums",
			children: value
		})]
	});
}
function hasContent(rec) {
	return glyphCount(rec.summary) > 0 || filledItems(rec.items).length > 0 || glyphCount(rec.body) > 0 || rec.mood !== null || rec.density !== null || rec.tags.length > 0;
}
//#endregion
export { DayEditor as t };
