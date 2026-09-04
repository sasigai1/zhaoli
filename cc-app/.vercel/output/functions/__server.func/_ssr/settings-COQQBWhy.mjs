import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as colorForType, n as EVENT_TYPES } from "./types-DkEh41EK.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as format } from "../_libs/date-fns.mjs";
import { a as unlockAudio, i as playChime, n as useMounted, p as uid, s as useScheduleStore } from "./router-pw5uqWPz.mjs";
import { i as NativeSelect, r as Label, t as Button } from "./field-2BuY3MwR.mjs";
import { t as PageShell } from "./page-shell-D8j_c2-V.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-COQQBWhy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function fold(line) {
	const chunks = [];
	let rest = line;
	while (rest.length > 73) {
		chunks.push(rest.slice(0, 73));
		rest = " " + rest.slice(73);
	}
	chunks.push(rest);
	return chunks.join("\r\n");
}
function icsDate(date, time, allDay) {
	if (allDay || !time) return `;VALUE=DATE:${date.replaceAll("-", "")}`;
	return `:${`${date.replaceAll("-", "")}T${time.replace(":", "")}00`}`;
}
function escapeText(value) {
	return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
function toIcs(events) {
	const lines = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//Sundial//日晷//ZH",
		"CALSCALE:GREGORIAN"
	];
	for (const e of events) {
		lines.push("BEGIN:VEVENT");
		lines.push(`UID:${e.id}@sundial`);
		lines.push(`DTSTAMP:${e.updatedAt.replace(/[-:]/g, "").slice(0, 15)}Z`);
		lines.push(`DTSTART${icsDate(e.date, e.startTime, e.allDay)}`);
		if (!e.allDay && e.endTime) lines.push(`DTEND${icsDate(e.date, e.endTime, false)}`);
		lines.push(fold(`SUMMARY:${escapeText(e.title)}`));
		if (e.notes) lines.push(fold(`DESCRIPTION:${escapeText(e.notes)}`));
		lines.push(`CATEGORIES:${e.type}`);
		lines.push(`X-SUNDIAL-COLOR:${e.color}`);
		lines.push("END:VEVENT");
	}
	lines.push("END:VCALENDAR");
	return lines.join("\r\n") + "\r\n";
}
function unfold(ics) {
	return ics.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
}
function parseDateField(value) {
	value.replace(/^[A-Z0-9=;:-]*:/, "").replace(/^[^:]*:/, "");
	const compact = value.split(":").pop() ?? "";
	if (/^\d{8}$/.test(compact)) return {
		date: `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`,
		time: null,
		allDay: true
	};
	const m = compact.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
	if (m) return {
		date: `${m[1]}-${m[2]}-${m[3]}`,
		time: `${m[4]}:${m[5]}`,
		allDay: false
	};
	return {
		date: compact,
		time: null,
		allDay: true
	};
}
function fromIcs(text) {
	const blocks = unfold(text).split(/BEGIN:VEVENT/i).slice(1);
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const events = [];
	for (const block of blocks) {
		const inner = block.split(/END:VEVENT/i)[0] ?? "";
		const get = (key) => {
			const line = inner.split(/\r?\n/).find((l) => l.toUpperCase().startsWith(key.toUpperCase()));
			if (!line) return "";
			const idx = line.indexOf(":");
			return idx >= 0 ? line.slice(idx + 1).replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";") : "";
		};
		const startLine = inner.split(/\r?\n/).find((l) => l.toUpperCase().startsWith("DTSTART")) ?? "";
		const endLine = inner.split(/\r?\n/).find((l) => l.toUpperCase().startsWith("DTEND")) ?? "";
		const start = parseDateField(startLine);
		const end = endLine ? parseDateField(endLine) : null;
		const title = get("SUMMARY") || "未命名";
		const typeRaw = get("CATEGORIES").split(",")[0]?.trim();
		const type = EVENT_TYPES.includes(typeRaw) ? typeRaw : "other";
		const color = get("X-SUNDIAL-COLOR") || colorForType(type);
		const id = (get("UID") || uid()).replace(/@sundial$/, "") || uid();
		events.push({
			id,
			title,
			notes: get("DESCRIPTION"),
			date: start.date,
			startTime: start.time,
			endTime: end && !end.allDay ? end.time : null,
			allDay: start.allDay,
			type,
			color,
			reminderMinutes: start.allDay ? null : 15,
			completed: false,
			createdAt: now,
			updatedAt: now
		});
	}
	return events;
}
function toBackup(events, settings) {
	const payload = {
		version: 1,
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		events,
		settings
	};
	return JSON.stringify(payload, null, 2);
}
function fromBackup(text) {
	const data = JSON.parse(text);
	if (!Array.isArray(data.events)) throw new Error("不是有效的日晷备份");
	return {
		events: data.events.filter((e) => e && typeof e.title === "string" && typeof e.date === "string"),
		settings: data.settings
	};
}
function downloadText(filename, content, mime) {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function Toggle({ checked, onChange, label, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onChange(!checked),
		className: "flex w-full items-center justify-between gap-4 rounded-lg bg-paper px-4 py-4 text-left shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-0.5 block text-xs text-subtle",
			children: hint
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `relative h-6 w-10 shrink-0 rounded-full transition-[background-color] duration-150 ${checked ? "bg-ink" : "bg-inset"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute top-0.5 size-5 rounded-full bg-paper transition-transform duration-150 ${checked ? "translate-x-4" : "translate-x-0.5"}` })
		})]
	});
}
function SettingsPage() {
	const mounted = useMounted();
	const events = useScheduleStore((s) => s.events);
	const settings = useScheduleStore((s) => s.settings);
	const updateSettings = useScheduleStore((s) => s.updateSettings);
	const replaceAll = useScheduleStore((s) => s.replaceAll);
	const mergeEvents = useScheduleStore((s) => s.mergeEvents);
	const fileRef = (0, import_react.useRef)(null);
	const [pending, setPending] = (0, import_react.useState)(null);
	async function enableNotifications(next) {
		if (!next) {
			updateSettings({ notifications: false });
			return;
		}
		if (typeof Notification === "undefined") {
			toast("当前环境不支持系统通知");
			return;
		}
		if (await Notification.requestPermission() !== "granted") {
			toast("未获得通知权限");
			updateSettings({ notifications: false });
			return;
		}
		updateSettings({ notifications: true });
		toast("提醒已打开");
	}
	async function enableSound(next) {
		updateSettings({ sound: next });
		if (next) {
			await unlockAudio();
			await playChime();
		}
	}
	function exportJson() {
		downloadText(`日晷-备份-${format(/* @__PURE__ */ new Date(), "yyyy-MM-dd")}.json`, toBackup(events, settings), "application/json");
		toast("已导出 JSON");
	}
	function exportIcs() {
		downloadText(`日晷-${format(/* @__PURE__ */ new Date(), "yyyy-MM-dd")}.ics`, toIcs(events), "text/calendar");
		toast("已导出日历文件");
	}
	async function onPick(file) {
		const text = await file.text();
		try {
			if (file.name.endsWith(".ics") || text.includes("BEGIN:VCALENDAR")) {
				const parsed = fromIcs(text);
				if (!parsed.length) throw new Error("空日历");
				setPending({
					events: parsed,
					name: file.name
				});
			} else {
				const parsed = fromBackup(text);
				setPending({
					events: parsed.events,
					settings: parsed.settings,
					name: file.name
				});
			}
		} catch {
			toast("无法识别这个文件");
		}
	}
	if (!mounted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-canvas" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "设置",
		subtitle: "提醒、声音、把日子带走或带回来。",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					checked: settings.notifications,
					onChange: enableNotifications,
					label: "系统提醒",
					hint: "到点会弹出系统通知。需要应用停留在后台或已打开。"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					checked: settings.sound,
					onChange: enableSound,
					label: "提示音",
					hint: "三声轻铃。第一次打开会试响一次。"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "def-remind",
					children: "默认提前提醒"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
					id: "def-remind",
					value: settings.defaultReminder === null ? "off" : String(settings.defaultReminder),
					onChange: (e) => updateSettings({ defaultReminder: e.target.value === "off" ? null : Number(e.target.value) }),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "off",
							children: "不提醒"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "0",
							children: "准时"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "5",
							children: "5 分钟前"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "10",
							children: "10 分钟前"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "15",
							children: "15 分钟前"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "30",
							children: "30 分钟前"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "60",
							children: "1 小时前"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "1440",
							children: "1 天前"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "weekstart",
					children: "一周从哪天起"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
					id: "weekstart",
					value: settings.weekStartsOn,
					onChange: (e) => updateSettings({ weekStartsOn: Number(e.target.value) }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: 1,
						children: "星期一"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: 0,
						children: "星期日"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg",
						children: "导入导出"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 mb-4 text-sm text-muted",
						children: "JSON 是完整备份，换手机时用它。ICS 可以交给其他日历软件。"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: exportJson,
								children: "导出 JSON"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: exportIcs,
								children: "导出 ICS"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => fileRef.current?.click(),
								children: "导入文件"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileRef,
								type: "file",
								accept: ".json,.ics,application/json,text/calendar",
								className: "hidden",
								onChange: (e) => {
									const f = e.target.files?.[0];
									if (f) onPick(f);
									e.target.value = "";
								}
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-subtle",
						children: [
							"目前共 ",
							events.length,
							" 件日程，只存在这台设备上。"
						]
					})
				]
			}),
			pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-xl bg-paper p-4 shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm",
					children: [
						"从 ",
						pending.name,
						" 读到 ",
						pending.events.length,
						" 件。"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => {
								mergeEvents(pending.events);
								toast("已合并导入");
								setPending(null);
							},
							children: "合并"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => {
								replaceAll(pending.events, pending.settings);
								toast("已替换全部");
								setPending(null);
							},
							children: "替换现有"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setPending(null),
							children: "取消"
						})
					]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-12 text-center text-xs leading-relaxed text-subtle",
				children: "日晷把日程留在本地。智能拆分在你按下按钮时才会发生。"
			})
		]
	});
}
//#endregion
export { SettingsPage as component };
