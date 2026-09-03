import { parseISO } from "date-fns";
import type { ScheduleEvent } from "./types";

export type LaidOutEvent = ScheduleEvent & {
  col: number;
  colCount: number;
};

function overlaps(a: ScheduleEvent, b: ScheduleEvent): boolean {
  return parseISO(a.start) < parseISO(b.end) && parseISO(b.start) < parseISO(a.end);
}

export function layoutEvents(events: ScheduleEvent[]): LaidOutEvent[] {
  const sorted = [...events].sort((a, b) => {
    const startDiff = +parseISO(a.start) - +parseISO(b.start);
    if (startDiff !== 0) return startDiff;
    return +parseISO(b.end) - +parseISO(a.end);
  });

  const clusters: ScheduleEvent[][] = [];
  for (const event of sorted) {
    const cluster = clusters.find((group) => group.some((other) => overlaps(event, other)));
    if (cluster) cluster.push(event);
    else clusters.push([event]);
  }

  const result: LaidOutEvent[] = [];
  for (const cluster of clusters) {
    const colEnds: number[] = [];
    const assigned: Array<ScheduleEvent & { col: number }> = [];
    for (const event of cluster) {
      const start = +parseISO(event.start);
      let col = colEnds.findIndex((end) => end <= start);
      if (col === -1) {
        col = colEnds.length;
        colEnds.push(+parseISO(event.end));
      } else {
        colEnds[col] = +parseISO(event.end);
      }
      assigned.push({ ...event, col });
    }
    const colCount = Math.max(colEnds.length, 1);
    for (const item of assigned) {
      result.push({ ...item, colCount });
    }
  }
  return result;
}
