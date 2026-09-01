import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-[opacity,transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96]",
  {
    variants: {
      variant: {
        ghost: "text-muted hover:text-fg",
        solid: "bg-accent text-accent-fg hover:opacity-90",
        quiet: "text-fg/90 hover:bg-fg/5",
      },
      size: {
        sm: "h-9 min-w-9 rounded-sm px-3 text-sm",
        md: "h-11 min-w-11 rounded-md px-4 text-sm",
        icon: "size-11 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "sm",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
