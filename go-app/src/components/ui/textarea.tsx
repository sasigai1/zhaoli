import * as React from "react";
import { cn } from "@/lib/cn";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-none rounded-lg bg-paper px-3.5 py-3 text-[15px] leading-relaxed text-ink shadow-[inset_0_0_0_1px_var(--color-line)] placeholder:text-faint outline-none transition-[box-shadow] duration-150 ease-out focus-visible:shadow-[inset_0_0_0_1.5px_var(--color-accent)]",
        className,
      )}
      {...props}
    />
  );
}
