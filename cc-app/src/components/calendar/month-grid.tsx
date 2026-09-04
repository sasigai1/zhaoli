import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { ScheduleEvent } from "@/lib/schedule/types";

const WEEKDAYS_MON = ["一", "二", "三", "四", "五", "六", "日"];
const WEEKDAYS_SUN = ["日", "一", "二", "三", "四", "五", "六"];

export function MonthGrid({
  month,
  events,
  selected,
  onSelect,
  weekStartsOn = 1,
  compact,
}: {
  month: Date;
  events: ScheduleEvent[];
  selected?: string;
  onSelect?: (iso: string) => void;
  weekStartsOn?: 0 | 1;
  compact?: boolean;
}) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn });
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  const byDate = new Map<string, ScheduleEvent[]>();
  for (const e of events) {
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }
  const labels = weekStartsOn === 1 ? WEEKDAYS_MON : WEEKDAYS_SUN;

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 text-center text-[11px] tracking-[0.16em] text-subtle">
        {labels.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const iso = format(d, "yyyy-MM-dd");
          const inMonth = isSameMonth(d, month);
          const list = byDate.get(iso) ?? [];
          const today = isToday(d);
          const isSel = selected === iso;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect?.(iso)}
              className={cn(
                "flex min-h-11 flex-col items-center rounded-md px-0.5 py-1.5 transition-[background-color,box-shadow] duration-150",
                compact ? "min-h-9 py-1" : "sm:min-h-16",
                !inMonth && "opacity-30",
                isSel ? "bg-ink text-paper" : today ? "bg-paper shadow-card" : "hover:bg-paper/80",
              )}
            >
              <span
                className={cn(
                  "font-display text-sm tabular leading-none",
                  compact && "text-xs",
                )}
              >
                {format(d, "d", { locale: zhCN })}
              </span>
              {list.length > 0 ? (
                <span className="mt-1.5 flex items-center justify-center gap-0.5">
                  {list.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className="size-1.5 rounded-full"
                      style={{ background: isSel ? "#FBF8F3" : e.color }}
                    />
                  ))}
                </span>
              ) : (
                <span className={cn("mt-1.5 size-1.5", compact && "hidden")} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
