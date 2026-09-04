import { addDays, format, startOfWeek } from "date-fns";
import { parseISODate } from "./dates";
import { TYPE_META } from "./colors";
import type { EventType, ScheduleEvent } from "./types";
import { EVENT_TYPES } from "./types";

function durationHours(e: ScheduleEvent) {
  if (e.allDay || !e.startTime) return 1;
  if (!e.endTime) return 1;
  const [sh, sm] = e.startTime.split(":").map(Number);
  const [eh, em] = e.endTime.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return Math.max(mins, 30) / 60;
}

export function computeStats(events: ScheduleEvent[], now = new Date()) {
  const today = format(now, "yyyy-MM-dd");
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), "yyyy-MM-dd"));
  const weekEvents = events.filter((e) => weekDates.includes(e.date));
  const done = weekEvents.filter((e) => e.completed).length;
  const byType: Record<EventType, { count: number; hours: number }> = {
    work: { count: 0, hours: 0 },
    personal: { count: 0, hours: 0 },
    health: { count: 0, hours: 0 },
    study: { count: 0, hours: 0 },
    social: { count: 0, hours: 0 },
    focus: { count: 0, hours: 0 },
    rest: { count: 0, hours: 0 },
    other: { count: 0, hours: 0 },
  };
  for (const e of weekEvents) {
    byType[e.type].count += 1;
    byType[e.type].hours += durationHours(e);
  }
  const typeRows = EVENT_TYPES.map((t) => ({
    type: t,
    label: TYPE_META[t].label,
    color: TYPE_META[t].swatch,
    count: byType[t].count,
    hours: Math.round(byType[t].hours * 10) / 10,
  })).filter((r) => r.count > 0);

  const weekdayBusy = Array.from({ length: 7 }, (_, i) => {
    const iso = weekDates[i]!;
    const count = events.filter((e) => e.date === iso).length;
    return {
      iso,
      label: ["一", "二", "三", "四", "五", "六", "日"][i]!,
      count,
    };
  });

  const heatStart = addDays(now, -7 * 11 - ((now.getDay() + 6) % 7));
  const heat: { iso: string; count: number }[] = [];
  for (let i = 0; i < 84; i++) {
    const iso = format(addDays(heatStart, i), "yyyy-MM-dd");
    heat.push({
      iso,
      count: events.filter((e) => e.date === iso).length,
    });
  }

  const upcoming = events
    .filter((e) => e.date >= today && !e.completed)
    .sort((a, b) => `${a.date}${a.startTime ?? ""}`.localeCompare(`${b.date}${b.startTime ?? ""}`));

  const overdue = events.filter((e) => e.date < today && !e.completed).length;

  return {
    total: events.length,
    weekCount: weekEvents.length,
    weekDone: done,
    weekRate: weekEvents.length ? Math.round((done / weekEvents.length) * 100) : 0,
    typeRows,
    weekdayBusy,
    heat,
    upcomingCount: upcoming.length,
    overdue,
    todayCount: events.filter((e) => e.date === today).length,
  };
}

export function monthDots(events: ScheduleEvent[], monthStart: Date) {
  const key = format(monthStart, "yyyy-MM");
  const map = new Map<string, ScheduleEvent[]>();
  for (const e of events) {
    if (!e.date.startsWith(key)) continue;
    const list = map.get(e.date) ?? [];
    list.push(e);
    map.set(e.date, list);
  }
  return map;
}

export { parseISODate };
