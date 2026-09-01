import { t as cn } from "./utils-C_uf36nf.js";
import * as React from "react";
import { jsx } from "react/jsx-runtime";
//#region src/components/ui/field.tsx
var inputClass = "w-full bg-transparent text-ink outline-none placeholder:text-faint";
function FieldBox({ className, children }) {
	return /* @__PURE__ */ jsx("div", {
		className: cn("rounded-sm bg-surface px-3 py-2.5 shadow-border focus-within:shadow-[0_0_0_1px_var(--color-ink)]", className),
		children
	});
}
var Input = React.forwardRef(function Input({ className, ...props }, ref) {
	return /* @__PURE__ */ jsx("input", {
		ref,
		className: cn(inputClass, "h-7 text-sm", className),
		...props
	});
});
var Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) {
	return /* @__PURE__ */ jsx("textarea", {
		ref,
		className: cn(inputClass, "resize-none text-sm leading-7", className),
		...props
	});
});
//#endregion
export { Input as n, Textarea as r, FieldBox as t };
