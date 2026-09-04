import { Check, Clock, Trash2 } from "lucide-react";
import { friendlyDay, formatTimeLabel } from "@/lib/schedule/dates";
import { TYPE_META } from "@/lib/schedule/colors";
import type { ScheduleEvent } from "@/lib/schedule/types";
import { cn } from "@/lib/utils";

export function EventCard({
  event,
  onToggle,
  onOpen,
  onDelete,
  showDate,
}: {
  event: ScheduleEvent;
  onToggle?: () => void;
  onOpen?: () => void;
  onDelete?: () => void;
  showDate?: boolean;
}) {
  return (
    <article
      className={cn(
        "group flex items-stretch gap-0 overflow-hidden rounded-lg bg-paper shadow-card transition-[box-shadow] duration-150",
        event.completed && "opacity-60",
      )}
    >
      <div className="w-1.5 shrink-0" style={{ background: event.color }} aria-hidden="true" />
      <div className="flex min-w-0 flex-1 items-start gap-3 px-3.5 py-3">
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label={event.completed ? "标为未完成" : "标为完成"}
            className={cn(
              "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color] duration-150",
              event.completed
                ? "border-ink bg-ink text-paper"
                : "border-line bg-transparent text-transparent hover:border-ink/40",
            )}
          >
            <Check className="size-3.5" strokeWidth={2.4} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 text-left"
        >
          <p
            className={cn(
              "truncate text-[15px] font-medium tracking-wide",
              event.completed && "line-through",
            )}
          >
            {event.title}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" strokeWidth={1.75} />
              {showDate ? `${friendlyDay(event.date)} · ` : ""}
              {formatTimeLabel(event.startTime, event.allDay)}
              {event.endTime && !event.allDay ? `–${event.endTime}` : ""}
            </span>
            <span className="text-subtle">{TYPE_META[event.type].label}</span>
          </p>
          {event.notes ? (
            <p className="mt-1 truncate text-xs text-subtle">{event.notes}</p>
          ) : null}
        </button>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            aria-label="删除"
            className="mt-0.5 size-9 shrink-0 rounded-full text-subtle opacity-0 transition-[opacity,background-color,color] duration-150 hover:bg-inset hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Trash2 className="mx-auto size-4" strokeWidth={1.75} />
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function EmptyDay({ label = "没有安排。日子留白也好。" }: { label?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-5 py-10 text-center">
      <p className="font-display text-lg text-ink">{label}</p>
      <p className="mt-2 text-sm text-subtle">点圆盘上的「添加」，用一句话记下几件事。</p>
    </div>
  );
}
