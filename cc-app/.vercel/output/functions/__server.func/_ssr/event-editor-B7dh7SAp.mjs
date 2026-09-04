import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as colorForType, i as TYPE_META, n as EVENT_TYPES, o as readableOn, r as SWATCHES } from "./types-DkEh41EK.mjs";
import { u as Check } from "../_libs/lucide-react.mjs";
import { f as cn, u as minutesToLabel } from "./router-pw5uqWPz.mjs";
import { a as Textarea, i as NativeSelect, n as Input, r as Label, t as Button } from "./field-2BuY3MwR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/event-editor-B7dh7SAp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TypePills({ value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-1.5",
		children: EVENT_TYPES.map((t) => {
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onChange(t),
				className: cn("inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-medium transition-[background-color,box-shadow,color] duration-150", value === t ? "bg-ink text-paper" : "bg-paper text-muted shadow-card hover:text-ink"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "size-2 rounded-full",
					style: { background: TYPE_META[t].swatch }
				}), TYPE_META[t].label]
			}, t);
		})
	});
}
function ColorSwatches({ value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-8 gap-2",
		children: SWATCHES.map((s) => {
			const active = s.hex.toLowerCase() === value.toLowerCase();
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				title: s.name,
				"aria-label": s.name,
				onClick: () => onChange(s.hex),
				className: cn("relative aspect-square rounded-md transition-[scale,box-shadow] duration-150 ease-out hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20", active ? "shadow-lift ring-2 ring-ink/30 ring-offset-2 ring-offset-canvas" : "shadow-card"),
				style: { background: s.hex },
				children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					className: "absolute inset-0 m-auto size-3.5",
					strokeWidth: 2.4,
					style: { color: readableOn(s.hex) }
				}) : null
			}, s.id);
		})
	});
}
var REMINDERS = [
	null,
	0,
	5,
	10,
	15,
	30,
	60,
	120,
	1440
];
function EventEditor({ initial, submitLabel = "保存", onSubmit, onCancel }) {
	const [draft, setDraft] = (0, import_react.useState)(initial);
	(0, import_react.useEffect)(() => {
		setDraft(initial);
	}, [initial]);
	function setType(type) {
		setDraft((d) => ({
			...d,
			type,
			color: d.color === colorForType(d.type) ? colorForType(type) : d.color
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-col gap-5",
		onSubmit: (e) => {
			e.preventDefault();
			if (!draft.title.trim()) return;
			onSubmit({
				...draft,
				title: draft.title.trim(),
				allDay: draft.allDay || !draft.startTime,
				startTime: draft.allDay ? null : draft.startTime,
				endTime: draft.allDay ? null : draft.endTime
			});
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "title",
				children: "标题"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: "title",
				value: draft.title,
				onChange: (e) => setDraft({
					...draft,
					title: e.target.value
				}),
				placeholder: "一件具体的事",
				required: true
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "col-span-2 sm:col-span-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "date",
							children: "日期"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "date",
							type: "date",
							value: draft.date,
							onChange: (e) => setDraft({
								...draft,
								date: e.target.value
							}),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-end pb-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "inline-flex h-11 items-center gap-2 text-sm text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: draft.allDay,
								onChange: (e) => setDraft({
									...draft,
									allDay: e.target.checked,
									startTime: e.target.checked ? null : draft.startTime ?? "09:00"
								}),
								className: "size-4 accent-ink"
							}), "全天"]
						})
					}),
					!draft.allDay ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "start",
						children: "开始"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "start",
						type: "time",
						value: draft.startTime ?? "",
						onChange: (e) => setDraft({
							...draft,
							startTime: e.target.value || null
						})
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "end",
						children: "结束"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "end",
						type: "time",
						value: draft.endTime ?? "",
						onChange: (e) => setDraft({
							...draft,
							endTime: e.target.value || null
						})
					})] })] }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "类型" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypePills, {
				value: draft.type,
				onChange: setType
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "色卡" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorSwatches, {
				value: draft.color,
				onChange: (hex) => setDraft({
					...draft,
					color: hex
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "remind",
				children: "提醒"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
				id: "remind",
				value: draft.reminderMinutes === null ? "off" : String(draft.reminderMinutes),
				onChange: (e) => {
					const v = e.target.value;
					setDraft({
						...draft,
						reminderMinutes: v === "off" ? null : Number(v)
					});
				},
				children: REMINDERS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: r === null ? "off" : r,
					children: r === null ? "不提醒" : minutesToLabel(r)
				}, String(r)))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "notes",
				children: "备注"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				id: "notes",
				className: "min-h-24 text-sm",
				value: draft.notes,
				onChange: (e) => setDraft({
					...draft,
					notes: e.target.value
				}),
				placeholder: "可选"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-end gap-2 pt-1",
				children: [onCancel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: onCancel,
					children: "取消"
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: submitLabel
				})]
			})
		]
	});
}
//#endregion
export { EventEditor as n, TypePills as r, ColorSwatches as t };
