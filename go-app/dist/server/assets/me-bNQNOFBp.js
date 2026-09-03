import { O as cn, a as REMINDER_OPTIONS, c as BrandMark, l as useSchedule, r as Button, t as AppShell } from "./app-shell-dK8bFt1Z.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/components/me-view.tsx
function MeView() {
	const settings = useSchedule((s) => s.settings);
	const setSettings = useSchedule((s) => s.setSettings);
	const restoreSample = useSchedule((s) => s.restoreSample);
	const events = useSchedule((s) => s.events);
	return /* @__PURE__ */ jsxs("div", {
		className: "px-5 pb-10",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-end gap-3 pt-4",
				children: [/* @__PURE__ */ jsx(BrandMark, { className: "h-10 w-5" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "font-serif text-[32px] leading-none tracking-tight",
					children: "素笺"
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-2 text-xs tracking-[0.22em] text-muted",
					children: "A BLANK PAGE FOR THE DAY"
				})] })]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-6 text-[15px] leading-relaxed text-muted",
				children: "把一天写在一张白纸上。口述给书记，它会整理成日程；到点时轻声提醒。不做喧闹的格子，只留此刻与接下来。"
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-[11px] tracking-[0.22em] text-muted",
					children: "默认提醒"
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: REMINDER_OPTIONS.map((option) => /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setSettings({ defaultReminder: option.value }),
						className: cn("h-9 rounded-full px-3 text-sm transition-[background-color,color] duration-150", settings.defaultReminder === option.value ? "bg-ink text-sheet" : "bg-paper text-muted"),
						children: option.label
					}, String(option.value)))
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-8 rounded-lg bg-paper px-4 py-4 shadow-card",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-sm text-muted",
						children: "纸上现有"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 font-serif text-3xl tabular-nums",
						children: events.length
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-xs text-muted",
						children: "件事"
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-8 space-y-3",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-[11px] tracking-[0.22em] text-muted",
					children: "书记"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm leading-relaxed text-muted",
					children: "口述、日简与疏时由书记完成。你只说人话，它负责落成时刻与时长。无需粘贴任何密钥。"
				})]
			}),
			/* @__PURE__ */ jsx(Button, {
				variant: "outline",
				className: "mt-8 w-full",
				onClick: () => {
					restoreSample();
					toast("已铺回示例日程");
				},
				children: "铺回示例日程"
			})
		]
	});
}
//#endregion
//#region src/routes/me.tsx?tsr-split=component
function MePage() {
	return /* @__PURE__ */ jsx(AppShell, {
		active: "me",
		children: /* @__PURE__ */ jsx(MeView, {})
	});
}
//#endregion
export { MePage as component };
