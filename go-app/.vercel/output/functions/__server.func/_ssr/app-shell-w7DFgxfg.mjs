import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { f as Slot } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as number, n as array, o as object, r as boolean, s as string, t as _enum } from "../_libs/zod.mjs";
import { a as Square, c as MapPin, d as CalendarDays, f as Bell, i as SunMedium, o as Plus, r as Trash2, s as Mic, t as User } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { f as differenceInMinutes, g as startOfWeek, h as startOfDay, i as parseISO, m as addMinutes, n as setMinutes, p as isSameDay, r as setHours, s as format, t as zhCN, v as addDays } from "../_libs/date-fns.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as Drawer } from "../_libs/vaul.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-w7DFgxfg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function at(day, hour, minute) {
	return setMinutes(setHours(startOfDay(day), hour), minute).toISOString();
}
function fromNow(now, minuteOffset, durationMin) {
	const startDate = addMinutes(now, minuteOffset);
	startDate.setSeconds(0, 0);
	startDate.setMinutes(Math.round(startDate.getMinutes() / 5) * 5);
	const endDate = addMinutes(startDate, durationMin);
	return {
		start: startDate.toISOString(),
		end: endDate.toISOString()
	};
}
function event(partial) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		notes: "",
		location: "",
		reminderFired: false,
		createdAt: now,
		updatedAt: now,
		...partial
	};
}
function makeSeed(now = /* @__PURE__ */ new Date()) {
	const today = startOfDay(now);
	const tomorrow = addDays(today, 1);
	const after = addDays(today, 2);
	const yesterday = addDays(today, -1);
	const minutesLeft = 1440 - (now.getHours() * 60 + now.getMinutes());
	const current = fromNow(now, -40, 90);
	const later = minutesLeft > 130 ? fromNow(now, 80, 60) : null;
	const evening = minutesLeft > 220 ? fromNow(now, 160, 35) : null;
	const includeMorning = now.getHours() < 16;
	return [
		{
			id: "seed-y-review",
			title: "昨日复盘",
			start: at(yesterday, 17, 0),
			end: at(yesterday, 17, 40),
			kind: "work",
			reminderMinutes: null
		},
		...includeMorning ? [{
			id: "seed-morning",
			title: "晨间阅读",
			start: at(today, 8, 0),
			end: at(today, 8, 40),
			kind: "rest",
			reminderMinutes: 10,
			notes: "不看消息，只读书。"
		}] : [],
		{
			id: "seed-deep",
			title: "深度工作 · 设计系统",
			start: current.start,
			end: current.end,
			kind: "focus",
			reminderMinutes: 15,
			notes: "关掉通知，只做主界面。"
		},
		...later ? [{
			id: "seed-walk",
			title: "散步与晚餐",
			start: later.start,
			end: later.end,
			kind: "life",
			reminderMinutes: 20
		}] : [],
		...evening ? [{
			id: "seed-journal",
			title: "晚间日记",
			start: evening.start,
			end: evening.end,
			kind: "rest",
			reminderMinutes: 0
		}] : [],
		{
			id: "seed-dentist",
			title: "看牙",
			start: at(tomorrow, 10, 0),
			end: at(tomorrow, 11, 0),
			kind: "life",
			reminderMinutes: 60,
			location: "市口腔医院"
		},
		{
			id: "seed-design",
			title: "与李设计对稿",
			start: at(tomorrow, 15, 0),
			end: at(tomorrow, 16, 0),
			kind: "work",
			reminderMinutes: 15
		},
		{
			id: "seed-workshop",
			title: "工作坊",
			start: at(after, 9, 30),
			end: at(after, 12, 0),
			kind: "focus",
			reminderMinutes: 30,
			location: "东馆 B1"
		},
		{
			id: "seed-weekend",
			title: "周末出游准备",
			start: at(after, 0, 0),
			end: at(after, 23, 59),
			kind: "life",
			reminderMinutes: null,
			allDay: true
		}
	].map((item) => event({
		id: item.id,
		title: item.title,
		start: item.start,
		end: item.end,
		kind: item.kind,
		reminderMinutes: item.reminderMinutes,
		location: item.location ?? "",
		notes: item.notes ?? "",
		allDay: item.allDay ?? false
	}));
}
function dateKey(date) {
	const d = typeof date === "string" ? parseISO(date) : date;
	return format(d, "yyyy-MM-dd");
}
function parseKey(key) {
	return parseISO(`${key}T12:00:00`);
}
function formatDayTitle(date) {
	return format(date, "M月d日", { locale: zhCN });
}
function formatWeekday(date) {
	return format(date, "EEEE", { locale: zhCN });
}
function formatClock(date) {
	return format(date, "HH:mm");
}
function formatRange(start, end, allDay) {
	if (allDay) return "全天";
	return `${formatClock(start)} – ${formatClock(end)}`;
}
function weekDays(anchor) {
	const start = startOfWeek(anchor, { weekStartsOn: 1 });
	return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
function eventsOnDay(events, day) {
	return events.filter((event) => isSameDay(parseISO(event.start), day)).sort((a, b) => +parseISO(a.start) - +parseISO(b.start));
}
function timedEvents(events) {
	return events.filter((event) => !event.allDay);
}
function allDayEvents(events) {
	return events.filter((event) => event.allDay);
}
function ribbonHours(events, now, viewingToday) {
	const hours = timedEvents(events).flatMap((event) => [parseISO(event.start).getHours(), parseISO(event.end).getHours()]);
	if (viewingToday) hours.push(now.getHours());
	const min = hours.length ? Math.min(...hours) : 8;
	const max = hours.length ? Math.max(...hours) : 18;
	return {
		startHour: Math.max(0, Math.min(7, min) - (min <= 7 ? 0 : 1)),
		endHour: Math.min(24, Math.max(21, max + 1))
	};
}
function minutesFromStart(date, startHour) {
	return (date.getHours() - startHour) * 60 + date.getMinutes() + date.getSeconds() / 60;
}
function eventMetrics(event, startHour) {
	const start = parseISO(event.start);
	const end = parseISO(event.end);
	const top = minutesFromStart(start, startHour) / 60 * 72;
	const minutes = Math.max(differenceInMinutes(end, start), 20);
	return {
		top,
		height: Math.max(minutes / 60 * 72, 40)
	};
}
function relativeLabel(from, target) {
	const minutes = differenceInMinutes(target, from);
	if (minutes > -2 && minutes < 2) return "就是现在";
	if (minutes >= 0 && minutes < 60) return `${minutes} 分钟后`;
	if (minutes >= 60 && minutes < 1440) {
		const hours = Math.floor(minutes / 60);
		const rest = minutes % 60;
		return rest ? `${hours} 小时 ${rest} 分后` : `${hours} 小时后`;
	}
	if (minutes < 0 && minutes > -60) return `已过 ${Math.abs(minutes)} 分钟`;
	if (minutes <= -60 && minutes > -1440) return `已过 ${Math.floor(Math.abs(minutes) / 60)} 小时`;
	if (minutes >= 1440) return `${Math.round(minutes / 1440)} 天后`;
	return `${Math.round(Math.abs(minutes) / 1440)} 天前`;
}
function remainingLabel(now, end) {
	const minutes = differenceInMinutes(end, now);
	if (minutes <= 0) return "即将结束";
	if (minutes < 60) return `还剩 ${minutes} 分钟`;
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return rest ? `还剩 ${hours} 小时 ${rest} 分` : `还剩 ${hours} 小时`;
}
function nextUp(events, now) {
	const timed = [...timedEvents(events)].sort((a, b) => +parseISO(a.start) - +parseISO(b.start));
	const current = timed.find((event) => {
		const start = parseISO(event.start);
		const end = parseISO(event.end);
		return start <= now && now < end;
	});
	if (current) return {
		event: current,
		status: "now"
	};
	const upcoming = timed.find((event) => parseISO(event.start) > now);
	if (upcoming) return {
		event: upcoming,
		status: "next"
	};
	return null;
}
function fingerprintEvents(events) {
	return events.map((event) => `${event.id}:${event.start}:${event.end}:${event.title}`).join("|");
}
function toLocalDateTimeValue(iso) {
	const d = parseISO(iso);
	return {
		date: format(d, "yyyy-MM-dd"),
		time: format(d, "HH:mm")
	};
}
function reminderLabel(minutes) {
	if (minutes === null) return "不提醒";
	if (minutes === 0) return "准时提醒";
	if (minutes === 60) return "提前 1 小时";
	return `提前 ${minutes} 分钟`;
}
var defaultSettings = {
	defaultReminder: 15,
	notifyEnabled: false
};
function stamp() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
function withId(event) {
	const now = stamp();
	return {
		...event,
		id: crypto.randomUUID(),
		reminderFired: false,
		createdAt: now,
		updatedAt: now
	};
}
var useSchedule = create()(persist((set, get) => ({
	events: [],
	briefs: {},
	settings: defaultSettings,
	seeded: false,
	selectedDate: dateKey(/* @__PURE__ */ new Date()),
	composerOpen: false,
	selectedEventId: null,
	setSelectedDate: (key) => set({ selectedDate: key }),
	openComposer: () => set({
		composerOpen: true,
		selectedEventId: null
	}),
	closeComposer: () => set({ composerOpen: false }),
	selectEvent: (id) => set({
		selectedEventId: id,
		composerOpen: false
	}),
	addEvents: (events) => set({ events: [...get().events, ...events.map(withId)] }),
	updateEvent: (id, patch) => set({ events: get().events.map((event) => event.id === id ? {
		...event,
		...patch,
		updatedAt: stamp()
	} : event) }),
	removeEvent: (id) => set({
		events: get().events.filter((event) => event.id !== id),
		selectedEventId: get().selectedEventId === id ? null : get().selectedEventId
	}),
	markReminderFired: (id) => set({ events: get().events.map((event) => event.id === id ? {
		...event,
		reminderFired: true
	} : event) }),
	resetRemindersIfFuture: () => {
		const now = Date.now();
		set({ events: get().events.map((event) => {
			const start = Date.parse(event.start);
			if (event.reminderMinutes === null) return event;
			if (start - event.reminderMinutes * 6e4 > now && event.reminderFired) return {
				...event,
				reminderFired: false
			};
			return event;
		}) });
	},
	saveBrief: (brief) => set({ briefs: {
		...get().briefs,
		[brief.date]: brief
	} }),
	setSettings: (patch) => set({ settings: {
		...get().settings,
		...patch
	} }),
	restoreSample: () => set({
		events: makeSeed(),
		seeded: true,
		briefs: {}
	})
}), {
	name: "sujian-schedule-v2",
	skipHydration: true,
	partialize: (state) => ({
		events: state.events,
		briefs: state.briefs,
		settings: state.settings,
		seeded: state.seeded
	}),
	onRehydrateStorage: () => (state) => {
		if (!state) return;
		if (!state.seeded || state.events.length === 0) queueMicrotask(() => {
			useSchedule.setState({
				events: makeSeed(),
				seeded: true
			});
		});
	}
}));
function useHydratedSchedule() {
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const finish = () => {
			if (cancelled) return;
			const state = useSchedule.getState();
			if (!state.seeded || state.events.length === 0) useSchedule.setState({
				events: makeSeed(),
				seeded: true
			});
			useSchedule.setState({ selectedDate: dateKey(/* @__PURE__ */ new Date()) });
			useSchedule.getState().resetRemindersIfFuture();
			setHydrated(true);
		};
		const run = async () => {
			try {
				const result = useSchedule.persist?.rehydrate?.();
				if (result && typeof result.then === "function") await Promise.race([result, new Promise((resolve) => window.setTimeout(resolve, 250))]);
			} catch {}
			finish();
		};
		run();
		return () => {
			cancelled = true;
		};
	}, []);
	return hydrated;
}
function useReminders(enabled) {
	const firedRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		if (!enabled) return;
		const tick = () => {
			const { events, markReminderFired } = useSchedule.getState();
			const now = Date.now();
			for (const event of events) {
				if (event.reminderMinutes === null) continue;
				if (event.reminderFired || firedRef.current.has(event.id)) continue;
				const start = +parseISO(event.start);
				if (now < start - event.reminderMinutes * 6e4 || now > start + 12e4) continue;
				firedRef.current.add(event.id);
				markReminderFired(event.id);
				const when = formatClock(parseISO(event.start));
				const body = event.reminderMinutes === 0 ? `${when} 开始 · ${event.title}` : `${event.title} · ${when} 开始`;
				toast(event.title, { description: body });
				if (typeof Notification !== "undefined" && Notification.permission === "granted") try {
					new Notification("素笺", {
						body,
						tag: event.id
					});
				} catch {}
			}
		};
		tick();
		const id = window.setInterval(tick, 2e4);
		return () => window.clearInterval(id);
	}, [enabled]);
}
function BrandMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 16 28",
		className: cn("text-ink", className),
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "7.2",
			y: "0",
			width: "1.6",
			height: "28",
			fill: "currentColor"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "8",
			cy: "9",
			r: "2.6",
			fill: "var(--color-accent)"
		})]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var KindSchema = _enum([
	"work",
	"life",
	"focus",
	"rest"
]);
var ParseInput = object({
	text: string().min(1).max(500),
	nowIso: string(),
	timeZone: string(),
	selectedDate: string(),
	defaultReminder: number().nullable()
});
var parseSchedule = createServerFn({ method: "POST" }).validator((input) => ParseInput.parse(input)).handler(createSsrRpc("c9a2a8338cb76306fa056f0980e70f0018c1f5c5bf06d51ff7195615fe81d514"));
var BriefInput = object({
	nowIso: string(),
	date: string(),
	events: array(object({
		title: string(),
		start: string(),
		end: string(),
		allDay: boolean(),
		kind: KindSchema
	}))
});
var writeBrief = createServerFn({ method: "POST" }).validator((input) => BriefInput.parse(input)).handler(createSsrRpc("402a9c830cf27c958fe1e1034f7b0d618f04142da7ea4e72229192f87c77c5e0"));
var SculptInput = object({
	nowIso: string(),
	date: string(),
	events: array(object({
		id: string(),
		title: string(),
		start: string(),
		end: string(),
		allDay: boolean(),
		kind: KindSchema
	}))
});
var sculptSchedule = createServerFn({ method: "POST" }).validator((input) => SculptInput.parse(input)).handler(createSsrRpc("6c0ea454a951f1473acbb37e8fd3bcb1718a5a43933998f1cab927d9c09f5d02"));
var EVENT_KINDS = [
	"work",
	"life",
	"focus",
	"rest"
];
var KIND_LABEL = {
	work: "工作",
	life: "生活",
	focus: "专注",
	rest: "留白"
};
var REMINDER_OPTIONS = [
	{
		value: null,
		label: "不提醒"
	},
	{
		value: 0,
		label: "准时"
	},
	{
		value: 5,
		label: "提前 5 分"
	},
	{
		value: 15,
		label: "提前 15 分"
	},
	{
		value: 30,
		label: "提前 30 分"
	},
	{
		value: 60,
		label: "提前 1 时"
	}
];
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium select-none whitespace-nowrap rounded-md transition-[background-color,color,opacity,transform,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			solid: "bg-ink text-sheet shadow-[0_1px_0_rgba(255,255,255,0.08)_inset] hover:bg-ink/90",
			soft: "bg-accent-soft text-ink hover:bg-accent-soft/80",
			ghost: "bg-transparent text-ink hover:bg-ink/5",
			outline: "bg-sheet text-ink shadow-card hover:bg-paper",
			danger: "bg-transparent text-ink/70 hover:bg-ink/5 hover:text-ink"
		},
		size: {
			sm: "h-9 px-3 text-sm",
			md: "h-11 px-4 text-sm",
			lg: "h-12 px-5 text-[15px]",
			icon: "size-11",
			pill: "h-9 px-3.5 text-sm rounded-full"
		}
	},
	defaultVariants: {
		variant: "solid",
		size: "md"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-md bg-paper px-3.5 text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--color-line)] placeholder:text-faint outline-none transition-[box-shadow] duration-150 ease-out focus-visible:shadow-[inset_0_0_0_1.5px_var(--color-accent)]", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-28 w-full resize-none rounded-lg bg-paper px-3.5 py-3 text-[15px] leading-relaxed text-ink shadow-[inset_0_0_0_1px_var(--color-line)] placeholder:text-faint outline-none transition-[box-shadow] duration-150 ease-out focus-visible:shadow-[inset_0_0_0_1.5px_var(--color-accent)]", className),
		...props
	});
}
function BottomSheet({ open, onOpenChange, children, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Root, {
		open,
		onOpenChange,
		shouldScaleBackground: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer.Portal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Overlay, { className: "fixed inset-0 z-40 bg-ink/25" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer.Content, {
			className: cn("fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-[430px] flex-col rounded-t-xl bg-sheet shadow-float outline-none"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center pt-3 pb-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 w-10 rounded-full bg-line" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Title, {
					className: "sr-only",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(18px+env(safe-area-inset-bottom))]",
					children
				})
			]
		})] })
	});
}
function KindDot({ kind, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("inline-block size-1.5 rounded-full", kind === "work" && "bg-ink", kind === "life" && "bg-accent", kind === "focus" && "bg-ink/70", kind === "rest" && "bg-muted", className) });
}
function KindChip({ kind, active, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm transition-[background-color,color] duration-150 ease-out", active ? "bg-ink text-sheet" : "bg-paper text-muted hover:text-ink"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindDot, {
			kind,
			className: active ? "bg-sheet" : void 0
		}), KIND_LABEL[kind]]
	});
}
var PROMPTS = [
	"明天上午十点开会一小时",
	"今晚八点电影，提前半小时提醒",
	"周六全天出游"
];
function Composer({ open, onOpenChange }) {
	const selectedDate = useSchedule((s) => s.selectedDate);
	const defaultReminder = useSchedule((s) => s.settings.defaultReminder);
	const addEvents = useSchedule((s) => s.addEvents);
	const [mode, setMode] = (0, import_react.useState)("speak");
	const [text, setText] = (0, import_react.useState)("");
	const [listening, setListening] = (0, import_react.useState)(false);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const recRef = (0, import_react.useRef)(null);
	const draft = (0, import_react.useMemo)(() => {
		const hour = (/* @__PURE__ */ new Date()).getHours();
		const startH = Math.min(hour + 1, 22);
		return {
			title: "",
			date: selectedDate,
			start: `${String(startH).padStart(2, "0")}:00`,
			end: `${String(startH + 1).padStart(2, "0")}:00`,
			allDay: false,
			kind: "work",
			reminderMinutes: defaultReminder,
			location: "",
			notes: ""
		};
	}, [selectedDate, defaultReminder]);
	const [hand, setHand] = (0, import_react.useState)(draft);
	const reset = () => {
		setText("");
		setPreview(null);
		setPending(false);
		setListening(false);
		recRef.current?.stop();
		recRef.current = null;
		setHand({
			title: "",
			date: selectedDate,
			start: "09:00",
			end: "10:00",
			allDay: false,
			kind: "work",
			reminderMinutes: defaultReminder,
			location: "",
			notes: ""
		});
	};
	const close = (next) => {
		if (!next) reset();
		onOpenChange(next);
	};
	const speechAvailable = typeof window !== "undefined" && Boolean(window.webkitSpeechRecognition);
	const toggleListen = () => {
		const SR = window.webkitSpeechRecognition;
		if (!SR) {
			toast("此浏览器还不支持口述");
			return;
		}
		if (listening) {
			recRef.current?.stop();
			return;
		}
		const rec = new SR();
		rec.lang = "zh-CN";
		rec.interimResults = true;
		rec.continuous = false;
		rec.onresult = (ev) => {
			const transcript = ev.results[ev.results.length - 1]?.[0]?.transcript ?? "";
			if (transcript) setText(transcript);
		};
		rec.onend = () => {
			setListening(false);
			recRef.current = null;
		};
		rec.onerror = () => {
			setListening(false);
			recRef.current = null;
		};
		recRef.current = rec;
		setListening(true);
		rec.start();
	};
	const parse = async () => {
		const value = text.trim();
		if (!value) return;
		setPending(true);
		try {
			const result = await parseSchedule({ data: {
				text: value,
				nowIso: (/* @__PURE__ */ new Date()).toISOString(),
				timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				selectedDate,
				defaultReminder
			} });
			if (!result.ok) {
				toast(result.error);
				return;
			}
			setPreview(result);
		} catch {
			toast("书记未能落笔，请稍后再试。");
		} finally {
			setPending(false);
		}
	};
	const commitPreview = () => {
		if (!preview) return;
		addEvents(preview.events);
		toast(preview.reply);
		close(false);
	};
	const commitHand = () => {
		if (!hand.title.trim()) {
			toast("先写下标题");
			return;
		}
		const start = hand.allDay ? (/* @__PURE__ */ new Date(`${hand.date}T00:00:00`)).toISOString() : (/* @__PURE__ */ new Date(`${hand.date}T${hand.start}:00`)).toISOString();
		const end = hand.allDay ? (/* @__PURE__ */ new Date(`${hand.date}T23:59:00`)).toISOString() : (/* @__PURE__ */ new Date(`${hand.date}T${hand.end}:00`)).toISOString();
		addEvents([{
			title: hand.title.trim(),
			start,
			end,
			allDay: hand.allDay,
			kind: hand.kind,
			reminderMinutes: hand.reminderMinutes,
			location: hand.location.trim(),
			notes: hand.notes.trim()
		}]);
		toast("已写入日程");
		close(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomSheet, {
		open,
		onOpenChange: close,
		title: "写下日程",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pt-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-serif text-[28px] leading-none tracking-tight",
					children: "写下"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "口述给书记，或自己落笔。"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 grid grid-cols-2 rounded-full bg-paper p-1",
					children: ["speak", "hand"].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setMode(item),
						className: cn("h-9 rounded-full text-sm transition-[background-color,color] duration-150 ease-out", mode === item ? "bg-sheet text-ink shadow-card" : "text-muted"),
						children: item === "speak" ? "口述" : "手写"
					}, item))
				}),
				mode === "speak" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: text,
								onChange: (e) => {
									setText(e.target.value);
									setPreview(null);
								},
								placeholder: "明天上午十点，和设计组开会一小时，提前十五分钟提醒",
								rows: 4
							}), speechAvailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: toggleListen,
								"aria-label": listening ? "停止口述" : "开始口述",
								className: cn("absolute right-2.5 bottom-2.5 flex size-10 items-center justify-center rounded-full transition-[background-color,color] duration-150 ease-out", listening ? "bg-ink text-sheet" : "bg-sheet text-ink shadow-card"),
								children: listening ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" })
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: PROMPTS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setText(item);
									setPreview(null);
								},
								className: "rounded-full bg-paper px-3 py-1.5 text-xs text-muted transition-colors duration-150 hover:text-ink",
								children: item
							}, item))
						}),
						pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "shimmer-text mt-6 font-serif text-lg",
							children: "正在落笔…"
						}) : null,
						preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: preview.reply
								}),
								preview.events.map((event, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-paper px-4 py-3 shadow-card",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindDot, { kind: event.kind }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium",
											children: event.title
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm tabular-nums text-muted",
										children: [
											formatRange(parseISO(event.start), parseISO(event.end), event.allDay),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mx-1.5 text-faint",
												children: "·"
											}),
											KIND_LABEL[event.kind]
										]
									})]
								}, `${event.title}-${index}`)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "mt-2 w-full",
									size: "lg",
									onClick: commitPreview,
									children: "收入日程"
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-5 w-full",
							size: "lg",
							disabled: !text.trim() || pending,
							onClick: parse,
							children: "请书记整理"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-5 space-y-4",
					onSubmit: (e) => {
						e.preventDefault();
						commitHand();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: hand.title,
							onChange: (e) => setHand({
								...hand,
								title: e.target.value
							}),
							placeholder: "标题"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-xs text-muted",
								children: ["日期", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									className: "mt-1.5",
									value: hand.date,
									onChange: (e) => setHand({
										...hand,
										date: e.target.value
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-end gap-2 pb-1 text-sm text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									className: "size-4 accent-ink",
									checked: hand.allDay,
									onChange: (e) => setHand({
										...hand,
										allDay: e.target.checked
									})
								}), "全天"]
							})]
						}),
						!hand.allDay ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-xs text-muted",
								children: ["开始", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "time",
									className: "mt-1.5",
									value: hand.start,
									onChange: (e) => setHand({
										...hand,
										start: e.target.value
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-xs text-muted",
								children: ["结束", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "time",
									className: "mt-1.5",
									value: hand.end,
									onChange: (e) => setHand({
										...hand,
										end: e.target.value
									})
								})]
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: EVENT_KINDS.map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindChip, {
								kind,
								active: hand.kind === kind,
								onClick: () => setHand({
									...hand,
									kind
								})
							}, kind))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: REMINDER_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setHand({
									...hand,
									reminderMinutes: option.value
								}),
								className: cn("h-9 rounded-full px-3 text-sm transition-[background-color,color] duration-150", hand.reminderMinutes === option.value ? "bg-ink text-sheet" : "bg-paper text-muted"),
								children: option.label
							}, String(option.value)))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: hand.location,
							onChange: (e) => setHand({
								...hand,
								location: e.target.value
							}),
							placeholder: "地点（可选）"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							size: "lg",
							children: "收入日程"
						})
					]
				})
			]
		})
	});
}
function EventDetail({ eventId, onClose }) {
	const event = useSchedule((s) => s.events.find((item) => item.id === eventId));
	const updateEvent = useSchedule((s) => s.updateEvent);
	const removeEvent = useSchedule((s) => s.removeEvent);
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)("");
	const [start, setStart] = (0, import_react.useState)("");
	const [end, setEnd] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("work");
	const [reminderMinutes, setReminderMinutes] = (0, import_react.useState)(15);
	const [location, setLocation] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!event) {
			setEditing(false);
			return;
		}
		const s = toLocalDateTimeValue(event.start);
		const e = toLocalDateTimeValue(event.end);
		setTitle(event.title);
		setDate(s.date);
		setStart(s.time);
		setEnd(e.time);
		setKind(event.kind);
		setReminderMinutes(event.reminderMinutes);
		setLocation(event.location);
		setNotes(event.notes);
		setEditing(false);
	}, [event]);
	const save = () => {
		if (!event || !title.trim()) return;
		updateEvent(event.id, {
			title: title.trim(),
			start: event.allDay ? (/* @__PURE__ */ new Date(`${date}T00:00:00`)).toISOString() : (/* @__PURE__ */ new Date(`${date}T${start}:00`)).toISOString(),
			end: event.allDay ? (/* @__PURE__ */ new Date(`${date}T23:59:00`)).toISOString() : (/* @__PURE__ */ new Date(`${date}T${end}:00`)).toISOString(),
			kind,
			reminderMinutes,
			reminderFired: false,
			location: location.trim(),
			notes: notes.trim()
		});
		toast("已改写");
		setEditing(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomSheet, {
		open: Boolean(event),
		onOpenChange: (open) => !open && onClose(),
		title: "日程",
		children: event ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pt-2",
			children: editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: title,
						onChange: (e) => setTitle(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: date,
						onChange: (e) => setDate(e.target.value)
					}),
					!event.allDay ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "time",
							value: start,
							onChange: (e) => setStart(e.target.value)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "time",
							value: end,
							onChange: (e) => setEnd(e.target.value)
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: EVENT_KINDS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindChip, {
							kind: item,
							active: kind === item,
							onClick: () => setKind(item)
						}, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: REMINDER_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setReminderMinutes(option.value),
							className: cn("h-9 rounded-full px-3 text-sm", reminderMinutes === option.value ? "bg-ink text-sheet" : "bg-paper text-muted"),
							children: option.label
						}, String(option.value)))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: location,
						onChange: (e) => setLocation(e.target.value),
						placeholder: "地点"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: notes,
						onChange: (e) => setNotes(e.target.value),
						placeholder: "备注"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "flex-1",
							onClick: save,
							children: "保存"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setEditing(false),
							children: "取消"
						})]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm tracking-[0.18em] text-muted",
					children: formatDayTitle(parseISO(event.start))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-serif text-[32px] leading-tight tracking-tight",
					children: event.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 tabular-nums text-muted",
					children: formatRange(parseISO(event.start), parseISO(event.end), event.allDay)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: reminderLabel(event.reminderMinutes)
				}),
				event.location ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 flex items-center gap-1.5 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 text-muted" }), event.location]
				}) : null,
				event.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-relaxed text-muted",
					children: event.notes
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "flex-1",
						onClick: () => setEditing(true),
						children: "改写"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "px-3",
						"aria-label": "删除",
						onClick: () => {
							removeEvent(event.id);
							toast("已从纸上抹去");
							onClose();
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})]
				})
			] })
		}) : null
	});
}
var TABS = [
	{
		id: "today",
		to: "/",
		label: "今日",
		icon: SunMedium
	},
	{
		id: "month",
		to: "/month",
		label: "月历",
		icon: CalendarDays
	},
	{
		id: "reminders",
		to: "/reminders",
		label: "提醒",
		icon: Bell
	},
	{
		id: "me",
		to: "/me",
		label: "我",
		icon: User
	}
];
function AppShell({ active, children }) {
	const hydrated = useHydratedSchedule();
	const composerOpen = useSchedule((s) => s.composerOpen);
	const selectedEventId = useSchedule((s) => s.selectedEventId);
	const openComposer = useSchedule((s) => s.openComposer);
	const closeComposer = useSchedule((s) => s.closeComposer);
	const selectEvent = useSchedule((s) => s.selectEvent);
	const notifyEnabled = useSchedule((s) => s.settings.notifyEnabled);
	useReminders(hydrated && notifyEnabled);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-sheet md:min-h-[100dvh] md:shadow-sheet",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex items-center gap-2.5 px-5 pt-[max(18px,env(safe-area-inset-top))] pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { className: "h-7 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-serif text-[22px] leading-none tracking-wide",
								children: "素笺"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 text-[11px] tracking-[0.18em] text-muted",
								children: "BLANK PAGE"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "relative min-h-0 flex-1 overflow-y-auto",
						children: hydrated ? children : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 pt-8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-serif text-4xl tracking-tight text-ink",
								children: "素笺"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: "正在展开今天的纸面…"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "relative grid grid-cols-5 border-t border-line/80 bg-sheet pb-[env(safe-area-inset-bottom)]",
						children: [
							TABS.slice(0, 2).map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
								tab,
								active: active === tab.id
							}, tab.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: openComposer,
									"aria-label": "写下日程",
									className: "relative -top-4 flex size-14 items-center justify-center rounded-full bg-ink text-sheet shadow-float transition-transform duration-150 ease-out active:scale-[0.96]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
										className: "size-6",
										strokeWidth: 1.75
									})
								})
							}),
							TABS.slice(2).map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
								tab,
								active: active === tab.id
							}, tab.id))
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Composer, {
				open: composerOpen,
				onOpenChange: (open) => open ? openComposer() : closeComposer()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventDetail, {
				eventId: selectedEventId,
				onClose: () => selectEvent(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				position: "top-center",
				toastOptions: { className: "!bg-sheet !text-ink !shadow-float !border-0 !rounded-lg font-sans" }
			})
		]
	});
}
function NavItem({ tab, active }) {
	const Icon = tab.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: tab.to,
		"aria-current": active ? "page" : void 0,
		className: cn("flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] tracking-wide transition-colors duration-150 ease-out", active ? "text-ink" : "text-muted"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-[18px]",
			strokeWidth: active ? 2.1 : 1.7
		}), tab.label]
	});
}
//#endregion
export { ribbonHours as C, weekDays as D, useSchedule as E, writeBrief as O, reminderLabel as S, timedEvents as T, minutesFromStart as _, KindDot as a, relativeLabel as b, cn as c, eventsOnDay as d, fingerprintEvents as f, formatWeekday as g, formatRange as h, KIND_LABEL as i, dateKey as l, formatDayTitle as m, BrandMark as n, REMINDER_OPTIONS as o, formatClock as p, Button as r, allDayEvents as s, AppShell as t, eventMetrics as u, nextUp as v, sculptSchedule as w, remainingLabel as x, parseKey as y };
