import { isAfter, parseISO } from "date-fns";
import { toast } from "sonner";
import { useSchedule } from "@/lib/schedule/store";
import { formatDayTitle, formatRange, reminderLabel } from "@/lib/schedule/time";
import { KindDot } from "./kind-chip";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";

export function RemindersView() {
  const events = useSchedule((s) => s.events);
  const notifyEnabled = useSchedule((s) => s.settings.notifyEnabled);
  const setSettings = useSchedule((s) => s.setSettings);
  const selectEvent = useSchedule((s) => s.selectEvent);
  const now = new Date();

  const upcoming = events
    .filter((event) => event.reminderMinutes !== null && isAfter(parseISO(event.end), now))
    .sort((a, b) => +parseISO(a.start) - +parseISO(b.start));

  const enable = async () => {
    if (typeof Notification === "undefined") {
      toast("此环境不支持系统通知，到点会在应用内轻声提示。");
      setSettings({ notifyEnabled: true });
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast("未开启系统通知。仍可在打开应用时收到到点提示。");
    }
    setSettings({ notifyEnabled: true });
    if (permission === "granted") {
      toast("提醒已开启");
    }
  };

  return (
    <div className="px-5 pb-8">
      <h1 className="pt-2 font-serif text-[32px] tracking-tight">提醒</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        到点前轻声告知。把素笺留在主屏幕，纸面就不会被忘记。
      </p>

      <div className="mt-6 flex items-center justify-between rounded-lg bg-paper px-4 py-4 shadow-card">
        <div>
          <p className="font-medium">开启提醒</p>
          <p className="mt-0.5 text-xs text-muted">系统通知与应用内提示</p>
        </div>
        <Switch
          checked={notifyEnabled}
          onCheckedChange={(checked) => {
            if (checked) void enable();
            else setSettings({ notifyEnabled: false });
          }}
        />
      </div>

      <section className="mt-8">
        <p className="text-[11px] tracking-[0.22em] text-muted">即将到来</p>
        <ul className="mt-3 space-y-2">
          {upcoming.length === 0 ? (
            <li className="py-10 text-center">
              <p className="font-serif text-lg">还没有提醒</p>
              <p className="mt-1 text-sm text-muted">写下日程时选一个提前提醒即可。</p>
            </li>
          ) : (
            upcoming.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => selectEvent(event.id)}
                  className="flex w-full items-start gap-3 rounded-lg bg-paper px-3.5 py-3.5 text-left shadow-card"
                >
                  <KindDot kind={event.kind} className="mt-1.5" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{event.title}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {formatDayTitle(parseISO(event.start))}
                      <span className="mx-1.5 text-faint">·</span>
                      <span className="tabular-nums">
                        {formatRange(parseISO(event.start), parseISO(event.end), event.allDay)}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-accent">{reminderLabel(event.reminderMinutes)}</span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      {!notifyEnabled ? (
        <Button className="mt-6 w-full" variant="soft" onClick={() => void enable()}>
          允许提醒
        </Button>
      ) : null}
    </div>
  );
}
