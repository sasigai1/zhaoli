import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { EventEditor } from "@/components/events/event-editor";
import type { DraftEvent, ScheduleEvent } from "@/lib/schedule/types";
import { colorForType } from "@/lib/schedule/colors";
import { todayISO } from "@/lib/schedule/dates";

export function blankDraft(date = todayISO()): DraftEvent {
  return {
    title: "",
    notes: "",
    date,
    startTime: "09:00",
    endTime: null,
    allDay: false,
    type: "other",
    color: colorForType("other"),
    reminderMinutes: 15,
  };
}

export function eventToDraft(e: ScheduleEvent): DraftEvent {
  return {
    title: e.title,
    notes: e.notes,
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime,
    allDay: e.allDay,
    type: e.type,
    color: e.color,
    reminderMinutes: e.reminderMinutes,
  };
}

export function EventDialog({
  open,
  onOpenChange,
  title,
  initial,
  submitLabel,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  initial: DraftEvent;
  submitLabel: string;
  onSubmit: (draft: DraftEvent) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/20 data-[state=open]:animate-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[88dvh] w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-canvas p-5 shadow-lift outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="font-display text-lg">{title}</Dialog.Title>
            <Dialog.Close className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-inset hover:text-ink">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <EventEditor
            initial={initial}
            submitLabel={submitLabel}
            onSubmit={(d) => {
              onSubmit(d);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
