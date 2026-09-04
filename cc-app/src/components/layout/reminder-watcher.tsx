import { useEffect } from "react";
import { toast } from "sonner";
import { playChime, vibrateSoft } from "@/lib/schedule/chime";
import { combineDateTime } from "@/lib/schedule/dates";
import { useScheduleStore } from "@/lib/schedule/store";

export function ReminderWatcher() {
  const events = useScheduleStore((s) => s.events);
  const settings = useScheduleStore((s) => s.settings);
  const fired = useScheduleStore((s) => s.firedReminders);
  const markFired = useScheduleStore((s) => s.markFired);

  useEffect(() => {
    if (!settings.notifications && !settings.sound) return;

    const tick = () => {
      const now = Date.now();
      for (const e of events) {
        if (e.completed || e.reminderMinutes === null || e.allDay || !e.startTime) continue;
        const start = combineDateTime(e.date, e.startTime).getTime();
        const fireAt = start - e.reminderMinutes * 60_000;
        if (now < fireAt || now > start + 5 * 60_000) continue;
        const key = `${e.id}:${e.date}:${e.startTime}:${e.reminderMinutes}`;
        if (fired[key]) continue;
        markFired(key);

        if (settings.sound) void playChime();
        vibrateSoft();

        if (settings.notifications && typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification(e.title, {
              body: e.startTime ? `${e.startTime} 开始` : "日程提醒",
              lang: "zh-CN",
              tag: key,
              silent: true,
            });
          } catch {
            /* ignore */
          }
        }
        toast(e.title, { description: e.startTime ? `${e.startTime} 开始` : "日程提醒" });
      }
    };

    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, [events, settings, fired, markFired]);

  return null;
}
