import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium select-none whitespace-nowrap rounded-md transition-[background-color,color,opacity,transform,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96]",
  {
    variants: {
      variant: {
        solid:
          "bg-ink text-sheet shadow-[0_1px_0_rgba(255,255,255,0.08)_inset] hover:bg-ink/90",
        soft: "bg-accent-soft text-ink hover:bg-accent-soft/80",
        ghost: "bg-transparent text-ink hover:bg-ink/5",
        outline: "bg-sheet text-ink shadow-card hover:bg-paper",
        danger: "bg-transparent text-ink/70 hover:bg-ink/5 hover:text-ink",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-5 text-[15px]",
        icon: "size-11",
        pill: "h-9 px-3.5 text-sm rounded-full",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
