export const EVENT_TYPES = [
  "work",
  "personal",
  "health",
  "study",
  "social",
  "focus",
  "rest",
  "other",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export type ReminderMinutes = 0 | 5 | 10 | 15 | 30 | 60 | 120 | 1440;

export interface ScheduleEvent {
  id: string;
  title: string;
  notes: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  allDay: boolean;
  type: EventType;
  color: string;
  reminderMinutes: ReminderMinutes | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DraftEvent {
  title: string;
  notes: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  allDay: boolean;
  type: EventType;
  color: string;
  reminderMinutes: ReminderMinutes | null;
}

export interface Settings {
  notifications: boolean;
  sound: boolean;
  defaultReminder: ReminderMinutes | null;
  weekStartsOn: 0 | 1;
}

export const DEFAULT_SETTINGS: Settings = {
  notifications: false,
  sound: true,
  defaultReminder: 15,
  weekStartsOn: 1,
};

export interface BackupFile {
  version: 1;
  exportedAt: string;
  events: ScheduleEvent[];
  settings: Settings;
}
