import {
  addDays,
  addMinutes,
  differenceInCalendarDays,
  format,
  isToday,
  isTomorrow,
  isYesterday,
  parse,
  startOfDay,
} from "date-fns";
import { zhCN } from "date-fns/locale";

export const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function todayISO(now = new Date()) {
  return format(now, "yyyy-MM-dd");
}

export function formatISODate(iso: string, pattern = "M月d日") {
  return format(parseISODate(iso), pattern, { locale: zhCN });
}

export function parseISODate(iso: string) {
  return parse(iso, "yyyy-MM-dd", new Date());
}

export function weekdayLabel(iso: string) {
  return format(parseISODate(iso), "EEEE", { locale: zhCN });
}

export function friendlyDay(iso: string, now = new Date()) {
  const d = parseISODate(iso);
  if (isToday(d)) return "今天";
  if (isTomorrow(d)) return "明天";
  if (isYesterday(d)) return "昨天";
  const diff = differenceInCalendarDays(startOfDay(d), startOfDay(now));
  if (diff > 1 && diff < 7) return format(d, "EEEE", { locale: zhCN });
  return format(d, "M月d日 EEE", { locale: zhCN });
}

export function formatTimeLabel(time: string | null, allDay: boolean) {
  if (allDay || !time) return "全天";
  return time;
}

export function combineDateTime(isoDate: string, time: string | null) {
  if (!time) return parseISODate(isoDate);
  return parse(`${isoDate} ${time}`, "yyyy-MM-dd HH:mm", new Date());
}

export function eventStart(isoDate: string, startTime: string | null, allDay: boolean) {
  if (allDay || !startTime) return startOfDay(parseISODate(isoDate));
  return combineDateTime(isoDate, startTime);
}

export function eventEnd(
  isoDate: string,
  startTime: string | null,
  endTime: string | null,
  allDay: boolean,
) {
  if (allDay) return addMinutes(addDays(startOfDay(parseISODate(isoDate)), 1), -1);
  if (endTime) return combineDateTime(isoDate, endTime);
  if (startTime) return addMinutes(combineDateTime(isoDate, startTime), 60);
  return addMinutes(startOfDay(parseISODate(isoDate)), 60);
}

export function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export function minutesToLabel(mins: number) {
  if (mins === 0) return "准时";
  if (mins < 60) return `${mins} 分钟前`;
  if (mins === 60) return "1 小时前";
  if (mins === 120) return "2 小时前";
  if (mins === 1440) return "1 天前";
  return `${mins} 分钟前`;
}

export function sortKey(date: string, startTime: string | null, allDay: boolean) {
  if (allDay || !startTime) return `${date}T00:00`;
  return `${date}T${startTime}`;
}
