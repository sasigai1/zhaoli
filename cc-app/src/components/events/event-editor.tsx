import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/field";
import { ColorSwatches, TypePills } from "@/components/events/color-swatches";
import { colorForType } from "@/lib/schedule/colors";
import { minutesToLabel } from "@/lib/schedule/dates";
import type { DraftEvent, EventType, ReminderMinutes } from "@/lib/schedule/types";

const REMINDERS: Array<ReminderMinutes | null> = [null, 0, 5, 10, 15, 30, 60, 120, 1440];

export function EventEditor({
  initial,
  submitLabel = "保存",
  onSubmit,
  onCancel,
}: {
  initial: DraftEvent;
  submitLabel?: string;
  onSubmit: (draft: DraftEvent) => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState<DraftEvent>(initial);

  useEffect(() => {
    setDraft(initial);
  }, [initial]);

  function setType(type: EventType) {
    setDraft((d) => ({
      ...d,
      type,
      color: d.color === colorForType(d.type) ? colorForType(type) : d.color,
    }));
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!draft.title.trim()) return;
        onSubmit({
          ...draft,
          title: draft.title.trim(),
          allDay: draft.allDay || !draft.startTime,
          startTime: draft.allDay ? null : draft.startTime,
          endTime: draft.allDay ? null : draft.endTime,
        });
      }}
    >
      <div>
        <Label htmlFor="title">标题</Label>
        <Input
          id="title"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="一件具体的事"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="date">日期</Label>
          <Input
            id="date"
            type="date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            required
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="inline-flex h-11 items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={draft.allDay}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  allDay: e.target.checked,
                  startTime: e.target.checked ? null : draft.startTime ?? "09:00",
                })
              }
              className="size-4 accent-ink"
            />
            全天
          </label>
        </div>
        {!draft.allDay ? (
          <>
            <div>
              <Label htmlFor="start">开始</Label>
              <Input
                id="start"
                type="time"
                value={draft.startTime ?? ""}
                onChange={(e) => setDraft({ ...draft, startTime: e.target.value || null })}
              />
            </div>
            <div>
              <Label htmlFor="end">结束</Label>
              <Input
                id="end"
                type="time"
                value={draft.endTime ?? ""}
                onChange={(e) => setDraft({ ...draft, endTime: e.target.value || null })}
              />
            </div>
          </>
        ) : null}
      </div>

      <div>
        <Label>类型</Label>
        <TypePills value={draft.type} onChange={setType} />
      </div>

      <div>
        <Label>色卡</Label>
        <ColorSwatches
          value={draft.color}
          onChange={(hex) => setDraft({ ...draft, color: hex })}
        />
      </div>

      <div>
        <Label htmlFor="remind">提醒</Label>
        <NativeSelect
          id="remind"
          value={draft.reminderMinutes === null ? "off" : String(draft.reminderMinutes)}
          onChange={(e) => {
            const v = e.target.value;
            setDraft({
              ...draft,
              reminderMinutes: v === "off" ? null : (Number(v) as ReminderMinutes),
            });
          }}
        >
          {REMINDERS.map((r) => (
            <option key={String(r)} value={r === null ? "off" : r}>
              {r === null ? "不提醒" : minutesToLabel(r)}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div>
        <Label htmlFor="notes">备注</Label>
        <Textarea
          id="notes"
          className="min-h-24 text-sm"
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          placeholder="可选"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            取消
          </Button>
        ) : null}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
