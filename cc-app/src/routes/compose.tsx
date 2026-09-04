import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Split, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ColorSwatches, TypePills } from "@/components/events/color-swatches";
import { EventEditor } from "@/components/events/event-editor";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/field";
import { useMounted, useNow } from "@/hooks/use-mounted";
import { parseScheduleAi } from "@/lib/schedule/ai";
import { colorForType } from "@/lib/schedule/colors";
import { friendlyDay, formatTimeLabel } from "@/lib/schedule/dates";
import { fallbackDraft, parseLocal } from "@/lib/schedule/parse-local";
import { useScheduleStore } from "@/lib/schedule/store";
import type { DraftEvent, EventType } from "@/lib/schedule/types";

export const Route = createFileRoute("/compose")({ component: ComposePage });

const EXAMPLES = [
  "今天有 3 个日程，分别是上午开会、下午健身、晚上读一小时书",
  "明天下午 3 点见客户，晚上 7 点和朋友吃饭",
  "周六去图书馆，周日上午整理房间",
];

function ComposePage() {
  const mounted = useMounted();
  const now = useNow();
  const navigate = useNavigate();
  const addDrafts = useScheduleStore((s) => s.addDrafts);
  const defaultReminder = useScheduleStore((s) => s.settings.defaultReminder);
  const [text, setText] = useState("");
  const [drafts, setDrafts] = useState<DraftEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [source, setSource] = useState<"ai" | "local" | null>(null);
  const [manual, setManual] = useState(false);

  async function split() {
    const raw = text.trim();
    if (!raw) return;
    const local = parseLocal(raw, now);
    try {
      const res = await parseScheduleAi({
        data: {
          text: raw,
          todayISO: format(now, "yyyy-MM-dd"),
          weekday: format(now, "EEEE", { locale: zhCN }),
        },
      });
      if (res.ok && res.events.length) {
        setDrafts(
          res.events.map((d) => ({
            ...d,
            reminderMinutes: d.allDay ? null : (d.reminderMinutes ?? defaultReminder),
          })),
        );
        setSource("ai");
        return;
      }
    } catch {
      /* fall through */
    }
    const fallback = local.length ? local : [fallbackDraft(raw, now)];
    setDrafts(
      fallback.map((d) => ({
        ...d,
        reminderMinutes: d.allDay ? null : (d.reminderMinutes ?? defaultReminder),
      })),
    );
    setSource("local");
    toast(local.length ? "已按语句拆分" : "智能拆分暂不可用，先记成一条");
  }

  async function onSplit() {
    setBusy(true);
    try {
      await split();
    } finally {
      setBusy(false);
    }
  }

  function commit() {
    if (!drafts.length) return;
    addDrafts(drafts);
    toast(`已加入 ${drafts.length} 件`);
    navigate({ to: "/today" });
  }

  function patch(i: number, next: Partial<DraftEvent>) {
    setDrafts((list) => list.map((d, idx) => (idx === i ? { ...d, ...next } : d)));
  }

  if (!mounted) return <div className="min-h-dvh bg-canvas" />;

  return (
    <PageShell
      title="添加"
      subtitle="说一句完整的话。逗号、顿号、「分别是」都会被拆开。"
    >
      <div className="rounded-xl bg-paper p-4 shadow-card sm:p-5">
        <Label htmlFor="nl">一句话</Label>
        <Textarea
          id="nl"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={EXAMPLES[0]}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.slice(1).map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setText(ex)}
              className="rounded-full bg-inset px-3 py-1.5 text-left text-xs text-muted transition-[color] duration-150 hover:text-ink"
            >
              {ex}
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onSplit} disabled={busy || !text.trim()}>
            <Split className="size-4" strokeWidth={1.75} />
            {busy ? "正在拆分…" : "智能拆分"}
          </Button>
        </div>
      </div>

      {source ? (
        <p className="mt-4 text-xs text-subtle">
          {source === "ai" ? "已按语义拆成下面这些，可再改。" : "按语句规则拆分，可再改。"}
        </p>
      ) : null}

      {drafts.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {drafts.map((d, i) => (
            <div key={`${d.title}-${i}`} className="rounded-xl bg-paper p-4 shadow-card">
              <div className="mb-3 flex items-start justify-between gap-2">
                <input
                  value={d.title}
                  onChange={(e) => patch(i, { title: e.target.value })}
                  className="min-w-0 flex-1 bg-transparent font-medium outline-none"
                />
                <button
                  type="button"
                  aria-label="去掉这条"
                  onClick={() => setDrafts((list) => list.filter((_, idx) => idx !== i))}
                  className="flex size-9 items-center justify-center rounded-full text-subtle hover:bg-inset hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted">
                <span>{friendlyDay(d.date, now)}</span>
                <span>·</span>
                <span>{formatTimeLabel(d.startTime, d.allDay)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={d.date}
                  onChange={(e) => patch(i, { date: e.target.value })}
                  className="h-10 rounded-md bg-inset px-2 text-sm outline-none"
                />
                <input
                  type="time"
                  value={d.startTime ?? ""}
                  disabled={d.allDay}
                  onChange={(e) =>
                    patch(i, {
                      startTime: e.target.value || null,
                      allDay: !e.target.value,
                    })
                  }
                  className="h-10 rounded-md bg-inset px-2 text-sm outline-none disabled:opacity-40"
                />
              </div>
              <label className="mt-2 inline-flex items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={d.allDay}
                  onChange={(e) =>
                    patch(i, {
                      allDay: e.target.checked,
                      startTime: e.target.checked ? null : d.startTime ?? "09:00",
                    })
                  }
                  className="accent-ink"
                />
                全天
              </label>
              <div className="mt-3">
                <TypePills
                  value={d.type}
                  onChange={(type: EventType) =>
                    patch(i, { type, color: colorForType(type) })
                  }
                />
              </div>
              <div className="mt-3">
                <ColorSwatches value={d.color} onChange={(hex) => patch(i, { color: hex })} />
              </div>
            </div>
          ))}
          <Button onClick={commit} size="lg" className="mt-1 w-full">
            全部加入 · {drafts.length}
          </Button>
        </div>
      ) : null}

      <div className="mt-10">
        <button
          type="button"
          onClick={() => setManual((v) => !v)}
          className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          {manual ? "收起单条添加" : "改成一条一条填"}
        </button>
        {manual ? (
          <div className="mt-4 rounded-xl bg-paper p-4 shadow-card">
            <EventEditor
              initial={{
                title: "",
                notes: "",
                date: format(now, "yyyy-MM-dd"),
                startTime: "09:00",
                endTime: null,
                allDay: false,
                type: "other",
                color: colorForType("other"),
                reminderMinutes: defaultReminder,
              }}
              submitLabel="加入"
              onSubmit={(d) => {
                addDrafts([d]);
                toast("已加入");
                navigate({ to: "/today" });
              }}
            />
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}
