import type { ComponentProps } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/cn";

export function Switch({
  className,
  ...props
}: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative inline-flex h-7 w-11 shrink-0 items-center rounded-full bg-line transition-[background-color] duration-150 ease-out data-[state=checked]:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 translate-x-1 rounded-full bg-sheet shadow-card transition-transform duration-150 ease-out data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  );
}
