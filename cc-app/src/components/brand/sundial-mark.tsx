import { cn } from "@/lib/utils";

export function SundialMark({ className, size = 22 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-ink", className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="12" r="5.8" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M12 3.2 V6.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M12 12 L16.2 8.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
