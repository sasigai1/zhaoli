import { f as cn } from "./router-Dzn3OfJZ.js";
import { jsx } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
//#region src/components/ui/button.tsx
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium select-none whitespace-nowrap rounded-full transition-[scale,background-color,color,box-shadow,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			primary: "bg-ink text-paper shadow-card hover:bg-accent",
			ghost: "bg-transparent text-ink hover:bg-inset",
			outline: "bg-paper text-ink shadow-card hover:shadow-lift",
			danger: "bg-danger text-paper hover:opacity-90"
		},
		size: {
			sm: "h-9 px-3.5 text-sm",
			md: "h-11 px-5 text-sm",
			lg: "h-12 px-6 text-base",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, type = "button", ...props }) {
	return /* @__PURE__ */ jsx("button", {
		type,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
//#region src/components/ui/field.tsx
function Label({ className, ...props }) {
	return /* @__PURE__ */ jsx("label", {
		className: cn("mb-1.5 block text-xs font-medium tracking-wide text-muted", className),
		...props
	});
}
var fieldClass = "h-11 w-full rounded-md bg-paper px-3.5 text-sm text-ink shadow-card outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ink/15";
function Input({ className, ...props }) {
	return /* @__PURE__ */ jsx("input", {
		className: cn(fieldClass, className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ jsx("textarea", {
		className: cn("min-h-32 w-full resize-y rounded-lg bg-paper px-4 py-3 text-base leading-relaxed text-ink shadow-card outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ink/15", className),
		...props
	});
}
function NativeSelect({ className, ...props }) {
	return /* @__PURE__ */ jsx("select", {
		className: cn(fieldClass, "appearance-none pr-8", className),
		...props
	});
}
//#endregion
export { Button as a, Textarea as i, Label as n, NativeSelect as r, Input as t };
