import { t as cn } from "./utils-C_uf36nf.js";
import "react";
import { jsx } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
//#region src/components/ui/button.tsx
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium tracking-wide select-none outline-none transition-[scale,background-color,color,box-shadow,opacity] duration-150 ease-out focus-visible:shadow-[0_0_0_2px_var(--color-paper),0_0_0_4px_var(--color-ink)] disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			primary: "bg-ink text-paper",
			stamp: "bg-stamp text-paper",
			outline: "bg-transparent text-ink shadow-border hover:shadow-border-hover",
			ghost: "bg-transparent text-ink hover:bg-paper-2"
		},
		size: {
			default: "h-11 px-4 text-sm",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-5 text-sm",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "default"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ jsx(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
export { Button as t };
