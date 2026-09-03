import * as React from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md bg-paper px-3.5 text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--color-line)] placeholder:text-faint outline-none transition-[box-shadow] duration-150 ease-out focus-visible:shadow-[inset_0_0_0_1.5px_var(--color-accent)]",
        className,
      )}
      {...props}
    />
  );
}
