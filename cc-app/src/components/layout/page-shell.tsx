import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SundialMark } from "@/components/brand/sundial-mark";
import { cn } from "@/lib/utils";

export function PageShell({
  title,
  subtitle,
  children,
  action,
  wide,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line/70 bg-canvas/85 px-4 py-3 backdrop-blur-md">
        <Link
          to="/"
          className="inline-flex h-11 min-w-11 items-center gap-2 rounded-full px-2 text-sm text-muted transition-[background-color,color] duration-150 hover:bg-inset hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          <SundialMark size={16} />
          <span className="hidden sm:inline">圆盘</span>
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate font-display text-base tracking-wide">{title}</p>
        </div>
        <div className="flex min-w-11 justify-end">{action}</div>
      </header>
      <main
        className={cn(
          "page-enter mx-auto w-full px-4 pb-20 pt-8 sm:px-6",
          wide ? "max-w-5xl" : "max-w-2xl",
        )}
      >
        {subtitle ? (
          <p className="mb-8 max-w-prose text-sm leading-relaxed text-muted">{subtitle}</p>
        ) : null}
        {children}
      </main>
    </div>
  );
}
