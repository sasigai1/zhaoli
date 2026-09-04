import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyDay, EventCard } from "@/components/events/event-card";
import { blankDraft, eventToDraft, EventDialog } from "@/components/events/event-dialog";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { useMounted, useNow } from "@/hooks/use-mounted";
import { briefTodayAi } from "@/lib/schedule/ai";
import { sortEvents, useScheduleStore } from "@/lib/schedule/store";
import type { DraftEvent, ScheduleEvent } from "@/lib/schedule/types";

export const Route = createFileRoute("/today")({ component: TodayPage });

function TodayPage() {
  const mounted = useMounted();
  const now = useNow();
  const today = format(now, "yyyy-MM-dd");
  const events = useScheduleStore((s) => s.events);
  const toggleComplete = useScheduleStore((s) => s.toggleComplete);
  const updateEvent = useScheduleStore((s) => s.updateEvent);
  const deleteEvent = useScheduleStore((s) => s.deleteEvent);
  const addDrafts = useScheduleStore((s) => s.addDrafts);
  const list = useMemo(
    () => sortEvents(events.filter((e) => e.date === today)),
    [events, today],
  );
  const [editing, setEditing] = useState<ScheduleEvent | null>(null);
  const [creating, setCreating] = useState(false);
  const [brief, setBrief] = useState<string | null>(null);
  const [briefing, setBriefing] = useState(false);

  async function requestBrief() {
    setBriefing(true);
    try {
      const res = await briefTodayAi({
        data: {
          todayISO: today,
          events: list.map((e) => ({
            title: e.title,
            startTime: e.startTime,
            allDay: e.allDay,
            type: e.type,
          })),
        },
      });
      if (res.ok) setBrief(res.text);
      else toast("简报暂时不可用");
    } catch {
      toast("简报暂时不可用");
    } finally {
      setBriefing(false);
    }
  }

  if (!mounted) return <div className="min-h-dvh bg-canvas" />;

  return (
    <PageShell
      title="今日"
      subtitle={format(now, "yyyy年 M月d日 EEEE", { locale: zhCN })}
      action={
        <Button
          variant="ghost"
          size="icon"
          aria-label="添加"
          onClick={() => setCreating(true)}
        >
          <Plus className="size-5" strokeWidth={1.7} />
        </Button>
      }
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {list.length} 件 · 完成 {list.filter((e) => e.completed).length}
        </p>
        <button
          type="button"
          onClick={requestBrief}
          disabled={briefing}
          className="text-xs tracking-wide text-subtle underline-offset-4 hover:text-ink hover:underline disabled:opacity-40"
        >
          {briefing ? "在写…" : "今日简报"}
        </button>
      </div>

      {brief ? (
        <p className="mb-6 rounded-lg bg-paper px-4 py-3 text-sm leading-relaxed text-ink shadow-card">
          {brief}
        </p>
      ) : null}

      {list.length === 0 ? (
        <EmptyDay />
      ) : (
        <div className="stagger-in flex flex-col gap-2.5">
          {list.map((e) => (
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
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to="/compose" className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
          用一句话添加多件
        </Link>
      </div>

      <EventDialog
        open={creating}
        onOpenChange={setCreating}
        title="新的一件"
        initial={blankDraft(today)}
        submitLabel="加入"
        onSubmit={(d: DraftEvent) => {
          addDrafts([d]);
          toast("已加入今日");
        }}
      />
      <EventDialog
        open={Boolean(editing)}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
        }}
        title="编辑"
        initial={editing ? eventToDraft(editing) : blankDraft(today)}
        submitLabel="保存"
        onSubmit={(d) => {
          if (!editing) return;
          updateEvent(editing.id, d);
        }}
      />
    </PageShell>
  );
}
