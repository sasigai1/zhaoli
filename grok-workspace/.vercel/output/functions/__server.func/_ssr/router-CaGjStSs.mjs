import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as createRootRoute, b as require_jsx_runtime, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as number, c as union, i as literal, n as _null, o as object, r as array, s as string, t as _enum } from "../_libs/zod.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { a as getDaysInYear, c as endOfWeek, d as eachDayOfInterval, f as isValid, h as addDays, i as isAfter, n as parseISO, o as format, p as startOfWeek, r as subDays, s as getDayOfYear, t as zhCN, u as startOfMonth } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CaGjStSs.js
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
		className: "flex min-h-dvh flex-col items-center justify-center gap-3 bg-paper px-6 text-center text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-stamp",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-8",
					strokeWidth: 1.75
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs tracking-[0.18em] text-faint",
				children: "ERROR"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-medium",
				children: "系统中断"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-muted",
				children: error.message || "发生未预期的错误。请重新载入。"
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
var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
var MOODS = [
	{
		value: 1,
		label: "低迷",
		en: "LOW"
	},
	{
		value: 2,
		label: "平缓",
		en: "FLAT"
	},
	{
		value: 3,
		label: "稳定",
		en: "STEADY"
	},
	{
		value: 4,
		label: "积极",
		en: "UP"
	},
	{
		value: 5,
		label: "充沛",
		en: "FULL"
	}
];
var DENSITIES = [
	{
		value: 1,
		label: "空档",
		en: "VOID"
	},
	{
		value: 2,
		label: "稀薄",
		en: "THIN"
	},
	{
		value: 3,
		label: "正常",
		en: "NORM"
	},
	{
		value: 4,
		label: "饱满",
		en: "RICH"
	},
	{
		value: 5,
		label: "过载",
		en: "MAX"
	}
];
var TAGS = [
	"工作",
	"生活",
	"健康",
	"学习",
	"社交",
	"财务",
	"家庭",
	"出行",
	"创作",
	"其他"
];
var DayRecordSchema = object({
	id: string().regex(DATE_RE),
	status: _enum(["draft", "filed"]),
	summary: string(),
	items: array(string()),
	body: string(),
	mood: union([
		literal(1),
		literal(2),
		literal(3),
		literal(4),
		literal(5),
		_null()
	]),
	density: union([
		literal(1),
		literal(2),
		literal(3),
		literal(4),
		literal(5),
		_null()
	]),
	tags: array(string()),
	updatedAt: string().nullable(),
	filedAt: string().nullable()
});
var LedgerFileSchema = object({
	version: literal(1),
	exportedAt: string(),
	records: array(DayRecordSchema)
});
var SECTIONS = [
	{
		key: "summary",
		no: "01",
		label: "摘要",
		en: "SUMMARY",
		required: true
	},
	{
		key: "agenda",
		no: "02",
		label: "事项",
		en: "AGENDA",
		required: true
	},
	{
		key: "body",
		no: "03",
		label: "正文",
		en: "LOG",
		required: true
	},
	{
		key: "assessment",
		no: "04",
		label: "评估",
		en: "ASSESSMENT",
		required: true
	},
	{
		key: "marks",
		no: "05",
		label: "标记",
		en: "MARKS",
		required: true
	}
];
function emptyRecord(id) {
	return {
		id,
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
}
function localIsoDate(d = /* @__PURE__ */ new Date()) {
	return format(d, "yyyy-MM-dd");
}
function parseDate(id) {
	if (!DATE_RE.test(id)) return null;
	const d = parseISO(id);
	return isValid(d) ? d : null;
}
function isFutureDate(id, today) {
	return id > today;
}
function fileId(id) {
	const d = parseDate(id);
	if (!d) return "F-————-———";
	return `F-${d.getFullYear()}-${String(getDayOfYear(d)).padStart(3, "0")}`;
}
function dayOfYearLabel(id) {
	const d = parseDate(id);
	if (!d) return "";
	const n = getDayOfYear(d);
	const total = getDaysInYear(d);
	return `DAY ${String(n).padStart(3, "0")} / ${total}`;
}
function formatDisplayDate(id) {
	return id.replaceAll("-", ".");
}
function formatChineseDate(id) {
	const d = parseDate(id);
	if (!d) return id;
	return format(d, "yyyy年M月d日 EEEE", { locale: zhCN });
}
function formatWeekdayEn(id) {
	const d = parseDate(id);
	if (!d) return "";
	return format(d, "EEE").toUpperCase();
}
function formatClock(d) {
	return format(d, "HH:mm:ss");
}
function formatStampTime(iso) {
	if (!iso) return "—";
	const d = new Date(iso);
	if (!isValid(d)) return "—";
	return format(d, "yyyy.MM.dd HH:mm");
}
function glyphCount(text) {
	return Array.from(text.replace(/\s+/g, "")).length;
}
function padCount(n, width = 4) {
	return String(n).padStart(width, "0");
}
function filledItems(items) {
	return items.map((s) => s.trim()).filter(Boolean);
}
function sectionState(rec) {
	const summary = glyphCount(rec.summary);
	return {
		summary: summary >= 8 && summary <= 48,
		agenda: filledItems(rec.items).length >= 1,
		body: glyphCount(rec.body) >= 40,
		assessment: rec.mood !== null && rec.density !== null,
		marks: rec.tags.length >= 1
	};
}
function completeness(rec) {
	const state = sectionState(rec);
	const done = SECTIONS.filter((s) => state[s.key]).length;
	return {
		done,
		total: SECTIONS.length,
		ready: done === SECTIONS.length
	};
}
function normalizeRecord(rec) {
	return {
		...rec,
		summary: rec.summary.trim(),
		items: filledItems(rec.items).slice(0, 5),
		body: rec.body.trim(),
		tags: rec.tags.filter((t, i, a) => TAGS.includes(t) && a.indexOf(t) === i)
	};
}
function monthCells(year, monthIndex) {
	const start = startOfMonth(new Date(year, monthIndex, 1));
	const end = new Date(year, monthIndex + 1, 0);
	const gridStart = startOfWeek(start, { weekStartsOn: 1 });
	const gridEnd = endOfWeek(end, { weekStartsOn: 1 });
	return eachDayOfInterval({
		start: gridStart,
		end: gridEnd
	}).map((d) => d.getMonth() === monthIndex ? localIsoDate(d) : null);
}
function enumerateDays(from, to) {
	const a = parseDate(from);
	const b = parseDate(to);
	if (!a || !b || isAfter(a, b)) return [];
	return eachDayOfInterval({
		start: a,
		end: b
	}).map((d) => localIsoDate(d));
}
function unfiledGaps(records, from, to) {
	return enumerateDays(from, to).filter((id) => records[id]?.status !== "filed");
}
function cellKind(id, records, today) {
	if (id > today) return "future";
	const rec = records[id];
	if (!rec) return "empty";
	if (rec.status === "filed") return "filed";
	const { done } = completeness(rec);
	return done > 0 ? "draft" : "empty";
}
var SEED = [
	{
		offset: 12,
		summary: "对齐预算口径，夜间整理书桌与待办",
		items: [
			"与财务核对 Q3 口径",
			"清理桌面至空档",
			"阅读行业周报"
		],
		body: "上午把预算表第三列的口径与财务对齐，避免月底合并时再返工。下午会议纪要已写入共享盘。晚上把书桌清到只留当期文件夹，这种秩序会让明天的开始更干净。",
		mood: 4,
		density: 4,
		tags: ["工作", "生活"]
	},
	{
		offset: 11,
		summary: "客户评审延期，补读两份行业报告",
		items: ["调整评审日程", "摘录报告要点"],
		body: "评审被临时推迟到下周。空出的下午用来补读两份报告，把关键数字抄进索引卡。延期不是损失，只要把空档填成准备。",
		mood: 3,
		density: 3,
		tags: ["工作", "学习"]
	},
	{
		offset: 10,
		summary: "完成接口文档第二稿并提交评审",
		items: [
			"修订错误码一节",
			"补时序图",
			"提交评审单"
		],
		body: "接口文档第二稿在下午四点提交。错误码表按责任域重新分组，时序图只保留主路径。评审单编号已登记。剩余边角明天处理。",
		mood: 4,
		density: 4,
		tags: ["工作"]
	},
	{
		offset: 8,
		summary: "周末检修个人工作流，清空收件箱",
		items: [
			"归档上周邮件",
			"更新模板",
			"备份本地记录"
		],
		body: "把收件箱清到零。模板库里过期的三份已废止。本地记录做了一次完整导出。周末适合做这种不产生新事项、只恢复秩序的工作。",
		mood: 3,
		density: 3,
		tags: ["生活", "财务"]
	},
	{
		offset: 7,
		summary: "家人聚餐，邮件一律留待次日",
		items: ["晚餐", "未处理工作邮件"],
		body: "今晚不处理工作。聚餐从六点到九点，话题很碎，但该在场。邮件标为次日首项。把生活和工作隔开，本身也是一种归档。",
		mood: 5,
		density: 2,
		tags: ["家庭", "生活"]
	},
	{
		offset: 6,
		summary: "重构登录模块，测试覆盖率升至八成",
		items: [
			"拆分会话逻辑",
			"补齐失败路径测试",
			"记录变更说明"
		],
		body: "登录路径拆成会话、凭证、风控三块。失败路径的测试补了十一例，覆盖率到百分之八十二。变更说明写在仓库的 PROTOCOL 目录，方便后人检索。",
		mood: 4,
		density: 5,
		tags: ["工作", "学习"]
	},
	{
		offset: 4,
		summary: "往返出差，车上完成两份会议纪要",
		items: [
			"早班出发",
			"客户现场对齐",
			"返程写纪要"
		],
		body: "车上是适合写纪要的地方。现场只记事实，车上补结论和待办。两份纪要在到站前写完，发送前又核对了一遍数字。出行的密度很高，但没有漏项。",
		mood: 3,
		density: 5,
		tags: ["出行", "工作"]
	},
	{
		offset: 3,
		summary: "例会纪要归档，晚间运动三十分钟",
		items: [
			"整理例会待办",
			"更新看板",
			"跑步三十分钟"
		],
		body: "例会待办全部落到看板上，每条都有责任人和日期。晚上跑步三十分钟，配速不重要，完成即可。白天的密度用身体结算一次。",
		mood: 4,
		density: 3,
		tags: ["工作", "健康"]
	},
	{
		offset: 2,
		summary: "处理两起线上问题并复盘根因",
		items: [
			"定位故障窗口",
			"发布热修",
			"写复盘"
		],
		body: "上午两起告警，根因都在同一处超时配置。热修在十一点前发布。复盘只写事实、影响、动作，不写情绪。同类问题不该出现第三次。",
		mood: 2,
		density: 4,
		tags: ["工作"]
	},
	{
		offset: 1,
		summary: "月末结账，核对发票与报销单",
		items: [
			"核对发票十二张",
			"提交报销",
			"关闭本月清单"
		],
		body: "把本月发票按日期摊开，缺号的两张已经补齐。报销单提交后，本月清单全部勾完。月末最适合做一次闭合，而不是再开新项。",
		mood: 3,
		density: 4,
		tags: ["财务", "工作"]
	}
];
function buildSeed(today) {
	const todayIso = localIsoDate(today);
	const out = {};
	for (const spec of SEED) {
		const id = localIsoDate(subDays(today, spec.offset));
		if (id >= todayIso) continue;
		const filedAt = addDays(parseISO(id), 0);
		filedAt.setHours(21, 14, 0, 0);
		out[id] = {
			id,
			status: "filed",
			summary: spec.summary,
			items: spec.items,
			body: spec.body,
			mood: spec.mood,
			density: spec.density,
			tags: [...spec.tags],
			updatedAt: filedAt.toISOString(),
			filedAt: filedAt.toISOString()
		};
	}
	return out;
}
function weekStarts() {
	return [
		"一",
		"二",
		"三",
		"四",
		"五",
		"六",
		"日"
	];
}
var STORAGE_KEY = "folio-ledger-v1";
function coerceRecords(raw) {
	if (!raw || typeof raw !== "object") return {};
	const out = {};
	for (const value of Object.values(raw)) {
		const parsed = DayRecordSchema.safeParse(value);
		if (parsed.success) out[parsed.data.id] = parsed.data;
	}
	return out;
}
function readStorage() {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return null;
		const rec = parsed;
		return {
			records: coerceRecords(rec.records),
			onboarded: Boolean(rec.onboarded),
			initialized: Boolean(rec.initialized)
		};
	} catch {
		return null;
	}
}
function writeStorage(state) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
			records: state.records,
			onboarded: state.onboarded,
			initialized: state.initialized
		}));
	} catch {}
}
var useLedger = create((set, get) => ({
	records: {},
	onboarded: false,
	initialized: false,
	patch: (id, partial) => {
		const current = get().records[id] ?? emptyRecord(id);
		if (current.status === "filed") return;
		const next = {
			...current,
			...partial,
			id,
			status: "draft",
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		set((s) => ({ records: {
			...s.records,
			[id]: next
		} }));
	},
	file: (id) => {
		const normalized = normalizeRecord(get().records[id] ?? emptyRecord(id));
		if (!completeness(normalized).ready) return false;
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const next = {
			...normalized,
			status: "filed",
			updatedAt: now,
			filedAt: now
		};
		set((s) => ({ records: {
			...s.records,
			[id]: next
		} }));
		return true;
	},
	reopen: (id) => {
		const current = get().records[id];
		if (!current || current.status !== "filed") return;
		set((s) => ({ records: {
			...s.records,
			[id]: {
				...current,
				status: "draft",
				filedAt: null,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			}
		} }));
	},
	voidDay: (id) => {
		set((s) => {
			const next = { ...s.records };
			delete next[id];
			return { records: next };
		});
	},
	completeOnboarding: () => set({ onboarded: true }),
	replaceAll: (records) => set({
		records,
		initialized: true
	})
}));
if (typeof window !== "undefined") useLedger.subscribe((state) => {
	if (!state.initialized) return;
	writeStorage({
		records: state.records,
		onboarded: state.onboarded,
		initialized: state.initialized
	});
});
function hydrateLedger() {
	const stored = readStorage();
	if (stored?.initialized) {
		useLedger.setState({
			records: stored.records,
			onboarded: stored.onboarded,
			initialized: true
		});
		return;
	}
	useLedger.setState({
		records: buildSeed(/* @__PURE__ */ new Date()),
		onboarded: stored?.onboarded ?? false,
		initialized: true
	});
}
function parseImportedLedger(raw) {
	const parsed = LedgerFileSchema.safeParse(raw);
	if (parsed.success) {
		const records = {};
		for (const rec of parsed.data.records) records[rec.id] = rec;
		return records;
	}
	if (Array.isArray(raw)) {
		const records = {};
		for (const item of raw) {
			const r = DayRecordSchema.safeParse(item);
			if (r.success) records[r.data.id] = r.data;
		}
		return Object.keys(records).length ? records : null;
	}
	return null;
}
function exportPayload(records) {
	return {
		version: 1,
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		records: Object.values(records).sort((a, b) => a.id.localeCompare(b.id))
	};
}
function FolioHydration({ children }) {
	(0, import_react.useEffect)(() => {
		hydrateLedger();
	}, []);
	return children;
}
var styles_default = "/assets/styles-DpRiXHTT.css";
var APP_NAME = "日档 FOLIO";
var Route$5 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "每一日，归档一次。企业化日度记录系统，防止日后遗忘本日。"
			},
			{
				name: "theme-color",
				content: "#f1eee6"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "default"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "FOLIO"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "192x192",
				href: "/icon-192.png"
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "512x512",
				href: "/icon-512.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600&display=swap"
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
			}
		]
	}),
	component: RootDocument
});
function RootDocument() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "zh-Hans",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolioHydration, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
var $$splitComponentImporter$4 = () => import("../_folio-DZEJMH8C.mjs");
var Route$4 = createFileRoute("/_folio")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("../_folio-aWAyuOjt.mjs");
var Route$3 = createFileRoute("/_folio/")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./archive-CIU-8QAL.mjs");
var Route$2 = createFileRoute("/_folio/archive")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./metrics-D2xq8tc0.mjs");
var Route$1 = createFileRoute("/_folio/metrics")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./d._date-oCeTp2-_.mjs");
var Route = createFileRoute("/_folio/d/$date")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var FolioRoute = Route$4.update({
	id: "/_folio",
	getParentRoute: () => Route$5
});
var FolioIndexRoute = Route$3.update({
	id: "/",
	path: "/",
	getParentRoute: () => FolioRoute
});
var FolioRouteChildren = {
	FolioArchiveRoute: Route$2.update({
		id: "/archive",
		path: "/archive",
		getParentRoute: () => FolioRoute
	}),
	FolioMetricsRoute: Route$1.update({
		id: "/metrics",
		path: "/metrics",
		getParentRoute: () => FolioRoute
	}),
	FolioIndexRoute,
	FolioDDateRoute: Route.update({
		id: "/d/$date",
		path: "/d/$date",
		getParentRoute: () => FolioRoute
	})
};
var rootRouteChildren = { FolioRoute: FolioRoute._addFileChildren(FolioRouteChildren) };
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { localIsoDate as C, sectionState as D, parseDate as E, unfiledGaps as O, isFutureDate as S, padCount as T, formatClock as _, useLedger as a, formatWeekdayEn as b, SECTIONS as c, completeness as d, dayOfYearLabel as f, formatChineseDate as g, filledItems as h, parseImportedLedger as i, weekStarts as k, TAGS as l, fileId as m, Route as n, DENSITIES as o, enumerateDays as p, exportPayload as r, MOODS as s, router_exports as t, cellKind as u, formatDisplayDate as v, monthCells as w, glyphCount as x, formatStampTime as y };
