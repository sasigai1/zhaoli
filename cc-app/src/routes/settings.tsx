import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Label, NativeSelect } from "@/components/ui/field";
import { playChime, unlockAudio } from "@/lib/schedule/chime";
import { downloadText, fromBackup, fromIcs, toBackup, toIcs } from "@/lib/schedule/ics";
import { useScheduleStore } from "@/lib/schedule/store";
import type { ReminderMinutes } from "@/lib/schedule/types";
import { useMounted } from "@/hooks/use-mounted";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-lg bg-paper px-4 py-4 text-left shadow-card"
    >
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-subtle">{hint}</span>
      </span>
      <span
        className={`relative h-6 w-10 shrink-0 rounded-full transition-[background-color] duration-150 ${
          checked ? "bg-ink" : "bg-inset"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-paper transition-transform duration-150 ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function SettingsPage() {
  const mounted = useMounted();
  const events = useScheduleStore((s) => s.events);
  const settings = useScheduleStore((s) => s.settings);
  const updateSettings = useScheduleStore((s) => s.updateSettings);
  const replaceAll = useScheduleStore((s) => s.replaceAll);
  const mergeEvents = useScheduleStore((s) => s.mergeEvents);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{
    events: typeof events;
    settings?: typeof settings;
    name: string;
  } | null>(null);

  async function enableNotifications(next: boolean) {
    if (!next) {
      updateSettings({ notifications: false });
      return;
    }
    if (typeof Notification === "undefined") {
      toast("当前环境不支持系统通知");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      toast("未获得通知权限");
      updateSettings({ notifications: false });
      return;
    }
    updateSettings({ notifications: true });
    toast("提醒已打开");
  }

  async function enableSound(next: boolean) {
    updateSettings({ sound: next });
    if (next) {
      await unlockAudio();
      await playChime();
    }
  }

  function exportJson() {
    downloadText(
      `日晷-备份-${format(new Date(), "yyyy-MM-dd")}.json`,
      toBackup(events, settings),
      "application/json",
    );
    toast("已导出 JSON");
  }

  function exportIcs() {
    downloadText(
      `日晷-${format(new Date(), "yyyy-MM-dd")}.ics`,
      toIcs(events),
      "text/calendar",
    );
    toast("已导出日历文件");
  }

  async function onPick(file: File) {
    const text = await file.text();
    try {
      if (file.name.endsWith(".ics") || text.includes("BEGIN:VCALENDAR")) {
        const parsed = fromIcs(text);
        if (!parsed.length) throw new Error("空日历");
        setPending({ events: parsed, name: file.name });
      } else {
        const parsed = fromBackup(text);
        setPending({ events: parsed.events, settings: parsed.settings, name: file.name });
      }
    } catch {
      toast("无法识别这个文件");
    }
  }

  if (!mounted) return <div className="min-h-dvh bg-canvas" />;

  return (
    <PageShell title="设置" subtitle="提醒、声音、把日子带走或带回来。">
      <div className="flex flex-col gap-2.5">
        <Toggle
          checked={settings.notifications}
          onChange={enableNotifications}
          label="系统提醒"
          hint="到点会弹出系统通知。需要应用停留在后台或已打开。"
        />
        <Toggle
          checked={settings.sound}
          onChange={enableSound}
          label="提示音"
          hint="三声轻铃。第一次打开会试响一次。"
        />
      </div>

      <div className="mt-8">
        <Label htmlFor="def-remind">默认提前提醒</Label>
        <NativeSelect
          id="def-remind"
          value={settings.defaultReminder === null ? "off" : String(settings.defaultReminder)}
          onChange={(e) =>
            updateSettings({
              defaultReminder:
                e.target.value === "off" ? null : (Number(e.target.value) as ReminderMinutes),
            })
          }
        >
          <option value="off">不提醒</option>
          <option value="0">准时</option>
          <option value="5">5 分钟前</option>
          <option value="10">10 分钟前</option>
          <option value="15">15 分钟前</option>
          <option value="30">30 分钟前</option>
          <option value="60">1 小时前</option>
          <option value="1440">1 天前</option>
        </NativeSelect>
      </div>

      <div className="mt-5">
        <Label htmlFor="weekstart">一周从哪天起</Label>
        <NativeSelect
          id="weekstart"
          value={settings.weekStartsOn}
          onChange={(e) =>
            updateSettings({ weekStartsOn: Number(e.target.value) as 0 | 1 })
          }
        >
          <option value={1}>星期一</option>
          <option value={0}>星期日</option>
        </NativeSelect>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg">导入导出</h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          JSON 是完整备份，换手机时用它。ICS 可以交给其他日历软件。
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportJson}>
            导出 JSON
          </Button>
          <Button variant="outline" onClick={exportIcs}>
            导出 ICS
          </Button>
          <Button variant="ghost" onClick={() => fileRef.current?.click()}>
            导入文件
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.ics,application/json,text/calendar"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onPick(f);
              e.target.value = "";
            }}
          />
        </div>
        <p className="mt-3 text-xs text-subtle">目前共 {events.length} 件日程，只存在这台设备上。</p>
      </section>

      {pending ? (
        <div className="mt-6 rounded-xl bg-paper p-4 shadow-card">
          <p className="text-sm">
            从 {pending.name} 读到 {pending.events.length} 件。
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              onClick={() => {
                mergeEvents(pending.events);
                toast("已合并导入");
                setPending(null);
              }}
            >
              合并
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                replaceAll(pending.events, pending.settings);
                toast("已替换全部");
                setPending(null);
              }}
            >
              替换现有
            </Button>
            <Button variant="ghost" onClick={() => setPending(null)}>
              取消
            </Button>
          </div>
        </div>
      ) : null}

      <p className="mt-12 text-center text-xs leading-relaxed text-subtle">
        日晷把日程留在本地。智能拆分在你按下按钮时才会发生。
      </p>
    </PageShell>
  );
}
