import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Settings } from "lucide-react";
import { OrbitDisc } from "@/components/disc/orbit-disc";
import { SundialMark } from "@/components/brand/sundial-mark";
import { useMounted, useNow } from "@/hooks/use-mounted";
import { formatTimeLabel } from "@/lib/schedule/dates";
import { sortEvents, useScheduleStore } from "@/lib/schedule/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const mounted = useMounted();
  const now = useNow(30000);
  const events = useScheduleStore((s) => s.events);
  const today = format(now, "yyyy-MM-dd");
  const todays = sortEvents(events.filter((e) => e.date === today));
  const next = todays.find((e) => {
    if (e.completed) return false;
    if (e.allDay || !e.startTime) return true;
    return e.startTime >= format(now, "HH:mm");
  }) ?? todays.find((e) => !e.completed);

  if (!mounted) {
    return (
      <div className="min-h-dvh bg-canvas text-ink">
        <header className="flex items-center justify-between px-5 pt-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <SundialMark size={22} />
            <div>
              <p className="font-display text-lg leading-none tracking-[0.08em]">日晷</p>
              <p className="mt-1 text-[10px] tracking-[0.28em] text-subtle uppercase">Sundial</p>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-canvas text-ink">
      <header className="flex items-center justify-between px-5 pt-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <SundialMark size={22} />
          <div>
            <p className="font-display text-lg leading-none tracking-[0.08em]">日晷</p>
            <p className="mt-1 text-[10px] tracking-[0.28em] text-subtle uppercase">Sundial</p>
          </div>
        </div>
        <Link
          to="/settings"
          aria-label="设置"
          className="flex size-11 items-center justify-center rounded-full text-muted transition-[background-color,color] duration-150 hover:bg-inset hover:text-ink"
        >
          <Settings className="size-5" strokeWidth={1.6} />
        </Link>
      </header>

      <main className="flex flex-col items-center px-4 pb-10 pt-6 sm:pt-10">
        <p className="mb-6 text-center text-sm tracking-[0.18em] text-subtle">
          {format(now, "yyyy年 M月d日", { locale: zhCN })}
        </p>
        <OrbitDisc now={now} todayCount={todays.length} />

        <div className="mt-10 w-full max-w-md">
          {next ? (
            <Link
              to="/today"
              className="flex items-center gap-4 rounded-xl bg-paper px-4 py-4 shadow-card transition-[box-shadow] duration-150 hover:shadow-lift"
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: next.color }} />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] tracking-[0.18em] text-subtle">下一件</span>
                <span className="mt-0.5 block truncate text-[15px] font-medium">{next.title}</span>
              </span>
              <span className="shrink-0 font-display text-sm tabular text-muted">
                {formatTimeLabel(next.startTime, next.allDay)}
              </span>
            </Link>
          ) : (
            <p className="text-center text-sm text-subtle">今天没有未完成的安排。</p>
          )}
        </div>
      </main>
    </div>
  );
}
