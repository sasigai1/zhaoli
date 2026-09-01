import { i as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as require_jsx_runtime, d as useRouterState, m as Outlet, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { o as LayoutGrid, s as FilePenLine, u as ChartColumn } from "./_libs/lucide-react.mjs";
import { C as localIsoDate, _ as formatClock, a as useLedger } from "./_ssr/router-CaGjStSs.mjs";
import { t as cn } from "./_ssr/utils-C_uf36nf.mjs";
import { t as Button } from "./_ssr/button-lc9gu-sZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_folio-DZEJMH8C.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	{
		no: "01",
		title: "每日五栏",
		body: "摘要、事项、正文、评估、标记。结构固定，不增不减。"
	},
	{
		no: "02",
		title: "齐备方可归档",
		body: "五栏全部达到阈值后，才允许盖章归档。草稿会自动写入本机。"
	},
	{
		no: "03",
		title: "已归档即锁定",
		body: "归档后记录只读。如需改写，先执行重开。"
	},
	{
		no: "04",
		title: "数据仅存本机",
		body: "记录保存在此设备本地。可随时导出卷宗副本。"
	}
];
function ProtocolGate() {
	const onboarded = useLedger((s) => s.onboarded);
	const completeOnboarding = useLedger((s) => s.completeOnboarding);
	if (onboarded) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-40 flex flex-col overflow-y-auto bg-paper px-6 pt-safe",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex w-full max-w-md flex-1 flex-col py-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-[0.22em] text-faint",
					children: "FOLIO · PROTOCOL"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 text-3xl font-medium tracking-tight",
					children: "归档规程"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "每一日，归档一次。防止日后遗忘本日。"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-8 flex flex-1 flex-col gap-0 border-t border-rule",
					children: STEPS.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid grid-cols-[auto_1fr] gap-3 border-b border-rule py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-10 font-mono text-sm tabular-nums text-faint",
							children: step.no
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: step.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm leading-relaxed text-muted",
							children: step.body
						})] })]
					}, step.no))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-8 w-full",
					size: "lg",
					type: "button",
					onClick: completeOnboarding,
					children: "开始本日"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 pb-6 text-center font-mono text-[10px] tracking-[0.16em] text-faint",
					children: "LOCAL STORE · NO ACCOUNT"
				})
			]
		})
	});
}
var TABS = [
	{
		to: "/",
		label: "本日",
		en: "TODAY",
		icon: FilePenLine,
		ids: ["today"]
	},
	{
		to: "/archive",
		label: "索引",
		en: "INDEX",
		icon: LayoutGrid,
		ids: ["archive", "day"]
	},
	{
		to: "/metrics",
		label: "统计",
		en: "METRICS",
		icon: ChartColumn,
		ids: ["metrics"]
	}
];
function AppShell({ children, tab }) {
	const [now, setNow] = (0, import_react.useState)(null);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		setNow(/* @__PURE__ */ new Date());
		const t = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
		return () => window.clearInterval(t);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh bg-paper-2 text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-paper shadow-device",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "safe-top z-20 shrink-0 border-b border-rule bg-paper",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-12 items-center justify-between px-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-sm font-medium tracking-[0.22em]",
								children: "FOLIO"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted",
								children: "日档"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
							className: "font-mono text-xs tabular-nums text-muted",
							dateTime: now?.toISOString(),
							children: now ? formatClock(now) : "——:——:——"
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "min-h-0 flex-1 overflow-y-auto",
					children
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "safe-bottom z-20 shrink-0 border-t border-rule bg-paper",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid h-[4.25rem] grid-cols-3",
						children: TABS.map((item) => {
							const active = item.ids.includes(tab);
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("flex h-full flex-col items-center justify-center gap-0.5 outline-none transition-[color,opacity] duration-150 ease-out", active ? "text-ink" : "text-faint"),
								"aria-current": active ? "page" : void 0,
								"data-active": pathname === item.to,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-5",
									strokeWidth: active ? 2.1 : 1.6
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-medium tracking-wide",
									children: item.label
								})]
							}) }, item.to);
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtocolGate, {})
			]
		})
	});
}
function FolioLayout() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const today = localIsoDate();
	let tab = "today";
	if (pathname.startsWith("/archive")) tab = "archive";
	else if (pathname.startsWith("/metrics")) tab = "metrics";
	else if (pathname.startsWith("/d/")) tab = pathname.slice(3) === today ? "today" : "day";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		tab,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
//#endregion
export { FolioLayout as component };
