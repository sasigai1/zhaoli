import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, FilePenLine, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatClock } from "@/lib/folio/schema";
import { ProtocolGate } from "@/components/protocol-gate";

const TABS = [
  { to: "/", label: "本日", en: "TODAY", icon: FilePenLine, ids: ["today"] },
  { to: "/archive", label: "索引", en: "INDEX", icon: LayoutGrid, ids: ["archive", "day"] },
  { to: "/metrics", label: "统计", en: "METRICS", icon: BarChart3, ids: ["metrics"] },
] as const;

export function AppShell({
  children,
  tab,
}: {
  children: React.ReactNode;
  tab: "today" | "archive" | "metrics" | "day";
}) {
  const [now, setNow] = useState<Date | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="min-h-dvh bg-paper-2 text-ink">
      <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-paper shadow-device">
        <header className="safe-top z-20 shrink-0 border-b border-rule bg-paper">
          <div className="flex h-12 items-center justify-between px-5">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-sm font-medium tracking-[0.22em]">FOLIO</span>
              <span className="text-xs text-muted">日档</span>
            </div>
            <time className="font-mono text-xs tabular-nums text-muted" dateTime={now?.toISOString()}>
              {now ? formatClock(now) : "——:——:——"}
            </time>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>

        <nav className="safe-bottom z-20 shrink-0 border-t border-rule bg-paper">
          <ul className="grid h-[4.25rem] grid-cols-3">
            {TABS.map((item) => {
              const active = (item.ids as readonly string[]).includes(tab);
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "flex h-full flex-col items-center justify-center gap-0.5 outline-none transition-[color,opacity] duration-150 ease-out",
                      active ? "text-ink" : "text-faint",
                    )}
                    aria-current={active ? "page" : undefined}
                    data-active={pathname === item.to}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.1 : 1.6} />
                    <span className="text-[11px] font-medium tracking-wide">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <ProtocolGate />
      </div>
    </div>
  );
}
