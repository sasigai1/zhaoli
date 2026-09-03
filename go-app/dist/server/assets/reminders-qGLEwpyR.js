import { O as cn, _ as formatRange, g as formatDayTitle, l as useSchedule, n as KindDot, r as Button, t as AppShell, w as reminderLabel } from "./app-shell-dK8bFt1Z.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
import { isAfter, parseISO } from "date-fns";
import * as SwitchPrimitive from "@radix-ui/react-switch";
//#region src/components/ui/switch.tsx
function Switch({ className, ...props }) {
	return /* @__PURE__ */ jsx(SwitchPrimitive.Root, {
		className: cn("relative inline-flex h-7 w-11 shrink-0 items-center rounded-full bg-line transition-[background-color] duration-150 ease-out data-[state=checked]:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40", className),
		...props,
		children: /* @__PURE__ */ jsx(SwitchPrimitive.Thumb, { className: "block size-5 translate-x-1 rounded-full bg-sheet shadow-card transition-transform duration-150 ease-out data-[state=checked]:translate-x-5" })
	});
}
//#endregion
//#region src/components/reminders-view.tsx
function RemindersView() {
	const events = useSchedule((s) => s.events);
	const notifyEnabled = useSchedule((s) => s.settings.notifyEnabled);
	const setSettings = useSchedule((s) => s.setSettings);
	const selectEvent = useSchedule((s) => s.selectEvent);
	const now = /* @__PURE__ */ new Date();
	const upcoming = events.filter((event) => event.reminderMinutes !== null && isAfter(parseISO(event.end), now)).sort((a, b) => +parseISO(a.start) - +parseISO(b.start));
	const enable = async () => {
		if (typeof Notification === "undefined") {
			toast("此环境不支持系统通知，到点会在应用内轻声提示。");
			setSettings({ notifyEnabled: true });
			return;
		}
		const permission = await Notification.requestPermission();
		if (permission !== "granted") toast("未开启系统通知。仍可在打开应用时收到到点提示。");
		setSettings({ notifyEnabled: true });
		if (permission === "granted") toast("提醒已开启");
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "px-5 pb-8",
		children: [
			/* @__PURE__ */ jsx("h1", {
				className: "pt-2 font-serif text-[32px] tracking-tight",
				children: "提醒"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-2 text-sm leading-relaxed text-muted",
				children: "到点前轻声告知。把素笺留在主屏幕，纸面就不会被忘记。"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-6 flex items-center justify-between rounded-lg bg-paper px-4 py-4 shadow-card",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "font-medium",
					children: "开启提醒"
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-0.5 text-xs text-muted",
					children: "系统通知与应用内提示"
				})] }), /* @__PURE__ */ jsx(Switch, {
					checked: notifyEnabled,
					onCheckedChange: (checked) => {
						if (checked) enable();
						else setSettings({ notifyEnabled: false });
					}
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-[11px] tracking-[0.22em] text-muted",
					children: "即将到来"
				}), /* @__PURE__ */ jsx("ul", {
					className: "mt-3 space-y-2",
					children: upcoming.length === 0 ? /* @__PURE__ */ jsxs("li", {
						className: "py-10 text-center",
						children: [/* @__PURE__ */ jsx("p", {
							className: "font-serif text-lg",
							children: "还没有提醒"
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-sm text-muted",
							children: "写下日程时选一个提前提醒即可。"
						})]
					}) : upcoming.map((event) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => selectEvent(event.id),
						className: "flex w-full items-start gap-3 rounded-lg bg-paper px-3.5 py-3.5 text-left shadow-card",
						children: [/* @__PURE__ */ jsx(KindDot, {
							kind: event.kind,
							className: "mt-1.5"
						}), /* @__PURE__ */ jsxs("span", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "block truncate font-medium",
									children: event.title
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "mt-0.5 block text-xs text-muted",
									children: [
										formatDayTitle(parseISO(event.start)),
										/* @__PURE__ */ jsx("span", {
											className: "mx-1.5 text-faint",
											children: "·"
										}),
										/* @__PURE__ */ jsx("span", {
											className: "tabular-nums",
											children: formatRange(parseISO(event.start), parseISO(event.end), event.allDay)
										})
									]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "mt-1 block text-xs text-accent",
									children: reminderLabel(event.reminderMinutes)
								})
							]
						})]
					}) }, event.id))
				})]
			}),
			!notifyEnabled ? /* @__PURE__ */ jsx(Button, {
				className: "mt-6 w-full",
				variant: "soft",
				onClick: () => void enable(),
				children: "允许提醒"
			}) : null
		]
	});
}
//#endregion
//#region src/routes/reminders.tsx?tsr-split=component
function RemindersPage() {
	return /* @__PURE__ */ jsx(AppShell, {
		active: "reminders",
		children: /* @__PURE__ */ jsx(RemindersView, {})
	});
}
//#endregion
export { RemindersPage as component };
