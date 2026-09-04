import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as ArrowLeft } from "../_libs/lucide-react.mjs";
import { f as cn } from "./router-pw5uqWPz.mjs";
import { t as SundialMark } from "./sundial-mark-D3GVoKpV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/page-shell-D8j_c2-V.js
var import_jsx_runtime = require_jsx_runtime();
function PageShell({ title, subtitle, children, action, wide }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-canvas text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line/70 bg-canvas/85 px-4 py-3 backdrop-blur-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "inline-flex h-11 min-w-11 items-center gap-2 rounded-full px-2 text-sm text-muted transition-[background-color,color] duration-150 hover:bg-inset hover:text-ink",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
							className: "size-4",
							strokeWidth: 1.75
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SundialMark, { size: 16 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "圆盘"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 flex-1 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-display text-base tracking-wide",
						children: title
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex min-w-11 justify-end",
					children: action
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: cn("page-enter mx-auto w-full px-4 pb-20 pt-8 sm:px-6", wide ? "max-w-5xl" : "max-w-2xl"),
			children: [subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-8 max-w-prose text-sm leading-relaxed text-muted",
				children: subtitle
			}) : null, children]
		})]
	});
}
//#endregion
export { PageShell as t };
