import * as React from "react";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full bg-transparent text-ink outline-none placeholder:text-faint";

export function FieldBox({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-sm bg-surface px-3 py-2.5 shadow-border focus-within:shadow-[0_0_0_1px_var(--color-ink)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(inputClass, "h-7 text-sm", className)} {...props} />;
  },
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(inputClass, "resize-none text-sm leading-7", className)}
      {...props}
    />
  );
});
