import { useState } from "react";
import { isSameDay, parseISO } from "date-fns";
import { toast } from "sonner";
import { sculptSchedule, writeBrief } from "@/lib/ai";
import { cn } from "@/lib/cn";
import { useNow } from "@/hooks/use-now";
import { useSchedule } from "@/lib/schedule/store";
import {
  allDayEvents,
  dateKey,
  eventsOnDay,
  fingerprintEvents,
  formatClock,
  formatDayTitle,
  formatWeekday,
  nextUp,
  parseKey,
  remainingLabel,
  relativeLabel,
  ribbonHours,
  weekDays,
} from "@/lib/schedule/time";
import { KindDot } from "./kind-chip";
import { Ribbon } from "./ribbon";
import { Button } from "./ui/button";

export function TodayView() {
  const now = useNow(1000);
  const events = useSchedule((s) => s.events);
  const selectedDate = useSchedule((s) => s.selectedDate);
  const setSelectedDate = useSchedule((s) => s.setSelectedDate);
  const selectEvent = useSchedule((s) => s.selectEvent);
  const openComposer = useSchedule((s) => s.openComposer);
  const briefs = useSchedule((s) => s.briefs);
  const saveBrief = useSchedule((s) => s.saveBrief);
  const updateEvent = useSchedule((s) => s.updateEvent);

  const day = parseKey(selectedDate);
  const viewingToday = isSameDay(day, now);
  const dayEvents = eventsOnDay(events, day);
  const allDay = allDayEvents(dayEvents);
  const { startHour, endHour } = ribbonHours(dayEvents, now, viewingToday);
  const upcoming = nextUp(dayEvents, now) ?? nextUp(events, now);
  const upcomingIsToday = upcoming ? dateKey(upcoming.event.start) === selectedDate : false;
  const brief = briefs[selectedDate];
  const fingerprint = fingerprintEvents(dayEvents);
  const briefStale = Boolean(brief && brief.fingerprint !== fingerprint);

  const [briefing, setBriefing] = useState(false);
  const [sculpting, setSculpting] = useState(false);
  const [sculpt, setSculpt] = useState<{
    summary: string;
    moves: { id: string; title: string; newStart: string; newEnd: string; reason: string }[];
  } | null>(null);

  const week = weekDays(day);

  const requestBrief = async () => {
    setBriefing(true);
    try {
      const result = await writeBrief({
        data: {
          nowIso: now.toISOString(),
          date: selectedDate,
          events: dayEvents.map((event) => ({
            title: event.title,
            start: event.start,
            end: event.end,
            allDay: event.allDay,
            kind: event.kind,
          })),
        },
      });
      if (!result.ok) {
        toast(result.error);
        return;
      }
      saveBrief({
        date: selectedDate,
        headline: result.headline,
        body: result.body,
        energy: result.energy,
        fingerprint,
        createdAt: new Date().toISOString(),
      });
    } catch {
      toast("日简没有写完，请稍后再试。");
    } finally {
      setBriefing(false);
    }
  };

  const requestSculpt = async () => {
    setSculpting(true);
    try {
      const result = await sculptSchedule({
        data: {
          nowIso: now.toISOString(),
          date: selectedDate,
          events: dayEvents.map((event) => ({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            allDay: event.allDay,
            kind: event.kind,
          })),
        },
      });
      if (!result.ok) {
        toast(result.error);
        return;
      }
      setSculpt({ summary: result.summary, moves: result.moves });
    } catch {
      toast("疏时未能完成。");
    } finally {
      setSculpting(false);
    }
  };

  const applySculpt = () => {
    if (!sculpt) return;
    for (const move of sculpt.moves) {
      updateEvent(move.id, { start: move.newStart, end: move.newEnd, reminderFired: false });
    }
    toast("已按此调整");
    setSculpt(null);
  };

  return (
    <div className="px-5 pb-8">
      <div className="rise-in flex gap-1 pt-1">
        {week.map((item) => {
          const key = dateKey(item);
          const active = key === selectedDate;
          const isToday = isSameDay(item, now);
          const has = eventsOnDay(events, item).length > 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDate(key)}
              className={cn(
                "flex h-14 min-h-11 flex-1 flex-col items-center justify-center rounded-md transition-[background-color,color] duration-150 ease-out",
                active ? "bg-ink text-sheet" : "text-muted hover:text-ink",
              )}
            >
              <span className="text-[10px] tracking-widest">
                {["一", "二", "三", "四", "五", "六", "日"][item.getDay() === 0 ? 6 : item.getDay() - 1]}
              </span>
              <span className="font-serif text-lg leading-none tabular-nums">{item.getDate()}</span>
              <span
                className={cn(
                  "mt-1 size-1 rounded-full",
                  has ? (active ? "bg-sheet" : "bg-accent") : "bg-transparent",
                  isToday && !has ? (active ? "bg-sheet/70" : "bg-faint") : "",
                )}
              />
            </button>
          );
        })}
      </div>

      <section className="rise-in rise-in-1 mt-7">
        <p className="text-sm tracking-[0.2em] text-muted">{formatWeekday(day)}</p>
        <h1 className="mt-1 font-serif text-[40px] leading-none tracking-tight">{formatDayTitle(day)}</h1>
        {viewingToday ? (
          <p className="mt-5 font-serif text-[56px] leading-none tabular-nums tracking-tight">
            {formatClock(now)}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setSelectedDate(dateKey(now))}
            className="mt-4 text-sm text-accent"
          >
            回到今天
          </button>
        )}
      </section>

      <section className="rise-in rise-in-2 mt-6 min-h-16">
        {upcoming ? (
          <button
            type="button"
            onClick={() => selectEvent(upcoming.event.id)}
            className="w-full rounded-lg bg-paper px-4 py-3.5 text-left shadow-card"
          >
            <p className="text-[11px] tracking-[0.22em] text-muted">
              {upcoming.status === "now"
                ? "正在进行"
                : upcomingIsToday
                  ? "接下来"
                  : "下一件事"}
            </p>
            <p className="mt-1.5 font-serif text-xl leading-snug">{upcoming.event.title}</p>
            <p className="mt-1 text-sm text-muted">
              <span className="tabular-nums">
                {upcomingIsToday ? "" : `${formatDayTitle(parseISO(upcoming.event.start))} `}
                {formatClock(parseISO(upcoming.event.start))} – {formatClock(parseISO(upcoming.event.end))}
              </span>
              <span className="mx-1.5 text-faint">·</span>
              {upcoming.status === "now"
                ? remainingLabel(now, parseISO(upcoming.event.end))
                : relativeLabel(now, parseISO(upcoming.event.start))}
            </p>
          </button>
        ) : dayEvents.length === 0 ? (
          <div className="rounded-lg bg-paper px-4 py-5">
            <p className="font-serif text-lg">今天还是一张白纸</p>
            <p className="mt-1 text-sm text-muted">写下第一件事，纸面就有了秩序。</p>
            <Button className="mt-4" size="sm" onClick={openComposer}>
              写下
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted">{viewingToday ? "今晚无事，纸面留白。" : "这一天已经排完。"}</p>
        )}
      </section>

      <section className="rise-in rise-in-3 mt-5 flex items-center gap-2">
        <Button variant="soft" size="pill" disabled={briefing} onClick={requestBrief}>
          {briefing ? "正在写日简" : brief ? "更新日简" : "写日简"}
        </Button>
        <Button variant="ghost" size="pill" disabled={sculpting || dayEvents.length === 0} onClick={requestSculpt}>
          {sculpting ? "正在疏时" : "疏时"}
        </Button>
        {briefStale ? <span className="text-xs text-muted">日程已改</span> : null}
      </section>

      {brief ? (
        <article className="mt-4 rounded-lg px-1 py-2">
          <p className="font-serif text-lg leading-snug">{brief.headline}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{brief.body}</p>
        </article>
      ) : null}

      {sculpt ? (
        <article className="mt-4 rounded-lg bg-paper px-4 py-4 shadow-card">
          <p className="text-sm leading-relaxed">{sculpt.summary}</p>
          {sculpt.moves.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {sculpt.moves.map((move) => (
                <li key={move.id} className="text-sm">
                  <span className="font-medium">{move.title}</span>
                  <span className="mx-1.5 text-faint">·</span>
                  <span className="tabular-nums text-muted">
                    {formatClock(parseISO(move.newStart))} – {formatClock(parseISO(move.newEnd))}
                  </span>
                  <p className="text-xs text-muted">{move.reason}</p>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-3 flex gap-2">
            {sculpt.moves.length > 0 ? (
              <Button size="sm" onClick={applySculpt}>
                按此调整
              </Button>
            ) : null}
            <Button size="sm" variant="ghost" onClick={() => setSculpt(null)}>
              收起
            </Button>
          </div>
        </article>
      ) : null}

      {allDay.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {allDay.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => selectEvent(event.id)}
              className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-2 text-sm shadow-card"
            >
              <KindDot kind={event.kind} />
              {event.title}
            </button>
          ))}
        </div>
      ) : null}

      <section className="mt-6">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-[11px] tracking-[0.22em] text-muted">一日之序</p>
          <p className="text-xs tabular-nums text-muted">{dayEvents.length} 件事</p>
        </div>
        <Ribbon
          events={dayEvents}
          startHour={startHour}
          endHour={endHour}
          now={now}
          showNow={viewingToday}
          onSelect={selectEvent}
        />
      </section>
    </div>
  );
}
