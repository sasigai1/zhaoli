import { createFileRoute } from "@tanstack/react-router";
import { addYears, format, setMonth } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { MonthGrid } from "@/components/calendar/month-grid";
import { EmptyDay, EventCard } from "@/components/events/event-card";
import { blankDraft, eventToDraft, EventDialog } from "@/components/events/event-dialog";
import { PageShell } from "@/components/layout/page-shell";
import { useMounted, useNow } from "@/hooks/use-mounted";
import { sortEvents, useScheduleStore } from "@/lib/schedule/store";
import type { ScheduleEvent } from "@/lib/schedule/types";

export const Route = createFileRoute("/calendar")({ component: CalendarPage });

function CalendarPage() {
  const mounted = useMounted();
  const now = useNow();
  const events = useScheduleStore((s) => s.events);
  const weekStartsOn = useScheduleStore((s) => s.settings.weekStartsOn);
  const toggleComplete = useScheduleStore((s) => s.toggleComplete);
  const updateEvent = useScheduleStore((s) => s.updateEvent);
  const deleteEvent = useScheduleStore((s) => s.deleteEvent);
  const addDrafts = useScheduleStore((s) => s.addDrafts);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [openMonth, setOpenMonth] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<ScheduleEvent | null>(null);
  const [creating, setCreating] = useState(false);

  const yearEvents = useMemo(
    () => events.filter((e) => e.date.startsWith(String(year))),
    [events, year],
  );
  const dayEvents = useMemo(
    () => (selected ? sortEvents(events.filter((e) => e.date === selected)) : []),
    [events, selected],
  );

  if (!mounted) return <div className="min-h-dvh bg-canvas" />;

  const yearDate = new Date(year, 0, 1);

  return (
    <PageShell title="日历" subtitle="任意一年。点开某个月，再点某一天。" wide>
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full hover:bg-inset"
          onClick={() => {
            setYear((y) => y - 1);
            setOpenMonth(null);
            setSelected(null);
          }}
          aria-label="上一年"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="font-display text-2xl tabular tracking-wide">{year}</h2>
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full hover:bg-inset"
          onClick={() => {
            setYear((y) => addYears(yearDate, 1).getFullYear());
            setOpenMonth(null);
            setSelected(null);
          }}
          aria-label="下一年"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 12 }, (_, m) => {
          const monthDate = setMonth(yearDate, m);
          const count = yearEvents.filter((e) => e.date.slice(5, 7) === String(m + 1).padStart(2, "0")).length;
          const active = openMonth === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => {
                setOpenMonth(m);
                setSelected(null);
              }}
              className={`rounded-lg px-3 py-4 text-left shadow-card transition-[background-color,box-shadow] duration-150 ${
                active ? "bg-ink text-paper" : "bg-paper hover:shadow-lift"
              }`}
            >
              <p className="font-display text-lg">{format(monthDate, "M月", { locale: zhCN })}</p>
              <p className={`mt-1 text-xs ${active ? "text-paper/70" : "text-subtle"}`}>
                {count ? `${count} 件` : "空"}
              </p>
            </button>
          );
        })}
      </div>

      {openMonth !== null ? (
        <div className="mt-8 rounded-xl bg-paper p-3 shadow-card sm:p-5">
          <p className="mb-3 font-display text-lg">
            {format(setMonth(yearDate, openMonth), "yyyy年 M月", { locale: zhCN })}
          </p>
          <MonthGrid
            month={setMonth(yearDate, openMonth)}
            events={events}
            selected={selected ?? undefined}
            weekStartsOn={weekStartsOn}
            compact
            onSelect={(iso) => setSelected(iso)}
          />
        </div>
      ) : null}

      {selected ? (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-lg">
              {format(new Date(`${selected}T12:00:00`), "M月d日 EEE", { locale: zhCN })}
            </p>
            <button
              type="button"
              className="text-sm text-muted underline-offset-4 hover:underline"
              onClick={() => setCreating(true)}
            >
              添加
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {dayEvents.length === 0 ? (
              <EmptyDay label="这一天是空的。" />
            ) : (
              dayEvents.map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  onToggle={() => toggleComplete(e.id)}
                  onOpen={() => setEditing(e)}
                  onDelete={() => deleteEvent(e.id)}
                />
              ))
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-8 text-center">
        <button
          type="button"
          className="text-xs text-subtle underline-offset-4 hover:text-ink hover:underline"
          onClick={() => {
            setYear(now.getFullYear());
            setOpenMonth(now.getMonth());
            setSelected(format(now, "yyyy-MM-dd"));
          }}
        >
          跳到今天
        </button>
      </div>

      <EventDialog
        open={creating}
        onOpenChange={setCreating}
        title="新的一件"
        initial={blankDraft(selected ?? format(now, "yyyy-MM-dd"))}
        submitLabel="加入"
        onSubmit={(d) => addDrafts([d])}
      />
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
