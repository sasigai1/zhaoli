import { useEffect, useState } from "react";
import { parseISO } from "date-fns";
import { MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSchedule } from "@/lib/schedule/store";
import {
  formatDayTitle,
  formatRange,
  reminderLabel,
  toLocalDateTimeValue,
} from "@/lib/schedule/time";
import { EVENT_KINDS, REMINDER_OPTIONS, type EventKind } from "@/lib/schedule/types";
import { KindChip } from "./kind-chip";
import { BottomSheet } from "./sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/cn";

export function EventDetail({
  eventId,
  onClose,
}: {
  eventId: string | null;
  onClose: () => void;
}) {
  const event = useSchedule((s) => s.events.find((item) => item.id === eventId));
  const updateEvent = useSchedule((s) => s.updateEvent);
  const removeEvent = useSchedule((s) => s.removeEvent);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [kind, setKind] = useState<EventKind>("work");
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(15);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!event) {
      setEditing(false);
      return;
    }
    const s = toLocalDateTimeValue(event.start);
    const e = toLocalDateTimeValue(event.end);
    setTitle(event.title);
    setDate(s.date);
    setStart(s.time);
    setEnd(e.time);
    setKind(event.kind);
    setReminderMinutes(event.reminderMinutes);
    setLocation(event.location);
    setNotes(event.notes);
    setEditing(false);
  }, [event]);

  const save = () => {
    if (!event || !title.trim()) return;
    updateEvent(event.id, {
      title: title.trim(),
      start: event.allDay
        ? new Date(`${date}T00:00:00`).toISOString()
        : new Date(`${date}T${start}:00`).toISOString(),
      end: event.allDay
        ? new Date(`${date}T23:59:00`).toISOString()
        : new Date(`${date}T${end}:00`).toISOString(),
      kind,
      reminderMinutes,
      reminderFired: false,
      location: location.trim(),
      notes: notes.trim(),
    });
    toast("已改写");
    setEditing(false);
  };

  return (
    <BottomSheet open={Boolean(event)} onOpenChange={(open) => !open && onClose()} title="日程">
      {event ? (
        <div className="pt-2">
          {editing ? (
            <div className="space-y-4">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              {!event.allDay ? (
                <div className="grid grid-cols-2 gap-3">
                  <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
                  <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {EVENT_KINDS.map((item) => (
                  <KindChip key={item} kind={item} active={kind === item} onClick={() => setKind(item)} />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {REMINDER_OPTIONS.map((option) => (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => setReminderMinutes(option.value)}
                    className={cn(
                      "h-9 rounded-full px-3 text-sm",
                      reminderMinutes === option.value ? "bg-ink text-sheet" : "bg-paper text-muted",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="地点"
              />
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="备注" />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={save}>
                  保存
                </Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm tracking-[0.18em] text-muted">{formatDayTitle(parseISO(event.start))}</p>
              <h2 className="mt-2 font-serif text-[32px] leading-tight tracking-tight">{event.title}</h2>
              <p className="mt-3 tabular-nums text-muted">
                {formatRange(parseISO(event.start), parseISO(event.end), event.allDay)}
              </p>
              <p className="mt-1 text-sm text-muted">{reminderLabel(event.reminderMinutes)}</p>
              {event.location ? (
                <p className="mt-3 flex items-center gap-1.5 text-sm">
                  <MapPin className="size-3.5 text-muted" />
                  {event.location}
                </p>
              ) : null}
              {event.notes ? <p className="mt-3 text-sm leading-relaxed text-muted">{event.notes}</p> : null}
              <div className="mt-6 flex gap-2">
                <Button className="flex-1" onClick={() => setEditing(true)}>
                  改写
                </Button>
                <Button
                  variant="outline"
                  className="px-3"
                  aria-label="删除"
                  onClick={() => {
                    removeEvent(event.id);
                    toast("已从纸上抹去");
                    onClose();
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </BottomSheet>
  );
}
