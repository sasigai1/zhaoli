import { colorForType } from "./colors";
import type { BackupFile, EventType, ScheduleEvent } from "./types";
import { EVENT_TYPES } from "./types";
import { uid } from "@/lib/utils";

function fold(line: string) {
  const chunks: string[] = [];
  let rest = line;
  while (rest.length > 73) {
    chunks.push(rest.slice(0, 73));
    rest = " " + rest.slice(73);
  }
  chunks.push(rest);
  return chunks.join("\r\n");
}

function icsDate(date: string, time: string | null, allDay: boolean) {
  if (allDay || !time) return `;VALUE=DATE:${date.replaceAll("-", "")}`;
  const compact = `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
  return `:${compact}`;
}

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function toIcs(events: ScheduleEvent[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sundial//日晷//ZH",
    "CALSCALE:GREGORIAN",
  ];
  for (const e of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${e.id}@sundial`);
    lines.push(`DTSTAMP:${e.updatedAt.replace(/[-:]/g, "").slice(0, 15)}Z`);
    lines.push(`DTSTART${icsDate(e.date, e.startTime, e.allDay)}`);
    if (!e.allDay && e.endTime) {
      lines.push(`DTEND${icsDate(e.date, e.endTime, false)}`);
    }
    lines.push(fold(`SUMMARY:${escapeText(e.title)}`));
    if (e.notes) lines.push(fold(`DESCRIPTION:${escapeText(e.notes)}`));
    lines.push(`CATEGORIES:${e.type}`);
    lines.push(`X-SUNDIAL-COLOR:${e.color}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

function unfold(ics: string) {
  return ics.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
}

function parseDateField(value: string): { date: string; time: string | null; allDay: boolean } {
  const v = value.replace(/^[A-Z0-9=;:-]*:/, "").replace(/^[^:]*:/, "");
  const compact = value.split(":").pop() ?? "";
  if (/^\d{8}$/.test(compact)) {
    return {
      date: `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`,
      time: null,
      allDay: true,
    };
  }
  const m = compact.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  if (m) {
    return {
      date: `${m[1]}-${m[2]}-${m[3]}`,
      time: `${m[4]}:${m[5]}`,
      allDay: false,
    };
  }
  void v;
  return { date: compact, time: null, allDay: true };
}

export function fromIcs(text: string): ScheduleEvent[] {
  const body = unfold(text);
  const blocks = body.split(/BEGIN:VEVENT/i).slice(1);
  const now = new Date().toISOString();
  const events: ScheduleEvent[] = [];
  for (const block of blocks) {
    const inner = block.split(/END:VEVENT/i)[0] ?? "";
    const get = (key: string) => {
      const line = inner.split(/\r?\n/).find((l) => l.toUpperCase().startsWith(key.toUpperCase()));
      if (!line) return "";
      const idx = line.indexOf(":");
      return idx >= 0 ? line.slice(idx + 1).replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";") : "";
    };
    const startLine = inner.split(/\r?\n/).find((l) => l.toUpperCase().startsWith("DTSTART")) ?? "";
    const endLine = inner.split(/\r?\n/).find((l) => l.toUpperCase().startsWith("DTEND")) ?? "";
    const start = parseDateField(startLine);
    const end = endLine ? parseDateField(endLine) : null;
    const title = get("SUMMARY") || "未命名";
    const typeRaw = get("CATEGORIES").split(",")[0]?.trim() as EventType;
    const type = EVENT_TYPES.includes(typeRaw) ? typeRaw : "other";
    const color = get("X-SUNDIAL-COLOR") || colorForType(type);
    const uidLine = get("UID") || uid();
    const id = uidLine.replace(/@sundial$/, "") || uid();
    events.push({
      id,
      title,
      notes: get("DESCRIPTION"),
      date: start.date,
      startTime: start.time,
      endTime: end && !end.allDay ? end.time : null,
      allDay: start.allDay,
      type,
      color,
      reminderMinutes: start.allDay ? null : 15,
      completed: false,
      createdAt: now,
      updatedAt: now,
    });
  }
  return events;
}

export function toBackup(events: ScheduleEvent[], settings: BackupFile["settings"]): string {
  const payload: BackupFile = {
    version: 1,
    exportedAt: new Date().toISOString(),
    events,
    settings,
  };
  return JSON.stringify(payload, null, 2);
}

export function fromBackup(text: string): { events: ScheduleEvent[]; settings?: BackupFile["settings"] } {
  const data = JSON.parse(text) as Partial<BackupFile> & { events?: ScheduleEvent[] };
  if (!Array.isArray(data.events)) throw new Error("不是有效的日晷备份");
  const events = data.events.filter((e) => e && typeof e.title === "string" && typeof e.date === "string");
  return { events, settings: data.settings };
}

export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
