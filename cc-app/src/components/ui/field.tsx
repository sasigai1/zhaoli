import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-1.5 block text-xs font-medium tracking-wide text-muted", className)}
      {...props}
    />
  );
}

const fieldClass =
  "h-11 w-full rounded-md bg-paper px-3.5 text-sm text-ink shadow-card outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ink/15";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full resize-y rounded-lg bg-paper px-4 py-3 text-base leading-relaxed text-ink shadow-card outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ink/15",
        className,
      )}
      {...props}
    />
  );
}

export function NativeSelect({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(fieldClass, "appearance-none pr-8", className)}
      {...props}
    />
  );
}
