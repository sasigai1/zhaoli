import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makeSeed } from "./seed";
import type { DayBrief, ScheduleEvent, Settings } from "./types";
import { dateKey } from "./time";

type ScheduleState = {
  events: ScheduleEvent[];
  briefs: Record<string, DayBrief>;
  settings: Settings;
  seeded: boolean;
  selectedDate: string;
  composerOpen: boolean;
  selectedEventId: string | null;
  setSelectedDate: (key: string) => void;
  openComposer: () => void;
  closeComposer: () => void;
  selectEvent: (id: string | null) => void;
  addEvents: (events: Omit<ScheduleEvent, "id" | "createdAt" | "updatedAt" | "reminderFired">[]) => void;
  updateEvent: (id: string, patch: Partial<ScheduleEvent>) => void;
  removeEvent: (id: string) => void;
  markReminderFired: (id: string) => void;
  resetRemindersIfFuture: () => void;
  saveBrief: (brief: DayBrief) => void;
  setSettings: (patch: Partial<Settings>) => void;
  restoreSample: () => void;
};

const defaultSettings: Settings = {
  defaultReminder: 15,
  notifyEnabled: false,
};

function stamp(): string {
  return new Date().toISOString();
}

function withId(
  event: Omit<ScheduleEvent, "id" | "createdAt" | "updatedAt" | "reminderFired">,
): ScheduleEvent {
  const now = stamp();
  return {
    ...event,
    id: crypto.randomUUID(),
    reminderFired: false,
    createdAt: now,
    updatedAt: now,
  };
}

export const useSchedule = create<ScheduleState>()(
  persist(
    (set, get) => ({
      events: [],
      briefs: {},
      settings: defaultSettings,
      seeded: false,
      selectedDate: dateKey(new Date()),
      composerOpen: false,
      selectedEventId: null,
      setSelectedDate: (key) => set({ selectedDate: key }),
      openComposer: () => set({ composerOpen: true, selectedEventId: null }),
      closeComposer: () => set({ composerOpen: false }),
      selectEvent: (id) => set({ selectedEventId: id, composerOpen: false }),
      addEvents: (events) =>
        set({
          events: [...get().events, ...events.map(withId)],
        }),
      updateEvent: (id, patch) =>
        set({
          events: get().events.map((event) =>
            event.id === id ? { ...event, ...patch, updatedAt: stamp() } : event,
          ),
        }),
      removeEvent: (id) =>
        set({
          events: get().events.filter((event) => event.id !== id),
          selectedEventId: get().selectedEventId === id ? null : get().selectedEventId,
        }),
      markReminderFired: (id) =>
        set({
          events: get().events.map((event) =>
            event.id === id ? { ...event, reminderFired: true } : event,
          ),
        }),
      resetRemindersIfFuture: () => {
        const now = Date.now();
        set({
          events: get().events.map((event) => {
            const start = Date.parse(event.start);
            if (event.reminderMinutes === null) return event;
            const fireAt = start - event.reminderMinutes * 60_000;
            if (fireAt > now && event.reminderFired) {
              return { ...event, reminderFired: false };
            }
            return event;
          }),
        });
      },
      saveBrief: (brief) =>
        set({
          briefs: { ...get().briefs, [brief.date]: brief },
        }),
      setSettings: (patch) =>
        set({
          settings: { ...get().settings, ...patch },
        }),
      restoreSample: () =>
        set({
          events: makeSeed(),
          seeded: true,
          briefs: {},
        }),
    }),
    {
      name: "sujian-schedule-v2",
      skipHydration: true,
      partialize: (state) => ({
        events: state.events,
        briefs: state.briefs,
        settings: state.settings,
        seeded: state.seeded,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.seeded || state.events.length === 0) {
          queueMicrotask(() => {
            useSchedule.setState({ events: makeSeed(), seeded: true });
          });
        }
      },
    },
  ),
);
