import { a as colorForType, i as TYPE_META, n as EVENT_TYPES, o as readableOn, r as SWATCHES } from "./types-DkEh41EK.js";
import { f as cn, u as minutesToLabel } from "./router-Dzn3OfJZ.js";
import { a as Button, i as Textarea, n as Label, r as NativeSelect, t as Input } from "./field-DTONP9Vl.js";
import { useEffect, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Check } from "lucide-react";
//#region src/components/events/color-swatches.tsx
function TypePills({ value, onChange }) {
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-wrap gap-1.5",
		children: EVENT_TYPES.map((t) => {
			return /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => onChange(t),
				className: cn("inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-medium transition-[background-color,box-shadow,color] duration-150", value === t ? "bg-ink text-paper" : "bg-paper text-muted shadow-card hover:text-ink"),
				children: [/* @__PURE__ */ jsx("span", {
					className: "size-2 rounded-full",
					style: { background: TYPE_META[t].swatch }
				}), TYPE_META[t].label]
			}, t);
		})
	});
}
function ColorSwatches({ value, onChange }) {
	return /* @__PURE__ */ jsx("div", {
		className: "grid grid-cols-8 gap-2",
		children: SWATCHES.map((s) => {
			const active = s.hex.toLowerCase() === value.toLowerCase();
			return /* @__PURE__ */ jsx("button", {
				type: "button",
				title: s.name,
				"aria-label": s.name,
				onClick: () => onChange(s.hex),
				className: cn("relative aspect-square rounded-md transition-[scale,box-shadow] duration-150 ease-out hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20", active ? "shadow-lift ring-2 ring-ink/30 ring-offset-2 ring-offset-canvas" : "shadow-card"),
				style: { background: s.hex },
				children: active ? /* @__PURE__ */ jsx(Check, {
					className: "absolute inset-0 m-auto size-3.5",
					strokeWidth: 2.4,
					style: { color: readableOn(s.hex) }
				}) : null
			}, s.id);
		})
	});
}
//#endregion
//#region src/components/events/event-editor.tsx
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
	const [draft, setDraft] = useState(initial);
	useEffect(() => {
		setDraft(initial);
	}, [initial]);
	function setType(type) {
		setDraft((d) => ({
			...d,
			type,
			color: d.color === colorForType(d.type) ? colorForType(type) : d.color
		}));
	}
	return /* @__PURE__ */ jsxs("form", {
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
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, {
				htmlFor: "title",
				children: "标题"
			}), /* @__PURE__ */ jsx(Input, {
				id: "title",
				value: draft.title,
				onChange: (e) => setDraft({
					...draft,
					title: e.target.value
				}),
				placeholder: "一件具体的事",
				required: true
			})] }),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 gap-3",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "col-span-2 sm:col-span-1",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "date",
							children: "日期"
						}), /* @__PURE__ */ jsx(Input, {
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
					/* @__PURE__ */ jsx("div", {
						className: "flex items-end pb-1",
						children: /* @__PURE__ */ jsxs("label", {
							className: "inline-flex h-11 items-center gap-2 text-sm text-muted",
							children: [/* @__PURE__ */ jsx("input", {
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
					!draft.allDay ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "start",
						children: "开始"
					}), /* @__PURE__ */ jsx(Input, {
						id: "start",
						type: "time",
						value: draft.startTime ?? "",
						onChange: (e) => setDraft({
							...draft,
							startTime: e.target.value || null
						})
					})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "end",
						children: "结束"
					}), /* @__PURE__ */ jsx(Input, {
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
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, { children: "类型" }), /* @__PURE__ */ jsx(TypePills, {
				value: draft.type,
				onChange: setType
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, { children: "色卡" }), /* @__PURE__ */ jsx(ColorSwatches, {
				value: draft.color,
				onChange: (hex) => setDraft({
					...draft,
					color: hex
				})
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, {
				htmlFor: "remind",
				children: "提醒"
			}), /* @__PURE__ */ jsx(NativeSelect, {
				id: "remind",
				value: draft.reminderMinutes === null ? "off" : String(draft.reminderMinutes),
				onChange: (e) => {
					const v = e.target.value;
					setDraft({
						...draft,
						reminderMinutes: v === "off" ? null : Number(v)
					});
				},
				children: REMINDERS.map((r) => /* @__PURE__ */ jsx("option", {
					value: r === null ? "off" : r,
					children: r === null ? "不提醒" : minutesToLabel(r)
				}, String(r)))
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, {
				htmlFor: "notes",
				children: "备注"
			}), /* @__PURE__ */ jsx(Textarea, {
				id: "notes",
				className: "min-h-24 text-sm",
				value: draft.notes,
				onChange: (e) => setDraft({
					...draft,
					notes: e.target.value
				}),
				placeholder: "可选"
			})] }),
			/* @__PURE__ */ jsxs("div", {
				className: "flex justify-end gap-2 pt-1",
				children: [onCancel ? /* @__PURE__ */ jsx(Button, {
					type: "button",
					variant: "ghost",
					onClick: onCancel,
					children: "取消"
				}) : null, /* @__PURE__ */ jsx(Button, {
					type: "submit",
					children: submitLabel
				})]
			})
		]
	});
}
//#endregion
export { ColorSwatches as n, TypePills as r, EventEditor as t };
