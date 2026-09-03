import {
  addDays,
  differenceInMinutes,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import type { ScheduleEvent } from "./types";

export const HOUR_PX = 72;
export const MIN_EVENT_PX = 40;

export function dateKey(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-MM-dd");
}

export function parseKey(key: string): Date {
  return parseISO(`${key}T12:00:00`);
}

export function formatDayTitle(date: Date): string {
  return format(date, "M月d日", { locale: zhCN });
}

export function formatWeekday(date: Date): string {
  return format(date, "EEEE", { locale: zhCN });
}

export function formatClock(date: Date): string {
  return format(date, "HH:mm");
}

export function formatRange(start: Date, end: Date, allDay: boolean): string {
  if (allDay) return "全天";
  return `${formatClock(start)} – ${formatClock(end)}`;
}

export function weekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function eventsOnDay(events: ScheduleEvent[], day: Date): ScheduleEvent[] {
  return events
    .filter((event) => isSameDay(parseISO(event.start), day))
    .sort((a, b) => +parseISO(a.start) - +parseISO(b.start));
}

export function timedEvents(events: ScheduleEvent[]): ScheduleEvent[] {
  return events.filter((event) => !event.allDay);
}

export function allDayEvents(events: ScheduleEvent[]): ScheduleEvent[] {
  return events.filter((event) => event.allDay);
}

export function ribbonHours(events: ScheduleEvent[], now: Date, viewingToday: boolean) {
  const hours = timedEvents(events).flatMap((event) => [
    parseISO(event.start).getHours(),
    parseISO(event.end).getHours(),
  ]);
  if (viewingToday) hours.push(now.getHours());
  const min = hours.length ? Math.min(...hours) : 8;
  const max = hours.length ? Math.max(...hours) : 18;
  const startHour = Math.max(0, Math.min(7, min) - (min <= 7 ? 0 : 1));
  const endHour = Math.min(24, Math.max(21, max + 1));
  return { startHour, endHour };
}

export function minutesFromStart(date: Date, startHour: number): number {
  return (date.getHours() - startHour) * 60 + date.getMinutes() + date.getSeconds() / 60;
}

export function eventMetrics(
  event: ScheduleEvent,
  startHour: number,
): { top: number; height: number } {
  const start = parseISO(event.start);
  const end = parseISO(event.end);
  const top = (minutesFromStart(start, startHour) / 60) * HOUR_PX;
  const minutes = Math.max(differenceInMinutes(end, start), 20);
  const height = Math.max((minutes / 60) * HOUR_PX, MIN_EVENT_PX);
  return { top, height };
}

export function relativeLabel(from: Date, target: Date): string {
  const minutes = differenceInMinutes(target, from);
  if (minutes > -2 && minutes < 2) return "就是现在";
  if (minutes >= 0 && minutes < 60) return `${minutes} 分钟后`;
  if (minutes >= 60 && minutes < 24 * 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours} 小时 ${rest} 分后` : `${hours} 小时后`;
  }
  if (minutes < 0 && minutes > -60) return `已过 ${Math.abs(minutes)} 分钟`;
  if (minutes <= -60 && minutes > -24 * 60) {
    const hours = Math.floor(Math.abs(minutes) / 60);
    return `已过 ${hours} 小时`;
  }
  if (minutes >= 24 * 60) return `${Math.round(minutes / 1440)} 天后`;
  return `${Math.round(Math.abs(minutes) / 1440)} 天前`;
}

export function remainingLabel(now: Date, end: Date): string {
  const minutes = differenceInMinutes(end, now);
  if (minutes <= 0) return "即将结束";
  if (minutes < 60) return `还剩 ${minutes} 分钟`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `还剩 ${hours} 小时 ${rest} 分` : `还剩 ${hours} 小时`;
}

export function nextUp(
  events: ScheduleEvent[],
  now: Date,
): { event: ScheduleEvent; status: "now" | "next" } | null {
  const timed = [...timedEvents(events)].sort(
    (a, b) => +parseISO(a.start) - +parseISO(b.start),
  );
  const current = timed.find((event) => {
    const start = parseISO(event.start);
    const end = parseISO(event.end);
    return start <= now && now < end;
  });
  if (current) return { event: current, status: "now" };
  const upcoming = timed.find((event) => parseISO(event.start) > now);
  if (upcoming) return { event: upcoming, status: "next" };
  return null;
}

export function fingerprintEvents(events: ScheduleEvent[]): string {
  return events
    .map((event) => `${event.id}:${event.start}:${event.end}:${event.title}`)
    .join("|");
}

export function toLocalDateTimeValue(iso: string): { date: string; time: string } {
  const d = parseISO(iso);
  return { date: format(d, "yyyy-MM-dd"), time: format(d, "HH:mm") };
}

export function fromLocalDateTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function startOfLocalDay(date: Date): Date {
  return startOfDay(date);
}

export function reminderLabel(minutes: number | null): string {
  if (minutes === null) return "不提醒";
  if (minutes === 0) return "准时提醒";
  if (minutes === 60) return "提前 1 小时";
  return `提前 ${minutes} 分钟`;
}
