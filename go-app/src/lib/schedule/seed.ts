import { addDays, addMinutes, setHours, setMinutes, startOfDay } from "date-fns";
import type { EventKind, ScheduleEvent } from "./types";

function at(day: Date, hour: number, minute: number): string {
  return setMinutes(setHours(startOfDay(day), hour), minute).toISOString();
}

function fromNow(now: Date, minuteOffset: number, durationMin: number): { start: string; end: string } {
  const startDate = addMinutes(now, minuteOffset);
  startDate.setSeconds(0, 0);
  startDate.setMinutes(Math.round(startDate.getMinutes() / 5) * 5);
  const endDate = addMinutes(startDate, durationMin);
  return { start: startDate.toISOString(), end: endDate.toISOString() };
}

function event(
  partial: Omit<ScheduleEvent, "createdAt" | "updatedAt" | "reminderFired" | "notes" | "location"> & {
    notes?: string;
    location?: string;
    reminderMinutes?: number | null;
  },
): ScheduleEvent {
  const now = new Date().toISOString();
  return {
    notes: "",
    location: "",
    reminderFired: false,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function makeSeed(now = new Date()): ScheduleEvent[] {
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const after = addDays(today, 2);
  const yesterday = addDays(today, -1);
  const minutesLeft = 24 * 60 - (now.getHours() * 60 + now.getMinutes());
  const current = fromNow(now, -40, 90);
  const later = minutesLeft > 130 ? fromNow(now, 80, 60) : null;
  const evening = minutesLeft > 220 ? fromNow(now, 160, 35) : null;
  const includeMorning = now.getHours() < 16;

  const items: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    kind: EventKind;
    reminderMinutes: number | null;
    location?: string;
    notes?: string;
    allDay?: boolean;
  }> = [
    {
      id: "seed-y-review",
      title: "昨日复盘",
      start: at(yesterday, 17, 0),
      end: at(yesterday, 17, 40),
      kind: "work",
      reminderMinutes: null,
    },
    ...(includeMorning
      ? [
          {
            id: "seed-morning",
            title: "晨间阅读",
            start: at(today, 8, 0),
            end: at(today, 8, 40),
            kind: "rest" as const,
            reminderMinutes: 10,
            notes: "不看消息，只读书。",
          },
        ]
      : []),
    {
      id: "seed-deep",
      title: "深度工作 · 设计系统",
      start: current.start,
      end: current.end,
      kind: "focus",
      reminderMinutes: 15,
      notes: "关掉通知，只做主界面。",
    },
    ...(later
      ? [
          {
            id: "seed-walk",
            title: "散步与晚餐",
            start: later.start,
            end: later.end,
            kind: "life" as const,
            reminderMinutes: 20,
          },
        ]
      : []),
    ...(evening
      ? [
          {
            id: "seed-journal",
            title: "晚间日记",
            start: evening.start,
            end: evening.end,
            kind: "rest" as const,
            reminderMinutes: 0,
          },
        ]
      : []),
    {
      id: "seed-dentist",
      title: "看牙",
      start: at(tomorrow, 10, 0),
      end: at(tomorrow, 11, 0),
      kind: "life",
      reminderMinutes: 60,
      location: "市口腔医院",
    },
    {
      id: "seed-design",
      title: "与李设计对稿",
      start: at(tomorrow, 15, 0),
      end: at(tomorrow, 16, 0),
      kind: "work",
      reminderMinutes: 15,
    },
    {
      id: "seed-workshop",
      title: "工作坊",
      start: at(after, 9, 30),
      end: at(after, 12, 0),
      kind: "focus",
      reminderMinutes: 30,
      location: "东馆 B1",
    },
    {
      id: "seed-weekend",
      title: "周末出游准备",
      start: at(after, 0, 0),
      end: at(after, 23, 59),
      kind: "life",
      reminderMinutes: null,
      allDay: true,
    },
  ];

  return items.map((item) =>
    event({
      id: item.id,
      title: item.title,
      start: item.start,
      end: item.end,
      kind: item.kind,
      reminderMinutes: item.reminderMinutes,
      location: item.location ?? "",
      notes: item.notes ?? "",
      allDay: item.allDay ?? false,
    }),
  );
}

