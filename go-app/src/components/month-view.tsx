import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { useNow } from "@/hooks/use-now";
import { useSchedule } from "@/lib/schedule/store";
import { dateKey, eventsOnDay, formatRange, parseKey } from "@/lib/schedule/time";
import { parseISO } from "date-fns";
import { KindDot } from "./kind-chip";

export function MonthView() {
  const now = useNow(30_000);
  const navigate = useNavigate();
  const events = useSchedule((s) => s.events);
  const selectedDate = useSchedule((s) => s.selectedDate);
  const setSelectedDate = useSchedule((s) => s.setSelectedDate);
  const selectEvent = useSchedule((s) => s.selectEvent);
  const monthAnchor = startOfMonth(parseKey(selectedDate));

  const grid = eachDayOfInterval({
    start: startOfWeek(startOfMonth(monthAnchor), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(monthAnchor), { weekStartsOn: 1 }),
  });

  const selected = parseKey(selectedDate);
  const selectedEvents = eventsOnDay(events, selected);

  return (
    <div className="px-5 pb-8">
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          aria-label="上个月"
          className="flex size-11 items-center justify-center text-muted"
          onClick={() => setSelectedDate(dateKey(addMonths(monthAnchor, -1)))}
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="font-serif text-[28px] tracking-tight">
          {format(monthAnchor, "yyyy年M月", { locale: zhCN })}
        </h1>
        <button
          type="button"
          aria-label="下个月"
          className="flex size-11 items-center justify-center text-muted"
          onClick={() => setSelectedDate(dateKey(addMonths(monthAnchor, 1)))}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-7 text-center text-[11px] tracking-[0.18em] text-muted">
        {["一", "二", "三", "四", "五", "六", "日"].map((label) => (
          <div key={label} className="py-2">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {grid.map((day) => {
          const key = dateKey(day);
          const inMonth = isSameMonth(day, monthAnchor);
          const isToday = isSameDay(day, now);
          const isSelected = key === selectedDate;
          const has = eventsOnDay(events, day).length > 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDate(key)}
              className="flex min-h-11 flex-col items-center justify-center gap-1"
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full font-serif text-lg tabular-nums transition-[background-color,color] duration-150",
                  !inMonth && "text-faint",
                  isSelected && "bg-ink text-sheet",
                  isToday && !isSelected && "shadow-[inset_0_0_0_1px_var(--color-accent)]",
                )}
              >
                {day.getDate()}
              </span>
              <span className={cn("size-1 rounded-full", has ? "bg-accent" : "bg-transparent")} />
            </button>
          );
        })}
      </div>

      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <p className="font-serif text-xl">{format(selected, "M月d日", { locale: zhCN })}</p>
          <button
            type="button"
            className="text-sm text-accent"
            onClick={() => navigate({ to: "/" })}
          >
            去这一天
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {selectedEvents.length === 0 ? (
            <li className="py-6 text-sm text-muted">这一天还是空白。</li>
          ) : (
            selectedEvents.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => selectEvent(event.id)}
                  className="flex w-full items-start gap-3 rounded-lg bg-paper px-3.5 py-3 text-left shadow-card"
                >
                  <KindDot kind={event.kind} className="mt-1.5" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{event.title}</span>
                    <span className="text-xs tabular-nums text-muted">
                      {formatRange(parseISO(event.start), parseISO(event.end), event.allDay)}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
