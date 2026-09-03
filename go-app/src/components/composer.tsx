import { useMemo, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { toast } from "sonner";
import { parseSchedule } from "@/lib/ai";
import { cn } from "@/lib/cn";
import { useSchedule } from "@/lib/schedule/store";
import { EVENT_KINDS, KIND_LABEL, REMINDER_OPTIONS, type EventKind } from "@/lib/schedule/types";
import { formatRange } from "@/lib/schedule/time";
import { parseISO } from "date-fns";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { BottomSheet } from "./sheet";
import { KindChip, KindDot } from "./kind-chip";

type Mode = "speak" | "hand";

type Draft = {
  title: string;
  date: string;
  start: string;
  end: string;
  allDay: boolean;
  kind: EventKind;
  reminderMinutes: number | null;
  location: string;
  notes: string;
};

type ParsedPreview = {
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  kind: EventKind;
  reminderMinutes: number | null;
  location: string;
  notes: string;
};

const PROMPTS = [
  "明天上午十点开会一小时",
  "今晚八点电影，提前半小时提醒",
  "周六全天出游",
];

export function Composer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const selectedDate = useSchedule((s) => s.selectedDate);
  const defaultReminder = useSchedule((s) => s.settings.defaultReminder);
  const addEvents = useSchedule((s) => s.addEvents);

  const [mode, setMode] = useState<Mode>("speak");
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState<{ reply: string; events: ParsedPreview[] } | null>(null);
  const recRef = useRef<{ stop: () => void } | null>(null);

  const draft = useMemo<Draft>(() => {
    const hour = new Date().getHours();
    const startH = Math.min(hour + 1, 22);
    return {
      title: "",
      date: selectedDate,
      start: `${String(startH).padStart(2, "0")}:00`,
      end: `${String(startH + 1).padStart(2, "0")}:00`,
      allDay: false,
      kind: "work",
      reminderMinutes: defaultReminder,
      location: "",
      notes: "",
    };
  }, [selectedDate, defaultReminder]);
  const [hand, setHand] = useState<Draft>(draft);

  const reset = () => {
    setText("");
    setPreview(null);
    setPending(false);
    setListening(false);
    recRef.current?.stop();
    recRef.current = null;
    setHand({
      title: "",
      date: selectedDate,
      start: "09:00",
      end: "10:00",
      allDay: false,
      kind: "work",
      reminderMinutes: defaultReminder,
      location: "",
      notes: "",
    });
  };

  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const speechAvailable =
    typeof window !== "undefined" &&
    Boolean((window as Window & { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);

  const toggleListen = () => {
    const SR = (window as Window & {
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        continuous: boolean;
        onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onend: (() => void) | null;
        onerror: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
    }).webkitSpeechRecognition;
    if (!SR) {
      toast("此浏览器还不支持口述");
      return;
    }
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = "zh-CN";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (ev) => {
      const last = ev.results[ev.results.length - 1];
      const transcript = last?.[0]?.transcript ?? "";
      if (transcript) setText(transcript);
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    rec.onerror = () => {
      setListening(false);
      recRef.current = null;
    };
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  const parse = async () => {
    const value = text.trim();
    if (!value) return;
    setPending(true);
    try {
      const result = await parseSchedule({
        data: {
          text: value,
          nowIso: new Date().toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          selectedDate,
          defaultReminder,
        },
      });
      if (!result.ok) {
        toast(result.error);
        return;
      }
      setPreview(result);
    } catch {
      toast("书记未能落笔，请稍后再试。");
    } finally {
      setPending(false);
    }
  };

  const commitPreview = () => {
    if (!preview) return;
    addEvents(preview.events);
    toast(preview.reply);
    close(false);
  };

  const commitHand = () => {
    if (!hand.title.trim()) {
      toast("先写下标题");
      return;
    }
    const start = hand.allDay
      ? new Date(`${hand.date}T00:00:00`).toISOString()
      : new Date(`${hand.date}T${hand.start}:00`).toISOString();
    const end = hand.allDay
      ? new Date(`${hand.date}T23:59:00`).toISOString()
      : new Date(`${hand.date}T${hand.end}:00`).toISOString();
    addEvents([
      {
        title: hand.title.trim(),
        start,
        end,
        allDay: hand.allDay,
        kind: hand.kind,
        reminderMinutes: hand.reminderMinutes,
        location: hand.location.trim(),
        notes: hand.notes.trim(),
      },
    ]);
    toast("已写入日程");
    close(false);
  };

  return (
    <BottomSheet open={open} onOpenChange={close} title="写下日程">
      <div className="pt-2">
        <p className="font-serif text-[28px] leading-none tracking-tight">写下</p>
        <p className="mt-2 text-sm text-muted">口述给书记，或自己落笔。</p>

        <div className="mt-5 grid grid-cols-2 rounded-full bg-paper p-1">
          {(["speak", "hand"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={cn(
                "h-9 rounded-full text-sm transition-[background-color,color] duration-150 ease-out",
                mode === item ? "bg-sheet text-ink shadow-card" : "text-muted",
              )}
            >
              {item === "speak" ? "口述" : "手写"}
            </button>
          ))}
        </div>

        {mode === "speak" ? (
          <div className="mt-5">
            <div className="relative">
              <Textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setPreview(null);
                }}
                placeholder="明天上午十点，和设计组开会一小时，提前十五分钟提醒"
                rows={4}
              />
              {speechAvailable ? (
                <button
                  type="button"
                  onClick={toggleListen}
                  aria-label={listening ? "停止口述" : "开始口述"}
                  className={cn(
                    "absolute right-2.5 bottom-2.5 flex size-10 items-center justify-center rounded-full transition-[background-color,color] duration-150 ease-out",
                    listening ? "bg-ink text-sheet" : "bg-sheet text-ink shadow-card",
                  )}
                >
                  {listening ? <Square className="size-3.5" /> : <Mic className="size-4" />}
                </button>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {PROMPTS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setText(item);
                    setPreview(null);
                  }}
                  className="rounded-full bg-paper px-3 py-1.5 text-xs text-muted transition-colors duration-150 hover:text-ink"
                >
                  {item}
                </button>
              ))}
            </div>

            {pending ? (
              <p className="shimmer-text mt-6 font-serif text-lg">正在落笔…</p>
            ) : null}

            {preview ? (
              <div className="mt-5 space-y-3">
                <p className="text-sm text-muted">{preview.reply}</p>
                {preview.events.map((event, index) => (
                  <div key={`${event.title}-${index}`} className="rounded-lg bg-paper px-4 py-3 shadow-card">
                    <div className="flex items-center gap-2">
                      <KindDot kind={event.kind} />
                      <p className="font-medium">{event.title}</p>
                    </div>
                    <p className="mt-1 text-sm tabular-nums text-muted">
                      {formatRange(parseISO(event.start), parseISO(event.end), event.allDay)}
                      <span className="mx-1.5 text-faint">·</span>
                      {KIND_LABEL[event.kind]}
                    </p>
                  </div>
                ))}
                <Button className="mt-2 w-full" size="lg" onClick={commitPreview}>
                  收入日程
                </Button>
              </div>
            ) : (
              <Button className="mt-5 w-full" size="lg" disabled={!text.trim() || pending} onClick={parse}>
                请书记整理
              </Button>
            )}
          </div>
        ) : (
          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              commitHand();
            }}
          >
            <Input
              value={hand.title}
              onChange={(e) => setHand({ ...hand, title: e.target.value })}
              placeholder="标题"
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs text-muted">
                日期
                <Input
                  type="date"
                  className="mt-1.5"
                  value={hand.date}
                  onChange={(e) => setHand({ ...hand, date: e.target.value })}
                />
              </label>
              <label className="flex items-end gap-2 pb-1 text-sm text-muted">
                <input
                  type="checkbox"
                  className="size-4 accent-ink"
                  checked={hand.allDay}
                  onChange={(e) => setHand({ ...hand, allDay: e.target.checked })}
                />
                全天
              </label>
            </div>
            {!hand.allDay ? (
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-muted">
                  开始
                  <Input
                    type="time"
                    className="mt-1.5"
                    value={hand.start}
                    onChange={(e) => setHand({ ...hand, start: e.target.value })}
                  />
                </label>
                <label className="block text-xs text-muted">
                  结束
                  <Input
                    type="time"
                    className="mt-1.5"
                    value={hand.end}
                    onChange={(e) => setHand({ ...hand, end: e.target.value })}
                  />
                </label>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {EVENT_KINDS.map((kind) => (
                <KindChip
                  key={kind}
                  kind={kind}
                  active={hand.kind === kind}
                  onClick={() => setHand({ ...hand, kind })}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {REMINDER_OPTIONS.map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => setHand({ ...hand, reminderMinutes: option.value })}
                  className={cn(
                    "h-9 rounded-full px-3 text-sm transition-[background-color,color] duration-150",
                    hand.reminderMinutes === option.value
                      ? "bg-ink text-sheet"
                      : "bg-paper text-muted",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Input
              value={hand.location}
              onChange={(e) => setHand({ ...hand, location: e.target.value })}
              placeholder="地点（可选）"
            />
            <Button type="submit" className="w-full" size="lg">
              收入日程
            </Button>
          </form>
        )}
      </div>
    </BottomSheet>
  );
}
