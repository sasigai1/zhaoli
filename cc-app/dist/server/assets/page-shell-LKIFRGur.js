import { f as cn } from "./router-Dzn3OfJZ.js";
import { t as SundialMark } from "./sundial-mark-yY198ndL.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowLeft } from "lucide-react";
//#region src/components/layout/page-shell.tsx
function PageShell({ title, subtitle, children, action, wide }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-dvh bg-canvas text-ink",
		children: [/* @__PURE__ */ jsxs("header", {
			className: "sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line/70 bg-canvas/85 px-4 py-3 backdrop-blur-md",
			children: [
				/* @__PURE__ */ jsxs(Link, {
					to: "/",
					className: "inline-flex h-11 min-w-11 items-center gap-2 rounded-full px-2 text-sm text-muted transition-[background-color,color] duration-150 hover:bg-inset hover:text-ink",
					children: [
						/* @__PURE__ */ jsx(ArrowLeft, {
							className: "size-4",
							strokeWidth: 1.75
						}),
						/* @__PURE__ */ jsx(SundialMark, { size: 16 }),
						/* @__PURE__ */ jsx("span", {
							className: "hidden sm:inline",
							children: "圆盘"
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "min-w-0 flex-1 text-center",
					children: /* @__PURE__ */ jsx("p", {
						className: "truncate font-display text-base tracking-wide",
						children: title
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex min-w-11 justify-end",
					children: action
				})
			]
		}), /* @__PURE__ */ jsxs("main", {
			className: cn("page-enter mx-auto w-full px-4 pb-20 pt-8 sm:px-6", wide ? "max-w-5xl" : "max-w-2xl"),
			children: [subtitle ? /* @__PURE__ */ jsx("p", {
				className: "mb-8 max-w-prose text-sm leading-relaxed text-muted",
				children: subtitle
			}) : null, children]
		})]
	});
}
//#endregion
export { PageShell as t };
