import { useEffect } from "react";
import { parseISO } from "date-fns";
import { cn } from "@/lib/cn";
import { layoutEvents } from "@/lib/schedule/layout";
import {
  eventMetrics,
  formatClock,
  formatRange,
  HOUR_PX,
  minutesFromStart,
  timedEvents,
} from "@/lib/schedule/time";
import type { ScheduleEvent } from "@/lib/schedule/types";
import { KIND_LABEL } from "@/lib/schedule/types";
import { KindDot } from "./kind-chip";

export function Ribbon({
  events,
  startHour,
  endHour,
  now,
  showNow,
  onSelect,
}: {
  events: ScheduleEvent[];
  startHour: number;
  endHour: number;
  now: Date;
  showNow: boolean;
  onSelect: (id: string) => void;
}) {
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const height = hours.length * HOUR_PX;
  const laid = layoutEvents(timedEvents(events));
  const nowTop = (minutesFromStart(now, startHour) / 60) * HOUR_PX;
  const nowVisible = showNow && nowTop >= 0 && nowTop <= height;

  useEffect(() => {
    if (!nowVisible) return;
    const marker = document.getElementById("now-marker");
    if (!marker) return;
    marker.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [nowVisible, startHour, endHour]);

  return (
    <div className="relative">
      <div className="relative manuscript-rule" style={{ height }}>
        {hours.map((hour, index) => (
          <div
            key={hour}
            className="absolute right-0 left-0"
            style={{ top: index * HOUR_PX, height: HOUR_PX }}
          >
            <span className="absolute top-0 left-0 w-10 -translate-y-1/2 font-serif text-xs tabular-nums text-faint">
              {String(hour).padStart(2, "0")}
            </span>
          </div>
        ))}

        {laid.map((event) => {
          const { top, height: blockH } = eventMetrics(event, startHour);
          const width = `calc((100% - 52px) / ${event.colCount})`;
          const left = `calc(52px + ((100% - 52px) / ${event.colCount}) * ${event.col})`;
          const compact = blockH < 56;
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelect(event.id)}
              className="absolute rounded-md bg-sheet px-3 py-2 text-left shadow-card transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.99]"
              style={{
                top,
                height: blockH,
                width,
                left,
                paddingRight: event.colCount > 1 ? 10 : 12,
              }}
            >
              <span className="absolute top-2 bottom-2 left-1.5 w-px bg-accent/80" />
              <span className="flex items-start gap-2 pl-1">
                <span className="min-w-0">
                  <span className={cn("block truncate", compact ? "text-sm font-medium" : "font-serif text-[15px]")}>
                    {event.title}
                  </span>
                  {!compact ? (
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                      <KindDot kind={event.kind} />
                      <span className="tabular-nums">
                        {formatRange(parseISO(event.start), parseISO(event.end), false)}
                      </span>
                      <span className="text-faint">{KIND_LABEL[event.kind]}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] tabular-nums text-muted">
                      {formatClock(parseISO(event.start))}
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}

        {nowVisible ? (
          <div
            id="now-marker"
            className="pointer-events-none absolute right-0 left-0 z-10"
            style={{ top: nowTop }}
          >
            <div className="flex items-center">
              <span className="now-dot relative z-10 ml-[38px] size-2 rounded-full bg-accent" />
              <span className="h-px flex-1 bg-accent" />
              <span className="pl-2 font-serif text-[11px] tracking-wide text-accent">此刻</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
