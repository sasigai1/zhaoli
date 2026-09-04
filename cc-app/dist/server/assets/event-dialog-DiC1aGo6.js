import { a as colorForType, i as TYPE_META } from "./types-DkEh41EK.js";
import { c as formatTimeLabel, d as todayISO, f as cn, l as friendlyDay } from "./router-Dzn3OfJZ.js";
import { t as EventEditor } from "./event-editor-DZg5maeI.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { Check, Clock, Trash2, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
//#region src/components/events/event-card.tsx
function EventCard({ event, onToggle, onOpen, onDelete, showDate }) {
	return /* @__PURE__ */ jsxs("article", {
		className: cn("group flex items-stretch gap-0 overflow-hidden rounded-lg bg-paper shadow-card transition-[box-shadow] duration-150", event.completed && "opacity-60"),
		children: [/* @__PURE__ */ jsx("div", {
			className: "w-1.5 shrink-0",
			style: { background: event.color },
			"aria-hidden": "true"
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex min-w-0 flex-1 items-start gap-3 px-3.5 py-3",
			children: [
				onToggle ? /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onToggle,
					"aria-label": event.completed ? "标为未完成" : "标为完成",
					className: cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color] duration-150", event.completed ? "border-ink bg-ink text-paper" : "border-line bg-transparent text-transparent hover:border-ink/40"),
					children: /* @__PURE__ */ jsx(Check, {
						className: "size-3.5",
						strokeWidth: 2.4
					})
				}) : null,
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: onOpen,
					className: "min-w-0 flex-1 text-left",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: cn("truncate text-[15px] font-medium tracking-wide", event.completed && "line-through"),
							children: event.title
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "inline-flex items-center gap-1",
								children: [
									/* @__PURE__ */ jsx(Clock, {
										className: "size-3",
										strokeWidth: 1.75
									}),
									showDate ? `${friendlyDay(event.date)} · ` : "",
									formatTimeLabel(event.startTime, event.allDay),
									event.endTime && !event.allDay ? `–${event.endTime}` : ""
								]
							}), /* @__PURE__ */ jsx("span", {
								className: "text-subtle",
								children: TYPE_META[event.type].label
							})]
						}),
						event.notes ? /* @__PURE__ */ jsx("p", {
							className: "mt-1 truncate text-xs text-subtle",
							children: event.notes
						}) : null
					]
				}),
				onDelete ? /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onDelete,
					"aria-label": "删除",
					className: "mt-0.5 size-9 shrink-0 rounded-full text-subtle opacity-0 transition-[opacity,background-color,color] duration-150 hover:bg-inset hover:text-danger group-hover:opacity-100 focus-visible:opacity-100",
					children: /* @__PURE__ */ jsx(Trash2, {
						className: "mx-auto size-4",
						strokeWidth: 1.75
					})
				}) : null
			]
		})]
	});
}
function EmptyDay({ label = "没有安排。日子留白也好。" }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border border-dashed border-line px-5 py-10 text-center",
		children: [/* @__PURE__ */ jsx("p", {
			className: "font-display text-lg text-ink",
			children: label
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-2 text-sm text-subtle",
			children: "点圆盘上的「添加」，用一句话记下几件事。"
		})]
	});
}
//#endregion
//#region src/components/events/event-dialog.tsx
function blankDraft(date = todayISO()) {
	return {
		title: "",
		notes: "",
		date,
		startTime: "09:00",
		endTime: null,
		allDay: false,
		type: "other",
		color: colorForType("other"),
		reminderMinutes: 15
	};
}
function eventToDraft(e) {
	return {
		title: e.title,
		notes: e.notes,
		date: e.date,
		startTime: e.startTime,
		endTime: e.endTime,
		allDay: e.allDay,
		type: e.type,
		color: e.color,
		reminderMinutes: e.reminderMinutes
	};
}
function EventDialog({ open, onOpenChange, title, initial, submitLabel, onSubmit }) {
	return /* @__PURE__ */ jsx(Dialog.Root, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ jsxs(Dialog.Portal, { children: [/* @__PURE__ */ jsx(Dialog.Overlay, { className: "fixed inset-0 z-40 bg-ink/20 data-[state=open]:animate-none" }), /* @__PURE__ */ jsxs(Dialog.Content, {
			className: "fixed top-1/2 left-1/2 z-50 max-h-[88dvh] w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-canvas p-5 shadow-lift outline-none",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-4 flex items-center justify-between",
				children: [/* @__PURE__ */ jsx(Dialog.Title, {
					className: "font-display text-lg",
					children: title
				}), /* @__PURE__ */ jsx(Dialog.Close, {
					className: "flex size-9 items-center justify-center rounded-full text-muted hover:bg-inset hover:text-ink",
					children: /* @__PURE__ */ jsx(X, { className: "size-4" })
				})]
			}), /* @__PURE__ */ jsx(EventEditor, {
				initial,
				submitLabel,
				onSubmit: (d) => {
					onSubmit(d);
					onOpenChange(false);
				},
				onCancel: () => onOpenChange(false)
			})]
		})] })
	});
}
//#endregion
export { EventCard as a, EmptyDay as i, blankDraft as n, eventToDraft as r, EventDialog as t };
