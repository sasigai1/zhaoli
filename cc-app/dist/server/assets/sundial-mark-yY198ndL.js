import { f as cn } from "./router-Dzn3OfJZ.js";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/brand/sundial-mark.tsx
function SundialMark({ className, size = 22 }) {
	return /* @__PURE__ */ jsxs("svg", {
		width: size,
		height: size,
		viewBox: "0 0 24 24",
		fill: "none",
		className: cn("text-ink", className),
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "9.2",
				stroke: "currentColor",
				strokeWidth: "1.1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "5.8",
				stroke: "currentColor",
				strokeWidth: "1.1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "2.2",
				stroke: "currentColor",
				strokeWidth: "1.1"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M12 3.2 V6.4",
				stroke: "currentColor",
				strokeWidth: "1.1",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M12 12 L16.2 8.4",
				stroke: "currentColor",
				strokeWidth: "1.1",
				strokeLinecap: "round"
			})
		]
	});
}
//#endregion
export { SundialMark as t };
