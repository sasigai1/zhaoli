import { createFileRoute } from "@tanstack/react-router";
import { addMonths, format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MonthGrid } from "@/components/calendar/month-grid";
import { EmptyDay, EventCard } from "@/components/events/event-card";
import { blankDraft, eventToDraft, EventDialog } from "@/components/events/event-dialog";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { useMounted, useNow } from "@/hooks/use-mounted";
import { sortEvents, useScheduleStore } from "@/lib/schedule/store";
import type { DraftEvent, ScheduleEvent } from "@/lib/schedule/types";

export const Route = createFileRoute("/month")({ component: MonthPage });

function MonthPage() {
  const mounted = useMounted();
  const now = useNow();
  const events = useScheduleStore((s) => s.events);
  const weekStartsOn = useScheduleStore((s) => s.settings.weekStartsOn);
  const toggleComplete = useScheduleStore((s) => s.toggleComplete);
  const updateEvent = useScheduleStore((s) => s.updateEvent);
  const deleteEvent = useScheduleStore((s) => s.deleteEvent);
  const addDrafts = useScheduleStore((s) => s.addDrafts);
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [editing, setEditing] = useState<ScheduleEvent | null>(null);
  const [creating, setCreating] = useState(false);

  const dayEvents = useMemo(
    () => sortEvents(events.filter((e) => e.date === selected)),
    [events, selected],
  );

  if (!mounted) return <div className="min-h-dvh bg-canvas" />;

  return (
    <PageShell title="月历" subtitle="点一天，看这一天。" wide>
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full hover:bg-inset"
          onClick={() => setCursor((d) => addMonths(d, -1))}
          aria-label="上个月"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="font-display text-xl tracking-wide">
          {format(cursor, "yyyy年 M月", { locale: zhCN })}
        </h2>
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full hover:bg-inset"
          onClick={() => setCursor((d) => addMonths(d, 1))}
          aria-label="下个月"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="rounded-xl bg-paper p-3 shadow-card sm:p-5">
        <MonthGrid
          month={cursor}
          events={events}
          selected={selected}
          weekStartsOn={weekStartsOn}
          onSelect={(iso) => {
            setSelected(iso);
            setCursor(new Date(`${iso}T12:00:00`));
          }}
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="font-display text-lg">
          {format(new Date(`${selected}T12:00:00`), "M月d日 EEE", { locale: zhCN })}
        </p>
        <Button variant="ghost" size="icon" aria-label="添加" onClick={() => setCreating(true)}>
          <Plus className="size-5" />
        </Button>
      </div>
      <div className="mt-3 flex flex-col gap-2.5">
        {dayEvents.length === 0 ? (
          <EmptyDay label="这一天是空的。" />
        ) : (
          dayEvents.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              onToggle={() => toggleComplete(e.id)}
              onOpen={() => setEditing(e)}
              onDelete={() => {
                deleteEvent(e.id);
                toast("已删除");
              }}
            />
          ))
        )}
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          className="text-xs text-subtle underline-offset-4 hover:text-ink hover:underline"
          onClick={() => {
            setCursor(now);
            setSelected(format(now, "yyyy-MM-dd"));
          }}
        >
          回到本月
        </button>
      </div>

      <EventDialog
        open={creating}
        onOpenChange={setCreating}
        title="新的一件"
        initial={blankDraft(selected)}
        submitLabel="加入"
        onSubmit={(d: DraftEvent) => addDrafts([d])}
      />
      <EventDialog
        open={Boolean(editing)}
        onOpenChange={(v) => !v && setEditing(null)}
        title="编辑"
        initial={editing ? eventToDraft(editing) : blankDraft(selected)}
        submitLabel="保存"
        onSubmit={(d) => editing && updateEvent(editing.id, d)}
      />
    </PageShell>
  );
}
