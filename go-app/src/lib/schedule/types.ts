export const EVENT_KINDS = ["work", "life", "focus", "rest"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export const KIND_LABEL: Record<EventKind, string> = {
  work: "工作",
  life: "生活",
  focus: "专注",
  rest: "留白",
};

export const REMINDER_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "不提醒" },
  { value: 0, label: "准时" },
  { value: 5, label: "提前 5 分" },
  { value: 15, label: "提前 15 分" },
  { value: 30, label: "提前 30 分" },
  { value: 60, label: "提前 1 时" },
];

export type ScheduleEvent = {
  id: string;
  title: string;
  notes: string;
  location: string;
  start: string;
  end: string;
  allDay: boolean;
  kind: EventKind;
  reminderMinutes: number | null;
  reminderFired: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DayBrief = {
  date: string;
  headline: string;
  body: string;
  energy: "light" | "steady" | "full";
  fingerprint: string;
  createdAt: string;
};

export type Settings = {
  defaultReminder: number | null;
  notifyEnabled: boolean;
};

export type DayEnergy = DayBrief["energy"];
