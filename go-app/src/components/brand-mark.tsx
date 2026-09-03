import { cn } from "@/lib/cn";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 28"
      className={cn("text-ink", className)}
      aria-hidden="true"
    >
      <rect x="7.2" y="0" width="1.6" height="28" fill="currentColor" />
      <circle cx="8" cy="9" r="2.6" fill="var(--color-accent)" />
    </svg>
  );
}
