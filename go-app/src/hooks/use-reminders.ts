import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { parseISO } from "date-fns";
import { useSchedule } from "@/lib/schedule/store";
import { formatClock } from "@/lib/schedule/time";

export function useReminders(enabled: boolean) {
  const firedRef = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      const { events, markReminderFired } = useSchedule.getState();
      const now = Date.now();

      for (const event of events) {
        if (event.reminderMinutes === null) continue;
        if (event.reminderFired || firedRef.current.has(event.id)) continue;

        const start = +parseISO(event.start);
        const fireAt = start - event.reminderMinutes * 60_000;
        if (now < fireAt || now > start + 2 * 60_000) continue;

        firedRef.current.add(event.id);
        markReminderFired(event.id);

        const when = formatClock(parseISO(event.start));
        const body =
          event.reminderMinutes === 0
            ? `${when} 开始 · ${event.title}`
            : `${event.title} · ${when} 开始`;

        toast(event.title, { description: body });

        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification("素笺", { body, tag: event.id });
          } catch {
            /* some browsers require a service worker */
          }
        }
      }
    };

    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, [enabled]);
}
