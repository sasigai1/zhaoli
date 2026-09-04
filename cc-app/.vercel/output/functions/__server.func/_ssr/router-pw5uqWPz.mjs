import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { f as createRouter, g as createRootRoute, h as createFileRoute, l as Scripts, m as lazyRouteComponent, p as Outlet, u as HeadContent, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as colorForType, t as DEFAULT_SETTINGS } from "./types-DkEh41EK.mjs";
import { n as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { a as isTomorrow, c as parse, h as startOfDay, i as isYesterday, l as format, m as differenceInCalendarDays, o as isToday, t as zhCN, v as addDays } from "../_libs/date-fns.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-pw5uqWPz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid() {
	return crypto.randomUUID();
}
function todayISO(now = /* @__PURE__ */ new Date()) {
	return format(now, "yyyy-MM-dd");
}
function parseISODate(iso) {
	return parse(iso, "yyyy-MM-dd", /* @__PURE__ */ new Date());
}
function friendlyDay(iso, now = /* @__PURE__ */ new Date()) {
	const d = parseISODate(iso);
	if (isToday(d)) return "今天";
	if (isTomorrow(d)) return "明天";
	if (isYesterday(d)) return "昨天";
	const diff = differenceInCalendarDays(startOfDay(d), startOfDay(now));
	if (diff > 1 && diff < 7) return format(d, "EEEE", { locale: zhCN });
	return format(d, "M月d日 EEE", { locale: zhCN });
}
function formatTimeLabel(time, allDay) {
	if (allDay || !time) return "全天";
	return time;
}
function combineDateTime(isoDate, time) {
	if (!time) return parseISODate(isoDate);
	return parse(`${isoDate} ${time}`, "yyyy-MM-dd HH:mm", /* @__PURE__ */ new Date());
}
function minutesToLabel(mins) {
	if (mins === 0) return "准时";
	if (mins < 60) return `${mins} 分钟前`;
	if (mins === 60) return "1 小时前";
	if (mins === 120) return "2 小时前";
	if (mins === 1440) return "1 天前";
	return `${mins} 分钟前`;
}
function stamp(partial, now = /* @__PURE__ */ new Date()) {
	const ts = now.toISOString();
	return {
		id: uid(),
		title: partial.title.trim(),
		notes: partial.notes ?? "",
		date: partial.date,
		startTime: partial.allDay ? null : partial.startTime,
		endTime: partial.allDay ? null : partial.endTime,
		allDay: partial.allDay || !partial.startTime,
		type: partial.type,
		color: partial.color || colorForType(partial.type),
		reminderMinutes: partial.reminderMinutes,
		completed: false,
		createdAt: ts,
		updatedAt: ts
	};
}
function seedEvents(now = /* @__PURE__ */ new Date()) {
	const d0 = todayISO(now);
	const d1 = format(addDays(now, 1), "yyyy-MM-dd");
	const d2 = format(addDays(now, 2), "yyyy-MM-dd");
	const d3 = format(addDays(now, 3), "yyyy-MM-dd");
	const sat = format(addDays(now, (6 - now.getDay() + 7) % 7 || 7), "yyyy-MM-dd");
	return [
		{
			title: "晨间散步",
			notes: "绕小区两圈，不带耳机。",
			date: d0,
			startTime: "07:40",
			endTime: "08:10",
			allDay: false,
			type: "health",
			color: colorForType("health"),
			reminderMinutes: 10
		},
		{
			title: "把想法写成三件事",
			notes: "只写标题，不展开。",
			date: d0,
			startTime: "10:00",
			endTime: "11:00",
			allDay: false,
			type: "focus",
			color: colorForType("focus"),
			reminderMinutes: 15
		},
		{
			title: "与同事同步进度",
			notes: "",
			date: d0,
			startTime: "15:00",
			endTime: "15:40",
			allDay: false,
			type: "work",
			color: colorForType("work"),
			reminderMinutes: 15
		},
		{
			title: "夜读四十五分钟",
			notes: "纸书，屏幕之外。",
			date: d0,
			startTime: "21:00",
			endTime: "21:45",
			allDay: false,
			type: "rest",
			color: colorForType("rest"),
			reminderMinutes: 5
		},
		{
			title: "图书馆半日",
			notes: "",
			date: d1,
			startTime: "09:30",
			endTime: "12:00",
			allDay: false,
			type: "study",
			color: colorForType("study"),
			reminderMinutes: 30
		},
		{
			title: "牙医复查",
			notes: "带上上次的片子。",
			date: d2,
			startTime: "14:20",
			endTime: "15:00",
			allDay: false,
			type: "health",
			color: colorForType("health"),
			reminderMinutes: 60
		},
		{
			title: "朋友晚饭",
			notes: "老地方。",
			date: d3,
			startTime: "19:00",
			endTime: "21:00",
			allDay: false,
			type: "social",
			color: colorForType("social"),
			reminderMinutes: 30
		},
		{
			title: "整理房间一角",
			notes: "只处理桌面。",
			date: sat,
			startTime: null,
			endTime: null,
			allDay: true,
			type: "personal",
			color: colorForType("personal"),
			reminderMinutes: null
		}
	].map((r) => stamp(r, now));
}
var useScheduleStore = create()(persist((set, get) => ({
	events: [],
	settings: DEFAULT_SETTINGS,
	firedReminders: {},
	hasSeeded: false,
	hydrated: false,
	setHydrated: (v) => set({ hydrated: v }),
	seedIfEmpty: () => {
		const { events, hasSeeded } = get();
		if (hasSeeded) return;
		if (events.length === 0) set({
			events: seedEvents(),
			hasSeeded: true
		});
		else set({ hasSeeded: true });
	},
	addDrafts: (drafts) => {
		const created = drafts.filter((d) => d.title.trim()).map((d) => stamp(d));
		set({ events: [...get().events, ...created] });
		return created;
	},
	updateEvent: (id, patch) => {
		const now = (/* @__PURE__ */ new Date()).toISOString();
		set({ events: get().events.map((e) => e.id === id ? {
			...e,
			...patch,
			id: e.id,
			updatedAt: now
		} : e) });
	},
	deleteEvent: (id) => {
		set({ events: get().events.filter((e) => e.id !== id) });
	},
	toggleComplete: (id) => {
		const now = (/* @__PURE__ */ new Date()).toISOString();
		set({ events: get().events.map((e) => e.id === id ? {
			...e,
			completed: !e.completed,
			updatedAt: now
		} : e) });
	},
	replaceAll: (events, settings) => {
		set({
			events,
			settings: settings ?? get().settings,
			firedReminders: {}
		});
	},
	mergeEvents: (incoming) => {
		const have = new Set(get().events.map((e) => e.id));
		const extra = incoming.filter((e) => !have.has(e.id));
		set({ events: [...get().events, ...extra] });
	},
	updateSettings: (patch) => {
		set({ settings: {
			...get().settings,
			...patch
		} });
	},
	markFired: (key) => {
		set({ firedReminders: {
			...get().firedReminders,
			[key]: Date.now()
		} });
	}
}), {
	name: "sundial-schedule-v1",
	partialize: (s) => ({
		events: s.events,
		settings: s.settings,
		firedReminders: s.firedReminders,
		hasSeeded: s.hasSeeded
	}),
	onRehydrateStorage: () => (state) => {
		state?.setHydrated(true);
		state?.seedIfEmpty();
	}
}));
function sortEvents(list) {
	return [...list].sort((a, b) => {
		const dk = a.date.localeCompare(b.date);
		if (dk !== 0) return dk;
		if (a.allDay && !b.allDay) return -1;
		if (!a.allDay && b.allDay) return 1;
		return (a.startTime ?? "99:99").localeCompare(b.startTime ?? "99:99");
	});
}
function HydrateStore() {
	const seedIfEmpty = useScheduleStore((s) => s.seedIfEmpty);
	const setHydrated = useScheduleStore((s) => s.setHydrated);
	(0, import_react.useEffect)(() => {
		const finish = () => {
			seedIfEmpty();
			setHydrated(true);
		};
		const unsub = useScheduleStore.persist.onFinishHydration(finish);
		if (useScheduleStore.persist.hasHydrated()) finish();
		return unsub;
	}, [seedIfEmpty, setHydrated]);
	return null;
}
var ctx = null;
function getCtx() {
	if (typeof window === "undefined") return null;
	if (!ctx) {
		const Ctor = window.AudioContext || window.webkitAudioContext;
		if (!Ctor) return null;
		ctx = new Ctor();
	}
	return ctx;
}
async function unlockAudio() {
	const audio = getCtx();
	if (!audio) return;
	if (audio.state === "suspended") await audio.resume();
}
function tone(audio, freq, start, duration, gain = .08) {
	const osc = audio.createOscillator();
	const g = audio.createGain();
	osc.type = "sine";
	osc.frequency.value = freq;
	g.gain.setValueAtTime(0, start);
	g.gain.linearRampToValueAtTime(gain, start + .02);
	g.gain.exponentialRampToValueAtTime(1e-4, start + duration);
	osc.connect(g);
	g.connect(audio.destination);
	osc.start(start);
	osc.stop(start + duration + .05);
}
async function playChime() {
	const audio = getCtx();
	if (!audio) return;
	if (audio.state === "suspended") await audio.resume();
	const t = audio.currentTime + .02;
	tone(audio, 523.25, t, 1.4, .07);
	tone(audio, 659.25, t + .12, 1.5, .05);
	tone(audio, 783.99, t + .28, 1.8, .045);
}
function vibrateSoft() {
	try {
		navigator.vibrate?.([
			40,
			60,
			40
		]);
	} catch {}
}
function ReminderWatcher() {
	const events = useScheduleStore((s) => s.events);
	const settings = useScheduleStore((s) => s.settings);
	const fired = useScheduleStore((s) => s.firedReminders);
	const markFired = useScheduleStore((s) => s.markFired);
	(0, import_react.useEffect)(() => {
		if (!settings.notifications && !settings.sound) return;
		const tick = () => {
			const now = Date.now();
			for (const e of events) {
				if (e.completed || e.reminderMinutes === null || e.allDay || !e.startTime) continue;
				const start = combineDateTime(e.date, e.startTime).getTime();
				if (now < start - e.reminderMinutes * 6e4 || now > start + 3e5) continue;
				const key = `${e.id}:${e.date}:${e.startTime}:${e.reminderMinutes}`;
				if (fired[key]) continue;
				markFired(key);
				if (settings.sound) playChime();
				vibrateSoft();
				if (settings.notifications && typeof Notification !== "undefined" && Notification.permission === "granted") try {
					new Notification(e.title, {
						body: e.startTime ? `${e.startTime} 开始` : "日程提醒",
						lang: "zh-CN",
						tag: key,
						silent: true
					});
				} catch {}
				toast(e.title, { description: e.startTime ? `${e.startTime} 开始` : "日程提醒" });
			}
		};
		tick();
		const id = window.setInterval(tick, 15e3);
		return () => window.clearInterval(id);
	}, [
		events,
		settings,
		fired,
		markFired
	]);
	return null;
}
function useMounted() {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	return mounted;
}
function useNow(intervalMs = 3e4) {
	const [now, setNow] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	(0, import_react.useEffect)(() => {
		setNow(/* @__PURE__ */ new Date());
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), intervalMs);
		return () => window.clearInterval(id);
	}, [intervalMs]);
	return now;
}
var styles_default = "/assets/styles-Cujz2cno.css";
var APP_NAME = "日晷 Sundial";
var Route$8 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#F3F0EA"
			},
			{
				name: "description",
				content: "把一天轻轻转过来。用一句话记下多件日程。"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&family=Noto+Serif+SC:wght@500;600&display=swap"
			}
		]
	}),
	component: Root
});
function ClientToaster() {
	if (!useMounted()) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		theme: "light",
		position: "top-center",
		toastOptions: { className: "font-sans !bg-paper !text-ink !shadow-lift !border-0" }
	});
}
function Root() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "zh-CN",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "min-h-dvh bg-canvas text-ink",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HydrateStore, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReminderWatcher, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientToaster, {})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$7 = () => import("./routes-BErffmiT.mjs");
var Route$7 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./calendar-C9sexs8e.mjs");
var Route$6 = createFileRoute("/calendar")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./compose-B5MNXVTY.mjs");
var Route$5 = createFileRoute("/compose")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./insights-BJng9135.mjs");
var Route$4 = createFileRoute("/insights")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./month-BU0B4xBZ.mjs");
var Route$3 = createFileRoute("/month")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./settings-COQQBWhy.mjs");
var Route$2 = createFileRoute("/settings")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./timeline-CRApxl19.mjs");
var Route$1 = createFileRoute("/timeline")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./today-CDgK1RsF.mjs");
var Route = createFileRoute("/today")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$7.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$8
	}),
	CalendarRoute: Route$6.update({
		id: "/calendar",
		path: "/calendar",
		getParentRoute: () => Route$8
	}),
	ComposeRoute: Route$5.update({
		id: "/compose",
		path: "/compose",
		getParentRoute: () => Route$8
	}),
	InsightsRoute: Route$4.update({
		id: "/insights",
		path: "/insights",
		getParentRoute: () => Route$8
	}),
	MonthRoute: Route$3.update({
		id: "/month",
		path: "/month",
		getParentRoute: () => Route$8
	}),
	SettingsRoute: Route$2.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => Route$8
	}),
	TimelineRoute: Route$1.update({
		id: "/timeline",
		path: "/timeline",
		getParentRoute: () => Route$8
	}),
	TodayRoute: Route.update({
		id: "/today",
		path: "/today",
		getParentRoute: () => Route$8
	})
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { unlockAudio as a, formatTimeLabel as c, todayISO as d, cn as f, playChime as i, friendlyDay as l, useMounted as n, sortEvents as o, uid as p, useNow as r, useScheduleStore as s, router_exports as t, minutesToLabel as u };
