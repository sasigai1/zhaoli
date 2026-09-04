import { addDays, format } from "date-fns";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/utils";
import { colorForType } from "./colors";
import { todayISO } from "./dates";
import type { DraftEvent, ScheduleEvent, Settings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

function stamp(partial: DraftEvent, now = new Date()): ScheduleEvent {
  const ts = now.toISOString();
  return {
    id: uid(),
    title: partial.title.trim(),
    notes: partial.notes ?? "",
    date: partial.date,
    startTime: partial.allDay ? null : partial.startTime,
    endTime: partial.allDay ? null : partial.endTime,
    allDay: partial.allDay || !partial.startTime,
    type: partial.type,
    color: partial.color || colorForType(partial.type),
    reminderMinutes: partial.reminderMinutes,
    completed: false,
    createdAt: ts,
    updatedAt: ts,
  };
}

function seedEvents(now = new Date()): ScheduleEvent[] {
  const d0 = todayISO(now);
  const d1 = format(addDays(now, 1), "yyyy-MM-dd");
  const d2 = format(addDays(now, 2), "yyyy-MM-dd");
  const d3 = format(addDays(now, 3), "yyyy-MM-dd");
  const sat = format(addDays(now, (6 - now.getDay() + 7) % 7 || 7), "yyyy-MM-dd");

  const rows: DraftEvent[] = [
    {
      title: "晨间散步",
      notes: "绕小区两圈，不带耳机。",
      date: d0,
      startTime: "07:40",
      endTime: "08:10",
      allDay: false,
      type: "health",
      color: colorForType("health"),
      reminderMinutes: 10,
    },
    {
      title: "把想法写成三件事",
      notes: "只写标题，不展开。",
      date: d0,
      startTime: "10:00",
      endTime: "11:00",
      allDay: false,
      type: "focus",
      color: colorForType("focus"),
      reminderMinutes: 15,
    },
    {
      title: "与同事同步进度",
      notes: "",
      date: d0,
      startTime: "15:00",
      endTime: "15:40",
      allDay: false,
      type: "work",
      color: colorForType("work"),
      reminderMinutes: 15,
    },
    {
      title: "夜读四十五分钟",
      notes: "纸书，屏幕之外。",
      date: d0,
      startTime: "21:00",
      endTime: "21:45",
      allDay: false,
      type: "rest",
      color: colorForType("rest"),
      reminderMinutes: 5,
    },
    {
      title: "图书馆半日",
      notes: "",
      date: d1,
      startTime: "09:30",
      endTime: "12:00",
      allDay: false,
      type: "study",
      color: colorForType("study"),
      reminderMinutes: 30,
    },
    {
      title: "牙医复查",
      notes: "带上上次的片子。",
      date: d2,
      startTime: "14:20",
      endTime: "15:00",
      allDay: false,
      type: "health",
      color: colorForType("health"),
      reminderMinutes: 60,
    },
    {
      title: "朋友晚饭",
      notes: "老地方。",
      date: d3,
      startTime: "19:00",
      endTime: "21:00",
      allDay: false,
      type: "social",
      color: colorForType("social"),
      reminderMinutes: 30,
    },
    {
      title: "整理房间一角",
      notes: "只处理桌面。",
      date: sat,
      startTime: null,
      endTime: null,
      allDay: true,
      type: "personal",
      color: colorForType("personal"),
      reminderMinutes: null,
    },
  ];
  return rows.map((r) => stamp(r, now));
}

interface ScheduleState {
  events: ScheduleEvent[];
  settings: Settings;
  firedReminders: Record<string, number>;
  hasSeeded: boolean;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  seedIfEmpty: () => void;
  addDrafts: (drafts: DraftEvent[]) => ScheduleEvent[];
  updateEvent: (id: string, patch: Partial<ScheduleEvent>) => void;
  deleteEvent: (id: string) => void;
  toggleComplete: (id: string) => void;
  replaceAll: (events: ScheduleEvent[], settings?: Settings) => void;
  mergeEvents: (events: ScheduleEvent[]) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  markFired: (key: string) => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      events: [],
      settings: DEFAULT_SETTINGS,
      firedReminders: {},
      hasSeeded: false,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      seedIfEmpty: () => {
        const { events, hasSeeded } = get();
        if (hasSeeded) return;
        if (events.length === 0) {
          set({ events: seedEvents(), hasSeeded: true });
        } else {
          set({ hasSeeded: true });
        }
      },
      addDrafts: (drafts) => {
        const created = drafts
          .filter((d) => d.title.trim())
          .map((d) => stamp(d));
        set({ events: [...get().events, ...created] });
        return created;
      },
      updateEvent: (id, patch) => {
        const now = new Date().toISOString();
        set({
          events: get().events.map((e) =>
            e.id === id ? { ...e, ...patch, id: e.id, updatedAt: now } : e,
          ),
        });
      },
      deleteEvent: (id) => {
        set({ events: get().events.filter((e) => e.id !== id) });
      },
      toggleComplete: (id) => {
        const now = new Date().toISOString();
        set({
          events: get().events.map((e) =>
            e.id === id ? { ...e, completed: !e.completed, updatedAt: now } : e,
          ),
        });
      },
      replaceAll: (events, settings) => {
        set({
          events,
          settings: settings ?? get().settings,
          firedReminders: {},
        });
      },
      mergeEvents: (incoming) => {
        const have = new Set(get().events.map((e) => e.id));
        const extra = incoming.filter((e) => !have.has(e.id));
        set({ events: [...get().events, ...extra] });
      },
      updateSettings: (patch) => {
        set({ settings: { ...get().settings, ...patch } });
      },
      markFired: (key) => {
        set({ firedReminders: { ...get().firedReminders, [key]: Date.now() } });
      },
    }),
    {
      name: "sundial-schedule-v1",
      partialize: (s) => ({
        events: s.events,
        settings: s.settings,
        firedReminders: s.firedReminders,
        hasSeeded: s.hasSeeded,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        state?.seedIfEmpty();
      },
    },
  ),
);

export function sortEvents(list: ScheduleEvent[]) {
  return [...list].sort((a, b) => {
    const dk = a.date.localeCompare(b.date);
    if (dk !== 0) return dk;
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;
    return (a.startTime ?? "99:99").localeCompare(b.startTime ?? "99:99");
  });
}
