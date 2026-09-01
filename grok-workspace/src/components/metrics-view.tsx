import { useMemo, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  eachDayOfInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from "date-fns";
import { Button } from "@/components/ui/button";
import {
  MOODS,
  TAGS,
  completeness,
  enumerateDays,
  fileId,
  filledItems,
  formatDisplayDate,
  glyphCount,
  localIsoDate,
  padCount,
  unfiledGaps,
  type DayRecord,
} from "@/lib/folio/schema";
import { exportPayload, parseImportedLedger, useLedger } from "@/lib/folio/store";
import { cn } from "@/lib/utils";

function streak(records: Record<string, DayRecord>, today: string): number {
  let n = 0;
  let cursor = today;
  // If today is not filed, streak is consecutive filed days ending yesterday.
  if (records[today]?.status !== "filed") {
    cursor = localIsoDate(subDays(parseISO(today), 1));
  }
  while (records[cursor]?.status === "filed") {
    n += 1;
    cursor = localIsoDate(subDays(parseISO(cursor), 1));
    if (n > 400) break;
  }
  return n;
}

export function MetricsView() {
  const today = localIsoDate();
  const records = useLedger((s) => s.records);
  const replaceAll = useLedger((s) => s.replaceAll);
  const fileRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const todayDate = parseISO(today);
    const monthFrom = localIsoDate(startOfMonth(todayDate));
    const yearFrom = localIsoDate(startOfYear(todayDate));
    const monthDays = enumerateDays(monthFrom, today);
    const yearDays = enumerateDays(yearFrom, today);
    const filed = Object.values(records).filter((r) => r.status === "filed");
    const monthFiled = monthDays.filter((id) => records[id]?.status === "filed").length;
    const yearFiled = yearDays.filter((id) => records[id]?.status === "filed").length;
    const gaps = unfiledGaps(records, monthFrom, today);
    const words = filed.reduce((n, r) => n + glyphCount(r.body), 0);
    const avgWords = filed.length ? Math.round(words / filed.length) : 0;
    const avgComplete =
      filed.length === 0
        ? 0
        : Math.round(
            (filed.reduce((n, r) => n + completeness(r).done, 0) / (filed.length * 5)) * 1000,
          ) / 10;
    const avgItems =
      filed.length === 0
        ? 0
        : Math.round((filed.reduce((n, r) => n + filledItems(r.items).length, 0) / filed.length) * 10) /
          10;

    const moodDist = [1, 2, 3, 4, 5].map(
      (v) => filed.filter((r) => r.mood === v).length,
    );
    const tagDist = TAGS.map((tag) => ({
      tag,
      n: filed.filter((r) => r.tags.includes(tag)).length,
    })).sort((a, b) => b.n - a.n);

    const heatStart = startOfWeek(subDays(todayDate, 16 * 7 - 1), { weekStartsOn: 1 });
    const heatDays = eachDayOfInterval({ start: heatStart, end: todayDate });

    return {
      monthFiled,
      monthTotal: monthDays.length,
      yearFiled,
      yearTotal: yearDays.length,
      gaps,
      words,
      avgWords,
      avgComplete,
      avgItems,
      moodDist,
      tagDist,
      heatDays: heatDays.map((d) => localIsoDate(d)),
      consecutive: streak(records, today),
      filedTotal: filed.length,
      first: filed[0]?.id,
    };
  }, [records, today]);

  const onExport = () => {
    const payload = exportPayload(records);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FOLIO-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (file: File) => {
    try {
      const text = await file.text();
      const json: unknown = JSON.parse(text);
      const next = parseImportedLedger(json);
      if (!next) return;
      replaceAll(next);
    } catch {
      /* ignore malformed */
    }
  };

  const rate = stats.monthTotal === 0 ? 0 : (stats.monthFiled / stats.monthTotal) * 100;

  return (
    <div className="px-5 pb-8 pt-4">
      <p className="font-mono text-[10px] tracking-[0.18em] text-faint">METRICS</p>
      <h1 className="mt-1 text-2xl font-medium tracking-tight">统计</h1>
      <p className="mt-1 font-mono text-xs tabular-nums text-muted">{formatDisplayDate(today)}</p>

      <div className="mt-5 grid grid-cols-2 gap-px border border-rule bg-rule">
        <Stat label="连续归档" value={padCount(stats.consecutive, 2)} unit="日" />
        <Stat label="本月归档率" value={rate.toFixed(1)} unit="%" />
        <Stat
          label="本月已归档"
          value={`${padCount(stats.monthFiled, 2)}/${padCount(stats.monthTotal, 2)}`}
        />
        <Stat
          label="本年已归档"
          value={`${padCount(stats.yearFiled, 3)}/${padCount(stats.yearTotal, 3)}`}
        />
        <Stat label="累计字数" value={padCount(stats.words, 5)} unit="字" />
        <Stat label="日均字数" value={padCount(stats.avgWords)} unit="字" />
        <Stat label="平均完成度" value={stats.avgComplete.toFixed(1)} unit="%" />
        <Stat label="日均事项" value={stats.avgItems.toFixed(1)} />
      </div>

      <section className="mt-8">
        <Header no="01" title="十六周热力" en="HEAT" />
        <HeatStrip days={stats.heatDays} records={records} today={today} />
      </section>

      <section className="mt-8">
        <Header no="02" title="本月缺口" en="GAP" meta={padCount(stats.gaps.length, 2)} />
        {stats.gaps.length === 0 ? (
          <p className="mt-3 text-sm text-muted">本月截至今日，无未归档日。</p>
        ) : (
          <ul className="mt-3 border-t border-rule">
            {stats.gaps.map((id) => (
              <li key={id} className="flex items-center justify-between border-b border-rule py-2.5">
                <Link to="/d/$date" params={{ date: id }} className="font-mono text-sm tabular-nums">
                  {formatDisplayDate(id)}
                </Link>
                <span className="font-mono text-[10px] tracking-[0.14em] text-stamp">UNFILED</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <Header no="03" title="状态分布" en="MOOD" />
        <div className="mt-3 flex flex-col gap-2">
          {MOODS.map((m, i) => {
            const n = stats.moodDist[i] ?? 0;
            const max = Math.max(1, ...stats.moodDist);
            return (
              <BarRow key={m.value} label={`${m.value} ${m.label}`} n={n} max={max} />
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <Header no="04" title="标记频次" en="MARKS" />
        <div className="mt-3 flex flex-col gap-2">
          {stats.tagDist.map((t) => (
            <BarRow
              key={t.tag}
              label={t.tag}
              n={t.n}
              max={Math.max(1, stats.tagDist[0]?.n ?? 1)}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <Header no="05" title="卷宗出入" en="IO" />
        <p className="mt-2 text-sm leading-relaxed text-muted">
          记录仅存本机。导出为 JSON 卷宗副本；导入将替换当前全部记录。
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" type="button" onClick={onExport}>
            导出
          </Button>
          <Button variant="outline" type="button" onClick={() => fileRef.current?.click()}>
            导入
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onImport(f);
            e.currentTarget.value = "";
          }}
        />
        <p className="mt-4 font-mono text-[10px] leading-relaxed tracking-wide text-faint">
          LEDGER {fileId(today)}
          <br />
          FILED {padCount(stats.filedTotal, 3)}
          <br />
          STORE LOCAL
        </p>
      </section>
    </div>
  );
}

function Header({ no, title, en, meta }: { no: string; title: string; en: string; meta?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-rule pb-2">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-xs text-faint">{no}</span>
        <h2 className="text-sm font-medium">{title}</h2>
        <span className="font-mono text-[10px] tracking-[0.16em] text-faint">{en}</span>
      </div>
      {meta ? <span className="font-mono text-xs tabular-nums text-muted">{meta}</span> : null}
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="bg-paper px-3 py-3">
      <p className="font-mono text-[9px] tracking-[0.16em] text-faint">{label}</p>
      <p className="mt-1 font-mono text-lg tabular-nums tracking-tight">
        {value}
        {unit ? <span className="ml-1 text-[11px] text-muted"> {unit}</span> : null}
      </p>
    </div>
  );
}

function BarRow({ label, n, max }: { label: string; n: number; max: number }) {
  const w = max === 0 ? 0 : (n / max) * 100;
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
      <span className="truncate text-xs text-muted">{label}</span>
      <div className="h-2 bg-paper-2">
        <div className="h-2 bg-ink" style={{ width: `${w}%` }} />
      </div>
      <span className="text-right font-mono text-[11px] tabular-nums">{padCount(n, 2)}</span>
    </div>
  );
}

function HeatStrip({
  days,
  records,
  today,
}: {
  days: string[];
  records: Record<string, DayRecord>;
  today: string;
}) {
  const cols = Math.ceil(days.length / 7);
  return (
    <div className="mt-3 overflow-x-auto">
      <div
        className="grid w-full gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: "repeat(7, 10px)",
          gridAutoFlow: "column",
        }}
      >
        {days.map((id) => {
          const rec = records[id];
          const filed = rec?.status === "filed";
          const draft = rec?.status === "draft" && completeness(rec).done > 0;
          const cls = cn(
            "size-full min-h-2.5",
            filed ? "bg-ink" : draft ? "bg-stamp-soft" : "bg-paper-2",
          );
          if (id > today) {
            return <span key={id} className={cls} title={formatDisplayDate(id)} />;
          }
          return (
            <Link
              key={id}
              to="/d/$date"
              params={{ date: id }}
              title={`${formatDisplayDate(id)}${filed ? " 已归档" : draft ? " 草稿" : ""}`}
              className={cls}
            />
          );
        })}
      </div>
    </div>
  );
}
