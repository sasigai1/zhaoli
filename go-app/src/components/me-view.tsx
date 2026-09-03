import { toast } from "sonner";
import { useSchedule } from "@/lib/schedule/store";
import { REMINDER_OPTIONS } from "@/lib/schedule/types";
import { BrandMark } from "./brand-mark";
import { Button } from "./ui/button";
import { cn } from "@/lib/cn";

export function MeView() {
  const settings = useSchedule((s) => s.settings);
  const setSettings = useSchedule((s) => s.setSettings);
  const restoreSample = useSchedule((s) => s.restoreSample);
  const events = useSchedule((s) => s.events);

  return (
    <div className="px-5 pb-10">
      <div className="flex items-end gap-3 pt-4">
        <BrandMark className="h-10 w-5" />
        <div>
          <h1 className="font-serif text-[32px] leading-none tracking-tight">素笺</h1>
          <p className="mt-2 text-xs tracking-[0.22em] text-muted">A BLANK PAGE FOR THE DAY</p>
        </div>
      </div>

      <p className="mt-6 text-[15px] leading-relaxed text-muted">
        把一天写在一张白纸上。口述给书记，它会整理成日程；到点时轻声提醒。不做喧闹的格子，只留此刻与接下来。
      </p>

      <section className="mt-8">
        <p className="text-[11px] tracking-[0.22em] text-muted">默认提醒</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {REMINDER_OPTIONS.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => setSettings({ defaultReminder: option.value })}
              className={cn(
                "h-9 rounded-full px-3 text-sm transition-[background-color,color] duration-150",
                settings.defaultReminder === option.value
                  ? "bg-ink text-sheet"
                  : "bg-paper text-muted",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-lg bg-paper px-4 py-4 shadow-card">
        <p className="text-sm text-muted">纸上现有</p>
        <p className="mt-1 font-serif text-3xl tabular-nums">{events.length}</p>
        <p className="text-xs text-muted">件事</p>
      </section>

      <section className="mt-8 space-y-3">
        <p className="text-[11px] tracking-[0.22em] text-muted">书记</p>
        <p className="text-sm leading-relaxed text-muted">
          口述、日简与疏时由书记完成。你只说人话，它负责落成时刻与时长。无需粘贴任何密钥。
        </p>
      </section>

      <Button
        variant="outline"
        className="mt-8 w-full"
        onClick={() => {
          restoreSample();
          toast("已铺回示例日程");
        }}
      >
        铺回示例日程
      </Button>
    </div>
  );
}
