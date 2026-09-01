import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/field-DEx_PKEc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var inputClass = "w-full bg-transparent text-ink outline-none placeholder:text-faint";
function FieldBox({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-sm bg-surface px-3 py-2.5 shadow-border focus-within:shadow-[0_0_0_1px_var(--color-ink)]", className),
		children
	});
}
var Input = import_react.forwardRef(function Input({ className, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref,
		className: cn(inputClass, "h-7 text-sm", className),
		...props
	});
});
var Textarea = import_react.forwardRef(function Textarea({ className, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		ref,
		className: cn(inputClass, "resize-none text-sm leading-7", className),
		...props
	});
});
//#endregion
export { Input as n, Textarea as r, FieldBox as t };
