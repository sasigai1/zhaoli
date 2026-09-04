import { createFileRoute } from "@tanstack/react-router";
import { addDays, format, isToday } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useMemo, useState } from "react";
import { EventCard } from "@/components/events/event-card";
import { blankDraft, eventToDraft, EventDialog } from "@/components/events/event-dialog";
import { PageShell } from "@/components/layout/page-shell";
import { useMounted, useNow } from "@/hooks/use-mounted";
import { sortEvents, useScheduleStore } from "@/lib/schedule/store";
import type { ScheduleEvent } from "@/lib/schedule/types";

export const Route = createFileRoute("/timeline")({ component: TimelinePage });

function TimelinePage() {
  const mounted = useMounted();
  const now = useNow();
  const events = useScheduleStore((s) => s.events);
  const toggleComplete = useScheduleStore((s) => s.toggleComplete);
  const updateEvent = useScheduleStore((s) => s.updateEvent);
  const deleteEvent = useScheduleStore((s) => s.deleteEvent);
  const [editing, setEditing] = useState<ScheduleEvent | null>(null);
  const [range, setRange] = useState<"near" | "all">("near");

  const days = useMemo(() => {
    if (range === "all") {
      const dates = [...new Set(events.map((e) => e.date))].sort();
      if (dates.length === 0) {
        return Array.from({ length: 14 }, (_, i) => format(addDays(now, i - 3), "yyyy-MM-dd"));
      }
      return dates;
    }
    return Array.from({ length: 21 }, (_, i) => format(addDays(now, i - 3), "yyyy-MM-dd"));
  }, [events, now, range]);

  const grouped = useMemo(() => {
    return days.map((iso) => ({
      iso,
      items: sortEvents(events.filter((e) => e.date === iso)),
    }));
  }, [days, events]);

  if (!mounted) return <div className="min-h-dvh bg-canvas" />;

  return (
    <PageShell
      title="时间线"
      subtitle="日子排成一条线。过去三天，往后看三周。"
      action={
        <button
          type="button"
          onClick={() => setRange((r) => (r === "near" ? "all" : "near"))}
          className="px-2 text-xs tracking-wide text-muted hover:text-ink"
        >
          {range === "near" ? "全部" : "近段"}
        </button>
      }
    >
      <ol className="relative border-l border-line pl-6">
        {grouped.map(({ iso, items }) => {
          const d = new Date(`${iso}T12:00:00`);
          const today = isToday(d);
          return (
            <li key={iso} className="relative mb-8 last:mb-0">
              <span
                className={`absolute top-1.5 -left-[31px] size-2.5 rounded-full ${
                  today ? "bg-ink" : items.length ? "bg-bronze" : "bg-line"
                }`}
              />
              <p className={`font-display text-sm ${today ? "text-ink" : "text-muted"}`}>
                {format(d, "M月d日 EEE", { locale: zhCN })}
                {today ? " · 今天" : ""}
              </p>
              {items.length === 0 ? null : (
                <div className="mt-3 flex flex-col gap-2">
                  {items.map((e) => (
                    <EventCard
                      key={e.id}
                      event={e}
                      onToggle={() => toggleComplete(e.id)}
                      onOpen={() => setEditing(e)}
                      onDelete={() => deleteEvent(e.id)}
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <EventDialog
        open={Boolean(editing)}
        onOpenChange={(v) => !v && setEditing(null)}
        title="编辑"
        initial={editing ? eventToDraft(editing) : blankDraft()}
        submitLabel="保存"
        onSubmit={(d) => editing && updateEvent(editing.id, d)}
      />
    </PageShell>
  );
}
